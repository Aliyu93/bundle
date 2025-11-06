var AlgoliaBundle=(()=>{var q=class{constructor(){this.baseUrl="https://me-central2-gtm-5v2mhn4-mwvlm.cloudfunctions.net/function-2",this.maxRetries=2,this.headers={Accept:"application/json","Cache-Control":"public, max-age=3600"},this.cache=new Map,this.fallbackEnabled=!0}async getProducts(e,t,s=0,i=12){if(!t)return null;let r=`${e}:${t}:${s}:${i}`;if(this.cache.has(r))return this.cache.get(r);let o=e==="category"?"catID":"tagID",c=e==="category"?"categoryById":"tagById",a=`${this.baseUrl}/?type=${c}&${o}=${encodeURIComponent(t)}&offset=${s}&limit=${i}`,d=null;try{let l=new AbortController,p=setTimeout(()=>l.abort(),2e3),u=await fetch(a,{method:"GET",headers:this.headers,signal:l.signal});if(clearTimeout(p),!u.ok)throw new Error(`HTTP error: ${u.status}`);if(d=await u.json(),d?.objectIDs?.length)return this.cache.set(r,d),d}catch{}if(!d?.objectIDs?.length&&this.fallbackEnabled)try{let l=await fetch(a,{method:"GET",headers:this.headers});if(l.ok&&(d=await l.json(),d?.objectIDs?.length))return this.cache.set(r,d),d}catch{}return d||{objectIDs:[],hasMore:!1}}async getRecommendations(e){if(!e)return[];let t=`recommendations:${e}`;if(this.cache.has(t))return this.cache.get(t);let s=`${this.baseUrl}/?type=recommendations&objectID=${encodeURIComponent(e)}`;try{let i=new AbortController,r=setTimeout(()=>i.abort(),3e3),o=await fetch(s,{method:"GET",headers:this.headers,signal:i.signal});if(clearTimeout(r),!o.ok)return[];let c=await o.json(),a=Array.isArray(c?.relatedProductIDs)?c.relatedProductIDs:[];return this.cache.set(t,a),a}catch{return[]}}async getFrequentlyBought(e){if(!e)return[];let t=`frequently-bought:${e}`;if(this.cache.has(t))return this.cache.get(t);let s=`${this.baseUrl}/?type=frequentlyBought&objectID=${encodeURIComponent(e)}`;try{let i=new AbortController,r=setTimeout(()=>i.abort(),3e3),o=await fetch(s,{method:"GET",headers:this.headers,signal:i.signal});if(clearTimeout(r),!o.ok)return[];let c=await o.json(),a=Array.isArray(c?.frequentlyBoughtIDs)?c.frequentlyBoughtIDs:[];return this.cache.set(t,a),a}catch{return[]}}async getCategoriesFromRedis(){let e="all-categories";if(this.cache.has(e))return this.cache.get(e);try{let t=new AbortController,s=setTimeout(()=>t.abort(),5e3),i=await fetch(`${this.baseUrl}/?type=categories`,{method:"GET",headers:this.headers,signal:t.signal});if(clearTimeout(s),!i.ok)return[];let o=(await i.json()).categories||[];return this.cache.set(e,o),o}catch{return[]}}async getGlobalProducts(e=0,t=12){let s=`global-products:${e}:${t}`;if(this.cache.has(s))return this.cache.get(s);try{let i=new AbortController,r=setTimeout(()=>i.abort(),3e3),o=`${this.baseUrl}/?type=categoryById&catID=trending-now&offset=${e}&limit=${t}`,c=await fetch(o,{method:"GET",headers:this.headers,signal:i.signal});if(clearTimeout(r),!c.ok)return{objectIDs:[],hasMore:!1};let a=await c.json(),d={objectIDs:a.objectIDs||[],hasMore:a.hasMore||!1};return this.cache.set(s,d),d}catch{return{objectIDs:[],hasMore:!1}}}async getCategoryPageById(e,t=0,s=12){return this.getProducts("category",e,t,s)}async getCategoryProducts(e,t,s){return this.getProducts("category",e,t,s)}async getTagProducts(e,t,s){return this.getProducts("tag",e,t,s)}},m=new q;var T=class extends HTMLElement{constructor(){super(),this.initialized=!1,this.productIds=[],this.structureReady=!1}connectedCallback(){this.ensureStructure(),!this.initialized&&this.getHighestValueItemFromDOM().then(e=>e?this.fetchFrequentlyBoughtProducts(e):[]).then(()=>{this.renderProductList(),setTimeout(()=>{this.initializeSlider()},1e3)}).catch(e=>{console.error("[CartAddonsSlider] Error loading products:",e)})}ensureStructure(){if(!this.structureReady){if(!this.querySelector(".cart-addons-title")){let e=document.createElement("h3");e.className="cart-addons-title",e.textContent=window.salla?.lang?.get("pages.cart.frequently_bought_together")||"Frequently bought together",this.appendChild(e)}if(!this.querySelector(".frequently-bought-container")){let e=document.createElement("div");e.className="frequently-bought-container",this.appendChild(e)}this.structureReady=!0}}async getHighestValueItemFromDOM(){try{let e=document.querySelectorAll('form[id^="item-"]');if(!e||e.length===0)return console.log("[CartAddonsSlider] No cart items found in DOM"),null;let t=null,s=0;return e.forEach(i=>{try{let r=i.getAttribute("id")||"",o=r.replace("item-",""),c=i.querySelector('a[href*="/p"]');if(!c){console.log("[CartAddonsSlider] No product link found in form",r);return}let a=c.getAttribute("href"),d=a.match(/\/p(\d+)(?:$|\/|\?)/);if(!d||!d[1]){console.log("[CartAddonsSlider] Could not extract product ID from URL",a);return}let l=d[1],p=i.querySelector(".item-total");if(p){let f=(p.textContent||p.innerText||"0").replace(/[^\d.,٠١٢٣٤٥٦٧٨٩]/g,"").replace(/٠/g,"0").replace(/١/g,"1").replace(/٢/g,"2").replace(/٣/g,"3").replace(/٤/g,"4").replace(/٥/g,"5").replace(/٦/g,"6").replace(/٧/g,"7").replace(/٨/g,"8").replace(/٩/g,"9"),g=parseFloat(f.replace(",","."))||0;console.log(`[CartAddonsSlider] Item ${o}: Product ID ${l}, Total: ${g}`),!isNaN(g)&&g>s&&(s=g,t={itemId:o,productId:l,total:g})}}catch(r){console.error("[CartAddonsSlider] Error processing item form:",r)}}),t?(console.log("[CartAddonsSlider] Highest value item:",t),t.productId):null}catch(e){return console.error("[CartAddonsSlider] Error extracting cart data from DOM:",e),null}}async fetchFrequentlyBoughtProducts(e){try{console.log("[CartAddonsSlider] Fetching frequently bought products for:",e);let t=await m.getFrequentlyBought(e);return t&&t.length>0?(console.log("[CartAddonsSlider] Found frequently bought products:",t),this.productIds=t.map(s=>String(s)).slice(0,8),this.productIds):(console.log("[CartAddonsSlider] No frequently bought products found"),this.productIds=[],[])}catch(t){return console.error("[CartAddonsSlider] Error fetching frequently bought products:",t),this.productIds=[],[]}}renderProductList(){if(!this.productIds||this.productIds.length===0){console.log("[CartAddonsSlider] No products to render, hiding component"),this.style.display="none";return}console.log("[CartAddonsSlider] Rendering product list with IDs:",this.productIds);let e=this.querySelector(".frequently-bought-container");if(!e){console.error("[CartAddonsSlider] Container not found");return}let t=document.createElement("salla-products-list");if(t.setAttribute("source","selected"),t.setAttribute("loading","lazy"),t.setAttribute("source-value",JSON.stringify(this.productIds)),t.setAttribute("class","s-products-list-vertical-cards"),e.innerHTML="",e.appendChild(t),!this.querySelector(".touch-indicator")){let s=document.createElement("div");s.classList.add("touch-indicator"),this.appendChild(s)}console.log("[CartAddonsSlider] Product list rendered")}initializeSlider(){try{let e=this.querySelector("salla-products-list");if(!e){console.log("[CartAddonsSlider] Products list not found");return}e.style.opacity="1",window.salla?.event?.dispatch&&window.salla.event.dispatch("twilight::mutation"),this.initialized=!0,console.log("[CartAddonsSlider] Slider initialized")}catch(e){console.error("[CartAddonsSlider] Failed to initialize cart addons slider:",e)}}};customElements.get("cart-addons-slider")||(customElements.define("cart-addons-slider",T),console.log("[CartAddonsSlider] Custom element defined"));var N=class extends HTMLElement{constructor(){super(),this.page=0,this.loading=!1,this.hasMore=!0,this.ids=[],this.container=null,this.originalList=null,this.usingSallaFilter=!1,this.timeout=null}async connectedCallback(){let e=this.getAttribute("category-id"),t=this.getAttribute("tag-id");if(console.log("[PR Element] Connected:",{categoryId:e,tagId:t}),!(!e&&!t))try{await this.waitForSalla(),this.setupFilterListener(),await this.initialize(e,t)}catch(s){console.error("[PR Element] Error:",s),this.restoreOriginalList()}}restoreOriginalList(){if(!this.originalList||this.usingSallaFilter)return;let e=document.querySelector(".ranked-products, salla-products-list[filter]"),t=e?.parentNode||this.originalList.parentNode;e&&e.remove(),this.container&&(this.container.remove(),this.container=null),t&&!t.querySelector("salla-products-list")&&(t.appendChild(this.originalList.cloneNode(!0)),window.salla?.event?.dispatch("twilight::mutation"))}setupFilterListener(){document.addEventListener("change",e=>{if(e.target.id!=="product-filter")return;let t=e.target.value;t==="ourSuggest"&&this.usingSallaFilter?this.applyRedisRanking():t!=="ourSuggest"&&this.applySallaFilter(t)})}async applySallaFilter(e){let t=this.getAttribute("category-id"),s=this.getAttribute("tag-id");if(!this.originalList)return;let i=document.querySelector(".ranked-products, salla-products-list[filter]"),r=i?.parentNode||this.container?.parentNode;if(!r)return;i&&i.remove(),this.container&&(this.container.remove(),this.container=null),this.cleanupScrollListener(),this.usingSallaFilter=!0;let o=this.originalList.cloneNode(!0);o.setAttribute("filter",e),r.appendChild(o),window.salla?.event?.dispatch("twilight::mutation")}async applyRedisRanking(){let e=this.getAttribute("category-id"),t=this.getAttribute("tag-id");this.usingSallaFilter=!1,await this.initialize(e,t,!0)}async initialize(e,t,s=!1){if(console.log("[PR Element] Initialize called"),this.container&&!this.usingSallaFilter&&!s)return;let i=e?'salla-products-list[source="product.index"], salla-products-list[source="categories"]':'salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]',r=document.querySelector(i);if(console.log("[PR Element] Existing list found:",!!r),!r)return;this.originalList||(this.originalList=r.cloneNode(!0));let o=document.getElementById("product-filter");if(o)o.value="ourSuggest",this.usingSallaFilter=!1;else if(o&&o.value!=="ourSuggest"&&!s){this.usingSallaFilter=!0;return}let c=e?m.getCategoryProducts(e,0,12):m.getTagProducts(t,0,12),a=r.parentNode;this.container=document.createElement("div"),this.container.className="ranked-products",a.insertBefore(this.container,r),clearTimeout(this.timeout),this.timeout=setTimeout(()=>{(!this.ids||!this.ids.length)&&this.restoreOriginalList()},2500);let d=await c;if(clearTimeout(this.timeout),console.log("[PR Element] Redis data received:",d?.objectIDs?.length,"products"),console.log("[PR Element] Redis product IDs:",d.objectIDs),!d?.objectIDs?.length){console.warn("[PR Element] No products from Redis, restoring original"),this.restoreOriginalList();return}this.ids=d.objectIDs,this.page=0,this.hasMore=!0,this.usingSallaFilter=!1;let l=document.createElement("salla-products-list");l.setAttribute("source","selected"),l.setAttribute("source-value",JSON.stringify(this.ids)),l.setAttribute("limit",this.ids.length),l.className=r.className||"w-full",this.container.appendChild(l),r.remove(),window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(this.container,this.ids),this.setupScrollListener()}setupScrollListener(){this.cleanupScrollListener(),this._boundScrollHandler=this.handleScroll.bind(this),window.addEventListener("scroll",this._boundScrollHandler)}cleanupScrollListener(){this._boundScrollHandler&&(window.removeEventListener("scroll",this._boundScrollHandler),this._boundScrollHandler=null)}handleScroll(){if(this.loading||!this.hasMore||this.usingSallaFilter)return;let e=window.scrollY+window.innerHeight,t=document.documentElement.scrollHeight*.5;e>t&&this.loadMore()}async loadMore(){if(!(this.loading||!this.hasMore)){this.loading=!0;try{let e=this.page+1,t=e*12,s=this.getAttribute("category-id"),i=this.getAttribute("tag-id"),r=s?await m.getCategoryProducts(s,t,12):await m.getTagProducts(i,t,12);if(!r?.objectIDs?.length){this.hasMore=!1;return}let o=document.createElement("salla-products-list");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(r.objectIDs)),o.setAttribute("limit",r.objectIDs.length),o.className="w-full",this.container.appendChild(o),this.page=e,this.hasMore=r.hasMore!==!1,window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(o,r.objectIDs)}catch{this.hasMore=!1}finally{this.loading=!1}}}async waitForSalla(){if(!window.salla)return new Promise(e=>{document.addEventListener("salla::ready",e,{once:!0}),setTimeout(e,3e3)})}applyOrderToList(e,t,s=30){if(!e||!t||!t.length)return;let i=0,r=setInterval(()=>{i++;let o=Array.from(e.querySelectorAll("custom-salla-product-card, .s-product-card-entry"));if(o.length>0){clearInterval(r);let c=new Map;o.forEach(d=>{let l=null;if(d.dataset.id)l=d.dataset.id;else if(d.id&&!isNaN(d.id))l=d.id;else{let p=d.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(p?.href){let u=p.href.match(/\/product\/[^\/]+\/(\d+)/);u&&(l=u[1])}}l&&c.set(String(l),d)});let a=o[0].parentNode;if(!a)return;t.forEach(d=>{let l=c.get(String(d));l&&a.contains(l)&&a.appendChild(l)}),console.log("[PR Element] Reordered",o.length,"cards to match Redis order")}else i>=s&&(clearInterval(r),console.warn("[PR Element] Cards never appeared, skipping reorder"))},100)}disconnectedCallback(){this.cleanupScrollListener(),clearTimeout(this.timeout)}};customElements.get("product-ranking")||customElements.define("product-ranking",N);var R=class extends HTMLElement{constructor(){super(),this.state={productsPerPage:30,categories:[],trendingCategory:{name:"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646",slug:"trending-now",filter:null,hasSubcats:!1,url:null}},this.categoriesLoading=!0,this.seenProductIds=new Set}async connectedCallback(){this.innerHTML=`
            <div class="category-filter">
                <div class="categories-loading">\u062C\u0627\u0631\u0650 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A...</div>
            </div>
        `;try{await this.fetchCategoriesFromCloudRun();let e=this.createTemplate();this.innerHTML=e,await this.initializeCategorySections()}catch(e){this.handleInitError(e)}}disconnectedCallback(){}async fetchCategoriesFromCloudRun(){let e={228327271:{name:"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA/c228327271"},476899183:{name:"\u062C\u0644\u0627\u0628\u064A\u0627\u062A",url:"https://darlena.com/%D8%AC%D9%84%D8%A7%D8%A8%D9%8A%D8%A7%D8%AA/c476899183"},1466412179:{name:"\u062C\u062F\u064A\u062F\u0646\u0627",url:"https://darlena.com/%D8%AC%D8%AF%D9%8A%D8%AF-%D8%AF%D8%A7%D8%B1-%D9%84%D9%8A%D9%86%D8%A7/c1466412179"},289250285:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%83%D9%84%D9%88%D8%B4/c289250285"},1891285357:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B3%D9%88%D8%AF%D8%A7%D8%A1-%D8%B3%D8%A7%D8%AF%D8%A9/c1891285357"},2132455494:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D9%84%D9%88%D9%86%D8%A9/c2132455494"},940975465:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%AC%D9%8A%D9%88%D8%A8/c940975465"},1567146102:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%B4%D8%AA/c1567146102"},832995956:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D8%B7%D8%B1%D8%B2%D8%A9/c832995956"},2031226480:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B1%D8%A3%D8%B3/c2031226480"},1122348775:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B5%D9%8A%D9%81%D9%8A%D8%A9/c1122348775"},692927841:{name:"\u0637\u0631\u062D",url:"https://darlena.com/%D8%B7%D8%B1%D8%AD/c692927841"},639447590:{name:"\u0646\u0642\u0627\u0628\u0627\u062A",url:"https://darlena.com/%D9%86%D9%82%D8%A7%D8%A8%D8%A7%D8%AA/c639447590"},114756598:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646",url:"https://darlena.com/%D8%B4%D9%8A%D9%81%D9%88%D9%86/c114756598"}},t={"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646":1,\u062C\u062F\u064A\u062F\u0646\u0627:2,"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629":3,"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A":4,"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634":5,\u062C\u0644\u0627\u0628\u064A\u0627\u062A:6,"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646":7,"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629":8,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628":9,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A":10,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629":11,"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633":12,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629":13,\u0637\u0631\u062D:14,\u0646\u0642\u0627\u0628\u0627\u062A:15};try{let s=await m.getCategoriesFromRedis();if(!Array.isArray(s))throw new Error("Categories data is not an array");let i=s.map(r=>({slug:r.name,name:r.name,filter:r.name,hasSubcats:!1,count:r.count||0,ids:r.ids||(r.id?[r.id]:[])}));i=i.filter(r=>{if(r.ids.length>0){let o=Number(r.ids[0]);return e.hasOwnProperty(o)}return!1}).map(r=>{let o=Number(r.ids[0]);return{...r,name:e[o].name,slug:e[o].name.toLowerCase().replace(/\s+/g,"-"),url:e[o].url,ids:r.ids}}),i.sort((r,o)=>{let c=t[r.name]||999,a=t[o.name]||999;return c-a}),i.unshift({...this.state.trendingCategory}),this.state.categories=i}catch(s){throw this.state.categories=[{...this.state.trendingCategory}],s}finally{this.categoriesLoading=!1}}createTemplate(){return this.categoriesLoading?`
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
        `}async initializeCategorySections(){try{let e=this.state.categories.map(r=>r.slug==="trending-now"?m.getGlobalProducts(0,this.state.productsPerPage).then(o=>({slug:r.slug,ids:o.objectIDs||[]})).catch(o=>({slug:r.slug,ids:[],error:o})):r.ids&&r.ids.length>0?this.fetchRegularCategory(r).then(o=>({slug:r.slug,ids:o||[]})).catch(o=>({slug:r.slug,ids:[],error:o})):Promise.resolve({slug:r.slug,ids:[]})),s=(await Promise.all(e)).reduce((r,o)=>(r[o.slug]=o.ids,r),{});this.seenProductIds.clear();let i={};for(let r of this.state.categories){let o=s[r.slug]||[],c=[];for(let a of o)if(!this.seenProductIds.has(a)&&(this.seenProductIds.add(a),c.push(a),c.length>=6))break;i[r.slug]=c}this.renderProductSliders(i)}catch(e){this.handleInitError(e)}}async fetchRegularCategory(e){let t=e.ids.map(s=>m.getCategoryPageById(s,0,this.state.productsPerPage).catch(i=>({objectIDs:[]})));try{return(await Promise.all(t)).flatMap(i=>i&&i.objectIDs?i.objectIDs:[])}catch{return[]}}renderProductSliders(e){this.state.categories.forEach(t=>{let s=t.slug,i=e[s]||[],r=this.querySelector(`#products-${s}`);if(r)if(r.innerHTML="",i.length>0){let o=document.createElement("salla-products-slider");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(i)),o.setAttribute("limit",String(i.length)),o.setAttribute("slider-id",`slider-${s}`),o.setAttribute("block-title"," "),o.setAttribute("arrows","true"),o.setAttribute("rtl","true"),r.appendChild(o),setTimeout(()=>{o.querySelectorAll(".s-product-card-content-sub").forEach(a=>{a.children.length>1&&(a.style.display="flex",a.style.alignItems="center",a.style.justifyContent="space-between",a.style.flexWrap="nowrap",a.style.width="100%",a.style.overflow="visible")})},500)}else r.innerHTML='<div style="text-align: center; padding: 1rem;">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0639\u0631\u0636\u0647\u0627 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0629.</div>'})}handleInitError(e){this.innerHTML=`
            <div class="category-filter">
                <div class="error-message" style="color: #e53e3e; text-align: center; padding: 2rem; margin-top: 2rem;">
                    \u0639\u0630\u0631\u0627\u064B\u060C \u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A. \u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0635\u0641\u062D\u0629.
                    ${e?"<br><small>Error details logged.</small>":""}
                </div>
            </div>
        `}};customElements.get("mahaba-category-products")||customElements.define("mahaba-category-products",R);var M=class{constructor(){this.initialized=!1,this.productId=null,this.recentlyViewedKey="recently_viewed_products",this.maxRecentProducts=15,this.recentlyViewedClass="algolia-recently-viewed"}initialize(){if(!this.isProductPage())return;let e=this.getProductId();if(!e||this.initialized&&this.productId===e)return;this.productId=e,this.initialized=!0,this.addToRecentlyViewed(this.productId);let t=()=>{this.loadRecommendations(),this.loadRecentlyViewed()};document.readyState==="complete"||document.readyState==="interactive"?t():document.addEventListener("DOMContentLoaded",t)}loadRecommendations(){let e=document.querySelector('salla-products-slider[source="related"]');e?this.replaceRelatedProducts(e):this.waitForElement('salla-products-slider[source="related"]',t=>{this.replaceRelatedProducts(t)})}loadRecentlyViewed(){let e=this.getRecentlyViewed();if(!e.length)return;let t=e.map(c=>parseInt(c,10)).filter(c=>c&&!isNaN(c)&&c!==parseInt(this.productId,10));if(!t.length)return;this.removeExistingRecentlyViewed();let s=document.createElement("div");s.className="mt-8 s-products-slider-container",s.classList.add(this.recentlyViewedClass);let i=document.createElement("h2");i.className="section-title mb-5 font-bold text-xl",i.textContent="\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0624\u062E\u0631\u0627\u064B",s.appendChild(i);let r=document.createElement("salla-products-slider");r.setAttribute("source","selected"),r.setAttribute("source-value",JSON.stringify(t)),r.setAttribute("autoplay","false"),r.setAttribute("class","product-recommendations-slider");let o=document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"]');r.setAttribute("display-style",o?.getAttribute("display-style")||"normal"),s.appendChild(r),this.insertRecentlyViewedSection(s,o),window.salla?.event?.dispatch("twilight::mutation"),this.setupStockFilter(r)}insertRecentlyViewedSection(e,t){let s=document.querySelector(".product-details, .product-entry, #product-entry");if(s&&s.parentNode)return s.parentNode.insertBefore(e,s.nextSibling),!0;if(t){let r=t.closest(".s-products-slider-container");if(r&&r.parentNode)return r.parentNode.insertBefore(e,r.nextSibling),!0;if(t.parentNode)return t.parentNode.insertBefore(e,t.nextSibling),!0}let i=document.querySelector("main, .s-product-page-content, #content, .s-product-page");return i?(i.appendChild(e),!0):(document.body.appendChild(e),!0)}addToRecentlyViewed(e){if(e)try{let t=parseInt(e,10);if(isNaN(t))return;let s=this.getRecentlyViewed();s=s.map(i=>parseInt(i,10)).filter(i=>!isNaN(i)),s=s.filter(i=>i!==t),s.unshift(t),s.length>this.maxRecentProducts&&(s=s.slice(0,this.maxRecentProducts)),sessionStorage.setItem(this.recentlyViewedKey,JSON.stringify(s))}catch{}}removeExistingRecentlyViewed(){document.querySelectorAll(`.${this.recentlyViewedClass}`).forEach(e=>e.remove())}getRecentlyViewed(){try{let e=sessionStorage.getItem(this.recentlyViewedKey);return e?JSON.parse(e):[]}catch{return[]}}isProductPage(){return!!document.querySelector('.product-form input[name="id"], [id^="product-"], .sidebar .details-slider')}getProductId(){let e=document.querySelector('.product-form input[name="id"]');if(e?.value){let o=parseInt(e.value,10);if(!isNaN(o))return o}let t=window.salla?.product?.id;if(t){let o=parseInt(t,10);if(!isNaN(o))return o}let s=document.querySelector(".product-entry, #product-entry, .product-details");if(s){let o=s.matches('[id^="product-"]')?s:s.querySelector('[id^="product-"]');if(o&&!o.closest("salla-products-slider")){let c=o.id.replace("product-",""),a=parseInt(c,10);if(!isNaN(a))return a}}let i=document.querySelector('[id^="product-"]');if(i&&!i.closest("salla-products-slider")){let o=i.id.replace("product-",""),c=parseInt(o,10);if(!isNaN(c))return c}let r=window.location.pathname.match(/\/p(\d+)/);if(r?.[1]){let o=parseInt(r[1],10);if(!isNaN(o))return o}return null}async replaceRelatedProducts(e){try{let t=this.productId,s=await m.getRecommendations(t);if(t!==this.productId){console.log("[Bundle Recommendations] Product changed during fetch, aborting");return}if(!s?.length)return;let i=s.map(o=>parseInt(o,10)).filter(o=>o&&!isNaN(o));if(!i.length)return;let r=document.createElement("salla-products-slider");if(Array.from(e.attributes).forEach(o=>{o.name!=="source-value"&&r.setAttribute(o.name,o.value)}),r.setAttribute("source","selected"),r.setAttribute("source-value",JSON.stringify(i)),r.setAttribute("class","product-recommendations-slider"),e.parentNode.replaceChild(r,e),!document.getElementById("product-recommendations-styles")){let o=document.createElement("style");o.id="product-recommendations-styles",o.textContent=`
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
                `,document.head.appendChild(o)}window.salla?.event?.dispatch("twilight::mutation"),this.setupStockFilter(r)}catch{}}setupStockFilter(e){window.salla?.event?.on("salla-products-slider::products.fetched",t=>{e.contains(t.target)&&setTimeout(()=>{let s=e.getAttribute("source-value");if(!s){console.warn("[Bundle Recommendations] No source-value found on slider");return}let i=[];try{i=JSON.parse(s)}catch(p){console.error("[Bundle Recommendations] Failed to parse source-value:",p);return}if(!i||!i.length)return;let r=e.querySelector(".swiper-wrapper");if(!r){console.warn("[Bundle Recommendations] No swiper-wrapper found");return}let o=Array.from(r.querySelectorAll(".swiper-slide")),c=new Map;o.forEach(p=>{let u=p.querySelector(".s-product-card-entry");if(!u)return;let f=null;if(u.dataset.id)f=u.dataset.id;else if(u.id&&!isNaN(u.id))f=u.id;else{let g=u.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(g?.href){let y=g.href.match(/\/p(\d+)/)||g.href.match(/\/product\/[^\/]+\/(\d+)/);y&&(f=y[1])}}f&&c.set(String(f),p)}),console.log(`[Bundle Recommendations] Found ${c.size} slides with IDs`);let a=0;i.forEach(p=>{let u=c.get(String(p));u&&r.contains(u)&&(r.appendChild(u),a++)}),console.log(`[Bundle Recommendations] Reordered ${a} slides to match Algolia ranking`);let l=e.querySelector("salla-slider")?.swiper;if(l){console.log("[Bundle Recommendations] Destroying Swiper instance to force rebuild...");let p={...l.params};l.destroy(!0,!0),setTimeout(()=>{window.salla?.event?.dispatch("twilight::mutation"),console.log("[Bundle Recommendations] Triggered Salla to reinitialize slider"),setTimeout(()=>{let u=r.querySelectorAll(".s-product-card-entry"),f=0,g=15;u.forEach(y=>{let A=y.closest(".swiper-slide");y.classList.contains("s-product-card-out-of-stock")||f>=g?A&&(A.style.display="none"):(A&&(A.style.display=""),f++)}),console.log("[Bundle Recommendations] Applied stock filter after Swiper rebuild")},300)},100)}else{console.warn("[Bundle Recommendations] No Swiper instance found, applying stock filter only");let p=r.querySelectorAll(".s-product-card-entry"),u=0,f=15;p.forEach(g=>{let y=g.closest(".swiper-slide");g.classList.contains("s-product-card-out-of-stock")||u>=f?y&&(y.style.display="none"):(y&&(y.style.display=""),u++)})}},200)})}reset(){this.initialized=!1,this.productId=null,this.removeExistingRecentlyViewed()}waitForElement(e,t){let s=document.querySelector(e);if(s){t(s);return}let i=new MutationObserver(()=>{let r=document.querySelector(e);r&&(i.disconnect(),t(r))});i.observe(document.body,{childList:!0,subtree:!0})}},Y=new M,b=Y;var I=!1,S=0,$=2;function D(){if(console.log(`[PR Init] Attempt ${S+1}/${$}`),I)return;if(S++,S>$){console.warn("[PR Init] Max attempts reached");return}let n=document.querySelector('salla-products-list[source="product.index"], salla-products-list[source="categories"]');if(console.log("[PR Init] Category list found:",!!n),n){let t=n.getAttribute("source-value");if(t){console.log("[PR Init] \u2705 Creating ranking for category:",t),O("category",t),I=!0;return}}let e=document.querySelector('salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]');if(e){let t=e.getAttribute("source-value");if(t){console.log("[PR Init] \u2705 Creating ranking for tag:",t),O("tag",t),I=!0;return}}S<$&&(console.log("[PR Init] Retrying in 800ms..."),setTimeout(D,800))}function O(n,e){if(document.querySelector(`product-ranking[${n}-id="${e}"]`))return;let t=document.createElement("product-ranking");t.setAttribute(`${n}-id`,e),document.body.appendChild(t)}document.addEventListener("salla::page::changed",()=>{I=!1,S=0,document.querySelectorAll("product-ranking").forEach(n=>n.remove()),setTimeout(D,100)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",D):(D(),document.addEventListener("salla::ready",()=>{I||setTimeout(D,100)}));var W="[YouTube Opt-In]",h=(...n)=>console.log(W,...n),L=/\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i,j=!1;function _(){if(j||typeof document>"u")return;let n=document.createElement("style");n.id="youtube-placeholder-styles",n.textContent=`
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
  `,document.head.appendChild(n),j=!0}function E(n){if(!n)return"";let e=B(n);return e?`https://www.youtube.com/embed/${e}`:n.split("?")[0]}function B(n){if(!n)return null;let e=[/youtube\.com\/embed\/([^?&/]+)/,/youtube-nocookie\.com\/embed\/([^?&/]+)/,/youtube\.com\/v\/([^?&/]+)/,/youtube\.com\/watch\?v=([^&]+)/,/youtu\.be\/([^?&/]+)/,/youtube\.com\/shorts\/([^?&/]+)/];for(let t of e){let s=n.match(t);if(s&&s[1])return s[1]}return null}function C(n,e={}){_();let t=document.createElement("button");t.type="button",t.className="yt-placeholder",t.setAttribute("data-yt-src",n),t.setAttribute("aria-label","Play YouTube video");let s=e.videoId||B(n),i=e.thumbnailUrl,r=i||(s?`https://i.ytimg.com/vi/${s}/hqdefault.jpg`:null);if(r){let c=document.createElement("img");c.className="yt-placeholder__thumb",c.alt=e.thumbnailAlt||"Video thumbnail",c.loading="lazy",c.decoding="async",i?(c.src=r,t.dataset.thumbLoaded="true"):c.setAttribute("data-src",r),t.dataset.ytThumbSrc=r,t.appendChild(c)}let o=document.createElement("span");return o.className="yt-placeholder__icon",o.setAttribute("aria-hidden","true"),o.textContent="\u25B6",t.appendChild(o),t}var x=null;function v(n=document){if(!n)return;[...n.querySelectorAll("iframe"),...n.querySelectorAll("embed"),...n.querySelectorAll("object")].forEach(t=>{let s=t.src||t.getAttribute("src")||t.data||t.getAttribute("data");if(!s||!L.test(s))return;if("srcdoc"in t&&t.removeAttribute("srcdoc"),"src"in t){try{t.src="about:blank"}catch{}t.removeAttribute("src")}"data"in t&&t.removeAttribute("data");let i=C(E(s));t.width&&(i.style.width=t.width),t.height&&(i.style.height=t.height),t.style&&t.style.width&&(i.style.width=t.style.width),t.style&&t.style.height&&(i.style.height=t.style.height),i.addEventListener("click",k),i.setAttribute("data-click-bound","true"),P(i),t.parentNode&&t.parentNode.replaceChild(i,t)})}function V(n){let e=n.querySelector(".yt-placeholder__thumb");if(!e)return;let t=e.dataset.src;t&&(e.src=t,e.removeAttribute("data-src"),n.dataset.thumbLoaded="true")}function G(){x||typeof IntersectionObserver>"u"||(x=new IntersectionObserver(n=>{n.forEach(e=>{e.isIntersecting&&(V(e.target),x.unobserve(e.target))})},{rootMargin:"200px 0px"}))}function P(n){let e=n.querySelector(".yt-placeholder__thumb");if(e&&n.dataset.thumbLoaded!=="true"){if(!e.dataset.src){n.dataset.thumbLoaded="true";return}if(typeof IntersectionObserver>"u"){V(n);return}G(),x.observe(n)}}function U(n){if(!n)return;h("Sanitizing fragment",n);let e=n.querySelectorAll("iframe"),t=n.querySelectorAll("embed"),s=n.querySelectorAll("object");[...e,...t,...s].forEach(r=>{let o=r.src||r.data||r.getAttribute("src")||r.getAttribute("data");if(o&&L.test(o)){let c=B(o),a=E(o),d=r.getAttribute("data-yt-thumb")||r.dataset?.ytThumb;h("Replacing YouTube embed with placeholder",{videoUrl:a,element:r});let l=C(a,{videoId:c,thumbnailUrl:d});r.width&&(l.style.width=r.width),r.height&&(l.style.height=r.height),r.style.width&&(l.style.width=r.style.width),r.style.height&&(l.style.height=r.style.height),r.parentNode.replaceChild(l,r)}})}function J(n){if(!n||typeof n!="string")return n;h("Sanitizing HTML string");let t=new DOMParser().parseFromString(n,"text/html");return U(t.body),t.body.innerHTML}function k(n){let e=n.currentTarget,t=e.getAttribute("data-yt-src"),s=E(t);if(!s)return;h("Placeholder clicked, loading iframe",{videoUrl:s});let i=document.createElement("iframe"),r=`${s}${s.includes("?")?"&":"?"}autoplay=1&rel=0`;i.src=r,i.width=e.style.width||"100%",i.height=e.style.height||"100%",i.title="YouTube video",i.frameBorder="0",i.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",i.allowFullscreen=!0,i.style.aspectRatio="16/9",i.dataset.ytOptIn="true",e.parentNode.replaceChild(i,e),i.focus()}function w(n=document){h("Initializing YouTube opt-in on root",n===document?"document":n),v(n),n.querySelectorAll("[data-yt-template]").forEach(i=>{if(i.hasAttribute("data-yt-processed"))return;i.setAttribute("data-yt-processed","true"),h("Processing template host",i);let r=i.getAttribute("data-yt-template"),o=document.getElementById(r);if(!o)return;h("Found template for host",r);let c=o.content.cloneNode(!0);U(c),i.appendChild(c)}),n.querySelectorAll(".yt-placeholder[data-yt-src]").forEach(i=>{if(!i.querySelector(".yt-placeholder__icon")&&i.tagName==="DIV"){h("Upgrading static placeholder div to button",i);let r=i.getAttribute("data-yt-src"),o=i.getAttribute("data-yt-thumb")||i.dataset?.ytThumb,c=C(r,{thumbnailUrl:o});c.className=i.className,Array.from(i.attributes).forEach(a=>{["class","data-yt-src","data-yt-thumb"].includes(a.name)||c.setAttribute(a.name,a.value)}),o&&c.setAttribute("data-yt-thumb",o),i.parentNode.replaceChild(c,i)}}),n.querySelectorAll("button.yt-placeholder[data-yt-src]").forEach(i=>{i.hasAttribute("data-click-bound")||(i.addEventListener("click",k),i.setAttribute("data-click-bound","true"),h("Bound click handler to placeholder",i)),P(i)})}function K(){h("Setting up dynamic handlers"),window.salla&&window.salla.event&&(window.salla.event.on("salla-products-slider::products.fetched",s=>{h("Event: salla-products-slider::products.fetched",s);let i=s?.container||document;v(i),w(i)}),window.salla.event.on("product::quickview.opened",s=>{h("Event: product::quickview.opened",s),v(document),w(document)}),window.salla.event.on("product::quickview.response",s=>{h("Event: product::quickview.response",s),s&&s.response&&s.response.html&&(h("Sanitizing quickview HTML response before render"),s.response.html=J(s.response.html)),v(document),w(document)}));let n=document.getElementById("btn-show-more");n&&n.addEventListener("click",()=>{h("Read more button clicked");let s=document.getElementById("more-content");s&&(v(s),w(s))});let e=new MutationObserver(s=>{s.forEach(i=>{h("Mutation observed",i),i.addedNodes.forEach(r=>{if(r.nodeType!==1)return;r.classList&&r.classList.contains("product-description-content")&&(h("New product-description-content detected, initializing",r),w(r));let o=[];r.tagName==="IFRAME"?o.push(r):r.querySelectorAll&&o.push(...r.querySelectorAll("iframe")),o.forEach(c=>{if(c.dataset&&c.dataset.ytOptIn==="true"){h("Observed opt-in iframe, skipping neutralization",c);return}let a=c.src||c.getAttribute("src");if(a&&L.test(a)){h("Stray iframe detected, neutralizing",c),c.removeAttribute("src"),c.removeAttribute("srcdoc"),c.src="about:blank";let d=E(a),l=C(d);l.addEventListener("click",k),l.setAttribute("data-click-bound","true"),h("Replacing stray iframe with placeholder",{videoUrl:d,iframe:c}),c.parentNode.replaceChild(l,c),P(l)}})})})});document.querySelectorAll(".product-description-content").forEach(s=>{e.observe(s,{childList:!0,subtree:!0})}),e.observe(document.body,{childList:!0,subtree:!0})}function Q(){h("Scanning for existing YouTube iframes");let n=document.querySelectorAll("iframe"),e=0;n.forEach(t=>{let s=t.src||t.getAttribute("src");if(s&&L.test(s)){if(t.dataset.ytOptIn==="true"||t.hasAttribute("data-yt-processed"))return;h("Found existing YouTube iframe, replacing",{src:s,iframe:t}),t.src="about:blank";let i=E(s),r=C(i);t.width&&(r.style.width=t.width),t.height&&(r.style.height=t.height),t.style.width&&(r.style.width=t.style.width),t.style.height&&(r.style.height=t.style.height),r.addEventListener("click",k),r.setAttribute("data-click-bound","true"),t.parentNode.replaceChild(r,t),P(r),e++}}),h(`Replaced ${e} existing YouTube iframes`)}function H(){h("Initializing module"),v(document),_(),w(),Q(),K()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",H):H();window.darlenaYoutubeOptIn=w;var Z=()=>{if(document.getElementById("product-slider-styles"))return;let n=document.createElement("style");n.id="product-slider-styles",n.textContent=`
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
  `,document.head.appendChild(n)},z=class{constructor(){this.enhancedCards=new Set,this.cardInstances=new Map,this.init()}init(){Z(),window.app?.status==="ready"?(this.setupEventListeners(),this.enhanceExistingCards()):document.addEventListener("theme::ready",()=>{this.setupEventListeners(),this.enhanceExistingCards()})}setupEventListeners(){document.addEventListener("salla-products-slider::products.fetched",e=>{console.log("[Product Card Enhancer] Products slider fetched"),setTimeout(()=>this.enhanceExistingCards(),100)}),document.addEventListener("salla-products-list::products.fetched",e=>{console.log("[Product Card Enhancer] Products list fetched"),setTimeout(()=>this.enhanceExistingCards(),100)}),document.addEventListener("salla::page::changed",()=>{console.log("[Product Card Enhancer] Page changed"),setTimeout(()=>this.enhanceExistingCards(),500)}),this.setupMutationObserver()}setupMutationObserver(){new MutationObserver(t=>{let s=!1;for(let i of t){if(i.addedNodes.length>0){for(let r of i.addedNodes)if(r.nodeType===1&&(r.classList?.contains("s-product-card-entry")||r.querySelector?.(".s-product-card-entry"))){s=!0;break}}if(s)break}s&&setTimeout(()=>this.enhanceExistingCards(),50)}).observe(document.body,{childList:!0,subtree:!0})}enhanceExistingCards(){let e=document.querySelectorAll(".s-product-card-entry");console.log(`[Product Card Enhancer] Found ${e.length} product cards`),e.forEach(t=>{let s=this.extractProductId(t);s&&!this.enhancedCards.has(s)&&this.enhanceCard(t,s)})}extractProductId(e){if(e.dataset.id)return e.dataset.id;if(e.id&&!isNaN(e.id))return e.id;let t=e.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(t?.href){let i=t.href.match(/\/product\/[^\/]+\/(\d+)/);if(i)return i[1]}let s=e.getAttribute("product");if(s)try{let i=JSON.parse(s);if(i.id)return String(i.id)}catch{}return null}enhanceCard(e,t){console.log(`[Product Card Enhancer] Enhancing card for product ${t}`);let s=e.querySelector(".s-product-card-image");if(!s){console.warn(`[Product Card Enhancer] No image wrapper found for product ${t}`);return}let i=new F(e,t,s);this.cardInstances.set(t,i),this.enhancedCards.add(t),i.setupLazyInit()}},F=class{constructor(e,t,s){this.card=e,this.productId=t,this.imageWrapper=s,this.imageContainer=s.querySelector("a"),this.currentSlide=0,this.additionalImages=[],this.touchStartX=0,this.touchEndX=0,this.isSwiping=!1,this.isMouseDown=!1,this.sliderInitialized=!1,this.sliderId=`slider-${t}-${Date.now()}`,this.boundEventHandlers={}}setupLazyInit(){this.imageWrapper&&(this._observer=new IntersectionObserver(e=>{e.forEach(t=>{t.isIntersecting&&!this.sliderInitialized&&(this.sliderInitialized=!0,this.setupImageSlider(),setTimeout(()=>{this.fetchProductImages()},50),this._observer.unobserve(t.target))})},{rootMargin:"300px",threshold:.01}),this._observer.observe(this.imageWrapper))}setupImageSlider(){if(!this.imageContainer)return;let e=document.createElement("div");e.className="swipe-indicator",this.imageContainer.appendChild(e);let t=null,s=null,i=null,r=!1;this.boundEventHandlers.touchstart=a=>{t=a.touches[0].clientX,s=a.touches[0].clientY,i=Date.now(),r=!1},this.boundEventHandlers.touchmove=a=>{if(!t)return;let d=a.touches[0].clientX-t,l=a.touches[0].clientY-s;Math.abs(d)>Math.abs(l)&&Math.abs(d)>10&&(r=!0,this.isSwiping=!0,e.classList.toggle("right",d>0),e.style.opacity=Math.min(Math.abs(d)/100,.5),a.preventDefault())},this.boundEventHandlers.touchend=a=>{if(!t||!r){t=s=null,this.isSwiping=!1,e.style.opacity=0;return}if(this.isSwiping){let l=a.changedTouches[0].clientX-t,u=Date.now()-i<300?30:50;Math.abs(l)>=u&&(l>0?(this.prevSlide(),this.triggerHapticFeedback("medium")):(this.nextSlide(),this.triggerHapticFeedback("medium"))),a.preventDefault(),a.stopPropagation()}e.style.opacity=0,t=s=null,this.isSwiping=!1},this.imageContainer.addEventListener("touchstart",this.boundEventHandlers.touchstart,{passive:!0}),this.imageContainer.addEventListener("touchmove",this.boundEventHandlers.touchmove,{passive:!1}),this.imageContainer.addEventListener("touchend",this.boundEventHandlers.touchend,{passive:!1}),this.boundEventHandlers.mousedown=a=>{this.isMouseDown=!0,t=a.clientX,s=a.clientY,i=Date.now(),r=!1,a.preventDefault(),a.stopPropagation()},this.boundEventHandlers.mousemove=a=>{if(!this.isMouseDown||!t)return;let d=a.clientX-t;Math.abs(d)>10&&(r=!0,this.isSwiping=!0,e.classList.toggle("right",d>0),e.style.opacity=Math.min(Math.abs(d)/100,.5)),this.isSwiping&&(a.preventDefault(),a.stopPropagation())},this.boundEventHandlers.mouseup=a=>{if(this.isMouseDown){if(r&&this.isSwiping){let l=a.clientX-t,u=Date.now()-i<300?30:50;Math.abs(l)>=u&&(l>0?this.prevSlide():this.nextSlide()),a.preventDefault(),a.stopPropagation()}e.style.opacity=0,this.isMouseDown=!1,this.isSwiping=!1,t=s=null}},this.imageContainer.addEventListener("mousedown",this.boundEventHandlers.mousedown),this.imageContainer.addEventListener("mousemove",this.boundEventHandlers.mousemove),window.addEventListener("mouseup",this.boundEventHandlers.mouseup);let o=document.createElement("div");o.className="product-slider-dots",o.dataset.sliderId=this.sliderId,o.dataset.productId=this.productId;let c=document.createElement("span");c.className="product-slider-dot active",c.dataset.sliderId=this.sliderId,c.dataset.productId=this.productId,c.dataset.index="0",c.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),this.changeSlide(0),this.triggerHapticFeedback("light")}),o.appendChild(c);for(let a=0;a<2;a++){let d=document.createElement("span");d.className="product-slider-dot",d.dataset.sliderId=this.sliderId,d.dataset.productId=this.productId,d.dataset.index=String(a+1),d.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),this.changeSlide(a+1),this.triggerHapticFeedback("light")}),o.appendChild(d)}this.imageWrapper.appendChild(o)}fetchProductImages(){if(!this.productId)return;let e=`https://productstoredis-163858290861.me-central2.run.app/product-images/${this.productId}`;fetch(e,{timeout:5e3}).then(t=>t.json()).then(t=>this.processImageResponse(t)).catch(t=>{console.warn(`[Product Card Enhancer] Failed to fetch images for product ${this.productId}:`,t);let s=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);s&&(s.style.display="none")})}processImageResponse(e){if(!e?.images||!Array.isArray(e.images)){let i=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);i&&(i.style.display="none");return}let t=e.images.filter(i=>i&&i.url).sort((i,r)=>(i.sort||0)-(r.sort||0)).slice(0,2).map(i=>({url:i.url,alt:i.alt}));if(t.length===0){let i=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);i&&(i.style.display="none");return}this.additionalImages=t;let s=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);s&&(s.style.display="flex"),this.preloadAllImages()}preloadAllImages(){this.additionalImages&&this.additionalImages.length>0&&(this.addImageToSlider(this.additionalImages[0],1),this.additionalImages.length>1&&this.addImageToSlider(this.additionalImages[1],2))}addImageToSlider(e,t){if(!e?.url||!this.imageContainer||this.imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${t}"]`))return;let i=document.createElement("img");i.className="product-slider-image",i.src=e.url,i.alt=e.alt||"Product image",i.dataset.sliderId=this.sliderId,i.dataset.productId=this.productId,i.dataset.index=String(t),i.onload=()=>{let r=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${t}"]`);r&&r.classList.add("loaded")},i.onerror=()=>{i.remove();let r=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${t}"]`);r&&(r.remove(),this.checkDotsVisibility())},this.imageContainer.appendChild(i)}checkDotsVisibility(){let e=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);if(e){let t=e.querySelectorAll(".product-slider-dot");e.style.display=t.length<=1?"none":"flex"}}changeSlide(e){this.additionalImages&&e>0&&this.additionalImages[e-1]&&this.addImageToSlider(this.additionalImages[e-1],e),this.currentSlide=e;let t=this.imageContainer.querySelector('img.lazy, img[loading="lazy"], img:first-child:not(.product-slider-image)'),s=this.imageContainer.querySelectorAll(`.product-slider-image[data-slider-id="${this.sliderId}"]`);this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).forEach(o=>o.classList.remove("active"));let r=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${e}"]`);if(r&&r.classList.add("active"),e===0)t&&(t.style.visibility="visible",t.style.opacity="1",t.style.zIndex="10"),s.forEach(o=>o.classList.remove("active"));else{t&&(t.style.visibility="hidden",t.style.opacity="0",t.style.zIndex="5"),s.forEach(c=>c.classList.remove("active"));let o=this.imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${e}"]`);o?o.classList.add("active"):t&&(t.style.visibility="visible",t.style.opacity="1",t.style.zIndex="10")}}prevSlide(){let e=this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length,t=(this.currentSlide-1+e)%e;this.changeSlide(t)}nextSlide(){let e=this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length,t=(this.currentSlide+1)%e;this.changeSlide(t)}triggerHapticFeedback(e){try{if(window.navigator&&window.navigator.vibrate)switch(e){case"light":window.navigator.vibrate(10);break;case"medium":window.navigator.vibrate(25);break;case"strong":window.navigator.vibrate([10,20,30]);break}}catch{}}},ft=new z;window.productRecommendations=b;window.redisService=m;var tt=n=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n();function et(){if(!document.body.classList.contains("index")){console.log("[Algolia Bundle] Not on homepage, skipping category products injection");return}let n=".app-inner",e="mahaba-category-products";function t(){let i=document.querySelector(n);if(i&&!i.querySelector(e))try{console.log(`[Algolia Bundle] Found ${n}, injecting ${e}...`);let r=document.createElement(e),o=document.querySelector(".store-footer");return o?i.insertBefore(r,o):i.appendChild(r),console.log("\u2705 [Algolia Bundle] Homepage category component injected successfully"),!0}catch(r){return console.error("[Algolia Bundle] Error during injection:",r),!0}return!1}if(t())return;console.log(`[Algolia Bundle] ${n} not found, waiting for async load...`),new MutationObserver((i,r)=>{i.some(c=>c.addedNodes.length>0)&&t()&&r.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}function rt(){if(document.getElementById("cart-addons-slider-styles"))return;let n=document.createElement("style");n.id="cart-addons-slider-styles",n.textContent=`
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
  `,document.head.appendChild(n)}function X(){rt();let n=()=>{let t=document.querySelector("#cart-submit");if(!t)return!1;let s=t.closest(".cart-submit-wrap")||t.parentElement,i=s?.parentElement||s;if(!i)return!1;if(i.querySelector("cart-addons-slider"))return!0;let r=document.createElement("cart-addons-slider");return r.className="cart-addons-wrapper",s&&i?i.insertBefore(r,s.nextSibling):i.appendChild(r),console.log("[Algolia Bundle] Injected cart addons slider"),!0};if(document.querySelector("cart-addons-slider")||n())return;new MutationObserver((t,s)=>{n()&&s.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}tt(()=>{et(),document.querySelector('[id^="product-"]')&&setTimeout(()=>{b.initialize(),console.log("\u2705 [Algolia Bundle] Product recommendations initialized")},3e3),(document.querySelector('form[id^="item-"]')||document.querySelector("#cart-submit"))&&setTimeout(X,500),console.log("\u2705 [Algolia Bundle] Loaded successfully")});document.addEventListener("salla::page::changed",()=>{b.reset(),setTimeout(()=>{b.initialize()},1e3),setTimeout(X,500)});document.addEventListener("theme::ready",()=>{if(!document.querySelector('[id^="product-"]'))return;let n=b.getProductId();n&&b.productId&&n===b.productId||n&&(console.log("[Algolia Bundle] New product detected via theme::ready, re-initializing"),b.reset(),setTimeout(()=>{b.initialize()},1e3))});})();
