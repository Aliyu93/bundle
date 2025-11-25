import { redisService } from '../services/redis-service.js';

class CategoryProductsComponent extends HTMLElement {
    constructor() {
        super();
        this.state = {
            productsPerPage: 30,
            categories: [],
            trendingCategory: {
                name: 'رائج الان',
                slug: 'trending-now',
                filter: null,
                hasSubcats: false,
                url: null
            }
        };
        this.categoriesLoading = true;
        this.seenProductIds = new Set();
        // innerHTML moved to connectedCallback to comply with Web Components spec
    }

    async connectedCallback() {
        // Set initial loading state (safe here - element is now in DOM)
        this.innerHTML = `
            <div class="category-filter">
                <div class="categories-loading">جارِ تحميل الفئات...</div>
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
            228327271: { name: "جميع العبايات", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA/c228327271" },
            476899183: { name: "جلابيات", url: "https://darlena.com/%D8%AC%D9%84%D8%A7%D8%A8%D9%8A%D8%A7%D8%AA/c476899183" },
            1466412179: { name: "جديدنا", url: "https://darlena.com/%D8%AC%D8%AF%D9%8A%D8%AF-%D8%AF%D8%A7%D8%B1-%D9%84%D9%8A%D9%86%D8%A7/c1466412179" },
            289250285: { name: "عبايات كلوش", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%83%D9%84%D9%88%D8%B4/c289250285" },
            1891285357: { name: "عبايات سوداء سادة", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B3%D9%88%D8%AF%D8%A7%D8%A1-%D8%B3%D8%A7%D8%AF%D8%A9/c1891285357" },
            2132455494: { name: "عبايات ملونة", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D9%84%D9%88%D9%86%D8%A9/c2132455494" },
            940975465: { name: "عبايات بجيوب", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%AC%D9%8A%D9%88%D8%A8/c940975465" },
            1567146102: { name: "عبايات بشت", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A8%D8%B4%D8%AA/c1567146102" },
            832995956: { name: "عبايات مطرزة", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D9%85%D8%B7%D8%B1%D8%B2%D8%A9/c832995956" },
            2031226480: { name: "عبايات رأس", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B1%D8%A3%D8%B3/c2031226480" },
            270965526: { name: "شتاء 2026", url: "https://darlena.com/%D8%B4%D8%AA%D8%A7%D8%A1-2026/c270965526" },
            692927841: { name: "طرح", url: "https://darlena.com/%D8%B7%D8%B1%D8%AD/c692927841" },
            639447590: { name: "نقابات", url: "https://darlena.com/%D9%86%D9%82%D8%A7%D8%A8%D8%A7%D8%AA/c639447590" },
            114756598: { name: "عبايات شيفون", url: "https://darlena.com/%D8%B4%D9%8A%D9%81%D9%88%D9%86/c114756598" },
            273898307: { name: "عبايات شتوية", url: "https://darlena.com/%D8%B9%D8%A8%D8%A7%D9%8A%D8%A7%D8%AA-%D8%B4%D8%AA%D9%88%D9%8A%D8%A9/c273898307" }
        };
        const priorityOrder = {
            'رائج الان': 1,
            'جديدنا': 2,
            'شتاء 2026': 3,
            'جميع العبايات': 4,
            'عبايات شتوية': 5,
            'عبايات كلوش': 6,
            'جلابيات': 7,
            'عبايات شيفون': 8,
            'عبايات سوداء سادة': 9,
            'عبايات بجيوب': 10,
            'عبايات بشت': 11,
            'عبايات مطرزة': 12,
            'عبايات رأس': 13,
            'عبايات ملونة': 14,
            'طرح': 15,
            'نقابات': 16
        };

        try {
            const categories = await redisService.getCategoriesFromRedis();

            if (!Array.isArray(categories)) {
                throw new Error('Categories data is not an array');
            }

            let dynamicCats = categories.map(cat => ({
                slug: cat.name,
                name: cat.name,
                filter: cat.name,
                hasSubcats: false,
                count: cat.count || 0,
                ids: cat.ids || (cat.id ? [cat.id] : [])
            }));

            dynamicCats = dynamicCats.filter(cat => {
                if (cat.ids.length > 0) {
                    const id = Number(cat.ids[0]);
                    return allowedCategories.hasOwnProperty(id);
                }
                return false;
            }).map(cat => {
                const id = Number(cat.ids[0]);
                return {
                    ...cat,
                    name: allowedCategories[id].name,
                    slug: allowedCategories[id].name.toLowerCase().replace(/\s+/g, '-'),
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
                ...this.state.trendingCategory,
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
                    <div class="categories-loading">جارِ تحميل الفئات...</div>
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
                ${this.state.categories.map(category => `
                    <div class="category-section" data-category="${category.slug}">
                        <div class="category-header">
                            ${
                                category.url
                                ? `<a href="${category.url}" class="view-all">
                                     <i class="sicon-keyboard_arrow_left"></i>
                                     مشاهدة الكل
                                     <i class="sicon-keyboard_arrow_right"></i>
                                   </a>`
                                : ''
                            }
                            <h2 class="category-title">${category.name}</h2>
                        </div>
                        <div id="products-${category.slug}">
                            <div class="slider-loading" style="text-align: center; padding: 1rem;">جار تحميل المنتجات...</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        return template;
    }


