/**
 * Algolia Integration Bundle
 * Standalone bundle for Redis/Algolia-powered features:
 * - Category ranking
 * - Product recommendations
 * - Homepage category sliders
 * - Cart frequently bought together
 */

// Static imports – esbuild bundles these automatically
import { redisService } from './services/redis-service.js';
import CartAddonsSlider from './components/CartAddonsSlider.js';
import './components/AlgoliaRecommendationsSlider.js'; // Custom slider for product recommendations
import './partials/product-ranking.js';       // Registers <product-ranking> custom element
import './partials/category-products.js';     // Registers <mahaba-category-products> custom element
// DISABLED: Video gallery temporarily disabled
// import './partials/video-gallery.js';        // Registers <mahaba-video-gallery> custom element
import productRecommendations from './partials/product-recommendations.js';
import './product-ranking-init.js';           // Sets up category/tag page ranking
import './partials/youtube-url-transformer.js'; // YouTube URL to click-to-play
import './partials/product-title-enhancer.js'; // Dynamic title sizing + truncation
import './partials/product-card-enhancer.js'; // Multi-image slider for product cards
// DISABLED: WhatsApp floating button temporarily disabled
// import './partials/whatsapp-widget.js';      // WhatsApp floating button

// Expose globals expected by legacy theme code
window.productRecommendations = productRecommendations;
window.redisService = redisService;

// DOM-ready helper
const onReady = (fn) =>
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn)
    : fn();

/**
 * Injects the custom <mahaba-category-products> element onto the homepage.
 * Works with stock Raed theme (body.index class and .app-inner container).
 */
