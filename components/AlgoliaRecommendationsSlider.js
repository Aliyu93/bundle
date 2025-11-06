/**
 * Algolia Recommendations Slider
 *
 * Custom slider component that replaces salla-products-slider entirely.
 * Uses salla-products-list for product rendering but provides full control
 * over slider structure and product ordering from Algolia/Redis.
 *
 * Key features:
 * - Maintains exact product order from Algolia recommendations
 * - Uses Salla's Swiper.js for slider functionality
 * - Filters out-of-stock products
 * - Matches Salla's slider UI/UX exactly
 * - RTL support
 */

class AlgoliaRecommendationsSlider extends HTMLElement {
    constructor() {
        super();
        this.swiper = null;
        this.productIds = [];
        this.initialized = false;
    }

    /**
     * Initialize the slider with product IDs from Algolia
     * @param {Array<number>} productIds - Array of product IDs in exact Algolia order
     * @param {Object} config - Configuration options
     */
    async initialize(productIds, config = {}) {
        if (this.initialized) {
            console.warn('[AlgoliaSlider] Already initialized');
            return;
        }

        this.productIds = productIds.slice(0, 21); // Max 21 products like Salla

        const {
            title = 'منتجات قد تعجبك',
            displayAllUrl = '',
            filterStock = true,
            maxInStock = 15
        } = config;

        // Build slider HTML matching Salla's exact structure
        this.innerHTML = `
            <div class="algolia-slider-wrapper s-products-slider-wrapper">
                <div class="algolia-slider-header s-slider-block__title">
                    <div class="s-slider-block__title-right">
                        <h2>${title}</h2>
                    </div>
                    <div class="s-slider-block__title-left">
                        <div class="s-slider-block__title-nav" dir="rtl">
                            <button
                                aria-label="Previous slide"
                                class="algolia-slider-prev s-slider-prev s-slider-nav-arrow swiper-button-disabled"
                                type="button"
                                disabled>
                                <span class="s-slider-button-icon">
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                        <title>keyboard_arrow_right</title>
                                        <path d="M11.438 22.479l6.125-6.125-6.125-6.125 1.875-1.875 8 8-8 8z"></path>
                                    </svg>
                                </span>
                            </button>
                            <button
                                aria-label="Next slide"
                                class="algolia-slider-next s-slider-next s-slider-nav-arrow"
                                type="button">
                                <span class="s-slider-button-icon">
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                        <title>keyboard_arrow_left</title>
                                        <path d="M20.563 22.104l-1.875 1.875-8-8 8-8 1.875 1.875-6.125 6.125z"></path>
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="algolia-slider-container swiper swiper-rtl" dir="rtl">
                    <div class="swiper-wrapper algolia-slider-products">
                        <!-- Products will be inserted here -->
                    </div>
                </div>
            </div>
        `;

        // Inject styles first
        this.injectStyles();

        // Let Salla render products, then move to slider
        await this.renderProducts(filterStock, maxInStock);

        this.initialized = true;
    }

    /**
     * Use salla-products-list to fetch and render products
     */
    async renderProducts(filterStock, maxInStock) {
        const wrapper = this.querySelector('.swiper-wrapper');
        if (!wrapper) {
            console.error('[AlgoliaSlider] Swiper wrapper not found');
            return;
        }

        // Create salla-products-list for Salla to render products
        const productsList = document.createElement('salla-products-list');
        productsList.setAttribute('source', 'selected');
        productsList.setAttribute('source-value', JSON.stringify(this.productIds));
        productsList.setAttribute('limit', this.productIds.length.toString());
        productsList.setAttribute('display-all-url', ''); // Prevent "show all" link
        productsList.className = 'algolia-products-source';

        // Temporary container - visible but transparent so images load properly
        // Using opacity instead of position:absolute left:-9999px to ensure lazy loading works
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = 'opacity: 0; pointer-events: none; position: absolute; z-index: -1; top: 0; left: 0; width: 100%; height: 0; overflow: hidden;';
        tempContainer.className = 'algolia-temp-container';
        tempContainer.appendChild(productsList);
        this.appendChild(tempContainer);

        // Dispatch Salla's mutation event to trigger rendering
        window.salla?.event?.dispatch('twilight::mutation');

        // Wait for Salla to fetch and render products
        return new Promise((resolve) => {
            const handler = (event) => {
                // Check if this event is for our products list
                if (!productsList.contains(event.target)) return;

                // Unregister handler
                window.salla?.event?.off('salla-products-list::products.fetched', handler);

                // Small delay to ensure DOM is fully updated
                setTimeout(() => {
                    this.moveProductsToSlider(productsList, wrapper, filterStock, maxInStock);
                    tempContainer.remove();
                    resolve();
                }, 150);
            };

            // Listen for products fetched event
            window.salla?.event?.on('salla-products-list::products.fetched', handler);

            // Fallback timeout in case event doesn't fire
            setTimeout(() => {
                if (tempContainer.parentNode) {
                    this.moveProductsToSlider(productsList, wrapper, filterStock, maxInStock);
                    tempContainer.remove();
                    resolve();
                }
            }, 3000);
        });
    }

