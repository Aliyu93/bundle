/**
 * YouTube URL Transformer
 * Converts plain YouTube URLs into click-to-play video placeholders
 * Zero YouTube network calls until user clicks
 */

const STYLES = `
.yt-placeholder {
  position: relative;
  display: block;
  width: 100%;
  max-width: 560px;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  margin: 1rem 0;
}

.yt-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: opacity 0.2s ease;
}

.yt-placeholder:hover img {
  opacity: 1;
}

.yt-placeholder-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 68px;
  height: 48px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.yt-placeholder:hover .yt-placeholder-play {
  background: #ff0000;
}

.yt-placeholder-play::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-40%, -50%);
  border-style: solid;
  border-width: 10px 0 10px 18px;
  border-color: transparent transparent transparent #fff;
}

.yt-placeholder iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.yt-placeholder.playing img,
.yt-placeholder.playing .yt-placeholder-play {
  display: none;
}
`;

class YouTubeUrlTransformer {
  constructor() {
    this.processed = new WeakSet();
    this.stylesInjected = false;
    this.init();
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url) {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Inject CSS styles once
   */
  injectStyles() {
    if (this.stylesInjected) return;
    if (document.getElementById('yt-url-transformer-styles')) return;

    const style = document.createElement('style');
    style.id = 'yt-url-transformer-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
    this.stylesInjected = true;
  }

  /**
   * Create placeholder element
   */
  createPlaceholder(videoId) {
    const container = document.createElement('div');
    container.className = 'yt-placeholder';
    container.dataset.videoId = videoId;

    // Thumbnail (lazy loaded)
    const img = document.createElement('img');
    img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    img.alt = 'Video thumbnail';
    img.loading = 'lazy';

    // Play button
    const playBtn = document.createElement('button');
    playBtn.className = 'yt-placeholder-play';
    playBtn.setAttribute('aria-label', 'Play video');

    container.appendChild(img);
    container.appendChild(playBtn);

    // Click to play
    container.addEventListener('click', () => this.playVideo(container, videoId));

    return container;
  }

  /**
   * Replace placeholder with iframe
   */
  playVideo(container, videoId) {
    if (container.classList.contains('playing')) return;

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.dataset.ytOptIn = 'true';

    container.appendChild(iframe);
    container.classList.add('playing');
  }

  /**
   * Check if URL is a YouTube URL
   */
  isYouTubeUrl(url) {
    if (!url) return false;
    return /(?:youtube\.com|youtu\.be)/.test(url);
  }

  /**
   * Transform a link element into placeholder
   */
  transformLink(link) {
    if (this.processed.has(link)) return;
    if (!this.isYouTubeUrl(link.href)) return;

    const videoId = this.extractVideoId(link.href);
    if (!videoId) return;

    const placeholder = this.createPlaceholder(videoId);
    link.replaceWith(placeholder);
    this.processed.add(placeholder);
  }

  /**
   * Transform plain text YouTube URLs in an element
   */
  transformTextUrls(element) {
    if (this.processed.has(element)) return;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const urlPattern = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    const nodesToReplace = [];

    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent;
      if (urlPattern.test(text)) {
        nodesToReplace.push(node);
      }
      urlPattern.lastIndex = 0; // Reset regex
    }

    nodesToReplace.forEach(textNode => {
      const text = textNode.textContent;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      urlPattern.lastIndex = 0;
      while ((match = urlPattern.exec(text)) !== null) {
        // Text before URL
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        // Replace URL with placeholder
        const videoId = match[1];
        const placeholder = this.createPlaceholder(videoId);
        fragment.appendChild(placeholder);

        lastIndex = match.index + match[0].length;
      }

      // Text after last URL
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    this.processed.add(element);
  }

  /**
   * Scan and transform all YouTube URLs in a root element
   */
  transform(root = document.body) {
    if (!root) return;

    // Transform linked URLs
    const links = root.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]');
    links.forEach(link => this.transformLink(link));

    // Transform plain text URLs in product descriptions
    const descriptions = root.querySelectorAll(
      '.product-description, .s-product-description, [class*="description"], .widget-content'
    );
    descriptions.forEach(desc => this.transformTextUrls(desc));
  }

  /**
   * Setup MutationObserver for dynamic content
   */
  setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.querySelector?.('a[href*="youtube"], a[href*="youtu.be"]') ||
                node.matches?.('[class*="description"]')) {
              shouldScan = true;
              break;
            }
          }
        }
        if (shouldScan) break;
      }

      if (shouldScan) {
        requestAnimationFrame(() => this.transform());
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Setup Salla event listeners
   */
  setupEventListeners() {
    // Salla SPA navigation
    document.addEventListener('salla::page::changed', () => {
      setTimeout(() => this.transform(), 100);
    });

    // Theme ready
    document.addEventListener('theme::ready', () => {
      this.transform();
    });

    // Salla events
    if (window.salla?.event) {
      window.salla.event.on('product::loaded', () => this.transform());
      window.salla.event.on('products::loaded', () => this.transform());
    }
  }

  /**
   * Initialize transformer
   */
  init() {
    // Skip on cart page
    if (window.location.pathname.includes('/cart')) return;

    this.injectStyles();

    // Initial transform
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.transform());
    } else {
      this.transform();
    }

    // Window load (catch late content)
    window.addEventListener('load', () => this.transform());

    // Dynamic content
    this.setupObserver();
    this.setupEventListeners();

    console.log('[Algolia Bundle] YouTube URL transformer initialized');
  }
}

// Auto-initialize
const youtubeUrlTransformer = new YouTubeUrlTransformer();

export { youtubeUrlTransformer, YouTubeUrlTransformer };
