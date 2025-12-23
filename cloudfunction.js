/**
 * index.js
 *
 * A Cloud Run service that:
 *  1) Fetches data from Algolia (entire index, facets, recommendations).
 *  2) Caches the results in Redis for faster subsequent reads.
 *  3) Returns data to clients via simple Express routes.
 *
 * Now updated to:
 *  - Store each product doc under "all-products:<objectID>"
 *  - Use Redis Sorted Sets for cat-products:<catID> and tag-products:<tagID>,
 *    with a "global rank" that preserves the browse order from Algolia.
 *  - Additionally, maintain a global sorted set "global-products" that includes every product
 *    by its Algolia global rank.
 *  - We handle potential WRONGTYPE errors if an older key was a regular Set
 *    by checking and deleting the key if it's not a Sorted Set.
 *  - Maintain pagination (offset/limit).
 *  - Adds a new "frequentlyBought" endpoint to return the "frequentlyBoughtIDs".
 */

const express = require('express');
const { createClient } = require('redis');

const APP_ID = 'MQOX7OE8J1';
const API_KEY = 'fa058e9eba7d023e52ef44ce65b59d60';
const INDEX_NAME = 'salla';

// TTL removed - all caches now invalidated only by manual flush (scheduled every 2 days)
// const TTL = 3 * 24 * 60 * 60 * 1000;  // 3 days in milliseconds

const RECS_BASE_URL = `https://${APP_ID}-dsn.algolia.net/1/indexes/*/recommendations`;
const BROWSE_BASE_URL = `https://${APP_ID}.algolia.net/1/indexes/${INDEX_NAME}/browse`;
// Using numeric facets for categories and tags
const FACETS_BASE_URL = `https://${APP_ID}.algolia.net/1/indexes/${INDEX_NAME}/query?x-algolia-application-id=${APP_ID}&x-algolia-api-key=${API_KEY}`;

// Initialize Express
const app = express();

/**
 * Global CORS middleware
 */
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Algolia-Application-Id, X-Algolia-API-Key, Cache-Control');
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  next();
});

