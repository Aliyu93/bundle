/**
 * Video Gallery Component
 * Displays Cloudflare Stream videos in a Swiper slider
 * - Autoplay muted when visible (IntersectionObserver)
 * - Play/pause, mute/unmute controls
 * - Expand to fslightbox fullscreen
 * - Vertical/portrait aspect ratio (9:16)
 */

class VideoGalleryComponent extends HTMLElement {
    constructor() {
        super();
        // Video + Product mapping
        this.videos = [
            { videoId: '5c674d0e8f966c603fc6d0045b713869', productId: 258399638 },
            { videoId: '0012cc79a7fd459c9389670ba37c6b1b', productId: 823750915 },
            { videoId: '939af62bb2f7e551b14c237b02cd6493', productId: 275656778 },
            { videoId: '498113e070bbef6e76ad35058dc92071', productId: 854730525 },
            { videoId: 'ad277fe9aae194be61f6b1b5ea5945ad', productId: 890636222 },
        ];
        this.swiper = null;
        this.observer = null;
        this.activeVideoIndex = -1;
        this.productDataMap = new Map();
    }

    async connectedCallback() {
        this.injectStyles();
        this.render();
        this.initSwiper();
        this.setupIntersectionObserver();
        this.setupEventListeners();

        // Fetch product data and render info cards
        await this.fetchProductData();
        this.renderProductInfoCards();

        this.refreshLightbox();
    }

    disconnectedCallback() {
        this.observer?.disconnect();
        this.swiper?.destroy();
    }

    getEmbedUrl(videoId, withControls = false) {
        const params = new URLSearchParams({
            autoplay: 'true',
            muted: 'true',
            loop: 'true',
            controls: withControls ? 'true' : 'false',
            preload: 'metadata'
        });
        return `https://iframe.videodelivery.net/${videoId}?${params.toString()}`;
    }

    getLightboxUrl(videoId) {
        return `https://iframe.videodelivery.net/${videoId}?autoplay=true&controls=true`;
    }