    async initializeCategorySections() {
        try {
            
            const categoryPromises = this.state.categories.map(category => {
                if (category.slug === 'trending-now') {
                    return redisService.getGlobalProducts(0, this.state.productsPerPage)
                               .then(result => ({ slug: category.slug, ids: result.objectIDs || [] }))
                               .catch(error => ({ slug: category.slug, ids: [], error })); 
                } else if (category.ids && category.ids.length > 0) {
                    return this.fetchRegularCategory(category)
                               .then(ids => ({ slug: category.slug, ids: ids || [] }))
                               .catch(error => ({ slug: category.slug, ids: [], error })); 
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
        const categoryIdFetches = catObj.ids.map(numericID =>
            redisService.getCategoryPageById(numericID, 0, this.state.productsPerPage)
                .catch(error => {
                    return { objectIDs: [] };
                })
        );

        try {
            const results = await Promise.all(categoryIdFetches);
            return results.flatMap(data => (data && data.objectIDs) ? data.objectIDs : []);
        } catch (error) {
            return [];
        }
    }

    renderProductSliders(uniqueIDsPerCategory) {
        this.state.categories.forEach(category => {
            const categorySlug = category.slug;
            const uniqueIDs = uniqueIDsPerCategory[categorySlug] || [];

            const container = this.querySelector(`#products-${categorySlug}`);
            if (!container) {
                return;
            }

            container.innerHTML = '';

            if (uniqueIDs.length > 0) {
                const slider = document.createElement('salla-products-slider');
                slider.setAttribute('source', 'selected');
                slider.setAttribute('source-value', JSON.stringify(uniqueIDs));
                slider.setAttribute('limit', String(uniqueIDs.length));
                slider.setAttribute('slider-id', `slider-${categorySlug}`);
                slider.setAttribute('block-title', ' ');
                slider.setAttribute('arrows', 'true');
                slider.setAttribute('rtl', 'true');

                container.appendChild(slider);

                setTimeout(() => {
                    const pricingElements = slider.querySelectorAll('.s-product-card-content-sub');
                    pricingElements.forEach(pricing => {
                        if (pricing.children.length > 1) {
                            pricing.style.display = 'flex';
                            pricing.style.alignItems = 'center';
                            pricing.style.justifyContent = 'space-between';
                            pricing.style.flexWrap = 'nowrap';
                            pricing.style.width = '100%';
                            pricing.style.overflow = 'visible';
                        }
                    });
                }, 500);

            } else {
                container.innerHTML = '<div style="text-align: center; padding: 1rem;">لا توجد منتجات لعرضها في هذه الفئة.</div>';
            }
        });
    }

    handleInitError(error) {
        this.innerHTML = `
            <div class="category-filter">
                <div class="error-message" style="color: #e53e3e; text-align: center; padding: 2rem; margin-top: 2rem;">
                    عذراً، حدث خطأ أثناء تحميل الفئات. يرجى تحديث الصفحة.
                    ${error ? '<br><small>Error details logged.</small>' : ''}
                </div>
            </div>
        `;
    }
}

if (!customElements.get('mahaba-category-products')) {
    customElements.define('mahaba-category-products', CategoryProductsComponent);
}

export default CategoryProductsComponent;