const REDIS_HOST = process.env.REDIS_HOST || '10.64.208.196'; // Example private IP
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const fetch = require('node-fetch');
const redisClient = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`
});

redisClient.on('error', (err) => {
});

(async () => {
  try {
    await redisClient.connect();
    console.log('[SUCCESS] Redis connected');
  } catch (err) {
    console.error('[ERROR] Redis connection failed:', err.message);
  }
})();

async function setCache(key, data) {
  const jsonString = JSON.stringify(data);
  await redisClient.set(key, jsonString);
}

async function getCache(key) {
  const raw = await redisClient.get(key);
  return raw ? JSON.parse(raw) : null;
}

app.get('/', async (req, res) => {
  const type = req.query.type || 'categories';

  if (type === 'browseAll') {
    return handleBrowseAll(req, res);
  } else if (type === 'categories') {
    return handleCategoriesAndTags(req, res);
  } else if (type === 'recommendations') {
    return handleProductRecommendations(req, res);
  } else if (type === 'frequentlyBought') {
    return handleFrequentlyBought(req, res);
  } else if (type === 'categoryById') {
    return handleCategoryById(req, res);
  } else if (type === 'tagById') {
    return handleTagById(req, res);
  } else {
    return res
      .status(400)
      .send('Use ?type=browseAll, ?type=categories, ?type=recommendations, ?type=frequentlyBought, ?type=categoryById, or ?type=tagById');
  }
});

// New internal refresh endpoint
app.get('/internal/refresh', async (req, res) => {
  try {
    const refreshStats = await refreshOutOfStockProducts();
    console.log(`[SUCCESS] Refresh complete: ${refreshStats.processed} processed, ${refreshStats.removed} removed`);
    return res.json(refreshStats);
  } catch (error) {
    console.error('[ERROR] Refresh failed:', error.message);
    return res.status(500).send(`Refresh error: ${error.message}`);
  }
});

// New endpoint for refreshing product cache data from Algolia
app.get('/internal/refresh-cache', async (req, res) => {
  try {
    const batchSize = parseInt(req.query.batchSize || '100', 10);
    const stats = await refreshProductCacheFromAlgolia(batchSize);
    console.log(`[SUCCESS] Cache refresh complete: ${stats.updated} updated, ${stats.removed} removed`);
    return res.json(stats);
  } catch (error) {
    console.error('[ERROR] Cache refresh failed:', error.message);
    return res.status(500).send(`Refresh cache error: ${error.message}`);
  }
});

// Add a dedicated endpoint for flushing Redis
app.get('/internal/flush-redis', async (req, res) => {
  try {
    const flushResult = await redisClient.flushAll();
    const infoAfterFlush = await redisClient.info('keyspace');
    
    console.log('[SUCCESS] Redis cache flushed');
    return res.json({
      success: true,
      message: 'Redis cache flushed successfully',
      flushResult,
      redisInfo: infoAfterFlush
    });
  } catch (error) {
    console.error('[ERROR] Redis flush failed:', error.message);
    return res.status(500).send(`Redis flush error: ${error.message}`);
  }
});

async function handleBrowseAll(req, res) {
  // Check if browse is already in progress
  const lockKey = 'browse-lock';
  const lockExists = await redisClient.exists(lockKey);
  if (lockExists) {
    return res.send('Browse already in progress');
  }

  // Set lock with 5 minute TTL (browseAll completes in seconds, this is just a safety buffer)
  await redisClient.setEx(lockKey, 5 * 60, 'locked');

  let cursor = null;
  let totalCount = 0;
  let globalRank = 0;
  let skippedOutOfStock = 0;

  // Build into temporary key to avoid blackout window
  const workKey = 'global-products:building';
  await redisClient.del(workKey);

  try {
    do {
      const params = cursor ?
        { cursor } :
        { params: 'hitsPerPage=1000&filters=NOT instock:false' };
      
      const body = JSON.stringify(params);
      
      const response = await fetch(BROWSE_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Algolia-Application-Id': APP_ID,
          'X-Algolia-API-Key': API_KEY
        },
        body
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).send(errorText);
      }

      const data = await response.json();
      const hits = data.hits || [];

      for (const product of hits) {
        if (product.instock === false) {
          skippedOutOfStock++;
          continue;
        }

        totalCount++;
        await storeProductWithRelated(product, globalRank, workKey);
        globalRank++;
      }

      cursor = data.cursor || null;
    } while (cursor);

    // Atomically swap the working set into place (only if we built something)
    if (await redisClient.exists(workKey)) {
      await redisClient.rename(workKey, 'global-products');
      
      // Clear ALL category and tag response caches after successful rebuild
      // This ensures stale empty responses from the flush→browseAll window are removed
      // (Previously only cleared trending-now, causing other categories to show no products)
      const catResponseKeys = await redisClient.keys('cache:cat-response:*');
      const tagResponseKeys = await redisClient.keys('cache:tag-response:*');
      const allResponseKeys = [...catResponseKeys, ...tagResponseKeys];
      if (allResponseKeys.length > 0) {
        await redisClient.del(allResponseKeys);
        console.log(`[SUCCESS] Cleared ${allResponseKeys.length} response cache keys`);
      }

      // Pre-populate cache:all-categories to prevent race condition
      // This adds only 1 Algolia request but prevents thousands during the post-flush window
      try {
        const facetsBody = JSON.stringify({
          params: 'facets=categoriesids,tagsids&maxValuesPerFacet=1000&attributesToRetrieve=&filters=NOT instock:false'
        });
        const facetsResponse = await fetch(FACETS_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: facetsBody
        });
        if (facetsResponse.ok) {
          const facetsData = await facetsResponse.json();
          const categoryFacets = facetsData.facets?.categoriesids || {};
          const tagFacets = facetsData.facets?.tagsids || {};

          // Store metadata only - NO fetchFacetObjects loop needed
          // Frontend gets objectIDs from categoryById which uses Redis sorted sets
          const categoriesArray = Object.entries(categoryFacets).map(([id, count]) => ({
            ids: [Number(id)],
            name: id,
            count: count,
            objectIDs: []
          }));
          const tagsArray = Object.entries(tagFacets).map(([id, count]) => ({
            ids: [Number(id)],
            name: id,
            count: count,
            objectIDs: []
          }));

          await setCache('cache:all-categories', {
            categories: categoriesArray,
            tags: tagsArray,
            timestamp: Date.now()
          });
          console.log(`[SUCCESS] Pre-populated categories cache: ${categoriesArray.length} categories, ${tagsArray.length} tags`);
        }
      } catch (cacheErr) {
        console.error('[WARN] Failed to pre-populate categories cache:', cacheErr.message);
      }
    }

    // Delete the lock
    await redisClient.del(lockKey);
    console.log(`[SUCCESS] Browse complete: ${totalCount} products stored, ${skippedOutOfStock} skipped`);
    return res.send(`Browse complete. Stored ${totalCount} products in Redis. Skipped ${skippedOutOfStock} out-of-stock products.`);
  } catch (error) {
    // Delete the lock on error
    await redisClient.del(lockKey);
    console.error('[ERROR] Browse failed:', error.message);
    return res.status(500).send('Failed to browse all products.');
  }
}

async function storeProductWithRelated(product, rank, globalKey = 'global-products') {
  const objectID = product.objectID;
  if (!objectID) {
    return;
  }

  if (product.instock === false) {
    return;
  }

  const relatedProductIDs = [];
  const frequentlyBoughtIDs = [];
  const docKey = `all-products:${objectID}`;
  const docData = {
    ...product,
    relatedProductIDs,
    frequentlyBoughtIDs,
    updatedAt: Date.now()
  };

  try {
    await setCache(docKey, docData);
  } catch (err) {
    return;
  }

  if (Array.isArray(product.categoriesids)) {
    for (const catID of product.categoriesids) {
      const catKey = `cat-products:${catID}`;
      await ensureSortedSet(catKey);
      await redisClient.zAdd(catKey, [{ score: rank, value: objectID }]);
    }
  }

  if (Array.isArray(product.tagsids)) {
    for (const tagID of product.tagsids) {
      const tagKey = `tag-products:${tagID}`;
      await ensureSortedSet(tagKey);
      await redisClient.zAdd(tagKey, [{ score: rank, value: objectID }]);
    }
  }

  await ensureSortedSet(globalKey);
  await redisClient.zAdd(globalKey, [{ score: rank, value: objectID }]);
}

async function ensureSortedSet(key) {
  const dataType = await redisClient.type(key);
  if (dataType !== 'none' && dataType !== 'zset') {
    await redisClient.del(key);
  }
}

async function fetchRelatedProducts(objectID) {
  const maxRecs = 30;
  let relatedProductIDs = [];
  let frequentlyBoughtIDs = [];

  try {
    const requestBody = JSON.stringify({
      requests: [
        {
          indexName: INDEX_NAME,
          objectID,
          model: 'related-products',
          threshold: 0,
          maxRecommendations: maxRecs
        },
        {
          indexName: INDEX_NAME,
          objectID,
          model: 'bought-together',
          threshold: 0,
          maxRecommendations: maxRecs
        }
      ]
    });
    const resp = await fetch(RECS_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': APP_ID,
        'X-Algolia-API-Key': API_KEY
      },
      body: requestBody
    });

    if (!resp.ok) {
      return { relatedProductIDs, frequentlyBoughtIDs };
    }

    const data = await resp.json();

    if (data.results && data.results.length > 0) {
      if (data.results[0]?.hits) {
        for (const hit of data.results[0].hits) {
          if (hit.objectID && hit.instock !== false) {
            relatedProductIDs.push(hit.objectID);
          }
        }
      }

      if (data.results[1]?.hits) {
        for (const hit of data.results[1].hits) {
          if (hit.objectID && hit.instock !== false) {
            frequentlyBoughtIDs.push(hit.objectID);
          }
        }
      }
    }
  } catch (err) {
  }

  return {
    relatedProductIDs,
    frequentlyBoughtIDs
  };
}

async function handleCategoriesAndTags(req, res) {
  const CACHE_KEY = 'cache:all-categories';
  const LOCK_KEY = 'categories-lock';

  // Check cache first
  try {
    const cached = await getCache(CACHE_KEY);
    if (cached) {
      // No TTL check - cache only invalidated by manual flush (scheduled every 2 days)
      res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
      return res.json({ categories: cached.categories, tags: cached.tags });
    }
  } catch (readErr) {
  }

  // Try to acquire lock atomically (SET NX = set if not exists)
  // This prevents race condition where two requests both see no lock
  const lockAcquired = await redisClient.set(LOCK_KEY, 'locked', { NX: true, EX: 60 });

  if (!lockAcquired) {
    // Another request has the lock - wait and retry cache
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const cached = await getCache(CACHE_KEY);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
        return res.json({ categories: cached.categories, tags: cached.tags });
      }
    } catch (retryErr) {
    }
    // If still no cache, return 503 to let client retry
    return res.status(503).send('Cache rebuilding, please retry');
  }

  // Lock acquired - we are the one fetching

  const facetsBody = JSON.stringify({
    params: 'facets=categoriesids,tagsids&maxValuesPerFacet=1000&attributesToRetrieve=&filters=NOT instock:false'
  });

  try {
    const facetsResponse = await fetch(FACETS_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: facetsBody
    });
    if (!facetsResponse.ok) {
      const errorText = await facetsResponse.text();
      await redisClient.del(LOCK_KEY);  // Release lock on error
      return res.status(facetsResponse.status).send(`Algolia error (facets): ${errorText}`);
    }
    const facetsData = await facetsResponse.json();
    const categoryFacets = facetsData.facets?.categoriesids || {};
    const tagFacets = facetsData.facets?.tagsids || {};

    // Return metadata only - NO fetchFacetObjects loop needed!
    // Frontend gets objectIDs from categoryById which reads from Redis sorted sets
    // This reduces Algolia requests from ~71 to just 1 (the facets query above)
    const categoriesArray = Object.entries(categoryFacets).map(([id, count]) => ({
      ids: [Number(id)],
      name: id,
      count: count,
      objectIDs: []  // Empty - frontend uses categoryById for objectIDs
    }));
    const tagsArray = Object.entries(tagFacets).map(([id, count]) => ({
      ids: [Number(id)],
      name: id,
      count: count,
      objectIDs: []  // Empty - frontend uses tagById for objectIDs
    }));

    const finalData = {
      categories: categoriesArray,
      tags: tagsArray,
      timestamp: Date.now()
    };

    try {
      await setCache(CACHE_KEY, finalData);
    } catch (writeErr) {
    }

    // Release the lock
    await redisClient.del(LOCK_KEY);

    console.log(`[SUCCESS] Categories/tags fetched: ${categoriesArray.length} categories, ${tagsArray.length} tags`);
    res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
    res.json({ categories: categoriesArray, tags: tagsArray });
  } catch (error) {
    // Release the lock on error
    await redisClient.del(LOCK_KEY);
    console.error('[ERROR] Categories/tags fetch failed:', error.message);
    res.status(500).send(`Server error (categories + tags + objectIDs): ${error.message}`);
  }
}

async function handleProductRecommendations(req, res) {
    const objectID = req.query.objectID;
    if (!objectID) {
        return res.status(400).send('Missing objectID param');
    }
    const CACHE_KEY = `cache:${objectID}`;
    try {
        const cached = await getCache(CACHE_KEY);
        if (cached) {
            // No TTL check - cache only invalidated by manual flush (scheduled every 2 days)
            res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
            return res.json({ objectID, relatedProductIDs: cached.relatedProductIDs || [] });
        }
    } catch (readErr) {
    }
    const maxRecs = 30;
    let relatedProductIDs = [];
    try {
        const requestBody = JSON.stringify({
            requests: [
                {
                    indexName: INDEX_NAME,
                    objectID,
                    model: 'related-products',
                    threshold: 0,
                    maxRecommendations: maxRecs
                }
            ]
        });
        const resp = await fetch(RECS_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Algolia-Application-Id': APP_ID,
                'X-Algolia-API-Key': API_KEY
            },
            body: requestBody
        });
        if (resp.ok) {
            const data = await resp.json();
            if (data.results?.[0]?.hits) {
                relatedProductIDs = data.results[0].hits.map(hit => hit.objectID).slice(0, maxRecs);
            }
        } else {
            const errorText = await resp.text();
        }
    } catch (recsErr) {
    }
    const docData = { relatedProductIDs, timestamp: Date.now() };
    try {
        await setCache(CACHE_KEY, docData);
    } catch (writeErr) {
    }
    res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
    res.json({ objectID, relatedProductIDs });
}

async function handleFrequentlyBought(req, res) {
    const objectID = req.query.objectID;
    if (!objectID) {
        return res.status(400).send('Missing objectID param');
    }
    const CACHE_KEY_FBT = `cacheFBT:${objectID}`;
    try {
        const cachedFBT = await getCache(CACHE_KEY_FBT);
        if (cachedFBT) {
            // No TTL check - cache only invalidated by manual flush (scheduled every 2 days)
            res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
            return res.json({ objectID, frequentlyBoughtIDs: cachedFBT.frequentlyBoughtIDs || [] });
        }
    } catch (readErr) {
    }
    const maxRecs = 30;
    let frequentlyBoughtIDs = [];
    try {
        const requestBody = JSON.stringify({
            requests: [
                {
                    indexName: INDEX_NAME,
                    objectID,
                    model: 'bought-together',
                    threshold: 0,
                    maxRecommendations: maxRecs
                }
            ]
        });
        const resp = await fetch(RECS_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Algolia-Application-Id': APP_ID,
                'X-Algolia-API-Key': API_KEY
            },
            body: requestBody
        });
        if (resp.ok) {
            const data = await resp.json();
            if (data.results?.[0]?.hits) {
                frequentlyBoughtIDs = data.results[0].hits.map(hit => hit.objectID).slice(0, maxRecs);
            }
        } else {
            const errorText = await resp.text();
        }
    } catch (fbtErr) {
    }
    const docData = { frequentlyBoughtIDs, timestamp: Date.now() };
    try {
        await setCache(CACHE_KEY_FBT, docData);
    } catch (writeErr) {
    }
    res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
    res.json({ objectID, frequentlyBoughtIDs });
}

async function handleCategoryById(req, res) {
    const catID = req.query.catID;
    if (!catID) {
        return res.status(400).send('Missing catID param');
    }
    const offset = parseInt(req.query.offset || '0', 10);
    const limit = parseInt(req.query.limit || '12', 10);
    
    // Check response cache
    const CACHE_KEY = 'cache:cat-response:' + catID + ':' + offset + ':' + limit;
    try {
        const cached = await getCache(CACHE_KEY);
        if (cached) {
            // No TTL check - cache only invalidated by manual flush (scheduled every 2 days)
            res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
            return res.json(cached.response);
        }
    } catch (readErr) {
    }
    
    try {
        // If trending-now is requested, query the global sorted set
        if (catID === 'trending-now') {
            const globalKey = 'global-products';
            const total = await redisClient.zCard(globalKey);
            
            // Get a larger batch to ensure we have enough after filtering
            const extraLimit = limit * 2; // Get twice as many to account for potential filtering
            const sliced = await redisClient.zRange(globalKey, offset, offset + extraLimit - 1);
            
            // Now filter sliced to only include in-stock products
            const filteredSliced = await filterOutOfStockProducts(sliced);
            
            // Trim back down to requested limit
            const finalSliced = filteredSliced.slice(0, limit);
            
            const categoryResponse = {
                name: 'رائج الان',
                ids: ['trending-now'],
                count: total, // This is an approximate count now
                objectIDs: finalSliced,
                offset,
                limit,
                hasMore: (offset + limit) < total || filteredSliced.length > limit,
                totalObjectIDs: total // This is an approximate count now
            };
            
            // Cache the response
            try {
                await setCache(CACHE_KEY, { response: categoryResponse, timestamp: Date.now() });
            } catch (writeErr) {
            }
            res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
            return res.json(categoryResponse);
        }

        // Otherwise, handle a normal category
        const data = await fetchAllCategoriesAndTags();
        if (!data || !data.categories?.length) {
            return res.status(404).send('No categories data available');
        }
        const category = data.categories.find(c =>
            Array.isArray(c.ids) && c.ids.includes(Number(catID))
        );
        if (!category) {
            return res.status(404).send('Category not found');
        }
        const catKey = `cat-products:${catID}`;
        const total = await redisClient.zCard(catKey);
        
        // Get a larger batch to ensure we have enough after filtering
        const extraLimit = limit * 2; // Get twice as many to account for potential filtering
        const sliced = await redisClient.zRange(catKey, offset, offset + extraLimit - 1);
        
        // Filter to only include in-stock products
        const filteredSliced = await filterOutOfStockProducts(sliced);
        
        // Trim back down to requested limit
        const finalSliced = filteredSliced.slice(0, limit);
        
        const hasMore = (offset + limit) < total || filteredSliced.length > limit;
        const categoryResponse = {
            name: category.name,
            ids: category.ids,
            count: category.count, // This is an approximate count now
            objectIDs: finalSliced,
            offset,
            limit,
            hasMore,
            totalObjectIDs: total // This is an approximate count now
        };
        
        // Cache the response
        try {
            await setCache(CACHE_KEY, { response: categoryResponse, timestamp: Date.now() });
        } catch (writeErr) {
        }
        res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
        return res.json(categoryResponse);
    } catch (error) {
        return res.status(500).send(`Server error (single category): ${error.message}`);
    }
}

async function handleTagById(req, res) {
    const tagID = req.query.tagID;
    if (!tagID) {
        return res.status(400).send('Missing tagID param');
    }
    const offset = parseInt(req.query.offset || '0', 10);
    const limit = parseInt(req.query.limit || '12', 10);
    
    // Check response cache
    const CACHE_KEY = 'cache:tag-response:' + tagID + ':' + offset + ':' + limit;
    try {
        const cached = await getCache(CACHE_KEY);
        if (cached) {
            // No TTL check - cache only invalidated by manual flush (scheduled every 2 days)
            res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
            return res.json(cached.response);
        }
    } catch (readErr) {
    }

    try {
        const data = await fetchAllCategoriesAndTags();
        if (!data || !data.tags?.length) {
            return res.status(404).send('No tags data available');
        }
        const tagObj = data.tags.find(t =>
            Array.isArray(t.ids) && t.ids.includes(Number(tagID))
        );
        if (!tagObj) {
            return res.status(404).send('Tag not found');
        }
        const tagKey = `tag-products:${tagID}`;
        const total = await redisClient.zCard(tagKey);
        
        // Get a larger batch to ensure we have enough after filtering
        const extraLimit = limit * 2; // Get twice as many to account for potential filtering
        const sliced = await redisClient.zRange(tagKey, offset, offset + extraLimit - 1);
        
        // Filter to only include in-stock products
        const filteredSliced = await filterOutOfStockProducts(sliced);
        
        // Trim back down to requested limit
        const finalSliced = filteredSliced.slice(0, limit);
        
        const hasMore = (offset + limit) < total || filteredSliced.length > limit;
        const tagResponse = {
            name: tagObj.name,
            ids: tagObj.ids,
            count: tagObj.count, // This is an approximate count now
            objectIDs: finalSliced,
            offset,
            limit,
            hasMore,
            totalObjectIDs: total // This is an approximate count now
        };
        
        // Cache the response
        try {
            await setCache(CACHE_KEY, { response: tagResponse, timestamp: Date.now() });
        } catch (writeErr) {
        }
        res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
        return res.json(tagResponse);
    } catch (error) {
        return res.status(500).send(`Server error (single tag): ${error.message}`);
    }
}

async function fetchAllCategoriesAndTags() {
    const CACHE_KEY = 'cache:all-categories';
    let data = await getCache(CACHE_KEY);
    if (data) {
        // No TTL check - cache only invalidated by manual flush (scheduled every 2 days)
        return data;
    }
    const facetsBody = JSON.stringify({
        params: 'facets=categoriesids,tagsids&maxValuesPerFacet=1000&attributesToRetrieve=&filters=NOT instock:false'
    });
    const facetsResponse = await fetch(FACETS_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: facetsBody
    });
    if (!facetsResponse.ok) {
        const errorText = await facetsResponse.text();
        throw new Error(`Algolia error (facets): ${errorText}`);
    }
    const facetsData = await facetsResponse.json();
    const categoryFacets = facetsData.facets?.categoriesids || {};
    const tagFacets = facetsData.facets?.tagsids || {};

    // Return metadata only - NO fetchFacetObjects loop needed!
    // Frontend gets objectIDs from categoryById which reads from Redis sorted sets
    // This reduces Algolia requests from ~71 to just 1 (the facets query above)
    const categoriesArray = Object.entries(categoryFacets).map(([id, count]) => ({
        ids: [Number(id)],
        name: id,
        count: count,
        objectIDs: []  // Empty - frontend uses categoryById for objectIDs
    }));
    const tagsArray = Object.entries(tagFacets).map(([id, count]) => ({
        ids: [Number(id)],
        name: id,
        count: count,
        objectIDs: []  // Empty - frontend uses tagById for objectIDs
    }));

    const finalData = {
        categories: categoriesArray,
        tags: tagsArray,
        timestamp: Date.now()
    };
    await setCache(CACHE_KEY, finalData);
    return finalData;
}

// Keep the filterOutOfStockProducts helper function for any edge cases
async function filterOutOfStockProducts(objectIDs) {
    const filteredIDs = [];
    
    for (const objectID of objectIDs) {
        const productKey = `all-products:${objectID}`;
        try {
            const product = await getCache(productKey);
            if (product && product.instock !== false) {
                filteredIDs.push(objectID);
            }
        } catch (err) {
        }
    }
    
    return filteredIDs;
}

// Focused refresh function to check for out-of-stock products
async function refreshOutOfStockProducts() {
  let removedCount = 0;
  let processedCount = 0;
  
  // Only process the global-products set - this is sufficient
  const allProductIDs = await redisClient.zRange('global-products', 0, -1);
  
  // Process in small batches to avoid blocking for too long
  const batchSize = 50;
  for (let i = 0; i < allProductIDs.length; i += batchSize) {
    const batch = allProductIDs.slice(i, i + batchSize);
    
    for (const objectID of batch) {
      processedCount++;
      
      // Simple check in Algolia for stock status
      try {
        const response = await fetch(
          `https://${APP_ID}-dsn.algolia.net/1/indexes/${INDEX_NAME}/${objectID}?x-algolia-application-id=${APP_ID}&x-algolia-api-key=${API_KEY}`
        );
        
        if (!response.ok) {
          await removeFromSortedSets(objectID);
          removedCount++;
          continue;
        }
        
        const product = await response.json();
        if (product.instock === false) {
          await removeFromSortedSets(objectID);
          removedCount++;
          
          // Update the cached product data to reflect out-of-stock status
          const productKey = `all-products:${objectID}`;
          const cachedProduct = await getCache(productKey);
          if (cachedProduct) {
            cachedProduct.instock = false;
            await setCache(productKey, cachedProduct);
          }
        }
      } catch (error) {
      }
    }
  }
  
  return { processed: processedCount, removed: removedCount };
}

