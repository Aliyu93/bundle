/**
 * Product Card Image Slider Auto-Enhancer
 * Extends stock Salla product cards with multi-image slider functionality
 * Works with ALL product cards site-wide (Algolia + native Salla renders)
 */

// Inject slider styles once on load
const injectProductSliderStyles = () => {
  if (document.getElementById('product-slider-styles')) return;

  const style = document.createElement('style');
  style.id = 'product-slider-styles';
  style.textContent = `
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
      line-height: 0;
    }
    .product-slider-image.active {
      opacity: 1;
      visibility: visible;
      z-index: 10;
    }
    .s-product-card-image {
      position: relative !important;
      overflow: visible;
    }
    .s-product-card-image > a {
      position: relative !important;
      display: block;
      line-height: 0;
    }
    .s-product-card-image img {
      display: block;
      line-height: 0;
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
  document.head.appendChild(style);
};

class ProductCardEnhancer {
  constructor() {
    this.enhancedCards = new WeakSet();
    this.init();
  }

  init() {
    // Inject styles once
    injectProductSliderStyles();

    // Wait for Salla to be ready
    if (window.app?.status === 'ready') {
      this.setupEventListeners();
      this.enhanceExistingCards();
    } else {
      document.addEventListener('theme::ready', () => {
        this.setupEventListeners();
        this.enhanceExistingCards();
      });
    }
  }

  setupEventListeners() {
    // Listen for Salla product rendering events
    document.addEventListener('salla-products-slider::products.fetched', (e) => {
      console.log('[Product Card Enhancer] Products slider fetched');
      setTimeout(() => this.enhanceExistingCards(), 100);
    });

    document.addEventListener('salla-products-list::products.fetched', (e) => {
      console.log('[Product Card Enhancer] Products list fetched');
      setTimeout(() => this.enhanceExistingCards(), 100);
    });

    // Listen for page changes (SPA navigation)
    document.addEventListener('salla::page::changed', () => {
      console.log('[Product Card Enhancer] Page changed');
      setTimeout(() => this.enhanceExistingCards(), 500);
    });

    // MutationObserver as fallback for dynamically added cards
    this.setupMutationObserver();
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let hasNewCards = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Element node
              if (node.classList?.contains('s-product-card-entry') ||
                  node.querySelector?.('.s-product-card-entry')) {
                hasNewCards = true;
                break;
              }
            }
          }
        }
        if (hasNewCards) break;
      }

      if (hasNewCards) {
        setTimeout(() => this.enhanceExistingCards(), 50);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  enhanceExistingCards() {
    const cards = document.querySelectorAll('.s-product-card-entry');
    console.log(`[Product Card Enhancer] Found ${cards.length} product cards`);

    cards.forEach(card => {
      const productId = this.extractProductId(card);
      if (productId && !this.enhancedCards.has(card)) {
        this.enhanceCard(card, productId);
      }
    });
  }

  extractProductId(card) {
    // Try multiple methods to extract product ID

    // Method 1: data-id attribute
    if (card.dataset.id) {
      return card.dataset.id;
    }

    // Method 2: id attribute
    if (card.id && !isNaN(card.id)) {
      return card.id;
    }

    // Method 3: Extract from product link URL
    const link = card.querySelector('.s-product-card-image a, .s-product-card-content-title a');
    if (link?.href) {
      const match = link.href.match(/\/product\/[^\/]+\/(\d+)/);
      if (match) return match[1];
    }

    // Method 4: Look for product data in attributes
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
    console.log(`[Product Card Enhancer] Enhancing card for product ${productId}`);

    const imageWrapper = card.querySelector('.s-product-card-image');
    if (!imageWrapper) {
      console.warn(`[Product Card Enhancer] No image wrapper found for product ${productId}`);
      return;
    }

    // Create instance for this card
    const instance = new CardSliderInstance(card, productId, imageWrapper);
    this.enhancedCards.add(card);

    // Setup lazy initialization when card comes into view
    instance.setupLazyInit();
  }
}

class CardSliderInstance {
  constructor(card, productId, imageWrapper) {
    this.card = card;
    this.productId = productId;
    this.imageWrapper = imageWrapper;
    this.imageContainer = imageWrapper.querySelector('a');
    this.currentSlide = 0;
    this.additionalImages = [];
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isSwiping = false;
    this.isMouseDown = false;
    this.sliderInitialized = false;
    this.sliderId = `slider-${productId}-${Date.now()}`;
    this.boundEventHandlers = {};
    this._maxInitRetries = 5;
  }

  getImageContainer() {
    if (this.imageContainer && this.imageContainer.isConnected) {
      return this.imageContainer;
    }

    if (!this.imageWrapper?.isConnected) {
      this.imageWrapper = this.card.querySelector('.s-product-card-image');
    }

    this.imageContainer = this.imageWrapper?.querySelector('a') || null;
    return this.imageContainer;
  }

  setupLazyInit() {
    if (!this.imageWrapper) return;

    this._observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.sliderInitialized) {
          this.sliderInitialized = true;

          // Setup slider UI
          this.setupImageSlider();

          // Fetch additional images from Redis
          setTimeout(() => {
            this.fetchProductImages();
          }, 50);

          // Unobserve after initialization
          this._observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '300px',
      threshold: 0.01
    });

    this._observer.observe(this.imageWrapper);
  }

  setupImageSlider(retryCount = 0) {
    const imageContainer = this.getImageContainer();
    if (!imageContainer) {
      if (retryCount < this._maxInitRetries) {
        setTimeout(() => this.setupImageSlider(retryCount + 1), 100);
      } else {
        console.warn(`[Product Card Enhancer] Image link missing for product ${this.productId}`);
      }
      return;
    }

    this.imageContainer = imageContainer;

    // Add swipe indicator
    const swipeIndicator = document.createElement('div');
    swipeIndicator.className = 'swipe-indicator';
    imageContainer.appendChild(swipeIndicator);

    // Setup touch/swipe handlers
    let startX = null;
    let startY = null;
    let startTime = null;
    let hasMoved = false;

    this.boundEventHandlers.touchstart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      hasMoved = false;
    };

    this.boundEventHandlers.touchmove = (e) => {
      if (!startX) return;

      const moveX = e.touches[0].clientX - startX;
      const moveY = e.touches[0].clientY - startY;

      // Only handle horizontal swipes
      if (Math.abs(moveX) > Math.abs(moveY) && Math.abs(moveX) > 10) {
        hasMoved = true;
        this.isSwiping = true;

        swipeIndicator.classList.toggle('right', moveX > 0);
        swipeIndicator.style.opacity = Math.min(Math.abs(moveX) / 100, 0.5);

        e.preventDefault();
      }
    };

    this.boundEventHandlers.touchend = (e) => {
      if (!startX || !hasMoved) {
        startX = startY = null;
        this.isSwiping = false;
        swipeIndicator.style.opacity = 0;
        return;
      }

      if (this.isSwiping) {
        const endX = e.changedTouches[0].clientX;
        const moveX = endX - startX;
        const elapsedTime = Date.now() - startTime;

        const minSwipeDistance = elapsedTime < 300 ? 30 : 50;

        if (Math.abs(moveX) >= minSwipeDistance) {
          if (moveX > 0) {
            this.prevSlide();
            this.triggerHapticFeedback('medium');
          } else {
            this.nextSlide();
            this.triggerHapticFeedback('medium');
          }
        }

        e.preventDefault();
        e.stopPropagation();
      }

      swipeIndicator.style.opacity = 0;
      startX = startY = null;
      this.isSwiping = false;
    };

    imageContainer.addEventListener('touchstart', this.boundEventHandlers.touchstart, {passive: true});
    imageContainer.addEventListener('touchmove', this.boundEventHandlers.touchmove, {passive: false});
    imageContainer.addEventListener('touchend', this.boundEventHandlers.touchend, {passive: false});

    // Setup mouse handlers (desktop drag)
    this.boundEventHandlers.mousedown = (e) => {
      this.isMouseDown = true;
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
      hasMoved = false;
      e.preventDefault();
      e.stopPropagation();
    };

    this.boundEventHandlers.mousemove = (e) => {
      if (!this.isMouseDown || !startX) return;

      const moveX = e.clientX - startX;

      if (Math.abs(moveX) > 10) {
        hasMoved = true;
        this.isSwiping = true;

        swipeIndicator.classList.toggle('right', moveX > 0);
        swipeIndicator.style.opacity = Math.min(Math.abs(moveX) / 100, 0.5);
      }

      if (this.isSwiping) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    this.boundEventHandlers.mouseup = (e) => {
      if (!this.isMouseDown) return;

      if (hasMoved && this.isSwiping) {
        const endX = e.clientX;
        const moveX = endX - startX;
        const elapsedTime = Date.now() - startTime;

        const minSwipeDistance = elapsedTime < 300 ? 30 : 50;

        if (Math.abs(moveX) >= minSwipeDistance) {
          if (moveX > 0) {
            this.prevSlide();
          } else {
            this.nextSlide();
          }
        }

        e.preventDefault();
        e.stopPropagation();
      }

      swipeIndicator.style.opacity = 0;
      this.isMouseDown = false;
      this.isSwiping = false;
      startX = startY = null;
    };

    imageContainer.addEventListener('mousedown', this.boundEventHandlers.mousedown);
    imageContainer.addEventListener('mousemove', this.boundEventHandlers.mousemove);
    window.addEventListener('mouseup', this.boundEventHandlers.mouseup);

    // Setup dots (initially with just the main image dot)
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'product-slider-dots';
    dotsContainer.dataset.sliderId = this.sliderId;
    dotsContainer.dataset.productId = this.productId;

    const firstDot = document.createElement('span');
    firstDot.className = 'product-slider-dot active';
    firstDot.dataset.sliderId = this.sliderId;
    firstDot.dataset.productId = this.productId;
    firstDot.dataset.index = '0';
    firstDot.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.changeSlide(0);
      this.triggerHapticFeedback('light');
    });
    dotsContainer.appendChild(firstDot);

    // Add 2 placeholder dots for additional images
    for (let i = 0; i < 2; i++) {
      const dot = document.createElement('span');
      dot.className = 'product-slider-dot';
      dot.dataset.sliderId = this.sliderId;
      dot.dataset.productId = this.productId;
      dot.dataset.index = String(i + 1);
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.changeSlide(i + 1);
        this.triggerHapticFeedback('light');
      });
      dotsContainer.appendChild(dot);
    }

    this.imageWrapper.appendChild(dotsContainer);
  }

  fetchProductImages() {
    if (!this.productId) return;

    const requestUrl = `https://productstoredis-163858290861.me-central2.run.app/product-images/${this.productId}`;

    fetch(requestUrl, { timeout: 5000 })
      .then(response => response.json())
      .then(data => this.processImageResponse(data))
      .catch(error => {
        console.warn(`[Product Card Enhancer] Failed to fetch images for product ${this.productId}:`, error);
        // Hide dots if no additional images
        const dotsContainer = this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);
        if (dotsContainer) {
          dotsContainer.style.display = 'none';
        }
      });
  }

  processImageResponse(data) {
    if (!data?.images || !Array.isArray(data.images)) {
      const dotsContainer = this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);
      if (dotsContainer) {
        dotsContainer.style.display = 'none';
      }
      return;
    }

    const additionalImages = data.images
      .filter(img => img && img.url)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .slice(0, 2)
      .map(img => ({ url: img.url, alt: img.alt }));

    if (additionalImages.length === 0) {
      const dotsContainer = this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);
      if (dotsContainer) {
        dotsContainer.style.display = 'none';
      }
      return;
    }

    this.additionalImages = additionalImages;

    // Show dots
    const dotsContainer = this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);
    if (dotsContainer) {
      dotsContainer.style.display = 'flex';
    }

    // Preload images
    this.preloadAllImages();
  }

  preloadAllImages() {
    if (this.additionalImages && this.additionalImages.length > 0) {
      this.addImageToSlider(this.additionalImages[0], 1);

      if (this.additionalImages.length > 1) {
        this.addImageToSlider(this.additionalImages[1], 2);
      }
    }
  }

  addImageToSlider(image, index) {
    const imageContainer = this.getImageContainer();
    if (!image?.url || !imageContainer) return;

    const existingImg = imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${index}"]`);
    if (existingImg) return;

    const img = document.createElement('img');
    img.className = 'product-slider-image';
    img.src = image.url;
    img.alt = image.alt || 'Product image';
    img.dataset.sliderId = this.sliderId;
    img.dataset.productId = this.productId;
    img.dataset.index = String(index);

    img.onload = () => {
      const dot = this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${index}"]`);
      if (dot) dot.classList.add('loaded');
    };

    img.onerror = () => {
      img.remove();
      const dot = this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${index}"]`);
      if (dot) {
        dot.remove();
        this.checkDotsVisibility();
      }
    };

    imageContainer.appendChild(img);
  }

  checkDotsVisibility() {
    const dotsContainer = this.imageWrapper.querySelector(`.product-slider-dots[data-slider-id="${this.sliderId}"]`);
    if (dotsContainer) {
      const availableDots = dotsContainer.querySelectorAll('.product-slider-dot');
      dotsContainer.style.display = availableDots.length <= 1 ? 'none' : 'flex';
    }
  }

  changeSlide(index) {
    if (this.additionalImages && index > 0 && this.additionalImages[index - 1]) {
      this.addImageToSlider(this.additionalImages[index - 1], index);
    }

    this.currentSlide = index;

    const imageContainer = this.getImageContainer();
    if (!imageContainer) return;

    this.imageContainer = imageContainer;

    const mainImage = imageContainer.querySelector('img.lazy, img[loading="lazy"], img:first-child:not(.product-slider-image)');
    const additionalImages = imageContainer.querySelectorAll(`.product-slider-image[data-slider-id="${this.sliderId}"]`);
    const dots = this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`);

    dots.forEach(dot => dot.classList.remove('active'));

    const activeDot = this.imageWrapper.querySelector(`.product-slider-dot[data-slider-id="${this.sliderId}"][data-index="${index}"]`);
    if (activeDot) activeDot.classList.add('active');

    if (index === 0) {
      if (mainImage) {
        mainImage.style.visibility = 'visible';
        mainImage.style.opacity = '1';
        mainImage.style.zIndex = '10';
      }
      additionalImages.forEach(img => img.classList.remove('active'));
    } else {
      if (mainImage) {
        mainImage.style.visibility = 'hidden';
        mainImage.style.opacity = '0';
        mainImage.style.zIndex = '5';
      }
      additionalImages.forEach(img => img.classList.remove('active'));

      const activeImage = imageContainer.querySelector(`.product-slider-image[data-slider-id="${this.sliderId}"][data-index="${index}"]`);
      if (activeImage) {
        activeImage.classList.add('active');
      } else if (mainImage) {
        mainImage.style.visibility = 'visible';
        mainImage.style.opacity = '1';
        mainImage.style.zIndex = '10';
      }
    }
  }

  prevSlide() {
    const totalSlides = this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length;
    const newIndex = (this.currentSlide - 1 + totalSlides) % totalSlides;
    this.changeSlide(newIndex);
  }

  nextSlide() {
    const totalSlides = this.imageWrapper.querySelectorAll(`.product-slider-dot[data-slider-id="${this.sliderId}"]`).length;
    const newIndex = (this.currentSlide + 1) % totalSlides;
    this.changeSlide(newIndex);
  }

  triggerHapticFeedback(intensity) {
    try {
      if (window.navigator && window.navigator.vibrate) {
        switch (intensity) {
          case 'light':
            window.navigator.vibrate(10);
            break;
          case 'medium':
            window.navigator.vibrate(25);
            break;
          case 'strong':
            window.navigator.vibrate([10, 20, 30]);
            break;
        }
      }
    } catch (e) {
      // Vibration not supported
    }
  }
}

// Auto-initialize on import
const productCardEnhancer = new ProductCardEnhancer();

export default productCardEnhancer;