    injectStyles() {
        if (document.getElementById('mahaba-video-gallery-styles')) return;

        const style = document.createElement('style');
        style.id = 'mahaba-video-gallery-styles';
        style.textContent = `
            mahaba-video-gallery {
                display: block;
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 1rem;
            }

            .video-gallery-section {
                margin-bottom: 2rem;
            }

            .video-gallery-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid rgba(212, 172, 132, 0.1);
            }

            .video-gallery-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #d4ac84;
                margin: 0;
            }

            .videos-gallery-container {
                position: relative;
            }

            .video-gallery-swiper {
                overflow: hidden;
            }

            .video-gallery-swiper .swiper-wrapper {
                display: flex;
            }

            .video-gallery-swiper .swiper-slide {
                flex-shrink: 0;
                height: auto;
            }

            .video-item {
                position: relative;
                border-radius: 12px;
                overflow: hidden;
                background: #000;
            }

            .video-wrapper {
                position: relative;
                width: 100%;
                padding-bottom: 177.78%; /* 9:16 aspect ratio */
            }

            .video-wrapper iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                pointer-events: none;
            }

            .video-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                background: rgba(0, 0, 0, 0.2);
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
            }

            .video-item:hover .video-overlay,
            .video-overlay.show {
                opacity: 1;
            }

            .video-overlay .play-button,
            .video-overlay .expand-button {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.2s ease, background 0.2s ease;
            }

            .video-overlay .play-button:hover,
            .video-overlay .expand-button:hover {
                transform: scale(1.1);
                background: #fff;
            }

            .video-overlay .play-button i,
            .video-overlay .expand-button i {
                font-size: 1.25rem;
                color: #333;
            }

            .video-controls {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 0.75rem;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
                display: flex;
                justify-content: flex-start;
                gap: 0.5rem;
                z-index: 10;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .video-item:hover .video-controls,
            .video-controls.show {
                opacity: 1;
            }

            .video-controls .control-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.2s ease;
            }

            .video-controls .control-btn:hover {
                background: rgba(255, 255, 255, 0.4);
            }

            .video-controls .control-btn i {
                font-size: 1rem;
                color: #fff;
            }

            .video-controls .control-btn.playing .sicon-play {
                display: none;
            }

            .video-controls .control-btn.playing .sicon-pause {
                display: inline;
            }

            .video-controls .control-btn:not(.playing) .sicon-play {
                display: inline;
            }

            .video-controls .control-btn:not(.playing) .sicon-pause {
                display: none;
            }

            .video-controls .mute-btn.muted .sicon-volume-high {
                display: none;
            }

            .video-controls .mute-btn.muted .sicon-volume-mute {
                display: inline;
            }

            .video-controls .mute-btn:not(.muted) .sicon-volume-high {
                display: inline;
            }

            .video-controls .mute-btn:not(.muted) .sicon-volume-mute {
                display: none;
            }

            .video-gallery-swiper .swiper-pagination {
                position: relative;
                margin-top: 1rem;
                display: flex;
                justify-content: center;
                gap: 0.5rem;
            }

            .video-gallery-swiper .swiper-pagination-bullet {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(212, 172, 132, 0.3);
                cursor: pointer;
                transition: background 0.2s ease, transform 0.2s ease;
            }

            .video-gallery-swiper .swiper-pagination-bullet-active {
                background: #d4ac84;
                transform: scale(1.2);
            }

            /* Responsive */
            @media (max-width: 767px) {
                .video-overlay .play-button,
                .video-overlay .expand-button {
                    width: 40px;
                    height: 40px;
                }

                .video-overlay .play-button i,
                .video-overlay .expand-button i {
                    font-size: 1rem;
                }

                .video-controls .control-btn {
                    width: 32px;
                    height: 32px;
                }

                .video-controls .control-btn i {
                    font-size: 0.875rem;
                }
            }

            /* Product Info Card */
            .video-product-info {
                padding: 0.5rem;
                background: #fafafa;
                text-align: center;
                border-radius: 0 0 12px 12px;
            }

            .video-product-info:empty {
                display: none;
            }

            .video-product-info .product-name {
                font-size: 0.75rem;
                font-weight: 500;
                color: #333;
                margin: 0 0 0.25rem;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                line-height: 1.3;
            }

            .video-product-info .product-price-wrap {
                font-size: 0.7rem;
                margin-bottom: 0.4rem;
            }

            .video-product-info .product-sale-price {
                color: #d4ac84;
                font-weight: 600;
            }

            .video-product-info .product-regular-price {
                color: #999;
                text-decoration: line-through;
                margin-right: 0.25rem;
            }

            .video-product-info .product-price {
                color: #d4ac84;
                font-weight: 600;
            }

            .video-product-info .product-link-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.2rem;
                padding: 0.3rem 0.6rem;
                background: #d4ac84;
                color: #fff;
                border-radius: 4px;
                font-size: 0.65rem;
                text-decoration: none;
                transition: background 0.2s ease;
            }

            .video-product-info .product-link-btn:hover {
                background: #c49b73;
            }

            .video-product-info .product-link-btn i {
                font-size: 0.55rem;
            }

            .video-product-info .product-info-loading {
                font-size: 0.65rem;
                color: #999;
                padding: 0.25rem;
            }
        `;

        document.head.appendChild(style);
    }

