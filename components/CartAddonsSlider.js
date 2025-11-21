import { redisService } from '../services/redis-service.js';

class CartAddonsSlider extends HTMLElement {
    constructor() {
        super();
        this.initialized = false;
        this.productIds = [];
        this.structureReady = false;
        this.cartListenerBound = false;
        this.reloadScheduled = false;
        this.reloadTimer = null;
    }

    /**
     * Check if we're on the cart page
     */
    isCartPage() {
        return window.location.pathname.includes('/cart') &&
               document.querySelector('form[id^="item-"]') !== null;
    }

    /**
     * Debounced page reload after cart item added
     */
    scheduleReload() {
        // Only act on cart page
        if (!this.isCartPage()) return;

        // Prevent stacking
        if (this.reloadScheduled) return;
        this.reloadScheduled = true;

        // Clear any existing timer
        if (this.reloadTimer) {
            clearTimeout(this.reloadTimer);
        }

        // Reload after 1 second debounce
        this.reloadTimer = setTimeout(() => {
            console.log('[CartAddonsSlider] Reloading cart page to show added item');
            window.location.reload();
        }, 1000);
    }

    /**
     * Setup listeners for cart add success events
     * Only activates on cart page
     */
    setupCartRefreshListener() {
        // Guard: only bind once
        if (this.cartListenerBound) return;

        // Guard: only on cart page
        if (!this.isCartPage()) return;

        this.cartListenerBound = true;

        const handler = () => this.scheduleReload();

        // Primary: Salla's cart event API
        if (window.salla?.cart?.event?.on) {
            window.salla.cart.event.on('added', handler);
            console.log('[CartAddonsSlider] Listening to salla.cart.event.on("added")');
        }

        // Fallback: Document event
        document.addEventListener('salla::cart::item.added', handler);
        console.log('[CartAddonsSlider] Listening to salla::cart::item.added');
    }

    connectedCallback() {
        this.ensureStructure();

        // Setup cart refresh listener (only on cart page)
        this.setupCartRefreshListener();

        if (this.initialized) return;

        this.getHighestValueItemFromDOM()
            .then(productId => {
                if (productId) {
                    return this.fetchFrequentlyBoughtProducts(productId);
                }
                return [];
            })
            .then(() => {
                this.renderProductList();
                setTimeout(() => {
                    this.initializeSlider();
                }, 1000);
            })
            .catch(error => {
                console.error('[CartAddonsSlider] Error loading products:', error);
            });
    }

    ensureStructure() {
        if (this.structureReady) return;

        const titleText = this.getTitleText();
        const existingTitle = this.querySelector('.cart-addons-title');

        if (existingTitle) {
            existingTitle.textContent = titleText;
        } else {
            const title = document.createElement('h3');
            title.className = 'cart-addons-title';
            title.textContent = titleText;
            this.appendChild(title);
        }

        if (!this.querySelector('.frequently-bought-container')) {
            const container = document.createElement('div');
            container.className = 'frequently-bought-container';
            this.appendChild(container);
        }

        this.structureReady = true;
    }

    getTitleText() {
        const translationKey = 'pages.cart.frequently_bought_together';
        const localizedTitle = window.salla?.lang?.get?.(translationKey);
        const cleanedLocalizedTitle =
            typeof localizedTitle === 'string' && localizedTitle !== translationKey
                ? localizedTitle.trim()
                : '';

        if (cleanedLocalizedTitle) {
            return cleanedLocalizedTitle;
        }

        const language = (document.documentElement.getAttribute('lang') || '').toLowerCase().slice(0, 2);
        const fallbackTitles = {
            ar: '\u0645\u062A\u062C\u0627\u062A \u0642\u062F \u062A\u0639\u062C\u0628\u0643',
            en: 'Frequently Bought Together'
        };

        return fallbackTitles[language] || fallbackTitles.en;
    }