// Helper function to remove a product from all sorted sets
async function removeFromSortedSets(objectID) {
  // First remove from global products set
  await redisClient.zRem('global-products', objectID);
  
  // Get the product to find its categories and tags
  const productKey = `all-products:${objectID}`;
  const product = await getCache(productKey);
  
  if (product) {
    // Remove from category sorted sets
    if (Array.isArray(product.categoriesids)) {
      for (const catID of product.categoriesids) {
        await redisClient.zRem(`cat-products:${catID}`, objectID);
      }
    }
    
    // Remove from tag sorted sets
    if (Array.isArray(product.tagsids)) {
      for (const tagID of product.tagsids) {
        await redisClient.zRem(`tag-products:${tagID}`, objectID);
      }
    }
  }
}

// Function to refresh product cache from Algolia on a schedule
async function refreshProductCacheFromAlgolia(batchSize = 100) {
  let updatedCount = 0;
  let removedCount = 0;
  
  // Get all product IDs from global sorted set
  const allProductIDs = await redisClient.zRange('global-products', 0, -1);
  
  // Process in batches
  for (let i = 0; i < allProductIDs.length; i += batchSize) {
    const batch = allProductIDs.slice(i, i + batchSize);
    
    // Use a single batch request to Algolia when possible to reduce API calls
    // For now, we'll fetch products individually
    for (const objectID of batch) {
      try {
        const response = await fetch(
          `https://${APP_ID}-dsn.algolia.net/1/indexes/${INDEX_NAME}/${objectID}?x-algolia-application-id=${APP_ID}&x-algolia-api-key=${API_KEY}`
        );
        
        if (!response.ok) {
          await removeFromSortedSets(objectID);
          removedCount++;
          continue;
        }
        
        const product = await response.json();
        const productKey = `all-products:${objectID}`;
        
        if (product.instock === false) {
          await removeFromSortedSets(objectID);
          removedCount++;
        }
        
        // Update the cache with fresh data
        await setCache(productKey, {
          ...product,
          updatedAt: Date.now()
        });
        updatedCount++;
      } catch (error) {
      }
    }
  }
  
  return { updated: updatedCount, removed: removedCount };
}

module.exports = { cache: app };
