(()=>{var T=class{constructor(){this.baseUrl="https://me-central2-gtm-5v2mhn4-mwvlm.cloudfunctions.net/function-2",this.maxRetries=2,this.headers={Accept:"application/json","Cache-Control":"public, max-age=3600"},this.cache=new Map,this.fallbackEnabled=!0}async getProducts(t,e,i=0,s=12){if(!e)return null;let r=`${t}:${e}:${i}:${s}`;if(this.cache.has(r))return this.cache.get(r);let o=t==="category"?"catID":"tagID",a=t==="category"?"categoryById":"tagById",l=`${this.baseUrl}/?type=${a}&${o}=${encodeURIComponent(e)}&offset=${i}&limit=${s}`,d=null;try{let c=new AbortController,p=setTimeout(()=>c.abort(),2e3),g=await fetch(l,{method:"GET",headers:this.headers,signal:c.signal});if(clearTimeout(p),!g.ok)throw new Error(`HTTP error: ${g.status}`);if(d=await g.json(),d?.objectIDs?.length)return this.cache.set(r,d),d}catch{}if(!d?.objectIDs?.length&&this.fallbackEnabled)try{let c=await fetch(l,{method:"GET",headers:this.headers});if(c.ok&&(d=await c.json(),d?.objectIDs?.length))return this.cache.set(r,d),d}catch{}return d||{objectIDs:[],hasMore:!1}}async getRecommendations(t){if(!t)return[];let e=`recommendations:${t}`;if(this.cache.has(e))return this.cache.get(e);let i=`${this.baseUrl}/?type=recommendations&objectID=${encodeURIComponent(t)}`;try{let s=new AbortController,r=setTimeout(()=>s.abort(),3e3),o=await fetch(i,{method:"GET",headers:this.headers,signal:s.signal});if(clearTimeout(r),!o.ok)return[];let a=await o.json(),l=Array.isArray(a?.relatedProductIDs)?a.relatedProductIDs:[];return this.cache.set(e,l),l}catch{return[]}}async getFrequentlyBought(t){if(!t)return[];let e=`frequently-bought:${t}`;if(this.cache.has(e))return this.cache.get(e);let i=`${this.baseUrl}/?type=frequentlyBought&objectID=${encodeURIComponent(t)}`;try{let s=new AbortController,r=setTimeout(()=>s.abort(),3e3),o=await fetch(i,{method:"GET",headers:this.headers,signal:s.signal});if(clearTimeout(r),!o.ok)return[];let a=await o.json(),l=Array.isArray(a?.frequentlyBoughtIDs)?a.frequentlyBoughtIDs:[];return this.cache.set(e,l),l}catch{return[]}}async getCategoriesFromRedis(){let t="all-categories";if(this.cache.has(t))return this.cache.get(t);try{let e=new AbortController,i=setTimeout(()=>e.abort(),5e3),s=await fetch(`${this.baseUrl}/?type=categories`,{method:"GET",headers:this.headers,signal:e.signal});if(clearTimeout(i),!s.ok)return[];let o=(await s.json()).categories||[];return this.cache.set(t,o),o}catch{return[]}}async getGlobalProducts(t=0,e=12){let i=`global-products:${t}:${e}`;if(this.cache.has(i))return this.cache.get(i);try{let s=new AbortController,r=setTimeout(()=>s.abort(),3e3),o=`${this.baseUrl}/?type=categoryById&catID=trending-now&offset=${t}&limit=${e}`,a=await fetch(o,{method:"GET",headers:this.headers,signal:s.signal});if(clearTimeout(r),!a.ok)return{objectIDs:[],hasMore:!1};let l=await a.json(),d={objectIDs:l.objectIDs||[],hasMore:l.hasMore||!1};return this.cache.set(i,d),d}catch{return{objectIDs:[],hasMore:!1}}}async getCategoryPageById(t,e=0,i=12){return this.getProducts("category",t,e,i)}async getCategoryProducts(t,e,i){return this.getProducts("category",t,e,i)}async getTagProducts(t,e,i){return this.getProducts("tag",t,e,i)}},h=new T;var k=class extends HTMLElement{constructor(){super(),this.initialized=!1,this.productIds=[],this.structureReady=!1}connectedCallback(){this.ensureStructure(),!this.initialized&&this.getHighestValueItemFromDOM().then(t=>t?this.fetchFrequentlyBoughtProducts(t):[]).then(()=>{this.renderProductList(),setTimeout(()=>{this.initializeSlider()},1e3)}).catch(t=>{console.error("[CartAddonsSlider] Error loading products:",t)})}ensureStructure(){if(this.structureReady)return;let t=this.getTitleText(),e=this.querySelector(".cart-addons-title");if(e)e.textContent=t;else{let i=document.createElement("h3");i.className="cart-addons-title",i.textContent=t,this.appendChild(i)}if(!this.querySelector(".frequently-bought-container")){let i=document.createElement("div");i.className="frequently-bought-container",this.appendChild(i)}this.structureReady=!0}getTitleText(){let t="pages.cart.frequently_bought_together",e=window.salla?.lang?.get?.(t),i=typeof e=="string"&&e!==t?e.trim():"";if(i)return i;let s=(document.documentElement.getAttribute("lang")||"").toLowerCase().slice(0,2),r={ar:"\u0645\u062A\u062C\u0627\u062A \u0642\u062F \u062A\u0639\u062C\u0628\u0643",en:"Frequently Bought Together"};return r[s]||r.en}async getHighestValueItemFromDOM(){try{let t=document.querySelectorAll('form[id^="item-"]');if(!t||t.length===0)return console.log("[CartAddonsSlider] No cart items found in DOM"),null;let e=null,i=0;return t.forEach(s=>{try{let r=s.getAttribute("id")||"",o=r.replace("item-",""),a=s.querySelector('a[href*="/p"]');if(!a){console.log("[CartAddonsSlider] No product link found in form",r);return}let l=a.getAttribute("href"),d=l.match(/\/p(\d+)(?:$|\/|\?)/);if(!d||!d[1]){console.log("[CartAddonsSlider] Could not extract product ID from URL",l);return}let c=d[1],p=s.querySelector(".item-total");if(p){let U=(p.textContent||p.innerText||"0").replace(/[^\d.,٠١٢٣٤٥٦٧٨٩]/g,"").replace(/٠/g,"0").replace(/١/g,"1").replace(/٢/g,"2").replace(/٣/g,"3").replace(/٤/g,"4").replace(/٥/g,"5").replace(/٦/g,"6").replace(/٧/g,"7").replace(/٨/g,"8").replace(/٩/g,"9"),w=parseFloat(U.replace(",","."))||0;console.log(`[CartAddonsSlider] Item ${o}: Product ID ${c}, Total: ${w}`),!isNaN(w)&&w>i&&(i=w,e={itemId:o,productId:c,total:w})}}catch(r){console.error("[CartAddonsSlider] Error processing item form:",r)}}),e?(console.log("[CartAddonsSlider] Highest value item:",e),e.productId):null}catch(t){return console.error("[CartAddonsSlider] Error extracting cart data from DOM:",t),null}}async fetchFrequentlyBoughtProducts(t){try{console.log("[CartAddonsSlider] Fetching frequently bought products for:",t);let e=await h.getFrequentlyBought(t);return e&&e.length>0?(console.log("[CartAddonsSlider] Found frequently bought products:",e),this.productIds=e.map(i=>String(i)).slice(0,8),this.productIds):(console.log("[CartAddonsSlider] No frequently bought products found"),this.productIds=[],[])}catch(e){return console.error("[CartAddonsSlider] Error fetching frequently bought products:",e),this.productIds=[],[]}}renderProductList(){if(!this.productIds||this.productIds.length===0){console.log("[CartAddonsSlider] No products to render, hiding component"),this.style.display="none";return}console.log("[CartAddonsSlider] Rendering product list with IDs:",this.productIds);let t=this.querySelector(".frequently-bought-container");if(!t){console.error("[CartAddonsSlider] Container not found");return}let e=document.createElement("salla-products-list");if(e.setAttribute("source","selected"),e.setAttribute("loading","lazy"),e.setAttribute("source-value",JSON.stringify(this.productIds)),e.setAttribute("class","s-products-list-vertical-cards"),t.innerHTML="",t.appendChild(e),!this.querySelector(".touch-indicator")){let i=document.createElement("div");i.classList.add("touch-indicator"),this.appendChild(i)}console.log("[CartAddonsSlider] Product list rendered")}initializeSlider(){try{let t=this.querySelector("salla-products-list");if(!t){console.log("[CartAddonsSlider] Products list not found");return}t.style.opacity="1",window.salla?.event?.dispatch&&window.salla.event.dispatch("twilight::mutation"),this.initialized=!0,console.log("[CartAddonsSlider] Slider initialized")}catch(t){console.error("[CartAddonsSlider] Failed to initialize cart addons slider:",t)}}};customElements.get("cart-addons-slider")||(customElements.define("cart-addons-slider",k),console.log("[CartAddonsSlider] Custom element defined"));var L=class extends HTMLElement{constructor(){super(),this.swiper=null,this.productIds=[],this.initialized=!1}async initialize(t,e={}){if(this.initialized){console.warn("[AlgoliaSlider] Already initialized");return}this.productIds=t.slice(0,21);let{title:i="\u0645\u0646\u062A\u062C\u0627\u062A \u0642\u062F \u062A\u0639\u062C\u0628\u0643",displayAllUrl:s="",filterStock:r=!0,maxInStock:o=15}=e;this.innerHTML=`
            <div class="algolia-slider-wrapper s-products-slider-wrapper">
                <div class="algolia-slider-header s-slider-block__title">
                    <div class="s-slider-block__title-right">
                        <h2>${i}</h2>
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
        `,this.injectStyles(),await this.renderProducts(r,o),this.initialized=!0}async renderProducts(t,e){let i=this.querySelector(".swiper-wrapper");if(!i){console.error("[AlgoliaSlider] Swiper wrapper not found");return}let s=document.createElement("salla-products-list");s.setAttribute("source","selected"),s.setAttribute("source-value",JSON.stringify(this.productIds)),s.setAttribute("limit",this.productIds.length.toString()),s.setAttribute("display-all-url",""),s.className="algolia-products-source";let r=document.createElement("div");return r.style.cssText="opacity: 0; pointer-events: none; position: absolute; z-index: -1; top: 0; left: 0; width: 100%; height: 0; overflow: hidden;",r.className="algolia-temp-container",r.appendChild(s),this.appendChild(r),window.salla?.event?.dispatch("twilight::mutation"),new Promise(o=>{let a=l=>{s.contains(l.target)&&(window.salla?.event?.off("salla-products-list::products.fetched",a),setTimeout(()=>{this.moveProductsToSlider(s,i,t,e),r.remove(),o()},150))};window.salla?.event?.on("salla-products-list::products.fetched",a),setTimeout(()=>{r.parentNode&&(this.moveProductsToSlider(s,i,t,e),r.remove(),o())},3e3)})}moveProductsToSlider(t,e,i,s){let r=t.querySelectorAll(".s-product-card-entry, custom-salla-product-card");if(!r.length){console.warn("[AlgoliaSlider] No product cards found");return}console.log(`[AlgoliaSlider] Found ${r.length} products from Salla`);let o=new Map;r.forEach(l=>{let d=l.getAttribute("id")||l.id;if(d){let c=d.replace("product-","");o.set(c.toString(),l)}}),console.log("[AlgoliaSlider] Card map keys:",Array.from(o.keys())),console.log("[AlgoliaSlider] Target order from Algolia:",this.productIds);let a=0;this.productIds.forEach((l,d)=>{let c=o.get(l.toString());if(!c){console.warn(`[AlgoliaSlider] Product ${l} not found in rendered cards`);return}let p=c.classList.contains("s-product-card-out-of-stock");if(i&&(p||a>=s))return;p||a++;let g=document.createElement("div");g.className="s-products-slider-card swiper-slide",g.appendChild(c),e.appendChild(g),console.log(`[AlgoliaSlider] Added product ${l} at position ${d}`)}),console.log(`[AlgoliaSlider] Final order: ${a} in-stock products in Algolia order`),this.initializeSwiper()}initializeSwiper(){let t=this.querySelector(".swiper");if(!t){console.error("[AlgoliaSlider] Swiper container not found");return}if(!this.querySelectorAll(".swiper-slide").length){console.warn("[AlgoliaSlider] No slides to initialize");return}if(typeof Swiper>"u"){console.warn("[AlgoliaSlider] Swiper not available, using CSS fallback"),this.initializeCSSScroll();return}try{this.swiper=new Swiper(t,{slidesPerView:"auto",spaceBetween:16,rtl:!0,direction:"horizontal",navigation:{nextEl:".algolia-slider-next",prevEl:".algolia-slider-prev"},breakpoints:{320:{slidesPerView:2,spaceBetween:12},640:{slidesPerView:2,spaceBetween:12},768:{slidesPerView:3,spaceBetween:16},1024:{slidesPerView:4,spaceBetween:16}},on:{init:function(){console.log("[AlgoliaSlider] Swiper initialized successfully")}}}),console.log("[AlgoliaSlider] Swiper instance created")}catch(i){console.error("[AlgoliaSlider] Error initializing Swiper:",i),this.initializeCSSScroll()}}initializeCSSScroll(){let t=this.querySelector(".swiper-wrapper");if(!t)return;t.style.cssText=`
            display: flex !important;
            overflow-x: auto;
            scroll-behavior: smooth;
            gap: 1rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
        `;let e=this.querySelector(".swiper");e&&(e.style.overflow="hidden");let i=this.querySelector(".algolia-slider-prev"),s=this.querySelector(".algolia-slider-next");if(i&&s){i.addEventListener("click",()=>{t.scrollBy({left:-300,behavior:"smooth"})}),s.addEventListener("click",()=>{t.scrollBy({left:300,behavior:"smooth"})});let o=()=>{let a=t.scrollLeft<=0,l=t.scrollLeft>=t.scrollWidth-t.clientWidth-10;i.disabled=a,s.disabled=l,i.classList.toggle("swiper-button-disabled",a),s.classList.toggle("swiper-button-disabled",l)};t.addEventListener("scroll",o),o()}console.log("[AlgoliaSlider] CSS scroll fallback initialized")}injectStyles(){if(document.getElementById("algolia-slider-styles"))return;let t=document.createElement("style");t.id="algolia-slider-styles",t.textContent=`
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
        `,document.head.appendChild(t),console.log("[AlgoliaSlider] Styles injected")}disconnectedCallback(){this.destroy()}destroy(){if(this.swiper){try{this.swiper.destroy(!0,!0),console.log("[AlgoliaSlider] Swiper destroyed")}catch(t){console.error("[AlgoliaSlider] Error destroying Swiper:",t)}this.swiper=null}this.initialized=!1}};customElements.get("algolia-recommendations-slider")||(customElements.define("algolia-recommendations-slider",L),console.log("[AlgoliaSlider] Custom element registered"));var P=class extends HTMLElement{constructor(){super(),this.page=0,this.loading=!1,this.hasMore=!0,this.ids=[],this.container=null,this.originalList=null,this.usingSallaFilter=!1,this.timeout=null}async connectedCallback(){let t=this.getAttribute("category-id"),e=this.getAttribute("tag-id");if(console.log("[PR Element] Connected:",{categoryId:t,tagId:e}),!(!t&&!e))try{await this.waitForSalla(),this.setupFilterListener(),await this.initialize(t,e)}catch(i){console.error("[PR Element] Error:",i),this.restoreOriginalList()}}restoreOriginalList(){if(!this.originalList||this.usingSallaFilter)return;let t=document.querySelector(".ranked-products, salla-products-list[filter]"),e=t?.parentNode||this.originalList.parentNode;t&&t.remove(),this.container&&(this.container.remove(),this.container=null),e&&!e.querySelector("salla-products-list")&&(e.appendChild(this.originalList.cloneNode(!0)),window.salla?.event?.dispatch("twilight::mutation"))}setupFilterListener(){document.addEventListener("change",t=>{if(t.target.id!=="product-filter")return;let e=t.target.value;e==="ourSuggest"&&this.usingSallaFilter?this.applyRedisRanking():e!=="ourSuggest"&&this.applySallaFilter(e)})}async applySallaFilter(t){let e=this.getAttribute("category-id"),i=this.getAttribute("tag-id");if(!this.originalList)return;let s=document.querySelector(".ranked-products, salla-products-list[filter]"),r=s?.parentNode||this.container?.parentNode;if(!r)return;s&&s.remove(),this.container&&(this.container.remove(),this.container=null),this.cleanupScrollListener(),this.usingSallaFilter=!0;let o=this.originalList.cloneNode(!0);o.setAttribute("filter",t),r.appendChild(o),window.salla?.event?.dispatch("twilight::mutation")}async applyRedisRanking(){let t=this.getAttribute("category-id"),e=this.getAttribute("tag-id");this.usingSallaFilter=!1,await this.initialize(t,e,!0)}async initialize(t,e,i=!1){if(console.log("[PR Element] Initialize called"),this.container&&!this.usingSallaFilter&&!i)return;let s=t?'salla-products-list[source="product.index"], salla-products-list[source="categories"]':'salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]',r=document.querySelector(s);if(console.log("[PR Element] Existing list found:",!!r),!r)return;this.originalList||(this.originalList=r.cloneNode(!0));let o=document.getElementById("product-filter");if(o)o.value="ourSuggest",this.usingSallaFilter=!1;else if(o&&o.value!=="ourSuggest"&&!i){this.usingSallaFilter=!0;return}let a=t?h.getCategoryProducts(t,0,12):h.getTagProducts(e,0,12),l=r.parentNode;this.container=document.createElement("div"),this.container.className="ranked-products",l.insertBefore(this.container,r),clearTimeout(this.timeout),this.timeout=setTimeout(()=>{(!this.ids||!this.ids.length)&&this.restoreOriginalList()},2500);let d=await a;if(clearTimeout(this.timeout),console.log("[PR Element] Redis data received:",d?.objectIDs?.length,"products"),console.log("[PR Element] Redis product IDs:",d.objectIDs),!d?.objectIDs?.length){console.warn("[PR Element] No products from Redis, restoring original"),this.restoreOriginalList();return}this.ids=d.objectIDs,this.page=0,this.hasMore=!0,this.usingSallaFilter=!1;let c=document.createElement("salla-products-list");c.setAttribute("source","selected"),c.setAttribute("source-value",JSON.stringify(this.ids)),c.setAttribute("limit",this.ids.length),c.className=r.className||"w-full",this.container.appendChild(c),r.remove(),window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(this.container,this.ids),this.setupScrollListener()}setupScrollListener(){this.cleanupScrollListener(),this._boundScrollHandler=this.handleScroll.bind(this),window.addEventListener("scroll",this._boundScrollHandler)}cleanupScrollListener(){this._boundScrollHandler&&(window.removeEventListener("scroll",this._boundScrollHandler),this._boundScrollHandler=null)}handleScroll(){if(this.loading||!this.hasMore||this.usingSallaFilter)return;let t=window.scrollY+window.innerHeight,e=document.documentElement.scrollHeight*.5;t>e&&this.loadMore()}async loadMore(){if(!(this.loading||!this.hasMore)){this.loading=!0;try{let t=this.page+1,e=t*12,i=this.getAttribute("category-id"),s=this.getAttribute("tag-id"),r=i?await h.getCategoryProducts(i,e,12):await h.getTagProducts(s,e,12);if(!r?.objectIDs?.length){this.hasMore=!1;return}let o=document.createElement("salla-products-list");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(r.objectIDs)),o.setAttribute("limit",r.objectIDs.length),o.className="w-full",this.container.appendChild(o),this.page=t,this.hasMore=r.hasMore!==!1,window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(o,r.objectIDs)}catch{this.hasMore=!1}finally{this.loading=!1}}}async waitForSalla(){if(!window.salla)return new Promise(t=>{document.addEventListener("salla::ready",t,{once:!0}),setTimeout(t,3e3)})}applyOrderToList(t,e,i=30){if(!t||!e||!e.length)return;let s=0,r=setInterval(()=>{s++;let o=Array.from(t.querySelectorAll("custom-salla-product-card, .s-product-card-entry"));if(o.length>0){clearInterval(r);let a=new Map;o.forEach(d=>{let c=null;if(d.dataset.id)c=d.dataset.id;else if(d.id&&!isNaN(d.id))c=d.id;else{let p=d.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(p?.href){let g=p.href.match(/\/product\/[^\/]+\/(\d+)/);g&&(c=g[1])}}c&&a.set(String(c),d)});let l=o[0].parentNode;if(!l)return;e.forEach(d=>{let c=a.get(String(d));c&&l.contains(c)&&l.appendChild(c)}),console.log("[PR Element] Reordered",o.length,"cards to match Redis order")}else s>=i&&(clearInterval(r),console.warn("[PR Element] Cards never appeared, skipping reorder"))},100)}disconnectedCallback(){this.cleanupScrollListener(),clearTimeout(this.timeout)}};customElements.get("product-ranking")||customElements.define("product-ranking",P);var q=class extends HTMLElement{constructor(){super(),this.state={productsPerPage:30,categories:[],trendingCategory:{name:"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646",slug:"trending-now",filter:null,hasSubcats:!1,url:null}},this.categoriesLoading=!0,this.seenProductIds=new Set}async connectedCallback(){this.innerHTML=`
            <div class="category-filter">
                <div class="categories-loading">\u062C\u0627\u0631\u0650 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A...</div>
            </div>
        `;try{await this.fetchCategoriesFromCloudRun();let t=this.createTemplate();this.innerHTML=t,await this.initializeCategorySections()}catch(t){this.handleInitError(t)}}disconnectedCallback(){}async fetchCategoriesFromCloudRun(){let t={228327271:{name:"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA/c228327271"},476899183:{name:"\u062C\u0644\u0627\u0628\u064A\u0627\u062A",url:"https://darlena.com/%D8%AC%D9%84%D8%A7%D8%A8%D9%8A%D8%A7%D8%AA/c476899183"},1466412179:{name:"\u062C\u062F\u064A\u062F\u0646\u0627",url:"https://darlena.com/%D8%AC%D8%AF%D9%8A%D8%AF-%D8%AF%D8%A7%D8%B1-%D9%84%D9%8A%D9%86%D8%A7/c1466412179"},289250285:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%83%D9%84%D9%88%D8%B4/c289250285"},1891285357:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B3%D9%88%D8%AF%D8%A7%D8%A1-%D8%B3%D8%A7%D8%AF%D8%A9/c1891285357"},2132455494:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D9%84%D9%88%D9%86%D8%A9/c2132455494"},940975465:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%AC%D9%8A%D9%88%D8%A8/c940975465"},1567146102:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%B4%D8%AA/c1567146102"},832995956:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D8%B7%D8%B1%D8%B2%D8%A9/c832995956"},2031226480:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B1%D8%A3%D8%B3/c2031226480"},1122348775:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B5%D9%8A%D9%81%D9%8A%D8%A9/c1122348775"},692927841:{name:"\u0637\u0631\u062D",url:"https://darlena.com/%D8%B7%D8%B1%D8%AD/c692927841"},639447590:{name:"\u0646\u0642\u0627\u0628\u0627\u062A",url:"https://darlena.com/%D9%86%D9%82%D8%A7%D8%A8%D8%A7%D8%AA/c639447590"},114756598:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646",url:"https://darlena.com/%D8%B4%D9%8A%D9%81%D9%88%D9%86/c114756598"}},e={"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646":1,\u062C\u062F\u064A\u062F\u0646\u0627:2,"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629":3,"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A":4,"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634":5,\u062C\u0644\u0627\u0628\u064A\u0627\u062A:6,"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646":7,"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629":8,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628":9,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A":10,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629":11,"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633":12,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629":13,\u0637\u0631\u062D:14,\u0646\u0642\u0627\u0628\u0627\u062A:15};try{let i=await h.getCategoriesFromRedis();if(!Array.isArray(i))throw new Error("Categories data is not an array");let s=i.map(r=>({slug:r.name,name:r.name,filter:r.name,hasSubcats:!1,count:r.count||0,ids:r.ids||(r.id?[r.id]:[])}));s=s.filter(r=>{if(r.ids.length>0){let o=Number(r.ids[0]);return t.hasOwnProperty(o)}return!1}).map(r=>{let o=Number(r.ids[0]);return{...r,name:t[o].name,slug:t[o].name.toLowerCase().replace(/\s+/g,"-"),url:t[o].url,ids:r.ids}}),s.sort((r,o)=>{let a=e[r.name]||999,l=e[o.name]||999;return a-l}),s.unshift({...this.state.trendingCategory}),this.state.categories=s}catch(i){throw this.state.categories=[{...this.state.trendingCategory}],i}finally{this.categoriesLoading=!1}}createTemplate(){return this.categoriesLoading?`
                <div class="category-filter">
                    <div class="categories-loading">\u062C\u0627\u0631\u0650 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A...</div>
                </div>
            `:`
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
                ${this.state.categories.map(e=>`
                    <div class="category-section" data-category="${e.slug}">
                        <div class="category-header">
                            ${e.url?`<a href="${e.url}" class="view-all">
                                     <i class="sicon-keyboard_arrow_left"></i>
                                     \u0645\u0634\u0627\u0647\u062F\u0629 \u0627\u0644\u0643\u0644
                                     <i class="sicon-keyboard_arrow_right"></i>
                                   </a>`:""}
                            <h2 class="category-title">${e.name}</h2>
                        </div>
                        <div id="products-${e.slug}">
                            <div class="slider-loading" style="text-align: center; padding: 1rem;">\u062C\u0627\u0631 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A...</div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `}async initializeCategorySections(){try{let t=this.state.categories.map(r=>r.slug==="trending-now"?h.getGlobalProducts(0,this.state.productsPerPage).then(o=>({slug:r.slug,ids:o.objectIDs||[]})).catch(o=>({slug:r.slug,ids:[],error:o})):r.ids&&r.ids.length>0?this.fetchRegularCategory(r).then(o=>({slug:r.slug,ids:o||[]})).catch(o=>({slug:r.slug,ids:[],error:o})):Promise.resolve({slug:r.slug,ids:[]})),i=(await Promise.all(t)).reduce((r,o)=>(r[o.slug]=o.ids,r),{});this.seenProductIds.clear();let s={};for(let r of this.state.categories){let o=i[r.slug]||[],a=[];for(let l of o)if(!this.seenProductIds.has(l)&&(this.seenProductIds.add(l),a.push(l),a.length>=6))break;s[r.slug]=a}this.renderProductSliders(s)}catch(t){this.handleInitError(t)}}async fetchRegularCategory(t){let e=t.ids.map(i=>h.getCategoryPageById(i,0,this.state.productsPerPage).catch(s=>({objectIDs:[]})));try{return(await Promise.all(e)).flatMap(s=>s&&s.objectIDs?s.objectIDs:[])}catch{return[]}}renderProductSliders(t){this.state.categories.forEach(e=>{let i=e.slug,s=t[i]||[],r=this.querySelector(`#products-${i}`);if(r)if(r.innerHTML="",s.length>0){let o=document.createElement("salla-products-slider");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(s)),o.setAttribute("limit",String(s.length)),o.setAttribute("slider-id",`slider-${i}`),o.setAttribute("block-title"," "),o.setAttribute("arrows","true"),o.setAttribute("rtl","true"),r.appendChild(o),setTimeout(()=>{o.querySelectorAll(".s-product-card-content-sub").forEach(l=>{l.children.length>1&&(l.style.display="flex",l.style.alignItems="center",l.style.justifyContent="space-between",l.style.flexWrap="nowrap",l.style.width="100%",l.style.overflow="visible")})},500)}else r.innerHTML='<div style="text-align: center; padding: 1rem;">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0639\u0631\u0636\u0647\u0627 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0629.</div>'})}handleInitError(t){this.innerHTML=`
            <div class="category-filter">
                <div class="error-message" style="color: #e53e3e; text-align: center; padding: 2rem; margin-top: 2rem;">
                    \u0639\u0630\u0631\u0627\u064B\u060C \u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A. \u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0635\u0641\u062D\u0629.
                    ${t?"<br><small>Error details logged.</small>":""}
                </div>
            </div>
        `}};customElements.get("mahaba-category-products")||customElements.define("mahaba-category-products",q);var N=class{constructor(){this.initialized=!1,this.productId=null,this.recentlyViewedKey="recently_viewed_products",this.maxRecentProducts=15,this.recentlyViewedClass="algolia-recently-viewed"}initialize(){if(!this.isProductPage())return;let t=this.getProductId();if(!t||this.initialized&&this.productId===t)return;this.productId=t,this.initialized=!0,this.addToRecentlyViewed(this.productId);let e=()=>{this.loadRecommendations(),this.loadRecentlyViewed()};document.readyState==="complete"||document.readyState==="interactive"?e():document.addEventListener("DOMContentLoaded",e)}loadRecommendations(){let t=document.querySelector('salla-products-slider[source="related"]');t?this.replaceRelatedProducts(t):this.waitForElement('salla-products-slider[source="related"]',e=>{this.replaceRelatedProducts(e)})}async loadRecentlyViewed(){let t=this.getRecentlyViewed();if(!t.length)return;let e=t.map(r=>parseInt(r,10)).filter(r=>r&&!isNaN(r)&&r!==parseInt(this.productId,10));if(!e.length)return;this.removeExistingRecentlyViewed();let i=document.createElement("algolia-recommendations-slider");i.className="algolia-recently-viewed mt-8";let s=document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"], algolia-recommendations-slider');this.insertRecentlyViewedSection(i,s),await i.initialize(e,{title:"\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0624\u062E\u0631\u0627\u064B",filterStock:!0,maxInStock:15}),console.log("[Bundle Recommendations] Recently viewed slider initialized with",e.length,"products")}insertRecentlyViewedSection(t,e){let i=document.querySelector(".product-details, .product-entry, #product-entry");if(i&&i.parentNode)return i.parentNode.insertBefore(t,i.nextSibling),!0;if(e){let r=e.closest(".s-products-slider-container, .algolia-slider-wrapper");if(r&&r.parentNode)return r.parentNode.insertBefore(t,r.nextSibling),!0;if(e.parentNode)return e.parentNode.insertBefore(t,e.nextSibling),!0}let s=document.querySelector("main, .s-product-page-content, #content, .s-product-page");return s?(s.appendChild(t),!0):(document.body.appendChild(t),!0)}addToRecentlyViewed(t){if(t)try{let e=parseInt(t,10);if(isNaN(e))return;let i=this.getRecentlyViewed();i=i.map(s=>parseInt(s,10)).filter(s=>!isNaN(s)),i=i.filter(s=>s!==e),i.unshift(e),i.length>this.maxRecentProducts&&(i=i.slice(0,this.maxRecentProducts)),sessionStorage.setItem(this.recentlyViewedKey,JSON.stringify(i))}catch{}}removeExistingRecentlyViewed(){document.querySelectorAll(`.${this.recentlyViewedClass}`).forEach(t=>t.remove())}getRecentlyViewed(){try{let t=sessionStorage.getItem(this.recentlyViewedKey);return t?JSON.parse(t):[]}catch{return[]}}isProductPage(){return!!document.querySelector('.product-form input[name="id"], [id^="product-"], .sidebar .details-slider')}getProductId(){let t=document.querySelector('.product-form input[name="id"]');if(t?.value){let o=parseInt(t.value,10);if(!isNaN(o))return o}let e=window.salla?.product?.id;if(e){let o=parseInt(e,10);if(!isNaN(o))return o}let i=document.querySelector(".product-entry, #product-entry, .product-details");if(i){let o=i.matches('[id^="product-"]')?i:i.querySelector('[id^="product-"]');if(o&&!o.closest("salla-products-slider")){let a=o.id.replace("product-",""),l=parseInt(a,10);if(!isNaN(l))return l}}let s=document.querySelector('[id^="product-"]');if(s&&!s.closest("salla-products-slider")){let o=s.id.replace("product-",""),a=parseInt(o,10);if(!isNaN(a))return a}let r=window.location.pathname.match(/\/p(\d+)/);if(r?.[1]){let o=parseInt(r[1],10);if(!isNaN(o))return o}return null}async replaceRelatedProducts(t){try{let e=this.productId,i=await h.getRecommendations(e);if(e!==this.productId){console.log("[Bundle Recommendations] Product changed during fetch, aborting");return}if(!i?.length)return;let s=i.map(o=>parseInt(o,10)).filter(o=>o&&!isNaN(o));if(!s.length)return;let r=document.createElement("algolia-recommendations-slider");r.className="product-recommendations-slider",t.parentNode.replaceChild(r,t),await r.initialize(s,{title:"\u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0634\u0627\u0628\u0647\u0629",filterStock:!0,maxInStock:15}),console.log("[Bundle Recommendations] Custom slider initialized with",s.length,"products")}catch(e){console.error("[Bundle Recommendations] Error:",e)}}reset(){this.initialized=!1,this.productId=null,this.removeExistingRecentlyViewed(),document.querySelectorAll("algolia-recommendations-slider").forEach(t=>{t.destroy&&t.destroy()})}waitForElement(t,e){let i=document.querySelector(t);if(i){e(i);return}let s=new MutationObserver(()=>{let r=document.querySelector(t);r&&(s.disconnect(),e(r))});s.observe(document.body,{childList:!0,subtree:!0})}},Y=new N,m=Y;var S=!1,A=0,B=2;function v(){if(console.log(`[PR Init] Attempt ${A+1}/${B}`),S)return;if(A++,A>B){console.warn("[PR Init] Max attempts reached");return}let n=document.querySelector('salla-products-list[source="product.index"], salla-products-list[source="categories"]');if(console.log("[PR Init] Category list found:",!!n),n){let e=n.getAttribute("source-value");if(e){console.log("[PR Init] \u2705 Creating ranking for category:",e),M("category",e),S=!0;return}}let t=document.querySelector('salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]');if(t){let e=t.getAttribute("source-value");if(e){console.log("[PR Init] \u2705 Creating ranking for tag:",e),M("tag",e),S=!0;return}}A<B&&(console.log("[PR Init] Retrying in 800ms..."),setTimeout(v,800))}function M(n,t){if(document.querySelector(`product-ranking[${n}-id="${t}"]`))return;let e=document.createElement("product-ranking");e.setAttribute(`${n}-id`,t),document.body.appendChild(e)}document.addEventListener("salla::page::changed",()=>{S=!1,A=0,document.querySelectorAll("product-ranking").forEach(n=>n.remove()),setTimeout(v,100)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",v):(v(),document.addEventListener("salla::ready",()=>{S||setTimeout(v,100)}));var G="[YouTube Opt-In]",u=(...n)=>console.log(G,...n),b=/\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i,j=!1;function K(){if(j||typeof HTMLIFrameElement>"u"||typeof Element>"u")return;j=!0;let n=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,"src"),t=Element.prototype.setAttribute;n&&n.set&&Object.defineProperty(HTMLIFrameElement.prototype,"src",{configurable:!0,enumerable:n.enumerable,get:n.get,set(e){return e&&b.test(e)&&this.dataset.ytOptIn!=="true"?(this.dataset.ytBlockedSrc=e,e):n.set.call(this,e)}}),Element.prototype.setAttribute=function(i,s){if(this.tagName==="IFRAME"&&i&&i.toLowerCase()==="src"&&s&&b.test(s)&&this.dataset.ytOptIn!=="true"){this.dataset.ytBlockedSrc=s,this.removeAttribute("src");return}return t.call(this,i,s)}}typeof window<"u"&&K();var O=!1;function _(){if(O||typeof document>"u")return;let n=document.createElement("style");n.id="youtube-placeholder-styles",n.textContent=`
    .yt-placeholder {
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 16 / 9;
      margin: 1rem 0;
      border-radius: 0.375rem;
      overflow: hidden;
      border: none;
      padding: 0;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      transition: background 0.3s ease;
    }
    .yt-placeholder__thumb {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease, filter 0.3s ease, opacity 0.3s ease;
      z-index: 0;
    }
    .yt-placeholder__icon {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      color: #282828;
      font-size: 1.5rem;
      line-height: 1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s ease, background 0.2s ease;
    }
    .yt-placeholder:hover {
      background: linear-gradient(135deg, #c62828 0%, #e53935 100%);
    }
    .yt-placeholder:hover .yt-placeholder__thumb {
      transform: scale(1.03);
      filter: brightness(0.8);
    }
    .yt-placeholder:focus-visible {
      outline: 3px solid #c62828;
      outline-offset: 2px;
    }
    .yt-placeholder:focus-visible .yt-placeholder__icon {
      transform: scale(1.1);
    }
    .yt-placeholder:active .yt-placeholder__icon {
      transform: scale(0.95);
    }
    @media (max-width: 640px) {
      .yt-placeholder__icon {
        width: 3.25rem;
        height: 3.25rem;
        font-size: 1.25rem;
      }
    }
  `,document.head.appendChild(n),O=!0}function I(n){if(!n)return"";let t=R(n);return t?`https://www.youtube.com/embed/${t}`:n.split("?")[0]}function R(n){if(!n)return null;let t=[/youtube\.com\/embed\/([^?&/]+)/,/youtube-nocookie\.com\/embed\/([^?&/]+)/,/youtube\.com\/v\/([^?&/]+)/,/youtube\.com\/watch\?v=([^&]+)/,/youtu\.be\/([^?&/]+)/,/youtube\.com\/shorts\/([^?&/]+)/];for(let e of t){let i=n.match(e);if(i&&i[1])return i[1]}return null}function D(n,t={}){_();let e=document.createElement("button");e.type="button",e.className="yt-placeholder",e.setAttribute("data-yt-src",n),e.setAttribute("aria-label","Play YouTube video");let i=t.videoId||R(n),r=t.thumbnailUrl||(i?`https://i.ytimg.com/vi/${i}/hqdefault.jpg`:null);if(r){let a=document.createElement("img");a.className="yt-placeholder__thumb",a.alt=t.thumbnailAlt||"Video thumbnail",a.loading="lazy",a.decoding="async",a.setAttribute("data-src",r),e.dataset.ytThumbSrc=r,e.appendChild(a)}let o=document.createElement("span");return o.className="yt-placeholder__icon",o.setAttribute("aria-hidden","true"),o.textContent="\u25B6",e.appendChild(o),e}var E=null;function y(n=document){if(!n)return;[...n.querySelectorAll("iframe"),...n.querySelectorAll("embed"),...n.querySelectorAll("object")].forEach(e=>{let i=e.src||e.getAttribute("src")||e.data||e.getAttribute("data")||e.dataset?.ytBlockedSrc;if(!i||!b.test(i))return;if("srcdoc"in e&&e.removeAttribute("srcdoc"),"src"in e){try{e.src="about:blank"}catch{}e.removeAttribute("src")}"data"in e&&e.removeAttribute("data");let s=D(I(i));e.width&&(s.style.width=e.width),e.height&&(s.style.height=e.height),e.style&&e.style.width&&(s.style.width=e.style.width),e.style&&e.style.height&&(s.style.height=e.style.height),s.addEventListener("click",x),s.setAttribute("data-click-bound","true"),C(s),e.parentNode&&e.parentNode.replaceChild(s,e)})}function $(n){let t=n.querySelector(".yt-placeholder__thumb");if(!t)return;let e=t.dataset.src;e&&(t.src=e,t.removeAttribute("data-src"),n.dataset.thumbLoaded="true")}function J(){E||typeof IntersectionObserver>"u"||(E=new IntersectionObserver(n=>{n.forEach(t=>{t.isIntersecting&&($(t.target),E.unobserve(t.target))})},{rootMargin:"200px 0px"}))}function C(n){let t=n.querySelector(".yt-placeholder__thumb");if(t&&n.dataset.thumbLoaded!=="true"){if(!t.dataset.src){n.dataset.thumbLoaded="true";return}if(typeof IntersectionObserver>"u"){$(n);return}J(),E.observe(n)}}function H(n){if(!n)return;u("Sanitizing fragment",n);let t=n.querySelectorAll("iframe"),e=n.querySelectorAll("embed"),i=n.querySelectorAll("object");[...t,...e,...i].forEach(r=>{let o=r.src||r.data||r.getAttribute("src")||r.getAttribute("data")||r.dataset?.ytBlockedSrc;if(o&&b.test(o)){let a=R(o),l=I(o),d=r.getAttribute("data-yt-thumb")||r.dataset?.ytThumb;u("Replacing YouTube embed with placeholder",{videoUrl:l,element:r});let c=D(l,{videoId:a,thumbnailUrl:d});r.width&&(c.style.width=r.width),r.height&&(c.style.height=r.height),r.style.width&&(c.style.width=r.style.width),r.style.height&&(c.style.height=r.style.height),r.parentNode.replaceChild(c,r)}})}function W(n){if(!n||typeof n!="string")return n;u("Sanitizing HTML string");let e=new DOMParser().parseFromString(n,"text/html");return H(e.body),e.body.innerHTML}function x(n){let t=n.currentTarget,e=t.getAttribute("data-yt-src"),i=I(e);if(!i)return;u("Placeholder clicked, loading iframe",{videoUrl:i});let s=document.createElement("iframe"),r=`${i}${i.includes("?")?"&":"?"}autoplay=1&rel=0`;s.dataset.ytOptIn="true",s.src=r,s.width=t.style.width||"100%",s.height=t.style.height||"100%",s.title="YouTube video",s.frameBorder="0",s.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",s.allowFullscreen=!0,s.style.aspectRatio="16/9",t.parentNode.replaceChild(s,t),s.focus()}function f(n=document){u("Initializing YouTube opt-in on root",n===document?"document":n),y(n),n.querySelectorAll("[data-yt-template]").forEach(s=>{if(s.hasAttribute("data-yt-processed"))return;s.setAttribute("data-yt-processed","true"),u("Processing template host",s);let r=s.getAttribute("data-yt-template"),o=document.getElementById(r);if(!o)return;u("Found template for host",r);let a=o.content.cloneNode(!0);H(a),s.appendChild(a)}),n.querySelectorAll(".yt-placeholder[data-yt-src]").forEach(s=>{if(!s.querySelector(".yt-placeholder__icon")&&s.tagName==="DIV"){u("Upgrading static placeholder div to button",s);let r=s.getAttribute("data-yt-src"),o=s.getAttribute("data-yt-thumb")||s.dataset?.ytThumb,a=D(r,{thumbnailUrl:o});a.className=s.className,Array.from(s.attributes).forEach(l=>{["class","data-yt-src","data-yt-thumb"].includes(l.name)||a.setAttribute(l.name,l.value)}),o&&a.setAttribute("data-yt-thumb",o),s.parentNode.replaceChild(a,s)}}),n.querySelectorAll("button.yt-placeholder[data-yt-src]").forEach(s=>{s.hasAttribute("data-click-bound")||(s.addEventListener("click",x),s.setAttribute("data-click-bound","true"),u("Bound click handler to placeholder",s)),C(s)})}function X(){u("Setting up dynamic handlers"),window.salla&&window.salla.event&&(window.salla.event.on("salla-products-slider::products.fetched",i=>{u("Event: salla-products-slider::products.fetched",i);let s=i?.container||document;y(s),f(s)}),window.salla.event.on("product::quickview.opened",i=>{u("Event: product::quickview.opened",i),y(document),f(document)}),window.salla.event.on("product::quickview.response",i=>{u("Event: product::quickview.response",i),i&&i.response&&i.response.html&&(u("Sanitizing quickview HTML response before render"),i.response.html=W(i.response.html)),y(document),f(document)}));let n=document.getElementById("btn-show-more");n&&n.addEventListener("click",()=>{u("Read more button clicked");let i=document.getElementById("more-content");i&&(y(i),f(i))});let t=new MutationObserver(i=>{i.forEach(s=>{u("Mutation observed",s),s.addedNodes.forEach(r=>{if(r.nodeType!==1)return;r.classList&&r.classList.contains("product-description-content")&&(u("New product-description-content detected, initializing",r),f(r));let o=[];r.tagName==="IFRAME"?o.push(r):r.querySelectorAll&&o.push(...r.querySelectorAll("iframe")),o.forEach(a=>{if(a.dataset&&a.dataset.ytOptIn==="true"){u("Observed opt-in iframe, skipping neutralization",a);return}let l=a.src||a.getAttribute("src")||a.dataset?.ytBlockedSrc;if(l&&b.test(l)){u("Stray iframe detected, neutralizing",a),a.removeAttribute("src"),a.removeAttribute("srcdoc"),a.src="about:blank";let d=I(l),c=D(d);c.addEventListener("click",x),c.setAttribute("data-click-bound","true"),u("Replacing stray iframe with placeholder",{videoUrl:d,iframe:a}),a.parentNode.replaceChild(c,a),C(c)}})})})});document.querySelectorAll(".product-description-content").forEach(i=>{t.observe(i,{childList:!0,subtree:!0})}),t.observe(document.body,{childList:!0,subtree:!0})}function Q(){u("Scanning for existing YouTube iframes");let n=document.querySelectorAll("iframe"),t=0;n.forEach(e=>{let i=e.src||e.getAttribute("src")||e.dataset?.ytBlockedSrc;if(i&&b.test(i)){if(e.dataset.ytOptIn==="true"||e.hasAttribute("data-yt-processed"))return;u("Found existing YouTube iframe, replacing",{src:i,iframe:e}),e.src="about:blank";let s=I(i),r=D(s);e.width&&(r.style.width=e.width),e.height&&(r.style.height=e.height),e.style.width&&(r.style.width=e.style.width),e.style.height&&(r.style.height=e.style.height),r.addEventListener("click",x),r.setAttribute("data-click-bound","true"),e.parentNode.replaceChild(r,e),C(r),t++}}),u(`Replaced ${t} existing YouTube iframes`)}function F(){u("Initializing module"),y(document),_(),f(),Q(),X()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",F):F();window.darlenaYoutubeOptIn=f;var Z=`
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
`,z=class{constructor(){this.processedElements=new WeakSet,this.pendingScan=!1,this.init()}getTitleClass(t){if(!t)return"";let e=t.length;return e>70?"title-extreme":e>50?"title-very-long":e>30?"title-long":e>15?"title-medium":""}enhanceTitle(t){if(this.processedElements.has(t))return;let e=t.textContent?.trim(),i=this.getTitleClass(e);i&&t.classList.add(i),this.processedElements.add(t)}enhanceAllTitles(){document.querySelectorAll(".s-product-card-content-title a").forEach(e=>this.enhanceTitle(e))}scheduleScan(){this.pendingScan||(this.pendingScan=!0,requestAnimationFrame(()=>{this.enhanceAllTitles(),this.pendingScan=!1}))}injectStyles(){if(document.getElementById("product-title-enhancer-styles"))return;let t=document.createElement("style");t.id="product-title-enhancer-styles",t.textContent=Z,document.head.appendChild(t)}setupMutationObserver(){new MutationObserver(e=>{let i=!1;for(let s of e){if(s.addedNodes.length){for(let r of s.addedNodes)if(r.nodeType===Node.ELEMENT_NODE&&(r.matches?.(".s-product-card-content-title a")||r.matches?.(".s-product-card-entry")||r.querySelector?.(".s-product-card-content-title a"))){i=!0;break}}if(i)break}i&&this.scheduleScan()}).observe(document.body,{childList:!0,subtree:!0})}setupSallaEventListeners(){window.salla?.event&&(window.salla.event.on("products::loaded",()=>this.scheduleScan()),window.salla.event.on("product::loaded",()=>this.scheduleScan())),document.addEventListener("theme::ready",()=>this.scheduleScan()),document.addEventListener("salla::page::changed",()=>{setTimeout(()=>this.scheduleScan(),100)})}init(){this.injectStyles(),this.enhanceAllTitles(),document.readyState==="loading"&&document.addEventListener("DOMContentLoaded",()=>this.enhanceAllTitles()),window.addEventListener("load",()=>this.enhanceAllTitles()),this.setupMutationObserver(),this.setupSallaEventListeners(),console.log("[Algolia Bundle] Product title enhancer initialized")}},fe=new z;window.productRecommendations=m;window.redisService=h;var ee=n=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n();function te(){if(!document.body.classList.contains("index")){console.log("[Algolia Bundle] Not on homepage, skipping category products injection");return}let n=".app-inner",t="mahaba-category-products";function e(){let s=document.querySelector(n);if(s&&!s.querySelector(t))try{console.log(`[Algolia Bundle] Found ${n}, injecting ${t}...`);let r=document.createElement(t),o=document.querySelector(".store-footer");return o?s.insertBefore(r,o):s.appendChild(r),console.log("\u2705 [Algolia Bundle] Homepage category component injected successfully"),!0}catch(r){return console.error("[Algolia Bundle] Error during injection:",r),!0}return!1}if(e())return;console.log(`[Algolia Bundle] ${n} not found, waiting for async load...`),new MutationObserver((s,r)=>{s.some(a=>a.addedNodes.length>0)&&e()&&r.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}function re(){if(document.getElementById("cart-addons-slider-styles"))return;let n=document.createElement("style");n.id="cart-addons-slider-styles",n.textContent=`
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
  `,document.head.appendChild(n)}function V(){re();let n=()=>{let e=document.querySelector("#cart-submit");if(!e)return!1;let i=e.closest(".cart-submit-wrap")||e.parentElement,s=i?.parentElement||i;if(!s)return!1;if(s.querySelector("cart-addons-slider"))return!0;let r=document.createElement("cart-addons-slider");return r.className="cart-addons-wrapper",i&&s?s.insertBefore(r,i.nextSibling):s.appendChild(r),console.log("[Algolia Bundle] Injected cart addons slider"),!0};if(document.querySelector("cart-addons-slider")||n())return;new MutationObserver((e,i)=>{n()&&i.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}ee(()=>{te(),document.querySelector('[id^="product-"]')&&setTimeout(()=>{m.initialize(),console.log("\u2705 [Algolia Bundle] Product recommendations initialized")},3e3),(document.querySelector('form[id^="item-"]')||document.querySelector("#cart-submit"))&&setTimeout(V,500),console.log("\u2705 [Algolia Bundle] Loaded successfully")});document.addEventListener("salla::page::changed",()=>{m.reset(),setTimeout(()=>{m.initialize()},1e3),setTimeout(V,500)});document.addEventListener("theme::ready",()=>{if(!document.querySelector('[id^="product-"]'))return;let n=m.getProductId();n&&m.productId&&n===m.productId||n&&(console.log("[Algolia Bundle] New product detected via theme::ready, re-initializing"),m.reset(),setTimeout(()=>{m.initialize()},1e3))});})();
