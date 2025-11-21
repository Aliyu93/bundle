/**
 * Product Card Image Slider Enhancer
 * Adds multi-image slider (3 images) to Salla product cards
 * Robust timing: handles async rendering with multi-pass scanning
 */

const IMAGE_API_BASE = 'https://productstoredis-163858290861.me-central2.run.app/product-images';
const BULK_CHUNK_SIZE = 50;

// Caches
const imageCache = new Map();
const pendingRequests = new Map();

// Styles
const SLIDER_STYLES = `
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
 * Fetch images for multiple products in one request
 */
async function fetchBulkImages(productIds) {
  if (!productIds.length) return {};

  const url = `${IMAGE_API_BASE}?ids=${productIds.join(',')}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Cache results
    Object.entries(data).forEach(([id, imgData]) => {
      if (imgData?.images) imageCache.set(String(id), imgData);
    });

    return data;
  } catch (e) {
    console.warn('[Card Enhancer] Bulk fetch failed:', e.message);
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch images for a single product
 */
async function fetchSingleImages(productId) {
  if (imageCache.has(productId)) {
    return imageCache.get(productId);
  }

  if (pendingRequests.has(productId)) {
    return pendingRequests.get(productId);
  }

  const promise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`${IMAGE_API_BASE}/${productId}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      imageCache.set(productId, data);
      return data;
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timeout);
      pendingRequests.delete(productId);
    }
  })();

  pendingRequests.set(productId, promise);
  return promise;
}

/**
 * Main enhancer class
 */
class ProductCardEnhancer {
  constructor() {
    this.enhanced = new WeakSet();
    this.scanPending = false;
    this.scanCount = 0;
    this.maxScans = 30;
    this.init();
  }

  init() {
    injectStyles();

    // Scan immediately
    this.scheduleScan(0);

    // Scan on DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.scheduleScan(0));
    }

    // Scan on window load
    window.addEventListener('load', () => {
      this.scheduleScan(100);
      this.scheduleScan(500);
    });

    // Salla events - scan with multiple delays to catch async renders
    const sallaEvents = [
      'salla-products-slider::products.fetched',
      'salla-products-list::products.fetched',
      'salla::page::changed',
      'theme::ready'
    ];

    sallaEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.scanCount = 0; // Reset scan count on new content
        this.scheduleScan(50);
        this.scheduleScan(200);
        this.scheduleScan(500);
      });
    });

    // MutationObserver for dynamic content
    this.setupObserver();

    console.log('[Card Enhancer] Initialized');
  }

  setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let hasNewContent = false;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList?.contains('s-product-card-entry') ||
                node.classList?.contains('s-products-list-wrapper') ||
                node.querySelector?.('.s-product-card-entry')) {
              hasNewContent = true;
              break;
            }
          }
        }
        if (hasNewContent) break;
      }

      if (hasNewContent) {
        this.scanCount = 0;
        this.scheduleScan(10);
        this.scheduleScan(100);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  scheduleScan(delay = 0) {
    setTimeout(() => {
      requestAnimationFrame(() => this.scan());
    }, delay);
  }

  scan() {
    if (this.scanCount >= this.maxScans) return;

    const cards = document.querySelectorAll('.s-product-card-entry');
    const unenhanced = [];

    cards.forEach(card => {
      // Skip if already enhanced (check both WeakSet and DOM)
      if (this.enhanced.has(card)) return;
      if (card.querySelector('.product-slider-dots')) return;

      const productId = this.extractProductId(card);
      if (productId) {
        unenhanced.push({ card, productId });
      }
    });

    if (unenhanced.length === 0) return;

    this.scanCount++;

    // Prefetch images in bulk
    const idsToFetch = unenhanced
      .map(c => c.productId)
      .filter(id => !imageCache.has(id) && !pendingRequests.has(id));

    if (idsToFetch.length > 0) {
      // Chunk and fetch
      for (let i = 0; i < idsToFetch.length; i += BULK_CHUNK_SIZE) {
        fetchBulkImages(idsToFetch.slice(i, i + BULK_CHUNK_SIZE));
      }
    }

    // Enhance each card
    unenhanced.forEach(({ card, productId }) => {
      this.enhanceCard(card, productId);
    });

    // Schedule another scan to catch any cards that appeared during enhancement
    if (this.scanCount < this.maxScans) {
      this.scheduleScan(150);
    }
  }

  extractProductId(card) {
    // Method 1: data-id
    if (card.dataset.id) return card.dataset.id;

    // Method 2: id attribute
    if (card.id && /^\d+$/.test(card.id)) return card.id;

    // Method 3: URL
    const link = card.querySelector('a[href*="/product/"]');
    if (link?.href) {
      const match = link.href.match(/\/product\/[^\/]+\/(\d+)/);
      if (match) return match[1];
    }

    // Method 4: product attribute
    const productAttr = card.getAttribute('product');
    if (productAttr) {
      try {
        const product = JSON.parse(productAttr);
        if (product.id) return String(product.id);
      } catch (e) {}
    }

    return null;
  }

  enhanceCard(card, productId) {
    const imageWrapper = card.querySelector('.s-product-card-image');
    if (!imageWrapper) return;

    // Mark as enhanced
    this.enhanced.add(card);

    // Create slider instance
    new CardSlider(card, productId, imageWrapper);
  }
}

/**
 * Individual card slider instance
 */
class CardSlider {
  constructor(card, productId, imageWrapper) {
    this.card = card;
    this.productId = productId;
    this.imageWrapper = imageWrapper;
    this.imageLink = imageWrapper.querySelector('a');
    this.sliderId = `slider-${productId}-${Math.random().toString(36).substr(2, 6)}`;
    this.currentSlide = 0;
    this.additionalImages = [];
    this.initialized = false;

    this.setupLazyInit();
  }

  setupLazyInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.initialized) {
          this.initialized = true;
          observer.disconnect();
          this.initialize();
        }
      });
    }, { rootMargin: '200px', threshold: 0.01 });

    observer.observe(this.imageWrapper);
  }

  async initialize() {
    // Setup UI (dots, swipe handlers)
    this.setupUI();

    // Fetch images
    const data = await fetchSingleImages(this.productId);
    if (data?.images?.length) {
      this.processImages(data.images);
    } else {
      this.hideDots();
    }
  }

  setupUI() {
    if (!this.imageLink) return;

    // Swipe indicator
    const swipeIndicator = document.createElement('div');
    swipeIndicator.className = 'swipe-indicator';
    this.imageLink.appendChild(swipeIndicator);

    // Touch/mouse handlers
    this.setupGestures(swipeIndicator);

    // Dots
    this.setupDots();
  }

  setupDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'product-slider-dots';
    dotsContainer.dataset.sliderId = this.sliderId;

    // 3 dots (main + 2 additional)
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = `product-slider-dot${i === 0 ? ' active' : ''}`;
      dot.dataset.index = i;
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.goToSlide(i);
        this.haptic('light');
      });
      dotsContainer.appendChild(dot);
    }

    this.imageWrapper.appendChild(dotsContainer);
    this.dotsContainer = dotsContainer;
  }

  setupGestures(swipeIndicator) {
    let startX, startY, startTime, hasMoved;

    const onStart = (x, y) => {
      startX = x;
      startY = y;
      startTime = Date.now();
      hasMoved = false;
    };

    const onMove = (x, y, e) => {
      if (startX === undefined) return;

      const dx = x - startX;
      const dy = y - startY;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        hasMoved = true;
        swipeIndicator.classList.toggle('right', dx > 0);
        swipeIndicator.style.opacity = Math.min(Math.abs(dx) / 100, 0.5);
        e.preventDefault();
      }
    };

    const onEnd = (x) => {
      if (startX === undefined) return;

      swipeIndicator.style.opacity = 0;

      if (hasMoved) {
        const dx = x - startX;
        const elapsed = Date.now() - startTime;
        const threshold = elapsed < 300 ? 30 : 50;

        if (Math.abs(dx) >= threshold) {
          dx > 0 ? this.prevSlide() : this.nextSlide();
          this.haptic('medium');
        }
      }

      startX = startY = undefined;
      hasMoved = false;
    };

    // Touch
    this.imageLink.addEventListener('touchstart', (e) => {
      onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    this.imageLink.addEventListener('touchmove', (e) => {
      onMove(e.touches[0].clientX, e.touches[0].clientY, e);
    }, { passive: false });

    this.imageLink.addEventListener('touchend', (e) => {
      onEnd(e.changedTouches[0].clientX);
    });

    // Mouse
    let mouseDown = false;

    this.imageLink.addEventListener('mousedown', (e) => {
      mouseDown = true;
      onStart(e.clientX, e.clientY);
      e.preventDefault();
    });

    this.imageLink.addEventListener('mousemove', (e) => {
      if (mouseDown) onMove(e.clientX, e.clientY, e);
    });

    window.addEventListener('mouseup', (e) => {
      if (mouseDown) {
        mouseDown = false;
        onEnd(e.clientX);
      }
    });
  }

  processImages(images) {
    const sorted = images
      .filter(img => img?.url)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .slice(0, 2);

    if (sorted.length === 0) {
      this.hideDots();
      return;
    }

    this.additionalImages = sorted;

    // Preload and add images
    sorted.forEach((img, i) => {
      this.addImage(img, i + 1);
    });

    // Hide unused dots
    if (sorted.length < 2) {
      const dot3 = this.dotsContainer?.querySelector('[data-index="2"]');
      if (dot3) dot3.style.display = 'none';
    }
  }

  addImage(imgData, index) {
    if (!this.imageLink) return;

    const img = document.createElement('img');
    img.className = 'product-slider-image';
    img.dataset.sliderId = this.sliderId;
    img.dataset.index = index;
    img.alt = imgData.alt || 'Product image';
    img.loading = 'lazy';
    img.src = imgData.url;

    img.onerror = () => {
      img.remove();
      const dot = this.dotsContainer?.querySelector(`[data-index="${index}"]`);
      if (dot) dot.style.display = 'none';
    };

    this.imageLink.appendChild(img);
  }

  goToSlide(index) {
    this.currentSlide = index;

    // Update dots
    this.dotsContainer?.querySelectorAll('.product-slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Get elements
    const mainImg = this.imageLink?.querySelector('img:not(.product-slider-image)');
    const sliderImgs = this.imageLink?.querySelectorAll('.product-slider-image');

    if (index === 0) {
      // Show main image
      if (mainImg) {
        mainImg.style.cssText = 'visibility:visible;opacity:1;z-index:10;';
      }
      sliderImgs?.forEach(img => img.classList.remove('active'));
    } else {
      // Hide main, show slider image
      if (mainImg) {
        mainImg.style.cssText = 'visibility:hidden;opacity:0;z-index:5;';
      }
      sliderImgs?.forEach(img => {
        img.classList.toggle('active', parseInt(img.dataset.index) === index);
      });
    }
  }

  prevSlide() {
    const total = this.additionalImages.length + 1;
    this.goToSlide((this.currentSlide - 1 + total) % total);
  }

  nextSlide() {
    const total = this.additionalImages.length + 1;
    this.goToSlide((this.currentSlide + 1) % total);
  }

  hideDots() {
    if (this.dotsContainer) {
      this.dotsContainer.style.display = 'none';
    }
  }

  haptic(intensity) {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(intensity === 'light' ? 10 : 25);
      }
    } catch (e) {}
  }
}

// Auto-initialize
const enhancer = new ProductCardEnhancer();

export default enhancer;
