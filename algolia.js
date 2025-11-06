var AlgoliaBundle=(()=>{var L=class{constructor(){this.baseUrl="https://me-central2-gtm-5v2mhn4-mwvlm.cloudfunctions.net/function-2",this.maxRetries=2,this.headers={Accept:"application/json","Cache-Control":"public, max-age=3600"},this.cache=new Map,this.fallbackEnabled=!0}async getProducts(t,e,s=0,r=12){if(!e)return null;let i=`${t}:${e}:${s}:${r}`;if(this.cache.has(i))return this.cache.get(i);let o=t==="category"?"catID":"tagID",c=t==="category"?"categoryById":"tagById",n=`${this.baseUrl}/?type=${c}&${o}=${encodeURIComponent(e)}&offset=${s}&limit=${r}`,d=null;try{let l=new AbortController,p=setTimeout(()=>l.abort(),2e3),m=await fetch(n,{method:"GET",headers:this.headers,signal:l.signal});if(clearTimeout(p),!m.ok)throw new Error(`HTTP error: ${m.status}`);if(d=await m.json(),d?.objectIDs?.length)return this.cache.set(i,d),d}catch{}if(!d?.objectIDs?.length&&this.fallbackEnabled)try{let l=await fetch(n,{method:"GET",headers:this.headers});if(l.ok&&(d=await l.json(),d?.objectIDs?.length))return this.cache.set(i,d),d}catch{}return d||{objectIDs:[],hasMore:!1}}async getRecommendations(t){if(!t)return[];let e=`recommendations:${t}`;if(this.cache.has(e))return this.cache.get(e);let s=`${this.baseUrl}/?type=recommendations&objectID=${encodeURIComponent(t)}`;try{let r=new AbortController,i=setTimeout(()=>r.abort(),3e3),o=await fetch(s,{method:"GET",headers:this.headers,signal:r.signal});if(clearTimeout(i),!o.ok)return[];let c=await o.json(),n=Array.isArray(c?.relatedProductIDs)?c.relatedProductIDs:[];return this.cache.set(e,n),n}catch{return[]}}async getFrequentlyBought(t){if(!t)return[];let e=`frequently-bought:${t}`;if(this.cache.has(e))return this.cache.get(e);let s=`${this.baseUrl}/?type=frequentlyBought&objectID=${encodeURIComponent(t)}`;try{let r=new AbortController,i=setTimeout(()=>r.abort(),3e3),o=await fetch(s,{method:"GET",headers:this.headers,signal:r.signal});if(clearTimeout(i),!o.ok)return[];let c=await o.json(),n=Array.isArray(c?.frequentlyBoughtIDs)?c.frequentlyBoughtIDs:[];return this.cache.set(e,n),n}catch{return[]}}async getCategoriesFromRedis(){let t="all-categories";if(this.cache.has(t))return this.cache.get(t);try{let e=new AbortController,s=setTimeout(()=>e.abort(),5e3),r=await fetch(`${this.baseUrl}/?type=categories`,{method:"GET",headers:this.headers,signal:e.signal});if(clearTimeout(s),!r.ok)return[];let o=(await r.json()).categories||[];return this.cache.set(t,o),o}catch{return[]}}async getGlobalProducts(t=0,e=12){let s=`global-products:${t}:${e}`;if(this.cache.has(s))return this.cache.get(s);try{let r=new AbortController,i=setTimeout(()=>r.abort(),3e3),o=`${this.baseUrl}/?type=categoryById&catID=trending-now&offset=${t}&limit=${e}`,c=await fetch(o,{method:"GET",headers:this.headers,signal:r.signal});if(clearTimeout(i),!c.ok)return{objectIDs:[],hasMore:!1};let n=await c.json(),d={objectIDs:n.objectIDs||[],hasMore:n.hasMore||!1};return this.cache.set(s,d),d}catch{return{objectIDs:[],hasMore:!1}}}async getCategoryPageById(t,e=0,s=12){return this.getProducts("category",t,e,s)}async getCategoryProducts(t,e,s){return this.getProducts("category",t,e,s)}async getTagProducts(t,e,s){return this.getProducts("tag",t,e,s)}},h=new L;var P=class extends HTMLElement{constructor(){super(),this.initialized=!1,this.productIds=[],this.structureReady=!1}connectedCallback(){this.ensureStructure(),!this.initialized&&this.getHighestValueItemFromDOM().then(t=>t?this.fetchFrequentlyBoughtProducts(t):[]).then(()=>{this.renderProductList(),setTimeout(()=>{this.initializeSlider()},1e3)}).catch(t=>{console.error("[CartAddonsSlider] Error loading products:",t)})}ensureStructure(){if(!this.structureReady){if(!this.querySelector(".cart-addons-title")){let t=document.createElement("h3");t.className="cart-addons-title",t.textContent=window.salla?.lang?.get("pages.cart.frequently_bought_together")||"Frequently bought together",this.appendChild(t)}if(!this.querySelector(".frequently-bought-container")){let t=document.createElement("div");t.className="frequently-bought-container",this.appendChild(t)}this.structureReady=!0}}async getHighestValueItemFromDOM(){try{let t=document.querySelectorAll('form[id^="item-"]');if(!t||t.length===0)return console.log("[CartAddonsSlider] No cart items found in DOM"),null;let e=null,s=0;return t.forEach(r=>{try{let i=r.getAttribute("id")||"",o=i.replace("item-",""),c=r.querySelector('a[href*="/p"]');if(!c){console.log("[CartAddonsSlider] No product link found in form",i);return}let n=c.getAttribute("href"),d=n.match(/\/p(\d+)(?:$|\/|\?)/);if(!d||!d[1]){console.log("[CartAddonsSlider] Could not extract product ID from URL",n);return}let l=d[1],p=r.querySelector(".item-total");if(p){let V=(p.textContent||p.innerText||"0").replace(/[^\d.,٠١٢٣٤٥٦٧٨٩]/g,"").replace(/٠/g,"0").replace(/١/g,"1").replace(/٢/g,"2").replace(/٣/g,"3").replace(/٤/g,"4").replace(/٥/g,"5").replace(/٦/g,"6").replace(/٧/g,"7").replace(/٨/g,"8").replace(/٩/g,"9"),b=parseFloat(V.replace(",","."))||0;console.log(`[CartAddonsSlider] Item ${o}: Product ID ${l}, Total: ${b}`),!isNaN(b)&&b>s&&(s=b,e={itemId:o,productId:l,total:b})}}catch(i){console.error("[CartAddonsSlider] Error processing item form:",i)}}),e?(console.log("[CartAddonsSlider] Highest value item:",e),e.productId):null}catch(t){return console.error("[CartAddonsSlider] Error extracting cart data from DOM:",t),null}}async fetchFrequentlyBoughtProducts(t){try{console.log("[CartAddonsSlider] Fetching frequently bought products for:",t);let e=await h.getFrequentlyBought(t);return e&&e.length>0?(console.log("[CartAddonsSlider] Found frequently bought products:",e),this.productIds=e.map(s=>String(s)).slice(0,8),this.productIds):(console.log("[CartAddonsSlider] No frequently bought products found"),this.productIds=[],[])}catch(e){return console.error("[CartAddonsSlider] Error fetching frequently bought products:",e),this.productIds=[],[]}}renderProductList(){if(!this.productIds||this.productIds.length===0){console.log("[CartAddonsSlider] No products to render, hiding component"),this.style.display="none";return}console.log("[CartAddonsSlider] Rendering product list with IDs:",this.productIds);let t=this.querySelector(".frequently-bought-container");if(!t){console.error("[CartAddonsSlider] Container not found");return}let e=document.createElement("salla-products-list");if(e.setAttribute("source","selected"),e.setAttribute("loading","lazy"),e.setAttribute("source-value",JSON.stringify(this.productIds)),e.setAttribute("class","s-products-list-vertical-cards"),t.innerHTML="",t.appendChild(e),!this.querySelector(".touch-indicator")){let s=document.createElement("div");s.classList.add("touch-indicator"),this.appendChild(s)}console.log("[CartAddonsSlider] Product list rendered")}initializeSlider(){try{let t=this.querySelector("salla-products-list");if(!t){console.log("[CartAddonsSlider] Products list not found");return}t.style.opacity="1",window.salla?.event?.dispatch&&window.salla.event.dispatch("twilight::mutation"),this.initialized=!0,console.log("[CartAddonsSlider] Slider initialized")}catch(t){console.error("[CartAddonsSlider] Failed to initialize cart addons slider:",t)}}};customElements.get("cart-addons-slider")||(customElements.define("cart-addons-slider",P),console.log("[CartAddonsSlider] Custom element defined"));var T=class extends HTMLElement{constructor(){super(),this.page=0,this.loading=!1,this.hasMore=!0,this.ids=[],this.container=null,this.originalList=null,this.usingSallaFilter=!1,this.timeout=null}async connectedCallback(){let t=this.getAttribute("category-id"),e=this.getAttribute("tag-id");if(console.log("[PR Element] Connected:",{categoryId:t,tagId:e}),!(!t&&!e))try{await this.waitForSalla(),this.setupFilterListener(),await this.initialize(t,e)}catch(s){console.error("[PR Element] Error:",s),this.restoreOriginalList()}}restoreOriginalList(){if(!this.originalList||this.usingSallaFilter)return;let t=document.querySelector(".ranked-products, salla-products-list[filter]"),e=t?.parentNode||this.originalList.parentNode;t&&t.remove(),this.container&&(this.container.remove(),this.container=null),e&&!e.querySelector("salla-products-list")&&(e.appendChild(this.originalList.cloneNode(!0)),window.salla?.event?.dispatch("twilight::mutation"))}setupFilterListener(){document.addEventListener("change",t=>{if(t.target.id!=="product-filter")return;let e=t.target.value;e==="ourSuggest"&&this.usingSallaFilter?this.applyRedisRanking():e!=="ourSuggest"&&this.applySallaFilter(e)})}async applySallaFilter(t){let e=this.getAttribute("category-id"),s=this.getAttribute("tag-id");if(!this.originalList)return;let r=document.querySelector(".ranked-products, salla-products-list[filter]"),i=r?.parentNode||this.container?.parentNode;if(!i)return;r&&r.remove(),this.container&&(this.container.remove(),this.container=null),this.cleanupScrollListener(),this.usingSallaFilter=!0;let o=this.originalList.cloneNode(!0);o.setAttribute("filter",t),i.appendChild(o),window.salla?.event?.dispatch("twilight::mutation")}async applyRedisRanking(){let t=this.getAttribute("category-id"),e=this.getAttribute("tag-id");this.usingSallaFilter=!1,await this.initialize(t,e,!0)}async initialize(t,e,s=!1){if(console.log("[PR Element] Initialize called"),this.container&&!this.usingSallaFilter&&!s)return;let r=t?'salla-products-list[source="product.index"], salla-products-list[source="categories"]':'salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]',i=document.querySelector(r);if(console.log("[PR Element] Existing list found:",!!i),!i)return;this.originalList||(this.originalList=i.cloneNode(!0));let o=document.getElementById("product-filter");if(o)o.value="ourSuggest",this.usingSallaFilter=!1;else if(o&&o.value!=="ourSuggest"&&!s){this.usingSallaFilter=!0;return}let c=t?h.getCategoryProducts(t,0,12):h.getTagProducts(e,0,12),n=i.parentNode;this.container=document.createElement("div"),this.container.className="ranked-products",n.insertBefore(this.container,i),clearTimeout(this.timeout),this.timeout=setTimeout(()=>{(!this.ids||!this.ids.length)&&this.restoreOriginalList()},2500);let d=await c;if(clearTimeout(this.timeout),console.log("[PR Element] Redis data received:",d?.objectIDs?.length,"products"),console.log("[PR Element] Redis product IDs:",d.objectIDs),!d?.objectIDs?.length){console.warn("[PR Element] No products from Redis, restoring original"),this.restoreOriginalList();return}this.ids=d.objectIDs,this.page=0,this.hasMore=!0,this.usingSallaFilter=!1;let l=document.createElement("salla-products-list");l.setAttribute("source","selected"),l.setAttribute("source-value",JSON.stringify(this.ids)),l.setAttribute("limit",this.ids.length),l.className=i.className||"w-full",this.container.appendChild(l),i.remove(),window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(this.container,this.ids),this.setupScrollListener()}setupScrollListener(){this.cleanupScrollListener(),this._boundScrollHandler=this.handleScroll.bind(this),window.addEventListener("scroll",this._boundScrollHandler)}cleanupScrollListener(){this._boundScrollHandler&&(window.removeEventListener("scroll",this._boundScrollHandler),this._boundScrollHandler=null)}handleScroll(){if(this.loading||!this.hasMore||this.usingSallaFilter)return;let t=window.scrollY+window.innerHeight,e=document.documentElement.scrollHeight*.5;t>e&&this.loadMore()}async loadMore(){if(!(this.loading||!this.hasMore)){this.loading=!0;try{let t=this.page+1,e=t*12,s=this.getAttribute("category-id"),r=this.getAttribute("tag-id"),i=s?await h.getCategoryProducts(s,e,12):await h.getTagProducts(r,e,12);if(!i?.objectIDs?.length){this.hasMore=!1;return}let o=document.createElement("salla-products-list");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(i.objectIDs)),o.setAttribute("limit",i.objectIDs.length),o.className="w-full",this.container.appendChild(o),this.page=t,this.hasMore=i.hasMore!==!1,window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(o,i.objectIDs)}catch{this.hasMore=!1}finally{this.loading=!1}}}async waitForSalla(){if(!window.salla)return new Promise(t=>{document.addEventListener("salla::ready",t,{once:!0}),setTimeout(t,3e3)})}applyOrderToList(t,e,s=30){if(!t||!e||!e.length)return;let r=0,i=setInterval(()=>{r++;let o=Array.from(t.querySelectorAll("custom-salla-product-card, .s-product-card-entry"));if(o.length>0){clearInterval(i);let c=new Map;o.forEach(d=>{let l=null;if(d.dataset.id)l=d.dataset.id;else if(d.id&&!isNaN(d.id))l=d.id;else{let p=d.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(p?.href){let m=p.href.match(/\/product\/[^\/]+\/(\d+)/);m&&(l=m[1])}}l&&c.set(String(l),d)});let n=o[0].parentNode;if(!n)return;e.forEach(d=>{let l=c.get(String(d));l&&n.contains(l)&&n.appendChild(l)}),console.log("[PR Element] Reordered",o.length,"cards to match Redis order")}else r>=s&&(clearInterval(i),console.warn("[PR Element] Cards never appeared, skipping reorder"))},100)}disconnectedCallback(){this.cleanupScrollListener(),clearTimeout(this.timeout)}};customElements.get("product-ranking")||customElements.define("product-ranking",T);var q=class extends HTMLElement{constructor(){super(),this.state={productsPerPage:30,categories:[],trendingCategory:{name:"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646",slug:"trending-now",filter:null,hasSubcats:!1,url:null}},this.categoriesLoading=!0,this.seenProductIds=new Set}async connectedCallback(){this.innerHTML=`
            <div class="category-filter">
                <div class="categories-loading">\u062C\u0627\u0631\u0650 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A...</div>
            </div>
        `;try{await this.fetchCategoriesFromCloudRun();let t=this.createTemplate();this.innerHTML=t,await this.initializeCategorySections()}catch(t){this.handleInitError(t)}}disconnectedCallback(){}async fetchCategoriesFromCloudRun(){let t={228327271:{name:"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA/c228327271"},476899183:{name:"\u062C\u0644\u0627\u0628\u064A\u0627\u062A",url:"https://darlena.com/%D8%AC%D9%84%D8%A7%D8%A8%D9%8A%D8%A7%D8%AA/c476899183"},1466412179:{name:"\u062C\u062F\u064A\u062F\u0646\u0627",url:"https://darlena.com/%D8%AC%D8%AF%D9%8A%D8%AF-%D8%AF%D8%A7%D8%B1-%D9%84%D9%8A%D9%86%D8%A7/c1466412179"},289250285:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%83%D9%84%D9%88%D8%B4/c289250285"},1891285357:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B3%D9%88%D8%AF%D8%A7%D8%A1-%D8%B3%D8%A7%D8%AF%D8%A9/c1891285357"},2132455494:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D9%84%D9%88%D9%86%D8%A9/c2132455494"},940975465:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%AC%D9%8A%D9%88%D8%A8/c940975465"},1567146102:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%B4%D8%AA/c1567146102"},832995956:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D8%B7%D8%B1%D8%B2%D8%A9/c832995956"},2031226480:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B1%D8%A3%D8%B3/c2031226480"},1122348775:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B5%D9%8A%D9%81%D9%8A%D8%A9/c1122348775"},692927841:{name:"\u0637\u0631\u062D",url:"https://darlena.com/%D8%B7%D8%B1%D8%AD/c692927841"},639447590:{name:"\u0646\u0642\u0627\u0628\u0627\u062A",url:"https://darlena.com/%D9%86%D9%82%D8%A7%D8%A8%D8%A7%D8%AA/c639447590"},114756598:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646",url:"https://darlena.com/%D8%B4%D9%8A%D9%81%D9%88%D9%86/c114756598"}},e={"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646":1,\u062C\u062F\u064A\u062F\u0646\u0627:2,"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629":3,"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A":4,"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634":5,\u062C\u0644\u0627\u0628\u064A\u0627\u062A:6,"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646":7,"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629":8,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628":9,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A":10,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629":11,"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633":12,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629":13,\u0637\u0631\u062D:14,\u0646\u0642\u0627\u0628\u0627\u062A:15};try{let s=await h.getCategoriesFromRedis();if(!Array.isArray(s))throw new Error("Categories data is not an array");let r=s.map(i=>({slug:i.name,name:i.name,filter:i.name,hasSubcats:!1,count:i.count||0,ids:i.ids||(i.id?[i.id]:[])}));r=r.filter(i=>{if(i.ids.length>0){let o=Number(i.ids[0]);return t.hasOwnProperty(o)}return!1}).map(i=>{let o=Number(i.ids[0]);return{...i,name:t[o].name,slug:t[o].name.toLowerCase().replace(/\s+/g,"-"),url:t[o].url,ids:i.ids}}),r.sort((i,o)=>{let c=e[i.name]||999,n=e[o.name]||999;return c-n}),r.unshift({...this.state.trendingCategory}),this.state.categories=r}catch(s){throw this.state.categories=[{...this.state.trendingCategory}],s}finally{this.categoriesLoading=!1}}createTemplate(){return this.categoriesLoading?`
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
        `}async initializeCategorySections(){try{let t=this.state.categories.map(i=>i.slug==="trending-now"?h.getGlobalProducts(0,this.state.productsPerPage).then(o=>({slug:i.slug,ids:o.objectIDs||[]})).catch(o=>({slug:i.slug,ids:[],error:o})):i.ids&&i.ids.length>0?this.fetchRegularCategory(i).then(o=>({slug:i.slug,ids:o||[]})).catch(o=>({slug:i.slug,ids:[],error:o})):Promise.resolve({slug:i.slug,ids:[]})),s=(await Promise.all(t)).reduce((i,o)=>(i[o.slug]=o.ids,i),{});this.seenProductIds.clear();let r={};for(let i of this.state.categories){let o=s[i.slug]||[],c=[];for(let n of o)if(!this.seenProductIds.has(n)&&(this.seenProductIds.add(n),c.push(n),c.length>=6))break;r[i.slug]=c}this.renderProductSliders(r)}catch(t){this.handleInitError(t)}}async fetchRegularCategory(t){let e=t.ids.map(s=>h.getCategoryPageById(s,0,this.state.productsPerPage).catch(r=>({objectIDs:[]})));try{return(await Promise.all(e)).flatMap(r=>r&&r.objectIDs?r.objectIDs:[])}catch{return[]}}renderProductSliders(t){this.state.categories.forEach(e=>{let s=e.slug,r=t[s]||[],i=this.querySelector(`#products-${s}`);if(i)if(i.innerHTML="",r.length>0){let o=document.createElement("salla-products-slider");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(r)),o.setAttribute("limit",String(r.length)),o.setAttribute("slider-id",`slider-${s}`),o.setAttribute("block-title"," "),o.setAttribute("arrows","true"),o.setAttribute("rtl","true"),i.appendChild(o),setTimeout(()=>{o.querySelectorAll(".s-product-card-content-sub").forEach(n=>{n.children.length>1&&(n.style.display="flex",n.style.alignItems="center",n.style.justifyContent="space-between",n.style.flexWrap="nowrap",n.style.width="100%",n.style.overflow="visible")})},500)}else i.innerHTML='<div style="text-align: center; padding: 1rem;">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0639\u0631\u0636\u0647\u0627 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0629.</div>'})}handleInitError(t){this.innerHTML=`
            <div class="category-filter">
                <div class="error-message" style="color: #e53e3e; text-align: center; padding: 2rem; margin-top: 2rem;">
                    \u0639\u0630\u0631\u0627\u064B\u060C \u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A. \u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0635\u0641\u062D\u0629.
                    ${t?"<br><small>Error details logged.</small>":""}
                </div>
            </div>
        `}};customElements.get("mahaba-category-products")||customElements.define("mahaba-category-products",q);var k=class{constructor(){this.initialized=!1,this.productId=null,this.recentlyViewedKey="recently_viewed_products",this.maxRecentProducts=15,this.recentlyViewedClass="algolia-recently-viewed",this.orderObservers=new Map,this.orderTimers=new Map,this.reorderingWrappers=new WeakSet}initialize(){if(!this.isProductPage())return;let t=this.getProductId();if(!t||this.initialized&&this.productId===t)return;this.productId=t,this.initialized=!0,this.addToRecentlyViewed(this.productId);let e=()=>{this.loadRecommendations(),this.loadRecentlyViewed()};document.readyState==="complete"||document.readyState==="interactive"?e():document.addEventListener("DOMContentLoaded",e)}loadRecommendations(){let t=document.querySelector('salla-products-slider[source="related"]');t?this.replaceRelatedProducts(t):this.waitForElement('salla-products-slider[source="related"]',e=>{this.replaceRelatedProducts(e)})}loadRecentlyViewed(){let t=this.getRecentlyViewed();if(!t.length)return;let e=t.map(c=>parseInt(c,10)).filter(c=>c&&!isNaN(c)&&c!==parseInt(this.productId,10));if(!e.length)return;this.removeExistingRecentlyViewed();let s=document.createElement("div");s.className="mt-8 s-products-slider-container",s.classList.add(this.recentlyViewedClass);let r=document.createElement("h2");r.className="section-title mb-5 font-bold text-xl",r.textContent="\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0624\u062E\u0631\u0627\u064B",s.appendChild(r);let i=document.createElement("salla-products-slider");i.setAttribute("source","selected"),i.setAttribute("source-value",JSON.stringify(e)),i.setAttribute("autoplay","false"),i.setAttribute("class","product-recommendations-slider");let o=document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"]');i.setAttribute("display-style",o?.getAttribute("display-style")||"normal"),s.appendChild(i),this.insertRecentlyViewedSection(s,o),window.salla?.event?.dispatch("twilight::mutation"),this.setupStockFilter(i,e)}insertRecentlyViewedSection(t,e){let s=document.querySelector(".product-details, .product-entry, #product-entry");if(s&&s.parentNode)return s.parentNode.insertBefore(t,s.nextSibling),!0;if(e){let i=e.closest(".s-products-slider-container");if(i&&i.parentNode)return i.parentNode.insertBefore(t,i.nextSibling),!0;if(e.parentNode)return e.parentNode.insertBefore(t,e.nextSibling),!0}let r=document.querySelector("main, .s-product-page-content, #content, .s-product-page");return r?(r.appendChild(t),!0):(document.body.appendChild(t),!0)}addToRecentlyViewed(t){if(t)try{let e=parseInt(t,10);if(isNaN(e))return;let s=this.getRecentlyViewed();s=s.map(r=>parseInt(r,10)).filter(r=>!isNaN(r)),s=s.filter(r=>r!==e),s.unshift(e),s.length>this.maxRecentProducts&&(s=s.slice(0,this.maxRecentProducts)),sessionStorage.setItem(this.recentlyViewedKey,JSON.stringify(s))}catch{}}removeExistingRecentlyViewed(){document.querySelectorAll(`.${this.recentlyViewedClass}`).forEach(t=>t.remove())}getRecentlyViewed(){try{let t=sessionStorage.getItem(this.recentlyViewedKey);return t?JSON.parse(t):[]}catch{return[]}}isProductPage(){return!!document.querySelector('.product-form input[name="id"], [id^="product-"], .sidebar .details-slider')}getProductId(){let t=document.querySelector('.product-form input[name="id"]');if(t?.value){let o=parseInt(t.value,10);if(!isNaN(o))return o}let e=window.salla?.product?.id;if(e){let o=parseInt(e,10);if(!isNaN(o))return o}let s=document.querySelector(".product-entry, #product-entry, .product-details");if(s){let o=s.matches('[id^="product-"]')?s:s.querySelector('[id^="product-"]');if(o&&!o.closest("salla-products-slider")){let c=o.id.replace("product-",""),n=parseInt(c,10);if(!isNaN(n))return n}}let r=document.querySelector('[id^="product-"]');if(r&&!r.closest("salla-products-slider")){let o=r.id.replace("product-",""),c=parseInt(o,10);if(!isNaN(c))return c}let i=window.location.pathname.match(/\/p(\d+)/);if(i?.[1]){let o=parseInt(i[1],10);if(!isNaN(o))return o}return null}async replaceRelatedProducts(t){try{let e=this.productId,s=await h.getRecommendations(e);if(e!==this.productId){console.log("[Bundle Recommendations] Product changed during fetch, aborting");return}if(!s?.length)return;let r=s.map(o=>parseInt(o,10)).filter(o=>o&&!isNaN(o));if(!r.length)return;let i=document.createElement("salla-products-slider");if(Array.from(t.attributes).forEach(o=>{o.name!=="source-value"&&i.setAttribute(o.name,o.value)}),i.setAttribute("source","selected"),i.setAttribute("source-value",JSON.stringify(r)),i.setAttribute("class","product-recommendations-slider"),t.parentNode.replaceChild(i,t),!document.getElementById("product-recommendations-styles")){let o=document.createElement("style");o.id="product-recommendations-styles",o.textContent=`
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
                `,document.head.appendChild(o)}window.salla?.event?.dispatch("twilight::mutation"),this.setupStockFilter(i,r)}catch{}}setupStockFilter(t,e=null){let s=r=>{t.contains(r.target)&&(window.salla?.event?.off("salla-products-slider::products.fetched",s),setTimeout(()=>{let i=t.querySelectorAll(".s-product-card-entry");if(!i.length)return;let o=0,c=15;i.forEach(n=>{n.classList.contains("s-product-card-out-of-stock")||o>=c?n.style.display="none":o++}),e?.length&&this.attachOrdering(t,e)},200))};window.salla?.event?.on("salla-products-slider::products.fetched",s)}reset(){this.initialized=!1,this.productId=null,this.removeExistingRecentlyViewed(),this.orderObservers.forEach(({observer:t})=>t.disconnect()),this.orderObservers.clear(),this.orderTimers.forEach(t=>clearTimeout(t)),this.orderTimers.clear()}attachOrdering(t,e){!t||!e?.length||(t.dataset.recommendationOrder=e.join(","),this.scheduleReorder(t,e,!0),this.setupOrderObserver(t,e))}scheduleReorder(t,e,s=!1){if(!t||!e?.length)return;let r=()=>{if(!t.isConnected)return this.teardownOrdering(t),!1;let c=t.querySelector(".swiper-wrapper");return c?this.applyOrderOnce(t,c,e):!1};if(s){if(r())return;this.scheduleReorder(t,e,!1);return}let i=this.orderTimers.get(t);i&&clearTimeout(i);let o=setTimeout(()=>{this.orderTimers.delete(t),r()},80);this.orderTimers.set(t,o)}setupOrderObserver(t,e){let s=t.querySelector(".swiper-wrapper");if(!s)return;let r=this.orderObservers.get(t);if(r){r.ids=e;return}let i=new MutationObserver(o=>{if(!o.some(d=>d.type==="childList")||this.reorderingWrappers.has(s))return;if(!t.isConnected){this.teardownOrdering(t);return}let n=this.orderObservers.get(t)?.ids||e;n?.length&&this.scheduleReorder(t,n)});i.observe(s,{childList:!0}),this.orderObservers.set(t,{observer:i,ids:e,wrapper:s})}teardownOrdering(t){let e=this.orderObservers.get(t);e&&(e.observer.disconnect(),this.orderObservers.delete(t));let s=this.orderTimers.get(t);s&&(clearTimeout(s),this.orderTimers.delete(t))}applyOrderOnce(t,e,s){if(!e||!s?.length)return!1;let r=Array.from(e.querySelectorAll(".s-products-slider-card"));if(!r.length)return!1;this.reorderingWrappers.add(e);let i=new Map;r.forEach(c=>{let n=c.querySelector(".s-product-card-entry, custom-salla-product-card"),d=n?.dataset?.id||n?.getAttribute?.("data-id")||n?.id;if(!d){let l=n?.getAttribute?.("product-id");l&&(d=l)}if(!d){let l=c.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(l?.href){let p=l.href.match(/\/p(\d+)(?:$|\?|\/)/)||l.href.match(/\/product\/[^/]+\/(\d+)/);p?.[1]&&(d=p[1])}}d&&i.set(String(d),c)});let o=!1;if(s.forEach(c=>{let n=i.get(String(c));n&&n.parentNode===e&&(e.appendChild(n),o=!0)}),o){let n=t.querySelector("salla-slider")?.swiper;n?.updateSlides?.(),n?.updateProgress?.(),n?.slideTo?.(0,0,!1)}return requestAnimationFrame(()=>this.reorderingWrappers.delete(e)),!0}waitForElement(t,e){let s=document.querySelector(t);if(s){e(s);return}let r=new MutationObserver(()=>{let i=document.querySelector(t);i&&(r.disconnect(),e(i))});r.observe(document.body,{childList:!0,subtree:!0})}},U=new k,g=U;var v=!1,w=0,N=2;function A(){if(console.log(`[PR Init] Attempt ${w+1}/${N}`),v)return;if(w++,w>N){console.warn("[PR Init] Max attempts reached");return}let a=document.querySelector('salla-products-list[source="product.index"], salla-products-list[source="categories"]');if(console.log("[PR Init] Category list found:",!!a),a){let e=a.getAttribute("source-value");if(e){console.log("[PR Init] \u2705 Creating ranking for category:",e),$("category",e),v=!0;return}}let t=document.querySelector('salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]');if(t){let e=t.getAttribute("source-value");if(e){console.log("[PR Init] \u2705 Creating ranking for tag:",e),$("tag",e),v=!0;return}}w<N&&(console.log("[PR Init] Retrying in 800ms..."),setTimeout(A,800))}function $(a,t){if(document.querySelector(`product-ranking[${a}-id="${t}"]`))return;let e=document.createElement("product-ranking");e.setAttribute(`${a}-id`,t),document.body.appendChild(e)}document.addEventListener("salla::page::changed",()=>{v=!1,w=0,document.querySelectorAll("product-ranking").forEach(a=>a.remove()),setTimeout(A,100)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",A):(A(),document.addEventListener("salla::ready",()=>{v||setTimeout(A,100)}));var W="[YouTube Opt-In]",u=(...a)=>console.log(W,...a),E=/\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i,B=!1;function F(){if(B||typeof document>"u")return;let a=document.createElement("style");a.id="youtube-placeholder-styles",a.textContent=`
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
  `,document.head.appendChild(a),B=!0}function S(a){if(!a)return"";let t=R(a);return t?`https://www.youtube.com/embed/${t}`:a.split("?")[0]}function R(a){if(!a)return null;let t=[/youtube\.com\/embed\/([^?&/]+)/,/youtube-nocookie\.com\/embed\/([^?&/]+)/,/youtube\.com\/v\/([^?&/]+)/,/youtube\.com\/watch\?v=([^&]+)/,/youtu\.be\/([^?&/]+)/,/youtube\.com\/shorts\/([^?&/]+)/];for(let e of t){let s=a.match(e);if(s&&s[1])return s[1]}return null}function I(a,t={}){F();let e=document.createElement("button");e.type="button",e.className="yt-placeholder",e.setAttribute("data-yt-src",a),e.setAttribute("aria-label","Play YouTube video");let s=t.videoId||R(a),r=t.thumbnailUrl,i=r||(s?`https://i.ytimg.com/vi/${s}/hqdefault.jpg`:null);if(i){let c=document.createElement("img");c.className="yt-placeholder__thumb",c.alt=t.thumbnailAlt||"Video thumbnail",c.loading="lazy",c.decoding="async",r?(c.src=i,e.dataset.thumbLoaded="true"):c.setAttribute("data-src",i),e.dataset.ytThumbSrc=i,e.appendChild(c)}let o=document.createElement("span");return o.className="yt-placeholder__icon",o.setAttribute("aria-hidden","true"),o.textContent="\u25B6",e.appendChild(o),e}var D=null;function y(a=document){if(!a)return;[...a.querySelectorAll("iframe"),...a.querySelectorAll("embed"),...a.querySelectorAll("object")].forEach(e=>{let s=e.src||e.getAttribute("src")||e.data||e.getAttribute("data");if(!s||!E.test(s))return;if("srcdoc"in e&&e.removeAttribute("srcdoc"),"src"in e){try{e.src="about:blank"}catch{}e.removeAttribute("src")}"data"in e&&e.removeAttribute("data");let r=I(S(s));e.width&&(r.style.width=e.width),e.height&&(r.style.height=e.height),e.style&&e.style.width&&(r.style.width=e.style.width),e.style&&e.style.height&&(r.style.height=e.style.height),r.addEventListener("click",x),r.setAttribute("data-click-bound","true"),C(r),e.parentNode&&e.parentNode.replaceChild(r,e)})}function j(a){let t=a.querySelector(".yt-placeholder__thumb");if(!t)return;let e=t.dataset.src;e&&(t.src=e,t.removeAttribute("data-src"),a.dataset.thumbLoaded="true")}function X(){D||typeof IntersectionObserver>"u"||(D=new IntersectionObserver(a=>{a.forEach(t=>{t.isIntersecting&&(j(t.target),D.unobserve(t.target))})},{rootMargin:"200px 0px"}))}function C(a){let t=a.querySelector(".yt-placeholder__thumb");if(t&&a.dataset.thumbLoaded!=="true"){if(!t.dataset.src){a.dataset.thumbLoaded="true";return}if(typeof IntersectionObserver>"u"){j(a);return}X(),D.observe(a)}}function H(a){if(!a)return;u("Sanitizing fragment",a);let t=a.querySelectorAll("iframe"),e=a.querySelectorAll("embed"),s=a.querySelectorAll("object");[...t,...e,...s].forEach(i=>{let o=i.src||i.data||i.getAttribute("src")||i.getAttribute("data");if(o&&E.test(o)){let c=R(o),n=S(o),d=i.getAttribute("data-yt-thumb")||i.dataset?.ytThumb;u("Replacing YouTube embed with placeholder",{videoUrl:n,element:i});let l=I(n,{videoId:c,thumbnailUrl:d});i.width&&(l.style.width=i.width),i.height&&(l.style.height=i.height),i.style.width&&(l.style.width=i.style.width),i.style.height&&(l.style.height=i.style.height),i.parentNode.replaceChild(l,i)}})}function Y(a){if(!a||typeof a!="string")return a;u("Sanitizing HTML string");let e=new DOMParser().parseFromString(a,"text/html");return H(e.body),e.body.innerHTML}function x(a){let t=a.currentTarget,e=t.getAttribute("data-yt-src"),s=S(e);if(!s)return;u("Placeholder clicked, loading iframe",{videoUrl:s});let r=document.createElement("iframe"),i=`${s}${s.includes("?")?"&":"?"}autoplay=1&rel=0`;r.src=i,r.width=t.style.width||"100%",r.height=t.style.height||"100%",r.title="YouTube video",r.frameBorder="0",r.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",r.allowFullscreen=!0,r.style.aspectRatio="16/9",r.dataset.ytOptIn="true",t.parentNode.replaceChild(r,t),r.focus()}function f(a=document){u("Initializing YouTube opt-in on root",a===document?"document":a),y(a),a.querySelectorAll("[data-yt-template]").forEach(r=>{if(r.hasAttribute("data-yt-processed"))return;r.setAttribute("data-yt-processed","true"),u("Processing template host",r);let i=r.getAttribute("data-yt-template"),o=document.getElementById(i);if(!o)return;u("Found template for host",i);let c=o.content.cloneNode(!0);H(c),r.appendChild(c)}),a.querySelectorAll(".yt-placeholder[data-yt-src]").forEach(r=>{if(!r.querySelector(".yt-placeholder__icon")&&r.tagName==="DIV"){u("Upgrading static placeholder div to button",r);let i=r.getAttribute("data-yt-src"),o=r.getAttribute("data-yt-thumb")||r.dataset?.ytThumb,c=I(i,{thumbnailUrl:o});c.className=r.className,Array.from(r.attributes).forEach(n=>{["class","data-yt-src","data-yt-thumb"].includes(n.name)||c.setAttribute(n.name,n.value)}),o&&c.setAttribute("data-yt-thumb",o),r.parentNode.replaceChild(c,r)}}),a.querySelectorAll("button.yt-placeholder[data-yt-src]").forEach(r=>{r.hasAttribute("data-click-bound")||(r.addEventListener("click",x),r.setAttribute("data-click-bound","true"),u("Bound click handler to placeholder",r)),C(r)})}function G(){u("Setting up dynamic handlers"),window.salla&&window.salla.event&&(window.salla.event.on("salla-products-slider::products.fetched",s=>{u("Event: salla-products-slider::products.fetched",s);let r=s?.container||document;y(r),f(r)}),window.salla.event.on("product::quickview.opened",s=>{u("Event: product::quickview.opened",s),y(document),f(document)}),window.salla.event.on("product::quickview.response",s=>{u("Event: product::quickview.response",s),s&&s.response&&s.response.html&&(u("Sanitizing quickview HTML response before render"),s.response.html=Y(s.response.html)),y(document),f(document)}));let a=document.getElementById("btn-show-more");a&&a.addEventListener("click",()=>{u("Read more button clicked");let s=document.getElementById("more-content");s&&(y(s),f(s))});let t=new MutationObserver(s=>{s.forEach(r=>{u("Mutation observed",r),r.addedNodes.forEach(i=>{if(i.nodeType!==1)return;i.classList&&i.classList.contains("product-description-content")&&(u("New product-description-content detected, initializing",i),f(i));let o=[];i.tagName==="IFRAME"?o.push(i):i.querySelectorAll&&o.push(...i.querySelectorAll("iframe")),o.forEach(c=>{if(c.dataset&&c.dataset.ytOptIn==="true"){u("Observed opt-in iframe, skipping neutralization",c);return}let n=c.src||c.getAttribute("src");if(n&&E.test(n)){u("Stray iframe detected, neutralizing",c),c.removeAttribute("src"),c.removeAttribute("srcdoc"),c.src="about:blank";let d=S(n),l=I(d);l.addEventListener("click",x),l.setAttribute("data-click-bound","true"),u("Replacing stray iframe with placeholder",{videoUrl:d,iframe:c}),c.parentNode.replaceChild(l,c),C(l)}})})})});document.querySelectorAll(".product-description-content").forEach(s=>{t.observe(s,{childList:!0,subtree:!0})}),t.observe(document.body,{childList:!0,subtree:!0})}function J(){u("Scanning for existing YouTube iframes");let a=document.querySelectorAll("iframe"),t=0;a.forEach(e=>{let s=e.src||e.getAttribute("src");if(s&&E.test(s)){if(e.dataset.ytOptIn==="true"||e.hasAttribute("data-yt-processed"))return;u("Found existing YouTube iframe, replacing",{src:s,iframe:e}),e.src="about:blank";let r=S(s),i=I(r);e.width&&(i.style.width=e.width),e.height&&(i.style.height=e.height),e.style.width&&(i.style.width=e.style.width),e.style.height&&(i.style.height=e.style.height),i.addEventListener("click",x),i.setAttribute("data-click-bound","true"),e.parentNode.replaceChild(i,e),C(i),t++}}),u(`Replaced ${t} existing YouTube iframes`)}function z(){u("Initializing module"),y(document),F(),f(),J(),G()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",z):z();window.darlenaYoutubeOptIn=f;var K=()=>{if(document.getElementById("product-slider-styles"))return;let a=document.createElement("style");a.id="product-slider-styles",a.textContent=`
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
  `,document.head.appendChild(a)},M=class{constructor(){this.enhancedCards=new Set,this.cardInstances=new Map,this.init()}init(){K(),window.app?.status==="ready"?(this.setupEventListeners(),this.enhanceExistingCards()):document.addEventListener("theme::ready",()=>{this.setupEventListeners(),this.enhanceExistingCards()})}setupEventListeners(){document.addEventListener("salla-products-slider::products.fetched",t=>{console.log("[Product Card Enhancer] Products slider fetched"),setTimeout(()=>this.enhanceExistingCards(),100)}),document.addEventListener("salla-products-list::products.fetched",t=>{console.log("[Product Card Enhancer] Products list fetched"),setTimeout(()=>this.enhanceExistingCards(),100)}),document.addEventListener("salla::page::changed",()=>{console.log("[Product Card Enhancer] Page changed"),setTimeout(()=>this.enhanceExistingCards(),500)}),this.setupMutationObserver()}setupMutationObserver(){new MutationObserver(e=>{let s=!1;for(let r of e){if(r.addedNodes.length>0){for(let i of r.addedNodes)if(i.nodeType===1&&(i.classList?.contains("s-product-card-entry")||i.querySelector?.(".s-product-card-entry"))){s=!0;break}}if(s)break}s&&setTimeout(()=>this.enhanceExistingCards(),50)}).observe(document.body,{childList:!0,subtree:!0})}enhanceExistingCards(){let t=document.querySelectorAll(".s-product-card-entry");console.log(`[Product Card Enhancer] Found ${t.length} product cards`),t.forEach(e=>{let s=this.extractProductId(e);s&&!this.enhancedCards.has(s)&&this.enhanceCard(e,s)})}extractProductId(t){if(t.dataset.id)return t.dataset.id;if(t.id&&!isNaN(t.id))return t.id;let e=t.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(e?.href){let r=e.href.match(/\/product\/[^\/]+\/(\d+)/);if(r)return r[1]}let s=t.getAttribute("product");if(s)try{let r=JSON.parse(s);if(r.id)return String(r.id)}catch{}return null}enhanceCard(t,e){console.log(`[Product Card Enhancer] Enhancing card for product ${e}`);let s=t.querySelector(".s-product-card-image");if(!s){console.warn(`[Product Card Enhancer] No image wrapper found for product ${e}`);return}let r=new O(t,e,s);this.cardInstances.set(e,r),this.enhancedCards.add(e),r.setupLazyInit()}},O=class{constructor(t,e,s){this.card=t,this.productId=e,this.imageWrapper=s,this.imageContainer=s.querySelector("a"),this.currentSlide=0,this.additionalImages=[],this.touchStartX=0,this.touchEndX=0,this.isSwiping=!1,this.isMouseDown=!1,this.sliderInitialized=!1,this.sliderId=`slider-${e}-${Date.now()}`,this.boundEventHandlers={}}setupLazyInit(){this.imageWrapper&&(this._observer=new IntersectionObserver(t=>{t.forEach(e=>{e.isIntersecting&&!this.sliderInitialized&&(this.sliderInitialized=!0,this.setupImageSlider(),setTimeout(()=>{this.fetchProductImages()},50),this._observer.unobserve(e.target))})},{rootMargin:"300px",threshold:.01}),this._observer.observe(this.imageWrapper))}setupImageSlider(){if(!this.imageContainer)return;let t=document.createElement("div");t.className="swipe-indicator",this.imageContainer.appendChild(t);let e=null,s=null,r=null,i=!1;this.boundEventHandlers.touchstart=n=>{e=n.touches[0].clientX,s=n.touches[0].clientY,r=Date.now(),i=!1},this.boundEventHandlers.touchmove=n=>{if(!e)return;let d=n.touches[0].clientX-e,l=n.touches[0].clientY-s;Math.abs(d)>Math.abs(l)&&Math.abs(d)>10&&(i=!0,this.isSwiping=!0,t.classList.toggle("right",d>0),t.style.opacity=Math.min(Math.abs(d)/100,.5),n.preventDefault())},this.boundEventHandlers.touchend=n=>{if(!e||!i){e=s=null,this.isSwiping=!1,t.style.opacity=0;return}if(this.isSwiping){let l=n.changedTouches[0].clientX-e,m=Date.now()-r<300?30:50;Math.abs(l)>=m&&(l>0?(this.prevSlide(),this.triggerHapticFeedback("medium")):(this.nextSlide(),this.triggerHapticFeedback("medium"))),n.preventDefault(),n.stopPropagation()}t.style.opacity=0,e=s=null,this.isSwiping=!1},this.imageContainer.addEventListener("touchstart",this.boundEventHandlers.touchstart,{passive:!0}),this.imageContainer.addEventListener("touchmove",this.boundEventHandlers.touchmove,{passive:!1}),this.imageContainer.addEventListener("touchend",this.boundEventHandlers.touchend,{passive:!1}),this.boundEventHandlers.mousedown=n=>{this.isMouseDown=!0,e=n.clientX,s=n.clientY,r=Date.now(),i=!1,n.preventDefault(),n.stopPropagation()},this.boundEventHandlers.mousemove=n=>{if(!this.isMouseDown||!e)return;let d=n.clientX-e;Math.abs(d)>10&&(i=!0,this.isSwiping=!0,t.classList.toggle("right",d>0),t.style.opacity=Math.min(Math.abs(d)/100,.5)),this.isSwiping&&(n.preventDefault(),n.stopPropagation())},this.boundEventHandlers.mouseup=n=>{if(this.isMouseDown){if(i&&this.isSwiping){let l=n.clientX-e,m=Date.now()-r<300?30:50;Math.abs(l)>=m&&(l>0?this.prevSlide():this.nextSlide()),n.preventDefault(),n.stopPropagation()}t.style.opacity=0,this.isMouseDown=!1,this.isSwiping=!1,e=s=null}},this.imageContainer.addEventListener("mousedown",this.boundEventHandlers.mousedown),this.imageContainer.addEventListener("mousemove",this.boundEventHandlers.mousemove),window.addEventListener("mouseup",this.boundEventHandlers.mouseup);let o=document.createElement("div");o.className="product-slider-dots",o.dataset.sliderId=this.sliderId,o.dataset.productId=this.productId;let c=document.createElement("span");c.className="product-slider-dot active",c.dataset.sliderId=this.sliderId,c.dataset.productId=this.productId,c.dataset.index="0",c.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),this.changeSlide(0),this.triggerHapticFeedback("light")}),o.appendChild(c);for(let n=0;n<2;n++){let d=document.createElement("span");d.className="product-slider-dot",d.dataset.sliderId=this.sliderId,d.dataset.productId=this.productId,d.dataset.index=String(n+1),d.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),this.changeSlide(n+1),this.triggerHapticFeedback("light")}),o.appendChild(d)}this.imageWrapper.appendChild(o)}fetchProductImages(){if(!this.productId)return;let t=`https://productstoredis-163858290861.me-central2.run.app/product-images/${this.productId}`;fetch(t,{timeout:5e3}).then(e=>e.json()).then(e=>this.processImageResponse(e)).catch(e=>{console.warn(`[Product Card Enhancer] Failed to fetch images for product ${this.productId}:`,e);let s=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);s&&(s.style.display="none")})}processImageResponse(t){if(!t?.images||!Array.isArray(t.images)){let r=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);r&&(r.style.display="none");return}let e=t.images.filter(r=>r&&r.url).sort((r,i)=>(r.sort||0)-(i.sort||0)).slice(0,2).map(r=>({url:r.url,alt:r.alt}));if(e.length===0){let r=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);r&&(r.style.display="none");return}this.additionalImages=e;let s=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);s&&(s.style.display="flex"),this.preloadAllImages()}preloadAllImages(){this.additionalImages&&this.additionalImages.length>0&&(this.addImageToSlider(this.additionalImages[0],1),this.additionalImages.length>1&&this.addImageToSlider(this.additionalImages[1],2))}addImageToSlider(t,e){if(!t?.url||!this.imageContainer||this.imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${e}"]`))return;let r=document.createElement("img");r.className="product-slider-image",r.src=t.url,r.alt=t.alt||"Product image",r.dataset.sliderId=this.sliderId,r.dataset.productId=this.productId,r.dataset.index=String(e),r.onload=()=>{let i=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${e}"]`);i&&i.classList.add("loaded")},r.onerror=()=>{r.remove();let i=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${e}"]`);i&&(i.remove(),this.checkDotsVisibility())},this.imageContainer.appendChild(r)}checkDotsVisibility(){let t=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);if(t){let e=t.querySelectorAll(".product-slider-dot");t.style.display=e.length<=1?"none":"flex"}}changeSlide(t){this.additionalImages&&t>0&&this.additionalImages[t-1]&&this.addImageToSlider(this.additionalImages[t-1],t),this.currentSlide=t;let e=this.imageContainer.querySelector('img.lazy, img[loading="lazy"], img:first-child:not(.product-slider-image)'),s=this.imageContainer.querySelectorAll(`.product-slider-image[data-slider-id="${this.sliderId}"]`);this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).forEach(o=>o.classList.remove("active"));let i=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${t}"]`);if(i&&i.classList.add("active"),t===0)e&&(e.style.visibility="visible",e.style.opacity="1",e.style.zIndex="10"),s.forEach(o=>o.classList.remove("active"));else{e&&(e.style.visibility="hidden",e.style.opacity="0",e.style.zIndex="5"),s.forEach(c=>c.classList.remove("active"));let o=this.imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${t}"]`);o?o.classList.add("active"):e&&(e.style.visibility="visible",e.style.opacity="1",e.style.zIndex="10")}}prevSlide(){let t=this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length,e=(this.currentSlide-1+t)%t;this.changeSlide(e)}nextSlide(){let t=this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length,e=(this.currentSlide+1)%t;this.changeSlide(e)}triggerHapticFeedback(t){try{if(window.navigator&&window.navigator.vibrate)switch(t){case"light":window.navigator.vibrate(10);break;case"medium":window.navigator.vibrate(25);break;case"strong":window.navigator.vibrate([10,20,30]);break}}catch{}}},pe=new M;window.productRecommendations=g;window.redisService=h;var Q=a=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",a):a();function Z(){if(!document.body.classList.contains("index")){console.log("[Algolia Bundle] Not on homepage, skipping category products injection");return}let a=".app-inner",t="mahaba-category-products";function e(){let r=document.querySelector(a);if(r&&!r.querySelector(t))try{console.log(`[Algolia Bundle] Found ${a}, injecting ${t}...`);let i=document.createElement(t),o=document.querySelector(".store-footer");return o?r.insertBefore(i,o):r.appendChild(i),console.log("\u2705 [Algolia Bundle] Homepage category component injected successfully"),!0}catch(i){return console.error("[Algolia Bundle] Error during injection:",i),!0}return!1}if(e())return;console.log(`[Algolia Bundle] ${a} not found, waiting for async load...`),new MutationObserver((r,i)=>{r.some(c=>c.addedNodes.length>0)&&e()&&i.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}function ee(){if(document.getElementById("cart-addons-slider-styles"))return;let a=document.createElement("style");a.id="cart-addons-slider-styles",a.textContent=`
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
  `,document.head.appendChild(a)}function _(){ee();let a=()=>{let e=document.querySelector("#cart-submit");if(!e)return!1;let s=e.closest(".cart-submit-wrap")||e.parentElement,r=s?.parentElement||s;if(!r)return!1;if(r.querySelector("cart-addons-slider"))return!0;let i=document.createElement("cart-addons-slider");return i.className="cart-addons-wrapper",s&&r?r.insertBefore(i,s.nextSibling):r.appendChild(i),console.log("[Algolia Bundle] Injected cart addons slider"),!0};if(document.querySelector("cart-addons-slider")||a())return;new MutationObserver((e,s)=>{a()&&s.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}Q(()=>{Z(),document.querySelector('[id^="product-"]')&&setTimeout(()=>{g.initialize(),console.log("\u2705 [Algolia Bundle] Product recommendations initialized")},3e3),(document.querySelector('form[id^="item-"]')||document.querySelector("#cart-submit"))&&setTimeout(_,500),console.log("\u2705 [Algolia Bundle] Loaded successfully")});document.addEventListener("salla::page::changed",()=>{g.reset(),setTimeout(()=>{g.initialize()},1e3),setTimeout(_,500)});document.addEventListener("theme::ready",()=>{if(!document.querySelector('[id^="product-"]'))return;let a=g.getProductId();a&&g.productId&&a===g.productId||a&&(console.log("[Algolia Bundle] New product detected via theme::ready, re-initializing"),g.reset(),setTimeout(()=>{g.initialize()},1e3))});})();