    async getHighestValueItemFromDOM() {
        try {
            const cartItemForms = document.querySelectorAll('form[id^="item-"]');
            
            if (!cartItemForms || cartItemForms.length === 0) {
                console.log('[CartAddonsSlider] No cart items found in DOM');
                return null;
            }
            
            let highestValueItem = null;
            let highestValue = 0;
            
            cartItemForms.forEach(form => {
                try {
                    const formId = form.getAttribute('id') || '';
                    const itemId = formId.replace('item-', '');
                    
                    const productLink = form.querySelector('a[href*="/p"]');
                    if (!productLink) {
                        console.log('[CartAddonsSlider] No product link found in form', formId);
                        return;
                    }
                    
                    const productUrl = productLink.getAttribute('href');
                    const productIdMatch = productUrl.match(/\/p(\d+)(?:$|\/|\?)/);
                    
                    if (!productIdMatch || !productIdMatch[1]) {
                        console.log('[CartAddonsSlider] Could not extract product ID from URL', productUrl);
                        return;
                    }
                    
                    const productId = productIdMatch[1];
                    
                    const totalElement = form.querySelector('.item-total');
                    
                    if (totalElement) {
                        const totalText = totalElement.textContent || totalElement.innerText || '0';
                        const cleanedText = totalText
                            .replace(/[^\d.,٠١٢٣٤٥٦٧٨٩]/g, '')
                            .replace(/٠/g, '0')
                            .replace(/١/g, '1')
                            .replace(/٢/g, '2')
                            .replace(/٣/g, '3')
                            .replace(/٤/g, '4')
                            .replace(/٥/g, '5')
                            .replace(/٦/g, '6')
                            .replace(/٧/g, '7')
                            .replace(/٨/g, '8')
                            .replace(/٩/g, '9');
                        
                        const totalValue = parseFloat(cleanedText.replace(',', '.')) || 0;
                        
                        console.log(`[CartAddonsSlider] Item ${itemId}: Product ID ${productId}, Total: ${totalValue}`);
                        
                        if (!isNaN(totalValue) && totalValue > highestValue) {
                            highestValue = totalValue;
                            highestValueItem = {
                                itemId,
                                productId,
                                total: totalValue
                            };
                        }
                    }
                } catch (err) {
                    console.error('[CartAddonsSlider] Error processing item form:', err);
                }
            });
            
            if (highestValueItem) {
                console.log('[CartAddonsSlider] Highest value item:', highestValueItem);
                return highestValueItem.productId;
            }
            
            return null;
        } catch (error) {
            console.error('[CartAddonsSlider] Error extracting cart data from DOM:', error);
            return null;
        }
    }

    async fetchFrequentlyBoughtProducts(productId) {
        try {
            console.log('[CartAddonsSlider] Fetching frequently bought products for:', productId);
            const productIds = await redisService.getFrequentlyBought(productId);

            if (productIds && productIds.length > 0) {
                console.log('[CartAddonsSlider] Found frequently bought products:', productIds);
                this.productIds = productIds.map(id => String(id)).slice(0, 8);
                return this.productIds;
            } else {
                console.log('[CartAddonsSlider] No frequently bought products found');
                this.productIds = [];
                return [];
            }
        } catch (error) {
            console.error('[CartAddonsSlider] Error fetching frequently bought products:', error);
            this.productIds = [];
            return [];
        }
    }

    renderProductList() {
        if (!this.productIds || this.productIds.length === 0) {
            console.log('[CartAddonsSlider] No products to render, hiding component');
            this.style.display = 'none';
            return;
        }
        
        console.log('[CartAddonsSlider] Rendering product list with IDs:', this.productIds);
        
        const container = this.querySelector('.frequently-bought-container');
        if (!container) {
            console.error('[CartAddonsSlider] Container not found');
            return;
        }
        
        const productsList = document.createElement('salla-products-list');
        productsList.setAttribute('source', 'selected');
        productsList.setAttribute('loading', 'lazy');
        productsList.setAttribute('source-value', JSON.stringify(this.productIds));
        productsList.setAttribute('class', 's-products-list-vertical-cards');
        
        container.innerHTML = '';
        container.appendChild(productsList);

        if (!this.querySelector('.touch-indicator')) {
            const touchIndicator = document.createElement('div');
            touchIndicator.classList.add('touch-indicator');
            this.appendChild(touchIndicator);
        }

        console.log('[CartAddonsSlider] Product list rendered');
    }

    initializeSlider() {
        try {
            const productsList = this.querySelector('salla-products-list');
            if (!productsList) {
                console.log('[CartAddonsSlider] Products list not found');
                return;
            }

            productsList.style.opacity = '1';
            
            if (window.salla?.event?.dispatch) {
                window.salla.event.dispatch('twilight::mutation');
            }
            
            this.initialized = true;
            console.log('[CartAddonsSlider] Slider initialized');
        } catch (error) {
            console.error('[CartAddonsSlider] Failed to initialize cart addons slider:', error);
        }
    }
}

if (!customElements.get('cart-addons-slider')) {
    customElements.define('cart-addons-slider', CartAddonsSlider);
    console.log('[CartAddonsSlider] Custom element defined');
}

export default CartAddonsSlider; 
