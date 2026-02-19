import { redisService } from '../services/redis-service.js';

const MIN_PRICE_SAR = 150;

class GomlaModalRerank {
    constructor() {
        this.lastAddedProductId = null;
        this.mutationObserver = null;
        this.sallaCartHooked = false;
        this.processTimer = null;
        this.pending = false;
        this.needsReprocess = false;
        this.gridOriginalHtml = new WeakMap();
        this.gridAppliedKey = new WeakMap();
        this.onClickCapture = this.handleGomlaProductNavigation.bind(this);
        this.onDocumentCartAdded = this.handleDocumentCartAdded.bind(this);
        this.onPageChanged = this.handlePageChanged.bind(this);
        this.onSallaReady = this.tryHookSallaCartEvent.bind(this);
        this.initialize();
    }

    initialize() {
        document.addEventListener('click', this.onClickCapture, true);
        document.addEventListener('salla::cart::item.added', this.onDocumentCartAdded);
        document.addEventListener('salla::ready', this.onSallaReady);
        document.addEventListener('theme::ready', this.onSallaReady);
        document.addEventListener('salla::page::changed', this.onPageChanged);

        this.tryHookSallaCartEvent();
        this.observeModalMutations();
        this.scheduleProcess();
    }

    observeModalMutations() {
        if (this.mutationObserver) return;
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => this.observeModalMutations(), { once: true });
            return;
        }

        this.mutationObserver = new MutationObserver(() => {
            this.scheduleProcess();
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    scheduleProcess() {
        if (this.pending) {
            this.needsReprocess = true;
            return;
        }
        this.pending = true;
        this.needsReprocess = false;

        clearTimeout(this.processTimer);
        this.processTimer = setTimeout(async () => {
            try {
                await this.processAllGomlaGrids();
                await this.processAllInlineTracks();
            } finally {
                this.pending = false;
                if (this.needsReprocess) {
                    this.needsReprocess = false;
                    this.scheduleProcess();
                }
            }
        }, 120);
    }

    async processAllGomlaGrids() {
        const grids = document.querySelectorAll('.gomla-modal .gomla__popup-grid[data-gomla-addon-bundle-id]');
        if (!grids.length) return;

        for (const grid of grids) {
            await this.processGrid(grid);
        }
    }

    async processAllInlineTracks() {
        const tracks = document.querySelectorAll('.gomla__addon-bundle-container .gomla__carousel-track');
        if (!tracks.length) return;

        const currentProductId = this.getCurrentProductId();
        if (!currentProductId) return;

        const frequentlyBoughtIds = this.normalizeAndUniqueIds(
            await redisService.getFrequentlyBought(currentProductId)
        );
        if (!frequentlyBoughtIds.length) return;

        tracks.forEach((track) => {
            this.processInlineTrack(track, currentProductId, frequentlyBoughtIds);
        });
    }

    async processGrid(grid) {
        if (!grid) return;

        this.captureOriginalGrid(grid);
        if (!this.gridOriginalHtml.has(grid)) return;

        if (!this.lastAddedProductId) {
            this.restoreOriginalGrid(grid);
            return;
        }

        const frequentlyBoughtIds = this.normalizeAndUniqueIds(
            await redisService.getFrequentlyBought(this.lastAddedProductId)
        );
        if (!frequentlyBoughtIds.length) {
            this.restoreOriginalGrid(grid);
            return;
        }

        const renderKey = `${this.lastAddedProductId}|${frequentlyBoughtIds.join(',')}`;
        if (this.gridAppliedKey.get(grid) === renderKey && this.hasSelectedList(grid)) return;

        this.renderSelectedProducts(grid, frequentlyBoughtIds);
        this.gridAppliedKey.set(grid, renderKey);
        this.applyOrderAndMinimumPrice(grid, frequentlyBoughtIds, MIN_PRICE_SAR);
    }

    captureOriginalGrid(grid) {
        if (this.gridOriginalHtml.has(grid)) return;
        const hasOriginalCards = grid.querySelector('.gomla__popup-item .gomla__product-card[data-product-id]');
        if (!hasOriginalCards) return;
        this.gridOriginalHtml.set(grid, grid.innerHTML);
    }

    restoreOriginalGrid(grid) {
        const originalHtml = this.gridOriginalHtml.get(grid);
        if (typeof originalHtml !== 'string') return;
        if (grid.innerHTML !== originalHtml) {
            grid.innerHTML = originalHtml;
            window.salla?.event?.dispatch?.('twilight::mutation');
        }
        this.gridAppliedKey.delete(grid);
    }

    renderSelectedProducts(grid, orderedIds) {
        const list = document.createElement('salla-products-list');
        list.setAttribute('source', 'selected');
        list.setAttribute('source-value', JSON.stringify(orderedIds));
        list.setAttribute('limit', String(orderedIds.length));
        list.setAttribute('loading', 'lazy');
        list.className = 's-products-list-vertical-cards';

        grid.innerHTML = '';
        grid.appendChild(list);
        window.salla?.event?.dispatch?.('twilight::mutation');
    }

    hasSelectedList(grid) {
        return !!grid.querySelector('salla-products-list[source="selected"]');
    }

    applyOrderAndMinimumPrice(grid, orderedIds, minPrice, maxAttempts = 40) {
        let attempt = 0;
        const intervalId = setInterval(() => {
            attempt += 1;

            const cards = this.getRenderedCards(grid);
            if (cards.length > 0) {
                clearInterval(intervalId);
                this.reorderRenderedCards(cards, orderedIds);
                this.filterRenderedCardsByMinimumPrice(grid, minPrice);
                return;
            }

            if (attempt >= maxAttempts) {
                clearInterval(intervalId);
            }
        }, 100);
    }

    getRenderedCards(grid) {
        const entryCards = Array.from(grid.querySelectorAll('.s-product-card-entry'));
        if (entryCards.length > 0) return entryCards;
        return Array.from(grid.querySelectorAll('custom-salla-product-card'));
    }

    reorderRenderedCards(cards, orderedIds) {
        if (!cards.length) return;
        const parent = cards[0].parentNode;
        if (!parent) return;

        const cardMap = new Map();
        cards.forEach((card) => {
            const productId = this.extractRenderedCardProductId(card);
            if (!productId) return;

            if (!cardMap.has(productId)) {
                cardMap.set(productId, []);
            }
            cardMap.get(productId).push(card);
        });

        orderedIds.forEach((rawId) => {
            const productId = this.normalizeProductId(rawId);
            if (!productId) return;
            const queue = cardMap.get(productId);
            if (!queue || queue.length === 0) return;
            parent.appendChild(queue.shift());
        });
    }

    extractRenderedCardProductId(card) {
        if (!card) return null;

        const fromDataId = this.normalizeProductId(card.dataset?.id);
        if (fromDataId) return fromDataId;

        const fromIdAttr = this.normalizeProductId(card.id);
        if (fromIdAttr) return fromIdAttr;

        const link = card.querySelector('.s-product-card-image a, .s-product-card-content-title a, a[href*="/product/"]');
        if (link?.href) {
            const match = link.href.match(/\/product\/[^\/]+\/(\d+)/);
            if (match?.[1]) return this.normalizeProductId(match[1]);
        }

        return null;
    }

    filterRenderedCardsByMinimumPrice(grid, minPrice) {
        const cards = this.getRenderedCards(grid);
        cards.forEach((card) => {
            const price = this.extractRenderedCardPrice(card);
            if (!Number.isFinite(price)) return;
            if (price < minPrice) {
                card.remove();
            }
        });
    }

    extractRenderedCardPrice(card) {
        const priceNode = card.querySelector('.s-product-card-sale-price h4')
            || card.querySelector('.s-product-card-content-sub h4');
        if (!priceNode) return NaN;

        const normalizedText = this.toEnglishDigits(priceNode.textContent || '');
        const numericText = normalizedText.replace(/[^\d.,]/g, '').replace(/,/g, '');
        if (!numericText) return NaN;

        const price = parseFloat(numericText);
        return Number.isFinite(price) ? price : NaN;
    }

    processInlineTrack(track, currentProductId, orderedIds) {
        if (!track) return;

        const preSignature = this.buildInlineTrackSignature(track, currentProductId, orderedIds);
        if (track.dataset.gomlaInlineRerankSignature === preSignature) return;

        this.filterInlineItemsByMinimumPrice(track, MIN_PRICE_SAR);
        this.reorderInlineItemsMatchedThenUnmatched(track, orderedIds);

        track.dataset.gomlaInlineRerankSignature = this.buildInlineTrackSignature(track, currentProductId, orderedIds);
    }

    buildInlineTrackSignature(track, currentProductId, orderedIds) {
        const itemIds = Array.from(track.querySelectorAll('.gomla__carousel-item .gomla__product-card[data-product-id]'))
            .map((card) => this.normalizeProductId(card.dataset.productId))
            .filter(Boolean);
        return `${currentProductId}|${orderedIds.join(',')}|${itemIds.join(',')}`;
    }

    filterInlineItemsByMinimumPrice(track, minPrice) {
        const items = Array.from(track.querySelectorAll('.gomla__carousel-item'));
        items.forEach((item) => {
            const price = this.extractInlineItemPrice(item);
            if (!Number.isFinite(price)) return;
            if (price < minPrice) {
                item.remove();
            }
        });
    }

    extractInlineItemPrice(item) {
        const priceNode = item.querySelector('.gomla__product-card__price');
        if (!priceNode) return NaN;

        const normalizedText = this.toEnglishDigits(priceNode.textContent || '');
        const numericText = normalizedText.replace(/[^\d.,]/g, '').replace(/,/g, '');
        if (!numericText) return NaN;

        const price = parseFloat(numericText);
        return Number.isFinite(price) ? price : NaN;
    }

    reorderInlineItemsMatchedThenUnmatched(track, orderedIds) {
        const items = Array.from(track.querySelectorAll('.gomla__carousel-item'));
        if (!items.length) return;

        const itemsByProductId = new Map();
        items.forEach((item) => {
            const card = item.querySelector('.gomla__product-card[data-product-id]');
            const productId = this.normalizeProductId(
                card?.dataset?.productId || item.getAttribute('data-item-id')
            );
            if (!productId) return;

            if (!itemsByProductId.has(productId)) {
                itemsByProductId.set(productId, []);
            }
            itemsByProductId.get(productId).push(item);
        });

        const matched = [];
        orderedIds.forEach((rawId) => {
            const productId = this.normalizeProductId(rawId);
            if (!productId) return;

            const queue = itemsByProductId.get(productId);
            if (!queue || queue.length === 0) return;
            matched.push(queue.shift());
        });

        const matchedSet = new Set(matched);
        const unmatched = items.filter((item) => !matchedSet.has(item));
        const finalOrder = matched.concat(unmatched);
        finalOrder.forEach((item) => {
            track.appendChild(item);
        });
    }

    handleGomlaProductNavigation(event) {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const gomlaScope = target.closest('.gomla-modal, .gomla__addon-bundle-container');
        if (!gomlaScope) return;

        // Preserve all interactive controls (add-to-cart buttons, carousel nav, modal close, etc.)
        const interactive = target.closest(
            '.gomla__product-card__actions, .gomla__product-card__cta-btn, .gomla__carousel-nav, .gomla-modal__close, button, a, input, select, textarea, label'
        );
        if (interactive) return;

        // Only hijack clicks on product "content area" (image/title/main block)
        const productClickArea = target.closest('.gomla__product-card__main, .gomla__product-card__image, .gomla__product-card__name');
        if (!productClickArea) return;

        const card = target.closest('.gomla__product-card[data-product-id]');
        if (!card) return;

        const productId = this.normalizeProductId(card.dataset.productId);
        if (!productId) return;

        event.preventDefault();
        if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
        }
        event.stopPropagation();

        window.location.assign(`/p${productId}`);
    }

    handleDocumentCartAdded(event) {
        const detailId = this.extractProductIdFromPayload(event?.detail);
        if (detailId) {
            this.setLastAddedProductId(detailId);
        }
    }

    tryHookSallaCartEvent() {
        if (this.sallaCartHooked) return;

        const onItemAdded = window.salla?.cart?.event?.onItemAdded;
        if (typeof onItemAdded !== 'function') return;

        onItemAdded((payload) => {
            const payloadProductId = this.extractProductIdFromPayload(payload);
            if (payloadProductId) {
                this.setLastAddedProductId(payloadProductId);
            }
        });

        this.sallaCartHooked = true;
    }

    setLastAddedProductId(productId) {
        const normalized = this.normalizeProductId(productId);
        if (!normalized) return;
        this.lastAddedProductId = normalized;
        this.scheduleProcess();
    }

    handlePageChanged() {
        this.lastAddedProductId = null;
        this.scheduleProcess();
    }

    getCurrentProductId() {
        const fromInput = this.normalizeProductId(
            document.querySelector('.product-form input[name="id"]')?.value
        );
        if (fromInput) return fromInput;

        const fromSalla = this.normalizeProductId(window.salla?.product?.id);
        if (fromSalla) return fromSalla;

        const fromProductElement = this.normalizeProductId(
            document.querySelector('.product-entry[id^="product-"], #product-entry[id^="product-"], [id^="product-"]')
                ?.id
                ?.replace('product-', '')
        );
        if (fromProductElement) return fromProductElement;

        const urlMatch = window.location.pathname.match(/\/p(\d+)(?:$|\/|\?)/);
        if (urlMatch?.[1]) {
            const fromUrl = this.normalizeProductId(urlMatch[1]);
            if (fromUrl) return fromUrl;
        }

        return null;
    }

    extractProductIdFromPayload(payload) {
        if (!payload) return null;

        if (typeof payload === 'string' || typeof payload === 'number') {
            return this.normalizeProductId(payload);
        }

        const firstPass = [
            payload.productId,
            payload.product_id,
            payload.productID,
            payload.objectID,
            payload.product?.id,
            payload.product?.product_id,
            payload.product?.objectID,
            payload.item?.productId,
            payload.item?.product_id,
            payload.lineItem?.productId,
            payload.lineItem?.product_id,
            payload.line_item?.productId,
            payload.line_item?.product_id,
            payload.cartItem?.productId,
            payload.cartItem?.product_id,
            payload.data?.productId,
            payload.data?.product_id
        ];

        for (const candidate of firstPass) {
            const normalized = this.normalizeProductId(candidate);
            if (normalized) return normalized;
        }

        const urlCandidates = [
            payload.url,
            payload.productUrl,
            payload.product_url,
            payload.product?.url,
            payload.item?.url
        ];

        for (const url of urlCandidates) {
            if (typeof url !== 'string') continue;
            const match = url.match(/\/p(\d+)(?:$|\/|\?)/);
            if (match?.[1]) {
                const normalized = this.normalizeProductId(match[1]);
                if (normalized) return normalized;
            }
        }

        return null;
    }

    normalizeAndUniqueIds(ids) {
        if (!Array.isArray(ids)) return [];
        const seen = new Set();
        const uniqueIds = [];

        ids.forEach((id) => {
            const normalized = this.normalizeProductId(id);
            if (!normalized || seen.has(normalized)) return;
            seen.add(normalized);
            uniqueIds.push(normalized);
        });

        return uniqueIds;
    }

    normalizeProductId(value) {
        if (value === null || value === void 0) return null;
        const stringValue = String(value).trim();
        if (!stringValue) return null;

        const digits = this.toEnglishDigits(stringValue).match(/\d+/g);
        if (!digits || digits.length === 0) return null;
        return digits.join('');
    }

    toEnglishDigits(text) {
        return String(text || '')
            .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
            .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776));
    }
}

if (!window.__gomlaModalRerankInstance) {
    window.__gomlaModalRerankInstance = new GomlaModalRerank();
}

export default window.__gomlaModalRerankInstance;
