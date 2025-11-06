/**
 * YouTube Opt-In Module
 * Prevents YouTube from loading until user explicitly clicks
 * Zero network requests to YouTube/ytimg until interaction
 */

const LOG_PREFIX = '[YouTube Opt-In]';
const debug = (...args) => console.log(LOG_PREFIX, ...args);

const YOUTUBE_REGEX = /\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i;

let youtubeStylesInjected = false;

function injectYoutubePlaceholderStyles() {
  if (youtubeStylesInjected || typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.id = 'youtube-placeholder-styles';
  style.textContent = `
    .yt-placeholder {
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 16 / 9;
      margin: 1rem 0;
      border-radius: 0.5rem;
      overflow: hidden;
      border: none;
      padding: 0;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      transition: background 0.35s ease;
    }
    .yt-placeholder__thumb {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease, filter 0.3s ease;
      z-index: 0;
    }
    .yt-placeholder__overlay {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      border-radius: 9999px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-weight: 600;
      letter-spacing: 0.01em;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(8px);
    }
    .yt-placeholder__icon {
      position: relative;
      width: 3rem;
      height: 3rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }
    .yt-placeholder__icon::before {
      content: '';
      display: inline-block;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0.55rem 0 0.55rem 0.95rem;
      border-color: transparent transparent transparent #1f1f1f;
      margin-left: 0.2rem;
    }
    .yt-placeholder__label {
      font-size: 1rem;
      line-height: 1.4;
      white-space: nowrap;
    }
    .yt-placeholder:hover {
      background: linear-gradient(135deg, #c62828 0%, #e53935 100%);
    }
    .yt-placeholder:hover .yt-placeholder__thumb {
      transform: scale(1.03);
      filter: brightness(0.75);
    }
    .yt-placeholder:hover .yt-placeholder__overlay {
      background: rgba(0, 0, 0, 0.7);
    }
    .yt-placeholder:focus-visible {
      outline: 3px solid #c62828;
      outline-offset: 3px;
    }
    .yt-placeholder:focus-visible .yt-placeholder__overlay {
      background: rgba(0, 0, 0, 0.75);
    }
    @media (max-width: 640px) {
      .yt-placeholder__overlay {
        padding: 0.6rem 1rem;
        gap: 0.6rem;
      }
      .yt-placeholder__icon {
        width: 2.5rem;
        height: 2.5rem;
      }
      .yt-placeholder__icon::before {
        border-width: 0.45rem 0 0.45rem 0.75rem;
      }
      .yt-placeholder__label {
        font-size: 0.9rem;
      }
    }
  `;

  document.head.appendChild(style);
  youtubeStylesInjected = true;
}

function normalizeYoutubeUrl(url) {
  if (!url) return '';
  const videoId = extractVideoId(url);
  if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  return url.split('?')[0];
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
  if (!url) return null;

  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/,
    /youtube-nocookie\.com\/embed\/([^?&/]+)/,
    /youtube\.com\/v\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&/]+)/,
    /youtube\.com\/shorts\/([^?&/]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }

  return null;
}

/**
 * Create placeholder button element
 */
function createPlaceholderButton(videoUrl, options = {}) {
  injectYoutubePlaceholderStyles();

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'yt-placeholder';
  button.setAttribute('data-yt-src', videoUrl);
  button.setAttribute('aria-label', 'Play YouTube video');
  const videoId = options.videoId || extractVideoId(videoUrl);
  const customThumbnail = options.thumbnailUrl;
  const thumbnailUrl = customThumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null);

  if (thumbnailUrl) {
    const img = document.createElement('img');
    img.className = 'yt-placeholder__thumb';
    img.alt = options.thumbnailAlt || 'Video thumbnail';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.setAttribute('data-src', thumbnailUrl);
    button.dataset.ytThumbSrc = thumbnailUrl;
    button.appendChild(img);
  }

  const overlay = document.createElement('span');
  overlay.className = 'yt-placeholder__overlay';

  const icon = document.createElement('span');
  icon.className = 'yt-placeholder__icon';
  icon.setAttribute('aria-hidden', 'true');
  overlay.appendChild(icon);

  const label = document.createElement('span');
  label.className = 'yt-placeholder__label';
  label.textContent = 'مشاهدة فيديو المنتج';
  overlay.appendChild(label);

  button.appendChild(overlay);

  return button;
}

let thumbnailObserver = null;

