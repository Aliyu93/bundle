/**
 * Product Card Image Slider Enhancer
 * Adds multi-image slider (3 images) to Salla product cards
 *
 * Design: Eager UI setup (dots added immediately) + lazy image loading
 * Detection: DOM-only (checks for .product-slider-dots)
 * Timing: Continuous polling with smart auto-stop
 */

const IMAGE_API_BASE = 'https://productstoredis-163858290861.me-central2.run.app/product-images';

// Image cache
const imageCache = new Map();
const pendingRequests = new Map();

// Styles
const SLIDER_STYLES = `
.product-slider-dots {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: none;
  justify-content: center;
  gap: 6px;
  z-index: 50;
}
.product-slider-dots.has-images {
  display: flex;
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
}
.product-slider-image.active {
  opacity: 1;
  visibility: visible;
  z-index: 10;
}
.s-product-card-image {
  position: relative !important;
  overflow: hidden;
}
.s-product-card-image > a {
  position: relative !important;
  display: block;
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
`;

function injectStyles() {
  if (document.getElementById('product-slider-enhancer-styles')) return;
  const style = document.createElement('style');
  style.id = 'product-slider-enhancer-styles';
  style.textContent = SLIDER_STYLES;
  document.head.appendChild(style);
}

/**
 * Fetch images for a single product (with caching and deduplication)
 */