function runHomepageInjection() {
  // Correct homepage detection for stock Raed theme
  if (!document.body.classList.contains('index')) {
    console.log('[Algolia Bundle] Not on homepage, skipping category products injection');
    return;
  }

  const ANCHOR_SELECTOR = '.app-inner';
  const ELEMENT_TAG = 'mahaba-category-products';

  function injectElement() {
    const anchor = document.querySelector(ANCHOR_SELECTOR);

    if (anchor && !anchor.querySelector(ELEMENT_TAG)) {
      try {
        console.log(`[Algolia Bundle] Found ${ANCHOR_SELECTOR}, injecting ${ELEMENT_TAG}...`);
        const newElement = document.createElement(ELEMENT_TAG);

        // Insert BEFORE footer (not after)
        const footer = document.querySelector('.store-footer');
        if (footer) {
          anchor.insertBefore(newElement, footer);
        } else {
          anchor.appendChild(newElement);  // Fallback
        }

        console.log('✅ [Algolia Bundle] Homepage category component injected successfully');
        return true;
      } catch (e) {
        console.error('[Algolia Bundle] Error during injection:', e);
        return true;
      }
    }
    return false;
  }

  // Try immediate injection
  if (injectElement()) {
    return;
  }

  // Setup MutationObserver for async content
  console.log(`[Algolia Bundle] ${ANCHOR_SELECTOR} not found, waiting for async load...`);

  const observer = new MutationObserver((mutations, obs) => {
    const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);

    if (hasAddedNodes && injectElement()) {
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function injectCartAddonsStyles() {
  if (document.getElementById('cart-addons-slider-styles')) return;

  const style = document.createElement('style');
  style.id = 'cart-addons-slider-styles';
  style.textContent = `
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
  `;

  document.head.appendChild(style);
}

/**
 * Injects the <mahaba-video-gallery> element BEFORE the category products on homepage.
 */
function runVideoGalleryInjection() {
  // Only run on homepage
  if (!document.body.classList.contains('index')) {
    return;
  }

  const ELEMENT_TAG = 'mahaba-video-gallery';

  function injectElement() {
    // Check if already exists
    if (document.querySelector(ELEMENT_TAG)) {
      return true;
    }

    // Try to find category products to insert before
    const categoryProducts = document.querySelector('mahaba-category-products');
    if (categoryProducts && categoryProducts.parentElement) {
      const videoGallery = document.createElement(ELEMENT_TAG);
      categoryProducts.parentElement.insertBefore(videoGallery, categoryProducts);
      console.log('✅ [Algolia Bundle] Video gallery injected before category products');
      return true;
    }

    // Fallback: find .app-inner and insert before footer
    const appInner = document.querySelector('.app-inner');
    const footer = document.querySelector('.store-footer');
    if (appInner) {
      const videoGallery = document.createElement(ELEMENT_TAG);
      if (footer) {
        appInner.insertBefore(videoGallery, footer);
      } else {
        appInner.appendChild(videoGallery);
      }
      console.log('✅ [Algolia Bundle] Video gallery injected (fallback location)');
      return true;
    }

    return false;
  }

  // Try immediate injection
  if (injectElement()) {
    return;
  }

  // Setup MutationObserver for async content
  console.log('[Algolia Bundle] Waiting for DOM to inject video gallery...');

  const observer = new MutationObserver((mutations, obs) => {
    const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);

    if (hasAddedNodes && injectElement()) {
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Timeout fallback - stop waiting after 10 seconds
  setTimeout(() => {
    observer.disconnect();
  }, 10000);
}

function runCartAddonsInjection() {
  injectCartAddonsStyles();
  const ensure = () => {
    const submitButton = document.querySelector('#cart-submit');
    if (!submitButton) return false;

    const submitWrap = submitButton.closest('.cart-submit-wrap') || submitButton.parentElement;
    const parent = submitWrap?.parentElement || submitWrap;
    if (!parent) return false;

    if (parent.querySelector('cart-addons-slider')) {
      return true;
    }

    const slider = document.createElement('cart-addons-slider');
    slider.className = 'cart-addons-wrapper';

    if (submitWrap && parent) {
      parent.insertBefore(slider, submitWrap.nextSibling);
    } else {
      parent.appendChild(slider);
    }

    console.log('[Algolia Bundle] Injected cart addons slider');
    return true;
  };

  if (document.querySelector('cart-addons-slider')) return;

  if (ensure()) return;

  const observer = new MutationObserver((mutations, obs) => {
    if (ensure()) {
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

onReady(() => {
  // 1. Homepage: Inject category products component
  runHomepageInjection();

  // 1b. Homepage: Inject video gallery (above category products)
  // DISABLED: Video gallery temporarily disabled
  // setTimeout(runVideoGalleryInjection, 100);

  // 2. Product page: Initialize recommendations (works correctly, unchanged)
  const isProductPage = document.querySelector('[id^="product-"]');

  if (isProductPage) {
    setTimeout(() => {
      productRecommendations.initialize();
      console.log('✅ [Algolia Bundle] Product recommendations initialized');
    }, 3000);
  }

  // 3. Cart page: Ensure cart addons slider exists
  if (document.querySelector('form[id^="item-"]') || document.querySelector('#cart-submit')) {
    setTimeout(runCartAddonsInjection, 500);
  }

  // 4. All pages: WhatsApp floating button
  // DISABLED: WhatsApp floating button temporarily disabled
  // if (!document.querySelector('whatsapp-floating-button')) {
  //   document.body.appendChild(document.createElement('whatsapp-floating-button'));
  // }

  console.log('✅ [Algolia Bundle] Loaded successfully');
});

document.addEventListener('salla::page::changed', () => {
  productRecommendations.reset();
  setTimeout(() => {
    productRecommendations.initialize();
  }, 1000);

  setTimeout(runCartAddonsInjection, 500);
});

// Fallback: Also listen for theme::ready (fires on every page load)
// This handles cases where salla::page::changed doesn't fire (full page reloads)
document.addEventListener('theme::ready', () => {
  if (!document.querySelector('[id^="product-"]')) return;

  const currentProductId = productRecommendations.getProductId();

  // Skip if already initialized for this exact product
  if (currentProductId && productRecommendations.productId && currentProductId === productRecommendations.productId) {
    return; // Same product, already showing correct recommendations
  }

  // Different product or not initialized yet - proceed with re-initialization
  if (currentProductId) {
    console.log('[Algolia Bundle] New product detected via theme::ready, re-initializing');
    productRecommendations.reset();
    setTimeout(() => {
      productRecommendations.initialize();
    }, 1000);
  }
});