    render() {
        const slidesHtml = this.videos.map((video, index) => `
            <div class="swiper-slide">
                <div class="video-item" data-video-id="${video.videoId}" data-product-id="${video.productId || ''}" data-video-index="${index}">
                    <div class="video-wrapper">
                        <iframe
                            src="${this.getEmbedUrl(video.videoId)}"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            loading="lazy"
                        ></iframe>
                        <a
                            data-fslightbox="video-gallery"
                            data-type="video"
                            href="${this.getLightboxUrl(video.videoId)}"
                            class="video-lightbox-trigger"
                            style="display: none;"
                        ></a>
                    </div>
                    <div class="video-overlay">
                        <div class="play-button" data-action="play" role="button" tabindex="0" aria-label="تشغيل الفيديو">
                            <i class="sicon-play" aria-hidden="true"></i>
                        </div>
                        <div class="expand-button" data-action="expand" role="button" tabindex="0" aria-label="توسيع الفيديو">
                            <i class="sicon-expand" aria-hidden="true"></i>
                        </div>
                    </div>
                    <div class="video-controls">
                        <button class="control-btn pause-btn playing muted" data-action="toggle-play" aria-label="إيقاف/تشغيل">
                            <i class="sicon-play" aria-hidden="true"></i>
                            <i class="sicon-pause" aria-hidden="true"></i>
                        </button>
                        <button class="control-btn mute-btn muted" data-action="toggle-mute" aria-label="كتم/إلغاء كتم الصوت">
                            <i class="sicon-volume-high" aria-hidden="true"></i>
                            <i class="sicon-volume-mute" aria-hidden="true"></i>
                        </button>
                    </div>
                    <!-- Product Info Card -->
                    <div class="video-product-info" data-product-id="${video.productId || ''}">
                        <div class="product-info-loading">جارِ التحميل...</div>
                    </div>
                </div>
            </div>
        `).join('');

        this.innerHTML = `
            <section class="video-gallery-section">
                <div class="video-gallery-header">
                    <h2 class="video-gallery-title">فيديوهات</h2>
                </div>
                <div class="videos-gallery-container" data-view-type="slider" data-aspect-ratio="vertical">
                    <div class="swiper video-gallery-swiper" dir="rtl">
                        <div class="swiper-wrapper">
                            ${slidesHtml}
                        </div>
                        <div class="swiper-pagination"></div>
                    </div>
                </div>
            </section>
        `;
    }

