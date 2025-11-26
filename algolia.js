(() => {
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
      this.cartListenerBound = false;
      this.reloadScheduled = false;
      this.reloadTimer = null;
    }
    /**
     * Check if we're on the cart page
     */
    isCartPage() {
      return window.location.pathname.includes("/cart") && document.querySelector('form[id^="item-"]') !== null;
    }
    /**
     * Debounced page reload after cart item added
     */
    scheduleReload() {
      if (!this.isCartPage()) return;
      if (this.reloadScheduled) return;
      this.reloadScheduled = true;
      if (this.reloadTimer) {
        clearTimeout(this.reloadTimer);
      }
      this.reloadTimer = setTimeout(() => {
        console.log("[CartAddonsSlider] Reloading cart page to show added item");
        window.location.reload();
      }, 1e3);
    }
    /**
     * Setup listeners for cart add success events
     * Only activates on cart page
     */
    setupCartRefreshListener() {
      if (this.cartListenerBound) return;
      if (!this.isCartPage()) return;
      this.cartListenerBound = true;
      const handler = () => this.scheduleReload();
      if (window.salla?.cart?.event?.onItemAdded) {
        window.salla.cart.event.onItemAdded(() => this.scheduleReload());
        console.log("[CartAddonsSlider] Listening to salla.cart.event.onItemAdded()");
      }
      document.addEventListener("salla::cart::item.added", handler);
      console.log("[CartAddonsSlider] Listening to salla::cart::item.added");
    }
    connectedCallback() {
      this.ensureStructure();
      this.setupCartRefreshListener();
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
      const titleText = this.getTitleText();
      const existingTitle = this.querySelector(".cart-addons-title");
      if (existingTitle) {
        existingTitle.textContent = titleText;
      } else {
        const title = document.createElement("h3");
        title.className = "cart-addons-title";
        title.textContent = titleText;
        this.appendChild(title);
      }
      if (!this.querySelector(".frequently-bought-container")) {
        const container = document.createElement("div");
        container.className = "frequently-bought-container";
        this.appendChild(container);
      }
      this.structureReady = true;
    }
    getTitleText() {
      const translationKey = "pages.cart.frequently_bought_together";
      const localizedTitle = window.salla?.lang?.get?.(translationKey);
      const cleanedLocalizedTitle = typeof localizedTitle === "string" && localizedTitle !== translationKey ? localizedTitle.trim() : "";
      if (cleanedLocalizedTitle) {
        return cleanedLocalizedTitle;
      }
      const language = (document.documentElement.getAttribute("lang") || "").toLowerCase().slice(0, 2);
      const fallbackTitles = {
        ar: "\u0645\u062A\u062C\u0627\u062A \u0642\u062F \u062A\u0639\u062C\u0628\u0643",
        en: "Frequently Bought Together"
      };
      return fallbackTitles[language] || fallbackTitles.en;
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
  }

  // components/AlgoliaRecommendationsSlider.js
  var AlgoliaRecommendationsSlider = class extends HTMLElement {
    constructor() {
      super();
      this.swiper = null;
      this.productIds = [];
      this.initialized = false;
    }
    /**
     * Initialize the slider with product IDs from Algolia
     * @param {Array<number>} productIds - Array of product IDs in exact Algolia order
     * @param {Object} config - Configuration options
     */
    async initialize(productIds, config = {}) {
      if (this.initialized) {
        console.warn("[AlgoliaSlider] Already initialized");
        return;
      }
      this.productIds = productIds.slice(0, 21);
      const {
        title = "\u0645\u0646\u062A\u062C\u0627\u062A \u0642\u062F \u062A\u0639\u062C\u0628\u0643",
        displayAllUrl = "",
        filterStock = true,
        maxInStock = 15
      } = config;
      this.innerHTML = `
            <div class="algolia-slider-wrapper s-products-slider-wrapper">
                <div class="algolia-slider-header s-slider-block__title">
                    <div class="s-slider-block__title-right">
                        <h2>${title}</h2>
                    </div>
                    <div class="s-slider-block__title-left">
                        <div class="s-slider-block__title-nav" dir="rtl">
                            <button
                                aria-label="Previous slide"
                                class="algolia-slider-prev s-slider-prev s-slider-nav-arrow swiper-button-disabled"
                                type="button"
                                disabled>
                                <span class="s-slider-button-icon">
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                        <title>keyboard_arrow_right</title>
                                        <path d="M11.438 22.479l6.125-6.125-6.125-6.125 1.875-1.875 8 8-8 8z"></path>
                                    </svg>
                                </span>
                            </button>
                            <button
                                aria-label="Next slide"
                                class="algolia-slider-next s-slider-next s-slider-nav-arrow"
                                type="button">
                                <span class="s-slider-button-icon">
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                        <title>keyboard_arrow_left</title>
                                        <path d="M20.563 22.104l-1.875 1.875-8-8 8-8 1.875 1.875-6.125 6.125z"></path>
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="algolia-slider-container swiper swiper-rtl" dir="rtl">
                    <div class="swiper-wrapper algolia-slider-products">
                        <!-- Products will be inserted here -->
                    </div>
                </div>
            </div>
        `;
      this.injectStyles();
      await this.renderProducts(filterStock, maxInStock);
      this.initialized = true;
    }
    /**
     * Use salla-products-list to fetch and render products
     */
    async renderProducts(filterStock, maxInStock) {
      const wrapper = this.querySelector(".swiper-wrapper");
      if (!wrapper) {
        console.error("[AlgoliaSlider] Swiper wrapper not found");
        return;
      }
      const productsList = document.createElement("salla-products-list");
      productsList.setAttribute("source", "selected");
      productsList.setAttribute("source-value", JSON.stringify(this.productIds));
      productsList.setAttribute("limit", this.productIds.length.toString());
      productsList.setAttribute("display-all-url", "");
      productsList.className = "algolia-products-source";
      const tempContainer = document.createElement("div");
      tempContainer.style.cssText = "opacity: 0; pointer-events: none; position: absolute; z-index: -1; top: 0; left: 0; width: 100%; height: 0; overflow: hidden;";
      tempContainer.className = "algolia-temp-container";
      tempContainer.appendChild(productsList);
      this.appendChild(tempContainer);
      window.salla?.event?.dispatch("twilight::mutation");
      return new Promise((resolve) => {
        const handler = (event) => {
          if (!productsList.contains(event.target)) return;
          window.salla?.event?.off("salla-products-list::products.fetched", handler);
          setTimeout(() => {
            this.moveProductsToSlider(productsList, wrapper, filterStock, maxInStock);
            tempContainer.remove();
            resolve();
          }, 150);
        };
        window.salla?.event?.on("salla-products-list::products.fetched", handler);
        setTimeout(() => {
          if (tempContainer.parentNode) {
            this.moveProductsToSlider(productsList, wrapper, filterStock, maxInStock);
            tempContainer.remove();
            resolve();
          }
        }, 3e3);
      });
    }
    /**
     * Extract product cards from salla-products-list and move to swiper
     * IMPORTANT: We MOVE nodes instead of cloning to preserve web component state
     */
    moveProductsToSlider(productsList, swiperWrapper, filterStock, maxInStock) {
      const productCards = productsList.querySelectorAll(".s-product-card-entry, custom-salla-product-card");
      if (!productCards.length) {
        console.warn("[AlgoliaSlider] No product cards found");
        return;
      }
      console.log(`[AlgoliaSlider] Found ${productCards.length} products from Salla`);
      const cardMap = /* @__PURE__ */ new Map();
      productCards.forEach((card) => {
        const productId = card.getAttribute("id") || card.id;
        if (productId) {
          const numericId = productId.replace("product-", "");
          cardMap.set(numericId.toString(), card);
        }
      });
      console.log("[AlgoliaSlider] Card map keys:", Array.from(cardMap.keys()));
      console.log("[AlgoliaSlider] Target order from Algolia:", this.productIds);
      let inStockCount = 0;
      this.productIds.forEach((productId, index) => {
        const card = cardMap.get(productId.toString());
        if (!card) {
          console.warn(`[AlgoliaSlider] Product ${productId} not found in rendered cards`);
          return;
        }
        const isOutOfStock = card.classList.contains("s-product-card-out-of-stock");
        if (filterStock && (isOutOfStock || inStockCount >= maxInStock)) {
          return;
        }
        if (!isOutOfStock) {
          inStockCount++;
        }
        const slide = document.createElement("div");
        slide.className = "s-products-slider-card swiper-slide";
        slide.appendChild(card);
        swiperWrapper.appendChild(slide);
        console.log(`[AlgoliaSlider] Added product ${productId} at position ${index}`);
      });
      console.log(`[AlgoliaSlider] Final order: ${inStockCount} in-stock products in Algolia order`);
      this.initializeSwiper();
    }
    /**
     * Initialize Swiper.js slider
     */
    initializeSwiper() {
      const swiperContainer = this.querySelector(".swiper");
      if (!swiperContainer) {
        console.error("[AlgoliaSlider] Swiper container not found");
        return;
      }
      const slides = this.querySelectorAll(".swiper-slide");
      if (!slides.length) {
        console.warn("[AlgoliaSlider] No slides to initialize");
        return;
      }
      if (typeof Swiper === "undefined") {
        console.warn("[AlgoliaSlider] Swiper not available, using CSS fallback");
        this.initializeCSSScroll();
        return;
      }
      try {
        this.swiper = new Swiper(swiperContainer, {
          slidesPerView: "auto",
          spaceBetween: 16,
          rtl: true,
          direction: "horizontal",
          navigation: {
            nextEl: ".algolia-slider-next",
            prevEl: ".algolia-slider-prev"
          },
          breakpoints: {
            320: {
              slidesPerView: 2,
              spaceBetween: 12
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 12
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 16
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 16
            }
          },
          on: {
            init: function() {
              console.log("[AlgoliaSlider] Swiper initialized successfully");
            }
          }
        });
        console.log("[AlgoliaSlider] Swiper instance created");
      } catch (error) {
        console.error("[AlgoliaSlider] Error initializing Swiper:", error);
        this.initializeCSSScroll();
      }
    }
    /**
     * Fallback CSS-based horizontal scroll if Swiper unavailable
     */
    initializeCSSScroll() {
      const wrapper = this.querySelector(".swiper-wrapper");
      if (!wrapper) return;
      wrapper.style.cssText = `
            display: flex !important;
            overflow-x: auto;
            scroll-behavior: smooth;
            gap: 1rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
        `;
      const container = this.querySelector(".swiper");
      if (container) {
        container.style.overflow = "hidden";
      }
      const prevBtn = this.querySelector(".algolia-slider-prev");
      const nextBtn = this.querySelector(".algolia-slider-next");
      if (prevBtn && nextBtn) {
        const scrollAmount = 300;
        prevBtn.addEventListener("click", () => {
          wrapper.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        });
        nextBtn.addEventListener("click", () => {
          wrapper.scrollBy({ left: scrollAmount, behavior: "smooth" });
        });
        const updateButtons = () => {
          const isAtStart = wrapper.scrollLeft <= 0;
          const isAtEnd = wrapper.scrollLeft >= wrapper.scrollWidth - wrapper.clientWidth - 10;
          prevBtn.disabled = isAtStart;
          nextBtn.disabled = isAtEnd;
          prevBtn.classList.toggle("swiper-button-disabled", isAtStart);
          nextBtn.classList.toggle("swiper-button-disabled", isAtEnd);
        };
        wrapper.addEventListener("scroll", updateButtons);
        updateButtons();
      }
      console.log("[AlgoliaSlider] CSS scroll fallback initialized");
    }
    /**
     * Inject slider styles
     */
    injectStyles() {
      if (document.getElementById("algolia-slider-styles")) return;
      const styleEl = document.createElement("style");
      styleEl.id = "algolia-slider-styles";
      styleEl.textContent = `
            /* Match Salla's slider styling exactly */
            .algolia-slider-wrapper {
                margin: 2rem 0;
                position: relative;
            }

            .algolia-slider-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.25rem;
            }

            .algolia-slider-header h2 {
                font-size: 1.25rem;
                font-weight: 700;
                margin: 0;
                color: inherit;
            }

            .s-slider-block__title-nav {
                display: flex;
                gap: 0.5rem;
                direction: rtl;
            }

            .s-slider-nav-arrow {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 1px solid #e5e7eb;
                background: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                padding: 0;
                outline: none;
            }

            .s-slider-nav-arrow:hover:not(:disabled) {
                background: #f3f4f6;
                border-color: #d1d5db;
            }

            .s-slider-nav-arrow:disabled,
            .s-slider-nav-arrow.swiper-button-disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }

            .s-slider-nav-arrow svg {
                width: 20px;
                height: 20px;
                fill: #374151;
            }

            .s-slider-button-icon {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Swiper container */
            .algolia-slider-container {
                position: relative;
                overflow: hidden;
            }

            .algolia-slider-container .swiper-wrapper {
                display: flex;
            }

            /* Swiper slide sizing - match Salla's responsive breakpoints */
            .algolia-slider-container .swiper-slide {
                width: 47% !important;
                flex-shrink: 0;
            }

            @media (min-width: 640px) {
                .algolia-slider-container .swiper-slide {
                    width: 47% !important;
                }
            }

            @media (min-width: 768px) {
                .algolia-slider-container .swiper-slide {
                    width: 31% !important;
                }
            }

            @media (min-width: 1024px) {
                .algolia-slider-container .swiper-slide {
                    width: 24% !important;
                }
            }

            /* Product card styling */
            .algolia-slider-container .s-product-card-entry,
            .algolia-slider-container custom-salla-product-card {
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            /* Recently viewed specific styling */
            .algolia-recently-viewed {
                margin-top: 2rem;
            }
        `;
      document.head.appendChild(styleEl);
      console.log("[AlgoliaSlider] Styles injected");
    }
    /**
     * Clean up when element is removed
     */
    disconnectedCallback() {
      this.destroy();
    }
    /**
     * Destroy Swiper instance
     */
    destroy() {
      if (this.swiper) {
        try {
          this.swiper.destroy(true, true);
          console.log("[AlgoliaSlider] Swiper destroyed");
        } catch (error) {
          console.error("[AlgoliaSlider] Error destroying Swiper:", error);
        }
        this.swiper = null;
      }
      this.initialized = false;
    }
  };
  if (!customElements.get("algolia-recommendations-slider")) {
    customElements.define("algolia-recommendations-slider", AlgoliaRecommendationsSlider);
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
        270965526: { name: "\u0634\u062A\u0627\u0621 2026", url: "https://darlena.com/%D8%B4%D8%AA%D8%A7%D8%A1-2026/c270965526" },
        692927841: { name: "\u0637\u0631\u062D", url: "https://darlena.com/%D8%B7%D8%B1%D8%AD/c692927841" },
        639447590: { name: "\u0646\u0642\u0627\u0628\u0627\u062A", url: "https://darlena.com/%D9%86%D9%82%D8%A7%D8%A8%D8%A7%D8%AA/c639447590" },
        114756598: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646", url: "https://darlena.com/%D8%B4%D9%8A%D9%81%D9%88%D9%86/c114756598" },
        273898307: { name: "\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u062A\u0648\u064A\u0629", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B4%D8%AA%D9%88%D9%8A%D8%A9/c273898307" }
      };
      const priorityOrder = {
        "\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646": 1,
        "\u062C\u062F\u064A\u062F\u0646\u0627": 2,
        "\u0634\u062A\u0627\u0621 2026": 3,
        "\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A": 4,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u062A\u0648\u064A\u0629": 5,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634": 6,
        "\u062C\u0644\u0627\u0628\u064A\u0627\u062A": 7,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646": 8,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629": 9,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628": 10,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A": 11,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629": 12,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633": 13,
        "\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629": 14,
        "\u0637\u0631\u062D": 15,
        "\u0646\u0642\u0627\u0628\u0627\u062A": 16
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

  // partials/video-gallery.js
  var VideoGalleryComponent = class extends HTMLElement {
    constructor() {
      super();
      this.videos = [
        { videoId: "5c674d0e8f966c603fc6d0045b713869", productId: 258399638, productName: "\u0639\u0628\u0627\u064A\u0629 \u0634\u062A\u0648\u064A\u0629 \u0645\u062E\u0645\u0644 \u0628\u062A\u0637\u0631\u064A\u0632 \u0648\u0631\u062F", productPrice: "349.60 \u0631.\u0633" },
        { videoId: "0012cc79a7fd459c9389670ba37c6b1b", productId: 823750915, productName: "\u062C\u0644\u0627\u0628\u064A\u0629 \u0634\u062A\u0648\u064A\u0629 \u0645\u062E\u0645\u0644 \u0643\u062D\u0644\u064A", productPrice: "449.65 \u0631.\u0633" },
        { videoId: "939af62bb2f7e551b14c237b02cd6493", productId: 275656778, productName: "\u0639\u0628\u0627\u064A\u0629 \u0643\u0644\u0648\u0634 \u0645\u0637\u0631\u0632\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644", productPrice: "299 \u0631.\u0633" },
        { videoId: "498113e070bbef6e76ad35058dc92071", productId: 854730525, productName: "\u0639\u0628\u0627\u064A\u0629 \u0645\u062E\u0645\u0644 \u0645\u0639 \u062F\u0627\u0646\u062A\u064A\u0644", productPrice: "299 \u0631.\u0633" },
        { videoId: "ad277fe9aae194be61f6b1b5ea5945ad", productId: 890636222, productName: "\u0639\u0628\u0627\u064A\u0629 \u0645\u062E\u0645\u0644 \u0628\u0627\u0643\u0645\u0627\u0645 \u0645\u0637\u0631\u0632\u0629", productPrice: "349.60 \u0631.\u0633" }
      ];
      this.swiper = null;
      this.observer = null;
      this.activeVideoIndex = -1;
    }
    connectedCallback() {
      this.injectStyles();
      this.render();
      this.initSwiper();
      this.setupIntersectionObserver();
      this.setupEventListeners();
      this.refreshLightbox();
    }
    disconnectedCallback() {
      this.observer?.disconnect();
      this.swiper?.destroy();
    }
    getEmbedUrl(videoId) {
      const params = new URLSearchParams({
        autoplay: "true",
        muted: "true",
        loop: "true",
        controls: "false",
        preload: "metadata",
        fit: "cover"
        // Crop to fill container, no black bars
      });
      return `https://iframe.videodelivery.net/${videoId}?${params.toString()}`;
    }
    getLightboxUrl(videoId) {
      return `https://iframe.videodelivery.net/${videoId}?autoplay=true&controls=true`;
    }
    injectStyles() {
      if (document.getElementById("mahaba-video-gallery-styles")) return;
      const style = document.createElement("style");
      style.id = "mahaba-video-gallery-styles";
      style.textContent = `
            mahaba-video-gallery {
                display: block;
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 1rem;
            }

            .video-gallery-section {
                margin-bottom: 2rem;
            }

            .video-gallery-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid rgba(212, 172, 132, 0.1);
            }

            .video-gallery-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #d4ac84;
                margin: 0;
            }

            .videos-gallery-container {
                position: relative;
            }

            .video-gallery-swiper {
                overflow: hidden;
            }

            .video-gallery-swiper .swiper-wrapper {
                display: flex;
            }

            .video-gallery-swiper .swiper-slide {
                flex-shrink: 0;
                height: auto;
            }

            /* Card container - holds video + product info stacked */
            .video-slide-card {
                display: flex;
                flex-direction: column;
                border-radius: 12px;
                overflow: hidden;
                background: #fff;
            }

            /* Video container - fixed height on mobile, aspect-ratio on tablet+ */
            .video-item {
                position: relative;
                background: #000;
                height: 280px;
                border-radius: 12px 12px 0 0;
                overflow: hidden;
            }

            .video-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
            }

            .video-wrapper iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                pointer-events: auto;  /* Enable Cloudflare native controls */
                object-fit: cover;
            }

            /* Hide custom overlay - using Cloudflare native controls instead */
            /* SCOPED to mahaba-video-gallery only - do not affect rest of page */
            mahaba-video-gallery .video-overlay,
            mahaba-video-gallery .video-controls {
                display: none !important;
            }

            /* Overlay - positioned within video-wrapper only (HIDDEN) */
            .video-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                background: rgba(0, 0, 0, 0.2);
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
            }

            .video-item:hover .video-overlay,
            .video-overlay.show {
                opacity: 1;
            }

            .video-overlay .play-button,
            .video-overlay .expand-button {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.2s ease, background 0.2s ease;
            }

            .video-overlay .play-button:hover,
            .video-overlay .expand-button:hover {
                transform: scale(1.1);
                background: #fff;
            }

            .video-overlay .play-button i,
            .video-overlay .expand-button i {
                font-size: 1.1rem;
                color: #333;
            }

            /* Controls - at bottom of video only */
            .video-controls {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 0.5rem;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
                display: flex;
                justify-content: flex-start;
                gap: 0.5rem;
                z-index: 10;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .video-item:hover .video-controls,
            .video-controls.show {
                opacity: 1;
            }

            .video-controls .control-btn {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.2s ease;
            }

            .video-controls .control-btn:hover {
                background: rgba(255, 255, 255, 0.4);
            }

            .video-controls .control-btn i {
                font-size: 0.875rem;
                color: #fff;
            }

            .video-controls .control-btn.playing .sicon-play {
                display: none;
            }

            .video-controls .control-btn.playing .sicon-pause {
                display: inline;
            }

            .video-controls .control-btn:not(.playing) .sicon-play {
                display: inline;
            }

            .video-controls .control-btn:not(.playing) .sicon-pause {
                display: none;
            }

            .video-controls .mute-btn.muted .sicon-volume-high {
                display: none;
            }

            .video-controls .mute-btn.muted .sicon-volume-mute {
                display: inline;
            }

            .video-controls .mute-btn:not(.muted) .sicon-volume-high {
                display: inline;
            }

            .video-controls .mute-btn:not(.muted) .sicon-volume-mute {
                display: none;
            }

            .video-gallery-swiper .swiper-pagination {
                position: relative;
                margin-top: 1rem;
                display: flex;
                justify-content: center;
                gap: 0.5rem;
            }

            .video-gallery-swiper .swiper-pagination-bullet {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(212, 172, 132, 0.3);
                cursor: pointer;
                transition: background 0.2s ease, transform 0.2s ease;
            }

            .video-gallery-swiper .swiper-pagination-bullet-active {
                background: #d4ac84;
                transform: scale(1.2);
            }

            /* Product Footer - Modern Minimal Design */
            .video-product-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.75rem;
                background: #ffffff;
                border-radius: 0 0 12px 12px;
                border-top: 1px solid rgba(212, 172, 132, 0.15);
                gap: 0.5rem;
                min-height: 56px;
                position: relative;
                z-index: 20;
            }

            .video-product-footer__content {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.125rem;
                min-width: 0;
                text-align: right;
            }

            .video-product-footer__title {
                font-size: 0.8125rem;
                font-weight: 600;
                color: #2d2d2d;
                line-height: 1.3;
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                transition: color 0.2s ease;
            }

            .video-product-footer__price {
                font-size: 0.75rem;
                font-weight: 500;
                color: #d4ac84;
                line-height: 1.2;
            }

            .video-product-footer__cta {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                min-width: 36px;
                background: linear-gradient(135deg, #d4ac84 0%, #c49b73 100%);
                border-radius: 8px;
                color: #ffffff;
                text-decoration: none;
                transition: all 0.25s ease;
                box-shadow: 0 2px 8px rgba(212, 172, 132, 0.25);
            }

            .video-product-footer__cta i {
                font-size: 0.875rem;
                transition: transform 0.2s ease;
            }

            .video-product-footer:hover .video-product-footer__title {
                color: #d4ac84;
            }

            .video-product-footer__cta:hover {
                background: linear-gradient(135deg, #c49b73 0%, #b38a62 100%);
                transform: translateX(-2px);
                box-shadow: 0 4px 12px rgba(212, 172, 132, 0.35);
            }

            .video-product-footer__cta:hover i {
                transform: translateX(-2px);
            }

            .video-product-footer__cta:active {
                transform: scale(0.95);
            }

            /* Card shadow enhancement */
            .video-slide-card {
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
                transition: box-shadow 0.3s ease;
            }

            .video-slide-card:hover {
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }

            /* Tablet and up - use aspect-ratio for proper 9:16 */
            @media (min-width: 768px) {
                .video-item {
                    height: auto;
                    aspect-ratio: 9 / 16;
                }
            }

            /* Responsive - smaller controls on mobile */
            @media (max-width: 767px) {
                /* Force slide width to show 2.25 videos - using viewport units */
                .video-gallery-swiper .swiper-slide {
                    width: calc((100vw - 32px) / 2.25) !important;
                    flex-shrink: 0 !important;
                }

                .video-overlay .play-button,
                .video-overlay .expand-button {
                    width: 36px;
                    height: 36px;
                }

                .video-overlay .play-button i,
                .video-overlay .expand-button i {
                    font-size: 0.9rem;
                }

                .video-controls .control-btn {
                    width: 28px;
                    height: 28px;
                }

                .video-controls .control-btn i {
                    font-size: 0.75rem;
                }

                .video-product-footer {
                    padding: 0.625rem;
                    min-height: 48px;
                }

                .video-product-footer__title {
                    font-size: 0.75rem;
                }

                .video-product-footer__price {
                    font-size: 0.6875rem;
                }

                .video-product-footer__cta {
                    width: 32px;
                    height: 32px;
                    min-width: 32px;
                    border-radius: 6px;
                }

                .video-product-footer__cta i {
                    font-size: 0.75rem;
                }
            }

            /* Small phones - even more compact */
            @media (max-width: 375px) {
                .video-gallery-swiper .swiper-slide {
                    width: calc((100vw - 32px) / 2.25) !important;
                }

                .video-item {
                    height: 250px;
                }
            }
        `;
      document.head.appendChild(style);
    }
    render() {
      const slidesHtml = this.videos.map((video, index) => `
            <div class="swiper-slide">
                <div class="video-slide-card">
                    <div class="video-item" data-video-id="${video.videoId}" data-video-index="${index}">
                        <div class="video-wrapper">
                            <iframe
                                src="${this.getEmbedUrl(video.videoId)}"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                loading="lazy"
                            ></iframe>
                            <a
                                data-fslightbox="video-gallery"
                                data-type="video"
                                href="${this.getLightboxUrl(video.videoId)}"
                                class="video-lightbox-trigger"
                                style="display: none;"
                            ></a>
                        </div>
                        <div class="video-overlay">
                            <div class="play-button" data-action="play" role="button" tabindex="0" aria-label="\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0641\u064A\u062F\u064A\u0648">
                                <i class="sicon-play" aria-hidden="true"></i>
                            </div>
                            <div class="expand-button" data-action="expand" role="button" tabindex="0" aria-label="\u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u0641\u064A\u062F\u064A\u0648">
                                <i class="sicon-expand" aria-hidden="true"></i>
                            </div>
                        </div>
                        <div class="video-controls">
                            <button class="control-btn pause-btn playing muted" data-action="toggle-play" aria-label="\u0625\u064A\u0642\u0627\u0641/\u062A\u0634\u063A\u064A\u0644">
                                <i class="sicon-play" aria-hidden="true"></i>
                                <i class="sicon-pause" aria-hidden="true"></i>
                            </button>
                            <button class="control-btn mute-btn muted" data-action="toggle-mute" aria-label="\u0643\u062A\u0645/\u0625\u0644\u063A\u0627\u0621 \u0643\u062A\u0645 \u0627\u0644\u0635\u0648\u062A">
                                <i class="sicon-volume-high" aria-hidden="true"></i>
                                <i class="sicon-volume-mute" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <!-- Product Footer - Modern minimal design -->
                    ${video.productId ? `
                        <div class="video-product-footer">
                            <div class="video-product-footer__content">
                                <h4 class="video-product-footer__title">${video.productName || "\u0645\u0646\u062A\u062C"}</h4>
                                <span class="video-product-footer__price">${video.productPrice || ""}</span>
                            </div>
                            <a href="https://darlena.com/product/p${video.productId}"
                               class="video-product-footer__cta"
                               aria-label="\u0639\u0631\u0636 \u0627\u0644\u0645\u0646\u062A\u062C: ${video.productName || "\u0645\u0646\u062A\u062C"}">
                                <i class="sicon-arrow-left" aria-hidden="true"></i>
                            </a>
                        </div>
                    ` : ""}
                </div>
            </div>
        `).join("");
      this.innerHTML = `
            <section class="video-gallery-section">
                <div class="video-gallery-header">
                    <h2 class="video-gallery-title">\u0641\u064A\u062F\u064A\u0648\u0647\u0627\u062A</h2>
                </div>
                <div class="videos-gallery-container" data-view-type="slider" data-aspect-ratio="vertical">
                    <div class="swiper video-gallery-swiper" dir="rtl">
                        <div class="swiper-wrapper">
                            ${slidesHtml}
                        </div>
                        <div class="swiper-pagination"></div>
                    </div>
                </div>
            </section>
        `;
    }
    initSwiper() {
      const swiperEl = this.querySelector(".video-gallery-swiper");
      if (!swiperEl || typeof Swiper === "undefined") {
        console.warn("[VideoGallery] Swiper not available");
        return;
      }
      this.swiper = new Swiper(swiperEl, {
        direction: "horizontal",
        slidesPerView: 2.25,
        spaceBetween: 8,
        pagination: {
          el: ".swiper-pagination",
          clickable: true
        },
        breakpoints: {
          340: { slidesPerView: 2.25, spaceBetween: 8 },
          768: { slidesPerView: 3.5, spaceBetween: 10 },
          1024: { slidesPerView: 5, spaceBetween: 10 }
        }
      });
    }
    setupIntersectionObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const videoItem = entry.target;
          const iframe = videoItem.querySelector("iframe");
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            this.setVideoPlaying(iframe, true);
            videoItem.querySelector(".pause-btn")?.classList.add("playing");
          } else {
            this.setVideoPlaying(iframe, false);
            videoItem.querySelector(".pause-btn")?.classList.remove("playing");
          }
        });
      }, {
        threshold: [0, 0.5, 1],
        rootMargin: "0px"
      });
      this.querySelectorAll(".video-item").forEach((item) => {
        this.observer.observe(item);
      });
    }
    setVideoPlaying(iframe, playing) {
      if (!iframe) return;
      const currentSrc = iframe.src;
      const url = new URL(currentSrc);
      if (playing) {
        url.searchParams.set("autoplay", "true");
      } else {
        url.searchParams.set("autoplay", "false");
      }
      if (iframe.src !== url.toString()) {
        iframe.src = url.toString();
      }
    }
    setVideoMuted(iframe, muted) {
      if (!iframe) return;
      const currentSrc = iframe.src;
      const url = new URL(currentSrc);
      url.searchParams.set("muted", muted ? "true" : "false");
      if (iframe.src !== url.toString()) {
        iframe.src = url.toString();
      }
    }
    setupEventListeners() {
      this.addEventListener("click", (e) => {
        const target = e.target.closest("[data-action]");
        if (!target) return;
        const action = target.dataset.action;
        const videoItem = target.closest(".video-item");
        const iframe = videoItem?.querySelector("iframe");
        switch (action) {
          case "play":
            this.handlePlay(videoItem, iframe);
            break;
          case "expand":
            this.handleExpand(videoItem);
            break;
          case "toggle-play":
            this.handleTogglePlay(target, iframe);
            break;
          case "toggle-mute":
            this.handleToggleMute(target, iframe);
            break;
        }
      });
      this.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          const target = e.target.closest("[data-action]");
          if (target) {
            e.preventDefault();
            target.click();
          }
        }
      });
    }
    handlePlay(videoItem, iframe) {
      const pauseBtn = videoItem?.querySelector(".pause-btn");
      const isPlaying = pauseBtn?.classList.contains("playing");
      if (isPlaying) {
        this.setVideoPlaying(iframe, false);
        pauseBtn?.classList.remove("playing");
      } else {
        this.setVideoPlaying(iframe, true);
        pauseBtn?.classList.add("playing");
      }
    }
    handleExpand(videoItem) {
      const lightboxTrigger = videoItem?.querySelector(".video-lightbox-trigger");
      if (lightboxTrigger) {
        lightboxTrigger.click();
      }
    }
    handleTogglePlay(button, iframe) {
      const isPlaying = button.classList.contains("playing");
      if (isPlaying) {
        this.setVideoPlaying(iframe, false);
        button.classList.remove("playing");
      } else {
        this.setVideoPlaying(iframe, true);
        button.classList.add("playing");
      }
    }
    handleToggleMute(button, iframe) {
      const isMuted = button.classList.contains("muted");
      if (isMuted) {
        this.setVideoMuted(iframe, false);
        button.classList.remove("muted");
      } else {
        this.setVideoMuted(iframe, true);
        button.classList.add("muted");
      }
    }
    refreshLightbox() {
      if (typeof refreshFsLightbox === "function") {
        setTimeout(() => {
          refreshFsLightbox();
        }, 100);
      }
    }
  };
  if (!customElements.get("mahaba-video-gallery")) {
    customElements.define("mahaba-video-gallery", VideoGalleryComponent);
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
    async loadRecentlyViewed() {
      const recentlyViewed = this.getRecentlyViewed();
      if (!recentlyViewed.length) return;
      const filteredRecent = recentlyViewed.map((id) => parseInt(id, 10)).filter((id) => id && !isNaN(id) && id !== parseInt(this.productId, 10));
      if (!filteredRecent.length) return;
      this.removeExistingRecentlyViewed();
      const customSlider = document.createElement("algolia-recommendations-slider");
      customSlider.className = "algolia-recently-viewed mt-8";
      const relatedSection = document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"], algolia-recommendations-slider');
      this.insertRecentlyViewedSection(customSlider, relatedSection);
      await customSlider.initialize(filteredRecent, {
        title: "\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0624\u062E\u0631\u0627\u064B",
        filterStock: true,
        maxInStock: 15
      });
      console.log("[Bundle Recommendations] Recently viewed slider initialized with", filteredRecent.length, "products");
    }
    insertRecentlyViewedSection(container, relatedSection) {
      const productDetails = document.querySelector(".product-details, .product-entry, #product-entry");
      if (productDetails && productDetails.parentNode) {
        productDetails.parentNode.insertBefore(container, productDetails.nextSibling);
        return true;
      }
      if (relatedSection) {
        const relatedContainer = relatedSection.closest(".s-products-slider-container, .algolia-slider-wrapper");
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
      return !!document.querySelector('.product-form input[name="id"], [id^="product-"], .sidebar .details-slider');
    }
    getProductId() {
      const formInput = document.querySelector('.product-form input[name="id"]');
      if (formInput?.value) {
        const numericId = parseInt(formInput.value, 10);
        if (!isNaN(numericId)) return numericId;
      }
      const sallaProductId = window.salla?.product?.id;
      if (sallaProductId) {
        const numericId = parseInt(sallaProductId, 10);
        if (!isNaN(numericId)) return numericId;
      }
      const pageContainer = document.querySelector(".product-entry, #product-entry, .product-details");
      if (pageContainer) {
        const scopedContainer = pageContainer.matches('[id^="product-"]') ? pageContainer : pageContainer.querySelector('[id^="product-"]');
        if (scopedContainer && !scopedContainer.closest("salla-products-slider")) {
          const fromContainer = scopedContainer.id.replace("product-", "");
          const numericId = parseInt(fromContainer, 10);
          if (!isNaN(numericId)) return numericId;
        }
      }
      const standaloneContainer = document.querySelector('[id^="product-"]');
      if (standaloneContainer && !standaloneContainer.closest("salla-products-slider")) {
        const fromStandalone = standaloneContainer.id.replace("product-", "");
        const numericId = parseInt(fromStandalone, 10);
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
        const customSlider = document.createElement("algolia-recommendations-slider");
        customSlider.className = "product-recommendations-slider";
        element.parentNode.replaceChild(customSlider, element);
        await customSlider.initialize(numericIds, {
          title: "\u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0634\u0627\u0628\u0647\u0629",
          filterStock: true,
          maxInStock: 15
        });
        console.log("[Bundle Recommendations] Custom slider initialized with", numericIds.length, "products");
      } catch (error) {
        console.error("[Bundle Recommendations] Error:", error);
      }
    }
    reset() {
      this.initialized = false;
      this.productId = null;
      this.removeExistingRecentlyViewed();
      document.querySelectorAll("algolia-recommendations-slider").forEach((slider) => {
        if (slider.destroy) {
          slider.destroy();
        }
      });
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
    if (window.location.pathname.includes("/cart")) return;
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

  // partials/youtube-url-transformer.js
  var STYLES = `
.yt-placeholder {
  position: relative;
  display: block;
  width: 100%;
  max-width: 560px;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  margin: 1rem 0;
}

.yt-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: opacity 0.2s ease;
}

.yt-placeholder:hover img {
  opacity: 1;
}

.yt-placeholder-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 68px;
  height: 48px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.yt-placeholder:hover .yt-placeholder-play {
  background: #ff0000;
}

.yt-placeholder-play::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-40%, -50%);
  border-style: solid;
  border-width: 10px 0 10px 18px;
  border-color: transparent transparent transparent #fff;
}

.yt-placeholder iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.yt-placeholder.playing img,
.yt-placeholder.playing .yt-placeholder-play {
  display: none;
}
`;
  var YouTubeUrlTransformer = class {
    constructor() {
      this.processed = /* @__PURE__ */ new WeakSet();
      this.stylesInjected = false;
      this.init();
    }
    /**
     * Extract video ID from YouTube URL
     */
    extractVideoId(url) {
      if (!url) return null;
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    }
    /**
     * Inject CSS styles once
     */
    injectStyles() {
      if (this.stylesInjected) return;
      if (document.getElementById("yt-url-transformer-styles")) return;
      const style = document.createElement("style");
      style.id = "yt-url-transformer-styles";
      style.textContent = STYLES;
      document.head.appendChild(style);
      this.stylesInjected = true;
    }
    /**
     * Create placeholder element
     */
    createPlaceholder(videoId) {
      const container = document.createElement("div");
      container.className = "yt-placeholder";
      container.dataset.videoId = videoId;
      const img = document.createElement("img");
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      img.alt = "Video thumbnail";
      img.loading = "lazy";
      const playBtn = document.createElement("button");
      playBtn.className = "yt-placeholder-play";
      playBtn.setAttribute("aria-label", "Play video");
      container.appendChild(img);
      container.appendChild(playBtn);
      container.addEventListener("click", () => this.playVideo(container, videoId));
      return container;
    }
    /**
     * Replace placeholder with iframe
     */
    playVideo(container, videoId) {
      if (container.classList.contains("playing")) return;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.dataset.ytOptIn = "true";
      container.appendChild(iframe);
      container.classList.add("playing");
    }
    /**
     * Check if URL is a YouTube URL
     */
    isYouTubeUrl(url) {
      if (!url) return false;
      return /(?:youtube\.com|youtu\.be)/.test(url);
    }
    /**
     * Transform a link element into placeholder
     */
    transformLink(link) {
      if (this.processed.has(link)) return;
      if (!this.isYouTubeUrl(link.href)) return;
      const videoId = this.extractVideoId(link.href);
      if (!videoId) return;
      const placeholder = this.createPlaceholder(videoId);
      link.replaceWith(placeholder);
      this.processed.add(placeholder);
    }
    /**
     * Transform plain text YouTube URLs in an element
     */
    transformTextUrls(element) {
      if (this.processed.has(element)) return;
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      const urlPattern = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
      const nodesToReplace = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent;
        if (urlPattern.test(text)) {
          nodesToReplace.push(node);
        }
        urlPattern.lastIndex = 0;
      }
      nodesToReplace.forEach((textNode) => {
        const text = textNode.textContent;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;
        urlPattern.lastIndex = 0;
        while ((match = urlPattern.exec(text)) !== null) {
          if (match.index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
          }
          const videoId = match[1];
          const placeholder = this.createPlaceholder(videoId);
          fragment.appendChild(placeholder);
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        textNode.parentNode.replaceChild(fragment, textNode);
      });
      this.processed.add(element);
    }
    /**
     * Scan and transform all YouTube URLs in a root element
     */
    transform(root = document.body) {
      if (!root) return;
      const links = root.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]');
      links.forEach((link) => this.transformLink(link));
      const descriptions = root.querySelectorAll(
        '.product-description, .s-product-description, [class*="description"], .widget-content'
      );
      descriptions.forEach((desc) => this.transformTextUrls(desc));
    }
    /**
     * Setup MutationObserver for dynamic content
     */
    setupObserver() {
      const observer = new MutationObserver((mutations) => {
        let shouldScan = false;
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.querySelector?.('a[href*="youtube"], a[href*="youtu.be"]') || node.matches?.('[class*="description"]')) {
                shouldScan = true;
                break;
              }
            }
          }
          if (shouldScan) break;
        }
        if (shouldScan) {
          requestAnimationFrame(() => this.transform());
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    /**
     * Setup Salla event listeners
     */
    setupEventListeners() {
      document.addEventListener("salla::page::changed", () => {
        setTimeout(() => this.transform(), 100);
      });
      document.addEventListener("theme::ready", () => {
        this.transform();
      });
      if (window.salla?.event) {
        window.salla.event.on("product::loaded", () => this.transform());
        window.salla.event.on("products::loaded", () => this.transform());
      }
    }
    /**
     * Initialize transformer
     */
    init() {
      if (window.location.pathname.includes("/cart")) return;
      this.injectStyles();
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.transform());
      } else {
        this.transform();
      }
      window.addEventListener("load", () => this.transform());
      this.setupObserver();
      this.setupEventListeners();
      console.log("[Algolia Bundle] YouTube URL transformer initialized");
    }
  };
  var youtubeUrlTransformer = new YouTubeUrlTransformer();

  // partials/product-title-enhancer.js
  var TITLE_STYLES = `
  .s-product-card-entry .s-product-card-content-title a {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    font-weight: normal;
  }

  .s-product-card-entry .s-product-card-content-title a.title-long {
    font-size: 0.95rem;
    font-weight: normal;
  }

  .s-product-card-entry .s-product-card-content-title a.title-very-long {
    font-size: 0.9rem;
    font-weight: normal;
  }

  .s-product-card-entry .s-product-card-content-title a.title-extreme {
    font-size: 0.85rem;
    font-weight: normal;
  }
`;
  var ProductTitleEnhancer = class {
    constructor() {
      this.processedElements = /* @__PURE__ */ new WeakSet();
      this.pendingScan = false;
      this.init();
    }
    /**
     * Get CSS class based on title length
     * Matches main theme thresholds exactly
     */
    getTitleClass(title) {
      if (!title) return "";
      const length = title.length;
      if (length > 70) return "title-extreme";
      if (length > 50) return "title-very-long";
      if (length > 30) return "title-long";
      if (length > 15) return "title-medium";
      return "";
    }
    /**
     * Enhance a single title element
     */
    enhanceTitle(element) {
      if (this.processedElements.has(element)) return;
      const title = element.textContent?.trim();
      const titleClass = this.getTitleClass(title);
      if (titleClass) {
        element.classList.add(titleClass);
      }
      this.processedElements.add(element);
    }
    /**
     * Scan and enhance all product title elements
     */
    enhanceAllTitles() {
      const titles = document.querySelectorAll(".s-product-card-content-title a");
      titles.forEach((el) => this.enhanceTitle(el));
    }
    /**
     * Debounced scan - prevents multiple rapid scans
     */
    scheduleScan() {
      if (this.pendingScan) return;
      this.pendingScan = true;
      requestAnimationFrame(() => {
        this.enhanceAllTitles();
        this.pendingScan = false;
      });
    }
    /**
     * Inject CSS styles into document head
     */
    injectStyles() {
      if (document.getElementById("product-title-enhancer-styles")) return;
      const style = document.createElement("style");
      style.id = "product-title-enhancer-styles";
      style.textContent = TITLE_STYLES;
      document.head.appendChild(style);
    }
    /**
     * Setup MutationObserver to catch dynamically added products
     */
    setupMutationObserver() {
      const observer = new MutationObserver((mutations) => {
        let shouldScan = false;
        for (const mutation of mutations) {
          if (mutation.addedNodes.length) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.matches?.(".s-product-card-content-title a") || node.matches?.(".s-product-card-entry") || node.querySelector?.(".s-product-card-content-title a")) {
                  shouldScan = true;
                  break;
                }
              }
            }
          }
          if (shouldScan) break;
        }
        if (shouldScan) {
          this.scheduleScan();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    /**
     * Setup Salla event listeners for product loading
     */
    setupSallaEventListeners() {
      if (window.salla?.event) {
        window.salla.event.on("products::loaded", () => this.scheduleScan());
        window.salla.event.on("product::loaded", () => this.scheduleScan());
      }
      document.addEventListener("theme::ready", () => this.scheduleScan());
      document.addEventListener("salla::page::changed", () => {
        setTimeout(() => this.scheduleScan(), 100);
      });
    }
    /**
     * Initialize the enhancer
     */
    init() {
      if (window.location.pathname.includes("/cart")) return;
      this.injectStyles();
      this.enhanceAllTitles();
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.enhanceAllTitles());
      }
      window.addEventListener("load", () => this.enhanceAllTitles());
      this.setupMutationObserver();
      this.setupSallaEventListeners();
      console.log("[Algolia Bundle] Product title enhancer initialized");
    }
  };
  var productTitleEnhancer = new ProductTitleEnhancer();

  // partials/product-card-enhancer.js
  var IMAGE_API_BASE = "https://productstoredis-163858290861.me-central2.run.app/product-images";
  var imageCache = /* @__PURE__ */ new Map();
  var pendingRequests = /* @__PURE__ */ new Map();
  var SLIDER_STYLES = `
.product-slider-dots {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: none;
  justify-content: center;
  gap: 6px;
  z-index: 50;
}
.product-slider-dots.has-images {
  display: flex;
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
}
.product-slider-image.active {
  opacity: 1;
  visibility: visible;
  z-index: 10;
}
.s-product-card-image {
  position: relative !important;
  overflow: hidden;
}
.s-product-card-image > a {
  position: relative !important;
  display: block;
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
  function injectStyles() {
    if (document.getElementById("product-slider-enhancer-styles")) return;
    const style = document.createElement("style");
    style.id = "product-slider-enhancer-styles";
    style.textContent = SLIDER_STYLES;
    document.head.appendChild(style);
  }
  async function fetchImages(productId) {
    if (imageCache.has(productId)) {
      return imageCache.get(productId);
    }
    if (pendingRequests.has(productId)) {
      return pendingRequests.get(productId);
    }
    const promise = (async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5e3);
        const res = await fetch(`${IMAGE_API_BASE}/${productId}`, {
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (!res.ok) return null;
        const data = await res.json();
        imageCache.set(productId, data);
        return data;
      } catch (e) {
        return null;
      } finally {
        pendingRequests.delete(productId);
      }
    })();
    pendingRequests.set(productId, promise);
    return promise;
  }
  var ProductCardEnhancer = class {
    constructor() {
      this.polling = false;
      this.lastEnhanceTime = 0;
      this.pollInterval = 100;
      this.stopAfterIdle = 5e3;
      this.init();
    }
    init() {
      if (window.location.pathname.includes("/cart")) return;
      injectStyles();
      this.startPolling();
      const reactivate = () => {
        this.lastEnhanceTime = Date.now();
        this.startPolling();
      };
      document.addEventListener("DOMContentLoaded", reactivate);
      window.addEventListener("load", reactivate);
      [
        "salla-products-slider::products.fetched",
        "salla-products-list::products.fetched",
        "salla::page::changed",
        "theme::ready"
      ].forEach((evt) => document.addEventListener(evt, reactivate));
      new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1 && (node.classList?.contains("s-product-card-entry") || node.querySelector?.(".s-product-card-entry"))) {
              reactivate();
              return;
            }
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
      console.log("[Card Enhancer] Initialized with continuous polling");
    }
    startPolling() {
      if (this.polling) return;
      this.polling = true;
      this.poll();
    }
    poll() {
      if (!this.polling) return;
      const count = this.scan();
      if (count > 0) {
        this.lastEnhanceTime = Date.now();
      }
      if (Date.now() - this.lastEnhanceTime > this.stopAfterIdle) {
        this.polling = false;
        console.log("[Card Enhancer] Polling stopped (idle)");
        return;
      }
      setTimeout(() => requestAnimationFrame(() => this.poll()), this.pollInterval);
    }
    scan() {
      let count = 0;
      document.querySelectorAll(".s-product-card-entry").forEach((card) => {
        if (card.querySelector(".product-slider-dots")) return;
        const imageWrapper = card.querySelector(".s-product-card-image");
        if (!imageWrapper) return;
        const imageLink = imageWrapper.querySelector("a");
        if (!imageLink) return;
        const productId = this.extractProductId(card);
        if (!productId) return;
        this.enhance(card, productId, imageWrapper, imageLink);
        count++;
      });
      return count;
    }
    extractProductId(card) {
      if (card.dataset.id) return card.dataset.id;
      if (card.id && /^\d+$/.test(card.id)) return card.id;
      const link = card.querySelector('a[href*="/product/"]');
      if (link?.href) {
        const match = link.href.match(/\/product\/[^\/]+\/(\d+)/);
        if (match) return match[1];
      }
      try {
        const attr = card.getAttribute("product");
        if (attr) {
          const data = JSON.parse(attr);
          if (data.id) return String(data.id);
        }
      } catch (e) {
      }
      return null;
    }
    enhance(card, productId, imageWrapper, imageLink) {
      const sliderId = `s${productId}-${Math.random().toString(36).substr(2, 4)}`;
      const swipeIndicator = document.createElement("div");
      swipeIndicator.className = "swipe-indicator";
      imageLink.appendChild(swipeIndicator);
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "product-slider-dots";
      dotsContainer.dataset.sliderId = sliderId;
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        dot.className = "product-slider-dot" + (i === 0 ? " active" : "");
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
      }
      imageWrapper.appendChild(dotsContainer);
      new CardSlider({
        productId,
        sliderId,
        imageWrapper,
        imageLink,
        dotsContainer,
        swipeIndicator
      });
    }
  };
  var CardSlider = class {
    constructor({ productId, sliderId, imageWrapper, imageLink, dotsContainer, swipeIndicator }) {
      this.productId = productId;
      this.sliderId = sliderId;
      this.imageWrapper = imageWrapper;
      this.imageLink = imageLink;
      this.dotsContainer = dotsContainer;
      this.swipeIndicator = swipeIndicator;
      this.currentSlide = 0;
      this.images = [];
      this.imagesLoaded = false;
      this.setupGestures();
      this.setupDotClicks();
      this.setupLazyImageLoad();
    }
    setupDotClicks() {
      this.dotsContainer.querySelectorAll(".product-slider-dot").forEach((dot) => {
        dot.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.goToSlide(parseInt(dot.dataset.index));
          this.haptic("light");
        });
      });
    }
    setupGestures() {
      let startX, startY, startTime;
      let isOurSwipe = false;
      let directionDecided = false;
      const onStart = (x, y, e) => {
        startX = x;
        startY = y;
        startTime = Date.now();
        isOurSwipe = false;
        directionDecided = false;
        e.stopPropagation();
      };
      const onMove = (x, y, e) => {
        if (startX == null) return;
        const dx = x - startX;
        const dy = y - startY;
        if (!directionDecided && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
          directionDecided = true;
          isOurSwipe = Math.abs(dx) > Math.abs(dy);
        }
        if (isOurSwipe) {
          e.stopPropagation();
          e.preventDefault();
          this.swipeIndicator.classList.toggle("right", dx > 0);
          this.swipeIndicator.style.opacity = Math.min(Math.abs(dx) / 100, 0.5);
        }
      };
      const onEnd = (x, e) => {
        this.swipeIndicator.style.opacity = 0;
        if (isOurSwipe && startX != null) {
          const dx = x - startX;
          const threshold = Date.now() - startTime < 300 ? 30 : 50;
          if (Math.abs(dx) >= threshold) {
            dx > 0 ? this.prevSlide() : this.nextSlide();
            this.haptic("medium");
          }
          e.stopPropagation();
          e.preventDefault();
        }
        startX = startY = null;
        isOurSwipe = false;
        directionDecided = false;
      };
      this.imageLink.addEventListener("touchstart", (e) => {
        onStart(e.touches[0].clientX, e.touches[0].clientY, e);
      }, { passive: false, capture: true });
      this.imageLink.addEventListener("touchmove", (e) => {
        onMove(e.touches[0].clientX, e.touches[0].clientY, e);
      }, { passive: false, capture: true });
      this.imageLink.addEventListener("touchend", (e) => {
        onEnd(e.changedTouches[0].clientX, e);
      }, { passive: false, capture: true });
      let mouseDown = false;
      this.imageLink.addEventListener("mousedown", (e) => {
        mouseDown = true;
        onStart(e.clientX, e.clientY, e);
        e.preventDefault();
        e.stopPropagation();
      }, { capture: true });
      this.imageLink.addEventListener("mousemove", (e) => {
        if (mouseDown) onMove(e.clientX, e.clientY, e);
      }, { capture: true });
      window.addEventListener("mouseup", (e) => {
        if (mouseDown) {
          mouseDown = false;
          onEnd(e.clientX, e);
        }
      });
    }
    setupLazyImageLoad() {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this.imagesLoaded) {
          this.imagesLoaded = true;
          observer.disconnect();
          this.loadImages();
        }
      }, { rootMargin: "300px" });
      observer.observe(this.imageWrapper);
    }
    async loadImages() {
      const data = await fetchImages(this.productId);
      if (!data?.images?.length) {
        this.dotsContainer.style.display = "none";
        return;
      }
      const sorted = data.images.filter((img) => img?.url).sort((a, b) => (a.sort || 0) - (b.sort || 0)).slice(0, 2);
      if (sorted.length === 0) {
        this.dotsContainer.style.display = "none";
        return;
      }
      this.images = sorted;
      sorted.forEach((imgData, i) => {
        const img = document.createElement("img");
        img.className = "product-slider-image";
        img.dataset.index = i + 1;
        img.alt = imgData.alt || "Product image";
        img.loading = "lazy";
        img.src = imgData.url;
        img.onerror = () => {
          img.remove();
          const dot = this.dotsContainer.querySelector(`[data-index="${i + 1}"]`);
          if (dot) dot.style.display = "none";
          this.updateDotsVisibility();
        };
        this.imageLink.appendChild(img);
      });
      if (sorted.length < 2) {
        const dot3 = this.dotsContainer.querySelector('[data-index="2"]');
        if (dot3) dot3.style.display = "none";
      }
      this.dotsContainer.classList.add("has-images");
    }
    updateDotsVisibility() {
      const visibleDots = this.dotsContainer.querySelectorAll('.product-slider-dot:not([style*="display: none"])');
      if (visibleDots.length <= 1) {
        this.dotsContainer.classList.remove("has-images");
      }
    }
    goToSlide(index) {
      if (!this.images.length && index > 0) return;
      this.currentSlide = index;
      this.dotsContainer.querySelectorAll(".product-slider-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
      const mainImg = this.imageLink.querySelector("img:not(.product-slider-image)");
      const sliderImgs = this.imageLink.querySelectorAll(".product-slider-image");
      if (index === 0) {
        if (mainImg) mainImg.style.cssText = "visibility:visible;opacity:1;z-index:10;";
        sliderImgs.forEach((img) => img.classList.remove("active"));
      } else {
        if (mainImg) mainImg.style.cssText = "visibility:hidden;opacity:0;z-index:5;";
        sliderImgs.forEach((img) => {
          img.classList.toggle("active", parseInt(img.dataset.index) === index);
        });
      }
    }
    prevSlide() {
      const total = this.images.length + 1;
      this.goToSlide((this.currentSlide - 1 + total) % total);
    }
    nextSlide() {
      const total = this.images.length + 1;
      this.goToSlide((this.currentSlide + 1) % total);
    }
    haptic(type) {
      try {
        navigator.vibrate?.(type === "light" ? 10 : 25);
      } catch (e) {
      }
    }
  };
  new ProductCardEnhancer();

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
  function runVideoGalleryInjection() {
    if (!document.body.classList.contains("index")) {
      return;
    }
    const ELEMENT_TAG = "mahaba-video-gallery";
    function injectElement() {
      if (document.querySelector(ELEMENT_TAG)) {
        return true;
      }
      const categoryProducts = document.querySelector("mahaba-category-products");
      if (categoryProducts && categoryProducts.parentElement) {
        const videoGallery = document.createElement(ELEMENT_TAG);
        categoryProducts.parentElement.insertBefore(videoGallery, categoryProducts);
        console.log("\u2705 [Algolia Bundle] Video gallery injected before category products");
        return true;
      }
      const appInner = document.querySelector(".app-inner");
      const footer = document.querySelector(".store-footer");
      if (appInner) {
        const videoGallery = document.createElement(ELEMENT_TAG);
        if (footer) {
          appInner.insertBefore(videoGallery, footer);
        } else {
          appInner.appendChild(videoGallery);
        }
        console.log("\u2705 [Algolia Bundle] Video gallery injected (fallback location)");
        return true;
      }
      return false;
    }
    if (injectElement()) {
      return;
    }
    console.log("[Algolia Bundle] Waiting for DOM to inject video gallery...");
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
    setTimeout(() => {
      observer.disconnect();
    }, 1e4);
  }
  onReady(() => {
    runHomepageInjection();
    setTimeout(runVideoGalleryInjection, 100);
    const isProductPage = document.querySelector('[id^="product-"]');
    if (isProductPage) {
      setTimeout(() => {
        product_recommendations_default.initialize();
        console.log("\u2705 [Algolia Bundle] Product recommendations initialized");
      }, 3e3);
    }
    console.log("\u2705 [Algolia Bundle] Loaded successfully");
  });
  document.addEventListener("salla::page::changed", () => {
    product_recommendations_default.reset();
    setTimeout(() => {
      product_recommendations_default.initialize();
    }, 1e3);
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
