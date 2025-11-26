/**
 * Product Title Enhancer
 * Applies dynamic font sizing and truncation to product titles
 * Matches the main theme's custom-salla-product-card behavior
 */

const TITLE_STYLES = `
  .s-product-card-entry .s-product-card-content-title a {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    font-weight: normal;
  }

  .s-product-card-entry .s-product-card-content-title a.title-long {
    font-size: 0.95rem;
    font-weight: normal;
  }

  .s-product-card-entry .s-product-card-content-title a.title-very-long {
    font-size: 0.9rem;
    font-weight: normal;
  }

  .s-product-card-entry .s-product-card-content-title a.title-extreme {
    font-size: 0.85rem;
    font-weight: normal;
  }
`;

class ProductTitleEnhancer {
  constructor() {
    this.processedElements = new WeakSet();
    this.pendingScan = false;
    this.init();
  }

  /**
   * Get CSS class based on title length
   * Matches main theme thresholds exactly
   */
  getTitleClass(title) {
    if (!title) return '';

    const length = title.length;

    if (length > 70) return 'title-extreme';
    if (length > 50) return 'title-very-long';
    if (length > 30) return 'title-long';
    if (length > 15) return 'title-medium';

    return '';
  }

  /**
   * Enhance a single title element
   */
  enhanceTitle(element) {
    if (this.processedElements.has(element)) return;

    const title = element.textContent?.trim();
    const titleClass = this.getTitleClass(title);

    if (titleClass) {
      element.classList.add(titleClass);
    }

    this.processedElements.add(element);
  }

  /**
   * Scan and enhance all product title elements
   */
  enhanceAllTitles() {
    const titles = document.querySelectorAll('.s-product-card-content-title a');
    titles.forEach(el => this.enhanceTitle(el));
  }

  /**
   * Debounced scan - prevents multiple rapid scans
   */
  scheduleScan() {
    if (this.pendingScan) return;

    this.pendingScan = true;
    requestAnimationFrame(() => {
      this.enhanceAllTitles();
      this.pendingScan = false;
    });
  }

  /**
   * Inject CSS styles into document head
   */
  injectStyles() {
    if (document.getElementById('product-title-enhancer-styles')) return;

    const style = document.createElement('style');
    style.id = 'product-title-enhancer-styles';
    style.textContent = TITLE_STYLES;
    document.head.appendChild(style);
  }

  /**
   * Setup MutationObserver to catch dynamically added products
   */
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if this node or its children contain product titles
              if (node.matches?.('.s-product-card-content-title a') ||
                  node.matches?.('.s-product-card-entry') ||
                  node.querySelector?.('.s-product-card-content-title a')) {
                shouldScan = true;
                break;
              }
            }
          }
        }
        if (shouldScan) break;
      }

      if (shouldScan) {
        this.scheduleScan();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Setup Salla event listeners for product loading
   */
  setupSallaEventListeners() {
    // Salla's event system
    if (window.salla?.event) {
      window.salla.event.on('products::loaded', () => this.scheduleScan());
      window.salla.event.on('product::loaded', () => this.scheduleScan());
    }

    // Theme events
    document.addEventListener('theme::ready', () => this.scheduleScan());
    document.addEventListener('salla::page::changed', () => {
      // Delay slightly to allow DOM to update
      setTimeout(() => this.scheduleScan(), 100);
    });
  }

  /**
   * Initialize the enhancer
   */
  init() {
    // Skip on cart page
    if (window.location.pathname.includes('/cart')) return;

    // 1. Inject CSS immediately (applies to existing elements)
    this.injectStyles();

    // 2. Immediate scan for any cards already rendered
    this.enhanceAllTitles();

    // 3. DOM ready scan
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.enhanceAllTitles());
    }

    // 4. Window load scan (catches late-loading content)
    window.addEventListener('load', () => this.enhanceAllTitles());

    // 5. MutationObserver for dynamic content
    this.setupMutationObserver();

    // 6. Salla event listeners
    this.setupSallaEventListeners();

    console.log('[Algolia Bundle] Product title enhancer initialized');
  }
}

// Auto-initialize
const productTitleEnhancer = new ProductTitleEnhancer();

export { productTitleEnhancer, ProductTitleEnhancer };
