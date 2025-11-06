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
        this.orderObservers = new Map();
        this.orderTimers = new Map();
        this.reorderingWrappers = new WeakSet();
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
        this.setupStockFilter(recentSlider, filteredRecent);
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

            if (!recommendedIds?.length) return;

            const numericIds = recommendedIds
                .map(id => parseInt(id, 10))
                .filter(id => id && !isNaN(id));

            if (!numericIds.length) return;
            
            const newSlider = document.createElement('salla-products-slider');
            
            Array.from(element.attributes).forEach(attr => {
                if (attr.name !== 'source-value') {
                    newSlider.setAttribute(attr.name, attr.value);
                }
            });
            
            newSlider.setAttribute('source', 'selected');
            newSlider.setAttribute('source-value', JSON.stringify(numericIds));
            newSlider.setAttribute('class', 'product-recommendations-slider');
            
            element.parentNode.replaceChild(newSlider, element);
            
            if (!document.getElementById('product-recommendations-styles')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'product-recommendations-styles';
                styleEl.textContent = `
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
                `;
                document.head.appendChild(styleEl);
            }
            
            window.salla?.event?.dispatch('twilight::mutation');
            this.setupStockFilter(newSlider, numericIds);
        } catch {
        }
    }
    
    setupStockFilter(slider, productIds = null) {
        const handler = (event) => {
            if (!slider.contains(event.target)) return;

            // Unregister immediately to prevent multiple firings
            window.salla?.event?.off('salla-products-slider::products.fetched', handler);

            setTimeout(() => {
                const productCards = slider.querySelectorAll('.s-product-card-entry');
                if (!productCards.length) return;

                let inStockCount = 0;
                const maxProducts = 15;

                productCards.forEach(card => {
                    const isOutOfStock = card.classList.contains('s-product-card-out-of-stock');

                    if (isOutOfStock || inStockCount >= maxProducts) {
                        card.style.display = 'none';
                    } else {
                        inStockCount++;
                    }
                });

                if (productIds?.length) {
                    this.attachOrdering(slider, productIds);
                }
            }, 200);
        };

        window.salla?.event?.on('salla-products-slider::products.fetched', handler);
    }

    reset() {
        this.initialized = false;
        this.productId = null;
        this.removeExistingRecentlyViewed();

        this.orderObservers.forEach(({ observer }) => observer.disconnect());
        this.orderObservers.clear();

        this.orderTimers.forEach(timer => clearTimeout(timer));
        this.orderTimers.clear();
    }

    attachOrdering(slider, ids) {
        if (!slider || !ids?.length) return;

        slider.dataset.recommendationOrder = ids.join(',');
        this.scheduleReorder(slider, ids, true);
        this.setupOrderObserver(slider, ids);
    }

    scheduleReorder(slider, ids, immediate = false) {
        if (!slider || !ids?.length) return;

        const run = () => {
            if (!slider.isConnected) {
                this.teardownOrdering(slider);
                return false;
            }
            const wrapper = slider.querySelector('.swiper-wrapper');
            if (!wrapper) return false;
            return this.applyOrderOnce(slider, wrapper, ids);
        };

        if (immediate) {
            const applied = run();
            if (applied) return;
            this.scheduleReorder(slider, ids, false);
            return;
        }

        const existing = this.orderTimers.get(slider);
        if (existing) {
            clearTimeout(existing);
        }

        const timer = setTimeout(() => {
            this.orderTimers.delete(slider);
            run();
        }, 80);

        this.orderTimers.set(slider, timer);
    }

    setupOrderObserver(slider, ids) {
        const wrapper = slider.querySelector('.swiper-wrapper');
        if (!wrapper) return;

        const existing = this.orderObservers.get(slider);
        if (existing) {
            existing.ids = ids;
            return;
        }

        const observer = new MutationObserver((mutations) => {
            if (!mutations.some(m => m.type === 'childList')) return;
            if (this.reorderingWrappers.has(wrapper)) return;
            if (!slider.isConnected) {
                this.teardownOrdering(slider);
                return;
            }

            const state = this.orderObservers.get(slider);
            const targetIds = state?.ids || ids;
            if (!targetIds?.length) return;

            this.scheduleReorder(slider, targetIds);
        });

        observer.observe(wrapper, { childList: true });

        this.orderObservers.set(slider, { observer, ids, wrapper });
    }

    teardownOrdering(slider) {
        const state = this.orderObservers.get(slider);
        if (state) {
            state.observer.disconnect();
            this.orderObservers.delete(slider);
        }

        const timer = this.orderTimers.get(slider);
        if (timer) {
            clearTimeout(timer);
            this.orderTimers.delete(slider);
        }
    }

    applyOrderOnce(slider, wrapper, ids) {
        if (!wrapper || !ids?.length) return false;

        const slides = Array.from(wrapper.querySelectorAll('.s-products-slider-card'));
        if (!slides.length) return false;

        this.reorderingWrappers.add(wrapper);

        const slideMap = new Map();

        slides.forEach(slide => {
            const card = slide.querySelector('.s-product-card-entry, custom-salla-product-card');
            let productId = card?.dataset?.id || card?.getAttribute?.('data-id') || card?.id;

            if (!productId) {
                const numericId = card?.getAttribute?.('product-id');
                if (numericId) productId = numericId;
            }

            if (!productId) {
                const link = slide.querySelector('.s-product-card-image a, .s-product-card-content-title a');
                if (link?.href) {
                    const match = link.href.match(/\/p(\d+)(?:$|\?|\/)/) || link.href.match(/\/product\/[^/]+\/(\d+)/);
                    if (match?.[1]) productId = match[1];
                }
            }

            if (productId) {
                slideMap.set(String(productId), slide);
            }
        });

        let reordered = false;

        ids.forEach(id => {
            const slide = slideMap.get(String(id));
            if (slide && slide.parentNode === wrapper) {
                wrapper.appendChild(slide);
                reordered = true;
            }
        });

        if (reordered) {
            const sallaSlider = slider.querySelector('salla-slider');
            const swiper = sallaSlider?.swiper;

            swiper?.updateSlides?.();
            swiper?.updateProgress?.();
            swiper?.slideTo?.(0, 0, false);
        }

        requestAnimationFrame(() => this.reorderingWrappers.delete(wrapper));

        return true;
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
