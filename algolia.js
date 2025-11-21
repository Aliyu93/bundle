(()=>{var A=class{constructor(){this.baseUrl="https://me-central2-gtm-5v2mhn4-mwvlm.cloudfunctions.net/function-2",this.maxRetries=2,this.headers={Accept:"application/json","Cache-Control":"public, max-age=3600"},this.cache=new Map,this.fallbackEnabled=!0}async getProducts(e,t,r=0,i=12){if(!t)return null;let s=`${e}:${t}:${r}:${i}`;if(this.cache.has(s))return this.cache.get(s);let o=e==="category"?"catID":"tagID",c=e==="category"?"categoryById":"tagById",a=`${this.baseUrl}/?type=${c}&${o}=${encodeURIComponent(t)}&offset=${r}&limit=${i}`,d=null;try{let n=new AbortController,u=setTimeout(()=>n.abort(),2e3),h=await fetch(a,{method:"GET",headers:this.headers,signal:n.signal});if(clearTimeout(u),!h.ok)throw new Error(`HTTP error: ${h.status}`);if(d=await h.json(),d?.objectIDs?.length)return this.cache.set(s,d),d}catch{}if(!d?.objectIDs?.length&&this.fallbackEnabled)try{let n=await fetch(a,{method:"GET",headers:this.headers});if(n.ok&&(d=await n.json(),d?.objectIDs?.length))return this.cache.set(s,d),d}catch{}return d||{objectIDs:[],hasMore:!1}}async getRecommendations(e){if(!e)return[];let t=`recommendations:${e}`;if(this.cache.has(t))return this.cache.get(t);let r=`${this.baseUrl}/?type=recommendations&objectID=${encodeURIComponent(e)}`;try{let i=new AbortController,s=setTimeout(()=>i.abort(),3e3),o=await fetch(r,{method:"GET",headers:this.headers,signal:i.signal});if(clearTimeout(s),!o.ok)return[];let c=await o.json(),a=Array.isArray(c?.relatedProductIDs)?c.relatedProductIDs:[];return this.cache.set(t,a),a}catch{return[]}}async getFrequentlyBought(e){if(!e)return[];let t=`frequently-bought:${e}`;if(this.cache.has(t))return this.cache.get(t);let r=`${this.baseUrl}/?type=frequentlyBought&objectID=${encodeURIComponent(e)}`;try{let i=new AbortController,s=setTimeout(()=>i.abort(),3e3),o=await fetch(r,{method:"GET",headers:this.headers,signal:i.signal});if(clearTimeout(s),!o.ok)return[];let c=await o.json(),a=Array.isArray(c?.frequentlyBoughtIDs)?c.frequentlyBoughtIDs:[];return this.cache.set(t,a),a}catch{return[]}}async getCategoriesFromRedis(){let e="all-categories";if(this.cache.has(e))return this.cache.get(e);try{let t=new AbortController,r=setTimeout(()=>t.abort(),5e3),i=await fetch(`${this.baseUrl}/?type=categories`,{method:"GET",headers:this.headers,signal:t.signal});if(clearTimeout(r),!i.ok)return[];let o=(await i.json()).categories||[];return this.cache.set(e,o),o}catch{return[]}}async getGlobalProducts(e=0,t=12){let r=`global-products:${e}:${t}`;if(this.cache.has(r))return this.cache.get(r);try{let i=new AbortController,s=setTimeout(()=>i.abort(),3e3),o=`${this.baseUrl}/?type=categoryById&catID=trending-now&offset=${e}&limit=${t}`,c=await fetch(o,{method:"GET",headers:this.headers,signal:i.signal});if(clearTimeout(s),!c.ok)return{objectIDs:[],hasMore:!1};let a=await c.json(),d={objectIDs:a.objectIDs||[],hasMore:a.hasMore||!1};return this.cache.set(r,d),d}catch{return{objectIDs:[],hasMore:!1}}}async getCategoryPageById(e,t=0,r=12){return this.getProducts("category",e,t,r)}async getCategoryProducts(e,t,r){return this.getProducts("category",e,t,r)}async getTagProducts(e,t,r){return this.getProducts("tag",e,t,r)}},p=new A;var E=class extends HTMLElement{constructor(){super(),this.initialized=!1,this.productIds=[],this.structureReady=!1}connectedCallback(){this.ensureStructure(),!this.initialized&&this.getHighestValueItemFromDOM().then(e=>e?this.fetchFrequentlyBoughtProducts(e):[]).then(()=>{this.renderProductList(),setTimeout(()=>{this.initializeSlider()},1e3)}).catch(e=>{console.error("[CartAddonsSlider] Error loading products:",e)})}ensureStructure(){if(this.structureReady)return;let e=this.getTitleText(),t=this.querySelector(".cart-addons-title");if(t)t.textContent=e;else{let r=document.createElement("h3");r.className="cart-addons-title",r.textContent=e,this.appendChild(r)}if(!this.querySelector(".frequently-bought-container")){let r=document.createElement("div");r.className="frequently-bought-container",this.appendChild(r)}this.structureReady=!0}getTitleText(){let e="pages.cart.frequently_bought_together",t=window.salla?.lang?.get?.(e),r=typeof t=="string"&&t!==e?t.trim():"";if(r)return r;let i=(document.documentElement.getAttribute("lang")||"").toLowerCase().slice(0,2),s={ar:"\u0645\u062A\u062C\u0627\u062A \u0642\u062F \u062A\u0639\u062C\u0628\u0643",en:"Frequently Bought Together"};return s[i]||s.en}async getHighestValueItemFromDOM(){try{let e=document.querySelectorAll('form[id^="item-"]');if(!e||e.length===0)return console.log("[CartAddonsSlider] No cart items found in DOM"),null;let t=null,r=0;return e.forEach(i=>{try{let s=i.getAttribute("id")||"",o=s.replace("item-",""),c=i.querySelector('a[href*="/p"]');if(!c){console.log("[CartAddonsSlider] No product link found in form",s);return}let a=c.getAttribute("href"),d=a.match(/\/p(\d+)(?:$|\/|\?)/);if(!d||!d[1]){console.log("[CartAddonsSlider] Could not extract product ID from URL",a);return}let n=d[1],u=i.querySelector(".item-total");if(u){let g=(u.textContent||u.innerText||"0").replace(/[^\d.,٠١٢٣٤٥٦٧٨٩]/g,"").replace(/٠/g,"0").replace(/١/g,"1").replace(/٢/g,"2").replace(/٣/g,"3").replace(/٤/g,"4").replace(/٥/g,"5").replace(/٦/g,"6").replace(/٧/g,"7").replace(/٨/g,"8").replace(/٩/g,"9"),f=parseFloat(g.replace(",","."))||0;console.log(`[CartAddonsSlider] Item ${o}: Product ID ${n}, Total: ${f}`),!isNaN(f)&&f>r&&(r=f,t={itemId:o,productId:n,total:f})}}catch(s){console.error("[CartAddonsSlider] Error processing item form:",s)}}),t?(console.log("[CartAddonsSlider] Highest value item:",t),t.productId):null}catch(e){return console.error("[CartAddonsSlider] Error extracting cart data from DOM:",e),null}}async fetchFrequentlyBoughtProducts(e){try{console.log("[CartAddonsSlider] Fetching frequently bought products for:",e);let t=await p.getFrequentlyBought(e);return t&&t.length>0?(console.log("[CartAddonsSlider] Found frequently bought products:",t),this.productIds=t.map(r=>String(r)).slice(0,8),this.productIds):(console.log("[CartAddonsSlider] No frequently bought products found"),this.productIds=[],[])}catch(t){return console.error("[CartAddonsSlider] Error fetching frequently bought products:",t),this.productIds=[],[]}}renderProductList(){if(!this.productIds||this.productIds.length===0){console.log("[CartAddonsSlider] No products to render, hiding component"),this.style.display="none";return}console.log("[CartAddonsSlider] Rendering product list with IDs:",this.productIds);let e=this.querySelector(".frequently-bought-container");if(!e){console.error("[CartAddonsSlider] Container not found");return}let t=document.createElement("salla-products-list");if(t.setAttribute("source","selected"),t.setAttribute("loading","lazy"),t.setAttribute("source-value",JSON.stringify(this.productIds)),t.setAttribute("class","s-products-list-vertical-cards"),e.innerHTML="",e.appendChild(t),!this.querySelector(".touch-indicator")){let r=document.createElement("div");r.classList.add("touch-indicator"),this.appendChild(r)}console.log("[CartAddonsSlider] Product list rendered")}initializeSlider(){try{let e=this.querySelector("salla-products-list");if(!e){console.log("[CartAddonsSlider] Products list not found");return}e.style.opacity="1",window.salla?.event?.dispatch&&window.salla.event.dispatch("twilight::mutation"),this.initialized=!0,console.log("[CartAddonsSlider] Slider initialized")}catch(e){console.error("[CartAddonsSlider] Failed to initialize cart addons slider:",e)}}};customElements.get("cart-addons-slider")||(customElements.define("cart-addons-slider",E),console.log("[CartAddonsSlider] Custom element defined"));var D=class extends HTMLElement{constructor(){super(),this.swiper=null,this.productIds=[],this.initialized=!1}async initialize(e,t={}){if(this.initialized){console.warn("[AlgoliaSlider] Already initialized");return}this.productIds=e.slice(0,21);let{title:r="\u0645\u0646\u062A\u062C\u0627\u062A \u0642\u062F \u062A\u0639\u062C\u0628\u0643",displayAllUrl:i="",filterStock:s=!0,maxInStock:o=15}=t;this.innerHTML=`
            <div class="algolia-slider-wrapper s-products-slider-wrapper">
                <div class="algolia-slider-header s-slider-block__title">
                    <div class="s-slider-block__title-right">
                        <h2>${r}</h2>
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
        `,this.injectStyles(),await this.renderProducts(s,o),this.initialized=!0}async renderProducts(e,t){let r=this.querySelector(".swiper-wrapper");if(!r){console.error("[AlgoliaSlider] Swiper wrapper not found");return}let i=document.createElement("salla-products-list");i.setAttribute("source","selected"),i.setAttribute("source-value",JSON.stringify(this.productIds)),i.setAttribute("limit",this.productIds.length.toString()),i.setAttribute("display-all-url",""),i.className="algolia-products-source";let s=document.createElement("div");return s.style.cssText="opacity: 0; pointer-events: none; position: absolute; z-index: -1; top: 0; left: 0; width: 100%; height: 0; overflow: hidden;",s.className="algolia-temp-container",s.appendChild(i),this.appendChild(s),window.salla?.event?.dispatch("twilight::mutation"),new Promise(o=>{let c=a=>{i.contains(a.target)&&(window.salla?.event?.off("salla-products-list::products.fetched",c),setTimeout(()=>{this.moveProductsToSlider(i,r,e,t),s.remove(),o()},150))};window.salla?.event?.on("salla-products-list::products.fetched",c),setTimeout(()=>{s.parentNode&&(this.moveProductsToSlider(i,r,e,t),s.remove(),o())},3e3)})}moveProductsToSlider(e,t,r,i){let s=e.querySelectorAll(".s-product-card-entry, custom-salla-product-card");if(!s.length){console.warn("[AlgoliaSlider] No product cards found");return}console.log(`[AlgoliaSlider] Found ${s.length} products from Salla`);let o=new Map;s.forEach(a=>{let d=a.getAttribute("id")||a.id;if(d){let n=d.replace("product-","");o.set(n.toString(),a)}}),console.log("[AlgoliaSlider] Card map keys:",Array.from(o.keys())),console.log("[AlgoliaSlider] Target order from Algolia:",this.productIds);let c=0;this.productIds.forEach((a,d)=>{let n=o.get(a.toString());if(!n){console.warn(`[AlgoliaSlider] Product ${a} not found in rendered cards`);return}let u=n.classList.contains("s-product-card-out-of-stock");if(r&&(u||c>=i))return;u||c++;let h=document.createElement("div");h.className="s-products-slider-card swiper-slide",h.appendChild(n),t.appendChild(h),console.log(`[AlgoliaSlider] Added product ${a} at position ${d}`)}),console.log(`[AlgoliaSlider] Final order: ${c} in-stock products in Algolia order`),this.initializeSwiper()}initializeSwiper(){let e=this.querySelector(".swiper");if(!e){console.error("[AlgoliaSlider] Swiper container not found");return}if(!this.querySelectorAll(".swiper-slide").length){console.warn("[AlgoliaSlider] No slides to initialize");return}if(typeof Swiper>"u"){console.warn("[AlgoliaSlider] Swiper not available, using CSS fallback"),this.initializeCSSScroll();return}try{this.swiper=new Swiper(e,{slidesPerView:"auto",spaceBetween:16,rtl:!0,direction:"horizontal",navigation:{nextEl:".algolia-slider-next",prevEl:".algolia-slider-prev"},breakpoints:{320:{slidesPerView:2,spaceBetween:12},640:{slidesPerView:2,spaceBetween:12},768:{slidesPerView:3,spaceBetween:16},1024:{slidesPerView:4,spaceBetween:16}},on:{init:function(){console.log("[AlgoliaSlider] Swiper initialized successfully")}}}),console.log("[AlgoliaSlider] Swiper instance created")}catch(r){console.error("[AlgoliaSlider] Error initializing Swiper:",r),this.initializeCSSScroll()}}initializeCSSScroll(){let e=this.querySelector(".swiper-wrapper");if(!e)return;e.style.cssText=`
            display: flex !important;
            overflow-x: auto;
            scroll-behavior: smooth;
            gap: 1rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
        `;let t=this.querySelector(".swiper");t&&(t.style.overflow="hidden");let r=this.querySelector(".algolia-slider-prev"),i=this.querySelector(".algolia-slider-next");if(r&&i){r.addEventListener("click",()=>{e.scrollBy({left:-300,behavior:"smooth"})}),i.addEventListener("click",()=>{e.scrollBy({left:300,behavior:"smooth"})});let o=()=>{let c=e.scrollLeft<=0,a=e.scrollLeft>=e.scrollWidth-e.clientWidth-10;r.disabled=c,i.disabled=a,r.classList.toggle("swiper-button-disabled",c),i.classList.toggle("swiper-button-disabled",a)};e.addEventListener("scroll",o),o()}console.log("[AlgoliaSlider] CSS scroll fallback initialized")}injectStyles(){if(document.getElementById("algolia-slider-styles"))return;let e=document.createElement("style");e.id="algolia-slider-styles",e.textContent=`
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
        `,document.head.appendChild(e),console.log("[AlgoliaSlider] Styles injected")}disconnectedCallback(){this.destroy()}destroy(){if(this.swiper){try{this.swiper.destroy(!0,!0),console.log("[AlgoliaSlider] Swiper destroyed")}catch(e){console.error("[AlgoliaSlider] Error destroying Swiper:",e)}this.swiper=null}this.initialized=!1}};customElements.get("algolia-recommendations-slider")||(customElements.define("algolia-recommendations-slider",D),console.log("[AlgoliaSlider] Custom element registered"));var I=class extends HTMLElement{constructor(){super(),this.page=0,this.loading=!1,this.hasMore=!0,this.ids=[],this.container=null,this.originalList=null,this.usingSallaFilter=!1,this.timeout=null}async connectedCallback(){let e=this.getAttribute("category-id"),t=this.getAttribute("tag-id");if(console.log("[PR Element] Connected:",{categoryId:e,tagId:t}),!(!e&&!t))try{await this.waitForSalla(),this.setupFilterListener(),await this.initialize(e,t)}catch(r){console.error("[PR Element] Error:",r),this.restoreOriginalList()}}restoreOriginalList(){if(!this.originalList||this.usingSallaFilter)return;let e=document.querySelector(".ranked-products, salla-products-list[filter]"),t=e?.parentNode||this.originalList.parentNode;e&&e.remove(),this.container&&(this.container.remove(),this.container=null),t&&!t.querySelector("salla-products-list")&&(t.appendChild(this.originalList.cloneNode(!0)),window.salla?.event?.dispatch("twilight::mutation"))}setupFilterListener(){document.addEventListener("change",e=>{if(e.target.id!=="product-filter")return;let t=e.target.value;t==="ourSuggest"&&this.usingSallaFilter?this.applyRedisRanking():t!=="ourSuggest"&&this.applySallaFilter(t)})}async applySallaFilter(e){let t=this.getAttribute("category-id"),r=this.getAttribute("tag-id");if(!this.originalList)return;let i=document.querySelector(".ranked-products, salla-products-list[filter]"),s=i?.parentNode||this.container?.parentNode;if(!s)return;i&&i.remove(),this.container&&(this.container.remove(),this.container=null),this.cleanupScrollListener(),this.usingSallaFilter=!0;let o=this.originalList.cloneNode(!0);o.setAttribute("filter",e),s.appendChild(o),window.salla?.event?.dispatch("twilight::mutation")}async applyRedisRanking(){let e=this.getAttribute("category-id"),t=this.getAttribute("tag-id");this.usingSallaFilter=!1,await this.initialize(e,t,!0)}async initialize(e,t,r=!1){if(console.log("[PR Element] Initialize called"),this.container&&!this.usingSallaFilter&&!r)return;let i=e?'salla-products-list[source="product.index"], salla-products-list[source="categories"]':'salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]',s=document.querySelector(i);if(console.log("[PR Element] Existing list found:",!!s),!s)return;this.originalList||(this.originalList=s.cloneNode(!0));let o=document.getElementById("product-filter");if(o)o.value="ourSuggest",this.usingSallaFilter=!1;else if(o&&o.value!=="ourSuggest"&&!r){this.usingSallaFilter=!0;return}let c=e?p.getCategoryProducts(e,0,12):p.getTagProducts(t,0,12),a=s.parentNode;this.container=document.createElement("div"),this.container.className="ranked-products",a.insertBefore(this.container,s),clearTimeout(this.timeout),this.timeout=setTimeout(()=>{(!this.ids||!this.ids.length)&&this.restoreOriginalList()},2500);let d=await c;if(clearTimeout(this.timeout),console.log("[PR Element] Redis data received:",d?.objectIDs?.length,"products"),console.log("[PR Element] Redis product IDs:",d.objectIDs),!d?.objectIDs?.length){console.warn("[PR Element] No products from Redis, restoring original"),this.restoreOriginalList();return}this.ids=d.objectIDs,this.page=0,this.hasMore=!0,this.usingSallaFilter=!1;let n=document.createElement("salla-products-list");n.setAttribute("source","selected"),n.setAttribute("source-value",JSON.stringify(this.ids)),n.setAttribute("limit",this.ids.length),n.className=s.className||"w-full",this.container.appendChild(n),s.remove(),window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(this.container,this.ids),this.setupScrollListener()}setupScrollListener(){this.cleanupScrollListener(),this._boundScrollHandler=this.handleScroll.bind(this),window.addEventListener("scroll",this._boundScrollHandler)}cleanupScrollListener(){this._boundScrollHandler&&(window.removeEventListener("scroll",this._boundScrollHandler),this._boundScrollHandler=null)}handleScroll(){if(this.loading||!this.hasMore||this.usingSallaFilter)return;let e=window.scrollY+window.innerHeight,t=document.documentElement.scrollHeight*.5;e>t&&this.loadMore()}async loadMore(){if(!(this.loading||!this.hasMore)){this.loading=!0;try{let e=this.page+1,t=e*12,r=this.getAttribute("category-id"),i=this.getAttribute("tag-id"),s=r?await p.getCategoryProducts(r,t,12):await p.getTagProducts(i,t,12);if(!s?.objectIDs?.length){this.hasMore=!1;return}let o=document.createElement("salla-products-list");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(s.objectIDs)),o.setAttribute("limit",s.objectIDs.length),o.className="w-full",this.container.appendChild(o),this.page=e,this.hasMore=s.hasMore!==!1,window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(o,s.objectIDs)}catch{this.hasMore=!1}finally{this.loading=!1}}}async waitForSalla(){if(!window.salla)return new Promise(e=>{document.addEventListener("salla::ready",e,{once:!0}),setTimeout(e,3e3)})}applyOrderToList(e,t,r=30){if(!e||!t||!t.length)return;let i=0,s=setInterval(()=>{i++;let o=Array.from(e.querySelectorAll("custom-salla-product-card, .s-product-card-entry"));if(o.length>0){clearInterval(s);let c=new Map;o.forEach(d=>{let n=null;if(d.dataset.id)n=d.dataset.id;else if(d.id&&!isNaN(d.id))n=d.id;else{let u=d.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(u?.href){let h=u.href.match(/\/product\/[^\/]+\/(\d+)/);h&&(n=h[1])}}n&&c.set(String(n),d)});let a=o[0].parentNode;if(!a)return;t.forEach(d=>{let n=c.get(String(d));n&&a.contains(n)&&a.appendChild(n)}),console.log("[PR Element] Reordered",o.length,"cards to match Redis order")}else i>=r&&(clearInterval(s),console.warn("[PR Element] Cards never appeared, skipping reorder"))},100)}disconnectedCallback(){this.cleanupScrollListener(),clearTimeout(this.timeout)}};customElements.get("product-ranking")||customElements.define("product-ranking",I);var x=class extends HTMLElement{constructor(){super(),this.state={productsPerPage:30,categories:[],trendingCategory:{name:"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646",slug:"trending-now",filter:null,hasSubcats:!1,url:null}},this.categoriesLoading=!0,this.seenProductIds=new Set}async connectedCallback(){this.innerHTML=`
            <div class="category-filter">
                <div class="categories-loading">\u062C\u0627\u0631\u0650 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A...</div>
            </div>
        `;try{await this.fetchCategoriesFromCloudRun();let e=this.createTemplate();this.innerHTML=e,await this.initializeCategorySections()}catch(e){this.handleInitError(e)}}disconnectedCallback(){}async fetchCategoriesFromCloudRun(){let e={228327271:{name:"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA/c228327271"},476899183:{name:"\u062C\u0644\u0627\u0628\u064A\u0627\u062A",url:"https://darlena.com/%D8%AC%D9%84%D8%A7%D8%A8%D9%8A%D8%A7%D8%AA/c476899183"},1466412179:{name:"\u062C\u062F\u064A\u062F\u0646\u0627",url:"https://darlena.com/%D8%AC%D8%AF%D9%8A%D8%AF-%D8%AF%D8%A7%D8%B1-%D9%84%D9%8A%D9%86%D8%A7/c1466412179"},289250285:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%83%D9%84%D9%88%D8%B4/c289250285"},1891285357:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B3%D9%88%D8%AF%D8%A7%D8%A1-%D8%B3%D8%A7%D8%AF%D8%A9/c1891285357"},2132455494:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D9%84%D9%88%D9%86%D8%A9/c2132455494"},940975465:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%AC%D9%8A%D9%88%D8%A8/c940975465"},1567146102:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%B4%D8%AA/c1567146102"},832995956:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D8%B7%D8%B1%D8%B2%D8%A9/c832995956"},2031226480:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B1%D8%A3%D8%B3/c2031226480"},1122348775:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B5%D9%8A%D9%81%D9%8A%D8%A9/c1122348775"},692927841:{name:"\u0637\u0631\u062D",url:"https://darlena.com/%D8%B7%D8%B1%D8%AD/c692927841"},639447590:{name:"\u0646\u0642\u0627\u0628\u0627\u062A",url:"https://darlena.com/%D9%86%D9%82%D8%A7%D8%A8%D8%A7%D8%AA/c639447590"},114756598:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646",url:"https://darlena.com/%D8%B4%D9%8A%D9%81%D9%88%D9%86/c114756598"}},t={"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646":1,\u062C\u062F\u064A\u062F\u0646\u0627:2,"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629":3,"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A":4,"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634":5,\u062C\u0644\u0627\u0628\u064A\u0627\u062A:6,"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646":7,"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629":8,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628":9,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A":10,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629":11,"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633":12,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629":13,\u0637\u0631\u062D:14,\u0646\u0642\u0627\u0628\u0627\u062A:15};try{let r=await p.getCategoriesFromRedis();if(!Array.isArray(r))throw new Error("Categories data is not an array");let i=r.map(s=>({slug:s.name,name:s.name,filter:s.name,hasSubcats:!1,count:s.count||0,ids:s.ids||(s.id?[s.id]:[])}));i=i.filter(s=>{if(s.ids.length>0){let o=Number(s.ids[0]);return e.hasOwnProperty(o)}return!1}).map(s=>{let o=Number(s.ids[0]);return{...s,name:e[o].name,slug:e[o].name.toLowerCase().replace(/\s+/g,"-"),url:e[o].url,ids:s.ids}}),i.sort((s,o)=>{let c=t[s.name]||999,a=t[o.name]||999;return c-a}),i.unshift({...this.state.trendingCategory}),this.state.categories=i}catch(r){throw this.state.categories=[{...this.state.trendingCategory}],r}finally{this.categoriesLoading=!1}}createTemplate(){return this.categoriesLoading?`
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
        `}async initializeCategorySections(){try{let e=this.state.categories.map(s=>s.slug==="trending-now"?p.getGlobalProducts(0,this.state.productsPerPage).then(o=>({slug:s.slug,ids:o.objectIDs||[]})).catch(o=>({slug:s.slug,ids:[],error:o})):s.ids&&s.ids.length>0?this.fetchRegularCategory(s).then(o=>({slug:s.slug,ids:o||[]})).catch(o=>({slug:s.slug,ids:[],error:o})):Promise.resolve({slug:s.slug,ids:[]})),r=(await Promise.all(e)).reduce((s,o)=>(s[o.slug]=o.ids,s),{});this.seenProductIds.clear();let i={};for(let s of this.state.categories){let o=r[s.slug]||[],c=[];for(let a of o)if(!this.seenProductIds.has(a)&&(this.seenProductIds.add(a),c.push(a),c.length>=6))break;i[s.slug]=c}this.renderProductSliders(i)}catch(e){this.handleInitError(e)}}async fetchRegularCategory(e){let t=e.ids.map(r=>p.getCategoryPageById(r,0,this.state.productsPerPage).catch(i=>({objectIDs:[]})));try{return(await Promise.all(t)).flatMap(i=>i&&i.objectIDs?i.objectIDs:[])}catch{return[]}}renderProductSliders(e){this.state.categories.forEach(t=>{let r=t.slug,i=e[r]||[],s=this.querySelector(`#products-${r}`);if(s)if(s.innerHTML="",i.length>0){let o=document.createElement("salla-products-slider");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(i)),o.setAttribute("limit",String(i.length)),o.setAttribute("slider-id",`slider-${r}`),o.setAttribute("block-title"," "),o.setAttribute("arrows","true"),o.setAttribute("rtl","true"),s.appendChild(o),setTimeout(()=>{o.querySelectorAll(".s-product-card-content-sub").forEach(a=>{a.children.length>1&&(a.style.display="flex",a.style.alignItems="center",a.style.justifyContent="space-between",a.style.flexWrap="nowrap",a.style.width="100%",a.style.overflow="visible")})},500)}else s.innerHTML='<div style="text-align: center; padding: 1rem;">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0639\u0631\u0636\u0647\u0627 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0629.</div>'})}handleInitError(e){this.innerHTML=`
            <div class="category-filter">
                <div class="error-message" style="color: #e53e3e; text-align: center; padding: 2rem; margin-top: 2rem;">
                    \u0639\u0630\u0631\u0627\u064B\u060C \u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A. \u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0635\u0641\u062D\u0629.
                    ${e?"<br><small>Error details logged.</small>":""}
                </div>
            </div>
        `}};customElements.get("mahaba-category-products")||customElements.define("mahaba-category-products",x);var C=class{constructor(){this.initialized=!1,this.productId=null,this.recentlyViewedKey="recently_viewed_products",this.maxRecentProducts=15,this.recentlyViewedClass="algolia-recently-viewed"}initialize(){if(!this.isProductPage())return;let e=this.getProductId();if(!e||this.initialized&&this.productId===e)return;this.productId=e,this.initialized=!0,this.addToRecentlyViewed(this.productId);let t=()=>{this.loadRecommendations(),this.loadRecentlyViewed()};document.readyState==="complete"||document.readyState==="interactive"?t():document.addEventListener("DOMContentLoaded",t)}loadRecommendations(){let e=document.querySelector('salla-products-slider[source="related"]');e?this.replaceRelatedProducts(e):this.waitForElement('salla-products-slider[source="related"]',t=>{this.replaceRelatedProducts(t)})}async loadRecentlyViewed(){let e=this.getRecentlyViewed();if(!e.length)return;let t=e.map(s=>parseInt(s,10)).filter(s=>s&&!isNaN(s)&&s!==parseInt(this.productId,10));if(!t.length)return;this.removeExistingRecentlyViewed();let r=document.createElement("algolia-recommendations-slider");r.className="algolia-recently-viewed mt-8";let i=document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"], algolia-recommendations-slider');this.insertRecentlyViewedSection(r,i),await r.initialize(t,{title:"\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0624\u062E\u0631\u0627\u064B",filterStock:!0,maxInStock:15}),console.log("[Bundle Recommendations] Recently viewed slider initialized with",t.length,"products")}insertRecentlyViewedSection(e,t){let r=document.querySelector(".product-details, .product-entry, #product-entry");if(r&&r.parentNode)return r.parentNode.insertBefore(e,r.nextSibling),!0;if(t){let s=t.closest(".s-products-slider-container, .algolia-slider-wrapper");if(s&&s.parentNode)return s.parentNode.insertBefore(e,s.nextSibling),!0;if(t.parentNode)return t.parentNode.insertBefore(e,t.nextSibling),!0}let i=document.querySelector("main, .s-product-page-content, #content, .s-product-page");return i?(i.appendChild(e),!0):(document.body.appendChild(e),!0)}addToRecentlyViewed(e){if(e)try{let t=parseInt(e,10);if(isNaN(t))return;let r=this.getRecentlyViewed();r=r.map(i=>parseInt(i,10)).filter(i=>!isNaN(i)),r=r.filter(i=>i!==t),r.unshift(t),r.length>this.maxRecentProducts&&(r=r.slice(0,this.maxRecentProducts)),sessionStorage.setItem(this.recentlyViewedKey,JSON.stringify(r))}catch{}}removeExistingRecentlyViewed(){document.querySelectorAll(`.${this.recentlyViewedClass}`).forEach(e=>e.remove())}getRecentlyViewed(){try{let e=sessionStorage.getItem(this.recentlyViewedKey);return e?JSON.parse(e):[]}catch{return[]}}isProductPage(){return!!document.querySelector('.product-form input[name="id"], [id^="product-"], .sidebar .details-slider')}getProductId(){let e=document.querySelector('.product-form input[name="id"]');if(e?.value){let o=parseInt(e.value,10);if(!isNaN(o))return o}let t=window.salla?.product?.id;if(t){let o=parseInt(t,10);if(!isNaN(o))return o}let r=document.querySelector(".product-entry, #product-entry, .product-details");if(r){let o=r.matches('[id^="product-"]')?r:r.querySelector('[id^="product-"]');if(o&&!o.closest("salla-products-slider")){let c=o.id.replace("product-",""),a=parseInt(c,10);if(!isNaN(a))return a}}let i=document.querySelector('[id^="product-"]');if(i&&!i.closest("salla-products-slider")){let o=i.id.replace("product-",""),c=parseInt(o,10);if(!isNaN(c))return c}let s=window.location.pathname.match(/\/p(\d+)/);if(s?.[1]){let o=parseInt(s[1],10);if(!isNaN(o))return o}return null}async replaceRelatedProducts(e){try{let t=this.productId,r=await p.getRecommendations(t);if(t!==this.productId){console.log("[Bundle Recommendations] Product changed during fetch, aborting");return}if(!r?.length)return;let i=r.map(o=>parseInt(o,10)).filter(o=>o&&!isNaN(o));if(!i.length)return;let s=document.createElement("algolia-recommendations-slider");s.className="product-recommendations-slider",e.parentNode.replaceChild(s,e),await s.initialize(i,{title:"\u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0634\u0627\u0628\u0647\u0629",filterStock:!0,maxInStock:15}),console.log("[Bundle Recommendations] Custom slider initialized with",i.length,"products")}catch(t){console.error("[Bundle Recommendations] Error:",t)}}reset(){this.initialized=!1,this.productId=null,this.removeExistingRecentlyViewed(),document.querySelectorAll("algolia-recommendations-slider").forEach(e=>{e.destroy&&e.destroy()})}waitForElement(e,t){let r=document.querySelector(e);if(r){t(r);return}let i=new MutationObserver(()=>{let s=document.querySelector(e);s&&(i.disconnect(),t(s))});i.observe(document.body,{childList:!0,subtree:!0})}},R=new C,m=R;var w=!1,y=0,L=2;function b(){if(console.log(`[PR Init] Attempt ${y+1}/${L}`),w)return;if(y++,y>L){console.warn("[PR Init] Max attempts reached");return}let l=document.querySelector('salla-products-list[source="product.index"], salla-products-list[source="categories"]');if(console.log("[PR Init] Category list found:",!!l),l){let t=l.getAttribute("source-value");if(t){console.log("[PR Init] \u2705 Creating ranking for category:",t),q("category",t),w=!0;return}}let e=document.querySelector('salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]');if(e){let t=e.getAttribute("source-value");if(t){console.log("[PR Init] \u2705 Creating ranking for tag:",t),q("tag",t),w=!0;return}}y<L&&(console.log("[PR Init] Retrying in 800ms..."),setTimeout(b,800))}function q(l,e){if(document.querySelector(`product-ranking[${l}-id="${e}"]`))return;let t=document.createElement("product-ranking");t.setAttribute(`${l}-id`,e),document.body.appendChild(t)}document.addEventListener("salla::page::changed",()=>{w=!1,y=0,document.querySelectorAll("product-ranking").forEach(l=>l.remove()),setTimeout(b,100)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):(b(),document.addEventListener("salla::ready",()=>{w||setTimeout(b,100)}));var M=`
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
`,T=class{constructor(){this.processed=new WeakSet,this.stylesInjected=!1,this.init()}extractVideoId(e){if(!e)return null;let t=[/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,/(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/];for(let r of t){let i=e.match(r);if(i)return i[1]}return null}injectStyles(){if(this.stylesInjected||document.getElementById("yt-url-transformer-styles"))return;let e=document.createElement("style");e.id="yt-url-transformer-styles",e.textContent=M,document.head.appendChild(e),this.stylesInjected=!0}createPlaceholder(e){let t=document.createElement("div");t.className="yt-placeholder",t.dataset.videoId=e;let r=document.createElement("img");r.src=`https://img.youtube.com/vi/${e}/hqdefault.jpg`,r.alt="Video thumbnail",r.loading="lazy";let i=document.createElement("button");return i.className="yt-placeholder-play",i.setAttribute("aria-label","Play video"),t.appendChild(r),t.appendChild(i),t.addEventListener("click",()=>this.playVideo(t,e)),t}playVideo(e,t){if(e.classList.contains("playing"))return;let r=document.createElement("iframe");r.src=`https://www.youtube-nocookie.com/embed/${t}?autoplay=1&rel=0`,r.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",r.allowFullscreen=!0,r.dataset.ytOptIn="true",e.appendChild(r),e.classList.add("playing")}isYouTubeUrl(e){return e?/(?:youtube\.com|youtu\.be)/.test(e):!1}transformLink(e){if(this.processed.has(e)||!this.isYouTubeUrl(e.href))return;let t=this.extractVideoId(e.href);if(!t)return;let r=this.createPlaceholder(t);e.replaceWith(r),this.processed.add(r)}transformTextUrls(e){if(this.processed.has(e))return;let t=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,null,!1),r=/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,i=[],s;for(;s=t.nextNode();){let o=s.textContent;r.test(o)&&i.push(s),r.lastIndex=0}i.forEach(o=>{let c=o.textContent,a=document.createDocumentFragment(),d=0,n;for(r.lastIndex=0;(n=r.exec(c))!==null;){n.index>d&&a.appendChild(document.createTextNode(c.slice(d,n.index)));let u=n[1],h=this.createPlaceholder(u);a.appendChild(h),d=n.index+n[0].length}d<c.length&&a.appendChild(document.createTextNode(c.slice(d))),o.parentNode.replaceChild(a,o)}),this.processed.add(e)}transform(e=document.body){if(!e)return;e.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]').forEach(i=>this.transformLink(i)),e.querySelectorAll('.product-description, .s-product-description, [class*="description"], .widget-content').forEach(i=>this.transformTextUrls(i))}setupObserver(){new MutationObserver(t=>{let r=!1;for(let i of t){for(let s of i.addedNodes)if(s.nodeType===Node.ELEMENT_NODE&&(s.querySelector?.('a[href*="youtube"], a[href*="youtu.be"]')||s.matches?.('[class*="description"]'))){r=!0;break}if(r)break}r&&requestAnimationFrame(()=>this.transform())}).observe(document.body,{childList:!0,subtree:!0})}setupEventListeners(){document.addEventListener("salla::page::changed",()=>{setTimeout(()=>this.transform(),100)}),document.addEventListener("theme::ready",()=>{this.transform()}),window.salla?.event&&(window.salla.event.on("product::loaded",()=>this.transform()),window.salla.event.on("products::loaded",()=>this.transform()))}init(){this.injectStyles(),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.transform()):this.transform(),window.addEventListener("load",()=>this.transform()),this.setupObserver(),this.setupEventListeners(),console.log("[Algolia Bundle] YouTube URL transformer initialized")}},se=new T;var j=`
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
`,k=class{constructor(){this.processedElements=new WeakSet,this.pendingScan=!1,this.init()}getTitleClass(e){if(!e)return"";let t=e.length;return t>70?"title-extreme":t>50?"title-very-long":t>30?"title-long":t>15?"title-medium":""}enhanceTitle(e){if(this.processedElements.has(e))return;let t=e.textContent?.trim(),r=this.getTitleClass(t);r&&e.classList.add(r),this.processedElements.add(e)}enhanceAllTitles(){document.querySelectorAll(".s-product-card-content-title a").forEach(t=>this.enhanceTitle(t))}scheduleScan(){this.pendingScan||(this.pendingScan=!0,requestAnimationFrame(()=>{this.enhanceAllTitles(),this.pendingScan=!1}))}injectStyles(){if(document.getElementById("product-title-enhancer-styles"))return;let e=document.createElement("style");e.id="product-title-enhancer-styles",e.textContent=j,document.head.appendChild(e)}setupMutationObserver(){new MutationObserver(t=>{let r=!1;for(let i of t){if(i.addedNodes.length){for(let s of i.addedNodes)if(s.nodeType===Node.ELEMENT_NODE&&(s.matches?.(".s-product-card-content-title a")||s.matches?.(".s-product-card-entry")||s.querySelector?.(".s-product-card-content-title a"))){r=!0;break}}if(r)break}r&&this.scheduleScan()}).observe(document.body,{childList:!0,subtree:!0})}setupSallaEventListeners(){window.salla?.event&&(window.salla.event.on("products::loaded",()=>this.scheduleScan()),window.salla.event.on("product::loaded",()=>this.scheduleScan())),document.addEventListener("theme::ready",()=>this.scheduleScan()),document.addEventListener("salla::page::changed",()=>{setTimeout(()=>this.scheduleScan(),100)})}init(){this.injectStyles(),this.enhanceAllTitles(),document.readyState==="loading"&&document.addEventListener("DOMContentLoaded",()=>this.enhanceAllTitles()),window.addEventListener("load",()=>this.enhanceAllTitles()),this.setupMutationObserver(),this.setupSallaEventListeners(),console.log("[Algolia Bundle] Product title enhancer initialized")}},ne=new k;var z="https://productstoredis-163858290861.me-central2.run.app/product-images";var S=new Map,v=new Map,$=`
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
`;function F(){if(document.getElementById("product-slider-enhancer-styles"))return;let l=document.createElement("style");l.id="product-slider-enhancer-styles",l.textContent=$,document.head.appendChild(l)}async function O(l){if(!l.length)return{};let e=`${z}?ids=${l.join(",")}`,t=new AbortController,r=setTimeout(()=>t.abort(),5e3);try{let i=await fetch(e,{signal:t.signal});if(!i.ok)throw new Error(`HTTP ${i.status}`);let s=await i.json();return Object.entries(s).forEach(([o,c])=>{c?.images&&S.set(String(o),c)}),s}catch(i){return console.warn("[Card Enhancer] Bulk fetch failed:",i.message),{}}finally{clearTimeout(r)}}async function _(l){if(S.has(l))return S.get(l);if(v.has(l))return v.get(l);let e=(async()=>{let t=new AbortController,r=setTimeout(()=>t.abort(),5e3);try{let i=await fetch(`${z}/${l}`,{signal:t.signal});if(!i.ok)throw new Error(`HTTP ${i.status}`);let s=await i.json();return S.set(l,s),s}catch{return null}finally{clearTimeout(r),v.delete(l)}})();return v.set(l,e),e}var P=class{constructor(){this.enhanced=new WeakSet,this.scanPending=!1,this.scanCount=0,this.maxScans=30,this.init()}init(){F(),this.scheduleScan(0),document.readyState==="loading"&&document.addEventListener("DOMContentLoaded",()=>this.scheduleScan(0)),window.addEventListener("load",()=>{this.scheduleScan(100),this.scheduleScan(500)}),["salla-products-slider::products.fetched","salla-products-list::products.fetched","salla::page::changed","theme::ready"].forEach(t=>{document.addEventListener(t,()=>{this.scanCount=0,this.scheduleScan(50),this.scheduleScan(200),this.scheduleScan(500)})}),this.setupObserver(),console.log("[Card Enhancer] Initialized")}setupObserver(){new MutationObserver(t=>{let r=!1;for(let i of t){for(let s of i.addedNodes)if(s.nodeType===Node.ELEMENT_NODE&&(s.classList?.contains("s-product-card-entry")||s.classList?.contains("s-products-list-wrapper")||s.querySelector?.(".s-product-card-entry"))){r=!0;break}if(r)break}r&&(this.scanCount=0,this.scheduleScan(10),this.scheduleScan(100))}).observe(document.body,{childList:!0,subtree:!0})}scheduleScan(e=0){setTimeout(()=>{requestAnimationFrame(()=>this.scan())},e)}scan(){if(this.scanCount>=this.maxScans)return;let e=document.querySelectorAll(".s-product-card-entry"),t=[];if(e.forEach(i=>{if(this.enhanced.has(i)||i.querySelector(".product-slider-dots"))return;let s=this.extractProductId(i);s&&t.push({card:i,productId:s})}),t.length===0)return;this.scanCount++;let r=t.map(i=>i.productId).filter(i=>!S.has(i)&&!v.has(i));if(r.length>0)for(let i=0;i<r.length;i+=50)O(r.slice(i,i+50));t.forEach(({card:i,productId:s})=>{this.enhanceCard(i,s)}),this.scanCount<this.maxScans&&this.scheduleScan(150)}extractProductId(e){if(e.dataset.id)return e.dataset.id;if(e.id&&/^\d+$/.test(e.id))return e.id;let t=e.querySelector('a[href*="/product/"]');if(t?.href){let i=t.href.match(/\/product\/[^\/]+\/(\d+)/);if(i)return i[1]}let r=e.getAttribute("product");if(r)try{let i=JSON.parse(r);if(i.id)return String(i.id)}catch{}return null}enhanceCard(e,t){let r=e.querySelector(".s-product-card-image");r&&(this.enhanced.add(e),new N(e,t,r))}},N=class{constructor(e,t,r){this.card=e,this.productId=t,this.imageWrapper=r,this.imageLink=r.querySelector("a"),this.sliderId=`slider-${t}-${Math.random().toString(36).substr(2,6)}`,this.currentSlide=0,this.additionalImages=[],this.initialized=!1,this.setupLazyInit()}setupLazyInit(){let e=new IntersectionObserver(t=>{t.forEach(r=>{r.isIntersecting&&!this.initialized&&(this.initialized=!0,e.disconnect(),this.initialize())})},{rootMargin:"200px",threshold:.01});e.observe(this.imageWrapper)}async initialize(){this.setupUI();let e=await _(this.productId);e?.images?.length?this.processImages(e.images):this.hideDots()}setupUI(){if(!this.imageLink)return;let e=document.createElement("div");e.className="swipe-indicator",this.imageLink.appendChild(e),this.setupGestures(e),this.setupDots()}setupDots(){let e=document.createElement("div");e.className="product-slider-dots",e.dataset.sliderId=this.sliderId;for(let t=0;t<3;t++){let r=document.createElement("span");r.className=`product-slider-dot${t===0?" active":""}`,r.dataset.index=t,r.addEventListener("click",i=>{i.preventDefault(),i.stopPropagation(),this.goToSlide(t),this.haptic("light")}),e.appendChild(r)}this.imageWrapper.appendChild(e),this.dotsContainer=e}setupGestures(e){let t,r,i,s,o=(n,u)=>{t=n,r=u,i=Date.now(),s=!1},c=(n,u,h)=>{if(t===void 0)return;let g=n-t,f=u-r;Math.abs(g)>Math.abs(f)&&Math.abs(g)>10&&(s=!0,e.classList.toggle("right",g>0),e.style.opacity=Math.min(Math.abs(g)/100,.5),h.preventDefault())},a=n=>{if(t!==void 0){if(e.style.opacity=0,s){let u=n-t,g=Date.now()-i<300?30:50;Math.abs(u)>=g&&(u>0?this.prevSlide():this.nextSlide(),this.haptic("medium"))}t=r=void 0,s=!1}};this.imageLink.addEventListener("touchstart",n=>{o(n.touches[0].clientX,n.touches[0].clientY)},{passive:!0}),this.imageLink.addEventListener("touchmove",n=>{c(n.touches[0].clientX,n.touches[0].clientY,n)},{passive:!1}),this.imageLink.addEventListener("touchend",n=>{a(n.changedTouches[0].clientX)});let d=!1;this.imageLink.addEventListener("mousedown",n=>{d=!0,o(n.clientX,n.clientY),n.preventDefault()}),this.imageLink.addEventListener("mousemove",n=>{d&&c(n.clientX,n.clientY,n)}),window.addEventListener("mouseup",n=>{d&&(d=!1,a(n.clientX))})}processImages(e){let t=e.filter(r=>r?.url).sort((r,i)=>(r.sort||0)-(i.sort||0)).slice(0,2);if(t.length===0){this.hideDots();return}if(this.additionalImages=t,t.forEach((r,i)=>{this.addImage(r,i+1)}),t.length<2){let r=this.dotsContainer?.querySelector('[data-index="2"]');r&&(r.style.display="none")}}addImage(e,t){if(!this.imageLink)return;let r=document.createElement("img");r.className="product-slider-image",r.dataset.sliderId=this.sliderId,r.dataset.index=t,r.alt=e.alt||"Product image",r.loading="lazy",r.src=e.url,r.onerror=()=>{r.remove();let i=this.dotsContainer?.querySelector(`[data-index="${t}"]`);i&&(i.style.display="none")},this.imageLink.appendChild(r)}goToSlide(e){this.currentSlide=e,this.dotsContainer?.querySelectorAll(".product-slider-dot").forEach((i,s)=>{i.classList.toggle("active",s===e)});let t=this.imageLink?.querySelector("img:not(.product-slider-image)"),r=this.imageLink?.querySelectorAll(".product-slider-image");e===0?(t&&(t.style.cssText="visibility:visible;opacity:1;z-index:10;"),r?.forEach(i=>i.classList.remove("active"))):(t&&(t.style.cssText="visibility:hidden;opacity:0;z-index:5;"),r?.forEach(i=>{i.classList.toggle("active",parseInt(i.dataset.index)===e)}))}prevSlide(){let e=this.additionalImages.length+1;this.goToSlide((this.currentSlide-1+e)%e)}nextSlide(){let e=this.additionalImages.length+1;this.goToSlide((this.currentSlide+1)%e)}hideDots(){this.dotsContainer&&(this.dotsContainer.style.display="none")}haptic(e){try{navigator.vibrate&&navigator.vibrate(e==="light"?10:25)}catch{}}},le=new P;window.productRecommendations=m;window.redisService=p;var V=l=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",l):l();function H(){if(!document.body.classList.contains("index")){console.log("[Algolia Bundle] Not on homepage, skipping category products injection");return}let l=".app-inner",e="mahaba-category-products";function t(){let i=document.querySelector(l);if(i&&!i.querySelector(e))try{console.log(`[Algolia Bundle] Found ${l}, injecting ${e}...`);let s=document.createElement(e),o=document.querySelector(".store-footer");return o?i.insertBefore(s,o):i.appendChild(s),console.log("\u2705 [Algolia Bundle] Homepage category component injected successfully"),!0}catch(s){return console.error("[Algolia Bundle] Error during injection:",s),!0}return!1}if(t())return;console.log(`[Algolia Bundle] ${l} not found, waiting for async load...`),new MutationObserver((i,s)=>{i.some(c=>c.addedNodes.length>0)&&t()&&s.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}function U(){if(document.getElementById("cart-addons-slider-styles"))return;let l=document.createElement("style");l.id="cart-addons-slider-styles",l.textContent=`
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
  `,document.head.appendChild(l)}function B(){U();let l=()=>{let t=document.querySelector("#cart-submit");if(!t)return!1;let r=t.closest(".cart-submit-wrap")||t.parentElement,i=r?.parentElement||r;if(!i)return!1;if(i.querySelector("cart-addons-slider"))return!0;let s=document.createElement("cart-addons-slider");return s.className="cart-addons-wrapper",r&&i?i.insertBefore(s,r.nextSibling):i.appendChild(s),console.log("[Algolia Bundle] Injected cart addons slider"),!0};if(document.querySelector("cart-addons-slider")||l())return;new MutationObserver((t,r)=>{l()&&r.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}V(()=>{H(),document.querySelector('[id^="product-"]')&&setTimeout(()=>{m.initialize(),console.log("\u2705 [Algolia Bundle] Product recommendations initialized")},3e3),(document.querySelector('form[id^="item-"]')||document.querySelector("#cart-submit"))&&setTimeout(B,500),console.log("\u2705 [Algolia Bundle] Loaded successfully")});document.addEventListener("salla::page::changed",()=>{m.reset(),setTimeout(()=>{m.initialize()},1e3),setTimeout(B,500)});document.addEventListener("theme::ready",()=>{if(!document.querySelector('[id^="product-"]'))return;let l=m.getProductId();l&&m.productId&&l===m.productId||l&&(console.log("[Algolia Bundle] New product detected via theme::ready, re-initializing"),m.reset(),setTimeout(()=>{m.initialize()},1e3))});})();
