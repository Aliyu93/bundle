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
        // Video + Product mapping with static product info
        this.videos = [
            { videoId: '5c674d0e8f966c603fc6d0045b713869', productId: 258399638, productName: 'عباية شتوية مخمل بتطريز ورد', productPrice: '349.60 ر.س' },
            { videoId: '0012cc79a7fd459c9389670ba37c6b1b', productId: 823750915, productName: 'جلابية شتوية مخمل كحلي', productPrice: '449.65 ر.س' },
            { videoId: '939af62bb2f7e551b14c237b02cd6493', productId: 275656778, productName: 'عباية كلوش مطرزة بالكامل', productPrice: '299 ر.س' },
            { videoId: '498113e070bbef6e76ad35058dc92071', productId: 854730525, productName: 'عباية مخمل مع دانتيل', productPrice: '299 ر.س' },
            { videoId: 'ad277fe9aae194be61f6b1b5ea5945ad', productId: 890636222, productName: 'عباية مخمل باكمام مطرزة', productPrice: '349.60 ر.س' },
        ];
        this.swiper = null;
        this.observer = null;
        this.activeVideoIndex = -1;
    }

    connectedCallback() {
        this.loadCloudflareSDK();
        this.injectStyles();
        this.render();
        this.initSwiper();
        this.setupIntersectionObserver();
        this.setupEventListeners();
        this.setupClickToPlay();
        this.refreshLightbox();
    }

    loadCloudflareSDK() {
        // Load Cloudflare Stream SDK for play/pause control
        if (!document.getElementById('cf-stream-sdk')) {
            const script = document.createElement('script');
            script.id = 'cf-stream-sdk';
            script.src = 'https://embed.cloudflarestream.com/embed/sdk.latest.js';
            document.head.appendChild(script);
        }
    }

    setupClickToPlay() {
        // Click anywhere on video to toggle play/pause
        this.querySelectorAll('.video-item').forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                // Don't trigger on footer click
                if (e.target.closest('.video-product-footer')) return;

                const iframe = item.querySelector('iframe');
                if (iframe && typeof Stream !== 'undefined') {
                    const player = Stream(iframe);
                    if (player.paused) {
                        player.play();
                    } else {
                        player.pause();
                    }
                }
            });
        });
    }

    disconnectedCallback() {
        this.observer?.disconnect();
        this.swiper?.destroy();
    }

    getEmbedUrl(videoId) {
        const params = new URLSearchParams({
            autoplay: 'true',
            muted: 'true',
            loop: 'true',
            controls: 'false',
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

            mahaba-video-gallery .video-gallery-section {
                margin-bottom: 2rem;
            }

            mahaba-video-gallery .video-gallery-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid rgba(212, 172, 132, 0.1);
            }

            mahaba-video-gallery .video-gallery-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #d4ac84;
                margin: 0;
            }

            mahaba-video-gallery .videos-gallery-container {
                position: relative;
            }

            mahaba-video-gallery .video-gallery-swiper {
                overflow: hidden;
            }

            mahaba-video-gallery .video-gallery-swiper .swiper-wrapper {
                display: flex;
            }

            mahaba-video-gallery .video-gallery-swiper .swiper-slide {
                flex-shrink: 0;
                height: auto;
            }

            /* Card container - holds video + product info stacked */
            mahaba-video-gallery .video-slide-card {
                display: flex;
                flex-direction: column;
                border-radius: 12px;
                overflow: hidden;
                background: #fff;
            }

            /* Video container - fixed height on mobile, aspect-ratio on tablet+ */
            mahaba-video-gallery .video-item {
                position: relative;
                background: #000;
                height: 280px;
                border-radius: 12px 12px 0 0;
                overflow: hidden;
            }

            mahaba-video-gallery .video-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;  /* Crop scaled iframe edges */
            }

            mahaba-video-gallery .video-wrapper iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                pointer-events: auto;
                transform: scale(1.15);  /* Scale up to crop black bars */
                transform-origin: center center;
            }

            /* Hide custom overlay - using Cloudflare native controls instead */
            /* SCOPED to mahaba-video-gallery only - do not affect rest of page */
            mahaba-video-gallery .video-overlay,
            mahaba-video-gallery .video-controls {
                display: none !important;
            }

            /* Overlay - positioned within video-wrapper only (HIDDEN) */
            mahaba-video-gallery .video-overlay {
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

            mahaba-video-gallery .video-item:hover .video-overlay,
            mahaba-video-gallery .video-overlay.show {
                opacity: 1;
            }

            mahaba-video-gallery .video-overlay .play-button,
            mahaba-video-gallery .video-overlay .expand-button {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.2s ease, background 0.2s ease;
            }

            mahaba-video-gallery .video-overlay .play-button:hover,
            mahaba-video-gallery .video-overlay .expand-button:hover {
                transform: scale(1.1);
                background: #fff;
            }

            mahaba-video-gallery .video-overlay .play-button i,
            mahaba-video-gallery .video-overlay .expand-button i {
                font-size: 1.1rem;
                color: #333;
            }

            /* Controls - at bottom of video only */
            mahaba-video-gallery .video-controls {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 0.5rem;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
                display: flex;
                justify-content: flex-start;
                gap: 0.5rem;
                z-index: 10;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            mahaba-video-gallery .video-item:hover .video-controls,
            mahaba-video-gallery .video-controls.show {
                opacity: 1;
            }

            mahaba-video-gallery .video-controls .control-btn {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.2s ease;
            }

            mahaba-video-gallery .video-controls .control-btn:hover {
                background: rgba(255, 255, 255, 0.4);
            }

            mahaba-video-gallery .video-controls .control-btn i {
                font-size: 0.875rem;
                color: #fff;
            }

            mahaba-video-gallery .video-controls .control-btn.playing .sicon-play {
                display: none;
            }

            mahaba-video-gallery .video-controls .control-btn.playing .sicon-pause {
                display: inline;
            }

            mahaba-video-gallery .video-controls .control-btn:not(.playing) .sicon-play {
                display: inline;
            }

            mahaba-video-gallery .video-controls .control-btn:not(.playing) .sicon-pause {
                display: none;
            }

            mahaba-video-gallery .video-controls .mute-btn.muted .sicon-volume-high {
                display: none;
            }

            mahaba-video-gallery .video-controls .mute-btn.muted .sicon-volume-mute {
                display: inline;
            }

            mahaba-video-gallery .video-controls .mute-btn:not(.muted) .sicon-volume-high {
                display: inline;
            }

            mahaba-video-gallery .video-controls .mute-btn:not(.muted) .sicon-volume-mute {
                display: none;
            }

            mahaba-video-gallery .video-gallery-swiper .swiper-pagination {
                position: relative;
                margin-top: 1rem;
                display: flex;
                justify-content: center;
                gap: 0.5rem;
            }

            mahaba-video-gallery .video-gallery-swiper .swiper-pagination-bullet {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(212, 172, 132, 0.3);
                cursor: pointer;
                transition: background 0.2s ease, transform 0.2s ease;
            }

            mahaba-video-gallery .video-gallery-swiper .swiper-pagination-bullet-active {
                background: #d4ac84;
                transform: scale(1.2);
            }

            /* Product Footer - Modern Minimal Design */
            mahaba-video-gallery .video-product-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.75rem;
                background: #ffffff;
                border-radius: 0 0 12px 12px;
                border-top: 1px solid rgba(212, 172, 132, 0.15);
                gap: 0.5rem;
                min-height: 56px;
                position: relative;
                z-index: 20;
            }

            mahaba-video-gallery .video-product-footer__content {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.125rem;
                min-width: 0;
                text-align: right;
            }

            mahaba-video-gallery .video-product-footer__title {
                font-size: 0.8125rem;
                font-weight: 600;
                color: #2d2d2d;
                line-height: 1.3;
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                transition: color 0.2s ease;
            }

            mahaba-video-gallery .video-product-footer__price {
                font-size: 0.75rem;
                font-weight: 500;
                color: #d4ac84;
                line-height: 1.2;
            }

            mahaba-video-gallery .video-product-footer__cta {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                min-width: 36px;
                background: linear-gradient(135deg, #d4ac84 0%, #c49b73 100%);
                border-radius: 8px;
                color: #ffffff;
                text-decoration: none;
                transition: all 0.25s ease;
                box-shadow: 0 2px 8px rgba(212, 172, 132, 0.25);
            }

            mahaba-video-gallery .video-product-footer__cta i {
                font-size: 0.875rem;
                transition: transform 0.2s ease;
            }

            mahaba-video-gallery .video-product-footer:hover .video-product-footer__title {
                color: #d4ac84;
            }

            mahaba-video-gallery .video-product-footer__cta:hover {
                background: linear-gradient(135deg, #c49b73 0%, #b38a62 100%);
                transform: translateX(-2px);
                box-shadow: 0 4px 12px rgba(212, 172, 132, 0.35);
            }

            mahaba-video-gallery .video-product-footer__cta:hover i {
                transform: translateX(-2px);
            }

            mahaba-video-gallery .video-product-footer__cta:active {
                transform: scale(0.95);
            }

            /* Card shadow enhancement */
            mahaba-video-gallery .video-slide-card {
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
                transition: box-shadow 0.3s ease;
            }

            mahaba-video-gallery .video-slide-card:hover {
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }

            /* Tablet and up - use aspect-ratio for proper 9:16 */
            @media (min-width: 768px) {
                mahaba-video-gallery .video-item {
                    height: auto;
                    aspect-ratio: 9 / 16;
                }
            }

            /* Responsive - smaller controls on mobile */
            @media (max-width: 767px) {
                /* Force slide width to show 2.25 videos - using viewport units */
                mahaba-video-gallery .video-gallery-swiper .swiper-slide {
                    width: calc((100vw - 32px) / 2.25) !important;
                    flex-shrink: 0 !important;
                }

                mahaba-video-gallery .video-overlay .play-button,
                mahaba-video-gallery .video-overlay .expand-button {
                    width: 36px;
                    height: 36px;
                }

                mahaba-video-gallery .video-overlay .play-button i,
                mahaba-video-gallery .video-overlay .expand-button i {
                    font-size: 0.9rem;
                }

                mahaba-video-gallery .video-controls .control-btn {
                    width: 28px;
                    height: 28px;
                }

                mahaba-video-gallery .video-controls .control-btn i {
                    font-size: 0.75rem;
                }

                mahaba-video-gallery .video-product-footer {
                    padding: 0.625rem;
                    min-height: 48px;
                }

                mahaba-video-gallery .video-product-footer__title {
                    font-size: 0.75rem;
                }

                mahaba-video-gallery .video-product-footer__price {
                    font-size: 0.6875rem;
                }

                mahaba-video-gallery .video-product-footer__cta {
                    width: 32px;
                    height: 32px;
                    min-width: 32px;
                    border-radius: 6px;
                }

                mahaba-video-gallery .video-product-footer__cta i {
                    font-size: 0.75rem;
                }
            }

            /* Small phones - even more compact */
            @media (max-width: 375px) {
                mahaba-video-gallery .video-gallery-swiper .swiper-slide {
                    width: calc((100vw - 32px) / 2.25) !important;
                }

                mahaba-video-gallery .video-item {
                    height: 250px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    render() {
        const slidesHtml = this.videos.map((video, index) => `
            <div class="swiper-slide">
                <div class="video-slide-card">
                    <div class="video-item" data-video-id="${video.videoId}" data-video-index="${index}">
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
                    </div>
                    <!-- Product Footer - Modern minimal design -->
                    ${video.productId ? `
                        <div class="video-product-footer">
                            <div class="video-product-footer__content">
                                <h4 class="video-product-footer__title">${video.productName || 'منتج'}</h4>
                                <span class="video-product-footer__price">${video.productPrice || ''}</span>
                            </div>
                            <a href="https://darlena.com/product/p${video.productId}"
                               class="video-product-footer__cta"
                               aria-label="عرض المنتج: ${video.productName || 'منتج'}">
                                <i class="sicon-arrow-left" aria-hidden="true"></i>
                            </a>
                        </div>
                    ` : ''}
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
            slidesPerView: 2.25,
            spaceBetween: 8,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            breakpoints: {
                340: { slidesPerView: 2.25, spaceBetween: 8 },
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
}

if (!customElements.get('mahaba-video-gallery')) {
    customElements.define('mahaba-video-gallery', VideoGalleryComponent);
}

export default VideoGalleryComponent;
