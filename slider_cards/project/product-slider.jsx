// ProductSlider — outer horizontal slider holding 6 product cards.
// Uses native CSS scroll-snap for buttery momentum + snap behavior.
// In RTL container, scrollLeft semantics are mirrored, but native scroll-snap handles it correctly.
// No dots (per user request) — instead a thin progress rail at the bottom showing scroll position.

const { useRef: useRefSlider, useState: useStateSlider, useEffect: useEffectSlider } = React;

function ProductSlider({ title, seeAllLabel = "مشاهدة الكل" }) {
  const scrollerRef = useRefSlider(null);
  const [progress, setProgress] = useStateSlider(0);
  const [favorites, setFavorites] = useStateSlider(new Set());
  const [cart, setCart] = useStateSlider(new Set());

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) { setProgress(0); return; }
    const sl = Math.abs(el.scrollLeft);
    setProgress(Math.min(1, Math.max(0, sl / max)));
  };

  useEffectSlider(() => { onScroll(); }, []);

  const toggleFav = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleCart = (id) => {
    setCart(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ width: '100%', paddingBlock: '10px 14px' }}>
      {title && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingInline: 14,
          marginBottom: 12
        }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#a04a2a', letterSpacing: '-0.01em' }}>{title}</h2>
          <a href="#" onClick={(e) => e.preventDefault()} style={{
            fontSize: 12, color: '#6b5a48', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500
          }}>
            <span>{seeAllLabel}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </a>
        </div>
      )}

      {/* The scroller */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="om-product-rail"
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollPaddingInlineStart: 14,
          paddingInline: 14,
          gap: 0,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          overscrollBehaviorX: 'contain'
        }}
      >
        {window.PRODUCTS.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            onFavorite={toggleFav}
            isFavorite={favorites.has(p.id)}
            onAddToCart={toggleCart}
            inCart={cart.has(p.id)}
          />
        ))}
        {/* End spacer so last card can snap with breathing room */}
        <div style={{ flexShrink: 0, width: 4 }} />
      </div>

      {/* Progress rail — replaces dots. RTL: track fills from right, indicator slides leftward as user scrolls deeper. */}
      <div style={{
        marginTop: 14,
        marginInline: 14,
        height: 3,
        background: 'rgba(0,0,0,0.06)',
        borderRadius: 999,
        position: 'relative',
        direction: 'rtl'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '32%',
          background: '#a04a2a',
          borderRadius: 999,
          right: `${progress * 68}%`,
          transition: 'none',
          willChange: 'right'
        }} />
      </div>
    </div>
  );
}

window.ProductSlider = ProductSlider;
