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
    
    async loadRecentlyViewed() {
        const recentlyViewed = this.getRecentlyViewed();

        if (!recentlyViewed.length) return;

        const filteredRecent = recentlyViewed
            .map(id => parseInt(id, 10))
            .filter(id => id && !isNaN(id) && id !== parseInt(this.productId, 10));

        if (!filteredRecent.length) return;

        this.removeExistingRecentlyViewed();

        // Use custom slider for recently viewed
        const customSlider = document.createElement('algolia-recommendations-slider');
        customSlider.className = 'algolia-recently-viewed mt-8';

        const relatedSection = document.querySelector('salla-products-slider[source="related"], salla-products-slider[source="selected"], algolia-recommendations-slider');
        this.insertRecentlyViewedSection(customSlider, relatedSection);

        // Initialize with recently viewed products
        await customSlider.initialize(filteredRecent, {
            title: 'المنتجات المشاهدة مؤخراً',
            filterStock: true,
            maxInStock: 15
        });

        console.log('[Bundle Recommendations] Recently viewed slider initialized with', filteredRecent.length, 'products');
    }
    
    insertRecentlyViewedSection(container, relatedSection) {
        const productDetails = document.querySelector('.product-details, .product-entry, #product-entry');
        if (productDetails && productDetails.parentNode) {
            productDetails.parentNode.insertBefore(container, productDetails.nextSibling);
            return true;
        }

        if (relatedSection) {
            const relatedContainer = relatedSection.closest('.s-products-slider-container, .algolia-slider-wrapper');
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

            // Create our custom slider instead of salla-products-slider
            const customSlider = document.createElement('algolia-recommendations-slider');
            customSlider.className = 'product-recommendations-slider';

            // Replace Salla's slider with our custom one
            element.parentNode.replaceChild(customSlider, element);

            // Initialize with Algolia products in exact order
            await customSlider.initialize(numericIds, {
                title: 'منتجات مشابهة',
                filterStock: true,
                maxInStock: 15
            });

            console.log('[Bundle Recommendations] Custom slider initialized with', numericIds.length, 'products');
        } catch (error) {
            console.error('[Bundle Recommendations] Error:', error);
        }
    }
    
    reset() {
        this.initialized = false;
        this.productId = null;
        this.removeExistingRecentlyViewed();

        // Destroy any custom sliders
        document.querySelectorAll('algolia-recommendations-slider').forEach(slider => {
            if (slider.destroy) {
                slider.destroy();
            }
        });
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
