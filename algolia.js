var AlgoliaBundle=(()=>{var B=class{constructor(){this.baseUrl="https://me-central2-gtm-5v2mhn4-mwvlm.cloudfunctions.net/function-2",this.maxRetries=2,this.headers={Accept:"application/json","Cache-Control":"public, max-age=3600"},this.cache=new Map,this.fallbackEnabled=!0}async getProducts(t,e,s=0,i=12){if(!e)return null;let r=`${t}:${e}:${s}:${i}`;if(this.cache.has(r))return this.cache.get(r);let o=t==="category"?"catID":"tagID",a=t==="category"?"categoryById":"tagById",l=`${this.baseUrl}/?type=${a}&${o}=${encodeURIComponent(e)}&offset=${s}&limit=${i}`,d=null;try{let c=new AbortController,p=setTimeout(()=>c.abort(),2e3),u=await fetch(l,{method:"GET",headers:this.headers,signal:c.signal});if(clearTimeout(p),!u.ok)throw new Error(`HTTP error: ${u.status}`);if(d=await u.json(),d?.objectIDs?.length)return this.cache.set(r,d),d}catch{}if(!d?.objectIDs?.length&&this.fallbackEnabled)try{let c=await fetch(l,{method:"GET",headers:this.headers});if(c.ok&&(d=await c.json(),d?.objectIDs?.length))return this.cache.set(r,d),d}catch{}return d||{objectIDs:[],hasMore:!1}}async getRecommendations(t){if(!t)return[];let e=`recommendations:${t}`;if(this.cache.has(e))return this.cache.get(e);let s=`${this.baseUrl}/?type=recommendations&objectID=${encodeURIComponent(t)}`;try{let i=new AbortController,r=setTimeout(()=>i.abort(),3e3),o=await fetch(s,{method:"GET",headers:this.headers,signal:i.signal});if(clearTimeout(r),!o.ok)return[];let a=await o.json(),l=Array.isArray(a?.relatedProductIDs)?a.relatedProductIDs:[];return this.cache.set(e,l),l}catch{return[]}}async getFrequentlyBought(t){if(!t)return[];let e=`frequently-bought:${t}`;if(this.cache.has(e))return this.cache.get(e);let s=`${this.baseUrl}/?type=frequentlyBought&objectID=${encodeURIComponent(t)}`;try{let i=new AbortController,r=setTimeout(()=>i.abort(),3e3),o=await fetch(s,{method:"GET",headers:this.headers,signal:i.signal});if(clearTimeout(r),!o.ok)return[];let a=await o.json(),l=Array.isArray(a?.frequentlyBoughtIDs)?a.frequentlyBoughtIDs:[];return this.cache.set(e,l),l}catch{return[]}}async getCategoriesFromRedis(){let t="all-categories";if(this.cache.has(t))return this.cache.get(t);try{let e=new AbortController,s=setTimeout(()=>e.abort(),5e3),i=await fetch(`${this.baseUrl}/?type=categories`,{method:"GET",headers:this.headers,signal:e.signal});if(clearTimeout(s),!i.ok)return[];let o=(await i.json()).categories||[];return this.cache.set(t,o),o}catch{return[]}}async getGlobalProducts(t=0,e=12){let s=`global-products:${t}:${e}`;if(this.cache.has(s))return this.cache.get(s);try{let i=new AbortController,r=setTimeout(()=>i.abort(),3e3),o=`${this.baseUrl}/?type=categoryById&catID=trending-now&offset=${t}&limit=${e}`,a=await fetch(o,{method:"GET",headers:this.headers,signal:i.signal});if(clearTimeout(r),!a.ok)return{objectIDs:[],hasMore:!1};let l=await a.json(),d={objectIDs:l.objectIDs||[],hasMore:l.hasMore||!1};return this.cache.set(s,d),d}catch{return{objectIDs:[],hasMore:!1}}}async getCategoryPageById(t,e=0,s=12){return this.getProducts("category",t,e,s)}async getCategoryProducts(t,e,s){return this.getProducts("category",t,e,s)}async getTagProducts(t,e,s){return this.getProducts("tag",t,e,s)}},y=new B;var $=class extends HTMLElement{constructor(){super(),this.initialized=!1,this.productIds=[],this.structureReady=!1}connectedCallback(){this.ensureStructure(),!this.initialized&&this.getHighestValueItemFromDOM().then(t=>t?this.fetchFrequentlyBoughtProducts(t):[]).then(()=>{this.renderProductList(),setTimeout(()=>{this.initializeSlider()},1e3)}).catch(t=>{console.error("[CartAddonsSlider] Error loading products:",t)})}ensureStructure(){if(!this.structureReady){if(!this.querySelector(".cart-addons-title")){let t=document.createElement("h3");t.className="cart-addons-title",t.textContent=window.salla?.lang?.get("pages.cart.frequently_bought_together")||"Frequently bought together",this.appendChild(t)}if(!this.querySelector(".frequently-bought-container")){let t=document.createElement("div");t.className="frequently-bought-container",this.appendChild(t)}this.structureReady=!0}}async getHighestValueItemFromDOM(){try{let t=document.querySelectorAll('form[id^="item-"]');if(!t||t.length===0)return console.log("[CartAddonsSlider] No cart items found in DOM"),null;let e=null,s=0;return t.forEach(i=>{try{let r=i.getAttribute("id")||"",o=r.replace("item-",""),a=i.querySelector('a[href*="/p"]');if(!a){console.log("[CartAddonsSlider] No product link found in form",r);return}let l=a.getAttribute("href"),d=l.match(/\/p(\d+)(?:$|\/|\?)/);if(!d||!d[1]){console.log("[CartAddonsSlider] Could not extract product ID from URL",l);return}let c=d[1],p=i.querySelector(".item-total");if(p){let g=(p.textContent||p.innerText||"0").replace(/[^\d.,٠١٢٣٤٥٦٧٨٩]/g,"").replace(/٠/g,"0").replace(/١/g,"1").replace(/٢/g,"2").replace(/٣/g,"3").replace(/٤/g,"4").replace(/٥/g,"5").replace(/٦/g,"6").replace(/٧/g,"7").replace(/٨/g,"8").replace(/٩/g,"9"),m=parseFloat(g.replace(",","."))||0;console.log(`[CartAddonsSlider] Item ${o}: Product ID ${c}, Total: ${m}`),!isNaN(m)&&m>s&&(s=m,e={itemId:o,productId:c,total:m})}}catch(r){console.error("[CartAddonsSlider] Error processing item form:",r)}}),e?(console.log("[CartAddonsSlider] Highest value item:",e),e.productId):null}catch(t){return console.error("[CartAddonsSlider] Error extracting cart data from DOM:",t),null}}async fetchFrequentlyBoughtProducts(t){try{console.log("[CartAddonsSlider] Fetching frequently bought products for:",t);let e=await y.getFrequentlyBought(t);return e&&e.length>0?(console.log("[CartAddonsSlider] Found frequently bought products:",e),this.productIds=e.map(s=>String(s)).slice(0,8),this.productIds):(console.log("[CartAddonsSlider] No frequently bought products found"),this.productIds=[],[])}catch(e){return console.error("[CartAddonsSlider] Error fetching frequently bought products:",e),this.productIds=[],[]}}renderProductList(){if(!this.productIds||this.productIds.length===0){console.log("[CartAddonsSlider] No products to render, hiding component"),this.style.display="none";return}console.log("[CartAddonsSlider] Rendering product list with IDs:",this.productIds);let t=this.querySelector(".frequently-bought-container");if(!t){console.error("[CartAddonsSlider] Container not found");return}let e=document.createElement("salla-products-list");if(e.setAttribute("source","selected"),e.setAttribute("loading","lazy"),e.setAttribute("source-value",JSON.stringify(this.productIds)),e.setAttribute("class","s-products-list-vertical-cards"),t.innerHTML="",t.appendChild(e),!this.querySelector(".touch-indicator")){let s=document.createElement("div");s.classList.add("touch-indicator"),this.appendChild(s)}console.log("[CartAddonsSlider] Product list rendered")}initializeSlider(){try{let t=this.querySelector("salla-products-list");if(!t){console.log("[CartAddonsSlider] Products list not found");return}t.style.opacity="1",window.salla?.event?.dispatch&&window.salla.event.dispatch("twilight::mutation"),this.initialized=!0,console.log("[CartAddonsSlider] Slider initialized")}catch(t){console.error("[CartAddonsSlider] Failed to initialize cart addons slider:",t)}}};customElements.get("cart-addons-slider")||(customElements.define("cart-addons-slider",$),console.log("[CartAddonsSlider] Custom element defined"));var z=class extends HTMLElement{constructor(){super(),this.page=0,this.loading=!1,this.hasMore=!0,this.ids=[],this.container=null,this.originalList=null,this.usingSallaFilter=!1,this.timeout=null}async connectedCallback(){let t=this.getAttribute("category-id"),e=this.getAttribute("tag-id");if(console.log("[PR Element] Connected:",{categoryId:t,tagId:e}),!(!t&&!e))try{await this.waitForSalla(),this.setupFilterListener(),await this.initialize(t,e)}catch(s){console.error("[PR Element] Error:",s),this.restoreOriginalList()}}restoreOriginalList(){if(!this.originalList||this.usingSallaFilter)return;let t=document.querySelector(".ranked-products, salla-products-list[filter]"),e=t?.parentNode||this.originalList.parentNode;t&&t.remove(),this.container&&(this.container.remove(),this.container=null),e&&!e.querySelector("salla-products-list")&&(e.appendChild(this.originalList.cloneNode(!0)),window.salla?.event?.dispatch("twilight::mutation"))}setupFilterListener(){document.addEventListener("change",t=>{if(t.target.id!=="product-filter")return;let e=t.target.value;e==="ourSuggest"&&this.usingSallaFilter?this.applyRedisRanking():e!=="ourSuggest"&&this.applySallaFilter(e)})}async applySallaFilter(t){let e=this.getAttribute("category-id"),s=this.getAttribute("tag-id");if(!this.originalList)return;let i=document.querySelector(".ranked-products, salla-products-list[filter]"),r=i?.parentNode||this.container?.parentNode;if(!r)return;i&&i.remove(),this.container&&(this.container.remove(),this.container=null),this.cleanupScrollListener(),this.usingSallaFilter=!0;let o=this.originalList.cloneNode(!0);o.setAttribute("filter",t),r.appendChild(o),window.salla?.event?.dispatch("twilight::mutation")}async applyRedisRanking(){let t=this.getAttribute("category-id"),e=this.getAttribute("tag-id");this.usingSallaFilter=!1,await this.initialize(t,e,!0)}async initialize(t,e,s=!1){if(console.log("[PR Element] Initialize called"),this.container&&!this.usingSallaFilter&&!s)return;let i=t?'salla-products-list[source="product.index"], salla-products-list[source="categories"]':'salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]',r=document.querySelector(i);if(console.log("[PR Element] Existing list found:",!!r),!r)return;this.originalList||(this.originalList=r.cloneNode(!0));let o=document.getElementById("product-filter");if(o)o.value="ourSuggest",this.usingSallaFilter=!1;else if(o&&o.value!=="ourSuggest"&&!s){this.usingSallaFilter=!0;return}let a=t?y.getCategoryProducts(t,0,12):y.getTagProducts(e,0,12),l=r.parentNode;this.container=document.createElement("div"),this.container.className="ranked-products",l.insertBefore(this.container,r),clearTimeout(this.timeout),this.timeout=setTimeout(()=>{(!this.ids||!this.ids.length)&&this.restoreOriginalList()},2500);let d=await a;if(clearTimeout(this.timeout),console.log("[PR Element] Redis data received:",d?.objectIDs?.length,"products"),console.log("[PR Element] Redis product IDs:",d.objectIDs),!d?.objectIDs?.length){console.warn("[PR Element] No products from Redis, restoring original"),this.restoreOriginalList();return}this.ids=d.objectIDs,this.page=0,this.hasMore=!0,this.usingSallaFilter=!1;let c=document.createElement("salla-products-list");c.setAttribute("source","selected"),c.setAttribute("source-value",JSON.stringify(this.ids)),c.setAttribute("limit",this.ids.length),c.className=r.className||"w-full",this.container.appendChild(c),r.remove(),window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(this.container,this.ids),this.setupScrollListener()}setupScrollListener(){this.cleanupScrollListener(),this._boundScrollHandler=this.handleScroll.bind(this),window.addEventListener("scroll",this._boundScrollHandler)}cleanupScrollListener(){this._boundScrollHandler&&(window.removeEventListener("scroll",this._boundScrollHandler),this._boundScrollHandler=null)}handleScroll(){if(this.loading||!this.hasMore||this.usingSallaFilter)return;let t=window.scrollY+window.innerHeight,e=document.documentElement.scrollHeight*.5;t>e&&this.loadMore()}async loadMore(){if(!(this.loading||!this.hasMore)){this.loading=!0;try{let t=this.page+1,e=t*12,s=this.getAttribute("category-id"),i=this.getAttribute("tag-id"),r=s?await y.getCategoryProducts(s,e,12):await y.getTagProducts(i,e,12);if(!r?.objectIDs?.length){this.hasMore=!1;return}let o=document.createElement("salla-products-list");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(r.objectIDs)),o.setAttribute("limit",r.objectIDs.length),o.className="w-full",this.container.appendChild(o),this.page=t,this.hasMore=r.hasMore!==!1,window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(o,r.objectIDs)}catch{this.hasMore=!1}finally{this.loading=!1}}}async waitForSalla(){if(!window.salla)return new Promise(t=>{document.addEventListener("salla::ready",t,{once:!0}),setTimeout(t,3e3)})}applyOrderToList(t,e,s=30){if(!t||!e||!e.length)return;let i=0,r=setInterval(()=>{i++;let o=Array.from(t.querySelectorAll("custom-salla-product-card, .s-product-card-entry"));if(o.length>0){clearInterval(r);let a=new Map;o.forEach(d=>{let c=null;if(d.dataset.id)c=d.dataset.id;else if(d.id&&!isNaN(d.id))c=d.id;else{let p=d.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(p?.href){let u=p.href.match(/\/product\/[^\/]+\/(\d+)/);u&&(c=u[1])}}c&&a.set(String(c),d)});let l=o[0].parentNode;if(!l)return;e.forEach(d=>{let c=a.get(String(d));c&&l.contains(c)&&l.appendChild(c)}),console.log("[PR Element] Reordered",o.length,"cards to match Redis order")}else i>=s&&(clearInterval(r),console.warn("[PR Element] Cards never appeared, skipping reorder"))},100)}disconnectedCallback(){this.cleanupScrollListener(),clearTimeout(this.timeout)}};customElements.get("product-ranking")||customElements.define("product-ranking",z);var O=class extends HTMLElement{constructor(){super(),this.state={productsPerPage:30,categories:[],trendingCategory:{name:"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646",slug:"trending-now",filter:null,hasSubcats:!1,url:null}},this.categoriesLoading=!0,this.seenProductIds=new Set}async connectedCallback(){this.innerHTML=`
            <div class="category-filter">
                <div class="categories-loading">\u062C\u0627\u0631\u0650 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A...</div>
            </div>
        `;try{await this.fetchCategoriesFromCloudRun();let t=this.createTemplate();this.innerHTML=t,await this.initializeCategorySections()}catch(t){this.handleInitError(t)}}disconnectedCallback(){}async fetchCategoriesFromCloudRun(){let t={228327271:{name:"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA/c228327271"},476899183:{name:"\u062C\u0644\u0627\u0628\u064A\u0627\u062A",url:"https://darlena.com/%D8%AC%D9%84%D8%A7%D8%A8%D9%8A%D8%A7%D8%AA/c476899183"},1466412179:{name:"\u062C\u062F\u064A\u062F\u0646\u0627",url:"https://darlena.com/%D8%AC%D8%AF%D9%8A%D8%AF-%D8%AF%D8%A7%D8%B1-%D9%84%D9%8A%D9%86%D8%A7/c1466412179"},289250285:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%83%D9%84%D9%88%D8%B4/c289250285"},1891285357:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B3%D9%88%D8%AF%D8%A7%D8%A1-%D8%B3%D8%A7%D8%AF%D8%A9/c1891285357"},2132455494:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D9%84%D9%88%D9%86%D8%A9/c2132455494"},940975465:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%AC%D9%8A%D9%88%D8%A8/c940975465"},1567146102:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%B4%D8%AA/c1567146102"},832995956:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D8%B7%D8%B1%D8%B2%D8%A9/c832995956"},2031226480:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B1%D8%A3%D8%B3/c2031226480"},1122348775:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B5%D9%8A%D9%81%D9%8A%D8%A9/c1122348775"},692927841:{name:"\u0637\u0631\u062D",url:"https://darlena.com/%D8%B7%D8%B1%D8%AD/c692927841"},639447590:{name:"\u0646\u0642\u0627\u0628\u0627\u062A",url:"https://darlena.com/%D9%86%D9%82%D8%A7%D8%A8%D8%A7%D8%AA/c639447590"},114756598:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646",url:"https://darlena.com/%D8%B4%D9%8A%D9%81%D9%88%D9%86/c114756598"}},e={"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646":1,\u062C\u062F\u064A\u062F\u0646\u0627:2,"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629":3,"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A":4,"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634":5,\u062C\u0644\u0627\u0628\u064A\u0627\u062A:6,"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646":7,"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629":8,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628":9,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A":10,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629":11,"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633":12,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629":13,\u0637\u0631\u062D:14,\u0646\u0642\u0627\u0628\u0627\u062A:15};try{let s=await y.getCategoriesFromRedis();if(!Array.isArray(s))throw new Error("Categories data is not an array");let i=s.map(r=>({slug:r.name,name:r.name,filter:r.name,hasSubcats:!1,count:r.count||0,ids:r.ids||(r.id?[r.id]:[])}));i=i.filter(r=>{if(r.ids.length>0){let o=Number(r.ids[0]);return t.hasOwnProperty(o)}return!1}).map(r=>{let o=Number(r.ids[0]);return{...r,name:t[o].name,slug:t[o].name.toLowerCase().replace(/\s+/g,"-"),url:t[o].url,ids:r.ids}}),i.sort((r,o)=>{let a=e[r.name]||999,l=e[o.name]||999;return a-l}),i.unshift({...this.state.trendingCategory}),this.state.categories=i}catch(s){throw this.state.categories=[{...this.state.trendingCategory}],s}finally{this.categoriesLoading=!1}}createTemplate(){return this.categoriesLoading?`
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
        `}async initializeCategorySections(){try{let t=this.state.categories.map(r=>r.slug==="trending-now"?y.getGlobalProducts(0,this.state.productsPerPage).then(o=>({slug:r.slug,ids:o.objectIDs||[]})).catch(o=>({slug:r.slug,ids:[],error:o})):r.ids&&r.ids.length>0?this.fetchRegularCategory(r).then(o=>({slug:r.slug,ids:o||[]})).catch(o=>({slug:r.slug,ids:[],error:o})):Promise.resolve({slug:r.slug,ids:[]})),s=(await Promise.all(t)).reduce((r,o)=>(r[o.slug]=o.ids,r),{});this.seenProductIds.clear();let i={};for(let r of this.state.categories){let o=s[r.slug]||[],a=[];for(let l of o)if(!this.seenProductIds.has(l)&&(this.seenProductIds.add(l),a.push(l),a.length>=6))break;i[r.slug]=a}this.renderProductSliders(i)}catch(t){this.handleInitError(t)}}async fetchRegularCategory(t){let e=t.ids.map(s=>y.getCategoryPageById(s,0,this.state.productsPerPage).catch(i=>({objectIDs:[]})));try{return(await Promise.all(e)).flatMap(i=>i&&i.objectIDs?i.objectIDs:[])}catch{return[]}}renderProductSliders(t){this.state.categories.forEach(e=>{let s=e.slug,i=t[s]||[],r=this.querySelector(`#products-${s}`);if(r)if(r.innerHTML="",i.length>0){let o=document.createElement("salla-products-slider");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(i)),o.setAttribute("limit",String(i.length)),o.setAttribute("slider-id",`slider-${s}`),o.setAttribute("block-title"," "),o.setAttribute("arrows","true"),o.setAttribute("rtl","true"),r.appendChild(o),setTimeout(()=>{o.querySelectorAll(".s-product-card-content-sub").forEach(l=>{l.children.length>1&&(l.style.display="flex",l.style.alignItems="center",l.style.justifyContent="space-between",l.style.flexWrap="nowrap",l.style.width="100%",l.style.overflow="visible")})},500)}else r.innerHTML='<div style="text-align: center; padding: 1rem;">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0639\u0631\u0636\u0647\u0627 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0629.</div>'})}handleInitError(t){this.innerHTML=`
            <div class="category-filter">
                <div class="error-message" style="color: #e53e3e; text-align: center; padding: 2rem; margin-top: 2rem;">
                    \u0639\u0630\u0631\u0627\u064B\u060C \u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A. \u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0635\u0641\u062D\u0629.
                    ${t?"<br><small>Error details logged.</small>":""}
                </div>
            </div>
        `}};customElements.get("mahaba-category-products")||customElements.define("mahaba-category-products",O);var F=class{constructor(){this.initialized=!1,this.productId=null,this.recentlyViewedKey="recently_viewed_products",this.maxRecentProducts=15,this.recentlyViewedClass="algolia-recently-viewed",this.customSliderContainer=null,this.customSwiper=null,this.hiddenOriginalSlider=null}initialize(){if(!this.isProductPage())return;let t=this.getProductId();if(!t||this.initialized&&this.productId===t)return;this.productId=t,this.initialized=!0,this.addToRecentlyViewed(this.productId);let e=()=>{this.loadRecommendations(),this.loadRecentlyViewed()};document.readyState==="complete"||document.readyState==="interactive"?e():document.addEventListener("DOMContentLoaded",e)}loadRecommendations(){let t=document.querySelector('salla-products-slider[source="related"]');t?this.replaceRelatedProducts(t):this.waitForElement('salla-products-slider[source="related"]',e=>{this.replaceRelatedProducts(e)})}loadRecentlyViewed(){let t=this.getRecentlyViewed();if(!t.length)return;let e=t.map(a=>parseInt(a,10)).filter(a=>a&&!isNaN(a)&&a!==parseInt(this.productId,10));if(!e.length)return;this.removeExistingRecentlyViewed();let s=document.createElement("div");s.className="mt-8 s-products-slider-container",s.classList.add(this.recentlyViewedClass);let i=document.createElement("h2");i.className="section-title mb-5 font-bold text-xl",i.textContent="\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0624\u062E\u0631\u0627\u064B",s.appendChild(i);let r=document.createElement("salla-products-slider");r.setAttribute("source","selected"),r.setAttribute("source-value",JSON.stringify(e)),r.setAttribute("autoplay","false"),r.setAttribute("class","product-recommendations-slider");let o=document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"]');r.setAttribute("display-style",o?.getAttribute("display-style")||"normal"),s.appendChild(r),this.insertRecentlyViewedSection(s,o),window.salla?.event?.dispatch("twilight::mutation"),this.setupStockFilter(r)}insertRecentlyViewedSection(t,e){let s=document.querySelector(".product-details, .product-entry, #product-entry");if(s&&s.parentNode)return s.parentNode.insertBefore(t,s.nextSibling),!0;if(e){let r=e.closest(".s-products-slider-container");if(r&&r.parentNode)return r.parentNode.insertBefore(t,r.nextSibling),!0;if(e.parentNode)return e.parentNode.insertBefore(t,e.nextSibling),!0}let i=document.querySelector("main, .s-product-page-content, #content, .s-product-page");return i?(i.appendChild(t),!0):(document.body.appendChild(t),!0)}addToRecentlyViewed(t){if(t)try{let e=parseInt(t,10);if(isNaN(e))return;let s=this.getRecentlyViewed();s=s.map(i=>parseInt(i,10)).filter(i=>!isNaN(i)),s=s.filter(i=>i!==e),s.unshift(e),s.length>this.maxRecentProducts&&(s=s.slice(0,this.maxRecentProducts)),sessionStorage.setItem(this.recentlyViewedKey,JSON.stringify(s))}catch{}}removeExistingRecentlyViewed(){document.querySelectorAll(`.${this.recentlyViewedClass}`).forEach(t=>t.remove())}getRecentlyViewed(){try{let t=sessionStorage.getItem(this.recentlyViewedKey);return t?JSON.parse(t):[]}catch{return[]}}isProductPage(){return!!document.querySelector('.product-form input[name="id"], [id^="product-"], .sidebar .details-slider')}getProductId(){let t=document.querySelector('.product-form input[name="id"]');if(t?.value){let o=parseInt(t.value,10);if(!isNaN(o))return o}let e=window.salla?.product?.id;if(e){let o=parseInt(e,10);if(!isNaN(o))return o}let s=document.querySelector(".product-entry, #product-entry, .product-details");if(s){let o=s.matches('[id^="product-"]')?s:s.querySelector('[id^="product-"]');if(o&&!o.closest("salla-products-slider")){let a=o.id.replace("product-",""),l=parseInt(a,10);if(!isNaN(l))return l}}let i=document.querySelector('[id^="product-"]');if(i&&!i.closest("salla-products-slider")){let o=i.id.replace("product-",""),a=parseInt(o,10);if(!isNaN(a))return a}let r=window.location.pathname.match(/\/p(\d+)/);if(r?.[1]){let o=parseInt(r[1],10);if(!isNaN(o))return o}return null}async replaceRelatedProducts(t){try{let e=this.productId,s=await y.getRecommendations(e);if(e!==this.productId){console.log("[Bundle Recommendations] Product changed during fetch, aborting");return}if(!s?.length){this.teardownCustomSlider();return}let i=s.map(r=>parseInt(r,10)).filter(r=>r&&!isNaN(r));if(!i.length){this.teardownCustomSlider();return}this.renderCustomSlider(t,i)}catch{this.teardownCustomSlider()}}ensureCustomSliderStyles(){if(document.getElementById("algolia-custom-slider-styles"))return;let t=document.createElement("style");t.id="algolia-custom-slider-styles",t.textContent=`
            .algolia-recommendations-container {
                position: relative;
            }
            .algolia-recommendations-container .algolia-slider-head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 1rem;
            }
            .algolia-recommendations-container .algolia-slider-head h2 {
                font-size: 1.25rem;
                font-weight: 700;
                margin: 0;
            }
            .algolia-recommendations-container .algolia-nav-btn {
                background: rgba(0, 0, 0, 0.05);
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 9999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: inherit;
                cursor: pointer;
                transition: background 0.2s ease;
            }
            .algolia-recommendations-container .algolia-nav-btn[disabled] {
                opacity: 0.4;
                cursor: default;
            }
            .algolia-recommendations-container .algolia-nav-btn:not([disabled]):hover {
                background: rgba(0, 0, 0, 0.12);
            }
            .algolia-recommendations-container .algolia-swiper {
                position: relative;
                padding-bottom: 0.5rem;
            }
            .algolia-recommendations-container .algolia-swiper.swiper {
                overflow: hidden;
            }
            .algolia-recommendations-container .algolia-swiper--fallback {
                display: grid;
                grid-auto-flow: column;
                grid-auto-columns: minmax(72%, 1fr);
                gap: 0.75rem;
                overflow-x: auto;
                padding-bottom: 0.5rem;
                scroll-snap-type: x mandatory;
            }
            .algolia-recommendations-container .algolia-swiper--fallback .algolia-slide {
                scroll-snap-align: start;
            }
            .algolia-recommendations-container .swiper-slide.algolia-slide {
                height: auto;
            }
            @media (min-width: 640px) {
                .algolia-recommendations-container .algolia-swiper--fallback {
                    grid-auto-columns: minmax(45%, 1fr);
                }
            }
            @media (min-width: 1024px) {
                .algolia-recommendations-container .algolia-swiper--fallback {
                    grid-auto-columns: minmax(25%, 1fr);
                }
            }
        `,document.head.appendChild(t)}renderCustomSlider(t,e){if(!e?.length){this.teardownCustomSlider();return}let s=this.hiddenOriginalSlider||t,i=s?.parentNode;if(!s||!i)return;this.teardownCustomSlider(),this.ensureCustomSliderStyles(),this.hiddenOriginalSlider=s,s.style.display="none",s.setAttribute("aria-hidden","true"),s.setAttribute("data-algolia-hidden","true");let r=document.createElement("div");r.className="algolia-recommendations-container s-products-slider-wrapper",r.setAttribute("data-algolia-slider","recommendations");let o=`algolia-rec-${Date.now()}`;r.setAttribute("data-slider-id",o);let a=s.getAttribute("block-title")||s.getAttribute("data-title")||s.getAttribute("title")||"\u0645\u0646\u062A\u062C\u0627\u062A \u0642\u062F \u062A\u0639\u062C\u0628\u0643",l=s.getAttribute("display-all-url"),d=document.createElement("div");d.className="s-slider-block__title algolia-slider-head";let c=document.createElement("div");c.className="s-slider-block__title-right";let p=document.createElement("h2");if(p.textContent=a,c.appendChild(p),l){let w=document.createElement("a");w.href=l,w.className="text-sm text-primary-600 hover:underline",w.textContent=window.salla?.lang?.get("common.btn_show_all")||"\u0639\u0631\u0636 \u0627\u0644\u0643\u0644",c.appendChild(w)}let u=document.createElement("div");u.className="s-slider-block__title-left";let g=document.createElement("div");g.className="s-slider-block__title-nav algolia-slider-nav";let m=document.createElement("button");m.type="button",m.className="algolia-nav-btn algolia-nav-prev s-slider-prev s-slider-nav-arrow",m.setAttribute("aria-label","Previous"),m.innerHTML='<span class="s-slider-button-icon"><svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.562 9.521l-6.125 6.125 6.125 6.125-1.875 1.875-8-8 8-8z"/></svg></span>',g.appendChild(m);let f=document.createElement("button");f.type="button",f.className="algolia-nav-btn algolia-nav-next s-slider-next s-slider-nav-arrow",f.setAttribute("aria-label","Next"),f.innerHTML='<span class="s-slider-button-icon"><svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.438 9.896l1.875-1.875 8 8-8 8-1.875-1.875 6.125-6.125z"/></svg></span>',g.appendChild(f),u.appendChild(g),d.appendChild(c),d.appendChild(u),r.appendChild(d);let v=s.getAttribute("dir")||document.dir||"rtl",I=document.createElement("div");I.className="algolia-swiper swiper s-products-slider-slider s-slider-wrapper carousel-slider s-slider-horizontal",I.setAttribute("dir",v);let L=document.createElement("div");L.className="swiper-wrapper",L.id=`${o}-wrapper`,I.appendChild(L),e.forEach(w=>{let q=document.createElement("div");q.className="swiper-slide algolia-slide",q.dataset.productId=String(w);let S=document.createElement("custom-salla-product-card");S.classList.add("s-product-card-entry","s-product-card-vertical"),S.setAttribute("source","selected"),S.setAttribute("loading","lazy"),S.setAttribute("data-id",w),S.setAttribute("product-id",w),S.id=`algolia-card-${w}`,q.appendChild(S),L.appendChild(q)}),r.appendChild(I),i.insertBefore(r,s),this.customSliderContainer=r,g.setAttribute("dir",v),this.customSwiper=this.initCustomSwiper(I,m,f,e.length),e.length<=1&&(m.style.display="none",f.style.display="none"),window.salla?.event?.dispatch("twilight::mutation"),setTimeout(()=>this.applyCustomStockFilter(r),400)}initCustomSwiper(t,e,s,i){return window.Swiper?new window.Swiper(t,{slidesPerView:1.2,spaceBetween:14,watchOverflow:!0,observeParents:!0,observer:!0,direction:t.getAttribute("dir")==="ltr"?"ltr":"rtl",navigation:{nextEl:s,prevEl:e},keyboard:{enabled:!0},breakpoints:{480:{slidesPerView:1.6,spaceBetween:16},768:{slidesPerView:2.4,spaceBetween:18},1024:{slidesPerView:Math.min(3.2,i),spaceBetween:20},1280:{slidesPerView:Math.min(4,i),spaceBetween:20}}}):(t.classList.add("algolia-swiper--fallback"),t.classList.remove("swiper"),t.classList.remove("s-slider-horizontal"),e.style.display="none",s.style.display="none",null)}applyCustomStockFilter(t,e=0){if(!t?.isConnected)return;let s=Array.from(t.querySelectorAll(".s-product-card-entry"));if(!(s.length>0&&s.every(a=>a.querySelector(".s-product-card-content")))){if(e>=12)return;setTimeout(()=>this.applyCustomStockFilter(t,e+1),300);return}let r=0,o=15;s.forEach(a=>{let l=a.closest(".swiper-slide")||a.parentElement;if(!l)return;a.classList.contains("s-product-card-out-of-stock")||r>=o?l.style.display="none":(l.style.display="",r++)}),this.customSwiper&&(this.customSwiper.updateSlides(),this.customSwiper.updateProgress())}teardownCustomSlider(){if(this.customSwiper)try{this.customSwiper.destroy(!0,!0)}catch{}this.customSwiper=null,this.customSliderContainer?.parentNode&&this.customSliderContainer.parentNode.removeChild(this.customSliderContainer),this.customSliderContainer=null,this.hiddenOriginalSlider&&(this.hiddenOriginalSlider.style.display="",this.hiddenOriginalSlider.removeAttribute("aria-hidden"),this.hiddenOriginalSlider.removeAttribute("data-algolia-hidden")),this.hiddenOriginalSlider=null}setupStockFilter(t){window.salla?.event?.on("salla-products-slider::products.fetched",e=>{t.contains(e.target)&&setTimeout(()=>{let s=t.getAttribute("source-value");if(!s){console.warn("[Bundle Recommendations] No source-value found on slider");return}let i=[];try{i=JSON.parse(s)}catch(p){console.error("[Bundle Recommendations] Failed to parse source-value:",p);return}if(!i||!i.length)return;let r=t.querySelector(".swiper-wrapper");if(!r){console.warn("[Bundle Recommendations] No swiper-wrapper found");return}let o=Array.from(r.querySelectorAll(".swiper-slide")),a=new Map;o.forEach(p=>{let u=p.querySelector(".s-product-card-entry");if(!u)return;let g=null;if(u.dataset.id)g=u.dataset.id;else if(u.id&&!isNaN(u.id))g=u.id;else{let m=u.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(m?.href){let f=m.href.match(/\/p(\d+)/)||m.href.match(/\/product\/[^\/]+\/(\d+)/);f&&(g=f[1])}}g&&a.set(String(g),p)}),console.log(`[Bundle Recommendations] Found ${a.size} slides with IDs`);let l=0;i.forEach(p=>{let u=a.get(String(p));u&&r.contains(u)&&(r.appendChild(u),l++)}),console.log(`[Bundle Recommendations] Reordered ${l} slides to match Algolia ranking`);let c=t.querySelector("salla-slider")?.swiper;if(c){console.log("[Bundle Recommendations] Destroying Swiper instance to force rebuild...");let p={...c.params};c.destroy(!0,!0),setTimeout(()=>{window.salla?.event?.dispatch("twilight::mutation"),console.log("[Bundle Recommendations] Triggered Salla to reinitialize slider"),setTimeout(()=>{let u=r.querySelectorAll(".s-product-card-entry"),g=0,m=15;u.forEach(f=>{let v=f.closest(".swiper-slide");f.classList.contains("s-product-card-out-of-stock")||g>=m?v&&(v.style.display="none"):(v&&(v.style.display=""),g++)}),console.log("[Bundle Recommendations] Applied stock filter after Swiper rebuild")},300)},100)}else{console.warn("[Bundle Recommendations] No Swiper instance found, applying stock filter only");let p=r.querySelectorAll(".s-product-card-entry"),u=0,g=15;p.forEach(m=>{let f=m.closest(".swiper-slide");m.classList.contains("s-product-card-out-of-stock")||u>=g?f&&(f.style.display="none"):(f&&(f.style.display=""),u++)})}},200)})}reset(){this.initialized=!1,this.productId=null,this.teardownCustomSlider(),this.removeExistingRecentlyViewed()}waitForElement(t,e){let s=document.querySelector(t);if(s){e(s);return}let i=new MutationObserver(()=>{let r=document.querySelector(t);r&&(i.disconnect(),e(r))});i.observe(document.body,{childList:!0,subtree:!0})}},Q=new F,b=Q;var D=!1,E=0,j=2;function x(){if(console.log(`[PR Init] Attempt ${E+1}/${j}`),D)return;if(E++,E>j){console.warn("[PR Init] Max attempts reached");return}let n=document.querySelector('salla-products-list[source="product.index"], salla-products-list[source="categories"]');if(console.log("[PR Init] Category list found:",!!n),n){let e=n.getAttribute("source-value");if(e){console.log("[PR Init] \u2705 Creating ranking for category:",e),U("category",e),D=!0;return}}let t=document.querySelector('salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]');if(t){let e=t.getAttribute("source-value");if(e){console.log("[PR Init] \u2705 Creating ranking for tag:",e),U("tag",e),D=!0;return}}E<j&&(console.log("[PR Init] Retrying in 800ms..."),setTimeout(x,800))}function U(n,t){if(document.querySelector(`product-ranking[${n}-id="${t}"]`))return;let e=document.createElement("product-ranking");e.setAttribute(`${n}-id`,t),document.body.appendChild(e)}document.addEventListener("salla::page::changed",()=>{D=!1,E=0,document.querySelectorAll("product-ranking").forEach(n=>n.remove()),setTimeout(x,100)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",x):(x(),document.addEventListener("salla::ready",()=>{D||setTimeout(x,100)}));var Z="[YouTube Opt-In]",h=(...n)=>console.log(Z,...n),T=/\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i,X=!1;function W(){if(X||typeof document>"u")return;let n=document.createElement("style");n.id="youtube-placeholder-styles",n.textContent=`
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
  `,document.head.appendChild(n),X=!0}function k(n){if(!n)return"";let t=_(n);return t?`https://www.youtube.com/embed/${t}`:n.split("?")[0]}function _(n){if(!n)return null;let t=[/youtube\.com\/embed\/([^?&/]+)/,/youtube-nocookie\.com\/embed\/([^?&/]+)/,/youtube\.com\/v\/([^?&/]+)/,/youtube\.com\/watch\?v=([^&]+)/,/youtu\.be\/([^?&/]+)/,/youtube\.com\/shorts\/([^?&/]+)/];for(let e of t){let s=n.match(e);if(s&&s[1])return s[1]}return null}function P(n,t={}){W();let e=document.createElement("button");e.type="button",e.className="yt-placeholder",e.setAttribute("data-yt-src",n),e.setAttribute("aria-label","Play YouTube video");let s=t.videoId||_(n),i=t.thumbnailUrl,r=i||(s?`https://i.ytimg.com/vi/${s}/hqdefault.jpg`:null);if(r){let a=document.createElement("img");a.className="yt-placeholder__thumb",a.alt=t.thumbnailAlt||"Video thumbnail",a.loading="lazy",a.decoding="async",i?(a.src=r,e.dataset.thumbLoaded="true"):a.setAttribute("data-src",r),e.dataset.ytThumbSrc=r,e.appendChild(a)}let o=document.createElement("span");return o.className="yt-placeholder__icon",o.setAttribute("aria-hidden","true"),o.textContent="\u25B6",e.appendChild(o),e}var N=null;function C(n=document){if(!n)return;[...n.querySelectorAll("iframe"),...n.querySelectorAll("embed"),...n.querySelectorAll("object")].forEach(e=>{let s=e.src||e.getAttribute("src")||e.data||e.getAttribute("data");if(!s||!T.test(s))return;if("srcdoc"in e&&e.removeAttribute("srcdoc"),"src"in e){try{e.src="about:blank"}catch{}e.removeAttribute("src")}"data"in e&&e.removeAttribute("data");let i=P(k(s));e.width&&(i.style.width=e.width),e.height&&(i.style.height=e.height),e.style&&e.style.width&&(i.style.width=e.style.width),e.style&&e.style.height&&(i.style.height=e.style.height),i.addEventListener("click",M),i.setAttribute("data-click-bound","true"),R(i),e.parentNode&&e.parentNode.replaceChild(i,e)})}function G(n){let t=n.querySelector(".yt-placeholder__thumb");if(!t)return;let e=t.dataset.src;e&&(t.src=e,t.removeAttribute("data-src"),n.dataset.thumbLoaded="true")}function ee(){N||typeof IntersectionObserver>"u"||(N=new IntersectionObserver(n=>{n.forEach(t=>{t.isIntersecting&&(G(t.target),N.unobserve(t.target))})},{rootMargin:"200px 0px"}))}function R(n){let t=n.querySelector(".yt-placeholder__thumb");if(t&&n.dataset.thumbLoaded!=="true"){if(!t.dataset.src){n.dataset.thumbLoaded="true";return}if(typeof IntersectionObserver>"u"){G(n);return}ee(),N.observe(n)}}function J(n){if(!n)return;h("Sanitizing fragment",n);let t=n.querySelectorAll("iframe"),e=n.querySelectorAll("embed"),s=n.querySelectorAll("object");[...t,...e,...s].forEach(r=>{let o=r.src||r.data||r.getAttribute("src")||r.getAttribute("data");if(o&&T.test(o)){let a=_(o),l=k(o),d=r.getAttribute("data-yt-thumb")||r.dataset?.ytThumb;h("Replacing YouTube embed with placeholder",{videoUrl:l,element:r});let c=P(l,{videoId:a,thumbnailUrl:d});r.width&&(c.style.width=r.width),r.height&&(c.style.height=r.height),r.style.width&&(c.style.width=r.style.width),r.style.height&&(c.style.height=r.style.height),r.parentNode.replaceChild(c,r)}})}function te(n){if(!n||typeof n!="string")return n;h("Sanitizing HTML string");let e=new DOMParser().parseFromString(n,"text/html");return J(e.body),e.body.innerHTML}function M(n){let t=n.currentTarget,e=t.getAttribute("data-yt-src"),s=k(e);if(!s)return;h("Placeholder clicked, loading iframe",{videoUrl:s});let i=document.createElement("iframe"),r=`${s}${s.includes("?")?"&":"?"}autoplay=1&rel=0`;i.src=r,i.width=t.style.width||"100%",i.height=t.style.height||"100%",i.title="YouTube video",i.frameBorder="0",i.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",i.allowFullscreen=!0,i.style.aspectRatio="16/9",i.dataset.ytOptIn="true",t.parentNode.replaceChild(i,t),i.focus()}function A(n=document){h("Initializing YouTube opt-in on root",n===document?"document":n),C(n),n.querySelectorAll("[data-yt-template]").forEach(i=>{if(i.hasAttribute("data-yt-processed"))return;i.setAttribute("data-yt-processed","true"),h("Processing template host",i);let r=i.getAttribute("data-yt-template"),o=document.getElementById(r);if(!o)return;h("Found template for host",r);let a=o.content.cloneNode(!0);J(a),i.appendChild(a)}),n.querySelectorAll(".yt-placeholder[data-yt-src]").forEach(i=>{if(!i.querySelector(".yt-placeholder__icon")&&i.tagName==="DIV"){h("Upgrading static placeholder div to button",i);let r=i.getAttribute("data-yt-src"),o=i.getAttribute("data-yt-thumb")||i.dataset?.ytThumb,a=P(r,{thumbnailUrl:o});a.className=i.className,Array.from(i.attributes).forEach(l=>{["class","data-yt-src","data-yt-thumb"].includes(l.name)||a.setAttribute(l.name,l.value)}),o&&a.setAttribute("data-yt-thumb",o),i.parentNode.replaceChild(a,i)}}),n.querySelectorAll("button.yt-placeholder[data-yt-src]").forEach(i=>{i.hasAttribute("data-click-bound")||(i.addEventListener("click",M),i.setAttribute("data-click-bound","true"),h("Bound click handler to placeholder",i)),R(i)})}function re(){h("Setting up dynamic handlers"),window.salla&&window.salla.event&&(window.salla.event.on("salla-products-slider::products.fetched",s=>{h("Event: salla-products-slider::products.fetched",s);let i=s?.container||document;C(i),A(i)}),window.salla.event.on("product::quickview.opened",s=>{h("Event: product::quickview.opened",s),C(document),A(document)}),window.salla.event.on("product::quickview.response",s=>{h("Event: product::quickview.response",s),s&&s.response&&s.response.html&&(h("Sanitizing quickview HTML response before render"),s.response.html=te(s.response.html)),C(document),A(document)}));let n=document.getElementById("btn-show-more");n&&n.addEventListener("click",()=>{h("Read more button clicked");let s=document.getElementById("more-content");s&&(C(s),A(s))});let t=new MutationObserver(s=>{s.forEach(i=>{h("Mutation observed",i),i.addedNodes.forEach(r=>{if(r.nodeType!==1)return;r.classList&&r.classList.contains("product-description-content")&&(h("New product-description-content detected, initializing",r),A(r));let o=[];r.tagName==="IFRAME"?o.push(r):r.querySelectorAll&&o.push(...r.querySelectorAll("iframe")),o.forEach(a=>{if(a.dataset&&a.dataset.ytOptIn==="true"){h("Observed opt-in iframe, skipping neutralization",a);return}let l=a.src||a.getAttribute("src");if(l&&T.test(l)){h("Stray iframe detected, neutralizing",a),a.removeAttribute("src"),a.removeAttribute("srcdoc"),a.src="about:blank";let d=k(l),c=P(d);c.addEventListener("click",M),c.setAttribute("data-click-bound","true"),h("Replacing stray iframe with placeholder",{videoUrl:d,iframe:a}),a.parentNode.replaceChild(c,a),R(c)}})})})});document.querySelectorAll(".product-description-content").forEach(s=>{t.observe(s,{childList:!0,subtree:!0})}),t.observe(document.body,{childList:!0,subtree:!0})}function ie(){h("Scanning for existing YouTube iframes");let n=document.querySelectorAll("iframe"),t=0;n.forEach(e=>{let s=e.src||e.getAttribute("src");if(s&&T.test(s)){if(e.dataset.ytOptIn==="true"||e.hasAttribute("data-yt-processed"))return;h("Found existing YouTube iframe, replacing",{src:s,iframe:e}),e.src="about:blank";let i=k(s),r=P(i);e.width&&(r.style.width=e.width),e.height&&(r.style.height=e.height),e.style.width&&(r.style.width=e.style.width),e.style.height&&(r.style.height=e.style.height),r.addEventListener("click",M),r.setAttribute("data-click-bound","true"),e.parentNode.replaceChild(r,e),R(r),t++}}),h(`Replaced ${t} existing YouTube iframes`)}function Y(){h("Initializing module"),C(document),W(),A(),ie(),re()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Y):Y();window.darlenaYoutubeOptIn=A;var se=()=>{if(document.getElementById("product-slider-styles"))return;let n=document.createElement("style");n.id="product-slider-styles",n.textContent=`
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
  `,document.head.appendChild(n)},H=class{constructor(){this.enhancedCards=new Set,this.cardInstances=new Map,this.init()}init(){se(),window.app?.status==="ready"?(this.setupEventListeners(),this.enhanceExistingCards()):document.addEventListener("theme::ready",()=>{this.setupEventListeners(),this.enhanceExistingCards()})}setupEventListeners(){document.addEventListener("salla-products-slider::products.fetched",t=>{console.log("[Product Card Enhancer] Products slider fetched"),setTimeout(()=>this.enhanceExistingCards(),100)}),document.addEventListener("salla-products-list::products.fetched",t=>{console.log("[Product Card Enhancer] Products list fetched"),setTimeout(()=>this.enhanceExistingCards(),100)}),document.addEventListener("salla::page::changed",()=>{console.log("[Product Card Enhancer] Page changed"),setTimeout(()=>this.enhanceExistingCards(),500)}),this.setupMutationObserver()}setupMutationObserver(){new MutationObserver(e=>{let s=!1;for(let i of e){if(i.addedNodes.length>0){for(let r of i.addedNodes)if(r.nodeType===1&&(r.classList?.contains("s-product-card-entry")||r.querySelector?.(".s-product-card-entry"))){s=!0;break}}if(s)break}s&&setTimeout(()=>this.enhanceExistingCards(),50)}).observe(document.body,{childList:!0,subtree:!0})}enhanceExistingCards(){let t=document.querySelectorAll(".s-product-card-entry");console.log(`[Product Card Enhancer] Found ${t.length} product cards`),t.forEach(e=>{let s=this.extractProductId(e);s&&!this.enhancedCards.has(s)&&this.enhanceCard(e,s)})}extractProductId(t){if(t.dataset.id)return t.dataset.id;if(t.id&&!isNaN(t.id))return t.id;let e=t.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(e?.href){let i=e.href.match(/\/product\/[^\/]+\/(\d+)/);if(i)return i[1]}let s=t.getAttribute("product");if(s)try{let i=JSON.parse(s);if(i.id)return String(i.id)}catch{}return null}enhanceCard(t,e){console.log(`[Product Card Enhancer] Enhancing card for product ${e}`);let s=t.querySelector(".s-product-card-image");if(!s){console.warn(`[Product Card Enhancer] No image wrapper found for product ${e}`);return}let i=new V(t,e,s);this.cardInstances.set(e,i),this.enhancedCards.add(e),i.setupLazyInit()}},V=class{constructor(t,e,s){this.card=t,this.productId=e,this.imageWrapper=s,this.imageContainer=s.querySelector("a"),this.currentSlide=0,this.additionalImages=[],this.touchStartX=0,this.touchEndX=0,this.isSwiping=!1,this.isMouseDown=!1,this.sliderInitialized=!1,this.sliderId=`slider-${e}-${Date.now()}`,this.boundEventHandlers={}}setupLazyInit(){this.imageWrapper&&(this._observer=new IntersectionObserver(t=>{t.forEach(e=>{e.isIntersecting&&!this.sliderInitialized&&(this.sliderInitialized=!0,this.setupImageSlider(),setTimeout(()=>{this.fetchProductImages()},50),this._observer.unobserve(e.target))})},{rootMargin:"300px",threshold:.01}),this._observer.observe(this.imageWrapper))}setupImageSlider(){if(!this.imageContainer)return;let t=document.createElement("div");t.className="swipe-indicator",this.imageContainer.appendChild(t);let e=null,s=null,i=null,r=!1;this.boundEventHandlers.touchstart=l=>{e=l.touches[0].clientX,s=l.touches[0].clientY,i=Date.now(),r=!1},this.boundEventHandlers.touchmove=l=>{if(!e)return;let d=l.touches[0].clientX-e,c=l.touches[0].clientY-s;Math.abs(d)>Math.abs(c)&&Math.abs(d)>10&&(r=!0,this.isSwiping=!0,t.classList.toggle("right",d>0),t.style.opacity=Math.min(Math.abs(d)/100,.5),l.preventDefault())},this.boundEventHandlers.touchend=l=>{if(!e||!r){e=s=null,this.isSwiping=!1,t.style.opacity=0;return}if(this.isSwiping){let c=l.changedTouches[0].clientX-e,u=Date.now()-i<300?30:50;Math.abs(c)>=u&&(c>0?(this.prevSlide(),this.triggerHapticFeedback("medium")):(this.nextSlide(),this.triggerHapticFeedback("medium"))),l.preventDefault(),l.stopPropagation()}t.style.opacity=0,e=s=null,this.isSwiping=!1},this.imageContainer.addEventListener("touchstart",this.boundEventHandlers.touchstart,{passive:!0}),this.imageContainer.addEventListener("touchmove",this.boundEventHandlers.touchmove,{passive:!1}),this.imageContainer.addEventListener("touchend",this.boundEventHandlers.touchend,{passive:!1}),this.boundEventHandlers.mousedown=l=>{this.isMouseDown=!0,e=l.clientX,s=l.clientY,i=Date.now(),r=!1,l.preventDefault(),l.stopPropagation()},this.boundEventHandlers.mousemove=l=>{if(!this.isMouseDown||!e)return;let d=l.clientX-e;Math.abs(d)>10&&(r=!0,this.isSwiping=!0,t.classList.toggle("right",d>0),t.style.opacity=Math.min(Math.abs(d)/100,.5)),this.isSwiping&&(l.preventDefault(),l.stopPropagation())},this.boundEventHandlers.mouseup=l=>{if(this.isMouseDown){if(r&&this.isSwiping){let c=l.clientX-e,u=Date.now()-i<300?30:50;Math.abs(c)>=u&&(c>0?this.prevSlide():this.nextSlide()),l.preventDefault(),l.stopPropagation()}t.style.opacity=0,this.isMouseDown=!1,this.isSwiping=!1,e=s=null}},this.imageContainer.addEventListener("mousedown",this.boundEventHandlers.mousedown),this.imageContainer.addEventListener("mousemove",this.boundEventHandlers.mousemove),window.addEventListener("mouseup",this.boundEventHandlers.mouseup);let o=document.createElement("div");o.className="product-slider-dots",o.dataset.sliderId=this.sliderId,o.dataset.productId=this.productId;let a=document.createElement("span");a.className="product-slider-dot active",a.dataset.sliderId=this.sliderId,a.dataset.productId=this.productId,a.dataset.index="0",a.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),this.changeSlide(0),this.triggerHapticFeedback("light")}),o.appendChild(a);for(let l=0;l<2;l++){let d=document.createElement("span");d.className="product-slider-dot",d.dataset.sliderId=this.sliderId,d.dataset.productId=this.productId,d.dataset.index=String(l+1),d.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation(),this.changeSlide(l+1),this.triggerHapticFeedback("light")}),o.appendChild(d)}this.imageWrapper.appendChild(o)}fetchProductImages(){if(!this.productId)return;let t=`https://productstoredis-163858290861.me-central2.run.app/product-images/${this.productId}`;fetch(t,{timeout:5e3}).then(e=>e.json()).then(e=>this.processImageResponse(e)).catch(e=>{console.warn(`[Product Card Enhancer] Failed to fetch images for product ${this.productId}:`,e);let s=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);s&&(s.style.display="none")})}processImageResponse(t){if(!t?.images||!Array.isArray(t.images)){let i=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);i&&(i.style.display="none");return}let e=t.images.filter(i=>i&&i.url).sort((i,r)=>(i.sort||0)-(r.sort||0)).slice(0,2).map(i=>({url:i.url,alt:i.alt}));if(e.length===0){let i=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);i&&(i.style.display="none");return}this.additionalImages=e;let s=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);s&&(s.style.display="flex"),this.preloadAllImages()}preloadAllImages(){this.additionalImages&&this.additionalImages.length>0&&(this.addImageToSlider(this.additionalImages[0],1),this.additionalImages.length>1&&this.addImageToSlider(this.additionalImages[1],2))}addImageToSlider(t,e){if(!t?.url||!this.imageContainer||this.imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${e}"]`))return;let i=document.createElement("img");i.className="product-slider-image",i.src=t.url,i.alt=t.alt||"Product image",i.dataset.sliderId=this.sliderId,i.dataset.productId=this.productId,i.dataset.index=String(e),i.onload=()=>{let r=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${e}"]`);r&&r.classList.add("loaded")},i.onerror=()=>{i.remove();let r=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${e}"]`);r&&(r.remove(),this.checkDotsVisibility())},this.imageContainer.appendChild(i)}checkDotsVisibility(){let t=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);if(t){let e=t.querySelectorAll(".product-slider-dot");t.style.display=e.length<=1?"none":"flex"}}changeSlide(t){this.additionalImages&&t>0&&this.additionalImages[t-1]&&this.addImageToSlider(this.additionalImages[t-1],t),this.currentSlide=t;let e=this.imageContainer.querySelector('img.lazy, img[loading="lazy"], img:first-child:not(.product-slider-image)'),s=this.imageContainer.querySelectorAll(`.product-slider-image[data-slider-id="${this.sliderId}"]`);this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).forEach(o=>o.classList.remove("active"));let r=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${t}"]`);if(r&&r.classList.add("active"),t===0)e&&(e.style.visibility="visible",e.style.opacity="1",e.style.zIndex="10"),s.forEach(o=>o.classList.remove("active"));else{e&&(e.style.visibility="hidden",e.style.opacity="0",e.style.zIndex="5"),s.forEach(a=>a.classList.remove("active"));let o=this.imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${t}"]`);o?o.classList.add("active"):e&&(e.style.visibility="visible",e.style.opacity="1",e.style.zIndex="10")}}prevSlide(){let t=this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length,e=(this.currentSlide-1+t)%t;this.changeSlide(e)}nextSlide(){let t=this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length,e=(this.currentSlide+1)%t;this.changeSlide(e)}triggerHapticFeedback(t){try{if(window.navigator&&window.navigator.vibrate)switch(t){case"light":window.navigator.vibrate(10);break;case"medium":window.navigator.vibrate(25);break;case"strong":window.navigator.vibrate([10,20,30]);break}}catch{}}},ve=new H;window.productRecommendations=b;window.redisService=y;var oe=n=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n();function ne(){if(!document.body.classList.contains("index")){console.log("[Algolia Bundle] Not on homepage, skipping category products injection");return}let n=".app-inner",t="mahaba-category-products";function e(){let i=document.querySelector(n);if(i&&!i.querySelector(t))try{console.log(`[Algolia Bundle] Found ${n}, injecting ${t}...`);let r=document.createElement(t),o=document.querySelector(".store-footer");return o?i.insertBefore(r,o):i.appendChild(r),console.log("\u2705 [Algolia Bundle] Homepage category component injected successfully"),!0}catch(r){return console.error("[Algolia Bundle] Error during injection:",r),!0}return!1}if(e())return;console.log(`[Algolia Bundle] ${n} not found, waiting for async load...`),new MutationObserver((i,r)=>{i.some(a=>a.addedNodes.length>0)&&e()&&r.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}function ae(){if(document.getElementById("cart-addons-slider-styles"))return;let n=document.createElement("style");n.id="cart-addons-slider-styles",n.textContent=`
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
  `,document.head.appendChild(n)}function K(){ae();let n=()=>{let e=document.querySelector("#cart-submit");if(!e)return!1;let s=e.closest(".cart-submit-wrap")||e.parentElement,i=s?.parentElement||s;if(!i)return!1;if(i.querySelector("cart-addons-slider"))return!0;let r=document.createElement("cart-addons-slider");return r.className="cart-addons-wrapper",s&&i?i.insertBefore(r,s.nextSibling):i.appendChild(r),console.log("[Algolia Bundle] Injected cart addons slider"),!0};if(document.querySelector("cart-addons-slider")||n())return;new MutationObserver((e,s)=>{n()&&s.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}oe(()=>{ne(),document.querySelector('[id^="product-"]')&&setTimeout(()=>{b.initialize(),console.log("\u2705 [Algolia Bundle] Product recommendations initialized")},3e3),(document.querySelector('form[id^="item-"]')||document.querySelector("#cart-submit"))&&setTimeout(K,500),console.log("\u2705 [Algolia Bundle] Loaded successfully")});document.addEventListener("salla::page::changed",()=>{b.reset(),setTimeout(()=>{b.initialize()},1e3),setTimeout(K,500)});document.addEventListener("theme::ready",()=>{if(!document.querySelector('[id^="product-"]'))return;let n=b.getProductId();n&&b.productId&&n===b.productId||n&&(console.log("[Algolia Bundle] New product detected via theme::ready, re-initializing"),b.reset(),setTimeout(()=>{b.initialize()},1e3))});})();