    /**
     * Extract product cards from salla-products-list and move to swiper
     * IMPORTANT: We MOVE nodes instead of cloning to preserve web component state
     */
    moveProductsToSlider(productsList, swiperWrapper, filterStock, maxInStock) {
        // Get all product cards rendered by Salla
        const productCards = productsList.querySelectorAll('.s-product-card-entry, custom-salla-product-card');

        if (!productCards.length) {
            console.warn('[AlgoliaSlider] No product cards found');
            return;
        }

        console.log(`[AlgoliaSlider] Found ${productCards.length} products, moving to slider`);

        let inStockCount = 0;

        // Products are already in correct order from source-value
        productCards.forEach((card) => {
            // Check if out of stock
            const isOutOfStock = card.classList.contains('s-product-card-out-of-stock');

            // Skip if filtering enabled and conditions met
            if (filterStock && (isOutOfStock || inStockCount >= maxInStock)) {
                return; // Don't add this product to slider
            }

            if (!isOutOfStock) {
                inStockCount++;
            }

            // Wrap card in swiper-slide
            const slide = document.createElement('div');
            slide.className = 's-products-slider-card swiper-slide';

            // MOVE the card (not clone!) - this preserves web component state
            // appendChild() moves the node if it already exists in the DOM
            slide.appendChild(card);

            // Add to swiper wrapper
            swiperWrapper.appendChild(slide);
        });

        console.log(`[AlgoliaSlider] Added ${inStockCount} in-stock products to slider`);

        // Initialize Swiper after products are in place
        this.initializeSwiper();
    }

