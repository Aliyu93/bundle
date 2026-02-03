class RedisService {
    constructor() {
        this.baseUrl = 'https://me-central2-gtm-5v2mhn4-mwvlm.cloudfunctions.net/function-2';
        this.maxRetries = 2;
        this.headers = { 
            'Accept': 'application/json', 
            'Cache-Control': 'public, max-age=3600'
        };
        this.cache = new Map();
        this.fallbackEnabled = true;
    }

    async getProducts(type, id, offset = 0, limit = 12) {
        if (!id) return null;
        
        const cacheKey = `${type}:${id}:${offset}:${limit}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const param = type === 'category' ? 'catID' : 'tagID';
        const endpoint = type === 'category' ? 'categoryById' : 'tagById';
        const url = `${this.baseUrl}/?type=${endpoint}&${param}=${encodeURIComponent(id)}&offset=${offset}&limit=${limit}`;
        
        let data = null;
        let shouldDelayedRetry = false;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); 
            
            const response = await fetch(url, { 
                method: 'GET', 
                headers: this.headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            data = await response.json();
            if (data?.objectIDs?.length) {
                this.cache.set(cacheKey, data);
                return data;
            }
            const total = Number(data?.totalObjectIDs ?? data?.count ?? 0);
            if (offset === 0 && Array.isArray(data?.objectIDs) && data.objectIDs.length === 0 && total > 0) {
                shouldDelayedRetry = true;
            }
        } catch (error) {
        }
        
        if (!data?.objectIDs?.length && this.fallbackEnabled) {
            try {
                if (shouldDelayedRetry) {
                    await new Promise(resolve => setTimeout(resolve, 750));
                }
                const response = await fetch(url, { 
                    method: 'GET', 
                    headers: this.headers,
                });
                
                if (response.ok) {
                    data = await response.json();
                    if (data?.objectIDs?.length) {
                        this.cache.set(cacheKey, data);
                        return data;
                    }
                }
            } catch (retryError) {
            }
        }
        
        return data || { objectIDs: [], hasMore: false };
    }
    
    async getRecommendations(productId) {
        if (!productId) return [];
        
        const cacheKey = `recommendations:${productId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const url = `${this.baseUrl}/?type=recommendations&objectID=${encodeURIComponent(productId)}`;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(url, { 
                method: 'GET', 
                headers: this.headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) return [];
            
            const data = await response.json();
            const recommendations = Array.isArray(data?.relatedProductIDs) ? data.relatedProductIDs : [];
            
            this.cache.set(cacheKey, recommendations);
            
            return recommendations;
        } catch {
            return [];
        }
    }
    
    async getFrequentlyBought(productId) {
        if (!productId) return [];
        
        const cacheKey = `frequently-bought:${productId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const url = `${this.baseUrl}/?type=frequentlyBought&objectID=${encodeURIComponent(productId)}`;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(url, { 
                method: 'GET', 
                headers: this.headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) return [];
            
            const data = await response.json();
            const frequentlyBought = Array.isArray(data?.frequentlyBoughtIDs) ? data.frequentlyBoughtIDs : [];
            
            this.cache.set(cacheKey, frequentlyBought);
            
            return frequentlyBought;
        } catch {
            return [];
        }
    }
    
    async getCategoriesFromRedis() {
        const cacheKey = 'all-categories';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${this.baseUrl}/?type=categories`, {
                method: 'GET',
                headers: this.headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                return [];
            }
            
            const data = await response.json();
            const categories = data.categories || [];

            if (Array.isArray(categories) && categories.length > 0) {
                this.cache.set(cacheKey, categories);
            }
            return categories;
        } catch (error) {
            return [];
        }
    }
    
    async getGlobalProducts(offset = 0, limit = 12) {
        const cacheKey = `global-products:${offset}:${limit}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const url = `${this.baseUrl}/?type=categoryById&catID=trending-now&offset=${offset}&limit=${limit}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                return { objectIDs: [], hasMore: false };
            }
            
            const data = await response.json();
            const result = {
                objectIDs: data.objectIDs || [],
                hasMore: data.hasMore || false
            };
            
            this.cache.set(cacheKey, result);
            return result;
        } catch (error) {
            return { objectIDs: [], hasMore: false };
        }
    }
    
    async getCategoryPageById(categoryId, offset = 0, limit = 12) {
        return this.getProducts('category', categoryId, offset, limit);
    }
    
    async getCategoryProducts(categoryId, offset, limit) {
        return this.getProducts('category', categoryId, offset, limit);
    }
    
    async getTagProducts(tagId, offset, limit) {
        return this.getProducts('tag', tagId, offset, limit);
    }
}

export const redisService = new RedisService();
