# Duplicate Products Handoff: Custom Sliders + Salla Product Data

Last updated: 2026-05-05

## Current Goal

Build replacement homepage/category/cart recommendation sliders and product cards that keep the current ranking architecture:

1. Algolia/Redis returns ordered product IDs only.
2. The storefront fetches product details from Salla.
3. Our code owns hydration validation, ordering, duplicate handling, slider structure, and product-card rendering.

The intended fix is not to move product data ownership into Algolia/Redis. Salla should remain the product source of truth for title, price, images, stock, options, URLs, and cart behavior.

## Issue Summary

Products are appearing twice in Salla-rendered product rails. The issue was first observed on 2026-05-05 after years of stable behavior.

Affected surfaces observed:

- Homepage product rails.
- Cart mini frequently-bought-together/addon slider.
- Some category pages using the custom Redis ranking path.
- Some modal/inline addon surfaces may also be exposed because they use the same Salla selected-products hydration pattern.

The duplicate cards are not caused by duplicate Algolia/Redis ID lists. The evidence points to Salla's selected-products hydration returning an invalid response for clean ID batches.

## Key Finding

The fragile dependency is this pattern:

```js
const list = document.createElement('salla-products-list');
list.setAttribute('source', 'selected');
list.setAttribute('source-value', JSON.stringify(productIds));
```

or:

```js
const slider = document.createElement('salla-products-slider');
slider.setAttribute('source', 'selected');
slider.setAttribute('source-value', JSON.stringify(productIds));
```

When Salla's component hydrates `source="selected"`, some responses contain duplicated products and omit other requested products.

Typical bad shape:

- Request asks for 6 product IDs.
- Response contains 6 rows.
- Only 3 distinct IDs are present.
- Each present ID appears twice.
- One duplicate often has the store scope and the other has `scope_id: null`.
- The other 3 requested IDs are missing.

The same ID batch can later be fetched manually and return clean results, which makes this look like a Salla selected-products API/cache/race issue rather than a stable data issue in Algolia/Redis.

## What Was Already Tried

Temporary request-normalization patches were deployed before this handoff:

- Add `store_id`.
- Add `lang`.
- Add `page=1`.
- Add cache-busting query parameter.

These improved some runs but did not eliminate duplicate cards. This means query normalization alone is not sufficient.

## Live Audit Evidence

Homepage after deployed version `v1.9.21`:

- Bundle loaded from `https://cdn.jsdelivr.net/gh/Aliyu93/bundle@v1.9.21/dist/algolia-bundle.min.js`.
- Selected-products request wrapper was installed.
- Requests included `store_id`, `lang`, `page=1`, and cache busting.
- Repeated fresh homepage audits still produced failing rails.
- Failures varied by run, but the bad response shape stayed the same: clean requested IDs in, duplicate/missing Salla products out.

Repeated homepage audit examples:

- Run 1: 6 failing rails out of 18.
- Run 2: 7 failing rails out of 18.
- Run 3: 7 failing rails out of 18.

Category page audit:

- Some category pages returned clean.
- Some category pages returned duplicated products in the first selected-products batch.
- Some category pages duplicated both the first batch and the next lazy-loaded batch.
- This confirms the issue is not isolated to homepage sliders.

Manual post-load fetches from the page context:

- The same failing ID batches often returned clean when re-fetched manually after page load.
- Singles, smaller slices, and alternate parameter shapes returned clean in the observed tests.
- This supports an intermittent Salla hydration/cache problem.

## Important Non-Causes

### Not Algolia/Redis ranking duplication

The Redis ranking service returns ordered `objectIDs`. In audited failures, the outgoing ID list was clean before it was passed into Salla components.

Relevant files:

- `services/redis-service.js`
- `partials/category-products.js`
- `partials/product-ranking.js`
- `components/CartAddonsSlider.js`

### Not the `productstoredis` image 404s

Network messages like:

```text
Product not found in Redis for ID: 1501696538
Product not found in Redis for ID: 1011003381
```

come from the optional image enhancer endpoint:

```text
https://productstoredis-163858290861.me-central2.run.app/product-images/{productId}
```

That endpoint is used by `partials/product-card-enhancer.js` to fetch extra product images/dots. A miss there hides optional extra images. It does not create duplicate product cards.

Those two IDs were checked live after the report and returned `200`, so those exact misses were transient or cache-lag related.

## Current Architecture Touchpoints

### Homepage Rails

File: `partials/category-products.js`

Flow:

1. Fetch categories from Redis.
2. Fetch ranked product IDs per category.
3. De-dupe globally across homepage rails with `seenProductIds`.
4. Render a Salla component:

```js
const slider = document.createElement('salla-products-slider');
slider.setAttribute('source', 'selected');
slider.setAttribute('source-value', JSON.stringify(uniqueIDs));
slider.setAttribute('limit', String(uniqueIDs.length));
```