    /**
     * Initialize Swiper.js slider
     */
    initializeSwiper() {
        const swiperContainer = this.querySelector('.swiper');
        if (!swiperContainer) {
            console.error('[AlgoliaSlider] Swiper container not found');
            return;
        }

        const slides = this.querySelectorAll('.swiper-slide');
        if (!slides.length) {
            console.warn('[AlgoliaSlider] No slides to initialize');
            return;
        }

        // Check if Swiper is available (loaded by Salla)
        if (typeof Swiper === 'undefined') {
            console.warn('[AlgoliaSlider] Swiper not available, using CSS fallback');
            this.initializeCSSScroll();
            return;
        }

        // Initialize Swiper with Salla-like configuration
        try {
            this.swiper = new Swiper(swiperContainer, {
                slidesPerView: 'auto',
                spaceBetween: 16,
                rtl: true,
                direction: 'horizontal',
                navigation: {
                    nextEl: '.algolia-slider-next',
                    prevEl: '.algolia-slider-prev',
                },
                breakpoints: {
                    320: {
                        slidesPerView: 2,
                        spaceBetween: 12
                    },
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 12
                    },
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 16
                    },
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 16
                    }
                },
                on: {
                    init: function() {
                        console.log('[AlgoliaSlider] Swiper initialized successfully');
                    }
                }
            });

            console.log('[AlgoliaSlider] Swiper instance created');
        } catch (error) {
            console.error('[AlgoliaSlider] Error initializing Swiper:', error);
            this.initializeCSSScroll();
        }
    }

    /**
     * Fallback CSS-based horizontal scroll if Swiper unavailable
     */
    initializeCSSScroll() {
        const wrapper = this.querySelector('.swiper-wrapper');
        if (!wrapper) return;

        // Apply scroll styles
        wrapper.style.cssText = `
            display: flex !important;
            overflow-x: auto;
            scroll-behavior: smooth;
            gap: 1rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
        `;

        const container = this.querySelector('.swiper');
        if (container) {
            container.style.overflow = 'hidden';
        }

        // Manual navigation buttons
        const prevBtn = this.querySelector('.algolia-slider-prev');
        const nextBtn = this.querySelector('.algolia-slider-next');

        if (prevBtn && nextBtn) {
            const scrollAmount = 300;

            prevBtn.addEventListener('click', () => {
                wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });

            // Update button states on scroll
            const updateButtons = () => {
                const isAtStart = wrapper.scrollLeft <= 0;
                const isAtEnd = wrapper.scrollLeft >= (wrapper.scrollWidth - wrapper.clientWidth - 10);

                prevBtn.disabled = isAtStart;
                nextBtn.disabled = isAtEnd;

                prevBtn.classList.toggle('swiper-button-disabled', isAtStart);
                nextBtn.classList.toggle('swiper-button-disabled', isAtEnd);
            };

            wrapper.addEventListener('scroll', updateButtons);
            updateButtons();
        }

        console.log('[AlgoliaSlider] CSS scroll fallback initialized');
    }

    /**
     * Inject slider styles
     */
    injectStyles() {
        if (document.getElementById('algolia-slider-styles')) return;

        const styleEl = document.createElement('style');
        styleEl.id = 'algolia-slider-styles';
        styleEl.textContent = `
            /* Match Salla's slider styling exactly */
            .algolia-slider-wrapper {
                margin: 2rem 0;
                position: relative;
            }

            .algolia-slider-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.25rem;
            }

            .algolia-slider-header h2 {
                font-size: 1.25rem;
                font-weight: 700;
                margin: 0;
                color: inherit;
            }

            .s-slider-block__title-nav {
                display: flex;
                gap: 0.5rem;
                direction: rtl;
            }

            .s-slider-nav-arrow {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 1px solid #e5e7eb;
                background: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                padding: 0;
                outline: none;
            }

            .s-slider-nav-arrow:hover:not(:disabled) {
                background: #f3f4f6;
                border-color: #d1d5db;
            }

            .s-slider-nav-arrow:disabled,
            .s-slider-nav-arrow.swiper-button-disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }

            .s-slider-nav-arrow svg {
                width: 20px;
                height: 20px;
                fill: #374151;
            }

            .s-slider-button-icon {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Swiper container */
            .algolia-slider-container {
                position: relative;
                overflow: hidden;
            }

            .algolia-slider-container .swiper-wrapper {
                display: flex;
            }

            /* Swiper slide sizing - match Salla's responsive breakpoints */
            .algolia-slider-container .swiper-slide {
                width: 47% !important;
                flex-shrink: 0;
            }

            @media (min-width: 640px) {
                .algolia-slider-container .swiper-slide {
                    width: 47% !important;
                }
            }

            @media (min-width: 768px) {
                .algolia-slider-container .swiper-slide {
                    width: 31% !important;
                }
            }

            @media (min-width: 1024px) {
                .algolia-slider-container .swiper-slide {
                    width: 24% !important;
                }
            }

            /* Product card styling */
            .algolia-slider-container .s-product-card-entry,
            .algolia-slider-container custom-salla-product-card {
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            /* Recently viewed specific styling */
            .algolia-recently-viewed {
                margin-top: 2rem;
            }
        `;

        document.head.appendChild(styleEl);
        console.log('[AlgoliaSlider] Styles injected');
    }

    /**
     * Clean up when element is removed
     */
    disconnectedCallback() {
        this.destroy();
    }

    /**
     * Destroy Swiper instance
     */
    destroy() {
        if (this.swiper) {
            try {
                this.swiper.destroy(true, true);
                console.log('[AlgoliaSlider] Swiper destroyed');
            } catch (error) {
                console.error('[AlgoliaSlider] Error destroying Swiper:', error);
            }
            this.swiper = null;
        }
        this.initialized = false;
    }
}

// Register custom element
if (!customElements.get('algolia-recommendations-slider')) {
    customElements.define('algolia-recommendations-slider', AlgoliaRecommendationsSlider);
    console.log('[AlgoliaSlider] Custom element registered');
}

export default AlgoliaRecommendationsSlider;
