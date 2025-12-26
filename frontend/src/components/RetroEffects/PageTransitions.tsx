import { useEffect, useState, useRef, ReactNode } from 'react';
import './PageTransitions.css';
import { Sounds } from '../../utils/soundSystem';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type TransitionType =
  | 'pixel-dissolve'
  | 'tv-static'
  | 'screen-slide-left'
  | 'screen-slide-right'
  | 'screen-slide-up'
  | 'screen-slide-down'
  | 'scanline-wipe'
  | 'power-off'
  | 'power-on'
  | 'glitch'
  | 'fade';

export interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  isTransitioning?: boolean;
  className?: string;
}

// ============================================
// PAGE TRANSITION WRAPPER COMPONENT
// ============================================

export function PageTransition({
  children,
  type = 'pixel-dissolve',
  duration = 1000,
  isTransitioning = false,
  className = '',
}: PageTransitionProps) {
  const [transitionClass, setTransitionClass] = useState('');

  useEffect(() => {
    if (isTransitioning) {
      setTransitionClass(`page-transition--${type} page-transition--active`);

      // Play sound based on transition type
      if (type === 'power-off' || type === 'power-on') {
        Sounds.MENU_SELECT();
      } else if (type === 'tv-static' || type === 'glitch') {
        Sounds.ERROR();
      } else {
        Sounds.MENU_NAVIGATE();
      }

      const timer = setTimeout(() => {
        setTransitionClass('');
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, type, duration]);

  return (
    <div className={`page-transition ${transitionClass} ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// PIXEL DISSOLVE TRANSITION
// ============================================

interface PixelDissolveTransitionProps {
  isActive: boolean;
  onComplete?: () => void;
  pixelSize?: number;
  duration?: number;
}

export function PixelDissolveTransition({
  isActive,
  onComplete,
  pixelSize = 8,
  duration = 1000,
}: PixelDissolveTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsAnimating(true);
    Sounds.POWER_UP();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.ceil(canvas.width / pixelSize);
    const rows = Math.ceil(canvas.height / pixelSize);
    const totalPixels = cols * rows;

    // Create array of pixel indices
    const pixels: number[] = [];
    for (let i = 0; i < totalPixels; i++) {
      pixels.push(i);
    }

    // Shuffle pixels for random dissolve
    for (let i = pixels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
    }

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';

      const pixelsToShow = Math.floor(totalPixels * progress);

      for (let i = 0; i < pixelsToShow; i++) {
        const pixelIndex = pixels[i];
        const col = pixelIndex % cols;
        const row = Math.floor(pixelIndex / cols);
        const x = col * pixelSize;
        const y = row * pixelSize;

        ctx.fillRect(x, y, pixelSize, pixelSize);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        onComplete?.();
      }
    };

    animate();
  }, [isActive, pixelSize, duration, onComplete]);

  if (!isActive && !isAnimating) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pixel-dissolve-transition"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}
    />
  );
}

// ============================================
// TV STATIC TRANSITION
// ============================================

interface TVStaticTransitionProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
}

export function TVStaticTransition({ isActive, onComplete, duration = 800 }: TVStaticTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsAnimating(true);
    Sounds.ERROR();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        setIsAnimating(false);
        onComplete?.();
        return;
      }

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Generate static
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value; // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 255 * (1 - progress); // Fade out alpha
      }

      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(animate);
    };

    animate();
  }, [isActive, duration, onComplete]);

  if (!isActive && !isAnimating) return null;

  return (
    <canvas
      ref={canvasRef}
      className="tv-static-transition"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}
    />
  );
}

// ============================================
// SCANLINE WIPE TRANSITION
// ============================================

interface ScanlineWipeTransitionProps {
  isActive: boolean;
  onComplete?: () => void;
  direction?: 'down' | 'up';
  duration?: number;
}

export function ScanlineWipeTransition({
  isActive,
  onComplete,
  direction = 'down',
  duration = 1000,
}: ScanlineWipeTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    setIsAnimating(true);
    Sounds.MENU_NAVIGATE();

    const timer = setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration, onComplete]);

  if (!isActive && !isAnimating) return null;

  return (
    <div
      className={`scanline-wipe-transition scanline-wipe-transition--${direction}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
        animationDuration: `${duration}ms`,
      }}
    />
  );
}

// ============================================
// GLITCH TRANSITION
// ============================================

interface GlitchTransitionProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
}

export function GlitchTransition({ isActive, onComplete, duration = 600 }: GlitchTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    setIsAnimating(true);
    Sounds.ERROR();

    const timer = setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration, onComplete]);

  if (!isActive && !isAnimating) return null;

  return (
    <div
      className="glitch-transition"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
        animationDuration: `${duration}ms`,
      }}
    />
  );
}

// ============================================
// ROUTE TRANSITION WRAPPER
// ============================================

interface RouteTransitionProps {
  children: ReactNode;
  transitionType?: TransitionType;
  duration?: number;
  className?: string;
}

export function RouteTransition({
  children,
  transitionType = 'pixel-dissolve',
  duration = 1000,
  className = '',
}: RouteTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Start exit transition
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      // Update content
      setDisplayChildren(children);

      // Start enter transition
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, duration / 2);

    return () => clearTimeout(timer);
  }, [children, duration]);

  return (
    <div className={`route-transition ${className}`}>
      {transitionType === 'pixel-dissolve' && (
        <PixelDissolveTransition isActive={isTransitioning} duration={duration / 2} />
      )}
      {transitionType === 'tv-static' && (
        <TVStaticTransition isActive={isTransitioning} duration={duration / 2} />
      )}
      {transitionType === 'scanline-wipe' && (
        <ScanlineWipeTransition isActive={isTransitioning} duration={duration / 2} />
      )}
      {transitionType === 'glitch' && <GlitchTransition isActive={isTransitioning} duration={duration / 2} />}

      {displayChildren}
    </div>
  );
}

// ============================================
// TRANSITION HOOKS
// ============================================

export function usePageTransition(type: TransitionType = 'pixel-dissolve', duration: number = 1000) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = (callback?: () => void) => {
    setIsTransitioning(true);

    setTimeout(() => {
      callback?.();
      setIsTransitioning(false);
    }, duration);
  };

  return {
    isTransitioning,
    startTransition,
    transitionType: type,
    duration,
  };
}

export function useRouteTransition() {
  const [displayLocation, setDisplayLocation] = useState<string>('');
  const [transitionStage, setTransitionStage] = useState<'idle' | 'exiting' | 'entering'>('idle');

  const navigate = (to: string, callback?: () => void) => {
    setTransitionStage('exiting');

    setTimeout(() => {
      setDisplayLocation(to);
      callback?.();
      setTransitionStage('entering');

      setTimeout(() => {
        setTransitionStage('idle');
      }, 500);
    }, 500);
  };

  return {
    displayLocation,
    transitionStage,
    navigate,
    isTransitioning: transitionStage !== 'idle',
  };
}