function neutralizeInitialYoutubeEmbeds(root = document) {
  if (!root) return;

  const candidates = [
    ...root.querySelectorAll('iframe'),
    ...root.querySelectorAll('embed'),
    ...root.querySelectorAll('object')
  ];

  candidates.forEach(node => {
    const rawSrc = node.src || node.getAttribute('src') || node.data || node.getAttribute('data');
    if (!rawSrc || !YOUTUBE_REGEX.test(rawSrc)) return;

    // Cancel any in-flight load immediately
    if ('srcdoc' in node) node.removeAttribute('srcdoc');
    if ('src' in node) {
      try { node.src = 'about:blank'; } catch (err) {}
      node.removeAttribute('src');
    }
    if ('data' in node) node.removeAttribute('data');

    const placeholder = createPlaceholderButton(normalizeYoutubeUrl(rawSrc));

    if (node.width) placeholder.style.width = node.width;
    if (node.height) placeholder.style.height = node.height;
    if (node.style && node.style.width) placeholder.style.width = node.style.width;
    if (node.style && node.style.height) placeholder.style.height = node.style.height;

    placeholder.addEventListener('click', handlePlaceholderClick);
    placeholder.setAttribute('data-click-bound', 'true');
    initPlaceholderThumbnail(placeholder);

    if (node.parentNode) {
      node.parentNode.replaceChild(placeholder, node);
    }
  });
}

function loadThumbnail(button) {
  const img = button.querySelector('.yt-placeholder__thumb');
  if (!img) return;

  const src = img.dataset.src;
  if (src) {
    img.src = src;
    img.removeAttribute('data-src');
    button.dataset.thumbLoaded = 'true';
  }
}

function ensureThumbnailObserver() {
  if (thumbnailObserver || typeof IntersectionObserver === 'undefined') return;

  thumbnailObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadThumbnail(entry.target);
        thumbnailObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px 0px' });
}

function initPlaceholderThumbnail(button) {
  const img = button.querySelector('.yt-placeholder__thumb');
  if (!img) return;

  if (button.dataset.thumbLoaded === 'true') return;

  if (!img.dataset.src) {
    button.dataset.thumbLoaded = 'true';
    return;
  }

  if (typeof IntersectionObserver === 'undefined') {
    loadThumbnail(button);
    return;
  }

  ensureThumbnailObserver();
  thumbnailObserver.observe(button);
}

/**
 * Sanitize a DOM fragment by replacing YouTube embeds with placeholders
 */
function sanitizeFragment(fragment) {
  if (!fragment) return;
  debug('Sanitizing fragment', fragment);

  // Find all potential YouTube embed elements
  const iframes = fragment.querySelectorAll('iframe');
  const embeds = fragment.querySelectorAll('embed');
  const objects = fragment.querySelectorAll('object');

  const elements = [...iframes, ...embeds, ...objects];

  elements.forEach(element => {
    const src = element.src || element.data || element.getAttribute('src') || element.getAttribute('data');

    if (src && YOUTUBE_REGEX.test(src)) {
      // Extract and normalize the URL
      const videoId = extractVideoId(src);
      const videoUrl = normalizeYoutubeUrl(src);
      const customThumbnail = element.getAttribute('data-yt-thumb') || element.dataset?.ytThumb;

      // Create placeholder and replace element
      debug('Replacing YouTube embed with placeholder', { videoUrl, element });
      const placeholder = createPlaceholderButton(videoUrl, { videoId, thumbnailUrl: customThumbnail });

      // Preserve dimensions if available
      if (element.width) placeholder.style.width = element.width;
      if (element.height) placeholder.style.height = element.height;
      if (element.style.width) placeholder.style.width = element.style.width;
      if (element.style.height) placeholder.style.height = element.style.height;

      element.parentNode.replaceChild(placeholder, element);
    }
  });
}

/**
 * Sanitize HTML string by parsing and processing DOM
 */
function sanitizeHtmlString(html) {
  if (!html || typeof html !== 'string') return html;
  debug('Sanitizing HTML string');

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  sanitizeFragment(doc.body);

  return doc.body.innerHTML;
}

/**
 * Create and insert iframe when placeholder is clicked
 */
