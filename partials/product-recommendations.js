/**
 * Product Recommendations
 *
 * A lightweight component to replace Salla's default product recommendations
 * with data from Redis for related products.
 */
import { redisService } from '../services/redis-service.js';

class ProductRecommendations {
    constructor() {
        this.initialized = false;
        this.productId = null;
        this.recentlyViewedKey = 'recently_viewed_products';
        this.maxRecentProducts = 15;
        this.recentlyViewedClass = 'algolia-recently-viewed';
        this.customSliderContainer = null;
        this.customSwiper = null;
        this.hiddenOriginalSlider = null;
    }

    initialize() {
        if (!this.isProductPage()) return;

        const currentProductId = this.getProductId();
        if (!currentProductId) return;

        // Only skip if already initialized for THIS exact product
        if (this.initialized && this.productId === currentProductId) return;

        this.productId = currentProductId;
        this.initialized = true;
        this.addToRecentlyViewed(this.productId);

        const loadComponents = () => {
            this.loadRecommendations();
            this.loadRecentlyViewed();
        };

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            loadComponents();
        } else {
            document.addEventListener('DOMContentLoaded', loadComponents);
        }
    }

    loadRecommendations() {
        const relatedSection = document.querySelector('salla-products-slider[source="related"]');

        if (relatedSection) {
            this.replaceRelatedProducts(relatedSection);
        } else {
            this.waitForElement('salla-products-slider[source="related"]', el => {
                this.replaceRelatedProducts(el);
            });
        }
    }

    loadRecentlyViewed() {
        const recentlyViewed = this.getRecentlyViewed();

        if (!recentlyViewed.length) return;

        const filteredRecent = recentlyViewed
            .map(id => parseInt(id, 10))
            .filter(id => id && !isNaN(id) && id !== parseInt(this.productId, 10));

        if (!filteredRecent.length) return;

        this.removeExistingRecentlyViewed();

        const container = document.createElement('div');
        container.className = 'mt-8 s-products-slider-container';
        container.classList.add(this.recentlyViewedClass);

        const title = document.createElement('h2');
        title.className = 'section-title mb-5 font-bold text-xl';
        title.textContent = 'المنتجات المشاهدة مؤخراً';
        container.appendChild(title);

        const recentSlider = document.createElement('salla-products-slider');
        recentSlider.setAttribute('source', 'selected');
        recentSlider.setAttribute('source-value', JSON.stringify(filteredRecent));
        recentSlider.setAttribute('autoplay', 'false');
        recentSlider.setAttribute('class', 'product-recommendations-slider');

        const relatedSection = document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"]');
        recentSlider.setAttribute('display-style', relatedSection?.getAttribute('display-style') || 'normal');

        container.appendChild(recentSlider);

        this.insertRecentlyViewedSection(container, relatedSection);

        window.salla?.event?.dispatch('twilight::mutation');
        this.setupStockFilter(recentSlider);
    }

    insertRecentlyViewedSection(container, relatedSection) {
        const productDetails = document.querySelector('.product-details, .product-entry, #product-entry');
        if (productDetails && productDetails.parentNode) {
            productDetails.parentNode.insertBefore(container, productDetails.nextSibling);
            return true;
        }

        if (relatedSection) {
            const relatedContainer = relatedSection.closest('.s-products-slider-container');
            if (relatedContainer && relatedContainer.parentNode) {
                relatedContainer.parentNode.insertBefore(container, relatedContainer.nextSibling);
                return true;
            }

            if (relatedSection.parentNode) {
                relatedSection.parentNode.insertBefore(container, relatedSection.nextSibling);
                return true;
            }
        }

        const mainContent = document.querySelector('main, .s-product-page-content, #content, .s-product-page');
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
            recentlyViewed = recentlyViewed
                .map(id => parseInt(id, 10))
                .filter(id => !isNaN(id));

            recentlyViewed = recentlyViewed.filter(id => id !== numericId);
            recentlyViewed.unshift(numericId);

            if (recentlyViewed.length > this.maxRecentProducts) {
                recentlyViewed = recentlyViewed.slice(0, this.maxRecentProducts);
            }

            sessionStorage.setItem(this.recentlyViewedKey, JSON.stringify(recentlyViewed));
        } catch (error) {
        }
    }

    removeExistingRecentlyViewed() {
        document.querySelectorAll(`.${this.recentlyViewedClass}`).forEach(node => node.remove());
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

        const pageContainer = document.querySelector('.product-entry, #product-entry, .product-details');
        if (pageContainer) {
            const scopedContainer = pageContainer.matches('[id^="product-"]') ? pageContainer : pageContainer.querySelector('[id^="product-"]');
            if (scopedContainer && !scopedContainer.closest('salla-products-slider')) {
                const fromContainer = scopedContainer.id.replace('product-', '');
                const numericId = parseInt(fromContainer, 10);
                if (!isNaN(numericId)) return numericId;
            }
        }

        const standaloneContainer = document.querySelector('[id^="product-"]');
        if (standaloneContainer && !standaloneContainer.closest('salla-products-slider')) {
            const fromStandalone = standaloneContainer.id.replace('product-', '');
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

            // Validate that product hasn't changed during async request
            if (requestedProductId !== this.productId) {
                console.log('[Bundle Recommendations] Product changed during fetch, aborting');
                return;
            }

            if (!recommendedIds?.length) {
                this.teardownCustomSlider();
                return;
            }

            const numericIds = recommendedIds
                .map(id => parseInt(id, 10))
                .filter(id => id && !isNaN(id));

            if (!numericIds.length) {
                this.teardownCustomSlider();
                return;
            }

            this.renderCustomSlider(element, numericIds);
        } catch {
            this.teardownCustomSlider();
        }
    }

    ensureCustomSliderStyles() {
        if (document.getElementById('algolia-custom-slider-styles')) return;

        const styleEl = document.createElement('style');
        styleEl.id = 'algolia-custom-slider-styles';
        styleEl.textContent = `
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
        `;

        document.head.appendChild(styleEl);
    }

    renderCustomSlider(originalSlider, productIds, attempt = 0) {
        if (!productIds?.length) {
            this.teardownCustomSlider();
            return;
        }

        const baseSlider = this.hiddenOriginalSlider || originalSlider;
        const parent = baseSlider?.parentNode;
        if (!baseSlider || !parent) return;

        const cardMap = this.collectCardsFromSlider(baseSlider);

        if ((cardMap.size === 0 || cardMap.size < productIds.length) && attempt < 10) {
            setTimeout(() => this.renderCustomSlider(originalSlider, productIds, attempt + 1), 160);
            return;
        }

        this.teardownCustomSlider();

        this.ensureCustomSliderStyles();

        this.hiddenOriginalSlider = baseSlider;
        baseSlider.style.display = 'none';
        baseSlider.setAttribute('aria-hidden', 'true');
        baseSlider.setAttribute('data-algolia-hidden', 'true');

        const container = document.createElement('div');
        container.className = 'algolia-recommendations-container s-products-slider-wrapper';
        container.setAttribute('data-algolia-slider', 'recommendations');

        const sliderId = `algolia-rec-${Date.now()}`;
        container.setAttribute('data-slider-id', sliderId);

        const titleText = baseSlider.getAttribute('block-title') || baseSlider.getAttribute('data-title') || baseSlider.getAttribute('title') || 'منتجات قد تعجبك';
        const displayUrl = baseSlider.getAttribute('display-all-url');

        const header = document.createElement('div');
        header.className = 's-slider-block__title algolia-slider-head';

        const headerRight = document.createElement('div');
        headerRight.className = 's-slider-block__title-right';

        const heading = document.createElement('h2');
        heading.textContent = titleText;
        headerRight.appendChild(heading);

        if (displayUrl) {
            const viewAll = document.createElement('a');
            viewAll.href = displayUrl;
            viewAll.className = 'text-sm text-primary-600 hover:underline';
            viewAll.textContent = window.salla?.lang?.get('common.btn_show_all') || 'عرض الكل';
            headerRight.appendChild(viewAll);
        }

        const headerLeft = document.createElement('div');
        headerLeft.className = 's-slider-block__title-left';

        const navWrapper = document.createElement('div');
        navWrapper.className = 's-slider-block__title-nav algolia-slider-nav';

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'algolia-nav-btn algolia-nav-prev s-slider-prev s-slider-nav-arrow';
        prevBtn.setAttribute('aria-label', 'Previous');
        prevBtn.innerHTML = '<span class="s-slider-button-icon"><svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.562 9.521l-6.125 6.125 6.125 6.125-1.875 1.875-8-8 8-8z"/></svg></span>';
        navWrapper.appendChild(prevBtn);

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'algolia-nav-btn algolia-nav-next s-slider-next s-slider-nav-arrow';
        nextBtn.setAttribute('aria-label', 'Next');
        nextBtn.innerHTML = '<span class="s-slider-button-icon"><svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.438 9.896l1.875-1.875 8 8-8 8-1.875-1.875 6.125-6.125z"/></svg></span>';
        navWrapper.appendChild(nextBtn);

        headerLeft.appendChild(navWrapper);
        header.appendChild(headerRight);
        header.appendChild(headerLeft);
        container.appendChild(header);

        const direction = baseSlider.getAttribute('dir') || document.dir || 'rtl';

        const swiperShell = document.createElement('div');
        swiperShell.className = 'algolia-swiper swiper s-products-slider-slider s-slider-wrapper carousel-slider s-slider-horizontal';
        swiperShell.setAttribute('dir', direction);

        const wrapper = document.createElement('div');
        wrapper.className = 'swiper-wrapper';
        wrapper.id = `${sliderId}-wrapper`;
        swiperShell.appendChild(wrapper);

        productIds.forEach(id => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide algolia-slide';
            slide.dataset.productId = String(id);

            const card = cardMap.get(String(id));

            if (!card) return;

            const cardClone = card.cloneNode(true);
            cardClone.id = `algolia-card-${id}`;
            cardClone.setAttribute('data-algolia-cloned', 'true');
            cardClone.setAttribute('data-id', String(id));
            cardClone.setAttribute('product-id', String(id));
            if (cardClone.dataset) {
                cardClone.dataset.id = String(id);
            }
            slide.appendChild(cardClone);
            wrapper.appendChild(slide);
        });

        if (!wrapper.children.length) {
            this.teardownCustomSlider();
            return;
        }

        container.appendChild(swiperShell);

        parent.insertBefore(container, baseSlider);

        this.customSliderContainer = container;

        navWrapper.setAttribute('dir', direction);

        this.customSwiper = this.initCustomSwiper(swiperShell, prevBtn, nextBtn, productIds.length);

        if (productIds.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }

        window.salla?.event?.dispatch('twilight::mutation');

        setTimeout(() => this.applyCustomStockFilter(container), 400);
    }

    collectCardsFromSlider(baseSlider) {
        const map = new Map();
        if (!baseSlider) return map;

        const cards = Array.from(baseSlider.querySelectorAll('custom-salla-product-card'));

        cards.forEach(card => {
            let productId = card.dataset.id || card.getAttribute('data-id');

            if (!productId && card.id && !isNaN(card.id)) {
                productId = card.id;
            }

            if (!productId) {
                const parsed = card.getAttribute('product-id');
                if (parsed) productId = parsed;
            }

            if (!productId) {
                const link = card.querySelector('.s-product-card-image a, .s-product-card-content-title a');
                if (link?.href) {
                    const match = link.href.match(/\/p(\d+)(?:$|\?|\/)/) || link.href.match(/\/product\/[^/]+\/(\d+)/);
                    if (match?.[1]) productId = match[1];
                }
            }

            if (productId) {
                map.set(String(productId), card);
            }
        });

        return map;
    }

    initCustomSwiper(swiperEl, prevBtn, nextBtn, totalSlides) {
        if (!window.Swiper) {
            swiperEl.classList.add('algolia-swiper--fallback');
            swiperEl.classList.remove('swiper');
            swiperEl.classList.remove('s-slider-horizontal');
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return null;
        }

        return new window.Swiper(swiperEl, {
            slidesPerView: 1.2,
            spaceBetween: 14,
            watchOverflow: true,
            observeParents: true,
            observer: true,
            direction: swiperEl.getAttribute('dir') === 'ltr' ? 'ltr' : 'rtl',
            navigation: {
                nextEl: nextBtn,
                prevEl: prevBtn,
            },
            keyboard: {
                enabled: true,
            },
            breakpoints: {
                480: { slidesPerView: 1.6, spaceBetween: 16 },
                768: { slidesPerView: 2.4, spaceBetween: 18 },
                1024: { slidesPerView: Math.min(3.2, totalSlides), spaceBetween: 20 },
                1280: { slidesPerView: Math.min(4, totalSlides), spaceBetween: 20 },
            },
        });
    }

    applyCustomStockFilter(container, attempt = 0) {
        if (!container?.isConnected) return;

        const cards = Array.from(container.querySelectorAll('.s-product-card-entry'));

        const cardsReady = cards.length > 0 && cards.every(card => card.querySelector('.s-product-card-content'));

        if (!cardsReady) {
            if (attempt >= 12) return;
            setTimeout(() => this.applyCustomStockFilter(container, attempt + 1), 300);
            return;
        }

        let inStockCount = 0;
        const maxProducts = 15;

        cards.forEach(card => {
            const slide = card.closest('.swiper-slide') || card.parentElement;
            if (!slide) return;

            const isOutOfStock = card.classList.contains('s-product-card-out-of-stock');

            if (isOutOfStock || inStockCount >= maxProducts) {
                slide.style.display = 'none';
            } else {
                slide.style.display = '';
                inStockCount++;
            }
        });

        if (this.customSwiper) {
            this.customSwiper.updateSlides();
            this.customSwiper.updateProgress();
        }
    }

    teardownCustomSlider() {
        if (this.customSwiper) {
            try {
                this.customSwiper.destroy(true, true);
            } catch {
            }
        }
        this.customSwiper = null;

        if (this.customSliderContainer?.parentNode) {
            this.customSliderContainer.parentNode.removeChild(this.customSliderContainer);
        }
        this.customSliderContainer = null;

        if (this.hiddenOriginalSlider) {
            this.hiddenOriginalSlider.style.display = '';
            this.hiddenOriginalSlider.removeAttribute('aria-hidden');
            this.hiddenOriginalSlider.removeAttribute('data-algolia-hidden');
        }

        this.hiddenOriginalSlider = null;
    }

    setupStockFilter(slider) {
        window.salla?.event?.on('salla-products-slider::products.fetched', event => {
            if (!slider.contains(event.target)) return;

            setTimeout(() => {
                const cards = slider.querySelectorAll('.s-product-card-entry');
                if (!cards.length) return;

                let inStockCount = 0;
                const maxProducts = 15;

                cards.forEach(card => {
                    const slide = card.closest('.swiper-slide') || card.parentElement;
                    if (!slide) return;

                    const isOutOfStock = card.classList.contains('s-product-card-out-of-stock');

                    if (isOutOfStock || inStockCount >= maxProducts) {
                        slide.style.display = 'none';
                    } else {
                        slide.style.display = '';
                        inStockCount++;
                    }
                });
            }, 200);
        });
    }

    reset() {
        this.initialized = false;
        this.productId = null;
        this.teardownCustomSlider();
        this.removeExistingRecentlyViewed();
    }

    waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
            return;
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                callback(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

export const productRecommendations = new ProductRecommendations();
export default productRecommendations;
