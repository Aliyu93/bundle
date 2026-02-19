 (function() {
                  // Hotfix: Silence YouTube debug spam from web component hydration
                  // Filters out [YouTube Opt-In] console logs that spam during Salla component hydration
                  const _log = console.log;
                  console.log = function() {
                    if (arguments[0] === '[YouTube Opt-In]') return;
                    _log.apply(console, arguments);
                  };
                  // End hotfix

                  // Google Tag Manager
                  // Disable Ask Lina feature
                  window.darlenaFeaturesEnabled = false;
                     (function(w,d,s,l,i){
                         w[l]=w[l]||[];
                 
                         w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                         var f=d.getElementsByTagName(s)[0],
                             j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
                         j.async=true;
                         j.src='https://sscgtm.darlena.com/sdarlena.js?id='+i+dl;
                         f.parentNode.insertBefore(j,f);
                     })(window,document,'script','dataLayer','GTM-MMCNVPC');
                     // End Google Tag Manager

                   var hdrContactsWhats = document.querySelector('header salla-contacts');
                   var hdrContactsMail = document.querySelector('header salla-contacts a.s-contacts-topnav-link');
                   if (hdrContactsWhats) {
                     hdrContactsWhats.innerHTML = `<span class="s-contacts-item">
                     <span class="s-contacts-icon">
                     <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                     <title>whatsapp2</title>
                     <path d="M27.281 4.65c-2.994-3-6.975-4.65-11.219-4.65-8.738 0-15.85 7.112-15.85 15.856 0 2.794 0.731 5.525 2.119 7.925l-2.25 8.219 8.406-2.206c2.319 1.262 4.925 1.931 7.575 1.931h0.006c0 0 0 0 0 0 8.738 0 15.856-7.113 15.856-15.856 0-4.238-1.65-8.219-4.644-11.219zM16.069 29.050v0c-2.369 0-4.688-0.637-6.713-1.837l-0.481-0.288-4.987 1.306 1.331-4.863-0.313-0.5c-1.325-2.094-2.019-4.519-2.019-7.012 0-7.269 5.912-13.181 13.188-13.181 3.519 0 6.831 1.375 9.319 3.862 2.488 2.494 3.856 5.8 3.856 9.325-0.006 7.275-5.919 13.188-13.181 13.188zM23.294 19.175c-0.394-0.2-2.344-1.156-2.706-1.288s-0.625-0.2-0.894 0.2c-0.262 0.394-1.025 1.288-1.256 1.556-0.231 0.262-0.462 0.3-0.856 0.1s-1.675-0.619-3.188-1.969c-1.175-1.050-1.975-2.35-2.206-2.744s-0.025-0.613 0.175-0.806c0.181-0.175 0.394-0.463 0.594-0.694s0.262-0.394 0.394-0.662c0.131-0.262 0.069-0.494-0.031-0.694s-0.894-2.15-1.219-2.944c-0.319-0.775-0.65-0.669-0.894-0.681-0.231-0.012-0.494-0.012-0.756-0.012s-0.694 0.1-1.056 0.494c-0.363 0.394-1.387 1.356-1.387 3.306s1.419 3.831 1.619 4.1c0.2 0.262 2.794 4.269 6.769 5.981 0.944 0.406 1.681 0.65 2.256 0.837 0.95 0.3 1.813 0.256 2.494 0.156 0.762-0.113 2.344-0.956 2.675-1.881s0.331-1.719 0.231-1.881c-0.094-0.175-0.356-0.275-0.756-0.475z"></path>
                     </svg>
                     </span>
                     <span class="unicode">+966597818555</span>
                     </span>`;
                   }

                     var bottomBar = document.createElement("div");
                     bottomBar.className = "footerBar";
                     bottomBar.innerHTML = "<div class='firstSec'><h3>شحن مجانى للطلبات اكثر من 500</h3></div><div class='secondSec'><h3>التوصيل خلال 1-4 ايام</h3></div>";
                     var storeFooter = document.querySelector('.store-footer');
                     if (storeFooter) storeFooter.append(bottomBar);
                 
                     if (window.matchMedia("(max-width: 1025px)").matches) {
                         var categoryNav = document.createElement("div");
                       categoryNav.className = "categoryNav";
                       categoryNav.innerHTML = `<div class='categoryNavContainer'>
                     <ul><li class='categoryNavLink ramadanCategory'><a href='https://darlena.com/%D8%B1%D9%85%D8%B6%D8%A7%D9%86-2026/c2072839792'><span>🌙 رمضان 2026</span></a></li>
                     <li class='categoryNavLink hasSub'>
                     <a href='javascript:void(0);'>
                     <span>جميع العبايات</span>
                     <ul class="categoryNavSubmenu">
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/XzpKgd"><span>جميع العبايات</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/zoQPzd"><span>عبايات شتوية</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%83%D9%84%D9%88%D8%B4-%D9%85%D8%B7%D8%B1%D8%B2%D8%A9/c1028157307"><span>عبايات كلوش مطرزة</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/oZKwmb"><span>عبايات سادة</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/vYDyGa"><span>عبايات كلوش</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/WGqpzW"><span>عبايات كويتية</span></a></li> 
                            <li class="submenuItem"><a target="_self" href="https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-199-%D8%B1%D9%8A%D8%A7%D9%84/c431036206"><span>عبايات ب١٩٩ وآقل</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/PDpoAN"><span>عبايات بجيوب</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/BpYRjV"><span>عبايات فضفاضة</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/GqVEbE"><span>عبايات مطرزة</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/wADgKx"><span>عبايات رأس</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/KRVeYj"><span>عبايات متعددة القطع</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/qGOPgv"><span>فستان عباية</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/ngvoQe"><span>عبايات عملية</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/xvxPqj"><span>خمارات</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/vAWPnn"><span>عبايات مناسبات</span></a></li>
                     
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/EXVnlG"><span>عبايات ملونة</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/category/gypeQV"><span>كم ملون</span></a></li>
                     <li class="submenuItem"><a target="_self" href="https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D9%84%D9%8A%D8%B2%D8%B1/c2119825976"><span>عبايات بليزر</span></a></li>
                     </ul>
                     </a>
                     </li>
                     <li class='categoryNavLink'><a href='https://darlena.com/category/ABVglq'><span>جلابيات</span></a></li>
                     <li class='categoryNavLink'><a href='https://darlena.com/category/ararYz'><span>جديدنا</span></a></li>
                     <li class='categoryNavLink'><a href='https://darlena.com/%D8%B4%D8%AA%D8%A7%D8%A1-2026/c270965526'><span>شتاء 2026</span></a></li>
                     <li class='categoryNavLink'><a href='https://darlena.com/category/RvGoDy'><span>مراييل المدرسة</span></a></li>
                     <li class='categoryNavLink'><a href='https://darlena.com/category/wANoxz'><span>نقاب</span></a></li>
                     <li class='categoryNavLink'><a href='https://darlena.com/category/lvyjQy'><span>فساتين</span></a></li>
                     <li class='categoryNavLink'><a href='https://darlena.com/category/zoQWnd'><span>طرح</span></a></li></ul></div>`;
                       var navInner = document.querySelector('header > #mainnav > .inner');
                       if (navInner) {
                         navInner.append(categoryNav);
                         const slideDown = element => element.style.height = `${element.scrollHeight}px`;
                         slideDown(categoryNav);
                       }
                     }
             
             
                     var discountCupon = document.createElement("div");
                   discountCupon.className = "discountCupon";
                   discountCupon.innerHTML = `<div class="main"><div class="content"><h2>كود</h2><h3>7%</h3></div><div class="cuponLogo"></div></div><div class="copy-button">
                   <input id="copyvalue" type="text" readonly value="Darlena" /><input type="button" id="copyDiscountCode" class="copybtn" value="نسخ"></input></div>`;
                     
                   /* ================== Home Page ==================== */
                   if (document.body.classList.contains('index')) {
                 
                         var features = document.querySelector('#best-offers-4-slider');
                         /*features.parentNode.insertBefore(discountCupon, features);*/
                 
                 /*document.getElementById("copyDiscountCode1").addEventListener("click", function() {
                              let copybtn1 = document.querySelector("#copyDiscountCode1.copybtn");
                              let copyInput1 = document.querySelector('#copyvalue1');
                              copyInput1.select();
                              document.execCommand("copy");
                              copybtn1.setAttribute('value','تم نسخ الكود');
                              copybtn1.classList.add("copybtnCopied");
                          });
                          document.getElementById("copyDiscountCode2").addEventListener("click", function() {
                              let copybtn2 = document.querySelector("#copyDiscountCode2.copybtn");
                              let copyInput2 = document.querySelector('#copyvalue2');
                              copyInput2.select();
                              document.execCommand("copy");
                              copybtn2.setAttribute('value','تم نسخ الكود');
                              copybtn2.classList.add("copybtnCopied");
                          });*/
             
                     };
                     
                     
                     /* ============== home & Product Single & cart =============== */
                     if (document.body.classList.contains('index') || document.body.classList.contains('product-single')) {
                   
                 /* ================== FAQ ==================== */
                         /*var faqHtml = `<section id="psFaq" class="s-block s-block--faqs" data-wow-delay="0.1s" style="background-color:#d2d0d0;"><div class="container">
                       <div class="faqs-list grid items-start grid-cols-1 md:grid-cols-2 gap-4"><div class="faq-container " data-wow-delay="0.1s">
                       <input class="hidden" type="checkbox" id="faq-121" name="faqs" value="121">
                       <div class="faqs-list__item bg-gray-100 da-bgg relative overflow-hidden rounded-md border-2 border-transparent">
                       <label class="block cursor-pointer p-6 pe-16 text-sm font-primary leading-6 transition" for="faq-121">كم من الوقت يستغرق توصيل طلبي؟
                       <i class="faq-item open-badge sicon-add absolute top-5 end-4 h-8 w-8 flex-center rounded-full bg-white da-bgm transition-colors duration-300"></i></label><div class="answer-container">
                       <div class="faq-answer max-h-0 -translate-y-2 overflow-y-auto px-6 leading-6 text-sm opacity-0 transition-all duration-300">
                       <p class="da-tm mb-6">يتم شحن المنتجات فور إتمامك طلب الشراء و يستغرق التوصيل داخل المملكة السعودية من يوم حتى خمس أيام (التوصيل للرياض خلال يوم فقط) و التوصيل لدول الخليج يستغرق من 5 - 10 أيام فقط</p>
                       </div></div></div></div><div class="faq-container " data-wow-delay="0.2s">
                       <input class="hidden" type="checkbox" id="faq-221" name="faqs" value="221">
                       <div class="faqs-list__item bg-gray-100 da-bgg relative overflow-hidden rounded-md border-2 border-transparent">
                       <label class="block cursor-pointer p-6 pe-16 text-sm font-primary leading-6 transition" for="faq-221">ما هي وسائل الدفع والتقسيط المتاحة؟
                       <i class="faq-item open-badge sicon-add absolute top-5 end-4 h-8 w-8 flex-center rounded-full bg-white da-bgm transition-colors duration-300"></i>
                       </label><div class="answer-container"><div class="faq-answer max-h-0 -translate-y-2 overflow-y-auto px-6 leading-6 text-sm opacity-0 transition-all duration-300">
                       <p class="da-tm mb-6">تتوفر طرق الدفع التالية : فيزا - مدى - بطاقة ائتمانية - تابي - تمارا - الدفع عند الاستلام – STC pay - Apple pay</p>
                       </div></div></div></div><div class="faq-container " data-wow-delay="0.3s"><input class="hidden" type="checkbox" id="faq-321" name="faqs" value="321">
                       <div class="faqs-list__item bg-gray-100 da-bgg relative overflow-hidden rounded-md border-2 border-transparent">
                       <label class="block cursor-pointer p-6 pe-16 text-sm font-primary leading-6 transition" for="faq-321">كيف يمكنني تحديد مقاساتي؟
                       <i class="faq-item open-badge sicon-add absolute top-5 end-4 h-8 w-8 flex-center rounded-full bg-white da-bgm transition-colors duration-300"></i>
                       </label><div class="answer-container"><div class="faq-answer max-h-0 -translate-y-2 overflow-y-auto px-6 leading-6 text-sm opacity-0 transition-all duration-300">
                       <p class="da-tm mb-6">في صفحة المنتج، اضغطي على زر "عرض دليل القياسات" لمعرفة كيفية تحديد مقاسك لهذا المنتج بكل سهولة ودقة</p>
                       </div></div></div></div><div class="faq-container " data-wow-delay="0.4s"><input class="hidden" type="checkbox" id="faq-421" name="faqs" value="421">
                       <div class="faqs-list__item bg-gray-100 da-bgg relative overflow-hidden rounded-md border-2 border-transparent">
                       <label class="block cursor-pointer p-6 pe-16 text-sm font-primary leading-6 transition" for="faq-421">هل يمكنني استبدال أو ارجاع الطلب؟
                       <i class="faq-item open-badge sicon-add absolute top-5 end-4 h-8 w-8 flex-center rounded-full bg-white da-bgm transition-colors duration-300"></i>
                       </label><div class="answer-container"><div class="faq-answer max-h-0 -translate-y-2 overflow-y-auto px-6 leading-6 text-sm opacity-0 transition-all duration-300">
                       <p class="da-tm mb-2">نعم يمكنك الاستبدال خلال 14 يوم من استلامك للطلب أو الارجاع خلال 7 أيام من استلامك للطلب. ويمكنك طلب الارجاع او الاستبدال الفوري بسهولة عبر التواصل مع فريق خدمة العملاء في الموقع أو مراسلتنا على الواتس 0597818555</p>
                       <a class="faq-link btn btn-primary mb-6 font-primary" href="https://darlena.com/redirect/pages/1810801451" aria-label="معرفة المزيد">
                       معرفة المزيد</a></div></div></div></div>
                       <div class="faq-container " data-wow-delay="0.5s"><input class="hidden" type="checkbox" id="faq-517" name="faqs" value="517">
                       <div class="faqs-list__item bg-gray-100 da-bgg relative overflow-hidden rounded-md border-2 border-transparent">
                       <label class="block cursor-pointer p-6 pe-16 text-sm font-primary leading-6 transition" for="faq-517">هل مع العبايه طرحه؟
                       <i class="faq-item open-badge sicon-add absolute top-5 end-4 h-8 w-8 flex-center rounded-full bg-white da-bgm transition-colors duration-300"></i>
                       </label><div class="answer-container"><div class="faq-answer max-h-0 -translate-y-2 overflow-y-auto px-6 leading-6 text-sm opacity-0 transition-all duration-300">
                       <p class="da-tm mb-6">نعم. جميع عبايات الكتف معها طرحة مجانا</p>
                       </div></div></div></div>
                       <div class="faq-container " data-wow-delay="0.6s"><input class="hidden" type="checkbox" id="faq-617" name="faqs" value="617">
                       <div class="faqs-list__item bg-gray-100 da-bgg relative overflow-hidden rounded-md border-2 border-transparent">
                       <label class="block cursor-pointer p-6 pe-16 text-sm font-primary leading-6 transition" for="faq-617">كيف اطلب؟
                       <i class="faq-item open-badge sicon-add absolute top-5 end-4 h-8 w-8 flex-center rounded-full bg-white da-bgm transition-colors duration-300"></i>
                       </label><div class="answer-container"><div class="faq-answer max-h-0 -translate-y-2 overflow-y-auto px-6 leading-6 text-sm opacity-0 transition-all duration-300">
                       <p class="da-tm mb-6">يمكنك الطلب عن طريق الموقع الالكتروني او التطبيق. او بامكانك التواصل معنا لانشاء طلبك عن طريق الواتس اب على 0597818555</p>
                       </div></div></div></div></div></div></section>`;
                         var faqSec = document.createElement("div");
                         faqSec.innerHTML = faqHtml;
                         var ftr = document.querySelector('footer');
                         ftr.parentNode.insertBefore(faqSec, ftr);*/
                   
                 /* ================ faq close ================= */
                         /*var faqCheckboxs = document.querySelectorAll(".faq-container > input[type=checkbox][name=faqs]");
                         faqCheckboxs.forEach(faqCheckbox => {
                          faqCheckbox.addEventListener('change', function handleClick(event) {
                            if (this.checked) {
                              for (var i = 0; i < faqCheckboxs.length; i++) {
                                faqCheckboxs[i].checked = false;
                              }
                              this.checked = true;
                            } else {
                            }
                          });
                        });*/
                   
                     }
                     
                 
                     /* ============== Product Single =============== */
                     if (document.body.classList.contains('product-single')) {
                       
                         var features = document.querySelector('form.form.product-form');
                         /*features.parentNode.insertBefore(discountCupon, features);*/
                         
                 /* ======= Tamara & Tabby Cards ======= */
                           var tabby_tamara_sec = document.createElement("div");
                           tabby_tamara_sec.className = "tabby_tamara";
                           tabby_tamara_sec.innerHTML = `<div id="tamaraWrapper"><img alt="Tamara" class="tamaraImg" height="28" src="https://drive.google.com/thumbnail?id=1MxXplMojGnilSIEg28jmtD2kICKe6hy5"></div>
                           <div id="tabbyWrapper"><img alt="Tabby" class="tabbyImg" height="28" src="https://drive.google.com/thumbnail?id=1g-kWl99UJogMv7THW6fhc2uj3v6F_GVJ"></div>`;
                           var skuNum = document.querySelector(".product-single .main-content .product__description + .flex.space-x-3 + .mb-4.flex.justify-between.bg-white.rounded-md.px-4.py-2");
                           if (features) {
                             features.parentNode.insertBefore(tabby_tamara_sec, features);
                           }
                           var prdPriceText = document.querySelector('.product-single .main-content div.flex.whitespace-nowrap.gap-4.items-center > div:not(.hidden) p, .product-single .main-content div.flex.whitespace-nowrap.gap-4.items-center > div:not(.hidden) h2');
                           if (prdPriceText) {
                             var prdPrice = prdPriceText.innerText.match(/\d+(?:\.\d+)?/g);
                             var payByOneTime = (Math.ceil(prdPrice)/4);
                             tabby_tamara_sec.append(
                                 Object.assign(document.createElement("STYLE"),{
                                     innerText : `.product-single .main-content .tabby_tamara:before {
                                     content: "ادفعي على 4 دفعات بدون فوائد بقيمة ` + payByOneTime + ` ريال سعودي" !important;
                                     }`
                                 })
                             );
                           }
                           /* ============== */
                          /*document.getElementById("copyDiscountCode").addEventListener("click", function() {
                              let copybtn1 = document.querySelector("#copyDiscountCode.copybtn");
                              let copyInput1 = document.querySelector('#copyvalue');
                              copyInput1.select();
                              document.execCommand("copy");
                              copybtn1.setAttribute('value','تم نسخ الكود');
                              copybtn1.classList.add("copybtnCopied");
                          });*/
                 
                         /* ============== select city ============== */
                         var skuSec = document.querySelector('.sku.details');
                           
                         let citiesDropdownList = '{ "citiesList" : [' +
                           '{ "cityName":"الرياض" , "deliverTime":"خلال 24 ساعة" },' +
                           '{ "cityName":"جدة" , "deliverTime":"خلال 1-3 أيام" },' +
                           '{ "cityName":"مكة المكرمة" , "deliverTime":"خلال 2-3 أيام" },' +
                           '{ "cityName":"المدينة المنورة" , "deliverTime":"خلال 1-3 أيام" },' +
                           '{ "cityName":"الدمام" , "deliverTime":"خلال 2-3 أيام" },' +
                           '{ "cityName":"الطائف" , "deliverTime":"خلال 2-3 أيام" },' +
                           '{ "cityName":"الاحساء" , "deliverTime":"خلال 2-3 أيام" },' +
                           '{ "cityName":"تبوك" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"الخبر" , "deliverTime":"خلال 2-3 أيام" },' +
                           '{ "cityName":"ابها" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"خميس مشيط" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"الجبيل" , "deliverTime":"خلال 2-3 أيام" },' +
                           '{ "cityName":"جازان" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"حائل" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"نجران" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"القطيف" , "deliverTime":"خلال 2-3 أيام" },' +
                           '{ "cityName":"بريدة" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"ابها المنهل" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ابو عريش" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الداير" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"اضم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"احد مسارحه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"احد رفيده" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العيص" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العارضة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"البدع" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"البشاير" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العيدابي" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"المدا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"المهد" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عمق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عقيق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الشقيق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"اطاولة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بدر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بدر الجنوب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الباحة" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"بلحمر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بللسمر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بلقرن" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بارق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بلجرشي" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"برك" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بيش" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بيشة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ضمد" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"درب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ظهران الجنوب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ضبا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"فرسان" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"قلوه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حجره" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حالة عمار" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حلي" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حقل" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حرجه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الحناكية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حبونا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"كرع" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"كربوس" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"خيبر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"خصاويه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ليث" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مهد الدهب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"المجاردة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مندق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مخواه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"محايل" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"المظيلف" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"نماص" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"نمره" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العلا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"القحمة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"القوز" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"القنفذة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مستوره" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"رابغ" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"طارق أملج" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"رجال المع" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سبت العلايا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"صبيا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سعد أل مالك" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سمكه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"صامطة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سراة عبيده" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"شرورة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"صبيخة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"طبلة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تندحة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تنوما" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تثليث" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تيماء" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ذبية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"طريب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"املج" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الواديين" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"وادي بن هشبل" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"وادي فرح" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الوجه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ينبع" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"ينبع البحر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ينبع النخيل" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"يوتما" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"قنا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بحر ابو سكينة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عقول" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حوية/طائف" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الهدى" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"المحاني" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عشيرة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الخرمة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الموية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تربه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"رانيا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مويه الجديدة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الجعرانه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الجموم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الشرايع" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الشميسي" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"وادي فاطمه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ولي العهد" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"النعيرية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الخفجي" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"قرية العليا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"صراره" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الموليجه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الجش" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بقيق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بقيق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"نبيه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تاروت" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عنك" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عواميه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الظهران" , "deliverTime":"خلال 2-3 أيام" },' +
                           '{ "cityName":"الهفوف" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"المبرز" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"قاره" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"جفر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العثمانيه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الدهليه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"خضريه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العيون" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"هويه/الدمام" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عين دار" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بطحه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حرض" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سلوى" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عجم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سفنيه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"رحمه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تنجيب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"راس تنورة" , "deliverTime":"خلال 2-3 أيام" },' +
                           '{ "cityName":"صفوى" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"راس الخير" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الجبيل الصناعية 2" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سيهات" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ثقبا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عسفان" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بحرا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"دهبان" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"خليص" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الشعيبه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"طيبه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ثول" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مدينة الملك عبدالله الاقتصادية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ديراب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الدرعية" , "deliverTime":"خلال 2-3 أيام" },' +
                           '{ "cityName":"الدرمه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حريملاء" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"المزاحمية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العيينة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"القويعية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"رماح" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الرويضه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سلبوكه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"شفا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تبراك" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ثادق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ابو عجرم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الادري" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"اللقايط" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"النبك ابو قصر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الرديفه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الرفيعة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"السليمانية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الطوير" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"دومة الجندل" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"هديب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الجوف" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"كارا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سكاكا" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"صوير" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تبرجل" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"زلوم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عرعر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حزم الجلاميد" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"طريف" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العويقيلية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عفيف" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العرجة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"البجادية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الحفيرة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"القرين" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"النافية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الشرائع" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الدوادمي" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"رافا الجماش" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ساجر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الذيبيه - حفر الباطن" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"حفر الباطن" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"مدينة الملك خالد العسكرية " , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"نصاب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"قيصومه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"رفحاء" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"روضه هباس" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الاجفار" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الحائط" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الحليفة السفلى" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الخطة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الوسيطاء" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"النقرة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الشملي" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الشنانه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"باقة الشرقيه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بقعة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"غزالية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"غطي" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"موقق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مقيق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"منيفت القيد" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"قفار" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سديان" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"شينانة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سيميرا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الضبيعة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الهياثم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الدلم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الحريق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حوطة بني تميم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الخرج" , "deliverTime":"خلال 2-4 أيام" },' +
                           '{ "cityName":"سحنه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"المجمعة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تنيوما" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ثرمادا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"اشيقر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الداهنة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مبايض" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مليح" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"قصب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"روضه سودير" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ام الجماجم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الغاط" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الارطاوية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"حوطة سدير" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"جلاجل" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مرات" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"شقراء" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تمير" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الزلفي" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تويم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ابا الورود" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العامرية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"العاصية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"البترا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الدليميه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الفويلق" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الخشيبي" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"المدراج" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"النبهانية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الرس" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الصلبيّة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الشماسية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عين فهيد" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"البدائع" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"البكيرية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ضرية" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"دخنة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ضليع رشيد" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"كحله" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"كبضه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"المذنب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"مذنب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عنيزة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عيون الجوا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"القصيم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"قبه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"قصيباء" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"رياض الخبراء" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"سقف" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"شري" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الذيبية - القصيم" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"عقلة الصقور" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الحديثه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"القريات" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"افلج" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"تمرة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"خماسين" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ليلى" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"السليل" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"وادي الدواسر" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"هروب" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"يدمة" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"ظبيه" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"الماضايا" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"بحرة الموجود" , "deliverTime":"خلال 2-5 أيام" },' +
                           '{ "cityName":"دبي" , "deliverTime":"خلال 4-7 أيام" },' +
                           '{ "cityName":"ابوظبي" , "deliverTime":"خلال 4-7 أيام" },' +
                           '{ "cityName":"عجمان" , "deliverTime":"خلال 4-7 أيام" },' +
                           '{ "cityName":"المنامة" , "deliverTime":"خلال 4-7 أيام" },' +
                           '{ "cityName":"مسقط" , "deliverTime":"خلال 4-7 أيام" } ]}';
                           const citiesListObj = JSON.parse(citiesDropdownList);
                           var citiesList_li = "";
                           for (var i = 0; i < citiesListObj.citiesList.length; i++) {
                               citiesList_li +=  '<li><a href="javascript:void(0);" data-deliverTime="' + citiesListObj.citiesList[i].deliverTime + '">' + citiesListObj.citiesList[i].cityName  + '</a></li>'
                           }
                           
                           var shippingTimeSecHtml = `<span class="deliveryPeriodIcon"><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                         viewBox="-239 0 800 800" style="enable-background:new -239 0 800 800;" xml:space="preserve">
                      <path d="M561,407.9c0-0.1,0-0.3,0-0.4c-0.2-10-8.3-18-18.4-18h-4.8L463,245c-3.2-6.1-9.4-9.9-16.4-9.9l-127.5,0l4.9-38.6
                        c1.4-15.4-3.4-30-13.4-41c-10-11-24-17-39.4-17h-395.7c-9.9,0-18.4,7.7-19.4,17.6l-4,31.8H77.6c14.6,0,26.2,11.9,25.8,26.5
                        c-0.4,14.6-12.6,26.5-27.2,26.5H1c0,0,0,0.1,0,0.1h-220.8c-10.4,0-19,8.4-19.2,18.7c-0.3,10.4,7.9,18.7,18.3,18.7H71.6
                        c13.6,2.1,23.7,13.8,23.3,28c-0.4,15.6-13.3,28.3-28.9,28.4h-201.6c-10.5,0-19.2,8.5-19.4,18.9c-0.3,10.5,8,18.9,18.4,18.9H62.7
                        c13.8,1.9,24.1,13.7,23.7,28.1C86,416.6,73,429.3,57.3,429.3h-228.5v0h-19.2c-10.5,0-19.2,8.5-19.4,18.9c-0.3,10.5,8,18.9,18.4,18.9
                        h16.6l-6.5,67.8c-1.4,15.4,3.4,30,13.4,41c10,11,24,17,39.4,17h14.3c6.8,39,40.5,68.4,81.7,68.4S44,632,52.8,593.1h178.4
                        c14.4,0,28.1-5.5,38.8-14.5c9.8,9.4,22.8,14.5,36.9,14.5h2.9c6.8,39,40.5,68.4,81.7,68.4c41.2,0,76.5-29.4,85.3-68.4h11.8
                        c30.7,0,57.9-24.9,60.6-55.6l11.5-127.8c0-0.2,0-0.3,0-0.5c0-0.3,0.1-0.5,0.1-0.8C561,408.2,561,408,561,407.9z M-31.5,623.6
                        c-26.1,0-46.8-21.2-46.1-47.3c0.7-26.1,22.5-47.3,48.6-47.3s46.8,21.2,46.1,47.3C16.4,602.4-5.4,623.6-31.5,623.6z M392.6,623.6
                        c-26.1,0-46.8-21.2-46.1-47.3c0.7-26.1,22.5-47.3,48.6-47.3s46.8,21.2,46.1,47.3C440.5,602.4,418.7,623.6,392.6,623.6z M511.7,535.1
                        c-1,10.9-11,20.1-21.9,20.1H477c-8.4-36.8-41.2-64.2-80.9-64.2c-39.7,0-73.9,27.3-84.2,64.2H308c-4.8,0-9.1-1.8-12.1-5.1
                        c-3-3.3-4.4-7.8-4-12.6L315.8,273l54.8,0l-8.7,96.3c-1.4,15.4,3.4,30,13.4,41c10,11,24,17,39.4,17h106.7L511.7,535.1z"/>
                      </svg></span>
                           <div class="deliverTime">
                           التوصيل خلال 24 ساعة فى <span class="cityName">الرياض</span>
                           </div>
                             <div>
                               <div class="dropdown">
                                 <div class="dropbtn">تحديد المدينة</div>
                                 <div id="citiesDropdown" class="dropdown-content">
                                   <input type="text" placeholder="بـحــث..." id="citiesInputSearch">
                                   <ul>` + String(citiesList_li) + ` </ul>
                                 </div>
                               </div>
                             </div>`;
                           var shippingTimeSec = document.createElement("div");
                           shippingTimeSec.className = "shippingTimeSec";
                           shippingTimeSec.innerHTML = shippingTimeSecHtml;
                           shippingTimeSec.className = "shippingTimeSec";
                           // DO NOT MODIFY THIS SELECTOR - essential for shipping time section placement
                           var mainPrice = document.querySelector('.product-single .main-content div.flex.whitespace-nowrap.gap-4.items-center');

                           if (mainPrice) {
                             mainPrice.appendChild(shippingTimeSec);

                             function citiesDropdownFunction() {
                               var dropdown = shippingTimeSec.querySelector("#citiesDropdown");
                               if (dropdown) dropdown.classList.toggle("show");
                             }
                             function filterFunction() {
                               var input = shippingTimeSec.querySelector("#citiesInputSearch");
                               var filter = (input ? input.value : "").toUpperCase();
                               var div = shippingTimeSec.querySelector("#citiesDropdown");
                               if (!div) return;
                               var a = div.getElementsByTagName("a");
                               for (var i = 0; i < a.length; i++) {
                                 var txtValue = a[i].textContent || a[i].innerText;
                                 if (txtValue.toUpperCase().indexOf(filter) > -1) {
                                   a[i].style.display = "";
                                 } else {
                                   a[i].style.display = "none";
                                 }
                               }
                             }

                             var dropBtn = shippingTimeSec.querySelector('.dropbtn');
                             var searchInput = shippingTimeSec.querySelector('#citiesInputSearch');
                             var citiesListItems = shippingTimeSec.querySelector('#citiesDropdown>ul');
                             var citiesDropdownEl = shippingTimeSec.querySelector('#citiesDropdown');

                             if (dropBtn) dropBtn.addEventListener('click', citiesDropdownFunction);
                             if (searchInput) searchInput.addEventListener('keyup', filterFunction);

                             if (citiesListItems) {
                               citiesListItems.addEventListener('click', function(e) {
                                 if (e.target.tagName === 'A'){
                                   var val = e.target;
                                   var dropdown = shippingTimeSec.querySelector("#citiesDropdown");
                                   if (dropdown) dropdown.classList.remove("show");
                                   var deliverTime = shippingTimeSec.querySelector(".deliverTime");
                                   if (deliverTime) deliverTime.innerHTML = "التوصيل " + val.getAttribute('data-deliverTime') + " فى " + "<span class='cityName'>" + val.innerHTML + "</span>";
                                 }
                               });
                             }

                             if (citiesDropdownEl) {
                               citiesDropdownEl.addEventListener('click', function(e) {
                                 e.stopPropagation();
                               });
                             }

                             window.addEventListener('click', function(event) {
                               if (!event.target.matches('.dropbtn')) {
                                 var citiesDropdown = shippingTimeSec.querySelector("#citiesDropdown");
                                 if (citiesDropdown && citiesDropdown.classList.contains('show')) {
                                   citiesDropdown.classList.remove('show');
                                 }
                               }
                             });
                           }
                    /* ==================================== */
                 
                      
                   /* ======= Tamara & Tabby Cards ======= */
                         /*setTimeout(function() {
                         
                             var tabbyTamaraSec = document.querySelector('.product-single .main-content salla-installment');
                             var TamaraSec = document.querySelector('.product-single .main-content salla-installment > .tamara-product-widget');
                             var tabbySec = document.querySelector('.product-single .main-content salla-installment .styles__tabbySnippet--c10e5');
                             var nIcon = `<img alt="infoCircle" class="Icon_icon__notification" color="offBlack" width="20" height="20" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDE0IDE0IiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNNi40MTc5NyA5LjkxNjc1SDcuNTg0NjRWNi40MTY3NUg2LjQxNzk3VjkuOTE2NzVaTTcuMDAxMyA1LjI1MDA4QzcuMTY2NTggNS4yNTAwOCA3LjMwNTIyIDUuMTk0MDggNy40MTcyMiA1LjA4MjA4QzcuNTI5MjIgNC45NzAwOCA3LjU4NTAyIDQuODMxNjQgNy41ODQ2NCA0LjY2Njc1QzcuNTg0NjQgNC41MDE0NyA3LjUyODY0IDQuMzYzMDMgNy40MTY2NCA0LjI1MTQxQzcuMzA0NjQgNC4xMzk4IDcuMTY2MTkgNC4wODM4IDcuMDAxMyA0LjA4MzQxQzYuODM2MDIgNC4wODM0MSA2LjY5NzU4IDQuMTM5NDEgNi41ODU5NyA0LjI1MTQxQzYuNDc0MzYgNC4zNjM0MSA2LjQxODM2IDQuNTAxODYgNi40MTc5NyA0LjY2Njc1QzYuNDE3OTcgNC44MzIwMyA2LjQ3Mzk3IDQuOTcwNjYgNi41ODU5NyA1LjA4MjY2QzYuNjk3OTcgNS4xOTQ2NiA2LjgzNjQxIDUuMjUwNDcgNy4wMDEzIDUuMjUwMDhaTTcuMDAxMyAxMi44MzM0QzYuMTk0MzYgMTIuODMzNCA1LjQzNjAyIDEyLjY4MDIgNC43MjYzIDEyLjM3MzdDNC4wMTY1OCAxMi4wNjczIDMuMzk5MjIgMTEuNjUxOCAyLjg3NDIyIDExLjEyNzJDMi4zNDkyMiAxMC42MDIyIDEuOTMzNjkgOS45ODQ4IDEuNjI3NjQgOS4yNzUwOEMxLjMyMTU4IDguNTY1MzYgMS4xNjgzNiA3LjgwNzAzIDEuMTY3OTcgNy4wMDAwOEMxLjE2Nzk3IDYuMTkzMTQgMS4zMjExOSA1LjQzNDggMS42Mjc2NCA0LjcyNTA4QzEuOTM0MDggNC4wMTUzNiAyLjM0OTYxIDMuMzk4IDIuODc0MjIgMi44NzNDMy4zOTkyMiAyLjM0OCA0LjAxNjU4IDEuOTMyNDcgNC43MjYzIDEuNjI2NDFDNS40MzYwMiAxLjMyMDM2IDYuMTk0MzYgMS4xNjcxNCA3LjAwMTMgMS4xNjY3NUM3LjgwODI1IDEuMTY2NzUgOC41NjY1OCAxLjMxOTk3IDkuMjc2MyAxLjYyNjQxQzkuOTg2MDIgMS45MzI4NiAxMC42MDM0IDIuMzQ4MzkgMTEuMTI4NCAyLjg3M0MxMS42NTM0IDMuMzk4IDEyLjA2OTEgNC4wMTUzNiAxMi4zNzU2IDQuNzI1MDhDMTIuNjgyIDUuNDM0OCAxMi44MzUgNi4xOTMxNCAxMi44MzQ2IDcuMDAwMDhDMTIuODM0NiA3LjgwNzAzIDEyLjY4MTQgOC41NjUzNiAxMi4zNzUgOS4yNzUwOEMxMi4wNjg1IDkuOTg0OCAxMS42NTMgMTAuNjAyMiAxMS4xMjg0IDExLjEyNzJDMTAuNjAzNCAxMS42NTIyIDkuOTg2MDIgMTIuMDY3OSA5LjI3NjMgMTIuMzc0M0M4LjU2NjU4IDEyLjY4MDggNy44MDgyNSAxMi44MzM4IDcuMDAxMyAxMi44MzM0Wk03LjAwMTMgMTEuNjY2N0M4LjMwNDA4IDExLjY2NjcgOS40MDc1NSAxMS4yMTQ3IDEwLjMxMTcgMTAuMzEwNUMxMS4yMTU5IDkuNDA2MzMgMTEuNjY4IDguMzAyODYgMTEuNjY4IDcuMDAwMDhDMTEuNjY4IDUuNjk3MyAxMS4yMTU5IDQuNTkzODMgMTAuMzExNyAzLjY4OTY2QzkuNDA3NTUgMi43ODU1IDguMzA0MDggMi4zMzM0MSA3LjAwMTMgMi4zMzM0MUM1LjY5ODUyIDIuMzMzNDEgNC41OTUwNSAyLjc4NTUgMy42OTA4OSAzLjY4OTY2QzIuNzg2NzIgNC41OTM4MyAyLjMzNDY0IDUuNjk3MyAyLjMzNDY0IDcuMDAwMDhDMi4zMzQ2NCA4LjMwMjg2IDIuNzg2NzIgOS40MDYzMyAzLjY5MDg5IDEwLjMxMDVDNC41OTUwNSAxMS4yMTQ3IDUuNjk4NTIgMTEuNjY2NyA3LjAwMTMgMTEuNjY2N1oiIGZpbGw9IiM5RTlFOUUiLz4KPC9zdmc+Cg==">`;
                             TamaraSec.insertAdjacentHTML( 'beforeend', nIcon );
                             tabbySec.insertAdjacentHTML( 'beforeend', nIcon );
                     
                             var prdPriceText = document.querySelector('.product-single .main-content div.flex.whitespace-nowrap.gap-4.items-center h2');
                             var prdPrice = prdPriceText.innerText.match(/\d+(?:\.\d+)?/g);
                             var payByOneTime = (Math.ceil(prdPrice)/4);
                                   
                             tabbyTamaraSec.append(
                                 Object.assign(document.createElement("STYLE"),{
                                     innerText : `.product-single .main-content salla-installment:before {
                                     content: "ادفعي على 4 دفعات بدون فوائد بقيمة ` + payByOneTime + ` ريال سعودي" !important;
                                     }`
                                 })
                             );
                             document.querySelector("#tabbyPromo > .styles__tabbySnippet--c10e5 > span").shadowRoot.append(
                                 Object.assign(document.createElement("STYLE"),{
                                     innerText : `.styles__tabby-promo-snippet--2ddd6,
                                     .styles__snippetWrapper--d68e9 {
                                     border: 0;
                                     border-radius: 0;
                                     justify-content: center;
                                     padding: 0 16px;
                                 }
                                 .styles__tabby-promo-snippet__content--51d69,
                                 .styles__tabby-promo-snippet__content--c823dv {
                                     font-size: 0 !important;
                                     border: 0 !important;
                                     border-radius: 0 !important;
                                     margin: 0 !important;
                                 }
                                 .styles__tabbyPromoSnippetContent--ef3e6 styles__tabbyPromoSnippetContentRtl--bcbcb {
                                     visibility: hidden;
                                     height: 0;
                                     max-height: 0;
                                 }
                                 .styles__tabby-promo-snippet__text--dfcce,
                                 .styles__tabbyPromoSnippetText--b30d0 {
                                     display: none;
                                 }
                                 .styles__tabby-promo-snippet__content--51d69 + span,
                                 .styles__tabby-promo-snippet__content--c823dv + span,
                                 .styles__tabby-promo-snippet--2ddd6 > span,
                                 .styles__snippetWrapper--d68e9 > span
                                 span.styles__containerPortal--c9f84 {
                                     display: flex;
                                 }`
                                 })
                             );
                         
                         }, 4500);*/
                 
                         /* ==================================== */
                 
                         setTimeout(function() {
                           var optionSec = document.querySelector('salla-product-options.s-product-options-wrapper');
                           if(optionSec) {
                             var prdOptionSec = document.querySelector('form.form.product-form salla-product-options.s-product-options-wrapper ~ section.flex.bg-white.rounded-md.rounded-b-none');
                           var replaceNotification = document.createElement('div');
                           replaceNotification.className = 'replaceNotification';
                           replaceNotification.innerHTML = `<h4> مو متأكده من مقاسك؟ يحق لك <a href="https://darlena.com/p/oPyRV">الإستبدال والإرجاع</a></h4><div><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                           viewBox="0 0 104.3 122.3" style="enable-background:new 0 0 104.3 122.3;" xml:space="preserve">
                           <g>
                             <path d="M63.8,16.1c0-0.6,0-1.1,0-1.6c0-4,0-8,0-12c0-1,0.1-1.8,1.1-2.3c1-0.5,1.7,0,2.5,0.6C79.3,10,91.2,19.3,103,28.5
                               c1.6,1.3,1.7,2.5,0,3.8c-11.9,9.3-23.8,18.6-35.6,27.8c-0.7,0.6-1.5,1-2.4,0.6c-1-0.5-1.2-1.3-1.2-2.3c0-4,0-8,0-12
                               c0-0.5,0-0.9,0-1.5c-0.5,0-1-0.1-1.4-0.1c-4.9,0-9.8,0-14.6,0c-4.3,0-8.2,1.2-11.6,3.8c-0.8,0.6-1.6,0.9-2.4,0.4
                               c-1.3-0.7-1.4-2.3-0.1-3.4c3.3-2.6,7-4.4,11.2-4.5c7-0.3,14-0.2,21-0.2c1.3,0,2,0.8,2,2.2c0,3.2,0,6.5,0,9.7c0,0.6,0,1.1,0,2
                               c10.5-8.2,20.9-16.3,31.3-24.5C88.6,22.3,78.3,14.2,67.7,6c0,0.8,0,1.2,0,1.6c0,7.2,0,14.4,0,21.6c0,0.4,0,0.8,0,1.2
                               c-0.1,1.2-0.8,2-1.9,2c-1.1,0-1.9-0.7-1.9-2c0-3,0-6,0-9c0-0.4,0-0.9,0-1.3c-0.4,0-0.6-0.1-0.8-0.1c-6.3,0-12.7-0.2-19,0.2
                               c-10.5,0.7-19.6,4.9-27,12.3C8.5,40.8,4.2,51,3.9,63c0,1.1-0.3,1.9-1.3,2.3C1.2,65.7,0,64.7,0,63c0-7.5,1.7-14.7,5.3-21.3
                               c9.1-16.5,23.2-25.1,42.1-25.6c5-0.1,10,0,15,0C62.8,16.1,63.3,16.1,63.8,16.1z"/>
                             <path d="M40.4,102.2c0.4,0.1,0.7,0.1,0.9,0.1c5.9,0,11.8,0.1,17.8-0.1c19.5-0.7,36.6-15.5,40.3-34.7c0.5-2.7,0.7-5.4,0.9-8.1
                               c0.1-1.6,0.8-2.5,2-2.4c1.2,0,1.9,0.9,1.9,2.5c-0.1,22-16.4,41.7-38,45.8c-3.2,0.6-6.5,0.8-9.8,0.9c-4.8,0.2-9.7,0-14.5,0
                               c-0.4,0-0.9,0-1.4,0c0,0.5-0.1,1-0.1,1.4c0,4,0,8,0,12c0,1-0.1,1.9-1.1,2.5c-1,0.5-1.8,0-2.6-0.6C24.9,112.3,13,103,1.2,93.8
                               c-1.5-1.2-1.6-2.5-0.1-3.6C13,80.8,24.8,71.6,36.7,62.3c0.6-0.4,1.4-0.8,2.1-0.8c1.2,0.1,1.5,1.1,1.5,2.2c0,4.1,0,8.2,0,12.2
                               c0,0.5,0,0.9,0.1,1.5c0.6,0,1.1,0,1.5,0c4.7,0,9.4,0,14.2,0c4.4,0.1,8.4-1.2,12-3.8c1-0.8,2.1-0.8,2.8,0c0.9,0.9,0.8,2.2-0.4,3.1
                               c-2.8,2.2-6,3.7-9.5,4.3c-1.6,0.3-3.3,0.4-4.9,0.4c-5.6,0-11.3,0-16.9,0c-2.1,0-2.7-0.6-2.7-2.7c0-3.6,0-7.3,0-11.3
                               C26,75.7,15.6,83.7,5.2,91.9c10.4,8.2,20.8,16.2,31.3,24.5c0-0.7,0-1.1,0-1.6c0-7.3,0-14.6,0-22c0-0.3,0-0.6,0-1
                               c0.1-1.1,0.8-1.9,1.9-1.9c1.1,0,2,0.7,2,1.9c0,3,0,6,0,9C40.4,101.3,40.4,101.7,40.4,102.2z"/>
                           </g>
                           </svg></div>`;
                             prdOptionSec.parentNode.insertBefore(replaceNotification, prdOptionSec);
                           }
                         }, 2500);
                 
                 
                         var showMoreBtn = document.createElement("a");
                         showMoreBtn.id = "btn-show-more";
                         showMoreBtn.setAttribute("href", "javascript:void(0)");
                         showMoreBtn.innerText = "اقرأ المزيد";
                         var productDesc = document.querySelector('.product__description');
                         if (productDesc) productDesc.append(showMoreBtn);
                         var showMoreBtnEl = document.getElementById("btn-show-more");
                         if (showMoreBtnEl) {
                           showMoreBtnEl.addEventListener("click", function() {
                             var articleMain = document.querySelector('.article--main');
                             if (articleMain) articleMain.classList.add("product__description__fullHeight");
                             showMoreBtn.classList.add("btn-show-more-hidden");
                           });
                         }
                         var el = document.querySelector('article.article--main');
                         if (el) {
                           var wrapper = document.createElement('div');
                           wrapper.className = 'descWrapper';
                           el.parentNode.insertBefore(wrapper, el);
                           Array.prototype.forEach.call(document.querySelectorAll('article.article--main, a#btn-show-more'), function(c){
                               wrapper.appendChild(c);
                           });
                         }
                         // Updated to handle both traditional iframes and lazy-loaded placeholders
                         function positionVideosBelow() {
                           // Only target placeholders initially, not iframes (let youtube-lazy.js handle those)
                           var placeholders = document.querySelectorAll('.yt-placeholder:not([data-positioned])');
                           if (placeholders.length === 0) return;
                           
                           // Calculate total height needed
                           var totalVideos = document.querySelectorAll('.yt-placeholder, iframe[src*="youtube"]').length;
                           if (totalVideos > 0) {
                             document.querySelector('.product__description').style.marginBottom = ((265 * totalVideos) + 20) + "px";
                           }
                           
                           // Position only unpositioned placeholders
                           for (var i = 0; i < placeholders.length; i++) {
                             var position = i + 1;
                             var existing = document.querySelectorAll('.yt-placeholder[data-positioned], iframe[data-position-applied="true"]').length;
                             position += existing;
                             
                             placeholders[i].style.position = "absolute";
                             placeholders[i].style.bottom = "-" + (265 * position) + "px";
                             placeholders[i].style.display = "block";
                             placeholders[i].style.width = "100%";
                             placeholders[i].style.zIndex = "1";
                             placeholders[i].dataset.positioned = "true";
                           }
                         }

                         // Run initially with delay to ensure youtube-lazy.js has processed iframes
                         setTimeout(positionVideosBelow, 300);

                         // Set up efficient MutationObserver to detect only relevant changes
                         if (typeof MutationObserver !== 'undefined') {
                           const productDesc = document.querySelector('.product__description');
                           if (productDesc) {
                             const observer = new MutationObserver(function(mutations) {
                               let newElements = false;
                               
                               // Quickly check if we have relevant mutations before detailed processing
                               for (let i = 0; i < mutations.length; i++) {
                                 if (mutations[i].type === 'childList' && mutations[i].addedNodes.length > 0) {
                                   newElements = true;
                                   break;
                                 }
                               }
                               
                               if (!newElements) return;
                               
                               // Handle newly created YouTube iframes (from lazy loading clicks)
                               const newIframes = document.querySelectorAll('iframe[src*="youtube"]:not([data-position-applied])');
                               for (let i = 0; i < newIframes.length; i++) {
                                 const iframe = newIframes[i];
                                 iframe.dataset.positionApplied = "true";
                                 
                                 // Find position index based on nearby positioned elements
                                 let position = document.querySelectorAll('.yt-placeholder[data-positioned], iframe[data-position-applied="true"]').length;
                                 
                                 // Apply positioning directly
                                 iframe.style.position = "absolute";
                                 iframe.style.width = "100%";
                                 iframe.style.height = "250px";
                                 iframe.style.left = "0";
                                 iframe.style.right = "0";
                                 iframe.style.zIndex = "1";
                                 iframe.style.display = "block";
                                 iframe.style.bottom = "-" + (265 * position) + "px";
                               }
                               
                               // Check for new placeholders
                               const newPlaceholders = document.querySelectorAll('.yt-placeholder:not([data-positioned])');
                               if (newPlaceholders.length > 0) {
                                 positionVideosBelow();
                               }
                             });
                             
                             observer.observe(productDesc, {
                               childList: true,
                               subtree: true
                             });
                           }
                         }
                   
                 
                     };

                     // ====== Cart Remove Fix: ultra-narrow, safe interceptor ======
                     (function cartRemoveFix() {
                       // Only run on pages that could include cart items
                       // This code is safe globally due to strict selector gating below
                       const DIGITS_ONLY_ARG = /salla\.cart\.deleteItem\(\s*(\d+)\s*\)/;

                       function extractCartItemId(btn) {
                         // Prefer the wrapping form id="item-<ID>"
                         const form = btn.closest('form[id^="item-"]');
                         if (form && form.id && form.id.indexOf('item-') === 0) {
                           return { id: form.id.slice(5), form };
                         }
                         // Fallback: hidden input name="id"
                         const anyForm = btn.closest('form');
                         const hidden = anyForm && anyForm.querySelector('input[name="id"]');
                         if (hidden && hidden.value) {
                           return { id: hidden.value, form: anyForm };
                         }
                         // Last resort: search nearby attributes
                         const nearby = btn.closest('[cart-item-id], [item-id]');
                         const attrId = nearby && (nearby.getAttribute('cart-item-id') || nearby.getAttribute('item-id'));
                         if (attrId) {
                           return { id: attrId, form: anyForm || document.getElementById('item-' + attrId) };
                         }
                         return { id: null, form: anyForm || null };
                       }

                       // Capture-phase click interceptor: only for clearly broken handlers
                       document.addEventListener('click', function(e) {
                         const target = e.target;
                         if (!target) return;
                         const btn = target.closest && target.closest('salla-button.btn--delete[onclick*="salla.cart.deleteItem("]');
                         if (!btn) return;

                         const onclick = btn.getAttribute('onclick') || '';
                         const match = onclick.match(DIGITS_ONLY_ARG);
                         // Proceed only if the inline handler passes a bare number (unquoted)
                         if (!match) return;

                         // Ensure the Salla cart API is available
                         const deleteItem = (typeof window.salla?.cart?.deleteItem === 'function') && window.salla.cart.deleteItem;
                         if (!deleteItem) return;

                         const { id, form } = extractCartItemId(btn);
                         if (!id) return; // Do not interfere if we cannot determine the id

                         // Stop the broken inline handler from running
                         e.preventDefault();
                         e.stopImmediatePropagation();
                         e.stopPropagation();

                         // Call with a quoted string id to avoid precision loss
                         try {
                           Promise.resolve(deleteItem(String(id)))
                             .then(function() {
                               // Mirror theme behavior: remove the item container
                               if (form && form.parentNode) form.parentNode.removeChild(form);
                             })
                             .catch(function() {
                               // Silent fail: allow platform to handle any UI updates elsewhere
                             });
                         } catch (_) {
                           // No-op
                         }
                       }, true); // capture phase

                       // Optional: one-time inline patch for currently-rendered nodes (no observers)
                       function oneTimeInlinePatch() {
                         const nodes = document.querySelectorAll('salla-button.btn--delete[onclick*="salla.cart.deleteItem("]');
                         nodes.forEach(function(n) {
                           const raw = n.getAttribute('onclick') || '';
                           if (DIGITS_ONLY_ARG.test(raw)) {
                             // Replace only the unquoted numeric argument, keep the rest intact
                             n.setAttribute('onclick', raw.replace(DIGITS_ONLY_ARG, "salla.cart.deleteItem('$1')"));
                           }
                         });
                       }

                       // Run the one-time patch when Salla is ready or immediately if DOM is ready
                       if (document.readyState !== 'loading') {
                         oneTimeInlinePatch();
                       } else {
                         document.addEventListener('DOMContentLoaded', oneTimeInlinePatch, { once: true });
                       }
                       if (typeof document.addEventListener === 'function') {
                         document.addEventListener('salla::ready', function() {
                           oneTimeInlinePatch();
                         }, { once: true });
                       }
                     })();
                     // ====== End Cart Remove Fix ======

                  

                     // Comprehensive Product Options Fix - Hybrid Solution
                     (function() {
                       // Only run on product pages - use body class (more reliable than element selectors)
                       if (!document.body.classList.contains('product-single')) return;

                       // Track active executions to prevent overlapping runs
                       let isCreatingButtons = false;
                       let retryAttempts = 0;
                       const MAX_RETRIES = 5;
                       
                       // Function to recreate the horizontal buttons from the select options
                       function recreateOptionButtons() {
                         // Don't run if already executing or not on a product page
                         if (isCreatingButtons || !document.querySelector('.product-form')) return;
                         
                         try {
                           isCreatingButtons = true;
                           
                           // First ensure container elements are visible (from old solution)
                           const optionsWrapper = document.querySelector('.s-product-options-wrapper');
                           const optionsContainer = optionsWrapper?.querySelector('.s-product-options-option-container') ||
                                                  optionsWrapper?.querySelector('salla-conditional-fields');
                           
                           // Apply visibility fixes from old solution
                           if (optionsWrapper) {
                             optionsWrapper.style.display = 'block';
                             optionsWrapper.style.visibility = 'visible';
                             optionsWrapper.style.opacity = '1';
                             optionsWrapper.style.borderColor = '#de9b5d';
                           }
                           
                           if (optionsContainer) {
                             optionsContainer.style.display = 'block';
                             optionsContainer.style.visibility = 'visible';
                             optionsContainer.style.opacity = '1';
                           }
                           
                           // Find all single-option type selects that should have buttons
                           const selects = document.querySelectorAll('.s-product-options-option[data-option-type="single-option"] select');
                           
                           selects.forEach(select => {
                             // Skip selects that are in the cart page
                             if (select.closest('.cart-options')) return;
                             
                             // Skip if buttons already exist and contain elements
                             const existingContainer = select.parentElement.querySelector('.option-buttons-container');
                             const hasOptions = select.options.length > 1; // More than just the placeholder
                             
                             // Only create buttons if (1) select has options and (2) buttons don't exist or are empty
                             if (hasOptions && (!existingContainer || existingContainer.children.length === 0)) {
                               // Create container for buttons if it doesn't exist
                               let container = existingContainer;
                               if (!container) {
                                 container = document.createElement('div');
                                 container.className = 'option-buttons-container';
                                 container.style.display = 'flex';
                                 container.style.flexWrap = 'wrap';
                                 container.style.gap = '0.5rem';
                                 container.style.marginTop = '0.5rem';
                                 select.parentElement.appendChild(container);
                               }
                               
                               // Clear existing buttons
                               container.innerHTML = '';
                               
                               // Hide the original select
                               select.style.display = 'none';
                               
                               // Create buttons for each option
                               Array.from(select.options).forEach((option, index) => {
                                 if (index === 0 || !option.value) return; // Skip placeholder option
                                 
                                 // Create button element
                                 const button = document.createElement('div');
                                 button.className = 'option-button';
                                 
                                 // Style the button
                                 button.style.padding = '0.5rem 1rem';
                                 button.style.border = '1px solid #e5e7eb';
                                 button.style.borderRadius = '0.375rem';
                                 button.style.fontSize = '0.875rem';
                                 button.style.transition = '0.2s';
                                 
                                 // Add data attributes
                                 button.dataset.value = option.value;
                                 
                                 // Extract stock amount from the option text if available
                                 const stockMatch = option.text.match(/\((\d+)\)/);
                                 const stockAmount = stockMatch ? parseInt(stockMatch[1]) : 3; // Default to 3 if not found
                                 button.dataset.stock = stockAmount;
                                 
                                 // Text content should be just the size without stock info
                                 button.textContent = option.text.replace(/ - نفدت الكمية| \(\d+\)/g, '');
                                 
                                 // If out of stock, add disabled class and style
                                 if (option.text.includes('نفدت الكمية') || option.disabled) {
                                   button.classList.add('disabled');
                                   button.style.cursor = 'not-allowed';
                                   button.style.opacity = '0.5';
                                   button.style.textDecoration = 'line-through';
                                 } else {
                                   button.style.cursor = 'pointer';
                                   
                                   // Handle click to select this option
                                   button.addEventListener('click', () => {
                                     if (button.classList.contains('disabled')) return;
                                     
                                     // Update select value
                                     select.value = option.value;
                                     
                                     // Trigger change event to update price
                                     select.dispatchEvent(new Event('change', { bubbles: true }));
                                     
                                     // Update button states
                                     container.querySelectorAll('.option-button').forEach(btn => {
                                       btn.classList.remove('selected');
                                       btn.style.borderColor = '#e5e7eb';
                                       btn.style.backgroundColor = '';
                                       btn.style.color = '';
                                     });
                                     
                                     button.classList.add('selected');
                                     button.style.borderColor = 'var(--color-primary)';
                                     button.style.backgroundColor = 'rgba(var(--color-primary-rgb, 0, 0, 0), 0.05)';
                                     button.style.color = 'var(--color-primary)';
                                     
                                     // Show low stock indicator with consistent number for this option
                                     let lowStockIndicator = document.querySelector('.low-stock-indicator');
                                     if (lowStockIndicator) {
                                       lowStockIndicator.querySelector('span').textContent = `متبقي ${stockAmount} قطع فقط من هذا المقاس`;
                                       lowStockIndicator.style.display = 'flex';
                                     }
                                   });
                                 }
                                 
                                container.appendChild(button);

                                const isOptionSelected = option.selected || select.value === option.value;
                                if (isOptionSelected && !button.classList.contains('disabled')) {
                                  if (select.value !== option.value) {
                                    select.value = option.value;
                                  }

                                  container.querySelectorAll('.option-button').forEach(btn => {
                                    btn.classList.remove('selected');
                                    btn.style.borderColor = '#e5e7eb';
                                    btn.style.backgroundColor = '';
                                    btn.style.color = '';
                                  });

                                  button.classList.add('selected');
                                  button.style.borderColor = 'var(--color-primary)';
                                  button.style.backgroundColor = 'rgba(var(--color-primary-rgb, 0, 0, 0), 0.05)';
                                  button.style.color = 'var(--color-primary)';

                                  const lowStockIndicator = document.querySelector('.low-stock-indicator');
                                  const lowStockText = lowStockIndicator?.querySelector('span');
                                  if (lowStockIndicator && lowStockText) {
                                    lowStockText.textContent = `متبقي ${stockAmount} قطع فقط من هذا المقاس`;
                                    lowStockIndicator.style.display = 'flex';
                                  }
                                }
                              });
                            } else if (existingContainer) {
                               // Make sure the existing container is visible
                               existingContainer.style.display = 'flex';
                               existingContainer.style.flexWrap = 'wrap';
                               existingContainer.style.gap = '0.5rem';
                               existingContainer.style.marginTop = '0.5rem';
                             }
                           });
                 
                           if (retryAttempts > 0) {
                             console.log(`Product options recreated after ${retryAttempts} attempts`);
                           }
                           retryAttempts = 0;
                         } catch (error) {
                           console.error('Error creating option buttons:', error);
                         } finally {
                           isCreatingButtons = false;
                         }
                       }
                       
                       // 1. Run after DOM is ready
                       if (document.readyState === 'loading') {
                         document.addEventListener('DOMContentLoaded', recreateOptionButtons);
                       } else {
                         recreateOptionButtons();
                       }
                       
                       // 2. Run after page is fully loaded
                       window.addEventListener('load', recreateOptionButtons);
                       
                       // 3. Listen for Salla's product events
                       document.addEventListener('salla.product.options.loaded', () => {
                         setTimeout(recreateOptionButtons, 100);
                       });
                       
                       // 4. Watch for price updates (might indicate option changes)
                       document.addEventListener('salla.product.price.updated', () => {
                         setTimeout(recreateOptionButtons, 100);
                       });
                       
                       // Add missing options.updated event listener
                       document.addEventListener('salla.product.options.updated', () => {
                         setTimeout(recreateOptionButtons, 100);
                       });
                       
                       // 5. Watch DOM changes with a single MutationObserver
                       if (typeof MutationObserver !== 'undefined') {
                         // Wait for product form to be available
                         const watchForForm = setInterval(() => {
                           const productForm = document.querySelector('.product-form');
                           if (productForm) {
                             clearInterval(watchForForm);
                             
                             const observer = new MutationObserver((mutations) => {
                               let shouldRecreate = false;
                               
                               for (const mutation of mutations) {
                                 // Check if the mutation is relevant to our product options
                                 if (mutation.target.closest('salla-product-options') ||
                                     mutation.target.matches('.s-product-options-wrapper, .s-product-options-container') ||
                                     mutation.type === 'childList' &&
                                     (mutation.addedNodes.length || mutation.removedNodes.length)) {
                                   
                                   shouldRecreate = true;
                                   break;
                                 }
                               }
                               
                               if (shouldRecreate && !isCreatingButtons) {
                                 if (retryAttempts < MAX_RETRIES) {
                                   retryAttempts++;
                                   setTimeout(recreateOptionButtons, 100);
                                 }
                               }
                             });
                             
                             observer.observe(productForm, {
                               childList: true,
                               subtree: true,
                               attributes: true,
                               attributeFilter: ['style', 'class', 'hidden']
                             });
                           }
                         }, 200);
                       }
                       
                       // 6. Safety check that runs periodically
                       let lastCheckTime = Date.now();
                       
                       // Store interval reference for cleanup
                       const safetyCheckInterval = setInterval(() => {
                         if (Date.now() - lastCheckTime > 5000) {
                           const selects = document.querySelectorAll('.s-product-options-option[data-option-type="single-option"] select');
                           let needsRecreation = false;
                           
                           selects.forEach(select => {
                             if (select.options.length > 1) {
                               const container = select.parentElement.querySelector('.option-buttons-container');
                               if (!container || container.children.length === 0) {
                                 needsRecreation = true;
                               }
                             }
                           });
                           
                           if (needsRecreation) {
                             console.error('Periodic check: found missing option buttons, recreating...');
                             recreateOptionButtons();
                             lastCheckTime = Date.now();
                           }
                         }
                       }, 2000);
                       
                       // Add cleanup function
                       const cleanup = () => {
                         clearInterval(safetyCheckInterval);
                         if (typeof observer !== 'undefined') {
                           observer.disconnect();
                         }
                       };
                       
                       // Listen for page navigation in SPAs
                       document.addEventListener('turbolinks:before-visit', cleanup);
                     })();
                 })();
                 
                 // Fix for availability reminders on out-of-stock variations
              (function() {
                // Only run on product pages
                if (!document.body.classList.contains('product-single')) return;

                function fixOutOfStockButtons() {
                  // Find all option buttons and check if they're out-of-stock
                  const buttons = document.querySelectorAll('.option-button');

                  buttons.forEach(btn => {
                    const isOOS = btn.classList.contains('disabled') ||
                                  (btn.style.textDecoration || '').includes('line-through');
                    if (!isOOS) return;
                    if (btn.dataset.oosFixed === '1') return; // Already processed
                    btn.dataset.oosFixed = '1';

                    // Make it clickable but still visually indicate out-of-stock
                    btn.classList.remove('disabled');
                    btn.style.opacity = '0.7';
                    btn.style.cursor = 'pointer';
                    btn.style.textDecoration = 'line-through';

                    // Add ONE handler (capture to override existing)
                    btn.addEventListener('click', function(e) {
                      const wrapper = btn.closest('.s-product-options-option');
                      const select = wrapper ? wrapper.querySelector('select') : null;
                      if (!select) return;

                      // Set the value and trigger change event
                      select.value = btn.dataset.value;
                      select.dispatchEvent(new Event('change', { bubbles: true }));

                      // Update button states (selected style)
                      const container = btn.parentElement;
                      if (container) {
                        container.querySelectorAll('.option-button').forEach(b => {
                          b.classList.remove('selected');
                          b.style.borderColor = '#e5e7eb';
                          b.style.backgroundColor = '';
                        });
                      }

                      btn.classList.add('selected');
                      btn.style.borderColor = 'var(--color-primary)';
                      btn.style.backgroundColor = 'rgba(var(--color-primary-rgb, 0, 0, 0), 0.05)';
                    }, true);
                  });
                }

                // Run initially and after key events
                setTimeout(fixOutOfStockButtons, 1000);

                // Listen for product option changes
                document.addEventListener('salla.product.options.loaded', () => {
                  setTimeout(fixOutOfStockButtons, 500);
                });

                // Set up periodic check (now cheap - quickly no-ops on processed buttons)
                setInterval(fixOutOfStockButtons, 3000);
              })();


              (function(global) {
                'use strict';

                function injectStyles() {
                  const styleElement = document.createElement('style');
                  styleElement.textContent = `
                    .arabic-notification{position:fixed;top:26px;left:0;right:0;z-index:50;display:flex;justify-content:center;padding:0 16px;opacity:0;transform:translateY(-100px);transition:opacity .4s ease-out,transform .4s cubic-bezier(0.175,0.885,0.32,1.275)}
                    .arabic-notification.visible{opacity:1;transform:translateY(0)}
                    .notification-content{background-color:rgba(255,255,255,0.95);backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.1);border-radius:9999px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(212,172,132,0.2);width:fit-content;max-width:90%}
                    .notification-text{display:flex;align-items:center;gap:8px}
                    .notification-icon{color:#d4ac84;flex-shrink:0}
                    .notification-text p{font-size:0.75rem;font-weight:500;color:#1f2937;margin:0;width:auto}
                    .notification-close{margin-left:8px;color:#6b7280;background:none;border:none;padding:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:color .2s;flex-shrink:0}
                    .notification-close:hover{color:#374151}
                    @supports not (backdrop-filter:blur(8px)){.notification-content{background-color:rgba(255,255,255,0.98)}}
                    @media (max-width:640px){.notification-content{padding:8px 12px}}
                  `;
                  document.head.appendChild(styleElement);
                }

                function showArabicNotification(message, delay, duration) {
                  delay = delay !== undefined ? delay : 1000;
                  duration = duration !== undefined ? duration : 4050;
                  
                  if (document.querySelector('.arabic-notification')) {
                    return null;
                  }

                  const notificationContainer = document.createElement('div');
                  notificationContainer.className = 'arabic-notification';
                  
                  notificationContainer.innerHTML = `
                    <div class="notification-content">
                      <div class="notification-text">
                        <span class="notification-icon">📦</span>
                        <p dir="rtl" lang="ar">${message}</p>
                      </div>
                      <button class="notification-close" aria-label="Close notification">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  `;
                  
                  document.body.appendChild(notificationContainer);
                  
                  const closeButton = notificationContainer.querySelector('.notification-close');
                  const content = notificationContainer.querySelector('.notification-content');

                  const closeHandler = () => hideNotification(notificationContainer);

                  closeButton?.addEventListener('click', (event) => {
                    event.stopPropagation();
                    closeHandler();
                  });

                  content?.addEventListener('click', (event) => {
                    if (event.target.closest('.notification-close')) {
                      return;
                    }
                    event.stopPropagation();
                    closeHandler();
                  });
                  
                  const showTimer = setTimeout(function() {
                    notificationContainer.classList.add('visible');
                  }, delay);
                  
                  const hideTimer = setTimeout(function() {
                    hideNotification(notificationContainer);
                  }, delay + duration);
                  
                  notificationContainer._timers = {
                    show: showTimer,
                    hide: hideTimer
                  };
                  
                  return notificationContainer;
                }

                function hideNotification(notificationElement) {
                  if (!notificationElement) return;
                  
                  if (notificationElement._timers) {
                    clearTimeout(notificationElement._timers.show);
                    clearTimeout(notificationElement._timers.hide);
                  }
                  
                  notificationElement.classList.remove('visible');
                  
                  function removeElement() {
                    if (notificationElement.parentNode) {
                      notificationElement.parentNode.removeChild(notificationElement);
                    }
                  }
                  
                  if (typeof notificationElement.addEventListener === 'function') {
                    notificationElement.addEventListener('transitionend', removeElement, { once: true });
                    
                    setTimeout(removeElement, 500);
                  } else {
                    setTimeout(removeElement, 400);
                  }
                }

                injectStyles();
                
                function initialize() {
                  showArabicNotification("توصيل فوري في الرياض: 24 ساعة. باقي المدن:1-4 أيام");
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', initialize);
                } else {
                  initialize();
                }

                if (typeof exports !== 'undefined') {
                  exports.showArabicNotification = showArabicNotification;
                }
                
                if (typeof define === 'function' && define.amd) {
                  define([], function() {
                    return { showArabicNotification: showArabicNotification };
                  });
                }
                
                global.showArabicNotification = showArabicNotification;

              })(typeof window !== 'undefined' ? window : this);

              document.addEventListener('DOMContentLoaded', () => {
                // Create the coupon element if it doesn't exist
                let coupon = document.getElementById('discountCupon');
                if (!coupon) {
                  coupon = document.createElement('div');
                  coupon.id = 'discountCupon';
                  coupon.className = 'discountCupon';
                }
                
               // Create HTML structure
               coupon.innerHTML = `
                 <div class="ribbon"><div class="ribbon-text">خصم</div></div>
                 <div class="decorative-pattern"></div>
                 <div class="card-content">
                   <div class="coupon-header">
                     <div class="logo-container">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="gift-icon"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                      </div>
                      <div>
                        <h3 class="title">كوبون خصم 7%  </h3>
                     </div>
                   </div>
                   <div class="coupon-body">
                     <div class="timer-container">
                       <div class="timer-label">
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="timer-icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg>
                         <span id="timer-text">ينتهي العرض خلال:</span>
                       </div>
                       <div class="countdown-timer" id="coupon-countdown">
                         <div class="time-block">
                           <span class="time-digits" data-countdown="days">00</span>
                           <span class="time-label">يوم</span>
                         </div>
                         <span class="time-separator">:</span>
                         <div class="time-block">
                           <span class="time-digits" data-countdown="hours">00</span>
                           <span class="time-label">ساعة</span>
                         </div>
                         <span class="time-separator">:</span>
                         <div class="time-block">
                           <span class="time-digits" data-countdown="minutes">00</span>
                           <span class="time-label">دقيقة</span>
                         </div>
                         <span class="time-separator">:</span>
                         <div class="time-block">
                           <span class="time-digits" data-countdown="seconds">00</span>
                           <span class="time-label">ثانية</span>
                         </div>
                       </div>
                     </div>
                     <div class="code-container">
                       <div class="code-box">
                         <div class="code-label">كود الخصم:</div>
                         <div id="coupon-code" class="code-value" data-coupon="Darlena">Darlena</div>
                       </div>
                        <button id="copy-btn" class="copy-button">نسخ</button>
                      </div>
                      <div class="dot-pattern left"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                      <div class="dot-pattern right"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                    </div>
                  </div>`;
                
                // Add toast notification if it doesn't exist
                if (!document.getElementById('toast')) {
                  document.body.insertAdjacentHTML('beforeend',
                    `<div id="toast" class="toast hidden"><div class="toast-content"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg><span>تم نسخ كود الخصم</span></div></div>`);
                }
                
                // Insert coupon in the appropriate location based on page type
                if (document.body.classList.contains('index')) {
                  // Home page implementation
                  const features = document.querySelector('#best-offers-4-slider');
                  if (features) {
                    coupon.classList.add('homepage-coupon');
                    features.parentNode.insertBefore(coupon, features);
                  }
                } else if (document.body.classList.contains('product-single')) {
                  // Product page implementation (skip jalabiya products)
                  let decodedPath = window.location.pathname || '';
                  try {
                    decodedPath = decodeURIComponent(decodedPath);
                  } catch (err) {
                    decodedPath = window.location.pathname || '';
                  }

                  const productTitle = (document.querySelector('.product-single .main-content h1')?.textContent || '').trim();
                  const productText = `${decodedPath} ${productTitle}`;
                  const jalabiyaKeywords = ['جلابية', 'جلابيه', 'جلابيات', 'جلابيهات'];
                  const isJalabiyaProduct = jalabiyaKeywords.some((keyword) => productText.includes(keyword));

                  if (!isJalabiyaProduct) {
                    const productForm = document.querySelector('form.form.product-form');
                    if (productForm) {
                      coupon.classList.add('product-coupon');
                      productForm.parentNode.insertBefore(coupon, productForm);
                    }
                  }
                }
               
               // Cache DOM elements
               const btn = document.getElementById('copy-btn'),
                     code = document.getElementById('coupon-code');

               // Countdown setup
               const countdownRoot = document.getElementById('coupon-countdown');
               const timerContainer = document.querySelector('#discountCupon .timer-container');
               const TARGET_TIME = new Date('2025-10-07T23:59:59+03:00').getTime();
               let countdownInterval = null;

               function hideTimer() {
                 if (timerContainer) {
                   timerContainer.style.display = 'none';
                 }
                 if (countdownRoot) {
                   countdownRoot.style.display = 'none';
                 }
               }

               function showTimer() {
                 if (timerContainer) {
                   timerContainer.style.display = '';
                 }
                 if (countdownRoot) {
                   countdownRoot.style.display = '';
                 }
               }

               function updateCountdown() {
                 if (!countdownRoot) return;

                 const now = Date.now();
                 let diff = TARGET_TIME - now;

                if (diff <= 0) {
                  diff = 0;
                  clearInterval(countdownInterval);
                  hideTimer();
                }

                 const seconds = Math.floor((diff / 1000) % 60);
                 const minutes = Math.floor((diff / (1000 * 60)) % 60);
                 const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                 const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                 const segments = {
                   days: days.toString().padStart(2, '0'),
                   hours: hours.toString().padStart(2, '0'),
                   minutes: minutes.toString().padStart(2, '0'),
                   seconds: seconds.toString().padStart(2, '0')
                 };

                 Object.entries(segments).forEach(([key, value]) => {
                   const el = countdownRoot.querySelector(`[data-countdown="${key}"]`);
                   if (el) el.textContent = value;
                 });

              }

               if (countdownRoot) {
                 const now = Date.now();
                 const initialDiff = TARGET_TIME - now;

                 if (initialDiff <= 0) {
                   hideTimer();
                 } else {
                   showTimer();
                   updateCountdown();
                   countdownInterval = setInterval(updateCountdown, 1000);
                 }
               }
               
               // Copy functionality
               if (btn && code) {
                 btn.addEventListener('click', async function() {
                  const couponValue = code.getAttribute('data-coupon') || 'Darlena';
                  let copySuccess = false;

                  // Try modern Clipboard API first (works in most browsers)
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    try {
                      await navigator.clipboard.writeText(couponValue);
                      copySuccess = true;
                    } catch (err) {
                      console.warn('Clipboard API failed, falling back to execCommand:', err);
                    }
                  }

                  // Fallback to execCommand for older browsers
                  if (!copySuccess) {
                    try {
                      const tmp = document.createElement('textarea');
                      tmp.value = couponValue;
                      tmp.style.position = 'fixed';
                      tmp.style.opacity = '0';
                      document.body.appendChild(tmp);
                      tmp.select();
                      tmp.setSelectionRange(0, tmp.value.length);

                      copySuccess = document.execCommand('copy');  // CHECK RETURN VALUE!

                      document.body.removeChild(tmp);
                    } catch (err) {
                      console.error('execCommand copy failed:', err);
                      copySuccess = false;
                    }
                  }

                  // Only show success if copy actually worked
                  if (copySuccess) {
                    btn.classList.add('copied');
                    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:scaleUp .3s"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

                    const toast = document.getElementById('toast');
                    if (toast) {
                      toast.classList.remove('hidden');
                      toast.classList.add('show');
                    }

                    setTimeout(() => {
                      btn.classList.remove('copied');
                      btn.textContent = 'نسخ';
                      if (toast) {
                        toast.classList.remove('show');
                        toast.classList.add('hidden');
                      }
                    }, 2000);
                  } else {
                    // Show error if copy failed
                    alert('فشل نسخ الكود، حاول مرة أخرى أو انسخ الكود يدوياً: Darlena');
                  }
                });
               }
              });

              // Size message feature implementation
              window.addEventListener('load', function() {
                setTimeout(initSizeMessageFeature, 1500);
                setTimeout(initSizeMessageFeature, 3000);
                setTimeout(initSizeMessageFeature, 5000);
              });

              function initSizeMessageFeature() {
                // Only run on product pages to prevent infinite loops on other pages
                if (!document.body.classList.contains('product-single')) return;

                let sizeButtonAttempts = 0;
                const MAX_SIZE_BUTTON_ATTEMPTS = 15;

                function parseProductDescription() {
                  const productDescription = document.querySelector('.product__description');
                  if (!productDescription) return {};
                  
                  const paragraphs = productDescription.querySelectorAll('p');
                  const sizeMessages = {};
                  
                  paragraphs.forEach((paragraph) => {
                    const content = paragraph.textContent.trim();
                    const sizeMessageRegex = /size_message([a-z]+|\d+):(\d+)\/(\d+)/i;
                    const match = content.match(sizeMessageRegex);
                    
                    if (match) {
                      const size = match[1].toUpperCase();
                      const day = match[2];
                      const month = match[3];
                      sizeMessages[size] = `${month}/${day}`;
                      paragraph.style.display = 'none';
                    }
                  });
                  
                  return sizeMessages;
                }
                
                function calculateDaysRemaining(dateString) {
                  const today = new Date();
                  const [month, day] = dateString.split('/');
                  
                  let targetDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
                  if (targetDate < today) {
                    targetDate = new Date(today.getFullYear() + 1, parseInt(month) - 1, parseInt(day));
                  }
                  
                  const timeDiff = targetDate - today;
                  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                }
                
                function createSizeMessage(daysRemaining) {
                  const messageContainer = document.createElement('div');
                  messageContainer.className = 'size-message';
                  
                  messageContainer.innerHTML = `
                    <div class="size-message-title">الطلب مرتفع على هذا المقاس! 🔥</div>
                    <div class="size-message-content">سيستغرق شحن هذا المقاس ${daysRemaining} يوم. اطلبيه الآن لضمان حصولكِ عليه</div>
                  `;
                  
                  return messageContainer;
                }
                
                function createAvailableMessage() {
                  const messageContainer = document.createElement('div');
                  messageContainer.className = 'size-message available-message';
                  
                  messageContainer.innerHTML = `
                    <div class="size-message-title available-title">
                      متوفر
                    </div>
                    <div class="size-message-content">شحن فوري: يصل لباب بيتك خلال 1 الى 4 ايام</div>
                  `;
                  
                  return messageContainer;
                }
                
                function removeExistingMessage() {
                  const currentMessage = document.querySelector('.size-message');
                  if (currentMessage) {
                    currentMessage.remove();
                    return true;
                  }
                  return false;
                }
                
                function setupSizeButtons(sizeMessages) {
                  const sizeButtons = document.querySelectorAll('.option-button');
                  if (sizeButtons.length === 0) {
                    sizeButtonAttempts++;
                    if (sizeButtonAttempts < MAX_SIZE_BUTTON_ATTEMPTS) {
                      setTimeout(() => setupSizeButtons(sizeMessages), 400);
                    }
                    return;
                  }
                  
                  const markerClass = 'has-size-message-listener';
                  
                  sizeButtons.forEach(button => {
                    if (button.classList.contains(markerClass)) return;
                    
                    button.classList.add(markerClass);
                    const sizeText = button.textContent.trim();
                    const normalizedSizeText = sizeText.toUpperCase();
                    
                    button.addEventListener('click', function() {
                      removeExistingMessage();
                      
                      const isOutOfStock = button.style.textDecoration?.includes('line-through') ||
                                         button.classList.contains('disabled') ||
                                         button.style.opacity === '0.7';
                      
                      if (!isOutOfStock) {
                        let hasCustomMessage = false;
                        
                        Object.entries(sizeMessages).forEach(([size, dateString]) => {
                          if (normalizedSizeText === size) {
                            const daysRemaining = calculateDaysRemaining(dateString);
                            if (daysRemaining < 30) {
                              hasCustomMessage = true;
                              const messageElement = createSizeMessage(daysRemaining);
                              
                              const optionsContainer = document.querySelector('.s-product-options-option-content');
                              if (optionsContainer) {
                                optionsContainer.parentNode.insertBefore(messageElement, optionsContainer.nextSibling);
                              }
                            }
                            // If days remaining is 30 or more, we don't set hasCustomMessage = true
                            // which means it will display the "available" message instead
                          }
                        });
                        
                        if (!hasCustomMessage) {
                          const messageElement = createAvailableMessage();
                          
                          const optionsContainer = document.querySelector('.s-product-options-option-content');
                          if (optionsContainer) {
                            optionsContainer.parentNode.insertBefore(messageElement, optionsContainer.nextSibling);
                          }
                        }
                      }
                    });
                  });
                  
                  const selectedButton = document.querySelector('.option-button.selected');
                  if (selectedButton) {
                    selectedButton.click();
                  }
                }
                
                const sizeMessages = parseProductDescription();
                setupSizeButtons(sizeMessages);
              }

              document.addEventListener('salla.product.options.loaded', function() {
                setTimeout(initSizeMessageFeature, 1000);
              });

             document.addEventListener('salla.product.options.updated', function() {
               setTimeout(initSizeMessageFeature, 1000);
             });

             (function () {
               'use strict';

               if (window.__darlenaPromoteProductModule) {
                 window.__darlenaPromoteProductModule.init();
                 return;
               }

               const PARAM = 'promote_product';
               const ID_PATTERN = /^\d+$/;
               const MODE_PARAM = 'promote_products_mode';
               const CATEGORY_BODY_CLASSES = [
                 'product-index',
                 'page-product-index',
                 'page-product-index-tag',
                 'category-index',
                 'categories-index',
                 'tag-index',
                 'tags-index'
               ];
               const CATEGORY_SLUGS = new Set([
                 'product.index',
                 'product.index.tag'
               ]);

               const state = {
                 promotedIds: [],
                 promoteOnly: false,
                 firstListHandled: false,
                 overflowQueue: [],
                 handledLists: new WeakSet(),
                 observer: null,
                 highlightedCards: new Map(),
                 highlightTimeout: null
               };

               function isCategoryOrTagPage() {
                 const body = document.body;
                 if (!body) return false;

                 for (const cls of CATEGORY_BODY_CLASSES) {
                   if (body.classList.contains(cls)) {
                     return true;
                   }
                 }

                 const bodySlug = body.getAttribute('data-page-slug');
                 if (bodySlug && CATEGORY_SLUGS.has(bodySlug)) {
                   return true;
                 }

                 const sallaSlug = typeof window.salla?.config?.get === 'function'
                   ? window.salla.config.get('page.slug')
                   : null;
                 if (sallaSlug && CATEGORY_SLUGS.has(sallaSlug)) {
                   return true;
                 }

                 if (document.querySelector('salla-products-list[source="product.index"], salla-products-list[source="product.index.tag"]')) {
                   return true;
                 }

                 return false;
               }

               function readParams() {
                 const params = new URLSearchParams(window.location.search);
                 const raw = params.get(PARAM);
                 if (!raw) return { ids: [], only: false };

                 const ids = raw
                   .split(',')
                   .map(part => part.trim())
                   .filter(Boolean)
                   .filter((id, index, arr) => ID_PATTERN.test(id) && arr.indexOf(id) === index)
                   .slice(0, 12);

                 const modeRaw = (params.get(MODE_PARAM) || '').toLowerCase();
                 const only = modeRaw === 'only';

                 return { ids, only };
               }

               function resetState() {
                 state.firstListHandled = false;
                 state.overflowQueue = [];
                 state.handledLists = new WeakSet();
                 state.highlightedCards.forEach(entry => {
                   entry.card?.classList.remove('promoted-product-card');
                   entry.badge?.remove();
                 });
                 state.highlightedCards.clear();
                 if (state.highlightTimeout) {
                   clearTimeout(state.highlightTimeout);
                   state.highlightTimeout = null;
                 }
               }

               function startObserver() {
                 if (typeof MutationObserver === 'undefined' || !document.body) {
                   return;
                 }

                 if (state.observer) {
                   state.observer.disconnect();
                 }

                 state.observer = new MutationObserver(handleMutations);
                 state.observer.observe(document.body, { childList: true, subtree: true });
               }

               function stopObserver() {
                 if (!state.observer) return;
                 state.observer.disconnect();
                 state.observer = null;
               }

               function ensureHighlightBadge(card, productId) {
                 if (!card) return;

                 card.classList.add('promoted-product-card');

                 const imageWrapper = card.querySelector('.s-product-card-image, .s-product-card-image-full');
                 if (!imageWrapper) return;

                 let badge = imageWrapper.querySelector('.promoted-product-card__badge');
                 if (!badge) {
                   badge = document.createElement('div');
                   badge.className = 'promoted-product-card__badge';
                   const label = document.createElement('span');
                   label.textContent = 'عباية الإعلان';
                   badge.appendChild(label);
                   imageWrapper.appendChild(badge);
                 }

                 state.highlightedCards.set(productId, { card, badge });
               }

               function highlightPromotedCards(attempt = 0) {
                 if (!state.promotedIds.length) return;

                 const container = document.querySelector('.ranked-products');
                 if (!container) {
                   if (attempt < 20) {
                     state.highlightTimeout = setTimeout(() => highlightPromotedCards(attempt + 1), 120);
                   }
                   return;
                 }

                 let missing = false;

                 state.promotedIds.forEach(id => {
                   const card = container.querySelector(`custom-salla-product-card[id="${id}"]`)
                     || container.querySelector(`.s-product-card-entry[id="${id}"]`);

                   if (card) {
                     ensureHighlightBadge(card, id);
                   } else {
                     missing = true;
                   }
                 });

                 if (missing && attempt < 20) {
                   state.highlightTimeout = setTimeout(() => highlightPromotedCards(attempt + 1), 120);
                 }
               }

               function queueHighlight() {
                 if (state.highlightTimeout) {
                   clearTimeout(state.highlightTimeout);
                 }
                 state.highlightTimeout = setTimeout(() => highlightPromotedCards(0), 120);
               }

               function handleMutations(mutations) {
                 if (!state.promotedIds.length) return;
                 for (const mutation of mutations) {
                   for (const node of mutation.addedNodes) {
                     if (node.nodeType !== 1) continue;
                     if (node.matches?.('salla-products-list')) {
                       scheduleProcess(node);
                     }
                     if (node.querySelectorAll) {
                       node.querySelectorAll('salla-products-list').forEach(scheduleProcess);
                     }
                   }
                 }
               }

               function processExistingLists() {
                 document
                   .querySelectorAll('.ranked-products salla-products-list[source="selected"]')
                   .forEach(scheduleProcess);
               }

               function scheduleProcess(listEl, attempt = 0) {
                 if (!state.promotedIds.length || !listEl || state.handledLists.has(listEl)) return;
                 if (listEl.getAttribute('source') !== 'selected') return;
                 if (!listEl.closest('.ranked-products')) return;

                 const raw = listEl.getAttribute('source-value');
                 if (!raw) {
                   if (attempt >= 20) return;
                   setTimeout(() => scheduleProcess(listEl, attempt + 1), 60);
                   return;
                 }

                 applyPromotion(listEl, raw);
               }

               function applyPromotion(listEl, rawValue) {
                 if (state.handledLists.has(listEl)) return;

                 let ids;
                 try {
                   ids = JSON.parse(rawValue);
                 } catch {
                   return;
                 }

                 if (!Array.isArray(ids) || !ids.length) return;

                 const limitAttr = parseInt(listEl.getAttribute('limit'), 10);
                 const limit = Number.isFinite(limitAttr) && limitAttr > 0 ? limitAttr : ids.length;
                 const promotedSet = new Set(state.promotedIds);
                 const remaining = ids.filter(id => !promotedSet.has(String(id)) && !promotedSet.has(id));

                 let nextIds;

                 if (!state.firstListHandled) {
                   state.firstListHandled = true;

                   if (state.promoteOnly) {
                     nextIds = state.promotedIds.slice();
                     state.overflowQueue = [];
                   } else {
                     nextIds = [...state.promotedIds, ...remaining];
                     if (nextIds.length > limit) {
                       state.overflowQueue.push(...nextIds.splice(limit));
                     }
                   }
                 } else {
                   if (state.promoteOnly) {
                     nextIds = [];
                   } else {
                     nextIds = remaining;
                     if (state.overflowQueue.length) {
                       const prefix = [];
                       while (prefix.length + nextIds.length < limit && state.overflowQueue.length) {
                         prefix.push(state.overflowQueue.shift());
                       }
                       nextIds = prefix.concat(nextIds);
                     }
                     if (nextIds.length > limit) {
                       const extras = nextIds.splice(limit);
                       state.overflowQueue.unshift(...extras);
                     }
                   }
                 }

                 if (!nextIds.length) {
                   listEl.setAttribute('source-value', JSON.stringify([]));
                   listEl.setAttribute('limit', '0');
                   return;
                 }

                 const newValue = JSON.stringify(nextIds);
                 if (newValue === rawValue) {
                   state.handledLists.add(listEl);
                   return;
                 }

                 state.handledLists.add(listEl);
                 listEl.setAttribute('source-value', newValue);
                 listEl.setAttribute('limit', String(nextIds.length));

                 if (typeof listEl.reload === 'function') {
                   try {
                     listEl.reload();
                   } catch (err) {
                     /* noop */
                   }
                 }

                 queueHighlight();
               }

               function initialize() {
                 if (!document.body) {
                   setTimeout(initialize, 50);
                   return;
                 }

                 if (!isCategoryOrTagPage()) {
                   state.promotedId = null;
                   stopObserver();
                   resetState();
                   return;
                 }

                 const { ids, only } = readParams();

                 if (!ids.length) {
                   state.promotedIds = [];
                   state.promoteOnly = false;
                   stopObserver();
                   resetState();
                   return;
                 }

                 state.promotedIds = ids;
                 state.promoteOnly = only;
                 resetState();
                 startObserver();
                 processExistingLists();
                 queueHighlight();
               }

               window.__darlenaPromoteProductModule = { init: initialize };

               if (document.readyState === 'loading') {
                 document.addEventListener('DOMContentLoaded', initialize);
               } else {
                 initialize();
               }

               document.addEventListener('salla::ready', () => {
                 setTimeout(initialize, 0);
               });

               document.addEventListener('salla::page::changed', () => {
                 setTimeout(initialize, 120);
               });
             })();

            // Product Variant Validation with Auto-Scroll
            (function () {
              'use strict';

              const attachValidation = () => {
                const sallaApp = window.salla;

                if (!sallaApp?.config?.get) {
                  return;
                }

                if (sallaApp.config.get('page.slug') !== 'product.single') {
                  return;
                }

                const form = document.querySelector('.product-form');
                if (!form || form.dataset.variantValidationAttached === 'true') {
                  return;
                }

                form.dataset.variantValidationAttached = 'true';
                form.setAttribute('novalidate', '');

                const runValidation = () => {
                  if (form.checkValidity()) {
                    return true;
                  }

                  form.reportValidity?.();

                  const optionsComponent = form.querySelector('salla-product-options');
                  if (optionsComponent) {
                    optionsComponent.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    });

                    optionsComponent.classList.add('variant-required-highlight');

                    if (optionsComponent.__variantHighlightTimeout) {
                      clearTimeout(optionsComponent.__variantHighlightTimeout);
                    }

                    optionsComponent.__variantHighlightTimeout = window.setTimeout(() => {
                      optionsComponent.classList.remove('variant-required-highlight');
                      delete optionsComponent.__variantHighlightTimeout;
                    }, 2000);
                  }

                  const message = sallaApp?.lang?.get?.('common.messages.required_fields')
                    || 'الرجاء تعبئة جميع الحقول المطلوبة';

                  sallaApp?.notify?.error?.(message);

                  return false;
                };

                const handleInvalidSubmit = (event) => {
                  if (runValidation()) {
                    return;
                  }

                  event.preventDefault();
                  event.stopImmediatePropagation();
                };

                const guardQuickBuy = () => {
                  const widget = form.querySelector('salla-mini-checkout-widget');
                  if (!widget || widget.dataset.variantGuardAttached === 'true') {
                    return;
                  }

                  widget.dataset.variantGuardAttached = 'true';

                  const interceptClick = (element) => {
                    if (!element) return;

                    element.addEventListener('click', (event) => {
                      if (runValidation()) {
                        return;
                      }

                      event.preventDefault();
                      event.stopImmediatePropagation();
                      event.stopPropagation();
                    }, true);
                  };

                  interceptClick(widget.querySelector('.s-add-product-button-mini-checkout-content'));

                  const observer = new MutationObserver(() => {
                    const walletButtons = widget.querySelectorAll('button, salla-payment-wallet');
                    walletButtons.forEach((btn) => interceptClick(btn));
                  });

                  observer.observe(widget, { childList: true, subtree: true });

                  widget.__variantGuardObserver = observer;
                };

                form.addEventListener('submit', handleInvalidSubmit, true);

                guardQuickBuy();

                const quickBuyInitObserver = new MutationObserver(() => guardQuickBuy());
                quickBuyInitObserver.observe(form, { childList: true, subtree: true });

                form.__variantQuickBuyObserver = quickBuyInitObserver;
              };

              const bootstrap = () => {
                if (document.readyState !== 'loading' && window.app?.status === 'ready') {
                  attachValidation();
                } else {
                  document.addEventListener('theme::ready', attachValidation, { once: true });
                }

                document.addEventListener('salla::page::changed', attachValidation);
              };

              bootstrap();
            })();
        // Load Algolia bundle from jsDelivr
          (function() {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/gh/Aliyu93/bundle@v1.9.8/dist/algolia-bundle.min.js';
            script.defer = true;  // ← Changed from async to defer
            document.head.appendChild(script);
            console.log('✅ Algolia bundle script injected_2');
          })();

       // Unified Ad Attribution Tracking (Snap + TikTok + Meta)
       (function() {
         'use strict';

         // Prevent duplicate installation
         if (window.__darlenaUnifiedAttributionInstalled) return;
         window.__darlenaUnifiedAttributionInstalled = true;

         // Click ID configurations
         var CLICK_IDS = {
           ScCid:  { key: 'snap_ScCid',     keyTs: 'snap_ScCid_ts',     maxAgeDays: 28,  urlParams: ['ScCid', 'sccid'] },
           ttclid: { key: 'tiktok_ttclid',  keyTs: 'tiktok_ttclid_ts',  maxAgeDays: 28,  urlParams: ['ttclid'] },
           fbclid: { key: 'darlena_fbclid', keyTs: 'darlena_fbclid_ts', maxAgeDays: 90,  urlParams: ['fbclid'] }
         };

         // Cookie ID configurations (platform-set cookies)
         var COOKIE_IDS = {
           scid: { key: 'snap_scid',   keyTs: 'snap_scid_ts',   maxAgeDays: 28, cookieName: '_scid', urlParams: ['scid', '_scid'] },
           ttp:  { key: 'tiktok_ttp',  keyTs: 'tiktok_ttp_ts',  maxAgeDays: 28, cookieName: '_ttp',  urlParams: ['ttp', '_ttp'] },
           fbc:  { key: 'meta_fbc',    keyTs: 'meta_fbc_ts',    maxAgeDays: 90, cookieName: '_fbc',  urlParams: ['fbc', '_fbc'] },
           fbp:  { key: 'meta_fbp',    keyTs: 'meta_fbp_ts',    maxAgeDays: 90, cookieName: '_fbp',  urlParams: ['fbp', '_fbp'] }
         };

         // ============ STORAGE ============
         function loadClickId(config) {
           // Try sessionStorage first
           try {
             var v = sessionStorage.getItem(config.key);
             if (v) return v;
           } catch (e) {}

           // Try localStorage with expiry check
           try {
             var v2 = localStorage.getItem(config.key);
             var ts = parseInt(localStorage.getItem(config.keyTs) || '', 10);
             if (!v2) return null;
             var maxAgeMs = config.maxAgeDays * 24 * 60 * 60 * 1000;
             if (!ts || Number.isNaN(ts) || (Date.now() - ts) > maxAgeMs) {
               localStorage.removeItem(config.key);
               localStorage.removeItem(config.keyTs);
               return null;
             }
             return v2;
           } catch (e) {}
           return null;
         }

         function storeClickId(config, value) {
           try { sessionStorage.setItem(config.key, value); } catch(e) {}
           try {
             localStorage.setItem(config.key, value);
             localStorage.setItem(config.keyTs, String(Date.now()));
           } catch(e) {}
         }

         // ============ EXTRACT FROM URL ============
         function extractFromUrl(config) {
           try {
             var params = new URLSearchParams(window.location.search);
             for (var i = 0; i < config.urlParams.length; i++) {
               var val = params.get(config.urlParams[i]);
               if (val) return val;
             }
           } catch (e) {}
           return null;
         }

         // ============ GET COOKIE ============
         function getCookie(name) {
           try {
             var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
             return match ? match[2] : null;
           } catch (e) {}
           return null;
         }

         // ============ LOAD ALL IDS ============
         var activeClickIds = {};  // { ScCid: 'xxx', ttclid: 'yyy', fbclid: 'zzz' }
         var activeCookieIds = {}; // { scid: 'aaa', ttp: 'bbb', fbc: 'ccc', fbp: 'ddd' }

         function refreshClickIds() {
           Object.keys(CLICK_IDS).forEach(function(paramName) {
             var config = CLICK_IDS[paramName];
             var fromUrl = extractFromUrl(config);
             if (fromUrl) {
               storeClickId(config, fromUrl);
               activeClickIds[paramName] = fromUrl;
             } else {
               var stored = loadClickId(config);
               if (stored) {
                 activeClickIds[paramName] = stored;
               } else {
                 delete activeClickIds[paramName];
               }
             }
           });
         }

         function refreshCookieIds() {
           Object.keys(COOKIE_IDS).forEach(function(paramName) {
             var config = COOKIE_IDS[paramName];
             var fromCookie = getCookie(config.cookieName);
             if (fromCookie) {
               storeClickId(config, fromCookie);
               activeCookieIds[paramName] = fromCookie;
             } else {
               var stored = loadClickId(config);
               if (stored) {
                 activeCookieIds[paramName] = stored;
               } else {
                 delete activeCookieIds[paramName];
               }
             }
           });
         }

         refreshClickIds();
         // Load cookie IDs (platform-set cookies)
         refreshCookieIds();

         // Exit early if no IDs present
         if (Object.keys(activeClickIds).length === 0 && Object.keys(activeCookieIds).length === 0) {
           // Define no-op helper so callers don't break
           window.darlenaEnrichDeepLink = function(url) { return url; };
           return;
         }

         // ============ URL ENRICHMENT ============
         function isAllowedHost(hostname) {
           return hostname === 'darlena.com' || hostname.endsWith('.darlena.com');
         }

         function isDeepLink(url) {
           return url.indexOf('darlena://') === 0 || url.indexOf('darlena.page.link') !== -1;
         }

         function appendClickIds(url) {
           if (!url) return url;
           // Safety: skip anchor-only links (e.g., href="#section") - would break JS toggles
           if (url.charAt(0) === '#') return url;
           // Safety: skip if URL is already very long (prevents exceeding limits)
           if (url.length > 2500) return url;
           try {
             refreshClickIds();
             refreshCookieIds();
             // Handle custom scheme (darlena://)
             if (url.indexOf('darlena://') === 0) {
               var result = url;
               Object.keys(activeClickIds).forEach(function(param) {
                 // Check all param variants (e.g., ScCid and sccid) to avoid duplicates
                 var config = CLICK_IDS[param];
                 if (!config || !config.urlParams) return;
                 var alreadyHas = config.urlParams.some(function(p) {
                   return result.indexOf(p + '=') !== -1;
                 });
                 if (!alreadyHas) {
                   var sep = result.indexOf('?') === -1 ? '?' : '&';
                   result = result + sep + param + '=' + encodeURIComponent(activeClickIds[param]);
                 }
               });
               Object.keys(activeCookieIds).forEach(function(param) {
                 var config = COOKIE_IDS[param];
                 if (!config || !config.urlParams) return;
                 var alreadyHas = config.urlParams.some(function(p) {
                   return result.indexOf(p + '=') !== -1;
                 });
                 if (!alreadyHas) {
                   var sep = result.indexOf('?') === -1 ? '?' : '&';
                   result = result + sep + param + '=' + encodeURIComponent(activeCookieIds[param]);
                 }
               });
               return result;
             }

             // Handle standard URLs
             var urlObj = new URL(url, window.location.origin);

             // For regular links, only enrich darlena.com
             // For deep links (darlena.page.link), always enrich
             if (!isDeepLink(url) && !isAllowedHost(urlObj.hostname)) return url;

             Object.keys(activeClickIds).forEach(function(param) {
               // Check all param variants (e.g., ScCid and sccid) to avoid duplicates
               var config = CLICK_IDS[param];
               if (!config || !config.urlParams) return;
               var alreadyHas = config.urlParams.some(function(p) {
                 return urlObj.searchParams.has(p);
               });
               if (!alreadyHas) {
                 urlObj.searchParams.set(param, activeClickIds[param]);
               }
             });

             Object.keys(activeCookieIds).forEach(function(param) {
               var config = COOKIE_IDS[param];
               if (!config || !config.urlParams) return;
               var alreadyHas = config.urlParams.some(function(p) {
                 return urlObj.searchParams.has(p);
               });
               if (!alreadyHas) {
                 urlObj.searchParams.set(param, activeCookieIds[param]);
               }
             });
             return urlObj.toString();
           } catch (e) {
             return url;
           }
         }

         // ============ LINK REWRITING ============
         function rewriteAllLinks() {
           var links = document.querySelectorAll('a[href]');
           for (var i = 0; i < links.length; i++) {
             var a = links[i];
             var href = a.getAttribute('href');
             var rewritten = appendClickIds(href);
             if (rewritten && rewritten !== href) a.setAttribute('href', rewritten);
           }
         }

         function enrichDeepLinks() {
           var selectors = [
             'a[href^="darlena://"]',
             'a[href*="darlena.page.link"]',
             '.open-in-app-btn',
             '[data-deep-link]'
           ];
           var links = document.querySelectorAll(selectors.join(','));
           links.forEach(function(link) {
             // Enrich href
             var href = link.getAttribute('href');
             if (href) {
               var enriched = appendClickIds(href);
               if (enriched && enriched !== href) link.setAttribute('href', enriched);
             }
             // Enrich data attributes
             ['data-href', 'data-url', 'data-deep-link'].forEach(function(attr) {
               var value = link.getAttribute(attr);
               if (value) {
                 var enriched = appendClickIds(value);
                 if (enriched && enriched !== value) link.setAttribute(attr, enriched);
               }
             });
           });
         }

         // ============ INITIALIZE ============
         function init() {
           rewriteAllLinks();
           enrichDeepLinks();
           // Re-apply IDs on the current URL if the platform stripped query params.
           ensureCurrentUrlHasIds();
           setTimeout(function() {
             rewriteAllLinks();
             enrichDeepLinks();
             ensureCurrentUrlHasIds();
           }, 2000);
         }

         if (document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', init);
         } else {
           init();
         }

         // ============ MUTATION OBSERVER (guarded + debounced) ============
         function startObserver() {
           if (typeof MutationObserver === 'undefined') return;
           if (!document.body) return;

           var scheduled = false;
           function scheduleRewrite() {
             if (scheduled) return;
             scheduled = true;
             setTimeout(function() {
               scheduled = false;
               rewriteAllLinks();
               enrichDeepLinks();
             }, 50);
           }

           var observer = new MutationObserver(function(mutations) {
             var shouldEnrich = mutations.some(function(m) {
               return m.addedNodes && m.addedNodes.length > 0;
             });
             if (shouldEnrich) scheduleRewrite();
           });
           observer.observe(document.body, { childList: true, subtree: true });
         }

         if (document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', startObserver);
         } else {
           startObserver();
         }

         // ============ CLICK CAPTURE ============
         document.addEventListener('click', function(e) {
           var link = e.target && e.target.closest ? e.target.closest('a') : null;
           if (!link) return;
           var rawHref = link.getAttribute('href') || '';
           if (!rawHref || rawHref.charAt(0) === '#') return;
           var rewritten = appendClickIds(rawHref);
           if (rewritten && rewritten !== rawHref) {
             link.setAttribute('href', rewritten);
           }
         }, true);

         // ============ GLOBAL HELPER ============
         window.darlenaEnrichDeepLink = appendClickIds;

         // ============ CURRENT URL FIXUP ============
         function ensureCurrentUrlHasIds() {
           try {
             if (!isAllowedHost(window.location.hostname)) return;
             var current = window.location.href;
             var enriched = appendClickIds(current);
             if (enriched && enriched !== current) {
               window.history.replaceState({}, '', enriched);
             }
           } catch (e) {}
         }
       })();

         // ============ order redirect ============

     (function() {
       try {
         // Homepage: redirect
         if (window.location.pathname === '/' && document.referrer.includes('/orders/national-address/')) {
           sessionStorage.setItem('capture_purchase', 'true');
           window.location.href = '/orders';
           return;
         }
         
         // /orders: wait for table, then set flag with order ID
         if (window.location.pathname === '/orders' && sessionStorage.getItem('capture_purchase') === 'true') {
           
           function waitForOrder() {
             var firstRow = document.querySelector('.s-orders-table-tbody-tr');
             if (!firstRow) {
               setTimeout(waitForOrder, 300);
               return;
             }
             
             var refIdEl = firstRow.querySelector('.s-orders-reference-id');
             var refId = refIdEl ? refIdEl.textContent.replace('#', '').trim() : null;
             
             if (!refId) return;
             
             // Check if already fired
             var firedOrders = JSON.parse(localStorage.getItem('fired_purchases') || '[]');
             if (firedOrders.includes(refId)) {
               sessionStorage.removeItem('capture_purchase');
               return;
             }
             
             // Mark as fired BEFORE triggering GTM
             firedOrders.push(refId);
             localStorage.setItem('fired_purchases', JSON.stringify(firedOrders));
             
             // Now trigger GTM
             window.dataLayer = window.dataLayer || [];
             window.dataLayer.push({ event: 'deferred_purchase' });
             
             sessionStorage.removeItem('capture_purchase');
           }
           
           waitForOrder();
         }
       } catch (e) {
       }
     })();

     (function() {
       function injectExternal() {
         if (document.getElementById('darlena-jsdelivr-script')) return;
         var script = document.createElement('script');
         script.id = 'darlena-jsdelivr-script';
         script.src = 'https://cdn.jsdelivr.net/gh/Aliyu93/attribution@v1.0.3/attribution.js';
         script.defer = true;
         document.head.appendChild(script);
       }

       function scheduleInject() {
         if (typeof requestIdleCallback === 'function') {
           requestIdleCallback(injectExternal, { timeout: 5000 });
         } else {
           setTimeout(injectExternal, 2000);
         }
       }

       if (document.readyState === 'complete') {
         setTimeout(scheduleInject, 1500);
       } else {
         window.addEventListener('load', function() {
           setTimeout(scheduleInject, 1500);
         });
       }
     })();
