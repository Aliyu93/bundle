var AlgoliaBundle = (() => {
  // services/redis-service.js
  var RedisService = class {
    constructor() {
      this.baseUrl = "https://me-central2-gtm-5v2mhn4-mwvlm.cloudfunctions.net/function-2";
      this.maxRetries = 2;
      this.headers = {
        "Accept": "application/json",
        "Cache-Control": "public, max-age=3600"
      };
      this.cache = /* @__PURE__ */ new Map();
      this.fallbackEnabled = true;
    }
    async getProducts(type, id, offset = 0, limit = 12) {
      if (!id) return null;
      const cacheKey = `${type}:${id}:${offset}:${limit}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      const param = type === "category" ? "catID" : "tagID";
      const endpoint = type === "category" ? "categoryById" : "tagById";
      const url = `${this.baseUrl}/?type=${endpoint}&${param}=${encodeURIComponent(id)}&offset=${offset}&limit=${limit}`;
      let data = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2e3);
        const response = await fetch(url, {
          method: "GET",
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
      } catch (error) {
      }
      if (!data?.objectIDs?.length && this.fallbackEnabled) {
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: this.headers
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
        const timeoutId = setTimeout(() => controller.abort(), 3e3);
        const response = await fetch(url, {
          method: "GET",
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
        const timeoutId = setTimeout(() => controller.abort(), 3e3);
        const response = await fetch(url, {
          method: "GET",
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
      const cacheKey = "all-categories";
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5e3);
        const response = await fetch(`${this.baseUrl}/?type=categories`, {
          method: "GET",
          headers: this.headers,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          return [];
        }
        const data = await response.json();
        const categories = data.categories || [];
        this.cache.set(cacheKey, categories);
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
        const timeoutId = setTimeout(() => controller.abort(), 3e3);
        const url = `${this.baseUrl}/?type=categoryById&catID=trending-now&offset=${offset}&limit=${limit}`;
        const response = await fetch(url, {
          method: "GET",
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
      return this.getProducts("category", categoryId, offset, limit);
    }
    async getCategoryProducts(categoryId, offset, limit) {
      return this.getProducts("category", categoryId, offset, limit);
    }
    async getTagProducts(tagId, offset, limit) {
      return this.getProducts("tag", tagId, offset, limit);
    }
  };
  var redisService = new RedisService();

  // components/CartAddonsSlider.js
  var CartAddonsSlider = class extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
      this.productIds = [];
      this.structureReady = false;
    }
    connectedCallback() {
      this.ensureStructure();
      if (this.initialized) return;
      this.getHighestValueItemFromDOM().then((productId) => {
        if (productId) {
          return this.fetchFrequentlyBoughtProducts(productId);
        }
        return [];
      }).then(() => {
        this.renderProductList();
        setTimeout(() => {
          this.initializeSlider();
        }, 1e3);
      }).catch((error) => {
        console.error("[CartAddonsSlider] Error loading products:", error);
      });
    }
    ensureStructure() {
      if (this.structureReady) return;
      if (!this.querySelector(".cart-addons-title")) {
        const title = document.createElement("h3");
        title.className = "cart-addons-title";
        title.textContent = window.salla?.lang?.get("pages.cart.frequently_bought_together") || "Frequently bought together";
        this.appendChild(title);
      }
      if (!this.querySelector(".frequently-bought-container")) {
        const container = document.createElement("div");
        container.className = "frequently-bought-container";
        this.appendChild(container);
      }
      this.structureReady = true;
    }
    async getHighestValueItemFromDOM() {
      try {
        const cartItemForms = document.querySelectorAll('form[id^="item-"]');
        if (!cartItemForms || cartItemForms.length === 0) {
          console.log("[CartAddonsSlider] No cart items found in DOM");
          return null;
        }
        let highestValueItem = null;
        let highestValue = 0;
        cartItemForms.forEach((form) => {
          try {
            const formId = form.getAttribute("id") || "";
            const itemId = formId.replace("item-", "");
            const productLink = form.querySelector('a[href*="/p"]');
            if (!productLink) {
              console.log("[CartAddonsSlider] No product link found in form", formId);
              return;
            }
            const productUrl = productLink.getAttribute("href");
            const productIdMatch = productUrl.match(/\/p(\d+)(?:$|\/|\?)/);
            if (!productIdMatch || !productIdMatch[1]) {
              console.log("[CartAddonsSlider] Could not extract product ID from URL", productUrl);
              return;
            }
            const productId = productIdMatch[1];
            const totalElement = form.querySelector(".item-total");
            if (totalElement) {
              const totalText = totalElement.textContent || totalElement.innerText || "0";
              const cleanedText = totalText.replace(/[^\d.,٠١٢٣٤٥٦٧٨٩]/g, "").replace(/٠/g, "0").replace(/١/g, "1").replace(/٢/g, "2").replace(/٣/g, "3").replace(/٤/g, "4").replace(/٥/g, "5").replace(/٦/g, "6").replace(/٧/g, "7").replace(/٨/g, "8").replace(/٩/g, "9");
              const totalValue = parseFloat(cleanedText.replace(",", ".")) || 0;
              console.log(`[CartAddonsSlider] Item ${itemId}: Product ID ${productId}, Total: ${totalValue}`);
              if (!isNaN(totalValue) && totalValue > highestValue) {
                highestValue = totalValue;
                highestValueItem = {
                  itemId,
                  productId,
                  total: totalValue
                };
              }
            }
          } catch (err) {
            console.error("[CartAddonsSlider] Error processing item form:", err);
          }
        });
        if (highestValueItem) {
          console.log("[CartAddonsSlider] Highest value item:", highestValueItem);
          return highestValueItem.productId;
        }
        return null;
      } catch (error) {
        console.error("[CartAddonsSlider] Error extracting cart data from DOM:", error);
        return null;
      }
    }
    async fetchFrequentlyBoughtProducts(productId) {
      try {
        console.log("[CartAddonsSlider] Fetching frequently bought products for:", productId);
        const productIds = await redisService.getFrequentlyBought(productId);
        if (productIds && productIds.length > 0) {
          console.log("[CartAddonsSlider] Found frequently bought products:", productIds);
          this.productIds = productIds.map((id) => String(id)).slice(0, 8);
          return this.productIds;
        } else {
          console.log("[CartAddonsSlider] No frequently bought products found");
          this.productIds = [];
          return [];
        }
      } catch (error) {
        console.error("[CartAddonsSlider] Error fetching frequently bought products:", error);
        this.productIds = [];
        return [];
      }
    }
    renderProductList() {
      if (!this.productIds || this.productIds.length === 0) {
        console.log("[CartAddonsSlider] No products to render, hiding component");
        this.style.display = "none";
        return;
      }
      console.log("[CartAddonsSlider] Rendering product list with IDs:", this.productIds);
      const container = this.querySelector(".frequently-bought-container");
      if (!container) {
        console.error("[CartAddonsSlider] Container not found");
        return;
      }
      const productsList = document.createElement("salla-products-list");
      productsList.setAttribute("source", "selected");
      productsList.setAttribute("loading", "lazy");
      productsList.setAttribute("source-value", JSON.stringify(this.productIds));
      productsList.setAttribute("class", "s-products-list-vertical-cards");
      container.innerHTML = "";
      container.appendChild(productsList);
      if (!this.querySelector(".touch-indicator")) {
        const touchIndicator = document.createElement("div");
        touchIndicator.classList.add("touch-indicator");
        this.appendChild(touchIndicator);
      }
      console.log("[CartAddonsSlider] Product list rendered");
    }
    initializeSlider() {
      try {
        const productsList = this.querySelector("salla-products-list");
        if (!productsList) {
          console.log("[CartAddonsSlider] Products list not found");
          return;
        }
        productsList.style.opacity = "1";
        if (window.salla?.event?.dispatch) {
          window.salla.event.dispatch("twilight::mutation");
        }
        this.initialized = true;
        console.log("[CartAddonsSlider] Slider initialized");
      } catch (error) {
        console.error("[CartAddonsSlider] Failed to initialize cart addons slider:", error);
      }
    }
  };
  if (!customElements.get("cart-addons-slider")) {
    customElements.define("cart-addons-slider", CartAddonsSlider);
    console.log("[CartAddonsSlider] Custom element defined");
  }

  // partials/product-ranking.js
  var ProductRanking = class extends HTMLElement {
    constructor() {
      super();
      this.page = 0;
      this.loading = false;
      this.hasMore = true;
      this.ids = [];
      this.container = null;
      this.originalList = null;
      this.usingSallaFilter = false;
      this.timeout = null;
    }
    async connectedCallback() {
      const categoryId = this.getAttribute("category-id");
      const tagId = this.getAttribute("tag-id");
      console.log("[PR Element] Connected:", { categoryId, tagId });
      if (!categoryId && !tagId) return;
      try {
        await this.waitForSalla();
        this.setupFilterListener();
        await this.initialize(categoryId, tagId);
      } catch (err) {
        console.error("[PR Element] Error:", err);
        this.restoreOriginalList();
      }
    }
    // Restore original list if redis fails
    restoreOriginalList() {
      if (!this.originalList || this.usingSallaFilter) return;
      const currentList = document.querySelector(".ranked-products, salla-products-list[filter]");
      const parent = currentList?.parentNode || this.originalList.parentNode;
      if (currentList) currentList.remove();
      if (this.container) {
        this.container.remove();
        this.container = null;
      }
      if (parent && !parent.querySelector("salla-products-list")) {
        parent.appendChild(this.originalList.cloneNode(true));
        window.salla?.event?.dispatch("twilight::mutation");
      }
    }
    setupFilterListener() {
      document.addEventListener("change", (e) => {
        if (e.target.id !== "product-filter") return;
        const value = e.target.value;
        if (value === "ourSuggest" && this.usingSallaFilter) {
          this.applyRedisRanking();
        } else if (value !== "ourSuggest") {
          this.applySallaFilter(value);
        }
      });
    }
    async applySallaFilter(filterValue) {
      const categoryId = this.getAttribute("category-id");
      const tagId = this.getAttribute("tag-id");
      if (!this.originalList) {
        return;
      }
      const currentList = document.querySelector(".ranked-products, salla-products-list[filter]");
      const parent = currentList?.parentNode || this.container?.parentNode;
      if (!parent) return;
      if (currentList) currentList.remove();
      if (this.container) {
        this.container.remove();
        this.container = null;
      }
      this.cleanupScrollListener();
      this.usingSallaFilter = true;
      const list = this.originalList.cloneNode(true);
      list.setAttribute("filter", filterValue);
      parent.appendChild(list);
      window.salla?.event?.dispatch("twilight::mutation");
    }
    async applyRedisRanking() {
      const categoryId = this.getAttribute("category-id");
      const tagId = this.getAttribute("tag-id");
      this.usingSallaFilter = false;
      await this.initialize(categoryId, tagId, true);
    }
    async initialize(categoryId, tagId, force = false) {
      console.log("[PR Element] Initialize called");
      if (this.container && !this.usingSallaFilter && !force) return;
      const selector = categoryId ? 'salla-products-list[source="product.index"], salla-products-list[source="categories"]' : 'salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]';
      const existingList = document.querySelector(selector);
      console.log("[PR Element] Existing list found:", !!existingList);
      if (!existingList) {
        return;
      }
      if (!this.originalList) {
        this.originalList = existingList.cloneNode(true);
      }
      const filter = document.getElementById("product-filter");
      if (filter) {
        filter.value = "ourSuggest";
        this.usingSallaFilter = false;
      } else if (filter && filter.value !== "ourSuggest" && !force) {
        this.usingSallaFilter = true;
        return;
      }
      const dataPromise = categoryId ? redisService.getCategoryProducts(categoryId, 0, 12) : redisService.getTagProducts(tagId, 0, 12);
      const parent = existingList.parentNode;
      this.container = document.createElement("div");
      this.container.className = "ranked-products";
      parent.insertBefore(this.container, existingList);
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        if (!this.ids || !this.ids.length) {
          this.restoreOriginalList();
        }
      }, 2500);
      const data = await dataPromise;
      clearTimeout(this.timeout);
      console.log("[PR Element] Redis data received:", data?.objectIDs?.length, "products");
      console.log("[PR Element] Redis product IDs:", data.objectIDs);
      if (!data?.objectIDs?.length) {
        console.warn("[PR Element] No products from Redis, restoring original");
        this.restoreOriginalList();
        return;
      }
      this.ids = data.objectIDs;
      this.page = 0;
      this.hasMore = true;
      this.usingSallaFilter = false;
      const list = document.createElement("salla-products-list");
      list.setAttribute("source", "selected");
      list.setAttribute("source-value", JSON.stringify(this.ids));
      list.setAttribute("limit", this.ids.length);
      list.className = existingList.className || "w-full";
      this.container.appendChild(list);
      existingList.remove();
      window.salla?.event?.dispatch("twilight::mutation");
      this.applyOrderToList(this.container, this.ids);
      this.setupScrollListener();
    }
    setupScrollListener() {
      this.cleanupScrollListener();
      this._boundScrollHandler = this.handleScroll.bind(this);
      window.addEventListener("scroll", this._boundScrollHandler);
    }
    cleanupScrollListener() {
      if (this._boundScrollHandler) {
        window.removeEventListener("scroll", this._boundScrollHandler);
        this._boundScrollHandler = null;
      }
    }
    handleScroll() {
      if (this.loading || !this.hasMore || this.usingSallaFilter) return;
      const scrolled = window.scrollY + window.innerHeight;
      const threshold = document.documentElement.scrollHeight * 0.5;
      if (scrolled > threshold) {
        this.loadMore();
      }
    }
    async loadMore() {
      if (this.loading || !this.hasMore) return;
      this.loading = true;
      try {
        const nextPage = this.page + 1;
        const offset = nextPage * 12;
        const categoryId = this.getAttribute("category-id");
        const tagId = this.getAttribute("tag-id");
        const data = categoryId ? await redisService.getCategoryProducts(categoryId, offset, 12) : await redisService.getTagProducts(tagId, offset, 12);
        if (!data?.objectIDs?.length) {
          this.hasMore = false;
          return;
        }
        const list = document.createElement("salla-products-list");
        list.setAttribute("source", "selected");
        list.setAttribute("source-value", JSON.stringify(data.objectIDs));
        list.setAttribute("limit", data.objectIDs.length);
        list.className = "w-full";
        this.container.appendChild(list);
        this.page = nextPage;
        this.hasMore = data.hasMore !== false;
        window.salla?.event?.dispatch("twilight::mutation");
        this.applyOrderToList(list, data.objectIDs);
      } catch (err) {
        this.hasMore = false;
      } finally {
        this.loading = false;
      }
    }
    async waitForSalla() {
      if (window.salla) return;
      return new Promise((resolve) => {
        document.addEventListener("salla::ready", resolve, { once: true });
        setTimeout(resolve, 3e3);
      });
    }
    applyOrderToList(container, ids, maxAttempts = 30) {
      if (!container || !ids || !ids.length) return;
      let attempt = 0;
      const intervalId = setInterval(() => {
        attempt++;
        const cards = Array.from(container.querySelectorAll(
          "custom-salla-product-card, .s-product-card-entry"
        ));
        if (cards.length > 0) {
          clearInterval(intervalId);
          const cardMap = /* @__PURE__ */ new Map();
          cards.forEach((card) => {
            let productId = null;
            if (card.dataset.id) {
              productId = card.dataset.id;
            } else if (card.id && !isNaN(card.id)) {
              productId = card.id;
            } else {
              const link = card.querySelector(".s-product-card-image a, .s-product-card-content-title a");
              if (link?.href) {
                const match = link.href.match(/\/product\/[^\/]+\/(\d+)/);
                if (match) productId = match[1];
              }
            }
            if (productId) {
              cardMap.set(String(productId), card);
            }
          });
          const parent = cards[0].parentNode;
          if (!parent) return;
          ids.forEach((redisId) => {
            const card = cardMap.get(String(redisId));
            if (card && parent.contains(card)) {
              parent.appendChild(card);
            }
          });
          console.log("[PR Element] Reordered", cards.length, "cards to match Redis order");
        } else if (attempt >= maxAttempts) {
          clearInterval(intervalId);
          console.warn("[PR Element] Cards never appeared, skipping reorder");
        }
      }, 100);
    }
    disconnectedCallback() {
      this.cleanupScrollListener();
      clearTimeout(this.timeout);
    }
  };
  customElements.get("product-ranking") || customElements.define("product-ranking", ProductRanking);

  // partials/category-products.js
  var CategoryProductsComponent = class extends HTMLElement {
    constructor() {
      super();
      this.state = {
        productsPerPage: 30,
        categories: [],
        trendingCategory: {
          name: "\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646",
          slug: "trending-now",
          filter: null,
          hasSubcats: false,
          url: null
        }
      };
      this.categoriesLoading = true;
      this.seenProductIds = /* @__PURE__ */ new Set();
    }
    async connectedCallback() {
      this.innerHTML = `
            <div class="category-filter">
                <div class="categories-loading">\u062C\u0627\u0631\u0650 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A...</div>
            </div>
        `;
      try {
        await this.fetchCategoriesFromCloudRun();
        const template = this.createTemplate();
        this.innerHTML = template;
        await this.initializeCategorySections();
      } catch (error) {
        this.handleInitError(error);
      }
    }
    disconnectedCallback() {
    }
    async fetchCategoriesFromCloudRun() {
      const allowedCategories = {
        228327271: { name: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA/c228327271" },
        476899183: { name: "\u062C\u0644\u0627\u0628\u064A\u0627\u062A", url: "https://darlena.com/%D8%AC%D9%84%D8%A7%D8%A8%D9%8A%D8%A7%D8%AA/c476899183" },
        1466412179: { name: "\u062C\u062F\u064A\u062F\u0646\u0627", url: "https://darlena.com/%D8%AC%D8%AF%D9%8A%D8%AF-%D8%AF%D8%A7%D8%B1-%D9%84%D9%8A%D9%86%D8%A7/c1466412179" },
        289250285: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%83%D9%84%D9%88%D8%B4/c289250285" },
        1891285357: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B3%D9%88%D8%AF%D8%A7%D8%A1-%D8%B3%D8%A7%D8%AF%D8%A9/c1891285357" },
        2132455494: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D9%84%D9%88%D9%86%D8%A9/c2132455494" },
        940975465: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%AC%D9%8A%D9%88%D8%A8/c940975465" },
        1567146102: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%B4%D8%AA/c1567146102" },
        832995956: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D8%B7%D8%B1%D8%B2%D8%A9/c832995956" },
        2031226480: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B1%D8%A3%D8%B3/c2031226480" },
        1122348775: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B5%D9%8A%D9%81%D9%8A%D8%A9/c1122348775" },
        692927841: { name: "\u0637\u0631\u062D", url: "https://darlena.com/%D8%B7%D8%B1%D8%AD/c692927841" },
        639447590: { name: "\u0646\u0642\u0627\u0628\u0627\u062A", url: "https://darlena.com/%D9%86%D9%82%D8%A7%D8%A8%D8%A7%D8%AA/c639447590" },
        114756598: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646", url: "https://darlena.com/%D8%B4%D9%8A%D9%81%D9%88%D9%86/c114756598" }
      };
      const priorityOrder = {
        "\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646": 1,
        "\u062C\u062F\u064A\u062F\u0646\u0627": 2,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629": 3,
        "\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A": 4,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634": 5,
        "\u062C\u0644\u0627\u0628\u064A\u0627\u062A": 6,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646": 7,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629": 8,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628": 9,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A": 10,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629": 11,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633": 12,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629": 13,
        "\u0637\u0631\u062D": 14,
        "\u0646\u0642\u0627\u0628\u0627\u062A": 15
      };
      try {
        const categories = await redisService.getCategoriesFromRedis();
        if (!Array.isArray(categories)) {
          throw new Error("Categories data is not an array");
        }
        let dynamicCats = categories.map((cat) => ({
          slug: cat.name,
          name: cat.name,
          filter: cat.name,
          hasSubcats: false,
          count: cat.count || 0,
          ids: cat.ids || (cat.id ? [cat.id] : [])
        }));
        dynamicCats = dynamicCats.filter((cat) => {
          if (cat.ids.length > 0) {
            const id = Number(cat.ids[0]);
            return allowedCategories.hasOwnProperty(id);
          }
          return false;
        }).map((cat) => {
          const id = Number(cat.ids[0]);
          return {
            ...cat,
            name: allowedCategories[id].name,
            slug: allowedCategories[id].name.toLowerCase().replace(/\s+/g, "-"),
            url: allowedCategories[id].url,
            ids: cat.ids
          };
        });
        dynamicCats.sort((a, b) => {
          const aRank = priorityOrder[a.name] || 999;
          const bRank = priorityOrder[b.name] || 999;
          return aRank - bRank;
        });
        dynamicCats.unshift({
          ...this.state.trendingCategory
        });
        this.state.categories = dynamicCats;
      } catch (error) {
        this.state.categories = [{ ...this.state.trendingCategory }];
        throw error;
      } finally {
        this.categoriesLoading = false;
      }
    }
    createTemplate() {
      if (this.categoriesLoading) {
        return `
                <div class="category-filter">
                    <div class="categories-loading">\u062C\u0627\u0631\u0650 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A...</div>
                </div>
            `;
      }
      const template = `
            <style>
                .category-filter {
                    max-width: 1280px;
                    margin: 0 auto;
                    margin-top: 4rem;
                    padding: 0;
                }
                .category-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    position: relative;
                    padding-bottom: 0.5rem;
                }
                .category-header:after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background-color: rgba(212, 172, 132, 0.1);
                }
                .category-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #d4ac84;
                    order: -1;
                    padding-right: 1rem;
                }
                .view-all {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.875rem;
                    color: #d4ac84;
                    text-decoration: none;
                }
                .view-all i {
                    font-size: 0.75rem;
                }
                .view-all i:first-child {
                    order: 1;
                }
                .view-all i:last-child {
                    order: -1;
                }
                .category-section {
                    margin-bottom: 2rem;
                }
                salla-products-slider {
                    --slider-arrows-display: block !important;
                    --slider-arrows-rtl: 1;
                }
                .s-product-card-sale-price {
                    font-size: 0.75rem;
                    display: inline-flex;
                    gap: 0.4rem;
                    align-items: center;
                    white-space: nowrap;
                    overflow: hidden;
                }
                .s-product-card-sale-price h4,
                .s-product-card-sale-price span {
                    white-space: nowrap;
                    display: inline-block;
                }
                @media (max-width: 768px) {
                    salla-products-slider .swiper-slide {
                        width: 50% !important;
                    }
                }
                @media (min-width: 769px) and (max-width: 1024px) {
                    salla-products-slider .swiper-slide {
                        width: 33.333% !important;
                    }
                }
                @media (min-width: 1025px) {
                    salla-products-slider .swiper-slide {
                        width: 25% !important;
                    }
                }
            </style>
            <div class="category-filter">
                ${this.state.categories.map((category) => `
                    <div class="category-section" data-category="${category.slug}">
                        <div class="category-header">
                            ${category.url ? `<a href="${category.url}" class="view-all">
                                     <i class="sicon-keyboard_arrow_left"></i>
                                     \u0645\u0634\u0627\u0647\u062F\u0629 \u0627\u0644\u0643\u0644
                                     <i class="sicon-keyboard_arrow_right"></i>
                                   </a>` : ""}
                            <h2 class="category-title">${category.name}</h2>
                        </div>
                        <div id="products-${category.slug}">
                            <div class="slider-loading" style="text-align: center; padding: 1rem;">\u062C\u0627\u0631 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A...</div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
      return template;
    }
    async initializeCategorySections() {
      try {
        const categoryPromises = this.state.categories.map((category) => {
          if (category.slug === "trending-now") {
            return redisService.getGlobalProducts(0, this.state.productsPerPage).then((result) => ({ slug: category.slug, ids: result.objectIDs || [] })).catch((error) => ({ slug: category.slug, ids: [], error }));
          } else if (category.ids && category.ids.length > 0) {
            return this.fetchRegularCategory(category).then((ids) => ({ slug: category.slug, ids: ids || [] })).catch((error) => ({ slug: category.slug, ids: [], error }));
          } else {
            return Promise.resolve({ slug: category.slug, ids: [] });
          }
        });
        const results = await Promise.all(categoryPromises);
        const fetchedIDsMap = results.reduce((acc, result) => {
          acc[result.slug] = result.ids;
          return acc;
        }, {});
        this.seenProductIds.clear();
        const uniqueIDsPerCategory = {};
        for (const category of this.state.categories) {
          const fetchedIDs = fetchedIDsMap[category.slug] || [];
          const uniqueIDs = [];
          for (const pid of fetchedIDs) {
            if (!this.seenProductIds.has(pid)) {
              this.seenProductIds.add(pid);
              uniqueIDs.push(pid);
              if (uniqueIDs.length >= 6) break;
            }
          }
          uniqueIDsPerCategory[category.slug] = uniqueIDs;
        }
        this.renderProductSliders(uniqueIDsPerCategory);
      } catch (error) {
        this.handleInitError(error);
      }
    }
    async fetchRegularCategory(catObj) {
      const categoryIdFetches = catObj.ids.map(
        (numericID) => redisService.getCategoryPageById(numericID, 0, this.state.productsPerPage).catch((error) => {
          return { objectIDs: [] };
        })
      );
      try {
        const results = await Promise.all(categoryIdFetches);
        return results.flatMap((data) => data && data.objectIDs ? data.objectIDs : []);
      } catch (error) {
        return [];
      }
    }
    renderProductSliders(uniqueIDsPerCategory) {
      this.state.categories.forEach((category) => {
        const categorySlug = category.slug;
        const uniqueIDs = uniqueIDsPerCategory[categorySlug] || [];
        const container = this.querySelector(`#products-${categorySlug}`);
        if (!container) {
          return;
        }
        container.innerHTML = "";
        if (uniqueIDs.length > 0) {
          const slider = document.createElement("salla-products-slider");
          slider.setAttribute("source", "selected");
          slider.setAttribute("source-value", JSON.stringify(uniqueIDs));
          slider.setAttribute("limit", String(uniqueIDs.length));
          slider.setAttribute("slider-id", `slider-${categorySlug}`);
          slider.setAttribute("block-title", " ");
          slider.setAttribute("arrows", "true");
          slider.setAttribute("rtl", "true");
          container.appendChild(slider);
          setTimeout(() => {
            const pricingElements = slider.querySelectorAll(".s-product-card-content-sub");
            pricingElements.forEach((pricing) => {
              if (pricing.children.length > 1) {
                pricing.style.display = "flex";
                pricing.style.alignItems = "center";
                pricing.style.justifyContent = "space-between";
                pricing.style.flexWrap = "nowrap";
                pricing.style.width = "100%";
                pricing.style.overflow = "visible";
              }
            });
          }, 500);
        } else {
          container.innerHTML = '<div style="text-align: center; padding: 1rem;">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0639\u0631\u0636\u0647\u0627 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0629.</div>';
        }
      });
    }
    handleInitError(error) {
      this.innerHTML = `
            <div class="category-filter">
                <div class="error-message" style="color: #e53e3e; text-align: center; padding: 2rem; margin-top: 2rem;">
                    \u0639\u0630\u0631\u0627\u064B\u060C \u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A. \u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0635\u0641\u062D\u0629.
                    ${error ? "<br><small>Error details logged.</small>" : ""}
                </div>
            </div>
        `;
    }
  };
  if (!customElements.get("mahaba-category-products")) {
    customElements.define("mahaba-category-products", CategoryProductsComponent);
  }

  // partials/product-recommendations.js
  var ProductRecommendations = class {
    constructor() {
      this.initialized = false;
      this.productId = null;
      this.recentlyViewedKey = "recently_viewed_products";
      this.maxRecentProducts = 15;
      this.recentlyViewedClass = "algolia-recently-viewed";
    }
    initialize() {
      if (!this.isProductPage()) return;
      const currentProductId = this.getProductId();
      if (!currentProductId) return;
      if (this.initialized && this.productId === currentProductId) return;
      this.productId = currentProductId;
      this.initialized = true;
      this.addToRecentlyViewed(this.productId);
      const loadComponents = () => {
        this.loadRecommendations();
        this.loadRecentlyViewed();
      };
      if (document.readyState === "complete" || document.readyState === "interactive") {
        loadComponents();
      } else {
        document.addEventListener("DOMContentLoaded", loadComponents);
      }
    }
    loadRecommendations() {
      const relatedSection = document.querySelector('salla-products-slider[source="related"]');
      if (relatedSection) {
        this.replaceRelatedProducts(relatedSection);
      } else {
        this.waitForElement('salla-products-slider[source="related"]', (el) => {
          this.replaceRelatedProducts(el);
        });
      }
    }
    loadRecentlyViewed() {
      const recentlyViewed = this.getRecentlyViewed();
      if (!recentlyViewed.length) return;
      const filteredRecent = recentlyViewed.map((id) => parseInt(id, 10)).filter((id) => id && !isNaN(id) && id !== parseInt(this.productId, 10));
      if (!filteredRecent.length) return;
      this.removeExistingRecentlyViewed();
      const container = document.createElement("div");
      container.className = "mt-8 s-products-slider-container";
      container.classList.add(this.recentlyViewedClass);
      const title = document.createElement("h2");
      title.className = "section-title mb-5 font-bold text-xl";
      title.textContent = "\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0624\u062E\u0631\u0627\u064B";
      container.appendChild(title);
      const recentSlider = document.createElement("salla-products-slider");
      recentSlider.setAttribute("source", "selected");
      recentSlider.setAttribute("source-value", JSON.stringify(filteredRecent));
      recentSlider.setAttribute("autoplay", "false");
      recentSlider.setAttribute("class", "product-recommendations-slider");
      const relatedSection = document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"]');
      recentSlider.setAttribute("display-style", relatedSection?.getAttribute("display-style") || "normal");
      container.appendChild(recentSlider);
      this.insertRecentlyViewedSection(container, relatedSection);
      window.salla?.event?.dispatch("twilight::mutation");
      this.setupStockFilter(recentSlider);
    }
    insertRecentlyViewedSection(container, relatedSection) {
      const productDetails = document.querySelector(".product-details, .product-entry, #product-entry");
      if (productDetails && productDetails.parentNode) {
        productDetails.parentNode.insertBefore(container, productDetails.nextSibling);
        return true;
      }
      if (relatedSection) {
        const relatedContainer = relatedSection.closest(".s-products-slider-container");
        if (relatedContainer && relatedContainer.parentNode) {
          relatedContainer.parentNode.insertBefore(container, relatedContainer.nextSibling);
          return true;
        }
        if (relatedSection.parentNode) {
          relatedSection.parentNode.insertBefore(container, relatedSection.nextSibling);
          return true;
        }
      }
      const mainContent = document.querySelector("main, .s-product-page-content, #content, .s-product-page");
      if (mainContent) {
        mainContent.appendChild(container);
        return true;
      }
      document.body.appendChild(container);
      return true;
    }
    addToRecentlyViewed(productId) {
      if (!productId) return;
      try {
        const numericId = parseInt(productId, 10);
        if (isNaN(numericId)) return;
        let recentlyViewed = this.getRecentlyViewed();
        recentlyViewed = recentlyViewed.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
        recentlyViewed = recentlyViewed.filter((id) => id !== numericId);
        recentlyViewed.unshift(numericId);
        if (recentlyViewed.length > this.maxRecentProducts) {
          recentlyViewed = recentlyViewed.slice(0, this.maxRecentProducts);
        }
        sessionStorage.setItem(this.recentlyViewedKey, JSON.stringify(recentlyViewed));
      } catch (error) {
      }
    }
    removeExistingRecentlyViewed() {
      document.querySelectorAll(`.${this.recentlyViewedClass}`).forEach((node) => node.remove());
    }
    getRecentlyViewed() {
      try {
        const stored = sessionStorage.getItem(this.recentlyViewedKey);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    isProductPage() {
      return !!document.querySelector('[id^="product-"], .sidebar .details-slider');
    }
    getProductId() {
      const productContainer = document.querySelector('[id^="product-"]');
      if (productContainer) {
        const id = productContainer.id.replace("product-", "");
        const numericId = parseInt(id, 10);
        if (!isNaN(numericId)) return numericId;
      }
      const urlMatch = window.location.pathname.match(/\/p(\d+)/);
      if (urlMatch?.[1]) {
        const numericId = parseInt(urlMatch[1], 10);
        if (!isNaN(numericId)) return numericId;
      }
      return null;
    }
    async replaceRelatedProducts(element) {
      try {
        const requestedProductId = this.productId;
        const recommendedIds = await redisService.getRecommendations(requestedProductId);
        if (requestedProductId !== this.productId) {
          console.log("[Bundle Recommendations] Product changed during fetch, aborting");
          return;
        }
        if (!recommendedIds?.length) return;
        const numericIds = recommendedIds.map((id) => parseInt(id, 10)).filter((id) => id && !isNaN(id));
        if (!numericIds.length) return;
        const newSlider = document.createElement("salla-products-slider");
        Array.from(element.attributes).forEach((attr) => {
          if (attr.name !== "source-value") {
            newSlider.setAttribute(attr.name, attr.value);
          }
        });
        newSlider.setAttribute("source", "selected");
        newSlider.setAttribute("source-value", JSON.stringify(numericIds));
        newSlider.setAttribute("class", "product-recommendations-slider");
        element.parentNode.replaceChild(newSlider, element);
        if (!document.getElementById("product-recommendations-styles")) {
          const styleEl = document.createElement("style");
          styleEl.id = "product-recommendations-styles";
          styleEl.textContent = `
                    .product-recommendations-slider .swiper-slide,
                    salla-products-slider[source="selected"] .swiper-slide {
                        width: 47% !important;
                    }
                    @media (min-width: 769px) {
                        .product-recommendations-slider .swiper-slide,
                        salla-products-slider[source="selected"] .swiper-slide {
                            width: 31% !important;
                        }
                    }
                    @media (min-width: 1025px) {
                        .product-recommendations-slider .swiper-slide,
                        salla-products-slider[source="selected"] .swiper-slide {
                            width: 24% !important;
                        }
                    }
                `;
          document.head.appendChild(styleEl);
        }
        window.salla?.event?.dispatch("twilight::mutation");
        this.setupStockFilter(newSlider);
      } catch {
      }
    }
    setupStockFilter(slider) {
      window.salla?.event?.on("salla-products-slider::products.fetched", (event) => {
        if (!slider.contains(event.target)) return;
        setTimeout(() => {
          const productCards = slider.querySelectorAll(".s-product-card-entry");
          if (!productCards.length) return;
          let inStockCount = 0;
          const maxProducts = 15;
          productCards.forEach((card) => {
            const isOutOfStock = card.classList.contains("s-product-card-out-of-stock");
            if (isOutOfStock || inStockCount >= maxProducts) {
              card.style.display = "none";
            } else {
              inStockCount++;
            }
          });
        }, 200);
      });
    }
    reset() {
      this.initialized = false;
      this.productId = null;
      this.removeExistingRecentlyViewed();
    }
    waitForElement(selector, callback) {
      const element = document.querySelector(selector);
      if (element) {
        callback(element);
        return;
      }
      const observer = new MutationObserver(() => {
        const element2 = document.querySelector(selector);
        if (element2) {
          observer.disconnect();
          callback(element2);
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };
  var productRecommendations = new ProductRecommendations();
  var product_recommendations_default = productRecommendations;

  // product-ranking-init.js
  var initialized = false;
  var initAttempts = 0;
  var MAX_ATTEMPTS = 2;
  function initRanking() {
    console.log(`[PR Init] Attempt ${initAttempts + 1}/${MAX_ATTEMPTS}`);
    if (initialized) return;
    initAttempts++;
    if (initAttempts > MAX_ATTEMPTS) {
      console.warn("[PR Init] Max attempts reached");
      return;
    }
    const categoryList = document.querySelector('salla-products-list[source="product.index"], salla-products-list[source="categories"]');
    console.log("[PR Init] Category list found:", !!categoryList);
    if (categoryList) {
      const categoryId = categoryList.getAttribute("source-value");
      if (categoryId) {
        console.log("[PR Init] \u2705 Creating ranking for category:", categoryId);
        createRanking("category", categoryId);
        initialized = true;
        return;
      }
    }
    const tagList = document.querySelector('salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]');
    if (tagList) {
      const tagId = tagList.getAttribute("source-value");
      if (tagId) {
        console.log("[PR Init] \u2705 Creating ranking for tag:", tagId);
        createRanking("tag", tagId);
        initialized = true;
        return;
      }
    }
    if (initAttempts < MAX_ATTEMPTS) {
      console.log("[PR Init] Retrying in 800ms...");
      setTimeout(initRanking, 800);
    }
  }
  function createRanking(type, id) {
    if (document.querySelector(`product-ranking[${type}-id="${id}"]`)) {
      return;
    }
    const ranking = document.createElement("product-ranking");
    ranking.setAttribute(`${type}-id`, id);
    document.body.appendChild(ranking);
  }
  document.addEventListener("salla::page::changed", () => {
    initialized = false;
    initAttempts = 0;
    document.querySelectorAll("product-ranking").forEach((el) => el.remove());
    setTimeout(initRanking, 100);
  });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRanking);
  } else {
    initRanking();
    document.addEventListener("salla::ready", () => {
      if (!initialized) {
        setTimeout(initRanking, 100);
      }
    });
  }

  // partials/youtube-lazy.js
  var LOG_PREFIX = "[YouTube Opt-In]";
  var debug = (...args) => console.log(LOG_PREFIX, ...args);
  var YOUTUBE_REGEX = /\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i;
  var youtubeStylesInjected = false;
  function injectYoutubePlaceholderStyles() {
    if (youtubeStylesInjected || typeof document === "undefined") return;
    const style = document.createElement("style");
    style.id = "youtube-placeholder-styles";
    style.textContent = `
    .yt-placeholder {
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 16 / 9;
      margin: 1rem 0;
      border-radius: 0.5rem;
      overflow: hidden;
      border: none;
      padding: 0;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      transition: background 0.35s ease;
    }
    .yt-placeholder__thumb {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease, filter 0.3s ease;
      z-index: 0;
    }
    .yt-placeholder__overlay {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      border-radius: 9999px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-weight: 600;
      letter-spacing: 0.01em;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(8px);
    }
    .yt-placeholder__icon {
      position: relative;
      width: 3rem;
      height: 3rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }
    .yt-placeholder__icon::before {
      content: '';
      display: inline-block;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0.55rem 0 0.55rem 0.95rem;
      border-color: transparent transparent transparent #1f1f1f;
      margin-left: 0.2rem;
    }
    .yt-placeholder__label {
      font-size: 1rem;
      line-height: 1.4;
      white-space: nowrap;
    }
    .yt-placeholder:hover {
      background: linear-gradient(135deg, #c62828 0%, #e53935 100%);
    }
    .yt-placeholder:hover .yt-placeholder__thumb {
      transform: scale(1.03);
      filter: brightness(0.75);
    }
    .yt-placeholder:hover .yt-placeholder__overlay {
      background: rgba(0, 0, 0, 0.7);
    }
    .yt-placeholder:focus-visible {
      outline: 3px solid #c62828;
      outline-offset: 3px;
    }
    .yt-placeholder:focus-visible .yt-placeholder__overlay {
      background: rgba(0, 0, 0, 0.75);
    }
    @media (max-width: 640px) {
      .yt-placeholder__overlay {
        padding: 0.6rem 1rem;
        gap: 0.6rem;
      }
      .yt-placeholder__icon {
        width: 2.5rem;
        height: 2.5rem;
      }
      .yt-placeholder__icon::before {
        border-width: 0.45rem 0 0.45rem 0.75rem;
      }
      .yt-placeholder__label {
        font-size: 0.9rem;
      }
    }
  `;
    document.head.appendChild(style);
    youtubeStylesInjected = true;
  }
  function normalizeYoutubeUrl(url) {
    if (!url) return "";
    const videoId = extractVideoId(url);
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return url.split("?")[0];
  }
  function extractVideoId(url) {
    if (!url) return null;
    const patterns = [
      /youtube\.com\/embed\/([^?&/]+)/,
      /youtube-nocookie\.com\/embed\/([^?&/]+)/,
      /youtube\.com\/v\/([^?&/]+)/,
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?&/]+)/,
      /youtube\.com\/shorts\/([^?&/]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }
  function createPlaceholderButton(videoUrl, options = {}) {
    injectYoutubePlaceholderStyles();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "yt-placeholder";
    button.setAttribute("data-yt-src", videoUrl);
    button.setAttribute("aria-label", "Play YouTube video");
    const videoId = options.videoId || extractVideoId(videoUrl);
    const customThumbnail = options.thumbnailUrl;
    const thumbnailUrl = customThumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null);
    if (thumbnailUrl) {
      const img = document.createElement("img");
      img.className = "yt-placeholder__thumb";
      img.alt = options.thumbnailAlt || "Video thumbnail";
      img.loading = "lazy";
      img.decoding = "async";
      img.setAttribute("data-src", thumbnailUrl);
      button.dataset.ytThumbSrc = thumbnailUrl;
      button.appendChild(img);
    }
    const overlay = document.createElement("span");
    overlay.className = "yt-placeholder__overlay";
    const icon = document.createElement("span");
    icon.className = "yt-placeholder__icon";
    icon.setAttribute("aria-hidden", "true");
    overlay.appendChild(icon);
    const label = document.createElement("span");
    label.className = "yt-placeholder__label";
    label.textContent = "\u0645\u0634\u0627\u0647\u062F\u0629 \u0641\u064A\u062F\u064A\u0648 \u0627\u0644\u0645\u0646\u062A\u062C";
    overlay.appendChild(label);
    button.appendChild(overlay);
    return button;
  }
  var thumbnailObserver = null;
  function loadThumbnail(button) {
    const img = button.querySelector(".yt-placeholder__thumb");
    if (!img) return;
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.removeAttribute("data-src");
      button.dataset.thumbLoaded = "true";
    }
  }
  function ensureThumbnailObserver() {
    if (thumbnailObserver || typeof IntersectionObserver === "undefined") return;
    thumbnailObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadThumbnail(entry.target);
          thumbnailObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "200px 0px" });
  }
  function initPlaceholderThumbnail(button) {
    const img = button.querySelector(".yt-placeholder__thumb");
    if (!img) return;
    if (button.dataset.thumbLoaded === "true") return;
    if (!img.dataset.src) {
      button.dataset.thumbLoaded = "true";
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      loadThumbnail(button);
      return;
    }
    ensureThumbnailObserver();
    thumbnailObserver.observe(button);
  }
  function sanitizeFragment(fragment) {
    if (!fragment) return;
    debug("Sanitizing fragment", fragment);
    const iframes = fragment.querySelectorAll("iframe");
    const embeds = fragment.querySelectorAll("embed");
    const objects = fragment.querySelectorAll("object");
    const elements = [...iframes, ...embeds, ...objects];
    elements.forEach((element) => {
      const src = element.src || element.data || element.getAttribute("src") || element.getAttribute("data");
      if (src && YOUTUBE_REGEX.test(src)) {
        const videoId = extractVideoId(src);
        const videoUrl = normalizeYoutubeUrl(src);
        const customThumbnail = element.getAttribute("data-yt-thumb") || element.dataset?.ytThumb;
        debug("Replacing YouTube embed with placeholder", { videoUrl, element });
        const placeholder = createPlaceholderButton(videoUrl, { videoId, thumbnailUrl: customThumbnail });
        if (element.width) placeholder.style.width = element.width;
        if (element.height) placeholder.style.height = element.height;
        if (element.style.width) placeholder.style.width = element.style.width;
        if (element.style.height) placeholder.style.height = element.style.height;
        element.parentNode.replaceChild(placeholder, element);
      }
    });
  }
  function sanitizeHtmlString(html) {
    if (!html || typeof html !== "string") return html;
    debug("Sanitizing HTML string");
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    sanitizeFragment(doc.body);
    return doc.body.innerHTML;
  }
  function handlePlaceholderClick(event) {
    const button = event.currentTarget;
    const storedUrl = button.getAttribute("data-yt-src");
    const baseUrl = normalizeYoutubeUrl(storedUrl);
    if (!baseUrl) return;
    debug("Placeholder clicked, loading iframe", { videoUrl: baseUrl });
    const iframe = document.createElement("iframe");
    const autoplayUrl = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}autoplay=1&rel=0`;
    iframe.src = autoplayUrl;
    iframe.width = button.style.width || "100%";
    iframe.height = button.style.height || "100%";
    iframe.title = "YouTube video";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.style.aspectRatio = "16/9";
    iframe.dataset.ytOptIn = "true";
    button.parentNode.replaceChild(iframe, button);
    iframe.focus();
  }
  function initYouTubeOptIn(root = document) {
    debug("Initializing YouTube opt-in on root", root === document ? "document" : root);
    const templateHosts = root.querySelectorAll("[data-yt-template]");
    templateHosts.forEach((host) => {
      if (host.hasAttribute("data-yt-processed")) return;
      host.setAttribute("data-yt-processed", "true");
      debug("Processing template host", host);
      const templateId = host.getAttribute("data-yt-template");
      const template = document.getElementById(templateId);
      if (!template) return;
      debug("Found template for host", templateId);
      const fragment = template.content.cloneNode(true);
      sanitizeFragment(fragment);
      host.appendChild(fragment);
    });
    const standalonePlaceholders = root.querySelectorAll(".yt-placeholder[data-yt-src]");
    standalonePlaceholders.forEach((placeholder) => {
      if (placeholder.querySelector(".yt-placeholder__icon")) return;
      if (placeholder.tagName === "DIV") {
        debug("Upgrading static placeholder div to button", placeholder);
        const videoUrl = placeholder.getAttribute("data-yt-src");
        const customThumbnail = placeholder.getAttribute("data-yt-thumb") || placeholder.dataset?.ytThumb;
        const button = createPlaceholderButton(videoUrl, { thumbnailUrl: customThumbnail });
        button.className = placeholder.className;
        Array.from(placeholder.attributes).forEach((attr) => {
          if (["class", "data-yt-src", "data-yt-thumb"].includes(attr.name)) return;
          button.setAttribute(attr.name, attr.value);
        });
        if (customThumbnail) {
          button.setAttribute("data-yt-thumb", customThumbnail);
        }
        placeholder.parentNode.replaceChild(button, placeholder);
      }
    });
    const allPlaceholders = root.querySelectorAll("button.yt-placeholder[data-yt-src]");
    allPlaceholders.forEach((placeholder) => {
      if (!placeholder.hasAttribute("data-click-bound")) {
        placeholder.addEventListener("click", handlePlaceholderClick);
        placeholder.setAttribute("data-click-bound", "true");
        debug("Bound click handler to placeholder", placeholder);
      }
      initPlaceholderThumbnail(placeholder);
    });
  }
  function setupDynamicHandlers() {
    debug("Setting up dynamic handlers");
    if (window.salla && window.salla.event) {
      window.salla.event.on("salla-products-slider::products.fetched", (payload) => {
        debug("Event: salla-products-slider::products.fetched", payload);
        initYouTubeOptIn(payload?.container || document);
      });
      window.salla.event.on("product::quickview.opened", (payload) => {
        debug("Event: product::quickview.opened", payload);
        initYouTubeOptIn(document);
      });
      window.salla.event.on("product::quickview.response", (payload) => {
        debug("Event: product::quickview.response", payload);
        if (payload && payload.response && payload.response.html) {
          debug("Sanitizing quickview HTML response before render");
          payload.response.html = sanitizeHtmlString(payload.response.html);
        }
        initYouTubeOptIn(document);
      });
    }
    const readMoreBtn = document.getElementById("btn-show-more");
    if (readMoreBtn) {
      readMoreBtn.addEventListener("click", () => {
        debug("Read more button clicked");
        const moreContent = document.getElementById("more-content");
        if (moreContent) {
          initYouTubeOptIn(moreContent);
        }
      });
    }
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        debug("Mutation observed", mutation);
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains("product-description-content")) {
            debug("New product-description-content detected, initializing", node);
            initYouTubeOptIn(node);
          }
          const strayIframes = [];
          if (node.tagName === "IFRAME") {
            strayIframes.push(node);
          } else if (node.querySelectorAll) {
            strayIframes.push(...node.querySelectorAll("iframe"));
          }
          strayIframes.forEach((iframe) => {
            if (iframe.dataset && iframe.dataset.ytOptIn === "true") {
              debug("Observed opt-in iframe, skipping neutralization", iframe);
              return;
            }
            const src = iframe.src || iframe.getAttribute("src");
            if (src && YOUTUBE_REGEX.test(src)) {
              debug("Stray iframe detected, neutralizing", iframe);
              iframe.removeAttribute("src");
              iframe.removeAttribute("srcdoc");
              iframe.src = "about:blank";
              const videoUrl = normalizeYoutubeUrl(src);
              const placeholder = createPlaceholderButton(videoUrl);
              placeholder.addEventListener("click", handlePlaceholderClick);
              placeholder.setAttribute("data-click-bound", "true");
              debug("Replacing stray iframe with placeholder", { videoUrl, iframe });
              iframe.parentNode.replaceChild(placeholder, iframe);
              initPlaceholderThumbnail(placeholder);
            }
          });
        });
      });
    });
    const containers = document.querySelectorAll(".product-description-content");
    containers.forEach((container) => {
      observer.observe(container, { childList: true, subtree: true });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  function scanAndReplaceExistingIframes() {
    debug("Scanning for existing YouTube iframes");
    const allIframes = document.querySelectorAll("iframe");
    let replacedCount = 0;
    allIframes.forEach((iframe) => {
      const src = iframe.src || iframe.getAttribute("src");
      if (src && YOUTUBE_REGEX.test(src)) {
        if (iframe.dataset.ytOptIn === "true" || iframe.hasAttribute("data-yt-processed")) {
          return;
        }
        debug("Found existing YouTube iframe, replacing", { src, iframe });
        iframe.src = "about:blank";
        const videoUrl = normalizeYoutubeUrl(src);
        const placeholder = createPlaceholderButton(videoUrl);
        if (iframe.width) placeholder.style.width = iframe.width;
        if (iframe.height) placeholder.style.height = iframe.height;
        if (iframe.style.width) placeholder.style.width = iframe.style.width;
        if (iframe.style.height) placeholder.style.height = iframe.style.height;
        placeholder.addEventListener("click", handlePlaceholderClick);
        placeholder.setAttribute("data-click-bound", "true");
        iframe.parentNode.replaceChild(placeholder, iframe);
        initPlaceholderThumbnail(placeholder);
        replacedCount++;
      }
    });
    debug(`Replaced ${replacedCount} existing YouTube iframes`);
  }
  function init() {
    debug("Initializing module");
    injectYoutubePlaceholderStyles();
    initYouTubeOptIn();
    scanAndReplaceExistingIframes();
    setupDynamicHandlers();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.darlenaYoutubeOptIn = initYouTubeOptIn;

  // partials/product-card-enhancer.js
  var injectProductSliderStyles = () => {
    if (document.getElementById("product-slider-styles")) return;
    const style = document.createElement("style");
    style.id = "product-slider-styles";
    style.textContent = `
    .product-slider-dots {
      position: absolute;
      bottom: 10px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 6px;
      z-index: 50;
    }
    .product-slider-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    .product-slider-dot.active {
      background: white;
      width: 12px;
      border-radius: 4px;
    }
    .product-slider-image {
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      z-index: 5;
      display: block;
      line-height: 0;
    }
    .product-slider-image.active {
      opacity: 1;
      visibility: visible;
      z-index: 10;
    }
    .s-product-card-image {
      position: relative !important;
      overflow: visible;
    }
    .s-product-card-image > a {
      position: relative !important;
      display: block;
      line-height: 0;
    }
    .s-product-card-image img {
      display: block;
      line-height: 0;
    }
    .swipe-indicator {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%);
      opacity: 0;
      z-index: 15;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    .swipe-indicator.right {
      background: linear-gradient(270deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%);
    }
  `;
    document.head.appendChild(style);
  };
  var ProductCardEnhancer = class {
    constructor() {
      this.enhancedCards = /* @__PURE__ */ new Set();
      this.cardInstances = /* @__PURE__ */ new Map();
      this.init();
    }
    init() {
      injectProductSliderStyles();
      if (window.app?.status === "ready") {
        this.setupEventListeners();
        this.enhanceExistingCards();
      } else {
        document.addEventListener("theme::ready", () => {
          this.setupEventListeners();
          this.enhanceExistingCards();
        });
      }
    }
    setupEventListeners() {
      document.addEventListener("salla-products-slider::products.fetched", (e) => {
        console.log("[Product Card Enhancer] Products slider fetched");
        setTimeout(() => this.enhanceExistingCards(), 100);
      });
      document.addEventListener("salla-products-list::products.fetched", (e) => {
        console.log("[Product Card Enhancer] Products list fetched");
        setTimeout(() => this.enhanceExistingCards(), 100);
      });
      document.addEventListener("salla::page::changed", () => {
        console.log("[Product Card Enhancer] Page changed");
        setTimeout(() => this.enhanceExistingCards(), 500);
      });
      this.setupMutationObserver();
    }
    setupMutationObserver() {
      const observer = new MutationObserver((mutations) => {
        let hasNewCards = false;
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === 1) {
                if (node.classList?.contains("s-product-card-entry") || node.querySelector?.(".s-product-card-entry")) {
                  hasNewCards = true;
                  break;
                }
              }
            }
          }
          if (hasNewCards) break;
        }
        if (hasNewCards) {
          setTimeout(() => this.enhanceExistingCards(), 50);
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    enhanceExistingCards() {
      const cards = document.querySelectorAll(".s-product-card-entry");
      console.log(`[Product Card Enhancer] Found ${cards.length} product cards`);
      cards.forEach((card) => {
        const productId = this.extractProductId(card);
        if (productId && !this.enhancedCards.has(productId)) {
          this.enhanceCard(card, productId);
        }
      });
    }
    extractProductId(card) {
      if (card.dataset.id) {
        return card.dataset.id;
      }
      if (card.id && !isNaN(card.id)) {
        return card.id;
      }
      const link = card.querySelector(".s-product-card-image a, .s-product-card-content-title a");
      if (link?.href) {
        const match = link.href.match(/\/product\/[^\/]+\/(\d+)/);
        if (match) return match[1];
      }
      const productAttr = card.getAttribute("product");
      if (productAttr) {
        try {
          const product = JSON.parse(productAttr);
          if (product.id) return String(product.id);
        } catch (e) {
        }
      }
      return null;
    }
    enhanceCard(card, productId) {
      console.log(`[Product Card Enhancer] Enhancing card for product ${productId}`);
      const imageWrapper = card.querySelector(".s-product-card-image");
      if (!imageWrapper) {
        console.warn(`[Product Card Enhancer] No image wrapper found for product ${productId}`);
        return;
      }
      const instance = new CardSliderInstance(card, productId, imageWrapper);
      this.cardInstances.set(productId, instance);
      this.enhancedCards.add(productId);
      instance.setupLazyInit();
    }
  };
  var CardSliderInstance = class {
    constructor(card, productId, imageWrapper) {
      this.card = card;
      this.productId = productId;
      this.imageWrapper = imageWrapper;
      this.imageContainer = imageWrapper.querySelector("a");
      this.currentSlide = 0;
      this.additionalImages = [];
      this.touchStartX = 0;
      this.touchEndX = 0;
      this.isSwiping = false;
      this.isMouseDown = false;
      this.sliderInitialized = false;
      this.sliderId = `slider-${productId}-${Date.now()}`;
      this.boundEventHandlers = {};
    }
    setupLazyInit() {
      if (!this.imageWrapper) return;
      this._observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.sliderInitialized) {
            this.sliderInitialized = true;
            this.setupImageSlider();
            setTimeout(() => {
              this.fetchProductImages();
            }, 50);
            this._observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: "300px",
        threshold: 0.01
      });
      this._observer.observe(this.imageWrapper);
    }
    setupImageSlider() {
      if (!this.imageContainer) return;
      const swipeIndicator = document.createElement("div");
      swipeIndicator.className = "swipe-indicator";
      this.imageContainer.appendChild(swipeIndicator);
      let startX = null;
      let startY = null;
      let startTime = null;
      let hasMoved = false;
      this.boundEventHandlers.touchstart = (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
        hasMoved = false;
      };
      this.boundEventHandlers.touchmove = (e) => {
        if (!startX) return;
        const moveX = e.touches[0].clientX - startX;
        const moveY = e.touches[0].clientY - startY;
        if (Math.abs(moveX) > Math.abs(moveY) && Math.abs(moveX) > 10) {
          hasMoved = true;
          this.isSwiping = true;
          swipeIndicator.classList.toggle("right", moveX > 0);
          swipeIndicator.style.opacity = Math.min(Math.abs(moveX) / 100, 0.5);
          e.preventDefault();
        }
      };
      this.boundEventHandlers.touchend = (e) => {
        if (!startX || !hasMoved) {
          startX = startY = null;
          this.isSwiping = false;
          swipeIndicator.style.opacity = 0;
          return;
        }
        if (this.isSwiping) {
          const endX = e.changedTouches[0].clientX;
          const moveX = endX - startX;
          const elapsedTime = Date.now() - startTime;
          const minSwipeDistance = elapsedTime < 300 ? 30 : 50;
          if (Math.abs(moveX) >= minSwipeDistance) {
            if (moveX > 0) {
              this.prevSlide();
              this.triggerHapticFeedback("medium");
            } else {
              this.nextSlide();
              this.triggerHapticFeedback("medium");
            }
          }
          e.preventDefault();
          e.stopPropagation();
        }
        swipeIndicator.style.opacity = 0;
        startX = startY = null;
        this.isSwiping = false;
      };
      this.imageContainer.addEventListener("touchstart", this.boundEventHandlers.touchstart, { passive: true });
      this.imageContainer.addEventListener("touchmove", this.boundEventHandlers.touchmove, { passive: false });
      this.imageContainer.addEventListener("touchend", this.boundEventHandlers.touchend, { passive: false });
      this.boundEventHandlers.mousedown = (e) => {
        this.isMouseDown = true;
        startX = e.clientX;
        startY = e.clientY;
        startTime = Date.now();
        hasMoved = false;
        e.preventDefault();
        e.stopPropagation();
      };
      this.boundEventHandlers.mousemove = (e) => {
        if (!this.isMouseDown || !startX) return;
        const moveX = e.clientX - startX;
        if (Math.abs(moveX) > 10) {
          hasMoved = true;
          this.isSwiping = true;
          swipeIndicator.classList.toggle("right", moveX > 0);
          swipeIndicator.style.opacity = Math.min(Math.abs(moveX) / 100, 0.5);
        }
        if (this.isSwiping) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      this.boundEventHandlers.mouseup = (e) => {
        if (!this.isMouseDown) return;
        if (hasMoved && this.isSwiping) {
          const endX = e.clientX;
          const moveX = endX - startX;
          const elapsedTime = Date.now() - startTime;
          const minSwipeDistance = elapsedTime < 300 ? 30 : 50;
          if (Math.abs(moveX) >= minSwipeDistance) {
            if (moveX > 0) {
              this.prevSlide();
            } else {
              this.nextSlide();
            }
          }
          e.preventDefault();
          e.stopPropagation();
        }
        swipeIndicator.style.opacity = 0;
        this.isMouseDown = false;
        this.isSwiping = false;
        startX = startY = null;
      };
      this.imageContainer.addEventListener("mousedown", this.boundEventHandlers.mousedown);
      this.imageContainer.addEventListener("mousemove", this.boundEventHandlers.mousemove);
      window.addEventListener("mouseup", this.boundEventHandlers.mouseup);
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "product-slider-dots";
      dotsContainer.dataset.sliderId = this.sliderId;
      dotsContainer.dataset.productId = this.productId;
      const firstDot = document.createElement("span");
      firstDot.className = "product-slider-dot active";
      firstDot.dataset.sliderId = this.sliderId;
      firstDot.dataset.productId = this.productId;
      firstDot.dataset.index = "0";
      firstDot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.changeSlide(0);
        this.triggerHapticFeedback("light");
      });
      dotsContainer.appendChild(firstDot);
      for (let i = 0; i < 2; i++) {
        const dot = document.createElement("span");
        dot.className = "product-slider-dot";
        dot.dataset.sliderId = this.sliderId;
        dot.dataset.productId = this.productId;
        dot.dataset.index = String(i + 1);
        dot.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.changeSlide(i + 1);
          this.triggerHapticFeedback("light");
        });
        dotsContainer.appendChild(dot);
      }
      this.imageWrapper.appendChild(dotsContainer);
    }
    fetchProductImages() {
      if (!this.productId) return;
      const requestUrl = `https://productstoredis-163858290861.me-central2.run.app/product-images/${this.productId}`;
      fetch(requestUrl, { timeout: 5e3 }).then((response) => response.json()).then((data) => this.processImageResponse(data)).catch((error) => {
        console.warn(`[Product Card Enhancer] Failed to fetch images for product ${this.productId}:`, error);
        const dotsContainer = this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);
        if (dotsContainer) {
          dotsContainer.style.display = "none";
        }
      });
    }
    processImageResponse(data) {
      if (!data?.images || !Array.isArray(data.images)) {
        const dotsContainer2 = this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);
        if (dotsContainer2) {
          dotsContainer2.style.display = "none";
        }
        return;
      }
      const additionalImages = data.images.filter((img) => img && img.url).sort((a, b) => (a.sort || 0) - (b.sort || 0)).slice(0, 2).map((img) => ({ url: img.url, alt: img.alt }));
      if (additionalImages.length === 0) {
        const dotsContainer2 = this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);
        if (dotsContainer2) {
          dotsContainer2.style.display = "none";
        }
        return;
      }
      this.additionalImages = additionalImages;
      const dotsContainer = this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);
      if (dotsContainer) {
        dotsContainer.style.display = "flex";
      }
      this.preloadAllImages();
    }
    preloadAllImages() {
      if (this.additionalImages && this.additionalImages.length > 0) {
        this.addImageToSlider(this.additionalImages[0], 1);
        if (this.additionalImages.length > 1) {
          this.addImageToSlider(this.additionalImages[1], 2);
        }
      }
    }
    addImageToSlider(image, index) {
      if (!image?.url || !this.imageContainer) return;
      const existingImg = this.imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${index}"]`);
      if (existingImg) return;
      const img = document.createElement("img");
      img.className = "product-slider-image";
      img.src = image.url;
      img.alt = image.alt || "Product image";
      img.dataset.sliderId = this.sliderId;
      img.dataset.productId = this.productId;
      img.dataset.index = String(index);
      img.onload = () => {
        const dot = this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${index}"]`);
        if (dot) dot.classList.add("loaded");
      };
      img.onerror = () => {
        img.remove();
        const dot = this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${index}"]`);
        if (dot) {
          dot.remove();
          this.checkDotsVisibility();
        }
      };
      this.imageContainer.appendChild(img);
    }
    checkDotsVisibility() {
      const dotsContainer = this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);
      if (dotsContainer) {
        const availableDots = dotsContainer.querySelectorAll(".product-slider-dot");
        dotsContainer.style.display = availableDots.length <= 1 ? "none" : "flex";
      }
    }
    changeSlide(index) {
      if (this.additionalImages && index > 0 && this.additionalImages[index - 1]) {
        this.addImageToSlider(this.additionalImages[index - 1], index);
      }
      this.currentSlide = index;
      const mainImage = this.imageContainer.querySelector('img.lazy, img[loading="lazy"], img:first-child:not(.product-slider-image)');
      const additionalImages = this.imageContainer.querySelectorAll(`.product-slider-image[data-slider-id="${this.sliderId}"]`);
      const dots = this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`);
      dots.forEach((dot) => dot.classList.remove("active"));
      const activeDot = this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${index}"]`);
      if (activeDot) activeDot.classList.add("active");
      if (index === 0) {
        if (mainImage) {
          mainImage.style.visibility = "visible";
          mainImage.style.opacity = "1";
          mainImage.style.zIndex = "10";
        }
        additionalImages.forEach((img) => img.classList.remove("active"));
      } else {
        if (mainImage) {
          mainImage.style.visibility = "hidden";
          mainImage.style.opacity = "0";
          mainImage.style.zIndex = "5";
        }
        additionalImages.forEach((img) => img.classList.remove("active"));
        const activeImage = this.imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${index}"]`);
        if (activeImage) {
          activeImage.classList.add("active");
        } else if (mainImage) {
          mainImage.style.visibility = "visible";
          mainImage.style.opacity = "1";
          mainImage.style.zIndex = "10";
        }
      }
    }
    prevSlide() {
      const totalSlides = this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length;
      const newIndex = (this.currentSlide - 1 + totalSlides) % totalSlides;
      this.changeSlide(newIndex);
    }
    nextSlide() {
      const totalSlides = this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length;
      const newIndex = (this.currentSlide + 1) % totalSlides;
      this.changeSlide(newIndex);
    }
    triggerHapticFeedback(intensity) {
      try {
        if (window.navigator && window.navigator.vibrate) {
          switch (intensity) {
            case "light":
              window.navigator.vibrate(10);
              break;
            case "medium":
              window.navigator.vibrate(25);
              break;
            case "strong":
              window.navigator.vibrate([10, 20, 30]);
              break;
          }
        }
      } catch (e) {
      }
    }
  };
  var productCardEnhancer = new ProductCardEnhancer();

  // index.js
  window.productRecommendations = product_recommendations_default;
  window.redisService = redisService;
  var onReady = (fn) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();
  function runHomepageInjection() {
    if (!document.body.classList.contains("index")) {
      console.log("[Algolia Bundle] Not on homepage, skipping category products injection");
      return;
    }
    const ANCHOR_SELECTOR = ".app-inner";
    const ELEMENT_TAG = "mahaba-category-products";
    function injectElement() {
      const anchor = document.querySelector(ANCHOR_SELECTOR);
      if (anchor && !anchor.querySelector(ELEMENT_TAG)) {
        try {
          console.log(`[Algolia Bundle] Found ${ANCHOR_SELECTOR}, injecting ${ELEMENT_TAG}...`);
          const newElement = document.createElement(ELEMENT_TAG);
          const footer = document.querySelector(".store-footer");
          if (footer) {
            anchor.insertBefore(newElement, footer);
          } else {
            anchor.appendChild(newElement);
          }
          console.log("\u2705 [Algolia Bundle] Homepage category component injected successfully");
          return true;
        } catch (e) {
          console.error("[Algolia Bundle] Error during injection:", e);
          return true;
        }
      }
      return false;
    }
    if (injectElement()) {
      return;
    }
    console.log(`[Algolia Bundle] ${ANCHOR_SELECTOR} not found, waiting for async load...`);
    const observer = new MutationObserver((mutations, obs) => {
      const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
      if (hasAddedNodes && injectElement()) {
        obs.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  function injectCartAddonsStyles() {
    if (document.getElementById("cart-addons-slider-styles")) return;
    const style = document.createElement("style");
    style.id = "cart-addons-slider-styles";
    style.textContent = `
    cart-addons-slider.cart-addons-wrapper {
      position: relative;
      margin-top: 1rem;
      overflow: hidden;
      border-radius: 0.5rem;
      border: 1px solid rgba(229, 231, 235, 1);
      background-color: #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      display: block;
    }
    cart-addons-slider .cart-addons-title {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      background-color: #f9fafb;
      color: #111827;
      border-bottom: 1px solid rgba(229, 231, 235, 1);
    }
    cart-addons-slider salla-products-list {
      opacity: 1;
      transition: opacity 0.3s ease-in-out;
      display: block;
    }
    cart-addons-slider .s-products-list-wrapper {
      display: flex !important;
      gap: 0.5rem;
      overflow-x: auto;
      padding: 0.75rem 1rem 0.5rem;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    cart-addons-slider .s-products-list-wrapper::-webkit-scrollbar {
      display: none;
    }
    cart-addons-slider .s-product-card-entry {
      flex: none;
      width: 160px;
      scroll-snap-align: start;
      opacity: 1 !important;
      visibility: visible !important;
    }
    cart-addons-slider .s-product-card-image {
      position: relative;
      aspect-ratio: 2 / 3;
      height: auto !important;
    }
    cart-addons-slider .s-product-card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 1 !important;
    }
    cart-addons-slider .s-product-card-content {
      padding: 0.25rem;
    }
    cart-addons-slider .s-product-card-content .s-product-card-content-title {
      margin-bottom: 0.125rem;
      font-size: 0.75rem;
      line-height: 1rem;
    }
    cart-addons-slider .s-product-card-content .s-product-card-content-title a {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    cart-addons-slider .s-product-card-content .s-product-card-content-sub {
      font-size: 0.75rem;
      line-height: 1rem;
      gap: 0.125rem;
    }
    cart-addons-slider .s-product-card-content .s-product-card-sale-price h4,
    cart-addons-slider .s-product-card-content .s-product-card-sale-price span {
      font-size: 0.75rem;
      line-height: 1rem;
    }
    cart-addons-slider .s-product-card-content .s-product-card-content-footer {
      margin-top: 0.125rem;
    }
    cart-addons-slider .s-product-card-content .s-product-card-content-footer salla-button {
      transform: scale(0.75);
      margin-left: -0.75rem;
      margin-right: -0.75rem;
    }
    cart-addons-slider .touch-indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 2.5rem;
      height: 0.25rem;
      background-color: rgba(229, 231, 235, 1);
      opacity: 0.6;
      border-radius: 9999px;
      transform: translateX(-50%);
      margin-bottom: 0.25rem;
    }
    @media (min-width: 768px) {
      cart-addons-slider .touch-indicator {
        display: none;
      }
    }
  `;
    document.head.appendChild(style);
  }
  function runCartAddonsInjection() {
    injectCartAddonsStyles();
    const ensure = () => {
      const submitButton = document.querySelector("#cart-submit");
      if (!submitButton) return false;
      const submitWrap = submitButton.closest(".cart-submit-wrap") || submitButton.parentElement;
      const parent = submitWrap?.parentElement || submitWrap;
      if (!parent) return false;
      if (parent.querySelector("cart-addons-slider")) {
        return true;
      }
      const slider = document.createElement("cart-addons-slider");
      slider.className = "cart-addons-wrapper";
      if (submitWrap && parent) {
        parent.insertBefore(slider, submitWrap.nextSibling);
      } else {
        parent.appendChild(slider);
      }
      console.log("[Algolia Bundle] Injected cart addons slider");
      return true;
    };
    if (document.querySelector("cart-addons-slider")) return;
    if (ensure()) return;
    const observer = new MutationObserver((mutations, obs) => {
      if (ensure()) {
        obs.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  onReady(() => {
    runHomepageInjection();
    const isProductPage = document.querySelector('[id^="product-"]');
    if (isProductPage) {
      setTimeout(() => {
        product_recommendations_default.initialize();
        console.log("\u2705 [Algolia Bundle] Product recommendations initialized");
      }, 3e3);
    }
    if (document.querySelector('form[id^="item-"]') || document.querySelector("#cart-submit")) {
      setTimeout(runCartAddonsInjection, 500);
    }
    console.log("\u2705 [Algolia Bundle] Loaded successfully");
  });
  document.addEventListener("salla::page::changed", () => {
    product_recommendations_default.reset();
    setTimeout(() => {
      product_recommendations_default.initialize();
    }, 1e3);
    setTimeout(runCartAddonsInjection, 500);
  });
  document.addEventListener("theme::ready", () => {
    if (!document.querySelector('[id^="product-"]')) return;
    const currentProductId = product_recommendations_default.getProductId();
    if (currentProductId && product_recommendations_default.productId && currentProductId === product_recommendations_default.productId) {
      return;
    }
    if (currentProductId) {
      console.log("[Algolia Bundle] New product detected via theme::ready, re-initializing");
      product_recommendations_default.reset();
      setTimeout(() => {
        product_recommendations_default.initialize();
      }, 1e3);
    }
  });
})();
