// Real product image — uses uploaded photos. variant picks which image (0,1,2 = three views per product).
function ProductImage({ productId, variant }) {
  // 6 images total; for each product, pick 3 of them in a rotating fashion so cards don't all look identical
  const allImages = [
    'images/p1.jpg',
    'images/p2.jpg',
    'images/p3.jpg',
    'images/p4.jpg',
    'images/p5.jpg',
    'images/p6.jpg'
  ];
  // Each product gets 3 images, rotated by productId so neighboring cards differ
  const startIdx = ((productId - 1) * 1) % 6;
  const idx = (startIdx + variant) % 6;
  const src = allImages[idx];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#ece4d6', overflow: 'hidden' }}>
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      />
    </div>
  );
}

window.ProductImage = ProductImage;
