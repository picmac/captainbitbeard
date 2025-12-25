import { useState, useEffect } from 'react';

interface BoxArt3DViewerProps {
  frontCoverUrl?: string;
  backCoverUrl?: string;
  spineUrl?: string;
  gameName?: string;
}

export function BoxArt3DViewer({
  frontCoverUrl,
  backCoverUrl,
  spineUrl,
  gameName,
}: BoxArt3DViewerProps) {
  const [rotateY, setRotateY] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Auto-rotate effect
  useEffect(() => {
    if (!isAutoRotate) return;

    const interval = setInterval(() => {
      setRotateY((prev) => (prev + 0.5) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, [isAutoRotate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotate(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotateY((prev) => prev + deltaX * 0.5);
    setRotateX((prev) => Math.max(-30, Math.min(30, prev - deltaY * 0.3)));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setRotateY(0);
    setRotateX(0);
    setIsAutoRotate(true);
  };

  const showFront = () => {
    setRotateY(0);
    setRotateX(0);
    setIsAutoRotate(false);
  };

  const showBack = () => {
    setRotateY(180);
    setRotateX(0);
    setIsAutoRotate(false);
  };

  const showSpine = () => {
    setRotateY(90);
    setRotateX(0);
    setIsAutoRotate(false);
  };

  if (!frontCoverUrl) {
    return (
      <div className="border-4 border-wood-brown bg-sand-beige p-8 text-center">
        <p className="text-pixel text-xs text-ocean-dark">
          No box art available for 3D viewer
        </p>
      </div>
    );
  }

  return (
    <div className="border-4 border-wood-brown bg-gradient-to-b from-ocean-dark to-black p-6">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={showFront}
            className="btn-retro text-[10px] px-3 py-1"
            title="Show front"
          >
            📦 FRONT
          </button>
          {backCoverUrl && (
            <button
              onClick={showBack}
              className="btn-retro text-[10px] px-3 py-1"
              title="Show back"
            >
              📦 BACK
            </button>
          )}
          {spineUrl && (
            <button
              onClick={showSpine}
              className="btn-retro text-[10px] px-3 py-1"
              title="Show spine"
            >
              📦 SPINE
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`btn-retro text-[10px] px-3 py-1 ${
              isAutoRotate ? 'bg-treasure-green' : ''
            }`}
            title="Toggle auto-rotate"
          >
            {isAutoRotate ? '⏸ AUTO' : '▶ AUTO'}
          </button>
          <button
            onClick={resetView}
            className="btn-retro text-[10px] px-3 py-1"
            title="Reset view"
          >
            🔄 RESET
          </button>
        </div>
      </div>

      {/* 3D Box Container */}
      <div
        className="relative w-full h-96 perspective-1000"
        style={{ perspective: '1000px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="relative w-64 h-80 transition-transform"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
              transition: isDragging ? 'none' : 'transform 0.5s ease-out',
            }}
          >
            {/* Front Cover */}
            <div
              className="absolute w-full h-full border-4 border-wood-brown bg-black"
              style={{
                transform: 'translateZ(10px)',
                backfaceVisibility: 'hidden',
              }}
            >
              <img
                src={frontCoverUrl}
                alt={`${gameName} - Front Cover`}
                className="w-full h-full object-cover pixel-art"
                draggable={false}
              />
            </div>

            {/* Back Cover */}
            {backCoverUrl && (
              <div
                className="absolute w-full h-full border-4 border-wood-brown bg-black"
                style={{
                  transform: 'translateZ(-10px) rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <img
                  src={backCoverUrl}
                  alt={`${gameName} - Back Cover`}
                  className="w-full h-full object-cover pixel-art"
                  draggable={false}
                />
              </div>
            )}

            {/* Left Spine */}
            {spineUrl && (
              <div
                className="absolute w-5 h-full border-4 border-wood-brown bg-black"
                style={{
                  transform: 'rotateY(-90deg) translateZ(calc(128px - 10px))',
                  backfaceVisibility: 'hidden',
                  left: '-10px',
                }}
              >
                <img
                  src={spineUrl}
                  alt={`${gameName} - Spine`}
                  className="w-full h-full object-cover pixel-art"
                  draggable={false}
                />
              </div>
            )}

            {/* Right Side (solid color if no image) */}
            <div
              className="absolute w-5 h-full border-4 border-wood-brown bg-wood-brown"
              style={{
                transform: 'rotateY(90deg) translateZ(calc(128px - 10px))',
                backfaceVisibility: 'hidden',
                right: '-10px',
              }}
            />

            {/* Top (solid color) */}
            <div
              className="absolute w-full h-5 border-4 border-wood-brown bg-wood-brown"
              style={{
                transform: 'rotateX(90deg) translateZ(calc(160px - 10px))',
                backfaceVisibility: 'hidden',
                top: '-10px',
              }}
            />

            {/* Bottom (solid color) */}
            <div
              className="absolute w-full h-5 border-4 border-wood-brown bg-wood-brown"
              style={{
                transform: 'rotateX(-90deg) translateZ(calc(160px - 10px))',
                backfaceVisibility: 'hidden',
                bottom: '-10px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-pixel text-[10px] text-skull-white/70">
          {isDragging
            ? '🖱️ Dragging...'
            : isAutoRotate
            ? '🔄 Auto-rotating - Click and drag to rotate manually'
            : '🖱️ Click and drag to rotate • Use buttons to view sides'}
        </p>
      </div>
    </div>
  );
}
