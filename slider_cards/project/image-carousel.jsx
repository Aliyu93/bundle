// ImageCarousel — 3 images, swipeable with touch + smooth spring animation.
// Uses pointer events with rubber-banding at edges and snap-on-release.
// In RTL, images flow right-to-left: image 0 on the right, image 2 on the left.
const { useState, useRef, useEffect, useCallback } = React;

function ImageCarousel({ productId, onTap }) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0); // current drag offset in px (positive = dragging in RTL natural direction)
  const [isDragging, setIsDragging] = useState(0); // 0 idle, 1 dragging
  const containerRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);
  const width = useRef(0);
  const lockedAxis = useRef(null); // 'x' | 'y' | null
  const pointerId = useRef(null);

  const COUNT = 3;

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointerId.current = e.pointerId;
    width.current = containerRef.current.offsetWidth;
    startX.current = e.clientX;
    startY.current = e.clientY;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    velocity.current = 0;
    lockedAxis.current = null;
    setIsDragging(1);
  };

  const onPointerMove = (e) => {
    if (pointerId.current !== e.pointerId) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (!lockedAxis.current) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        lockedAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      } else {
        return;
      }
    }
    if (lockedAxis.current !== 'x') return;

    e.preventDefault();
    // Try to capture pointer once we know it's a horizontal drag
    try { containerRef.current.setPointerCapture(e.pointerId); } catch(_) {}

    const now = performance.now();
    const dt = Math.max(1, now - lastT.current);
    velocity.current = (e.clientX - lastX.current) / dt; // px/ms
    lastX.current = e.clientX;
    lastT.current = now;

    // RTL: positive dx (rightward) goes back to previous image; negative dx (leftward) goes forward
    // We translate the strip — in RTL the strip's "natural" direction means dragging right shows previous slide
    let next = dx;

    // Rubber band at edges
    const atStart = index === 0; // first image (rightmost in RTL)
    const atEnd = index === COUNT - 1; // last image (leftmost in RTL)
    if ((atStart && dx > 0) || (atEnd && dx < 0)) {
      next = dx * 0.35;
    }
    setDrag(next);
  };

  const finishDrag = (e) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;

    if (lockedAxis.current !== 'x') {
      setIsDragging(0);
      setDrag(0);
      return;
    }

    const w = width.current || 1;
    const threshold = w * 0.18;
    const flickThreshold = 0.45; // px/ms
    let targetDelta = 0;
    if (drag < -threshold || velocity.current < -flickThreshold) targetDelta = 1; // forward
    else if (drag > threshold || velocity.current > flickThreshold) targetDelta = -1; // back

    let newIndex = Math.max(0, Math.min(COUNT - 1, index + targetDelta));
    setIndex(newIndex);
    setIsDragging(0);
    setDrag(0);
  };

  const goTo = (i) => {
    if (i < 0 || i >= COUNT) return;
    setIndex(i);
  };

  // Compute transform. In RTL, the strip is laid out with image 0 on the right.
  // We use a row-reverse flex layout, so translateX(positive) shifts visually left toward image 1, 2.
  // To advance to next image (move leftward in RTL flow), we need translateX(-100% * index) — same math as LTR after flex-row-reverse.
  // Because flex row-reverse swaps direction, translateX(-N%) actually moves the row visually rightward in LTR coords,
  // but our container is dir=rtl, so we'll keep it simpler: render strip as flex row (no reverse) but reverse the visual
  // by applying translateX with sign flipped against drag.

  // Simpler approach: render images in order [0,1,2] as a normal LTR flex row, but in RTL container,
  // the row will display [2,1,0] visually. Translating by -index*100% moves toward image 0 (rightmost visually in RTL).
  // We want translating in NEGATIVE direction = move to next index. So:
  //   translateX = (drag - index * w) in LTR coords
  // But because parent has dir=rtl, the transform is mirrored. We'll force the strip to dir=ltr to keep math sane.

  const baseOffset = -index * (width.current || 0);
  const offset = baseOffset + drag;

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '9 / 14', // taller card image area while still mobile-friendly
        overflow: 'hidden',
        borderRadius: '14px',
        background: '#ece4d6',
        touchAction: 'pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div
        dir="ltr"
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          width: `${COUNT * 100}%`,
          transform: `translate3d(${offset}px, 0, 0)`,
          transition: isDragging ? 'none' : 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform'
        }}
      >
        {Array.from({ length: COUNT }).map((_, i) => (
          <div key={i} style={{ width: `${100 / COUNT}%`, height: '100%', flexShrink: 0 }}>
            <ProductImage productId={productId} variant={i} />
          </div>
        ))}
      </div>

      {/* Dots — RTL: first dot on the right (index 0 starts there). Active dot extends leftward. */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          bottom: 10,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 5,
          pointerEvents: 'none'
        }}
      >
        {Array.from({ length: COUNT }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 16 : 5,
              height: 5,
              borderRadius: 3,
              background: i === index ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
              transition: 'width 280ms cubic-bezier(0.22, 1, 0.36, 1), background 200ms'
            }}
          />
        ))}
      </div>
    </div>
  );
}

window.ImageCarousel = ImageCarousel;