async function fetchImages(productId) {
  if (imageCache.has(productId)) {
    return imageCache.get(productId);
  }

  if (pendingRequests.has(productId)) {
    return pendingRequests.get(productId);
  }

  const promise = (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${IMAGE_API_BASE}/${productId}`, {
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) return null;

      const data = await res.json();
      imageCache.set(productId, data);
      return data;
    } catch (e) {
      return null;
    } finally {
      pendingRequests.delete(productId);
    }
  })();

  pendingRequests.set(productId, promise);
  return promise;
}

/**
 * Main enhancer - uses continuous polling with smart auto-stop
 */
class ProductCardEnhancer {
  constructor() {
    this.polling = false;
    this.lastEnhanceTime = 0;
    this.pollInterval = 100; // Poll every 100ms
    this.stopAfterIdle = 5000; // Stop after 5s of no new enhancements
    this.init();
  }

  init() {
    // Skip on cart page
    if (window.location.pathname.includes('/cart')) return;

    injectStyles();

    // Start polling immediately
    this.startPolling();

    // Re-activate polling on any content change
    const reactivate = () => {
      this.lastEnhanceTime = Date.now(); // Reset idle timer
      this.startPolling();
    };

    // DOM events
    document.addEventListener('DOMContentLoaded', reactivate);
    window.addEventListener('load', reactivate);

    // Salla events
    [
      'salla-products-slider::products.fetched',
      'salla-products-list::products.fetched',
      'salla::page::changed',
      'theme::ready'
    ].forEach(evt => document.addEventListener(evt, reactivate));

    // MutationObserver as backup trigger
    new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1 && (
            node.classList?.contains('s-product-card-entry') ||
            node.querySelector?.('.s-product-card-entry')
          )) {
            reactivate();
            return;
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });

    console.log('[Card Enhancer] Initialized with continuous polling');
  }

  startPolling() {
    if (this.polling) return;
    this.polling = true;
    this.poll();
  }

  poll() {
    if (!this.polling) return;

    const count = this.scan();

    if (count > 0) {
      this.lastEnhanceTime = Date.now();
    }

    // Stop if idle for too long
    if (Date.now() - this.lastEnhanceTime > this.stopAfterIdle) {
      this.polling = false;
      console.log('[Card Enhancer] Polling stopped (idle)');
      return;
    }

    // Continue polling
    setTimeout(() => requestAnimationFrame(() => this.poll()), this.pollInterval);
  }

  scan() {
    let count = 0;

    // Find all product cards
    document.querySelectorAll('.s-product-card-entry').forEach(card => {
      // Skip if already has dots (DOM-based detection only)
      if (card.querySelector('.product-slider-dots')) return;

      // Get required elements
      const imageWrapper = card.querySelector('.s-product-card-image');
      if (!imageWrapper) return;

      const imageLink = imageWrapper.querySelector('a');
      if (!imageLink) return;

      // Extract product ID
      const productId = this.extractProductId(card);
      if (!productId) return;

      // Enhance this card
      this.enhance(card, productId, imageWrapper, imageLink);
      count++;
    });

    return count;
  }

  extractProductId(card) {
    // data-id attribute
    if (card.dataset.id) return card.dataset.id;

    // Numeric id attribute
    if (card.id && /^\d+$/.test(card.id)) return card.id;

    // From URL
    const link = card.querySelector('a[href*="/product/"]');
    if (link?.href) {
      const match = link.href.match(/\/product\/[^\/]+\/(\d+)/);
      if (match) return match[1];
    }

    // From product JSON attribute
    try {
      const attr = card.getAttribute('product');
      if (attr) {
        const data = JSON.parse(attr);
        if (data.id) return String(data.id);
      }
    } catch (e) {}

    return null;
  }

  enhance(card, productId, imageWrapper, imageLink) {
    // Create unique slider ID
    const sliderId = `s${productId}-${Math.random().toString(36).substr(2, 4)}`;

    imageWrapper.classList.add('swiper-no-swiping');
    imageLink.classList.add('swiper-no-swiping');

    // Add swipe indicator
    const swipeIndicator = document.createElement('div');
    swipeIndicator.className = 'swipe-indicator';
    imageLink.appendChild(swipeIndicator);

    // Add dots container (hidden until images load)
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'product-slider-dots';
    dotsContainer.dataset.sliderId = sliderId;

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'product-slider-dot' + (i === 0 ? ' active' : '');
      dot.dataset.index = i;
      dotsContainer.appendChild(dot);
    }

    imageWrapper.appendChild(dotsContainer);

    // Create slider controller
    new CardSlider({
      productId,
      sliderId,
      imageWrapper,
      imageLink,
      dotsContainer,
      swipeIndicator
    });
  }
}

/**
 * Individual card slider controller
 */
class CardSlider {
  constructor({ productId, sliderId, imageWrapper, imageLink, dotsContainer, swipeIndicator }) {
    this.productId = productId;
    this.sliderId = sliderId;
    this.imageWrapper = imageWrapper;
    this.imageLink = imageLink;
    this.dotsContainer = dotsContainer;
    this.swipeIndicator = swipeIndicator;
    this.currentSlide = 0;
    this.images = [];
    this.imagesLoaded = false;

    this.setupGestures();
    this.setupDotClicks();
    this.setupLazyImageLoad();
  }

  setupDotClicks() {
    this.dotsContainer.querySelectorAll('.product-slider-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.goToSlide(parseInt(dot.dataset.index));
        this.haptic('light');
      });
    });
  }

  setupGestures() {
    let startX, startY, startTime;
    let isOurSwipe = false; // We've claimed this as our horizontal swipe
    let directionDecided = false; // We've determined swipe direction

    const onStart = (x, y, e) => {
      startX = x;
      startY = y;
      startTime = Date.now();
      isOurSwipe = false;
      directionDecided = false;
      // Stop propagation on start to prevent Swiper from initiating
      e.stopPropagation();
    };

    const onMove = (x, y, e) => {
      if (startX == null) return;
      const dx = x - startX;
      const dy = y - startY;

      // First significant movement - decide who owns this gesture
      if (!directionDecided && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        directionDecided = true;
        // Horizontal swipe = ours (image slider)
        // Vertical swipe = not ours (page scroll / let Swiper handle)
        isOurSwipe = Math.abs(dx) > Math.abs(dy);
      }

      if (isOurSwipe) {
        // We own this gesture - STOP PROPAGATION to prevent Swiper
        e.stopPropagation();
        e.preventDefault();

        this.swipeIndicator.classList.toggle('right', dx > 0);
        this.swipeIndicator.style.opacity = Math.min(Math.abs(dx) / 100, 0.5);
      }
    };

    const onEnd = (x, e) => {
      this.swipeIndicator.style.opacity = 0;

      if (isOurSwipe && startX != null) {
        const dx = x - startX;
        const threshold = (Date.now() - startTime) < 300 ? 30 : 50;

        if (Math.abs(dx) >= threshold) {
          dx > 0 ? this.prevSlide() : this.nextSlide();
          this.haptic('medium');
        }

        // Stop propagation on end too
        e.stopPropagation();
        e.preventDefault();
      }

      startX = startY = null;
      isOurSwipe = false;
      directionDecided = false;
    };

    // Touch events - capture phase to intercept before Swiper
    this.imageLink.addEventListener('touchstart', e => {
      onStart(e.touches[0].clientX, e.touches[0].clientY, e);
    }, { passive: false, capture: true });

    this.imageLink.addEventListener('touchmove', e => {
      onMove(e.touches[0].clientX, e.touches[0].clientY, e);
    }, { passive: false, capture: true });

    this.imageLink.addEventListener('touchend', e => {
      onEnd(e.changedTouches[0].clientX, e);
    }, { passive: false, capture: true });

    // Mouse events
    let mouseDown = false;
    this.imageLink.addEventListener('mousedown', e => {
      mouseDown = true;
      onStart(e.clientX, e.clientY, e);
      e.preventDefault();
      e.stopPropagation();
    }, { capture: true });

    this.imageLink.addEventListener('mousemove', e => {
      if (mouseDown) onMove(e.clientX, e.clientY, e);
    }, { capture: true });

    window.addEventListener('mouseup', e => {
      if (mouseDown) {
        mouseDown = false;
        onEnd(e.clientX, e);
      }
    });
  }

  setupLazyImageLoad() {
    // Use IntersectionObserver to load images when card is near viewport
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.imagesLoaded) {
        this.imagesLoaded = true;
        observer.disconnect();
        this.loadImages();
      }
    }, { rootMargin: '300px' });

    observer.observe(this.imageWrapper);
  }

  async loadImages() {
    const data = await fetchImages(this.productId);

    if (!data?.images?.length) {
      this.dotsContainer.style.display = 'none';
      return;
    }

    // Sort and take max 2 additional images
    const sorted = data.images
      .filter(img => img?.url)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .slice(0, 2);

    if (sorted.length === 0) {
      this.dotsContainer.style.display = 'none';
      return;
    }

    this.images = sorted;

    // Add images to DOM
    sorted.forEach((imgData, i) => {
      const img = document.createElement('img');
      img.className = 'product-slider-image';
      img.dataset.index = i + 1;
      img.alt = imgData.alt || 'Product image';
      img.loading = 'lazy';
      img.src = imgData.url;

      img.onerror = () => {
        img.remove();
        const dot = this.dotsContainer.querySelector(`[data-index="${i + 1}"]`);
        if (dot) dot.style.display = 'none';
        this.updateDotsVisibility();
      };

      this.imageLink.appendChild(img);
    });

    // Hide third dot if only 1 additional image
    if (sorted.length < 2) {
      const dot3 = this.dotsContainer.querySelector('[data-index="2"]');
      if (dot3) dot3.style.display = 'none';
    }

    // Show dots
    this.dotsContainer.classList.add('has-images');
  }

  updateDotsVisibility() {
    const visibleDots = this.dotsContainer.querySelectorAll('.product-slider-dot:not([style*="display: none"])');
    if (visibleDots.length <= 1) {
      this.dotsContainer.classList.remove('has-images');
    }
  }

  goToSlide(index) {
    if (!this.images.length && index > 0) return;

    this.currentSlide = index;

    // Update dots
    this.dotsContainer.querySelectorAll('.product-slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Get main image (first img that's not a slider image)
    const mainImg = this.imageLink.querySelector('img:not(.product-slider-image)');
    const sliderImgs = this.imageLink.querySelectorAll('.product-slider-image');

    if (index === 0) {
      // Show main image
      if (mainImg) mainImg.style.cssText = 'visibility:visible;opacity:1;z-index:10;';
      sliderImgs.forEach(img => img.classList.remove('active'));
    } else {
      // Hide main, show selected slider image
      if (mainImg) mainImg.style.cssText = 'visibility:hidden;opacity:0;z-index:5;';
      sliderImgs.forEach(img => {
        img.classList.toggle('active', parseInt(img.dataset.index) === index);
      });
    }
  }

  prevSlide() {
    const total = this.images.length + 1;
    this.goToSlide((this.currentSlide - 1 + total) % total);
  }

  nextSlide() {
    const total = this.images.length + 1;
    this.goToSlide((this.currentSlide + 1) % total);
  }

  haptic(type) {
    try {
      navigator.vibrate?.(type === 'light' ? 10 : 25);
    } catch (e) {}
  }
}

// Initialize
new ProductCardEnhancer();