function handlePlaceholderClick(event) {
  const button = event.currentTarget;
  const storedUrl = button.getAttribute('data-yt-src');
  const baseUrl = normalizeYoutubeUrl(storedUrl);

  if (!baseUrl) return;
  debug('Placeholder clicked, loading iframe', { videoUrl: baseUrl });

  // Create iframe
  const iframe = document.createElement('iframe');
  const autoplayUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0`;
  iframe.src = autoplayUrl;
  iframe.width = button.style.width || '100%';
  iframe.height = button.style.height || '100%';
  iframe.title = 'YouTube video';
  iframe.frameBorder = '0';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.style.aspectRatio = '16/9';
  iframe.dataset.ytOptIn = 'true';

  // Replace placeholder with iframe
  button.parentNode.replaceChild(iframe, button);

  // Focus iframe for accessibility
  iframe.focus();
}

/**
 * Initialize placeholders in the given root element
 */
function initYouTubeOptIn(root = document) {
  debug('Initializing YouTube opt-in on root', root === document ? 'document' : root);
  neutralizeInitialYoutubeEmbeds(root);
  // Process template-based content
  const templateHosts = root.querySelectorAll('[data-yt-template]');

  templateHosts.forEach(host => {
    // Skip if already processed
    if (host.hasAttribute('data-yt-processed')) return;
    host.setAttribute('data-yt-processed', 'true');
    debug('Processing template host', host);

    const templateId = host.getAttribute('data-yt-template');
    const template = document.getElementById(templateId);

    if (!template) return;
    debug('Found template for host', templateId);

    // Clone template content
    const fragment = template.content.cloneNode(true);

    // Sanitize fragment (replace YouTube iframes with placeholders)
    sanitizeFragment(fragment);

    // Insert sanitized content into host
    host.appendChild(fragment);
  });

  // Process standalone placeholders (like home youtube component)
  const standalonePlaceholders = root.querySelectorAll('.yt-placeholder[data-yt-src]');

  standalonePlaceholders.forEach(placeholder => {
    // Skip if already has content
    if (placeholder.querySelector('.yt-placeholder__icon')) return;

    // Add icon if it's a plain div
    if (placeholder.tagName === 'DIV') {
      debug('Upgrading static placeholder div to button', placeholder);
      const videoUrl = placeholder.getAttribute('data-yt-src');
      const customThumbnail = placeholder.getAttribute('data-yt-thumb') || placeholder.dataset?.ytThumb;
      const button = createPlaceholderButton(videoUrl, { thumbnailUrl: customThumbnail });
      button.className = placeholder.className;

      Array.from(placeholder.attributes).forEach(attr => {
        if (['class', 'data-yt-src', 'data-yt-thumb'].includes(attr.name)) return;
        button.setAttribute(attr.name, attr.value);
      });

      if (customThumbnail) {
        button.setAttribute('data-yt-thumb', customThumbnail);
      }

      placeholder.parentNode.replaceChild(button, placeholder);
    }
  });

  // Attach click handlers to all placeholder buttons
  const allPlaceholders = root.querySelectorAll('button.yt-placeholder[data-yt-src]');

  allPlaceholders.forEach(placeholder => {
    if (!placeholder.hasAttribute('data-click-bound')) {
      placeholder.addEventListener('click', handlePlaceholderClick);
      placeholder.setAttribute('data-click-bound', 'true');
      debug('Bound click handler to placeholder', placeholder);
    }
    initPlaceholderThumbnail(placeholder);
  });
}

/**
 * Setup handlers for dynamically loaded content
 */
function setupDynamicHandlers() {
  debug('Setting up dynamic handlers');
  // Handle product slider fetches
  if (window.salla && window.salla.event) {
    window.salla.event.on('salla-products-slider::products.fetched', (payload) => {
      debug('Event: salla-products-slider::products.fetched', payload);
      const targetRoot = payload?.container || document;
      neutralizeInitialYoutubeEmbeds(targetRoot);
      initYouTubeOptIn(targetRoot);
    });

    // Handle quick view
    window.salla.event.on('product::quickview.opened', (payload) => {
      debug('Event: product::quickview.opened', payload);
      neutralizeInitialYoutubeEmbeds(document);
      initYouTubeOptIn(document);
    });

    // Handle quick view response if it exists
    window.salla.event.on('product::quickview.response', (payload) => {
      debug('Event: product::quickview.response', payload);
      // If payload contains HTML, sanitize it before Salla renders
      if (payload && payload.response && payload.response.html) {
        debug('Sanitizing quickview HTML response before render');
        payload.response.html = sanitizeHtmlString(payload.response.html);
      }

      neutralizeInitialYoutubeEmbeds(document);
      initYouTubeOptIn(document);
    });
  }

  // Handle read more button
  const readMoreBtn = document.getElementById('btn-show-more');
  if (readMoreBtn) {
    readMoreBtn.addEventListener('click', () => {
      debug('Read more button clicked');
      const moreContent = document.getElementById('more-content');
      if (moreContent) {
        neutralizeInitialYoutubeEmbeds(moreContent);
        initYouTubeOptIn(moreContent);
      }
    });
  }

  // Emergency mutation observer for stray iframes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      debug('Mutation observed', mutation);
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;

        // Check if added node is a product description container
        if (node.classList && node.classList.contains('product-description-content')) {
          debug('New product-description-content detected, initializing', node);
          initYouTubeOptIn(node);
        }

        // Emergency: catch any stray YouTube iframes
        const strayIframes = [];
        if (node.tagName === 'IFRAME') {
          strayIframes.push(node);
        } else if (node.querySelectorAll) {
          strayIframes.push(...node.querySelectorAll('iframe'));
        }

        strayIframes.forEach(iframe => {
          if (iframe.dataset && iframe.dataset.ytOptIn === 'true') {
            debug('Observed opt-in iframe, skipping neutralization', iframe);
            return;
          }

          const src = iframe.src || iframe.getAttribute('src');
          if (src && YOUTUBE_REGEX.test(src)) {
            // Stop loading immediately - remove attributes
            debug('Stray iframe detected, neutralizing', iframe);
            iframe.removeAttribute('src');
            iframe.removeAttribute('srcdoc');
            iframe.src = 'about:blank';

            // Extract URL and create placeholder
            const videoUrl = normalizeYoutubeUrl(src);
            const placeholder = createPlaceholderButton(videoUrl);
            placeholder.addEventListener('click', handlePlaceholderClick);
            placeholder.setAttribute('data-click-bound', 'true');

            // Replace iframe
            debug('Replacing stray iframe with placeholder', { videoUrl, iframe });
            iframe.parentNode.replaceChild(placeholder, iframe);
            initPlaceholderThumbnail(placeholder);
          }
        });
      });
    });
  });

  // Observe product description containers
  const containers = document.querySelectorAll('.product-description-content');
  containers.forEach(container => {
    observer.observe(container, { childList: true, subtree: true });
  });

  // Also observe document body for dynamic content
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Scan and replace existing YouTube iframes on page load
 */
function scanAndReplaceExistingIframes() {
  debug('Scanning for existing YouTube iframes');

  // Find all iframes in the document
  const allIframes = document.querySelectorAll('iframe');
  let replacedCount = 0;

  allIframes.forEach(iframe => {
    const src = iframe.src || iframe.getAttribute('src');

    // Check if it's a YouTube iframe
    if (src && YOUTUBE_REGEX.test(src)) {
      // Don't process if already processed
      if (iframe.dataset.ytOptIn === 'true' || iframe.hasAttribute('data-yt-processed')) {
        return;
      }

      debug('Found existing YouTube iframe, replacing', { src, iframe });

      // Stop iframe from loading
      iframe.src = 'about:blank';

      // Extract URL and create placeholder
      const videoUrl = normalizeYoutubeUrl(src);
      const placeholder = createPlaceholderButton(videoUrl);

      // Preserve dimensions
      if (iframe.width) placeholder.style.width = iframe.width;
      if (iframe.height) placeholder.style.height = iframe.height;
      if (iframe.style.width) placeholder.style.width = iframe.style.width;
      if (iframe.style.height) placeholder.style.height = iframe.style.height;

      // Bind click handler
      placeholder.addEventListener('click', handlePlaceholderClick);
      placeholder.setAttribute('data-click-bound', 'true');

      // Replace iframe with placeholder
      iframe.parentNode.replaceChild(placeholder, iframe);
      initPlaceholderThumbnail(placeholder);
      replacedCount++;
    }
  });

  debug(`Replaced ${replacedCount} existing YouTube iframes`);
}

/**
 * Initialize on page load
 */
function init() {
  debug('Initializing module');
  neutralizeInitialYoutubeEmbeds(document);
  injectYoutubePlaceholderStyles();
  initYouTubeOptIn();
  scanAndReplaceExistingIframes();  // Add scan for existing iframes
  setupDynamicHandlers();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose globally for external use
window.darlenaYoutubeOptIn = initYouTubeOptIn;

// Export for module systems
export { initYouTubeOptIn, sanitizeHtmlString };