    initSwiper() {
        const swiperEl = this.querySelector('.video-gallery-swiper');
        if (!swiperEl || typeof Swiper === 'undefined') {
            console.warn('[VideoGallery] Swiper not available');
            return;
        }

        this.swiper = new Swiper(swiperEl, {
            direction: 'horizontal',
            slidesPerView: 2.5,
            spaceBetween: 8,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            breakpoints: {
                340: { slidesPerView: 2.5, spaceBetween: 8 },
                768: { slidesPerView: 3.5, spaceBetween: 10 },
                1024: { slidesPerView: 5, spaceBetween: 10 }
            }
        });
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const videoItem = entry.target;
                const iframe = videoItem.querySelector('iframe');

                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    // Video is visible - ensure autoplay
                    this.setVideoPlaying(iframe, true);
                    videoItem.querySelector('.pause-btn')?.classList.add('playing');
                } else {
                    // Video is not visible - pause
                    this.setVideoPlaying(iframe, false);
                    videoItem.querySelector('.pause-btn')?.classList.remove('playing');
                }
            });
        }, {
            threshold: [0, 0.5, 1],
            rootMargin: '0px'
        });

        this.querySelectorAll('.video-item').forEach(item => {
            this.observer.observe(item);
        });
    }

    setVideoPlaying(iframe, playing) {
        if (!iframe) return;

        const currentSrc = iframe.src;
        const url = new URL(currentSrc);

        // Cloudflare Stream uses postMessage API for control
        // For iframe, we modify the autoplay param
        if (playing) {
            url.searchParams.set('autoplay', 'true');
        } else {
            url.searchParams.set('autoplay', 'false');
        }

        // Only update if different to avoid reload flicker
        if (iframe.src !== url.toString()) {
            iframe.src = url.toString();
        }
    }

    setVideoMuted(iframe, muted) {
        if (!iframe) return;

        const currentSrc = iframe.src;
        const url = new URL(currentSrc);
        url.searchParams.set('muted', muted ? 'true' : 'false');

        if (iframe.src !== url.toString()) {
            iframe.src = url.toString();
        }
    }

    setupEventListeners() {
        // Event delegation for controls
        this.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const videoItem = target.closest('.video-item');
            const iframe = videoItem?.querySelector('iframe');

            switch (action) {
                case 'play':
                    this.handlePlay(videoItem, iframe);
                    break;
                case 'expand':
                    this.handleExpand(videoItem);
                    break;
                case 'toggle-play':
                    this.handleTogglePlay(target, iframe);
                    break;
                case 'toggle-mute':
                    this.handleToggleMute(target, iframe);
                    break;
            }
        });

        // Keyboard support
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target.closest('[data-action]');
                if (target) {
                    e.preventDefault();
                    target.click();
                }
            }
        });
    }

    handlePlay(videoItem, iframe) {
        const pauseBtn = videoItem?.querySelector('.pause-btn');
        const isPlaying = pauseBtn?.classList.contains('playing');

        if (isPlaying) {
            this.setVideoPlaying(iframe, false);
            pauseBtn?.classList.remove('playing');
        } else {
            this.setVideoPlaying(iframe, true);
            pauseBtn?.classList.add('playing');
        }
    }

    handleExpand(videoItem) {
        const lightboxTrigger = videoItem?.querySelector('.video-lightbox-trigger');
        if (lightboxTrigger) {
            lightboxTrigger.click();
        }
    }

    handleTogglePlay(button, iframe) {
        const isPlaying = button.classList.contains('playing');

        if (isPlaying) {
            this.setVideoPlaying(iframe, false);
            button.classList.remove('playing');
        } else {
            this.setVideoPlaying(iframe, true);
            button.classList.add('playing');
        }
    }

    handleToggleMute(button, iframe) {
        const isMuted = button.classList.contains('muted');

        if (isMuted) {
            this.setVideoMuted(iframe, false);
            button.classList.remove('muted');
        } else {
            this.setVideoMuted(iframe, true);
            button.classList.add('muted');
        }
    }

    refreshLightbox() {
        // Refresh fslightbox after render
        if (typeof refreshFsLightbox === 'function') {
            setTimeout(() => {
                refreshFsLightbox();
            }, 100);
        }
    }

    async fetchProductData() {
        const productIds = this.videos
            .map(v => v.productId)
            .filter(id => id); // Filter out null/undefined

        if (productIds.length === 0) return;

        // Create hidden salla-products-list to fetch product data
        const productsList = document.createElement('salla-products-list');
        productsList.setAttribute('source', 'selected');
        productsList.setAttribute('source-value', JSON.stringify(productIds));
        productsList.style.cssText = 'position:absolute;left:-9999px;visibility:hidden;pointer-events:none;';
        this.appendChild(productsList);

        // Wait for Salla to fetch and render products
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                this.extractProductData(productsList);
                resolve();
            }, 5000);

            const handler = () => {
                clearTimeout(timeoutId);
                // Small delay to ensure DOM is updated
                setTimeout(() => {
                    this.extractProductData(productsList);
                    resolve();
                }, 200);
            };

            window.salla?.event?.on('salla-products-list::products.fetched', handler);
        });
    }

    extractProductData(productsList) {
        const cards = productsList.querySelectorAll('[product]');
        cards.forEach(card => {
            try {
                const productJson = card.getAttribute('product');
                if (productJson) {
                    const product = JSON.parse(productJson);
                    this.productDataMap.set(String(product.id), product);
                }
            } catch (e) {
                console.warn('[VideoGallery] Failed to parse product:', e);
            }
        });
        // Clean up hidden list
        productsList.remove();
    }

    renderProductInfoCards() {
        this.videos.forEach((video) => {
            if (!video.productId) return;

            const infoCard = this.querySelector(
                `.video-product-info[data-product-id="${video.productId}"]`
            );
            if (!infoCard) return;

            const product = this.productDataMap.get(String(video.productId));

            if (!product) {
                infoCard.innerHTML = ''; // Hide if no product data
                return;
            }

            const priceHtml = product.is_on_sale
                ? `<span class="product-sale-price">${salla.money(product.sale_price)}</span>
                   <span class="product-regular-price">${salla.money(product.regular_price)}</span>`
                : `<span class="product-price">${salla.money(product.price)}</span>`;

            infoCard.innerHTML = `
                <h4 class="product-name">${product.name}</h4>
                <div class="product-price-wrap">${priceHtml}</div>
                <a href="${product.url}" class="product-link-btn">
                    عرض المنتج
                    <i class="sicon-keyboard_arrow_left"></i>
                </a>
            `;
        });
    }
}

if (!customElements.get('mahaba-video-gallery')) {
    customElements.define('mahaba-video-gallery', VideoGalleryComponent);
}

export default VideoGalleryComponent;