Risk:

- IDs are clean before rendering.
- Final cards are only as trustworthy as Salla's selected-products component hydration.

### Category Ranking

File: `partials/product-ranking.js`

Flow:

1. Replace the original Salla product list.
2. Fetch ranked IDs from Redis.
3. Render `salla-products-list source="selected"`.
4. Reorder DOM cards after Salla renders.
5. Lazy-load more batches using the same pattern.

Risk:

- Reordering can only reorder cards Salla actually returned.
- If Salla duplicates 6 IDs and omits 6 IDs, the missing products cannot be recovered by DOM reordering.

### Cart Addons / FBT

File: `components/CartAddonsSlider.js`

Flow:

1. Extract highest-value item from cart DOM.
2. Fetch frequently-bought IDs from Redis.
3. Render `salla-products-list source="selected"`.
4. Apply visual discount in DOM.

Risk:

- Same selected-products hydration issue.
- Cart surface is more sensitive because cards must preserve add-to-cart/options behavior.

### Gomla Modal / Inline Addons

File: `partials/gomla-modal-rerank.js`

Flow:

1. Fetch frequently-bought IDs from Redis.
2. Replace grid with `salla-products-list source="selected"`.
3. Reorder and filter rendered cards.

Risk:

- Same selected-products hydration issue.

### Existing "Custom" Recommendations Slider

File: `components/AlgoliaRecommendationsSlider.js`

This component has a custom slider shell, but it still uses `salla-products-list source="selected"` as the product hydration/rendering source, then moves Salla-rendered cards into a Swiper wrapper.

This is not enough for the new fix. A future implementation must avoid using Salla web components for selected-products hydration if the goal is to control duplicates.

## Recommended Direction

Create an owned product-hydration layer and owned product card/slider components:

```text
Algolia/Redis IDs
  -> our selected-products fetch to Salla
  -> validate response
  -> de-dupe and preserve requested order
  -> recover missing IDs by retry/single-ID fetch
  -> render our product cards
  -> initialize our slider
```

The main rule:

Do not use `salla-products-slider` or `salla-products-list` for these ranked/recommended surfaces. Use Salla APIs for data, but own the fetch, validation, and DOM.

## Hydration Requirements

The new Salla hydration client should:

1. Accept an ordered array of product IDs.
2. Fetch product data from Salla's selected-products API.
3. Normalize IDs to strings.
4. Preserve the original requested order.
5. Prefer the scoped/store-specific product row when duplicate rows exist.
6. Drop duplicate returned rows.
7. Detect missing requested IDs.
8. Retry bad batches once or twice with backoff.
9. If a batch is still bad, fetch missing IDs individually or in smaller chunks.
10. Return a typed result containing `products`, `missingIds`, `duplicateIds`, and `requestMeta`.
11. Never render two cards with the same product ID.

Suggested validation:

```js
function validateHydratedProducts(requestedIds, products) {
  const requested = requestedIds.map(String);
  const byId = new Map();
  const duplicateIds = new Set();

  for (const product of products || []) {
    const id = String(product?.id ?? product?.product_id ?? product?.objectID ?? '');
    if (!id) continue;

    if (byId.has(id)) {
      duplicateIds.add(id);
      const existing = byId.get(id);
      if (!existing?.scope_id && product?.scope_id) {
        byId.set(id, product);
      }
      continue;
    }

    byId.set(id, product);
  }

  return {
    products: requested.map(id => byId.get(id)).filter(Boolean),
    missingIds: requested.filter(id => !byId.has(id)),
    duplicateIds: Array.from(duplicateIds)
  };
}
```

## Product Card Requirements

The new cards need to match Salla behavior closely enough for production:

- Product image.
- Product title.
- Product URL.
- Regular/sale price.
- Currency display.
- Sale/discount/offer labels if available from Salla data.
- Out-of-stock state.
- Rating/reviews if available.
- Add-to-cart button.
- Options/variants behavior for products that require options.
- Wishlist behavior if currently expected.
- RTL layout.
- Mobile two-column behavior where applicable.
- Existing theme classes where useful, but avoid depending on Salla components for data hydration.

For cart/FBT cards, preserve:

- Correct add-to-cart flow.
- Option selection flow.
- Discount presentation currently applied in `CartAddonsSlider`.
- Cart refresh behavior after successful add.

## Slider Requirements

The slider can use Swiper if it is already available from Salla/theme, with a CSS-scroll fallback.

Expected behavior:

- RTL.
- Stable card widths.
- No layout shift while loading.
- Desktop arrows.
- Touch scrolling on mobile.
- Skeleton/loading state.
- Empty state that hides the rail if no valid products.
- No duplicate cards even if Salla returns duplicate rows.
- Optional diagnostics in development mode only.

## Suggested Implementation Plan

### Phase 1: Shared Hydration Client

Add a reusable module, for example:

```text
services/salla-products-service.js
```

