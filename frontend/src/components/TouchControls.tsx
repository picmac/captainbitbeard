import { useState, useEffect } from 'react';

interface TouchControlsProps {
  show: boolean;
  opacity?: number;
}

export function TouchControls({ show, opacity = 0.7 }: TouchControlsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if device has touch support
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(hasTouchScreen);
  }, []);

  // Don't render on desktop
  if (!isMobile || !show) return null;

  // Simulate key press for EmulatorJS
  const handleButtonPress = (key: string, isPressed: boolean) => {
    const event = new KeyboardEvent(isPressed ? 'keydown' : 'keyup', {
      key,
      code: key,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  };

  const handleTouchStart = (key: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    handleButtonPress(key, true);
  };

  const handleTouchEnd = (key: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    handleButtonPress(key, false);
  };

  const buttonStyle = {
    opacity,
  };

  return (
    <>
      {/* D-Pad (Left Side) */}
      <div
        className="fixed left-4 bottom-24 z-50 touch-none"
        style={buttonStyle}
      >
        <div className="relative w-32 h-32">
          {/* Up */}
          <button
            onTouchStart={handleTouchStart('ArrowUp')}
            onTouchEnd={handleTouchEnd('ArrowUp')}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-ocean-blue border-2 border-skull-white active:bg-ocean flex items-center justify-center text-skull-white font-bold"
            aria-label="D-Pad Up"
          >
            ▲
          </button>

          {/* Down */}
          <button
            onTouchStart={handleTouchStart('ArrowDown')}
            onTouchEnd={handleTouchEnd('ArrowDown')}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-ocean-blue border-2 border-skull-white active:bg-ocean flex items-center justify-center text-skull-white font-bold"
            aria-label="D-Pad Down"
          >
            ▼
          </button>

          {/* Left */}
          <button
            onTouchStart={handleTouchStart('ArrowLeft')}
            onTouchEnd={handleTouchEnd('ArrowLeft')}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-ocean-blue border-2 border-skull-white active:bg-ocean flex items-center justify-center text-skull-white font-bold"
            aria-label="D-Pad Left"
          >
            ◀
          </button>

          {/* Right */}
          <button
            onTouchStart={handleTouchStart('ArrowRight')}
            onTouchEnd={handleTouchEnd('ArrowRight')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-ocean-blue border-2 border-skull-white active:bg-ocean flex items-center justify-center text-skull-white font-bold"
            aria-label="D-Pad Right"
          >
            ▶
          </button>

          {/* Center (for visual reference) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-night-sky border-2 border-ocean-blue rounded-full" />
        </div>
      </div>

      {/* Action Buttons (Right Side) */}
      <div
        className="fixed right-4 bottom-32 z-50 touch-none"
        style={buttonStyle}
      >
        <div className="relative w-40 h-32">
          {/* B Button (Bottom Left) */}
          <button
            onTouchStart={handleTouchStart('z')} // RetroArch default: Z = B
            onTouchEnd={handleTouchEnd('z')}
            className="absolute bottom-0 left-8 w-14 h-14 bg-blood-red border-4 border-skull-white rounded-full active:bg-blood-red/70 flex items-center justify-center text-skull-white font-bold text-lg shadow-lg"
            aria-label="B Button"
          >
            B
          </button>

          {/* A Button (Bottom Right) */}
          <button
            onTouchStart={handleTouchStart('x')} // RetroArch default: X = A
            onTouchEnd={handleTouchEnd('x')}
            className="absolute bottom-4 right-0 w-14 h-14 bg-treasure-green border-4 border-skull-white rounded-full active:bg-treasure-green/70 flex items-center justify-center text-skull-white font-bold text-lg shadow-lg"
            aria-label="A Button"
          >
            A
          </button>

          {/* Y Button (Top Left) */}
          <button
            onTouchStart={handleTouchStart('a')} // RetroArch default: A = Y
            onTouchEnd={handleTouchEnd('a')}
            className="absolute top-0 left-0 w-12 h-12 bg-pirate-gold border-4 border-skull-white rounded-full active:bg-pirate-gold/70 flex items-center justify-center text-ocean-dark font-bold shadow-lg"
            aria-label="Y Button"
          >
            Y
          </button>

          {/* X Button (Top Right) */}
          <button
            onTouchStart={handleTouchStart('s')} // RetroArch default: S = X
            onTouchEnd={handleTouchEnd('s')}
            className="absolute top-4 right-8 w-12 h-12 bg-ocean border-4 border-skull-white rounded-full active:bg-ocean/70 flex items-center justify-center text-skull-white font-bold shadow-lg"
            aria-label="X Button"
          >
            X
          </button>
        </div>
      </div>

      {/* Start/Select Buttons (Bottom Center) */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-4 touch-none"
        style={buttonStyle}
      >
        <button
          onTouchStart={handleTouchStart('Enter')} // RetroArch default: Enter = Start
          onTouchEnd={handleTouchEnd('Enter')}
          className="px-6 py-2 bg-wood-brown border-2 border-skull-white active:bg-wood-brown/70 text-skull-white text-xs font-bold shadow-lg"
          aria-label="Start Button"
        >
          START
        </button>

        <button
          onTouchStart={handleTouchStart('Shift')} // RetroArch default: Shift = Select
          onTouchEnd={handleTouchEnd('Shift')}
          className="px-6 py-2 bg-wood-brown border-2 border-skull-white active:bg-wood-brown/70 text-skull-white text-xs font-bold shadow-lg"
          aria-label="Select Button"
        >
          SELECT
        </button>
      </div>

      {/* L/R Shoulder Buttons (Top) */}
      <div
        className="fixed top-20 left-0 right-0 z-50 flex justify-between px-4 touch-none"
        style={buttonStyle}
      >
        <button
          onTouchStart={handleTouchStart('q')} // RetroArch default: Q = L
          onTouchEnd={handleTouchEnd('q')}
          className="px-8 py-3 bg-sand-beige border-2 border-wood-brown active:bg-sand-beige/70 text-ocean-dark text-sm font-bold rounded-t-lg shadow-lg"
          aria-label="L Shoulder Button"
        >
          L
        </button>

        <button
          onTouchStart={handleTouchStart('w')} // RetroArch default: W = R
          onTouchEnd={handleTouchEnd('w')}
          className="px-8 py-3 bg-sand-beige border-2 border-wood-brown active:bg-sand-beige/70 text-ocean-dark text-sm font-bold rounded-t-lg shadow-lg"
          aria-label="R Shoulder Button"
        >
          R
        </button>
      </div>
    </>
  );
}
