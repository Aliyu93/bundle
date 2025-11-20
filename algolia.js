(()=>{var q=class{constructor(){this.baseUrl="https://me-central2-gtm-5v2mhn4-mwvlm.cloudfunctions.net/function-2",this.maxRetries=2,this.headers={Accept:"application/json","Cache-Control":"public, max-age=3600"},this.cache=new Map,this.fallbackEnabled=!0}async getProducts(e,t,s=0,r=12){if(!t)return null;let i=`${e}:${t}:${s}:${r}`;if(this.cache.has(i))return this.cache.get(i);let o=e==="category"?"catID":"tagID",a=e==="category"?"categoryById":"tagById",d=`${this.baseUrl}/?type=${a}&${o}=${encodeURIComponent(t)}&offset=${s}&limit=${r}`,c=null;try{let l=new AbortController,u=setTimeout(()=>l.abort(),2e3),p=await fetch(d,{method:"GET",headers:this.headers,signal:l.signal});if(clearTimeout(u),!p.ok)throw new Error(`HTTP error: ${p.status}`);if(c=await p.json(),c?.objectIDs?.length)return this.cache.set(i,c),c}catch{}if(!c?.objectIDs?.length&&this.fallbackEnabled)try{let l=await fetch(d,{method:"GET",headers:this.headers});if(l.ok&&(c=await l.json(),c?.objectIDs?.length))return this.cache.set(i,c),c}catch{}return c||{objectIDs:[],hasMore:!1}}async getRecommendations(e){if(!e)return[];let t=`recommendations:${e}`;if(this.cache.has(t))return this.cache.get(t);let s=`${this.baseUrl}/?type=recommendations&objectID=${encodeURIComponent(e)}`;try{let r=new AbortController,i=setTimeout(()=>r.abort(),3e3),o=await fetch(s,{method:"GET",headers:this.headers,signal:r.signal});if(clearTimeout(i),!o.ok)return[];let a=await o.json(),d=Array.isArray(a?.relatedProductIDs)?a.relatedProductIDs:[];return this.cache.set(t,d),d}catch{return[]}}async getFrequentlyBought(e){if(!e)return[];let t=`frequently-bought:${e}`;if(this.cache.has(t))return this.cache.get(t);let s=`${this.baseUrl}/?type=frequentlyBought&objectID=${encodeURIComponent(e)}`;try{let r=new AbortController,i=setTimeout(()=>r.abort(),3e3),o=await fetch(s,{method:"GET",headers:this.headers,signal:r.signal});if(clearTimeout(i),!o.ok)return[];let a=await o.json(),d=Array.isArray(a?.frequentlyBoughtIDs)?a.frequentlyBoughtIDs:[];return this.cache.set(t,d),d}catch{return[]}}async getCategoriesFromRedis(){let e="all-categories";if(this.cache.has(e))return this.cache.get(e);try{let t=new AbortController,s=setTimeout(()=>t.abort(),5e3),r=await fetch(`${this.baseUrl}/?type=categories`,{method:"GET",headers:this.headers,signal:t.signal});if(clearTimeout(s),!r.ok)return[];let o=(await r.json()).categories||[];return this.cache.set(e,o),o}catch{return[]}}async getGlobalProducts(e=0,t=12){let s=`global-products:${e}:${t}`;if(this.cache.has(s))return this.cache.get(s);try{let r=new AbortController,i=setTimeout(()=>r.abort(),3e3),o=`${this.baseUrl}/?type=categoryById&catID=trending-now&offset=${e}&limit=${t}`,a=await fetch(o,{method:"GET",headers:this.headers,signal:r.signal});if(clearTimeout(i),!a.ok)return{objectIDs:[],hasMore:!1};let d=await a.json(),c={objectIDs:d.objectIDs||[],hasMore:d.hasMore||!1};return this.cache.set(s,c),c}catch{return{objectIDs:[],hasMore:!1}}}async getCategoryPageById(e,t=0,s=12){return this.getProducts("category",e,t,s)}async getCategoryProducts(e,t,s){return this.getProducts("category",e,t,s)}async getTagProducts(e,t,s){return this.getProducts("tag",e,t,s)}},g=new q;var N=class extends HTMLElement{constructor(){super(),this.initialized=!1,this.productIds=[],this.structureReady=!1}connectedCallback(){this.ensureStructure(),!this.initialized&&this.getHighestValueItemFromDOM().then(e=>e?this.fetchFrequentlyBoughtProducts(e):[]).then(()=>{this.renderProductList(),setTimeout(()=>{this.initializeSlider()},1e3)}).catch(e=>{console.error("[CartAddonsSlider] Error loading products:",e)})}ensureStructure(){if(!this.structureReady){if(!this.querySelector(".cart-addons-title")){let e=document.createElement("h3");e.className="cart-addons-title",e.textContent=window.salla?.lang?.get("pages.cart.frequently_bought_together")||"Frequently bought together",this.appendChild(e)}if(!this.querySelector(".frequently-bought-container")){let e=document.createElement("div");e.className="frequently-bought-container",this.appendChild(e)}this.structureReady=!0}}async getHighestValueItemFromDOM(){try{let e=document.querySelectorAll('form[id^="item-"]');if(!e||e.length===0)return console.log("[CartAddonsSlider] No cart items found in DOM"),null;let t=null,s=0;return e.forEach(r=>{try{let i=r.getAttribute("id")||"",o=i.replace("item-",""),a=r.querySelector('a[href*="/p"]');if(!a){console.log("[CartAddonsSlider] No product link found in form",i);return}let d=a.getAttribute("href"),c=d.match(/\/p(\d+)(?:$|\/|\?)/);if(!c||!c[1]){console.log("[CartAddonsSlider] Could not extract product ID from URL",d);return}let l=c[1],u=r.querySelector(".item-total");if(u){let T=(u.textContent||u.innerText||"0").replace(/[^\d.,٠١٢٣٤٥٦٧٨٩]/g,"").replace(/٠/g,"0").replace(/١/g,"1").replace(/٢/g,"2").replace(/٣/g,"3").replace(/٤/g,"4").replace(/٥/g,"5").replace(/٦/g,"6").replace(/٧/g,"7").replace(/٨/g,"8").replace(/٩/g,"9"),f=parseFloat(T.replace(",","."))||0;console.log(`[CartAddonsSlider] Item ${o}: Product ID ${l}, Total: ${f}`),!isNaN(f)&&f>s&&(s=f,t={itemId:o,productId:l,total:f})}}catch(i){console.error("[CartAddonsSlider] Error processing item form:",i)}}),t?(console.log("[CartAddonsSlider] Highest value item:",t),t.productId):null}catch(e){return console.error("[CartAddonsSlider] Error extracting cart data from DOM:",e),null}}async fetchFrequentlyBoughtProducts(e){try{console.log("[CartAddonsSlider] Fetching frequently bought products for:",e);let t=await g.getFrequentlyBought(e);return t&&t.length>0?(console.log("[CartAddonsSlider] Found frequently bought products:",t),this.productIds=t.map(s=>String(s)).slice(0,8),this.productIds):(console.log("[CartAddonsSlider] No frequently bought products found"),this.productIds=[],[])}catch(t){return console.error("[CartAddonsSlider] Error fetching frequently bought products:",t),this.productIds=[],[]}}renderProductList(){if(!this.productIds||this.productIds.length===0){console.log("[CartAddonsSlider] No products to render, hiding component"),this.style.display="none";return}console.log("[CartAddonsSlider] Rendering product list with IDs:",this.productIds);let e=this.querySelector(".frequently-bought-container");if(!e){console.error("[CartAddonsSlider] Container not found");return}let t=document.createElement("salla-products-list");if(t.setAttribute("source","selected"),t.setAttribute("loading","lazy"),t.setAttribute("source-value",JSON.stringify(this.productIds)),t.setAttribute("class","s-products-list-vertical-cards"),e.innerHTML="",e.appendChild(t),!this.querySelector(".touch-indicator")){let s=document.createElement("div");s.classList.add("touch-indicator"),this.appendChild(s)}console.log("[CartAddonsSlider] Product list rendered")}initializeSlider(){try{let e=this.querySelector("salla-products-list");if(!e){console.log("[CartAddonsSlider] Products list not found");return}e.style.opacity="1",window.salla?.event?.dispatch&&window.salla.event.dispatch("twilight::mutation"),this.initialized=!0,console.log("[CartAddonsSlider] Slider initialized")}catch(e){console.error("[CartAddonsSlider] Failed to initialize cart addons slider:",e)}}};customElements.get("cart-addons-slider")||(customElements.define("cart-addons-slider",N),console.log("[CartAddonsSlider] Custom element defined"));var R=class extends HTMLElement{constructor(){super(),this.swiper=null,this.productIds=[],this.initialized=!1}async initialize(e,t={}){if(this.initialized){console.warn("[AlgoliaSlider] Already initialized");return}this.productIds=e.slice(0,21);let{title:s="\u0645\u0646\u062A\u062C\u0627\u062A \u0642\u062F \u062A\u0639\u062C\u0628\u0643",displayAllUrl:r="",filterStock:i=!0,maxInStock:o=15}=t;this.innerHTML=`
            <div class="algolia-slider-wrapper s-products-slider-wrapper">
                <div class="algolia-slider-header s-slider-block__title">
                    <div class="s-slider-block__title-right">
                        <h2>${s}</h2>
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
        `,this.injectStyles(),await this.renderProducts(i,o),this.initialized=!0}async renderProducts(e,t){let s=this.querySelector(".swiper-wrapper");if(!s){console.error("[AlgoliaSlider] Swiper wrapper not found");return}let r=document.createElement("salla-products-list");r.setAttribute("source","selected"),r.setAttribute("source-value",JSON.stringify(this.productIds)),r.setAttribute("limit",this.productIds.length.toString()),r.setAttribute("display-all-url",""),r.className="algolia-products-source";let i=document.createElement("div");return i.style.cssText="opacity: 0; pointer-events: none; position: absolute; z-index: -1; top: 0; left: 0; width: 100%; height: 0; overflow: hidden;",i.className="algolia-temp-container",i.appendChild(r),this.appendChild(i),window.salla?.event?.dispatch("twilight::mutation"),new Promise(o=>{let a=d=>{r.contains(d.target)&&(window.salla?.event?.off("salla-products-list::products.fetched",a),setTimeout(()=>{this.moveProductsToSlider(r,s,e,t),i.remove(),o()},150))};window.salla?.event?.on("salla-products-list::products.fetched",a),setTimeout(()=>{i.parentNode&&(this.moveProductsToSlider(r,s,e,t),i.remove(),o())},3e3)})}moveProductsToSlider(e,t,s,r){let i=e.querySelectorAll(".s-product-card-entry, custom-salla-product-card");if(!i.length){console.warn("[AlgoliaSlider] No product cards found");return}console.log(`[AlgoliaSlider] Found ${i.length} products from Salla`);let o=new Map;i.forEach(d=>{let c=d.getAttribute("id")||d.id;if(c){let l=c.replace("product-","");o.set(l.toString(),d)}}),console.log("[AlgoliaSlider] Card map keys:",Array.from(o.keys())),console.log("[AlgoliaSlider] Target order from Algolia:",this.productIds);let a=0;this.productIds.forEach((d,c)=>{let l=o.get(d.toString());if(!l){console.warn(`[AlgoliaSlider] Product ${d} not found in rendered cards`);return}let u=l.classList.contains("s-product-card-out-of-stock");if(s&&(u||a>=r))return;u||a++;let p=document.createElement("div");p.className="s-products-slider-card swiper-slide",p.appendChild(l),t.appendChild(p),console.log(`[AlgoliaSlider] Added product ${d} at position ${c}`)}),console.log(`[AlgoliaSlider] Final order: ${a} in-stock products in Algolia order`),this.initializeSwiper()}initializeSwiper(){let e=this.querySelector(".swiper");if(!e){console.error("[AlgoliaSlider] Swiper container not found");return}if(!this.querySelectorAll(".swiper-slide").length){console.warn("[AlgoliaSlider] No slides to initialize");return}if(typeof Swiper>"u"){console.warn("[AlgoliaSlider] Swiper not available, using CSS fallback"),this.initializeCSSScroll();return}try{this.swiper=new Swiper(e,{slidesPerView:"auto",spaceBetween:16,rtl:!0,direction:"horizontal",navigation:{nextEl:".algolia-slider-next",prevEl:".algolia-slider-prev"},breakpoints:{320:{slidesPerView:2,spaceBetween:12},640:{slidesPerView:2,spaceBetween:12},768:{slidesPerView:3,spaceBetween:16},1024:{slidesPerView:4,spaceBetween:16}},on:{init:function(){console.log("[AlgoliaSlider] Swiper initialized successfully")}}}),console.log("[AlgoliaSlider] Swiper instance created")}catch(s){console.error("[AlgoliaSlider] Error initializing Swiper:",s),this.initializeCSSScroll()}}initializeCSSScroll(){let e=this.querySelector(".swiper-wrapper");if(!e)return;e.style.cssText=`
            display: flex !important;
            overflow-x: auto;
            scroll-behavior: smooth;
            gap: 1rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
        `;let t=this.querySelector(".swiper");t&&(t.style.overflow="hidden");let s=this.querySelector(".algolia-slider-prev"),r=this.querySelector(".algolia-slider-next");if(s&&r){s.addEventListener("click",()=>{e.scrollBy({left:-300,behavior:"smooth"})}),r.addEventListener("click",()=>{e.scrollBy({left:300,behavior:"smooth"})});let o=()=>{let a=e.scrollLeft<=0,d=e.scrollLeft>=e.scrollWidth-e.clientWidth-10;s.disabled=a,r.disabled=d,s.classList.toggle("swiper-button-disabled",a),r.classList.toggle("swiper-button-disabled",d)};e.addEventListener("scroll",o),o()}console.log("[AlgoliaSlider] CSS scroll fallback initialized")}injectStyles(){if(document.getElementById("algolia-slider-styles"))return;let e=document.createElement("style");e.id="algolia-slider-styles",e.textContent=`
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
        `,document.head.appendChild(e),console.log("[AlgoliaSlider] Styles injected")}disconnectedCallback(){this.destroy()}destroy(){if(this.swiper){try{this.swiper.destroy(!0,!0),console.log("[AlgoliaSlider] Swiper destroyed")}catch(e){console.error("[AlgoliaSlider] Error destroying Swiper:",e)}this.swiper=null}this.initialized=!1}};customElements.get("algolia-recommendations-slider")||(customElements.define("algolia-recommendations-slider",R),console.log("[AlgoliaSlider] Custom element registered"));var M=class extends HTMLElement{constructor(){super(),this.page=0,this.loading=!1,this.hasMore=!0,this.ids=[],this.container=null,this.originalList=null,this.usingSallaFilter=!1,this.timeout=null}async connectedCallback(){let e=this.getAttribute("category-id"),t=this.getAttribute("tag-id");if(console.log("[PR Element] Connected:",{categoryId:e,tagId:t}),!(!e&&!t))try{await this.waitForSalla(),this.setupFilterListener(),await this.initialize(e,t)}catch(s){console.error("[PR Element] Error:",s),this.restoreOriginalList()}}restoreOriginalList(){if(!this.originalList||this.usingSallaFilter)return;let e=document.querySelector(".ranked-products, salla-products-list[filter]"),t=e?.parentNode||this.originalList.parentNode;e&&e.remove(),this.container&&(this.container.remove(),this.container=null),t&&!t.querySelector("salla-products-list")&&(t.appendChild(this.originalList.cloneNode(!0)),window.salla?.event?.dispatch("twilight::mutation"))}setupFilterListener(){document.addEventListener("change",e=>{if(e.target.id!=="product-filter")return;let t=e.target.value;t==="ourSuggest"&&this.usingSallaFilter?this.applyRedisRanking():t!=="ourSuggest"&&this.applySallaFilter(t)})}async applySallaFilter(e){let t=this.getAttribute("category-id"),s=this.getAttribute("tag-id");if(!this.originalList)return;let r=document.querySelector(".ranked-products, salla-products-list[filter]"),i=r?.parentNode||this.container?.parentNode;if(!i)return;r&&r.remove(),this.container&&(this.container.remove(),this.container=null),this.cleanupScrollListener(),this.usingSallaFilter=!0;let o=this.originalList.cloneNode(!0);o.setAttribute("filter",e),i.appendChild(o),window.salla?.event?.dispatch("twilight::mutation")}async applyRedisRanking(){let e=this.getAttribute("category-id"),t=this.getAttribute("tag-id");this.usingSallaFilter=!1,await this.initialize(e,t,!0)}async initialize(e,t,s=!1){if(console.log("[PR Element] Initialize called"),this.container&&!this.usingSallaFilter&&!s)return;let r=e?'salla-products-list[source="product.index"], salla-products-list[source="categories"]':'salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]',i=document.querySelector(r);if(console.log("[PR Element] Existing list found:",!!i),!i)return;this.originalList||(this.originalList=i.cloneNode(!0));let o=document.getElementById("product-filter");if(o)o.value="ourSuggest",this.usingSallaFilter=!1;else if(o&&o.value!=="ourSuggest"&&!s){this.usingSallaFilter=!0;return}let a=e?g.getCategoryProducts(e,0,12):g.getTagProducts(t,0,12),d=i.parentNode;this.container=document.createElement("div"),this.container.className="ranked-products",d.insertBefore(this.container,i),clearTimeout(this.timeout),this.timeout=setTimeout(()=>{(!this.ids||!this.ids.length)&&this.restoreOriginalList()},2500);let c=await a;if(clearTimeout(this.timeout),console.log("[PR Element] Redis data received:",c?.objectIDs?.length,"products"),console.log("[PR Element] Redis product IDs:",c.objectIDs),!c?.objectIDs?.length){console.warn("[PR Element] No products from Redis, restoring original"),this.restoreOriginalList();return}this.ids=c.objectIDs,this.page=0,this.hasMore=!0,this.usingSallaFilter=!1;let l=document.createElement("salla-products-list");l.setAttribute("source","selected"),l.setAttribute("source-value",JSON.stringify(this.ids)),l.setAttribute("limit",this.ids.length),l.className=i.className||"w-full",this.container.appendChild(l),i.remove(),window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(this.container,this.ids),this.setupScrollListener()}setupScrollListener(){this.cleanupScrollListener(),this._boundScrollHandler=this.handleScroll.bind(this),window.addEventListener("scroll",this._boundScrollHandler)}cleanupScrollListener(){this._boundScrollHandler&&(window.removeEventListener("scroll",this._boundScrollHandler),this._boundScrollHandler=null)}handleScroll(){if(this.loading||!this.hasMore||this.usingSallaFilter)return;let e=window.scrollY+window.innerHeight,t=document.documentElement.scrollHeight*.5;e>t&&this.loadMore()}async loadMore(){if(!(this.loading||!this.hasMore)){this.loading=!0;try{let e=this.page+1,t=e*12,s=this.getAttribute("category-id"),r=this.getAttribute("tag-id"),i=s?await g.getCategoryProducts(s,t,12):await g.getTagProducts(r,t,12);if(!i?.objectIDs?.length){this.hasMore=!1;return}let o=document.createElement("salla-products-list");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(i.objectIDs)),o.setAttribute("limit",i.objectIDs.length),o.className="w-full",this.container.appendChild(o),this.page=e,this.hasMore=i.hasMore!==!1,window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(o,i.objectIDs)}catch{this.hasMore=!1}finally{this.loading=!1}}}async waitForSalla(){if(!window.salla)return new Promise(e=>{document.addEventListener("salla::ready",e,{once:!0}),setTimeout(e,3e3)})}applyOrderToList(e,t,s=30){if(!e||!t||!t.length)return;let r=0,i=setInterval(()=>{r++;let o=Array.from(e.querySelectorAll("custom-salla-product-card, .s-product-card-entry"));if(o.length>0){clearInterval(i);let a=new Map;o.forEach(c=>{let l=null;if(c.dataset.id)l=c.dataset.id;else if(c.id&&!isNaN(c.id))l=c.id;else{let u=c.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(u?.href){let p=u.href.match(/\/product\/[^\/]+\/(\d+)/);p&&(l=p[1])}}l&&a.set(String(l),c)});let d=o[0].parentNode;if(!d)return;t.forEach(c=>{let l=a.get(String(c));l&&d.contains(l)&&d.appendChild(l)}),console.log("[PR Element] Reordered",o.length,"cards to match Redis order")}else r>=s&&(clearInterval(i),console.warn("[PR Element] Cards never appeared, skipping reorder"))},100)}disconnectedCallback(){this.cleanupScrollListener(),clearTimeout(this.timeout)}};customElements.get("product-ranking")||customElements.define("product-ranking",M);var z=class extends HTMLElement{constructor(){super(),this.state={productsPerPage:30,categories:[],trendingCategory:{name:"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646",slug:"trending-now",filter:null,hasSubcats:!1,url:null}},this.categoriesLoading=!0,this.seenProductIds=new Set}async connectedCallback(){this.innerHTML=`
            <div class="category-filter">
                <div class="categories-loading">\u062C\u0627\u0631\u0650 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A...</div>
            </div>
        `;try{await this.fetchCategoriesFromCloudRun();let e=this.createTemplate();this.innerHTML=e,await this.initializeCategorySections()}catch(e){this.handleInitError(e)}}disconnectedCallback(){}async fetchCategoriesFromCloudRun(){let e={228327271:{name:"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA/c228327271"},476899183:{name:"\u062C\u0644\u0627\u0628\u064A\u0627\u062A",url:"https://darlena.com/%D8%AC%D9%84%D8%A7%D8%A8%D9%8A%D8%A7%D8%AA/c476899183"},1466412179:{name:"\u062C\u062F\u064A\u062F\u0646\u0627",url:"https://darlena.com/%D8%AC%D8%AF%D9%8A%D8%AF-%D8%AF%D8%A7%D8%B1-%D9%84%D9%8A%D9%86%D8%A7/c1466412179"},289250285:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%83%D9%84%D9%88%D8%B4/c289250285"},1891285357:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B3%D9%88%D8%AF%D8%A7%D8%A1-%D8%B3%D8%A7%D8%AF%D8%A9/c1891285357"},2132455494:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D9%84%D9%88%D9%86%D8%A9/c2132455494"},940975465:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%AC%D9%8A%D9%88%D8%A8/c940975465"},1567146102:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%B4%D8%AA/c1567146102"},832995956:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D8%B7%D8%B1%D8%B2%D8%A9/c832995956"},2031226480:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B1%D8%A3%D8%B3/c2031226480"},1122348775:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B5%D9%8A%D9%81%D9%8A%D8%A9/c1122348775"},692927841:{name:"\u0637\u0631\u062D",url:"https://darlena.com/%D8%B7%D8%B1%D8%AD/c692927841"},639447590:{name:"\u0646\u0642\u0627\u0628\u0627\u062A",url:"https://darlena.com/%D9%86%D9%82%D8%A7%D8%A8%D8%A7%D8%AA/c639447590"},114756598:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646",url:"https://darlena.com/%D8%B4%D9%8A%D9%81%D9%88%D9%86/c114756598"}},t={"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646":1,\u062C\u062F\u064A\u062F\u0646\u0627:2,"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629":3,"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A":4,"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634":5,\u062C\u0644\u0627\u0628\u064A\u0627\u062A:6,"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646":7,"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629":8,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628":9,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A":10,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629":11,"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633":12,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629":13,\u0637\u0631\u062D:14,\u0646\u0642\u0627\u0628\u0627\u062A:15};try{let s=await g.getCategoriesFromRedis();if(!Array.isArray(s))throw new Error("Categories data is not an array");let r=s.map(i=>({slug:i.name,name:i.name,filter:i.name,hasSubcats:!1,count:i.count||0,ids:i.ids||(i.id?[i.id]:[])}));r=r.filter(i=>{if(i.ids.length>0){let o=Number(i.ids[0]);return e.hasOwnProperty(o)}return!1}).map(i=>{let o=Number(i.ids[0]);return{...i,name:e[o].name,slug:e[o].name.toLowerCase().replace(/\s+/g,"-"),url:e[o].url,ids:i.ids}}),r.sort((i,o)=>{let a=t[i.name]||999,d=t[o.name]||999;return a-d}),r.unshift({...this.state.trendingCategory}),this.state.categories=r}catch(s){throw this.state.categories=[{...this.state.trendingCategory}],s}finally{this.categoriesLoading=!1}}createTemplate(){return this.categoriesLoading?`
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
                ${this.state.categories.map(t=>`
                    <div class="category-section" data-category="${t.slug}">
                        <div class="category-header">
                            ${t.url?`<a href="${t.url}" class="view-all">
                                     <i class="sicon-keyboard_arrow_left"></i>
                                     \u0645\u0634\u0627\u0647\u062F\u0629 \u0627\u0644\u0643\u0644
                                     <i class="sicon-keyboard_arrow_right"></i>
                                   </a>`:""}
                            <h2 class="category-title">${t.name}</h2>
                        </div>
                        <div id="products-${t.slug}">
                            <div class="slider-loading" style="text-align: center; padding: 1rem;">\u062C\u0627\u0631 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A...</div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `}async initializeCategorySections(){try{let e=this.state.categories.map(i=>i.slug==="trending-now"?g.getGlobalProducts(0,this.state.productsPerPage).then(o=>({slug:i.slug,ids:o.objectIDs||[]})).catch(o=>({slug:i.slug,ids:[],error:o})):i.ids&&i.ids.length>0?this.fetchRegularCategory(i).then(o=>({slug:i.slug,ids:o||[]})).catch(o=>({slug:i.slug,ids:[],error:o})):Promise.resolve({slug:i.slug,ids:[]})),s=(await Promise.all(e)).reduce((i,o)=>(i[o.slug]=o.ids,i),{});this.seenProductIds.clear();let r={};for(let i of this.state.categories){let o=s[i.slug]||[],a=[];for(let d of o)if(!this.seenProductIds.has(d)&&(this.seenProductIds.add(d),a.push(d),a.length>=6))break;r[i.slug]=a}this.renderProductSliders(r)}catch(e){this.handleInitError(e)}}async fetchRegularCategory(e){let t=e.ids.map(s=>g.getCategoryPageById(s,0,this.state.productsPerPage).catch(r=>({objectIDs:[]})));try{return(await Promise.all(t)).flatMap(r=>r&&r.objectIDs?r.objectIDs:[])}catch{return[]}}renderProductSliders(e){this.state.categories.forEach(t=>{let s=t.slug,r=e[s]||[],i=this.querySelector(`#products-${s}`);if(i)if(i.innerHTML="",r.length>0){let o=document.createElement("salla-products-slider");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(r)),o.setAttribute("limit",String(r.length)),o.setAttribute("slider-id",`slider-${s}`),o.setAttribute("block-title"," "),o.setAttribute("arrows","true"),o.setAttribute("rtl","true"),i.appendChild(o),setTimeout(()=>{o.querySelectorAll(".s-product-card-content-sub").forEach(d=>{d.children.length>1&&(d.style.display="flex",d.style.alignItems="center",d.style.justifyContent="space-between",d.style.flexWrap="nowrap",d.style.width="100%",d.style.overflow="visible")})},500)}else i.innerHTML='<div style="text-align: center; padding: 1rem;">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0639\u0631\u0636\u0647\u0627 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0629.</div>'})}handleInitError(e){this.innerHTML=`
            <div class="category-filter">
                <div class="error-message" style="color: #e53e3e; text-align: center; padding: 2rem; margin-top: 2rem;">
                    \u0639\u0630\u0631\u0627\u064B\u060C \u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A. \u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0635\u0641\u062D\u0629.
                    ${e?"<br><small>Error details logged.</small>":""}
                </div>
            </div>
        `}};customElements.get("mahaba-category-products")||customElements.define("mahaba-category-products",z);var B=class{constructor(){this.initialized=!1,this.productId=null,this.recentlyViewedKey="recently_viewed_products",this.maxRecentProducts=15,this.recentlyViewedClass="algolia-recently-viewed"}initialize(){if(!this.isProductPage())return;let e=this.getProductId();if(!e||this.initialized&&this.productId===e)return;this.productId=e,this.initialized=!0,this.addToRecentlyViewed(this.productId);let t=()=>{this.loadRecommendations(),this.loadRecentlyViewed()};document.readyState==="complete"||document.readyState==="interactive"?t():document.addEventListener("DOMContentLoaded",t)}loadRecommendations(){let e=document.querySelector('salla-products-slider[source="related"]');e?this.replaceRelatedProducts(e):this.waitForElement('salla-products-slider[source="related"]',t=>{this.replaceRelatedProducts(t)})}async loadRecentlyViewed(){let e=this.getRecentlyViewed();if(!e.length)return;let t=e.map(i=>parseInt(i,10)).filter(i=>i&&!isNaN(i)&&i!==parseInt(this.productId,10));if(!t.length)return;this.removeExistingRecentlyViewed();let s=document.createElement("algolia-recommendations-slider");s.className="algolia-recently-viewed mt-8";let r=document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"], algolia-recommendations-slider');this.insertRecentlyViewedSection(s,r),await s.initialize(t,{title:"\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0624\u062E\u0631\u0627\u064B",filterStock:!0,maxInStock:15}),console.log("[Bundle Recommendations] Recently viewed slider initialized with",t.length,"products")}insertRecentlyViewedSection(e,t){let s=document.querySelector(".product-details, .product-entry, #product-entry");if(s&&s.parentNode)return s.parentNode.insertBefore(e,s.nextSibling),!0;if(t){let i=t.closest(".s-products-slider-container, .algolia-slider-wrapper");if(i&&i.parentNode)return i.parentNode.insertBefore(e,i.nextSibling),!0;if(t.parentNode)return t.parentNode.insertBefore(e,t.nextSibling),!0}let r=document.querySelector("main, .s-product-page-content, #content, .s-product-page");return r?(r.appendChild(e),!0):(document.body.appendChild(e),!0)}addToRecentlyViewed(e){if(e)try{let t=parseInt(e,10);if(isNaN(t))return;let s=this.getRecentlyViewed();s=s.map(r=>parseInt(r,10)).filter(r=>!isNaN(r)),s=s.filter(r=>r!==t),s.unshift(t),s.length>this.maxRecentProducts&&(s=s.slice(0,this.maxRecentProducts)),sessionStorage.setItem(this.recentlyViewedKey,JSON.stringify(s))}catch{}}removeExistingRecentlyViewed(){document.querySelectorAll(`.${this.recentlyViewedClass}`).forEach(e=>e.remove())}getRecentlyViewed(){try{let e=sessionStorage.getItem(this.recentlyViewedKey);return e?JSON.parse(e):[]}catch{return[]}}isProductPage(){return!!document.querySelector('.product-form input[name="id"], [id^="product-"], .sidebar .details-slider')}getProductId(){let e=document.querySelector('.product-form input[name="id"]');if(e?.value){let o=parseInt(e.value,10);if(!isNaN(o))return o}let t=window.salla?.product?.id;if(t){let o=parseInt(t,10);if(!isNaN(o))return o}let s=document.querySelector(".product-entry, #product-entry, .product-details");if(s){let o=s.matches('[id^="product-"]')?s:s.querySelector('[id^="product-"]');if(o&&!o.closest("salla-products-slider")){let a=o.id.replace("product-",""),d=parseInt(a,10);if(!isNaN(d))return d}}let r=document.querySelector('[id^="product-"]');if(r&&!r.closest("salla-products-slider")){let o=r.id.replace("product-",""),a=parseInt(o,10);if(!isNaN(a))return a}let i=window.location.pathname.match(/\/p(\d+)/);if(i?.[1]){let o=parseInt(i[1],10);if(!isNaN(o))return o}return null}async replaceRelatedProducts(e){try{let t=this.productId,s=await g.getRecommendations(t);if(t!==this.productId){console.log("[Bundle Recommendations] Product changed during fetch, aborting");return}if(!s?.length)return;let r=s.map(o=>parseInt(o,10)).filter(o=>o&&!isNaN(o));if(!r.length)return;let i=document.createElement("algolia-recommendations-slider");i.className="product-recommendations-slider",e.parentNode.replaceChild(i,e),await i.initialize(r,{title:"\u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0634\u0627\u0628\u0647\u0629",filterStock:!0,maxInStock:15}),console.log("[Bundle Recommendations] Custom slider initialized with",r.length,"products")}catch(t){console.error("[Bundle Recommendations] Error:",t)}}reset(){this.initialized=!1,this.productId=null,this.removeExistingRecentlyViewed(),document.querySelectorAll("algolia-recommendations-slider").forEach(e=>{e.destroy&&e.destroy()})}waitForElement(e,t){let s=document.querySelector(e);if(s){t(s);return}let r=new MutationObserver(()=>{let i=document.querySelector(e);i&&(r.disconnect(),t(i))});r.observe(document.body,{childList:!0,subtree:!0})}},J=new B,m=J;var S=!1,v=0,$=2;function A(){if(console.log(`[PR Init] Attempt ${v+1}/${$}`),S)return;if(v++,v>$){console.warn("[PR Init] Max attempts reached");return}let n=document.querySelector('salla-products-list[source="product.index"], salla-products-list[source="categories"]');if(console.log("[PR Init] Category list found:",!!n),n){let t=n.getAttribute("source-value");if(t){console.log("[PR Init] \u2705 Creating ranking for category:",t),O("category",t),S=!0;return}}let e=document.querySelector('salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]');if(e){let t=e.getAttribute("source-value");if(t){console.log("[PR Init] \u2705 Creating ranking for tag:",t),O("tag",t),S=!0;return}}v<$&&(console.log("[PR Init] Retrying in 800ms..."),setTimeout(A,800))}function O(n,e){if(document.querySelector(`product-ranking[${n}-id="${e}"]`))return;let t=document.createElement("product-ranking");t.setAttribute(`${n}-id`,e),document.body.appendChild(t)}document.addEventListener("salla::page::changed",()=>{S=!1,v=0,document.querySelectorAll("product-ranking").forEach(n=>n.remove()),setTimeout(A,100)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",A):(A(),document.addEventListener("salla::ready",()=>{S||setTimeout(A,100)}));var Q="[YouTube Opt-In]",h=(...n)=>console.log(Q,...n),x=/\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i,H=!1;function V(){if(H||typeof document>"u")return;let n=document.createElement("style");n.id="youtube-placeholder-styles",n.textContent=`
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
  `,document.head.appendChild(n),H=!0}function I(n){if(!n)return"";let e=_(n);return e?`https://www.youtube.com/embed/${e}`:n.split("?")[0]}function _(n){if(!n)return null;let e=[/youtube\.com\/embed\/([^?&/]+)/,/youtube-nocookie\.com\/embed\/([^?&/]+)/,/youtube\.com\/v\/([^?&/]+)/,/youtube\.com\/watch\?v=([^&]+)/,/youtu\.be\/([^?&/]+)/,/youtube\.com\/shorts\/([^?&/]+)/];for(let t of e){let s=n.match(t);if(s&&s[1])return s[1]}return null}function E(n,e={}){V();let t=document.createElement("button");t.type="button",t.className="yt-placeholder",t.setAttribute("data-yt-src",n),t.setAttribute("aria-label","Play YouTube video");let s=e.videoId||_(n),r=e.thumbnailUrl,i=r||(s?`https://i.ytimg.com/vi/${s}/hqdefault.jpg`:null);if(i){let a=document.createElement("img");a.className="yt-placeholder__thumb",a.alt=e.thumbnailAlt||"Video thumbnail",a.loading="lazy",a.decoding="async",r?(a.src=i,t.dataset.thumbLoaded="true"):a.setAttribute("data-src",i),t.dataset.ytThumbSrc=i,t.appendChild(a)}let o=document.createElement("span");return o.className="yt-placeholder__icon",o.setAttribute("aria-hidden","true"),o.textContent="\u25B6",t.appendChild(o),t}var C=null;function w(n=document){if(!n)return;[...n.querySelectorAll("iframe"),...n.querySelectorAll("embed"),...n.querySelectorAll("object")].forEach(t=>{let s=t.src||t.getAttribute("src")||t.data||t.getAttribute("data");if(!s||!x.test(s))return;if("srcdoc"in t&&t.removeAttribute("srcdoc"),"src"in t){try{t.src="about:blank"}catch{}t.removeAttribute("src")}"data"in t&&t.removeAttribute("data");let r=E(I(s));t.width&&(r.style.width=t.width),t.height&&(r.style.height=t.height),t.style&&t.style.width&&(r.style.width=t.style.width),t.style&&t.style.height&&(r.style.height=t.style.height),r.addEventListener("click",k),r.setAttribute("data-click-bound","true"),P(r),t.parentNode&&t.parentNode.replaceChild(r,t)})}function Y(n){let e=n.querySelector(".yt-placeholder__thumb");if(!e)return;let t=e.dataset.src;t&&(e.src=t,e.removeAttribute("data-src"),n.dataset.thumbLoaded="true")}function Z(){C||typeof IntersectionObserver>"u"||(C=new IntersectionObserver(n=>{n.forEach(e=>{e.isIntersecting&&(Y(e.target),C.unobserve(e.target))})},{rootMargin:"200px 0px"}))}function P(n){let e=n.querySelector(".yt-placeholder__thumb");if(e&&n.dataset.thumbLoaded!=="true"){if(!e.dataset.src){n.dataset.thumbLoaded="true";return}if(typeof IntersectionObserver>"u"){Y(n);return}Z(),C.observe(n)}}function W(n){if(!n)return;h("Sanitizing fragment",n);let e=n.querySelectorAll("iframe"),t=n.querySelectorAll("embed"),s=n.querySelectorAll("object");[...e,...t,...s].forEach(i=>{let o=i.src||i.data||i.getAttribute("src")||i.getAttribute("data");if(o&&x.test(o)){let a=_(o),d=I(o),c=i.getAttribute("data-yt-thumb")||i.dataset?.ytThumb;h("Replacing YouTube embed with placeholder",{videoUrl:d,element:i});let l=E(d,{videoId:a,thumbnailUrl:c});i.width&&(l.style.width=i.width),i.height&&(l.style.height=i.height),i.style.width&&(l.style.width=i.style.width),i.style.height&&(l.style.height=i.style.height),i.parentNode.replaceChild(l,i)}})}function ee(n){if(!n||typeof n!="string")return n;h("Sanitizing HTML string");let t=new DOMParser().parseFromString(n,"text/html");return W(t.body),t.body.innerHTML}function k(n){let e=n.currentTarget,t=e.getAttribute("data-yt-src"),s=I(t);if(!s)return;h("Placeholder clicked, loading iframe",{videoUrl:s});let r=document.createElement("iframe"),i=`${s}${s.includes("?")?"&":"?"}autoplay=1&rel=0`;r.src=i,r.width=e.style.width||"100%",r.height=e.style.height||"100%",r.title="YouTube video",r.frameBorder="0",r.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",r.allowFullscreen=!0,r.style.aspectRatio="16/9",r.dataset.ytOptIn="true",e.parentNode.replaceChild(r,e),r.focus()}function y(n=document){h("Initializing YouTube opt-in on root",n===document?"document":n),w(n),n.querySelectorAll("[data-yt-template]").forEach(r=>{if(r.hasAttribute("data-yt-processed"))return;r.setAttribute("data-yt-processed","true"),h("Processing template host",r);let i=r.getAttribute("data-yt-template"),o=document.getElementById(i);if(!o)return;h("Found template for host",i);let a=o.content.cloneNode(!0);W(a),r.appendChild(a)}),n.querySelectorAll(".yt-placeholder[data-yt-src]").forEach(r=>{if(!r.querySelector(".yt-placeholder__icon")&&r.tagName==="DIV"){h("Upgrading static placeholder div to button",r);let i=r.getAttribute("data-yt-src"),o=r.getAttribute("data-yt-thumb")||r.dataset?.ytThumb,a=E(i,{thumbnailUrl:o});a.className=r.className,Array.from(r.attributes).forEach(d=>{["class","data-yt-src","data-yt-thumb"].includes(d.name)||a.setAttribute(d.name,d.value)}),o&&a.setAttribute("data-yt-thumb",o),r.parentNode.replaceChild(a,r)}}),n.querySelectorAll("button.yt-placeholder[data-yt-src]").forEach(r=>{r.hasAttribute("data-click-bound")||(r.addEventListener("click",k),r.setAttribute("data-click-bound","true"),h("Bound click handler to placeholder",r)),P(r)})}function te(){h("Setting up dynamic handlers"),window.salla&&window.salla.event&&(window.salla.event.on("salla-products-slider::products.fetched",s=>{h("Event: salla-products-slider::products.fetched",s);let r=s?.container||document;w(r),y(r)}),window.salla.event.on("product::quickview.opened",s=>{h("Event: product::quickview.opened",s),w(document),y(document)}),window.salla.event.on("product::quickview.response",s=>{h("Event: product::quickview.response",s),s&&s.response&&s.response.html&&(h("Sanitizing quickview HTML response before render"),s.response.html=ee(s.response.html)),w(document),y(document)}));let n=document.getElementById("btn-show-more");n&&n.addEventListener("click",()=>{h("Read more button clicked");let s=document.getElementById("more-content");s&&(w(s),y(s))});let e=new MutationObserver(s=>{s.forEach(r=>{h("Mutation observed",r),r.addedNodes.forEach(i=>{if(i.nodeType!==1)return;i.classList&&i.classList.contains("product-description-content")&&(h("New product-description-content detected, initializing",i),y(i));let o=[];i.tagName==="IFRAME"?o.push(i):i.querySelectorAll&&o.push(...i.querySelectorAll("iframe")),o.forEach(a=>{if(a.dataset&&a.dataset.ytOptIn==="true"){h("Observed opt-in iframe, skipping neutralization",a);return}let d=a.src||a.getAttribute("src");if(d&&x.test(d)){h("Stray iframe detected, neutralizing",a),a.removeAttribute("src"),a.removeAttribute("srcdoc"),a.src="about:blank";let c=I(d),l=E(c);l.addEventListener("click",k),l.setAttribute("data-click-bound","true"),h("Replacing stray iframe with placeholder",{videoUrl:c,iframe:a}),a.parentNode.replaceChild(l,a),P(l)}})})})});document.querySelectorAll(".product-description-content").forEach(s=>{e.observe(s,{childList:!0,subtree:!0})}),e.observe(document.body,{childList:!0,subtree:!0})}function re(){h("Scanning for existing YouTube iframes");let n=document.querySelectorAll("iframe"),e=0;n.forEach(t=>{let s=t.src||t.getAttribute("src");if(s&&x.test(s)){if(t.dataset.ytOptIn==="true"||t.hasAttribute("data-yt-processed"))return;h("Found existing YouTube iframe, replacing",{src:s,iframe:t}),t.src="about:blank";let r=I(s),i=E(r);t.width&&(i.style.width=t.width),t.height&&(i.style.height=t.height),t.style.width&&(i.style.width=t.style.width),t.style.height&&(i.style.height=t.style.height),i.addEventListener("click",k),i.setAttribute("data-click-bound","true"),t.parentNode.replaceChild(i,t),P(i),e++}}),h(`Replaced ${e} existing YouTube iframes`)}function U(){h("Initializing module"),w(document),V(),y(),re(),te()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",U):U();window.darlenaYoutubeOptIn=y;var ie=()=>{if(document.getElementById("product-slider-styles"))return;let n=document.createElement("style");n.id="product-slider-styles",n.textContent=`
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
  `,document.head.appendChild(n)},b=new Map,L=new Map,D=new Set,G="https://productstoredis-163858290861.me-central2.run.app/product-images",se=100,oe=1,X=200,ne=400,ae=400,le=(n,e)=>{let t=[];for(let s=0;s<n.length;s+=e)t.push(n.slice(s,s+e));return t};async function de(n){if(!n||n.length===0)return{};let e=`${G}?ids=${encodeURIComponent(n.join(","))}`,t=new AbortController,s=setTimeout(()=>t.abort("timeout"),5e3);try{let r=await fetch(e,{signal:t.signal});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}finally{clearTimeout(s)}}var j=class{constructor(){this.enhancedCards=new WeakSet,this.init()}init(){ie(),window.app?.status==="ready"?(this.setupEventListeners(),this.enhanceExistingCards()):document.addEventListener("theme::ready",()=>{this.setupEventListeners(),this.enhanceExistingCards()})}setupEventListeners(){document.addEventListener("salla-products-slider::products.fetched",e=>{console.log("[Product Card Enhancer] Products slider fetched"),setTimeout(()=>this.enhanceExistingCards(),100),this.schedulePrefetch(e.target)}),document.addEventListener("salla-products-list::products.fetched",e=>{console.log("[Product Card Enhancer] Products list fetched"),setTimeout(()=>this.enhanceExistingCards(),100),this.schedulePrefetch(e.target)}),document.addEventListener("salla::page::changed",()=>{console.log("[Product Card Enhancer] Page changed"),setTimeout(()=>this.enhanceExistingCards(),500)}),this.setupMutationObserver()}schedulePrefetch(e){clearTimeout(this._prefetchTimer),this._prefetchTimer=setTimeout(()=>this.prefetchProductImagesFromList(e),75)}prefetchProductImagesFromList(e){let t=[];e?.matches?.("salla-products-list")?t.push(e):document.querySelectorAll("salla-products-list").forEach(a=>t.push(a));let s=new Set;t.forEach(a=>{let d=a.getAttribute("source-value");if(d)try{let c=JSON.parse(d);Array.isArray(c)&&c.forEach(l=>s.add(String(l)))}catch{}a.querySelectorAll(".s-product-card-entry").forEach(c=>{let l=this.extractProductId(c);l&&s.add(String(l))})});let r=Array.from(s).filter(a=>!b.has(a)&&!D.has(a));if(!r.length)return;let i=le(r,se),o=(a,d=0)=>{a.forEach(c=>D.add(c)),de(a).then(c=>{!c||typeof c!="object"||Object.entries(c).forEach(([l,u])=>{u&&u.images&&b.set(String(l),u)})}).catch(c=>{if(console.warn("[Product Card Enhancer] Bulk fetch failed",c),d<oe){let l=Math.floor(Math.random()*(ne-X+1))+X;setTimeout(()=>o(a,d+1),l)}}).finally(()=>{a.forEach(c=>D.delete(c))})};i.forEach(a=>o(a))}setupMutationObserver(){new MutationObserver(t=>{let s=!1;for(let r of t){if(r.addedNodes.length>0){for(let i of r.addedNodes)if(i.nodeType===1&&(i.classList?.contains("s-product-card-entry")||i.querySelector?.(".s-product-card-entry"))){s=!0;break}}if(s)break}s&&setTimeout(()=>this.enhanceExistingCards(),50)}).observe(document.body,{childList:!0,subtree:!0})}enhanceExistingCards(){let e=document.querySelectorAll(".s-product-card-entry");console.log(`[Product Card Enhancer] Found ${e.length} product cards`),e.forEach(t=>{let s=this.extractProductId(t);s&&!this.enhancedCards.has(t)&&this.enhanceCard(t,s)})}extractProductId(e){if(e.dataset.id)return e.dataset.id;if(e.id&&!isNaN(e.id))return e.id;let t=e.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(t?.href){let r=t.href.match(/\/product\/[^\/]+\/(\d+)/);if(r)return r[1]}let s=e.getAttribute("product");if(s)try{let r=JSON.parse(s);if(r.id)return String(r.id)}catch{}return null}enhanceCard(e,t){console.log(`[Product Card Enhancer] Enhancing card for product ${t}`);let s=e.querySelector(".s-product-card-image");if(!s){console.warn(`[Product Card Enhancer] No image wrapper found for product ${t}`);return}let r=new F(e,t,s);this.enhancedCards.add(e),r.setupLazyInit()}},F=class{constructor(e,t,s){this.card=e,this.productId=t,this.imageWrapper=s,this.imageContainer=s.querySelector("a"),this.currentSlide=0,this.additionalImages=[],this.touchStartX=0,this.touchEndX=0,this.isSwiping=!1,this.isMouseDown=!1,this.sliderInitialized=!1,this.sliderId=`slider-${t}-${Date.now()}`,this.boundEventHandlers={},this._maxInitRetries=5}getImageContainer(){return this.imageContainer&&this.imageContainer.isConnected?this.imageContainer:(this.imageWrapper?.isConnected||(this.imageWrapper=this.card.querySelector(".s-product-card-image")),this.imageContainer=this.imageWrapper?.querySelector("a")||null,this.imageContainer)}setupLazyInit(){this.imageWrapper&&(this._observer=new IntersectionObserver(e=>{e.forEach(t=>{t.isIntersecting&&!this.sliderInitialized&&(this.sliderInitialized=!0,this.setupImageSlider(),setTimeout(()=>{this.fetchProductImages()},50),this._observer.unobserve(t.target))})},{rootMargin:"300px",threshold:.01}),this._observer.observe(this.imageWrapper))}setupImageSlider(e=0){let t=this.getImageContainer();if(!t){e<this._maxInitRetries?setTimeout(()=>this.setupImageSlider(e+1),100):console.warn(`[Product Card Enhancer] Image link missing for product ${this.productId}`);return}this.imageContainer=t;let s=document.createElement("div");s.className="swipe-indicator",t.appendChild(s);let r=null,i=null,o=null,a=!1;this.boundEventHandlers.touchstart=l=>{r=l.touches[0].clientX,i=l.touches[0].clientY,o=Date.now(),a=!1},this.boundEventHandlers.touchmove=l=>{if(!r)return;let u=l.touches[0].clientX-r,p=l.touches[0].clientY-i;Math.abs(u)>Math.abs(p)&&Math.abs(u)>10&&(a=!0,this.isSwiping=!0,s.classList.toggle("right",u>0),s.style.opacity=Math.min(Math.abs(u)/100,.5),l.preventDefault())},this.boundEventHandlers.touchend=l=>{if(!r||!a){r=i=null,this.isSwiping=!1,s.style.opacity=0;return}if(this.isSwiping){let p=l.changedTouches[0].clientX-r,f=Date.now()-o<300?30:50;Math.abs(p)>=f&&(p>0?(this.prevSlide(),this.triggerHapticFeedback("medium")):(this.nextSlide(),this.triggerHapticFeedback("medium"))),l.preventDefault(),l.stopPropagation()}s.style.opacity=0,r=i=null,this.isSwiping=!1},t.addEventListener("touchstart",this.boundEventHandlers.touchstart,{passive:!0}),t.addEventListener("touchmove",this.boundEventHandlers.touchmove,{passive:!1}),t.addEventListener("touchend",this.boundEventHandlers.touchend,{passive:!1}),this.boundEventHandlers.mousedown=l=>{this.isMouseDown=!0,r=l.clientX,i=l.clientY,o=Date.now(),a=!1,l.preventDefault(),l.stopPropagation()},this.boundEventHandlers.mousemove=l=>{if(!this.isMouseDown||!r)return;let u=l.clientX-r;Math.abs(u)>10&&(a=!0,this.isSwiping=!0,s.classList.toggle("right",u>0),s.style.opacity=Math.min(Math.abs(u)/100,.5)),this.isSwiping&&(l.preventDefault(),l.stopPropagation())},this.boundEventHandlers.mouseup=l=>{if(this.isMouseDown){if(a&&this.isSwiping){let p=l.clientX-r,f=Date.now()-o<300?30:50;Math.abs(p)>=f&&(p>0?this.prevSlide():this.nextSlide()),l.preventDefault(),l.stopPropagation()}s.style.opacity=0,this.isMouseDown=!1,this.isSwiping=!1,r=i=null}},t.addEventListener("mousedown",this.boundEventHandlers.mousedown),t.addEventListener("mousemove",this.boundEventHandlers.mousemove),window.addEventListener("mouseup",this.boundEventHandlers.mouseup);let d=document.createElement("div");d.className="product-slider-dots",d.dataset.sliderId=this.sliderId,d.dataset.productId=this.productId;let c=document.createElement("span");c.className="product-slider-dot active",c.dataset.sliderId=this.sliderId,c.dataset.productId=this.productId,c.dataset.index="0",c.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),this.changeSlide(0),this.triggerHapticFeedback("light")}),d.appendChild(c);for(let l=0;l<2;l++){let u=document.createElement("span");u.className="product-slider-dot",u.dataset.sliderId=this.sliderId,u.dataset.productId=this.productId,u.dataset.index=String(l+1),u.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation(),this.changeSlide(l+1),this.triggerHapticFeedback("light")}),d.appendChild(u)}this.imageWrapper.appendChild(d)}fetchProductImages(){if(this.productId){if(b.has(this.productId)){this.processImageResponse(b.get(this.productId));return}if(D.has(this.productId)){setTimeout(()=>{if(b.has(this.productId)){this.processImageResponse(b.get(this.productId));return}D.has(this.productId)&&this.performSingleFetch()},ae);return}this.performSingleFetch()}}performSingleFetch(){if(!this.productId)return;let e=`${G}/${this.productId}`;if(L.has(this.productId)){L.get(this.productId).then(i=>this.processImageResponse(i)).catch(()=>this.hideDots());return}let t=new AbortController,s=setTimeout(()=>t.abort("timeout"),5e3),r=fetch(e,{signal:t.signal}).then(i=>{if(!i.ok)throw new Error(`HTTP ${i.status}`);return i.json()}).then(i=>{b.set(this.productId,i),this.processImageResponse(i)}).catch(i=>{console.warn(`[Product Card Enhancer] Failed to fetch images for product ${this.productId}:`,i),this.hideDots()}).finally(()=>{clearTimeout(s),L.delete(this.productId)});L.set(this.productId,r)}processImageResponse(e){if(!e?.images||!Array.isArray(e.images)){let r=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);r&&(r.style.display="none");return}let t=e.images.filter(r=>r&&r.url).sort((r,i)=>(r.sort||0)-(i.sort||0)).slice(0,2).map(r=>({url:r.url,alt:r.alt}));if(t.length===0){let r=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);r&&(r.style.display="none");return}this.additionalImages=t;let s=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);s&&(s.style.display="flex"),this.preloadAllImages()}preloadAllImages(){this.additionalImages&&this.additionalImages.length>0&&(this.addImageToSlider(this.additionalImages[0],1),this.additionalImages.length>1&&this.addImageToSlider(this.additionalImages[1],2))}addImageToSlider(e,t){let s=this.getImageContainer();if(!e?.url||!s||s.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${t}"]`))return;let i=document.createElement("img");i.className="product-slider-image",i.src=e.url,i.alt=e.alt||"Product image",i.dataset.sliderId=this.sliderId,i.dataset.productId=this.productId,i.dataset.index=String(t),i.onload=()=>{let o=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${t}"]`);o&&o.classList.add("loaded")},i.onerror=()=>{i.remove();let o=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${t}"]`);o&&(o.remove(),this.checkDotsVisibility())},s.appendChild(i)}checkDotsVisibility(){let e=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);if(e){let t=e.querySelectorAll(".product-slider-dot");e.style.display=t.length<=1?"none":"flex"}}hideDots(){let e=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);e&&(e.style.display="none")}changeSlide(e){this.additionalImages&&e>0&&this.additionalImages[e-1]&&this.addImageToSlider(this.additionalImages[e-1],e),this.currentSlide=e;let t=this.getImageContainer();if(!t)return;this.imageContainer=t;let s=t.querySelector('img.lazy, img[loading="lazy"], img:first-child:not(.product-slider-image)'),r=t.querySelectorAll(`.product-slider-image[data-slider-id="${this.sliderId}"]`);this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).forEach(a=>a.classList.remove("active"));let o=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${e}"]`);if(o&&o.classList.add("active"),e===0)s&&(s.style.visibility="visible",s.style.opacity="1",s.style.zIndex="10"),r.forEach(a=>a.classList.remove("active"));else{s&&(s.style.visibility="hidden",s.style.opacity="0",s.style.zIndex="5"),r.forEach(d=>d.classList.remove("active"));let a=t.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${e}"]`);a?a.classList.add("active"):s&&(s.style.visibility="visible",s.style.opacity="1",s.style.zIndex="10")}}prevSlide(){let e=this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length,t=(this.currentSlide-1+e)%e;this.changeSlide(t)}nextSlide(){let e=this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length,t=(this.currentSlide+1)%e;this.changeSlide(t)}triggerHapticFeedback(e){try{if(window.navigator&&window.navigator.vibrate)switch(e){case"light":window.navigator.vibrate(10);break;case"medium":window.navigator.vibrate(25);break;case"strong":window.navigator.vibrate([10,20,30]);break}}catch{}}},Ce=new j;window.productRecommendations=m;window.redisService=g;var ce=n=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n();function ue(){if(!document.body.classList.contains("index")){console.log("[Algolia Bundle] Not on homepage, skipping category products injection");return}let n=".app-inner",e="mahaba-category-products";function t(){let r=document.querySelector(n);if(r&&!r.querySelector(e))try{console.log(`[Algolia Bundle] Found ${n}, injecting ${e}...`);let i=document.createElement(e),o=document.querySelector(".store-footer");return o?r.insertBefore(i,o):r.appendChild(i),console.log("\u2705 [Algolia Bundle] Homepage category component injected successfully"),!0}catch(i){return console.error("[Algolia Bundle] Error during injection:",i),!0}return!1}if(t())return;console.log(`[Algolia Bundle] ${n} not found, waiting for async load...`),new MutationObserver((r,i)=>{r.some(a=>a.addedNodes.length>0)&&t()&&i.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}function he(){if(document.getElementById("cart-addons-slider-styles"))return;let n=document.createElement("style");n.id="cart-addons-slider-styles",n.textContent=`
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
  `,document.head.appendChild(n)}function K(){he();let n=()=>{let t=document.querySelector("#cart-submit");if(!t)return!1;let s=t.closest(".cart-submit-wrap")||t.parentElement,r=s?.parentElement||s;if(!r)return!1;if(r.querySelector("cart-addons-slider"))return!0;let i=document.createElement("cart-addons-slider");return i.className="cart-addons-wrapper",s&&r?r.insertBefore(i,s.nextSibling):r.appendChild(i),console.log("[Algolia Bundle] Injected cart addons slider"),!0};if(document.querySelector("cart-addons-slider")||n())return;new MutationObserver((t,s)=>{n()&&s.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}ce(()=>{ue(),document.querySelector('[id^="product-"]')&&setTimeout(()=>{m.initialize(),console.log("\u2705 [Algolia Bundle] Product recommendations initialized")},3e3),(document.querySelector('form[id^="item-"]')||document.querySelector("#cart-submit"))&&setTimeout(K,500),console.log("\u2705 [Algolia Bundle] Loaded successfully")});document.addEventListener("salla::page::changed",()=>{m.reset(),setTimeout(()=>{m.initialize()},1e3),setTimeout(K,500)});document.addEventListener("theme::ready",()=>{if(!document.querySelector('[id^="product-"]'))return;let n=m.getProductId();n&&m.productId&&n===m.productId||n&&(console.log("[Algolia Bundle] New product detected via theme::ready, re-initializing"),m.reset(),setTimeout(()=>{m.initialize()},1e3))});})();