Responsibilities:

- Build the Salla selected-products URL.
- Fetch product details for ordered IDs.
- Validate response shape.
- Retry bad batches.
- Fetch missing IDs in smaller chunks/singles.
- Return products in requested order.

Do not render DOM in this module.

### Phase 2: Shared Product Card Renderer

Add a small renderer/component, for example:

```text
components/DarlenaProductCard.js
```

Responsibilities:

- Render one product from normalized Salla data.
- Expose hooks for add-to-cart/options/wishlist.
- Keep markup/classes compatible with current theme CSS where possible.

This is the highest-risk part because it replaces Salla's built-in card behavior. Start with homepage rails before cart.

### Phase 3: Homepage Rails

Replace the `salla-products-slider` rendering in `partials/category-products.js`.

Keep:

- Redis category fetch.
- Redis product ID ranking.
- `seenProductIds` cross-rail de-dupe.
- Lazy loading order.

Replace:

- `renderCategorySlider()` should call the new Salla hydration client and render the custom slider/cards.

This is the best first production target because homepage cards are easier to validate than cart add-on behavior.

### Phase 4: Category Ranking

Replace `salla-products-list source="selected"` in `partials/product-ranking.js`.

Keep:

- Redis ranking.
- Category/tag switching.
- Infinite/lazy loading.
- Fallback to original Salla list when Redis fails.

Replace:

- Custom render batches from hydrated Salla products.
- Remove reliance on post-render DOM reordering.

### Phase 5: Cart / FBT

Replace selected-products rendering in `components/CartAddonsSlider.js`.

Extra care:

- Verify add-to-cart.
- Verify products with options.
- Verify discount display.
- Verify cart refresh behavior.
- Verify mobile mini-cart/cart page layout.

### Phase 6: Gomla Modal / Inline Addons

Replace selected-products rendering in `partials/gomla-modal-rerank.js` only after the shared card/add-to-cart path is stable.

## API Notes For Future Agent

The repo currently does not have a dedicated Salla products API client. The Salla web components are causing Salla to call:

```text
https://api.salla.dev/store/v1/products?source=selected&source_value[]=...&limit=...
```

or equivalent encoded forms.

Before implementing, inspect current live network calls in Playwright and mirror the minimum required request shape:

- `source=selected`
- requested product IDs
- `limit`
- `page=1`
- `store_id`
- `lang`

The exact auth/session behavior may rely on browser cookies or headers already present on `darlena.com`. Fetch from the storefront browser context, not a server, unless Salla API access is formally configured.

## Observability To Add

For the first rollout, add lightweight diagnostics behind a flag:

```text
window.__DARLENA_PRODUCT_DEBUG__ = true
```

Log only when enabled:

- Requested IDs.
- Returned IDs.
- Duplicate IDs.
- Missing IDs.
- Retry count.
- Final rendered IDs.
- Salla request URL without sensitive cookies/headers.

This will make the next audit faster without polluting production console by default.

## Acceptance Criteria

A new implementation should pass these checks:

1. Homepage: no duplicate product IDs within any rail.
2. Homepage: no duplicate product IDs across rails when `seenProductIds` is intended to enforce global uniqueness.
3. Category pages: first batch and lazy-loaded batches have no duplicate IDs within the rendered category list.
4. Category pages: rendered order matches Redis/Algolia order after missing/unavailable products are removed.
5. Cart FBT: no duplicate IDs in the slider.
6. Cart FBT: add-to-cart still works.
7. Products requiring options still open the correct Salla options flow or product page.
8. Bad Salla batch responses do not render duplicate cards.
9. If Salla cannot provide some requested products after retries, those products are skipped and logged in debug mode.
10. No dependency on `salla-products-list source="selected"` or `salla-products-slider source="selected"` remains for the migrated surfaces.

## Suggested Playwright Audit Shape

Audit the DOM and the network response separately.

DOM audit:

- For each rail/list, extract product IDs from card IDs, data attributes, or product links.
- Count total IDs and distinct IDs.
- Report duplicates with rail/category label.

Network audit:

- Capture requests to `api.salla.dev/store/v1/products`.
- Parse requested `source_value` IDs.
- Parse returned product IDs.
- Compare requested count, returned count, distinct returned count, missing IDs, and duplicate IDs.

A useful failure report format:

```json
{
  "surface": "homepage",
  "rail": "category-id-or-title",
  "requestedIds": ["..."],
  "returnedIds": ["..."],
  "distinctReturnedIds": ["..."],
  "missingIds": ["..."],
  "duplicateIds": ["..."],
  "renderedIds": ["..."]
}
```

## Caution

Do not solve this by only wrapping Salla components in a custom slider. `components/AlgoliaRecommendationsSlider.js` already does that, and it still depends on `salla-products-list` for hydration/rendering.

The fix needs to own product hydration and card rendering while still getting product data from Salla.
