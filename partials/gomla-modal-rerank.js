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
        this.onClickCapture = this.handleClickCapture.bind(this);
        this.onDocumentCartAdded = this.handleDocumentCartAdded.bind(this);
        this.onPageChanged = this.scheduleProcess.bind(this);
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

    async processGrid(grid) {
        if (!grid) return;

        const preSignature = this.buildGridSignature(grid);
        if (grid.dataset.gomlaRerankSignature === preSignature) return;

        // Always filter low-priced items first.
        this.filterProductsByMinimumPrice(grid, MIN_PRICE_SAR);

        if (this.lastAddedProductId) {
            const frequentlyBoughtIds = await redisService.getFrequentlyBought(this.lastAddedProductId);
            if (Array.isArray(frequentlyBoughtIds) && frequentlyBoughtIds.length > 0) {
                this.reorderGridMatchedThenUnmatched(grid, frequentlyBoughtIds);
            }
        }

        grid.dataset.gomlaRerankSignature = this.buildGridSignature(grid);
    }

    filterProductsByMinimumPrice(grid, minPrice) {
        const items = Array.from(grid.querySelectorAll('.gomla__popup-item'));
        items.forEach((item) => {
            const price = this.extractItemPrice(item);
            if (!Number.isFinite(price)) return;
            if (price < minPrice) {
                item.remove();
            }
        });
    }

    reorderGridMatchedThenUnmatched(grid, orderedIds) {
        const items = Array.from(grid.querySelectorAll('.gomla__popup-item'));
        if (!items.length) return;

        const itemsByProductId = new Map();
        items.forEach((item) => {
            const card = item.querySelector('.gomla__product-card[data-product-id]');
            const productId = this.normalizeProductId(card?.dataset?.productId);
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
            grid.appendChild(item);
        });
    }

    buildGridSignature(grid) {
        const ids = Array.from(grid.querySelectorAll('.gomla__popup-item .gomla__product-card[data-product-id]'))
            .map((card) => this.normalizeProductId(card.dataset.productId))
            .filter(Boolean);
        const idPart = ids.join(',');
        const productPart = this.lastAddedProductId || 'none';
        return `${productPart}|${idPart}`;
    }

    extractItemPrice(item) {
        const priceNode = item.querySelector('.gomla__product-card__price');
        if (!priceNode) return NaN;

        const normalizedText = this.toEnglishDigits(priceNode.textContent || '');
        const numericText = normalizedText.replace(/[^\d.,]/g, '').replace(/,/g, '');
        if (!numericText) return NaN;

        const price = parseFloat(numericText);
        return Number.isFinite(price) ? price : NaN;
    }

    handleClickCapture(event) {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const fromDataAttr = this.normalizeProductId(
            target.closest('[data-product-id]')?.getAttribute('data-product-id')
        );
        if (fromDataAttr) {
            this.setLastAddedProductId(fromDataAttr);
            return;
        }

        const form = target.closest('form');
        const formProductId = this.normalizeProductId(
            form?.querySelector('input[name="id"], input[name="product_id"], input[name="productId"]')?.value
        );
        if (formProductId) {
            this.setLastAddedProductId(formProductId);
            return;
        }

        const fromCard = this.normalizeProductId(
            target.closest('.s-product-card-entry')?.getAttribute('data-id')
        );
        if (fromCard) {
            this.setLastAddedProductId(fromCard);
        }
    }

    handleDocumentCartAdded(event) {
        const detailId = this.extractProductIdFromPayload(event?.detail);
        if (detailId) {
            this.setLastAddedProductId(detailId);
            return;
        }

        const fallbackFromTarget = this.normalizeProductId(
            event?.target?.closest?.('[data-product-id]')?.getAttribute?.('data-product-id')
        );
        if (fallbackFromTarget) {
            this.setLastAddedProductId(fallbackFromTarget);
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

        const secondPass = [
            payload.id,
            payload.item?.id,
            payload.data?.id
        ];

        for (const candidate of secondPass) {
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
