var AlgoliaBundle=(()=>{var L=class{constructor(){this.baseUrl="https://me-central2-gtm-5v2mhn4-mwvlm.cloudfunctions.net/function-2",this.maxRetries=2,this.headers={Accept:"application/json","Cache-Control":"public, max-age=3600"},this.cache=new Map,this.fallbackEnabled=!0}async getProducts(e,t,s=0,r=12){if(!t)return null;let i=`${e}:${t}:${s}:${r}`;if(this.cache.has(i))return this.cache.get(i);let o=e==="category"?"catID":"tagID",d=e==="category"?"categoryById":"tagById",a=`${this.baseUrl}/?type=${d}&${o}=${encodeURIComponent(t)}&offset=${s}&limit=${r}`,c=null;try{let l=new AbortController,m=setTimeout(()=>l.abort(),2e3),p=await fetch(a,{method:"GET",headers:this.headers,signal:l.signal});if(clearTimeout(m),!p.ok)throw new Error(`HTTP error: ${p.status}`);if(c=await p.json(),c?.objectIDs?.length)return this.cache.set(i,c),c}catch{}if(!c?.objectIDs?.length&&this.fallbackEnabled)try{let l=await fetch(a,{method:"GET",headers:this.headers});if(l.ok&&(c=await l.json(),c?.objectIDs?.length))return this.cache.set(i,c),c}catch{}return c||{objectIDs:[],hasMore:!1}}async getRecommendations(e){if(!e)return[];let t=`recommendations:${e}`;if(this.cache.has(t))return this.cache.get(t);let s=`${this.baseUrl}/?type=recommendations&objectID=${encodeURIComponent(e)}`;try{let r=new AbortController,i=setTimeout(()=>r.abort(),3e3),o=await fetch(s,{method:"GET",headers:this.headers,signal:r.signal});if(clearTimeout(i),!o.ok)return[];let d=await o.json(),a=Array.isArray(d?.relatedProductIDs)?d.relatedProductIDs:[];return this.cache.set(t,a),a}catch{return[]}}async getFrequentlyBought(e){if(!e)return[];let t=`frequently-bought:${e}`;if(this.cache.has(t))return this.cache.get(t);let s=`${this.baseUrl}/?type=frequentlyBought&objectID=${encodeURIComponent(e)}`;try{let r=new AbortController,i=setTimeout(()=>r.abort(),3e3),o=await fetch(s,{method:"GET",headers:this.headers,signal:r.signal});if(clearTimeout(i),!o.ok)return[];let d=await o.json(),a=Array.isArray(d?.frequentlyBoughtIDs)?d.frequentlyBoughtIDs:[];return this.cache.set(t,a),a}catch{return[]}}async getCategoriesFromRedis(){let e="all-categories";if(this.cache.has(e))return this.cache.get(e);try{let t=new AbortController,s=setTimeout(()=>t.abort(),5e3),r=await fetch(`${this.baseUrl}/?type=categories`,{method:"GET",headers:this.headers,signal:t.signal});if(clearTimeout(s),!r.ok)return[];let o=(await r.json()).categories||[];return this.cache.set(e,o),o}catch{return[]}}async getGlobalProducts(e=0,t=12){let s=`global-products:${e}:${t}`;if(this.cache.has(s))return this.cache.get(s);try{let r=new AbortController,i=setTimeout(()=>r.abort(),3e3),o=`${this.baseUrl}/?type=categoryById&catID=trending-now&offset=${e}&limit=${t}`,d=await fetch(o,{method:"GET",headers:this.headers,signal:r.signal});if(clearTimeout(i),!d.ok)return{objectIDs:[],hasMore:!1};let a=await d.json(),c={objectIDs:a.objectIDs||[],hasMore:a.hasMore||!1};return this.cache.set(s,c),c}catch{return{objectIDs:[],hasMore:!1}}}async getCategoryPageById(e,t=0,s=12){return this.getProducts("category",e,t,s)}async getCategoryProducts(e,t,s){return this.getProducts("category",e,t,s)}async getTagProducts(e,t,s){return this.getProducts("tag",e,t,s)}},h=new L;var P=class extends HTMLElement{constructor(){super(),this.initialized=!1,this.productIds=[],this.structureReady=!1}connectedCallback(){this.ensureStructure(),!this.initialized&&this.getHighestValueItemFromDOM().then(e=>e?this.fetchFrequentlyBoughtProducts(e):[]).then(()=>{this.renderProductList(),setTimeout(()=>{this.initializeSlider()},1e3)}).catch(e=>{console.error("[CartAddonsSlider] Error loading products:",e)})}ensureStructure(){if(!this.structureReady){if(!this.querySelector(".cart-addons-title")){let e=document.createElement("h3");e.className="cart-addons-title",e.textContent=window.salla?.lang?.get("pages.cart.frequently_bought_together")||"Frequently bought together",this.appendChild(e)}if(!this.querySelector(".frequently-bought-container")){let e=document.createElement("div");e.className="frequently-bought-container",this.appendChild(e)}this.structureReady=!0}}async getHighestValueItemFromDOM(){try{let e=document.querySelectorAll('form[id^="item-"]');if(!e||e.length===0)return console.log("[CartAddonsSlider] No cart items found in DOM"),null;let t=null,s=0;return e.forEach(r=>{try{let i=r.getAttribute("id")||"",o=i.replace("item-",""),d=r.querySelector('a[href*="/p"]');if(!d){console.log("[CartAddonsSlider] No product link found in form",i);return}let a=d.getAttribute("href"),c=a.match(/\/p(\d+)(?:$|\/|\?)/);if(!c||!c[1]){console.log("[CartAddonsSlider] Could not extract product ID from URL",a);return}let l=c[1],m=r.querySelector(".item-total");if(m){let V=(m.textContent||m.innerText||"0").replace(/[^\d.,٠١٢٣٤٥٦٧٨٩]/g,"").replace(/٠/g,"0").replace(/١/g,"1").replace(/٢/g,"2").replace(/٣/g,"3").replace(/٤/g,"4").replace(/٥/g,"5").replace(/٦/g,"6").replace(/٧/g,"7").replace(/٨/g,"8").replace(/٩/g,"9"),b=parseFloat(V.replace(",","."))||0;console.log(`[CartAddonsSlider] Item ${o}: Product ID ${l}, Total: ${b}`),!isNaN(b)&&b>s&&(s=b,t={itemId:o,productId:l,total:b})}}catch(i){console.error("[CartAddonsSlider] Error processing item form:",i)}}),t?(console.log("[CartAddonsSlider] Highest value item:",t),t.productId):null}catch(e){return console.error("[CartAddonsSlider] Error extracting cart data from DOM:",e),null}}async fetchFrequentlyBoughtProducts(e){try{console.log("[CartAddonsSlider] Fetching frequently bought products for:",e);let t=await h.getFrequentlyBought(e);return t&&t.length>0?(console.log("[CartAddonsSlider] Found frequently bought products:",t),this.productIds=t.map(s=>String(s)).slice(0,8),this.productIds):(console.log("[CartAddonsSlider] No frequently bought products found"),this.productIds=[],[])}catch(t){return console.error("[CartAddonsSlider] Error fetching frequently bought products:",t),this.productIds=[],[]}}renderProductList(){if(!this.productIds||this.productIds.length===0){console.log("[CartAddonsSlider] No products to render, hiding component"),this.style.display="none";return}console.log("[CartAddonsSlider] Rendering product list with IDs:",this.productIds);let e=this.querySelector(".frequently-bought-container");if(!e){console.error("[CartAddonsSlider] Container not found");return}let t=document.createElement("salla-products-list");if(t.setAttribute("source","selected"),t.setAttribute("loading","lazy"),t.setAttribute("source-value",JSON.stringify(this.productIds)),t.setAttribute("class","s-products-list-vertical-cards"),e.innerHTML="",e.appendChild(t),!this.querySelector(".touch-indicator")){let s=document.createElement("div");s.classList.add("touch-indicator"),this.appendChild(s)}console.log("[CartAddonsSlider] Product list rendered")}initializeSlider(){try{let e=this.querySelector("salla-products-list");if(!e){console.log("[CartAddonsSlider] Products list not found");return}e.style.opacity="1",window.salla?.event?.dispatch&&window.salla.event.dispatch("twilight::mutation"),this.initialized=!0,console.log("[CartAddonsSlider] Slider initialized")}catch(e){console.error("[CartAddonsSlider] Failed to initialize cart addons slider:",e)}}};customElements.get("cart-addons-slider")||(customElements.define("cart-addons-slider",P),console.log("[CartAddonsSlider] Custom element defined"));var k=class extends HTMLElement{constructor(){super(),this.page=0,this.loading=!1,this.hasMore=!0,this.ids=[],this.container=null,this.originalList=null,this.usingSallaFilter=!1,this.timeout=null}async connectedCallback(){let e=this.getAttribute("category-id"),t=this.getAttribute("tag-id");if(console.log("[PR Element] Connected:",{categoryId:e,tagId:t}),!(!e&&!t))try{await this.waitForSalla(),this.setupFilterListener(),await this.initialize(e,t)}catch(s){console.error("[PR Element] Error:",s),this.restoreOriginalList()}}restoreOriginalList(){if(!this.originalList||this.usingSallaFilter)return;let e=document.querySelector(".ranked-products, salla-products-list[filter]"),t=e?.parentNode||this.originalList.parentNode;e&&e.remove(),this.container&&(this.container.remove(),this.container=null),t&&!t.querySelector("salla-products-list")&&(t.appendChild(this.originalList.cloneNode(!0)),window.salla?.event?.dispatch("twilight::mutation"))}setupFilterListener(){document.addEventListener("change",e=>{if(e.target.id!=="product-filter")return;let t=e.target.value;t==="ourSuggest"&&this.usingSallaFilter?this.applyRedisRanking():t!=="ourSuggest"&&this.applySallaFilter(t)})}async applySallaFilter(e){let t=this.getAttribute("category-id"),s=this.getAttribute("tag-id");if(!this.originalList)return;let r=document.querySelector(".ranked-products, salla-products-list[filter]"),i=r?.parentNode||this.container?.parentNode;if(!i)return;r&&r.remove(),this.container&&(this.container.remove(),this.container=null),this.cleanupScrollListener(),this.usingSallaFilter=!0;let o=this.originalList.cloneNode(!0);o.setAttribute("filter",e),i.appendChild(o),window.salla?.event?.dispatch("twilight::mutation")}async applyRedisRanking(){let e=this.getAttribute("category-id"),t=this.getAttribute("tag-id");this.usingSallaFilter=!1,await this.initialize(e,t,!0)}async initialize(e,t,s=!1){if(console.log("[PR Element] Initialize called"),this.container&&!this.usingSallaFilter&&!s)return;let r=e?'salla-products-list[source="product.index"], salla-products-list[source="categories"]':'salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]',i=document.querySelector(r);if(console.log("[PR Element] Existing list found:",!!i),!i)return;this.originalList||(this.originalList=i.cloneNode(!0));let o=document.getElementById("product-filter");if(o)o.value="ourSuggest",this.usingSallaFilter=!1;else if(o&&o.value!=="ourSuggest"&&!s){this.usingSallaFilter=!0;return}let d=e?h.getCategoryProducts(e,0,12):h.getTagProducts(t,0,12),a=i.parentNode;this.container=document.createElement("div"),this.container.className="ranked-products",a.insertBefore(this.container,i),clearTimeout(this.timeout),this.timeout=setTimeout(()=>{(!this.ids||!this.ids.length)&&this.restoreOriginalList()},2500);let c=await d;if(clearTimeout(this.timeout),console.log("[PR Element] Redis data received:",c?.objectIDs?.length,"products"),console.log("[PR Element] Redis product IDs:",c.objectIDs),!c?.objectIDs?.length){console.warn("[PR Element] No products from Redis, restoring original"),this.restoreOriginalList();return}this.ids=c.objectIDs,this.page=0,this.hasMore=!0,this.usingSallaFilter=!1;let l=document.createElement("salla-products-list");l.setAttribute("source","selected"),l.setAttribute("source-value",JSON.stringify(this.ids)),l.setAttribute("limit",this.ids.length),l.className=i.className||"w-full",this.container.appendChild(l),i.remove(),window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(this.container,this.ids),this.setupScrollListener()}setupScrollListener(){this.cleanupScrollListener(),this._boundScrollHandler=this.handleScroll.bind(this),window.addEventListener("scroll",this._boundScrollHandler)}cleanupScrollListener(){this._boundScrollHandler&&(window.removeEventListener("scroll",this._boundScrollHandler),this._boundScrollHandler=null)}handleScroll(){if(this.loading||!this.hasMore||this.usingSallaFilter)return;let e=window.scrollY+window.innerHeight,t=document.documentElement.scrollHeight*.5;e>t&&this.loadMore()}async loadMore(){if(!(this.loading||!this.hasMore)){this.loading=!0;try{let e=this.page+1,t=e*12,s=this.getAttribute("category-id"),r=this.getAttribute("tag-id"),i=s?await h.getCategoryProducts(s,t,12):await h.getTagProducts(r,t,12);if(!i?.objectIDs?.length){this.hasMore=!1;return}let o=document.createElement("salla-products-list");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(i.objectIDs)),o.setAttribute("limit",i.objectIDs.length),o.className="w-full",this.container.appendChild(o),this.page=e,this.hasMore=i.hasMore!==!1,window.salla?.event?.dispatch("twilight::mutation"),this.applyOrderToList(o,i.objectIDs)}catch{this.hasMore=!1}finally{this.loading=!1}}}async waitForSalla(){if(!window.salla)return new Promise(e=>{document.addEventListener("salla::ready",e,{once:!0}),setTimeout(e,3e3)})}applyOrderToList(e,t,s=30){if(!e||!t||!t.length)return;let r=0,i=setInterval(()=>{r++;let o=Array.from(e.querySelectorAll("custom-salla-product-card, .s-product-card-entry"));if(o.length>0){clearInterval(i);let d=new Map;o.forEach(c=>{let l=null;if(c.dataset.id)l=c.dataset.id;else if(c.id&&!isNaN(c.id))l=c.id;else{let m=c.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(m?.href){let p=m.href.match(/\/product\/[^\/]+\/(\d+)/);p&&(l=p[1])}}l&&d.set(String(l),c)});let a=o[0].parentNode;if(!a)return;t.forEach(c=>{let l=d.get(String(c));l&&a.contains(l)&&a.appendChild(l)}),console.log("[PR Element] Reordered",o.length,"cards to match Redis order")}else r>=s&&(clearInterval(i),console.warn("[PR Element] Cards never appeared, skipping reorder"))},100)}disconnectedCallback(){this.cleanupScrollListener(),clearTimeout(this.timeout)}};customElements.get("product-ranking")||customElements.define("product-ranking",k);var q=class extends HTMLElement{constructor(){super(),this.state={productsPerPage:30,categories:[],trendingCategory:{name:"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646",slug:"trending-now",filter:null,hasSubcats:!1,url:null}},this.categoriesLoading=!0,this.seenProductIds=new Set}async connectedCallback(){this.innerHTML=`
            <div class="category-filter">
                <div class="categories-loading">\u062C\u0627\u0631\u0650 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A...</div>
            </div>
        `;try{await this.fetchCategoriesFromCloudRun();let e=this.createTemplate();this.innerHTML=e,await this.initializeCategorySections()}catch(e){this.handleInitError(e)}}disconnectedCallback(){}async fetchCategoriesFromCloudRun(){let e={228327271:{name:"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA/c228327271"},476899183:{name:"\u062C\u0644\u0627\u0628\u064A\u0627\u062A",url:"https://darlena.com/%D8%AC%D9%84%D8%A7%D8%A8%D9%8A%D8%A7%D8%AA/c476899183"},1466412179:{name:"\u062C\u062F\u064A\u062F\u0646\u0627",url:"https://darlena.com/%D8%AC%D8%AF%D9%8A%D8%AF-%D8%AF%D8%A7%D8%B1-%D9%84%D9%8A%D9%86%D8%A7/c1466412179"},289250285:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%83%D9%84%D9%88%D8%B4/c289250285"},1891285357:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B3%D9%88%D8%AF%D8%A7%D8%A1-%D8%B3%D8%A7%D8%AF%D8%A9/c1891285357"},2132455494:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D9%84%D9%88%D9%86%D8%A9/c2132455494"},940975465:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%AC%D9%8A%D9%88%D8%A8/c940975465"},1567146102:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%B4%D8%AA/c1567146102"},832995956:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D8%B7%D8%B1%D8%B2%D8%A9/c832995956"},2031226480:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B1%D8%A3%D8%B3/c2031226480"},1122348775:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629",url:"https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B5%D9%8A%D9%81%D9%8A%D8%A9/c1122348775"},692927841:{name:"\u0637\u0631\u062D",url:"https://darlena.com/%D8%B7%D8%B1%D8%AD/c692927841"},639447590:{name:"\u0646\u0642\u0627\u0628\u0627\u062A",url:"https://darlena.com/%D9%86%D9%82%D8%A7%D8%A8%D8%A7%D8%AA/c639447590"},114756598:{name:"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646",url:"https://darlena.com/%D8%B4%D9%8A%D9%81%D9%88%D9%86/c114756598"}},t={"\u0631\u0627\u0626\u062C \u0627\u0644\u0627\u0646":1,\u062C\u062F\u064A\u062F\u0646\u0627:2,"\u0639\u0628\u0627\u064A\u0627\u062A \u0635\u064A\u0641\u064A\u0629":3,"\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0628\u0627\u064A\u0627\u062A":4,"\u0639\u0628\u0627\u064A\u0627\u062A \u0643\u0644\u0648\u0634":5,\u062C\u0644\u0627\u0628\u064A\u0627\u062A:6,"\u0639\u0628\u0627\u064A\u0627\u062A \u0634\u064A\u0641\u0648\u0646":7,"\u0639\u0628\u0627\u064A\u0627\u062A \u0633\u0648\u062F\u0627\u0621 \u0633\u0627\u062F\u0629":8,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u062C\u064A\u0648\u0628":9,"\u0639\u0628\u0627\u064A\u0627\u062A \u0628\u0634\u062A":10,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0637\u0631\u0632\u0629":11,"\u0639\u0628\u0627\u064A\u0627\u062A \u0631\u0623\u0633":12,"\u0639\u0628\u0627\u064A\u0627\u062A \u0645\u0644\u0648\u0646\u0629":13,\u0637\u0631\u062D:14,\u0646\u0642\u0627\u0628\u0627\u062A:15};try{let s=await h.getCategoriesFromRedis();if(!Array.isArray(s))throw new Error("Categories data is not an array");let r=s.map(i=>({slug:i.name,name:i.name,filter:i.name,hasSubcats:!1,count:i.count||0,ids:i.ids||(i.id?[i.id]:[])}));r=r.filter(i=>{if(i.ids.length>0){let o=Number(i.ids[0]);return e.hasOwnProperty(o)}return!1}).map(i=>{let o=Number(i.ids[0]);return{...i,name:e[o].name,slug:e[o].name.toLowerCase().replace(/\s+/g,"-"),url:e[o].url,ids:i.ids}}),r.sort((i,o)=>{let d=t[i.name]||999,a=t[o.name]||999;return d-a}),r.unshift({...this.state.trendingCategory}),this.state.categories=r}catch(s){throw this.state.categories=[{...this.state.trendingCategory}],s}finally{this.categoriesLoading=!1}}createTemplate(){return this.categoriesLoading?`
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
        `}async initializeCategorySections(){try{let e=this.state.categories.map(i=>i.slug==="trending-now"?h.getGlobalProducts(0,this.state.productsPerPage).then(o=>({slug:i.slug,ids:o.objectIDs||[]})).catch(o=>({slug:i.slug,ids:[],error:o})):i.ids&&i.ids.length>0?this.fetchRegularCategory(i).then(o=>({slug:i.slug,ids:o||[]})).catch(o=>({slug:i.slug,ids:[],error:o})):Promise.resolve({slug:i.slug,ids:[]})),s=(await Promise.all(e)).reduce((i,o)=>(i[o.slug]=o.ids,i),{});this.seenProductIds.clear();let r={};for(let i of this.state.categories){let o=s[i.slug]||[],d=[];for(let a of o)if(!this.seenProductIds.has(a)&&(this.seenProductIds.add(a),d.push(a),d.length>=6))break;r[i.slug]=d}this.renderProductSliders(r)}catch(e){this.handleInitError(e)}}async fetchRegularCategory(e){let t=e.ids.map(s=>h.getCategoryPageById(s,0,this.state.productsPerPage).catch(r=>({objectIDs:[]})));try{return(await Promise.all(t)).flatMap(r=>r&&r.objectIDs?r.objectIDs:[])}catch{return[]}}renderProductSliders(e){this.state.categories.forEach(t=>{let s=t.slug,r=e[s]||[],i=this.querySelector(`#products-${s}`);if(i)if(i.innerHTML="",r.length>0){let o=document.createElement("salla-products-slider");o.setAttribute("source","selected"),o.setAttribute("source-value",JSON.stringify(r)),o.setAttribute("limit",String(r.length)),o.setAttribute("slider-id",`slider-${s}`),o.setAttribute("block-title"," "),o.setAttribute("arrows","true"),o.setAttribute("rtl","true"),i.appendChild(o),setTimeout(()=>{o.querySelectorAll(".s-product-card-content-sub").forEach(a=>{a.children.length>1&&(a.style.display="flex",a.style.alignItems="center",a.style.justifyContent="space-between",a.style.flexWrap="nowrap",a.style.width="100%",a.style.overflow="visible")})},500)}else i.innerHTML='<div style="text-align: center; padding: 1rem;">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0639\u0631\u0636\u0647\u0627 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0629.</div>'})}handleInitError(e){this.innerHTML=`
            <div class="category-filter">
                <div class="error-message" style="color: #e53e3e; text-align: center; padding: 2rem; margin-top: 2rem;">
                    \u0639\u0630\u0631\u0627\u064B\u060C \u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0641\u0626\u0627\u062A. \u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0635\u0641\u062D\u0629.
                    ${e?"<br><small>Error details logged.</small>":""}
                </div>
            </div>
        `}};customElements.get("mahaba-category-products")||customElements.define("mahaba-category-products",q);var T=class{constructor(){this.initialized=!1,this.productId=null,this.recentlyViewedKey="recently_viewed_products",this.maxRecentProducts=15,this.recentlyViewedClass="algolia-recently-viewed"}initialize(){if(!this.isProductPage())return;let e=this.getProductId();if(!e||this.initialized&&this.productId===e)return;this.productId=e,this.initialized=!0,this.addToRecentlyViewed(this.productId);let t=()=>{this.loadRecommendations(),this.loadRecentlyViewed()};document.readyState==="complete"||document.readyState==="interactive"?t():document.addEventListener("DOMContentLoaded",t)}loadRecommendations(){let e=document.querySelector('salla-products-slider[source="related"]');e?this.replaceRelatedProducts(e):this.waitForElement('salla-products-slider[source="related"]',t=>{this.replaceRelatedProducts(t)})}loadRecentlyViewed(){let e=this.getRecentlyViewed();if(!e.length)return;let t=e.map(d=>parseInt(d,10)).filter(d=>d&&!isNaN(d)&&d!==parseInt(this.productId,10));if(!t.length)return;this.removeExistingRecentlyViewed();let s=document.createElement("div");s.className="mt-8 s-products-slider-container",s.classList.add(this.recentlyViewedClass);let r=document.createElement("h2");r.className="section-title mb-5 font-bold text-xl",r.textContent="\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0629 \u0645\u0624\u062E\u0631\u0627\u064B",s.appendChild(r);let i=document.createElement("salla-products-slider");i.setAttribute("source","selected"),i.setAttribute("source-value",JSON.stringify(t)),i.setAttribute("autoplay","false"),i.setAttribute("class","product-recommendations-slider");let o=document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"]');i.setAttribute("display-style",o?.getAttribute("display-style")||"normal"),s.appendChild(i),this.insertRecentlyViewedSection(s,o),window.salla?.event?.dispatch("twilight::mutation"),this.setupStockFilter(i,t)}insertRecentlyViewedSection(e,t){let s=document.querySelector(".product-details, .product-entry, #product-entry");if(s&&s.parentNode)return s.parentNode.insertBefore(e,s.nextSibling),!0;if(t){let i=t.closest(".s-products-slider-container");if(i&&i.parentNode)return i.parentNode.insertBefore(e,i.nextSibling),!0;if(t.parentNode)return t.parentNode.insertBefore(e,t.nextSibling),!0}let r=document.querySelector("main, .s-product-page-content, #content, .s-product-page");return r?(r.appendChild(e),!0):(document.body.appendChild(e),!0)}addToRecentlyViewed(e){if(e)try{let t=parseInt(e,10);if(isNaN(t))return;let s=this.getRecentlyViewed();s=s.map(r=>parseInt(r,10)).filter(r=>!isNaN(r)),s=s.filter(r=>r!==t),s.unshift(t),s.length>this.maxRecentProducts&&(s=s.slice(0,this.maxRecentProducts)),sessionStorage.setItem(this.recentlyViewedKey,JSON.stringify(s))}catch{}}removeExistingRecentlyViewed(){document.querySelectorAll(`.${this.recentlyViewedClass}`).forEach(e=>e.remove())}getRecentlyViewed(){try{let e=sessionStorage.getItem(this.recentlyViewedKey);return e?JSON.parse(e):[]}catch{return[]}}isProductPage(){return!!document.querySelector('.product-form input[name="id"], [id^="product-"], .sidebar .details-slider')}getProductId(){let e=document.querySelector('.product-form input[name="id"]');if(e?.value){let o=parseInt(e.value,10);if(!isNaN(o))return o}let t=window.salla?.product?.id;if(t){let o=parseInt(t,10);if(!isNaN(o))return o}let s=document.querySelector(".product-entry, #product-entry, .product-details");if(s){let o=s.matches('[id^="product-"]')?s:s.querySelector('[id^="product-"]');if(o&&!o.closest("salla-products-slider")){let d=o.id.replace("product-",""),a=parseInt(d,10);if(!isNaN(a))return a}}let r=document.querySelector('[id^="product-"]');if(r&&!r.closest("salla-products-slider")){let o=r.id.replace("product-",""),d=parseInt(o,10);if(!isNaN(d))return d}let i=window.location.pathname.match(/\/p(\d+)/);if(i?.[1]){let o=parseInt(i[1],10);if(!isNaN(o))return o}return null}async replaceRelatedProducts(e){try{let t=this.productId,s=await h.getRecommendations(t);if(t!==this.productId){console.log("[Bundle Recommendations] Product changed during fetch, aborting");return}if(!s?.length)return;let r=s.map(o=>parseInt(o,10)).filter(o=>o&&!isNaN(o));if(!r.length)return;let i=document.createElement("salla-products-slider");if(Array.from(e.attributes).forEach(o=>{o.name!=="source-value"&&i.setAttribute(o.name,o.value)}),i.setAttribute("source","selected"),i.setAttribute("source-value",JSON.stringify(r)),i.setAttribute("class","product-recommendations-slider"),e.parentNode.replaceChild(i,e),!document.getElementById("product-recommendations-styles")){let o=document.createElement("style");o.id="product-recommendations-styles",o.textContent=`
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
                `,document.head.appendChild(o)}window.salla?.event?.dispatch("twilight::mutation"),this.setupStockFilter(i)}catch{}}setupStockFilter(e){let t=s=>{e.contains(s.target)&&(window.salla?.event?.off("salla-products-slider::products.fetched",t),setTimeout(()=>{let r=e.querySelectorAll(".s-product-card-entry");if(!r.length)return;let i=0,o=15;r.forEach(d=>{d.classList.contains("s-product-card-out-of-stock")||i>=o?d.style.display="none":i++})},200))};window.salla?.event?.on("salla-products-slider::products.fetched",t)}reset(){this.initialized=!1,this.productId=null,this.removeExistingRecentlyViewed()}waitForElement(e,t){let s=document.querySelector(e);if(s){t(s);return}let r=new MutationObserver(()=>{let i=document.querySelector(e);i&&(r.disconnect(),t(i))});r.observe(document.body,{childList:!0,subtree:!0})}},U=new T,g=U;var v=!1,w=0,N=2;function A(){if(console.log(`[PR Init] Attempt ${w+1}/${N}`),v)return;if(w++,w>N){console.warn("[PR Init] Max attempts reached");return}let n=document.querySelector('salla-products-list[source="product.index"], salla-products-list[source="categories"]');if(console.log("[PR Init] Category list found:",!!n),n){let t=n.getAttribute("source-value");if(t){console.log("[PR Init] \u2705 Creating ranking for category:",t),B("category",t),v=!0;return}}let e=document.querySelector('salla-products-list[source="product.index.tag"], salla-products-list[source^="tags."]');if(e){let t=e.getAttribute("source-value");if(t){console.log("[PR Init] \u2705 Creating ranking for tag:",t),B("tag",t),v=!0;return}}w<N&&(console.log("[PR Init] Retrying in 800ms..."),setTimeout(A,800))}function B(n,e){if(document.querySelector(`product-ranking[${n}-id="${e}"]`))return;let t=document.createElement("product-ranking");t.setAttribute(`${n}-id`,e),document.body.appendChild(t)}document.addEventListener("salla::page::changed",()=>{v=!1,w=0,document.querySelectorAll("product-ranking").forEach(n=>n.remove()),setTimeout(A,100)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",A):(A(),document.addEventListener("salla::ready",()=>{v||setTimeout(A,100)}));var X="[YouTube Opt-In]",u=(...n)=>console.log(X,...n),E=/\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i,z=!1;function F(){if(z||typeof document>"u")return;let n=document.createElement("style");n.id="youtube-placeholder-styles",n.textContent=`
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
  `,document.head.appendChild(n),z=!0}function I(n){if(!n)return"";let e=R(n);return e?`https://www.youtube.com/embed/${e}`:n.split("?")[0]}function R(n){if(!n)return null;let e=[/youtube\.com\/embed\/([^?&/]+)/,/youtube-nocookie\.com\/embed\/([^?&/]+)/,/youtube\.com\/v\/([^?&/]+)/,/youtube\.com\/watch\?v=([^&]+)/,/youtu\.be\/([^?&/]+)/,/youtube\.com\/shorts\/([^?&/]+)/];for(let t of e){let s=n.match(t);if(s&&s[1])return s[1]}return null}function S(n,e={}){F();let t=document.createElement("button");t.type="button",t.className="yt-placeholder",t.setAttribute("data-yt-src",n),t.setAttribute("aria-label","Play YouTube video");let s=e.videoId||R(n),i=e.thumbnailUrl||(s?`https://i.ytimg.com/vi/${s}/hqdefault.jpg`:null);if(i){let c=document.createElement("img");c.className="yt-placeholder__thumb",c.alt=e.thumbnailAlt||"Video thumbnail",c.loading="lazy",c.decoding="async",c.setAttribute("data-src",i),t.dataset.ytThumbSrc=i,t.appendChild(c)}let o=document.createElement("span");o.className="yt-placeholder__overlay";let d=document.createElement("span");d.className="yt-placeholder__icon",d.setAttribute("aria-hidden","true"),o.appendChild(d);let a=document.createElement("span");return a.className="yt-placeholder__label",a.textContent="\u0645\u0634\u0627\u0647\u062F\u0629 \u0641\u064A\u062F\u064A\u0648 \u0627\u0644\u0645\u0646\u062A\u062C",o.appendChild(a),t.appendChild(o),t}var D=null;function y(n=document){if(!n)return;[...n.querySelectorAll("iframe"),...n.querySelectorAll("embed"),...n.querySelectorAll("object")].forEach(t=>{let s=t.src||t.getAttribute("src")||t.data||t.getAttribute("data");if(!s||!E.test(s))return;if("srcdoc"in t&&t.removeAttribute("srcdoc"),"src"in t){try{t.src="about:blank"}catch{}t.removeAttribute("src")}"data"in t&&t.removeAttribute("data");let r=S(I(s));t.width&&(r.style.width=t.width),t.height&&(r.style.height=t.height),t.style&&t.style.width&&(r.style.width=t.style.width),t.style&&t.style.height&&(r.style.height=t.style.height),r.addEventListener("click",x),r.setAttribute("data-click-bound","true"),C(r),t.parentNode&&t.parentNode.replaceChild(r,t)})}function j(n){let e=n.querySelector(".yt-placeholder__thumb");if(!e)return;let t=e.dataset.src;t&&(e.src=t,e.removeAttribute("data-src"),n.dataset.thumbLoaded="true")}function Y(){D||typeof IntersectionObserver>"u"||(D=new IntersectionObserver(n=>{n.forEach(e=>{e.isIntersecting&&(j(e.target),D.unobserve(e.target))})},{rootMargin:"200px 0px"}))}function C(n){let e=n.querySelector(".yt-placeholder__thumb");if(e&&n.dataset.thumbLoaded!=="true"){if(!e.dataset.src){n.dataset.thumbLoaded="true";return}if(typeof IntersectionObserver>"u"){j(n);return}Y(),D.observe(n)}}function O(n){if(!n)return;u("Sanitizing fragment",n);let e=n.querySelectorAll("iframe"),t=n.querySelectorAll("embed"),s=n.querySelectorAll("object");[...e,...t,...s].forEach(i=>{let o=i.src||i.data||i.getAttribute("src")||i.getAttribute("data");if(o&&E.test(o)){let d=R(o),a=I(o),c=i.getAttribute("data-yt-thumb")||i.dataset?.ytThumb;u("Replacing YouTube embed with placeholder",{videoUrl:a,element:i});let l=S(a,{videoId:d,thumbnailUrl:c});i.width&&(l.style.width=i.width),i.height&&(l.style.height=i.height),i.style.width&&(l.style.width=i.style.width),i.style.height&&(l.style.height=i.style.height),i.parentNode.replaceChild(l,i)}})}function W(n){if(!n||typeof n!="string")return n;u("Sanitizing HTML string");let t=new DOMParser().parseFromString(n,"text/html");return O(t.body),t.body.innerHTML}function x(n){let e=n.currentTarget,t=e.getAttribute("data-yt-src"),s=I(t);if(!s)return;u("Placeholder clicked, loading iframe",{videoUrl:s});let r=document.createElement("iframe"),i=`${s}${s.includes("?")?"&":"?"}autoplay=1&rel=0`;r.src=i,r.width=e.style.width||"100%",r.height=e.style.height||"100%",r.title="YouTube video",r.frameBorder="0",r.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",r.allowFullscreen=!0,r.style.aspectRatio="16/9",r.dataset.ytOptIn="true",e.parentNode.replaceChild(r,e),r.focus()}function f(n=document){u("Initializing YouTube opt-in on root",n===document?"document":n),y(n),n.querySelectorAll("[data-yt-template]").forEach(r=>{if(r.hasAttribute("data-yt-processed"))return;r.setAttribute("data-yt-processed","true"),u("Processing template host",r);let i=r.getAttribute("data-yt-template"),o=document.getElementById(i);if(!o)return;u("Found template for host",i);let d=o.content.cloneNode(!0);O(d),r.appendChild(d)}),n.querySelectorAll(".yt-placeholder[data-yt-src]").forEach(r=>{if(!r.querySelector(".yt-placeholder__icon")&&r.tagName==="DIV"){u("Upgrading static placeholder div to button",r);let i=r.getAttribute("data-yt-src"),o=r.getAttribute("data-yt-thumb")||r.dataset?.ytThumb,d=S(i,{thumbnailUrl:o});d.className=r.className,Array.from(r.attributes).forEach(a=>{["class","data-yt-src","data-yt-thumb"].includes(a.name)||d.setAttribute(a.name,a.value)}),o&&d.setAttribute("data-yt-thumb",o),r.parentNode.replaceChild(d,r)}}),n.querySelectorAll("button.yt-placeholder[data-yt-src]").forEach(r=>{r.hasAttribute("data-click-bound")||(r.addEventListener("click",x),r.setAttribute("data-click-bound","true"),u("Bound click handler to placeholder",r)),C(r)})}function G(){u("Setting up dynamic handlers"),window.salla&&window.salla.event&&(window.salla.event.on("salla-products-slider::products.fetched",s=>{u("Event: salla-products-slider::products.fetched",s);let r=s?.container||document;y(r),f(r)}),window.salla.event.on("product::quickview.opened",s=>{u("Event: product::quickview.opened",s),y(document),f(document)}),window.salla.event.on("product::quickview.response",s=>{u("Event: product::quickview.response",s),s&&s.response&&s.response.html&&(u("Sanitizing quickview HTML response before render"),s.response.html=W(s.response.html)),y(document),f(document)}));let n=document.getElementById("btn-show-more");n&&n.addEventListener("click",()=>{u("Read more button clicked");let s=document.getElementById("more-content");s&&(y(s),f(s))});let e=new MutationObserver(s=>{s.forEach(r=>{u("Mutation observed",r),r.addedNodes.forEach(i=>{if(i.nodeType!==1)return;i.classList&&i.classList.contains("product-description-content")&&(u("New product-description-content detected, initializing",i),f(i));let o=[];i.tagName==="IFRAME"?o.push(i):i.querySelectorAll&&o.push(...i.querySelectorAll("iframe")),o.forEach(d=>{if(d.dataset&&d.dataset.ytOptIn==="true"){u("Observed opt-in iframe, skipping neutralization",d);return}let a=d.src||d.getAttribute("src");if(a&&E.test(a)){u("Stray iframe detected, neutralizing",d),d.removeAttribute("src"),d.removeAttribute("srcdoc"),d.src="about:blank";let c=I(a),l=S(c);l.addEventListener("click",x),l.setAttribute("data-click-bound","true"),u("Replacing stray iframe with placeholder",{videoUrl:c,iframe:d}),d.parentNode.replaceChild(l,d),C(l)}})})})});document.querySelectorAll(".product-description-content").forEach(s=>{e.observe(s,{childList:!0,subtree:!0})}),e.observe(document.body,{childList:!0,subtree:!0})}function J(){u("Scanning for existing YouTube iframes");let n=document.querySelectorAll("iframe"),e=0;n.forEach(t=>{let s=t.src||t.getAttribute("src");if(s&&E.test(s)){if(t.dataset.ytOptIn==="true"||t.hasAttribute("data-yt-processed"))return;u("Found existing YouTube iframe, replacing",{src:s,iframe:t}),t.src="about:blank";let r=I(s),i=S(r);t.width&&(i.style.width=t.width),t.height&&(i.style.height=t.height),t.style.width&&(i.style.width=t.style.width),t.style.height&&(i.style.height=t.style.height),i.addEventListener("click",x),i.setAttribute("data-click-bound","true"),t.parentNode.replaceChild(i,t),C(i),e++}}),u(`Replaced ${e} existing YouTube iframes`)}function _(){u("Initializing module"),y(document),F(),f(),J(),G()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",_):_();window.darlenaYoutubeOptIn=f;var K=()=>{if(document.getElementById("product-slider-styles"))return;let n=document.createElement("style");n.id="product-slider-styles",n.textContent=`
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
  `,document.head.appendChild(n)},M=class{constructor(){this.enhancedCards=new Set,this.cardInstances=new Map,this.init()}init(){K(),window.app?.status==="ready"?(this.setupEventListeners(),this.enhanceExistingCards()):document.addEventListener("theme::ready",()=>{this.setupEventListeners(),this.enhanceExistingCards()})}setupEventListeners(){document.addEventListener("salla-products-slider::products.fetched",e=>{console.log("[Product Card Enhancer] Products slider fetched"),setTimeout(()=>this.enhanceExistingCards(),100)}),document.addEventListener("salla-products-list::products.fetched",e=>{console.log("[Product Card Enhancer] Products list fetched"),setTimeout(()=>this.enhanceExistingCards(),100)}),document.addEventListener("salla::page::changed",()=>{console.log("[Product Card Enhancer] Page changed"),setTimeout(()=>this.enhanceExistingCards(),500)}),this.setupMutationObserver()}setupMutationObserver(){new MutationObserver(t=>{let s=!1;for(let r of t){if(r.addedNodes.length>0){for(let i of r.addedNodes)if(i.nodeType===1&&(i.classList?.contains("s-product-card-entry")||i.querySelector?.(".s-product-card-entry"))){s=!0;break}}if(s)break}s&&setTimeout(()=>this.enhanceExistingCards(),50)}).observe(document.body,{childList:!0,subtree:!0})}enhanceExistingCards(){let e=document.querySelectorAll(".s-product-card-entry");console.log(`[Product Card Enhancer] Found ${e.length} product cards`),e.forEach(t=>{let s=this.extractProductId(t);s&&!this.enhancedCards.has(s)&&this.enhanceCard(t,s)})}extractProductId(e){if(e.dataset.id)return e.dataset.id;if(e.id&&!isNaN(e.id))return e.id;let t=e.querySelector(".s-product-card-image a, .s-product-card-content-title a");if(t?.href){let r=t.href.match(/\/product\/[^\/]+\/(\d+)/);if(r)return r[1]}let s=e.getAttribute("product");if(s)try{let r=JSON.parse(s);if(r.id)return String(r.id)}catch{}return null}enhanceCard(e,t){console.log(`[Product Card Enhancer] Enhancing card for product ${t}`);let s=e.querySelector(".s-product-card-image");if(!s){console.warn(`[Product Card Enhancer] No image wrapper found for product ${t}`);return}let r=new $(e,t,s);this.cardInstances.set(t,r),this.enhancedCards.add(t),r.setupLazyInit()}},$=class{constructor(e,t,s){this.card=e,this.productId=t,this.imageWrapper=s,this.imageContainer=s.querySelector("a"),this.currentSlide=0,this.additionalImages=[],this.touchStartX=0,this.touchEndX=0,this.isSwiping=!1,this.isMouseDown=!1,this.sliderInitialized=!1,this.sliderId=`slider-${t}-${Date.now()}`,this.boundEventHandlers={}}setupLazyInit(){this.imageWrapper&&(this._observer=new IntersectionObserver(e=>{e.forEach(t=>{t.isIntersecting&&!this.sliderInitialized&&(this.sliderInitialized=!0,this.setupImageSlider(),setTimeout(()=>{this.fetchProductImages()},50),this._observer.unobserve(t.target))})},{rootMargin:"300px",threshold:.01}),this._observer.observe(this.imageWrapper))}setupImageSlider(){if(!this.imageContainer)return;let e=document.createElement("div");e.className="swipe-indicator",this.imageContainer.appendChild(e);let t=null,s=null,r=null,i=!1;this.boundEventHandlers.touchstart=a=>{t=a.touches[0].clientX,s=a.touches[0].clientY,r=Date.now(),i=!1},this.boundEventHandlers.touchmove=a=>{if(!t)return;let c=a.touches[0].clientX-t,l=a.touches[0].clientY-s;Math.abs(c)>Math.abs(l)&&Math.abs(c)>10&&(i=!0,this.isSwiping=!0,e.classList.toggle("right",c>0),e.style.opacity=Math.min(Math.abs(c)/100,.5),a.preventDefault())},this.boundEventHandlers.touchend=a=>{if(!t||!i){t=s=null,this.isSwiping=!1,e.style.opacity=0;return}if(this.isSwiping){let l=a.changedTouches[0].clientX-t,p=Date.now()-r<300?30:50;Math.abs(l)>=p&&(l>0?(this.prevSlide(),this.triggerHapticFeedback("medium")):(this.nextSlide(),this.triggerHapticFeedback("medium"))),a.preventDefault(),a.stopPropagation()}e.style.opacity=0,t=s=null,this.isSwiping=!1},this.imageContainer.addEventListener("touchstart",this.boundEventHandlers.touchstart,{passive:!0}),this.imageContainer.addEventListener("touchmove",this.boundEventHandlers.touchmove,{passive:!1}),this.imageContainer.addEventListener("touchend",this.boundEventHandlers.touchend,{passive:!1}),this.boundEventHandlers.mousedown=a=>{this.isMouseDown=!0,t=a.clientX,s=a.clientY,r=Date.now(),i=!1,a.preventDefault(),a.stopPropagation()},this.boundEventHandlers.mousemove=a=>{if(!this.isMouseDown||!t)return;let c=a.clientX-t;Math.abs(c)>10&&(i=!0,this.isSwiping=!0,e.classList.toggle("right",c>0),e.style.opacity=Math.min(Math.abs(c)/100,.5)),this.isSwiping&&(a.preventDefault(),a.stopPropagation())},this.boundEventHandlers.mouseup=a=>{if(this.isMouseDown){if(i&&this.isSwiping){let l=a.clientX-t,p=Date.now()-r<300?30:50;Math.abs(l)>=p&&(l>0?this.prevSlide():this.nextSlide()),a.preventDefault(),a.stopPropagation()}e.style.opacity=0,this.isMouseDown=!1,this.isSwiping=!1,t=s=null}},this.imageContainer.addEventListener("mousedown",this.boundEventHandlers.mousedown),this.imageContainer.addEventListener("mousemove",this.boundEventHandlers.mousemove),window.addEventListener("mouseup",this.boundEventHandlers.mouseup);let o=document.createElement("div");o.className="product-slider-dots",o.dataset.sliderId=this.sliderId,o.dataset.productId=this.productId;let d=document.createElement("span");d.className="product-slider-dot active",d.dataset.sliderId=this.sliderId,d.dataset.productId=this.productId,d.dataset.index="0",d.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),this.changeSlide(0),this.triggerHapticFeedback("light")}),o.appendChild(d);for(let a=0;a<2;a++){let c=document.createElement("span");c.className="product-slider-dot",c.dataset.sliderId=this.sliderId,c.dataset.productId=this.productId,c.dataset.index=String(a+1),c.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),this.changeSlide(a+1),this.triggerHapticFeedback("light")}),o.appendChild(c)}this.imageWrapper.appendChild(o)}fetchProductImages(){if(!this.productId)return;let e=`https://productstoredis-163858290861.me-central2.run.app/product-images/${this.productId}`;fetch(e,{timeout:5e3}).then(t=>t.json()).then(t=>this.processImageResponse(t)).catch(t=>{console.warn(`[Product Card Enhancer] Failed to fetch images for product ${this.productId}:`,t);let s=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);s&&(s.style.display="none")})}processImageResponse(e){if(!e?.images||!Array.isArray(e.images)){let r=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);r&&(r.style.display="none");return}let t=e.images.filter(r=>r&&r.url).sort((r,i)=>(r.sort||0)-(i.sort||0)).slice(0,2).map(r=>({url:r.url,alt:r.alt}));if(t.length===0){let r=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);r&&(r.style.display="none");return}this.additionalImages=t;let s=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);s&&(s.style.display="flex"),this.preloadAllImages()}preloadAllImages(){this.additionalImages&&this.additionalImages.length>0&&(this.addImageToSlider(this.additionalImages[0],1),this.additionalImages.length>1&&this.addImageToSlider(this.additionalImages[1],2))}addImageToSlider(e,t){if(!e?.url||!this.imageContainer||this.imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${t}"]`))return;let r=document.createElement("img");r.className="product-slider-image",r.src=e.url,r.alt=e.alt||"Product image",r.dataset.sliderId=this.sliderId,r.dataset.productId=this.productId,r.dataset.index=String(t),r.onload=()=>{let i=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${t}"]`);i&&i.classList.add("loaded")},r.onerror=()=>{r.remove();let i=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${t}"]`);i&&(i.remove(),this.checkDotsVisibility())},this.imageContainer.appendChild(r)}checkDotsVisibility(){let e=this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);if(e){let t=e.querySelectorAll(".product-slider-dot");e.style.display=t.length<=1?"none":"flex"}}changeSlide(e){this.additionalImages&&e>0&&this.additionalImages[e-1]&&this.addImageToSlider(this.additionalImages[e-1],e),this.currentSlide=e;let t=this.imageContainer.querySelector('img.lazy, img[loading="lazy"], img:first-child:not(.product-slider-image)'),s=this.imageContainer.querySelectorAll(`.product-slider-image[data-slider-id="${this.sliderId}"]`);this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).forEach(o=>o.classList.remove("active"));let i=this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${e}"]`);if(i&&i.classList.add("active"),e===0)t&&(t.style.visibility="visible",t.style.opacity="1",t.style.zIndex="10"),s.forEach(o=>o.classList.remove("active"));else{t&&(t.style.visibility="hidden",t.style.opacity="0",t.style.zIndex="5"),s.forEach(d=>d.classList.remove("active"));let o=this.imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${e}"]`);o?o.classList.add("active"):t&&(t.style.visibility="visible",t.style.opacity="1",t.style.zIndex="10")}}prevSlide(){let e=this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length,t=(this.currentSlide-1+e)%e;this.changeSlide(t)}nextSlide(){let e=this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length,t=(this.currentSlide+1)%e;this.changeSlide(t)}triggerHapticFeedback(e){try{if(window.navigator&&window.navigator.vibrate)switch(e){case"light":window.navigator.vibrate(10);break;case"medium":window.navigator.vibrate(25);break;case"strong":window.navigator.vibrate([10,20,30]);break}}catch{}}},pt=new M;window.productRecommendations=g;window.redisService=h;var Q=n=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n();function Z(){if(!document.body.classList.contains("index")){console.log("[Algolia Bundle] Not on homepage, skipping category products injection");return}let n=".app-inner",e="mahaba-category-products";function t(){let r=document.querySelector(n);if(r&&!r.querySelector(e))try{console.log(`[Algolia Bundle] Found ${n}, injecting ${e}...`);let i=document.createElement(e),o=document.querySelector(".store-footer");return o?r.insertBefore(i,o):r.appendChild(i),console.log("\u2705 [Algolia Bundle] Homepage category component injected successfully"),!0}catch(i){return console.error("[Algolia Bundle] Error during injection:",i),!0}return!1}if(t())return;console.log(`[Algolia Bundle] ${n} not found, waiting for async load...`),new MutationObserver((r,i)=>{r.some(d=>d.addedNodes.length>0)&&t()&&i.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}function tt(){if(document.getElementById("cart-addons-slider-styles"))return;let n=document.createElement("style");n.id="cart-addons-slider-styles",n.textContent=`
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
  `,document.head.appendChild(n)}function H(){tt();let n=()=>{let t=document.querySelector("#cart-submit");if(!t)return!1;let s=t.closest(".cart-submit-wrap")||t.parentElement,r=s?.parentElement||s;if(!r)return!1;if(r.querySelector("cart-addons-slider"))return!0;let i=document.createElement("cart-addons-slider");return i.className="cart-addons-wrapper",s&&r?r.insertBefore(i,s.nextSibling):r.appendChild(i),console.log("[Algolia Bundle] Injected cart addons slider"),!0};if(document.querySelector("cart-addons-slider")||n())return;new MutationObserver((t,s)=>{n()&&s.disconnect()}).observe(document.body,{childList:!0,subtree:!0})}Q(()=>{Z(),document.querySelector('[id^="product-"]')&&setTimeout(()=>{g.initialize(),console.log("\u2705 [Algolia Bundle] Product recommendations initialized")},3e3),(document.querySelector('form[id^="item-"]')||document.querySelector("#cart-submit"))&&setTimeout(H,500),console.log("\u2705 [Algolia Bundle] Loaded successfully")});document.addEventListener("salla::page::changed",()=>{g.reset(),setTimeout(()=>{g.initialize()},1e3),setTimeout(H,500)});document.addEventListener("theme::ready",()=>{if(!document.querySelector('[id^="product-"]'))return;let n=g.getProductId();n&&g.productId&&n===g.productId||n&&(console.log("[Algolia Bundle] New product detected via theme::ready, re-initializing"),g.reset(),setTimeout(()=>{g.initialize()},1e3))});})();
