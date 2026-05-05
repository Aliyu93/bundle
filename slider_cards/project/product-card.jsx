// ProductCard — image carousel + title, rating, price, add-to-cart, favorite heart
const { useState: useStateCard } = React;

function ProductCard({ product, onFavorite, isFavorite, onAddToCart, inCart }) {
  const [pressed, setPressed] = useStateCard(false);
  const [favPulse, setFavPulse] = useStateCard(false);
  const [cartPulse, setCartPulse] = useStateCard(false);

  const fmtPrice = (p) => {
    // Use Western Arabic numerals for price clarity (common in Saudi e-commerce); 2 decimals
    return p.toFixed(2);
  };

  return (
    <div
      style={{
        flexShrink: 0,
        scrollSnapAlign: 'start',
        width: 'calc((100% - 24px) / 2.25)',
        marginInlineEnd: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        paddingBottom: 4
      }}
    >
      {/* Image carousel + favorite button */}
      <div style={{ position: 'relative' }}>
        <ImageCarousel productId={product.id} />

        {/* Favorite heart — top-left in RTL view (looks "leading-edge" because mirrored) */}
        <button
          onClick={() => {
            onFavorite(product.id);
            setFavPulse(true);
            setTimeout(() => setFavPulse(false), 320);
          }}
          aria-label="إضافة للمفضلة"
          style={{
            position: 'absolute',
            top: 8,
            insetInlineEnd: 8,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transform: favPulse ? 'scale(1.18)' : 'scale(1)',
            transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 2,
            padding: 0
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? '#c2384a' : 'none'} stroke={isFavorite ? '#c2384a' : '#444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Title */}
      <div style={{
        fontSize: 12.5,
        lineHeight: 1.45,
        color: '#2a2520',
        fontWeight: 500,
        textAlign: 'start',
        height: 36,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        textOverflow: 'ellipsis',
        paddingInline: 2
      }}>
        {product.title}
      </div>

      {/* Rating + Price row — in RTL, rating goes on the right (flow start) and price on the left */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: 2,
        gap: 6
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#2a2520', fontFamily: '"Inter", sans-serif' }}>
            {product.rating.toFixed(1)}
          </span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#e8a93c">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1612', fontFamily: '"Inter", sans-serif', letterSpacing: '-0.01em' }}>
            {fmtPrice(product.price)}
          </span>
          {/* SAR symbol — using a generic riyal-like glyph, rendered as small text */}
          <span style={{ fontSize: 11, color: '#7a6a58', fontWeight: 600 }}>﷼</span>
        </div>
      </div>

      {/* Add to cart button */}
      <button
        onClick={() => {
          onAddToCart(product.id);
          setCartPulse(true);
          setTimeout(() => setCartPulse(false), 380);
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        style={{
          marginTop: 2,
          width: '100%',
          height: 34,
          borderRadius: 999,
          border: '1px solid #2a2520',
          background: inCart ? '#2a2520' : '#fff',
          color: inCart ? '#fff' : '#2a2520',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'inherit',
          display: 'flex',
          flexDirection: 'row-reverse',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          cursor: 'pointer',
          transform: pressed ? 'scale(0.97)' : (cartPulse ? 'scale(1.02)' : 'scale(1)'),
          transition: 'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), background 200ms, color 200ms',
          padding: 0
        }}
      >
        <span>{inCart ? 'تمت الإضافة' : 'إضافة للسلة'}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </button>
    </div>
  );
}

window.ProductCard = ProductCard;
