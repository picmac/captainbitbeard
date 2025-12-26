import { useEffect, useRef } from 'react';
import './PixelBackground.css';

interface PixelBackgroundProps {
  className?: string;
}

/**
 * Animated Ocean Waves Background
 */
export function OceanWaves({ className = '' }: PixelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Wave colors (pirate ocean theme)
    const colors = ['#1E3A8A', '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA'];
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw multiple wave layers
      for (let layer = 0; layer < 5; layer++) {
        ctx.fillStyle = colors[layer];
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 4) {
          const y =
            canvas.height * 0.6 +
            Math.sin((x + frame * 2 + layer * 100) * 0.01) * 20 +
            Math.sin((x + frame * 3 + layer * 50) * 0.005) * 15 +
            layer * 30;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
      }

      frame++;
      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className={`pixel-background ocean-waves ${className}`} />;
}

/**
 * Animated Clouds Background
 */
export function FloatingClouds({ className = '' }: PixelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Cloud particles
    interface Cloud {
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
    }

    const clouds: Cloud[] = [];
    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        width: 40 + Math.random() * 80,
        height: 20 + Math.random() * 30,
        speed: 0.2 + Math.random() * 0.5,
      });
    }

    const drawCloud = (cloud: Cloud) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

      // Simple pixelated cloud shape
      const pixelSize = 4;
      for (let x = 0; x < cloud.width; x += pixelSize) {
        for (let y = 0; y < cloud.height; y += pixelSize) {
          const distance = Math.sqrt(
            Math.pow(x - cloud.width / 2, 2) + Math.pow(y - cloud.height / 2, 2)
          );
          if (distance < cloud.width / 2) {
            ctx.fillRect(cloud.x + x, cloud.y + y, pixelSize, pixelSize);
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      clouds.forEach((cloud) => {
        drawCloud(cloud);
        cloud.x += cloud.speed;

        if (cloud.x > canvas.width + cloud.width) {
          cloud.x = -cloud.width;
          cloud.y = Math.random() * canvas.height * 0.5;
        }
      });

      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className={`pixel-background floating-clouds ${className}`} />;
}

/**
 * Sailing Pirate Ship
 */
export function PirateShip({ className = '' }: PixelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    let shipX = -100;
    const shipY = canvas.height * 0.4;
    const shipSpeed = 0.5;
    let bobOffset = 0;

    const drawShip = (x: number, y: number) => {
      // Ship body (simplified pixel art)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x, y, 80, 40);
      ctx.fillRect(x + 10, y + 40, 60, 20);

      // Sails
      ctx.fillStyle = '#F5F5DC';
      ctx.fillRect(x + 30, y - 40, 20, 40);
      ctx.fillRect(x + 35, y - 60, 10, 20);

      // Mast
      ctx.fillStyle = '#654321';
      ctx.fillRect(x + 38, y - 60, 4, 80);

      // Flag
      ctx.fillStyle = '#DC143C';
      ctx.fillRect(x + 42, y - 60, 20, 12);

      // Skull on flag
      ctx.fillStyle = '#FFF';
      ctx.fillRect(x + 48, y - 56, 8, 8);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Bob motion
      bobOffset = Math.sin(Date.now() * 0.002) * 8;

      drawShip(shipX, shipY + bobOffset);

      shipX += shipSpeed;

      if (shipX > canvas.width + 100) {
        shipX = -100;
      }

      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className={`pixel-background pirate-ship ${className}`} />;
}

/**
 * Falling Coins Animation
 */
export function FallingCoins({ active = false, className = '' }: PixelBackgroundProps & { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    interface Coin {
      x: number;
      y: number;
      speed: number;
      rotation: number;
      rotationSpeed: number;
    }

    const coins: Coin[] = [];
    for (let i = 0; i < 30; i++) {
      coins.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        speed: 2 + Math.random() * 3,
        rotation: 0,
        rotationSpeed: 0.05 + Math.random() * 0.1,
      });
    }

    const drawCoin = (coin: Coin) => {
      const size = 16;
      const wobble = Math.abs(Math.sin(coin.rotation));

      ctx.save();
      ctx.translate(coin.x, coin.y);

      // Coin body
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-size * wobble * 0.5, -size * 0.5, size * wobble, size);

      // Coin shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(-size * wobble * 0.3, -size * 0.3, size * wobble * 0.2, size * 0.4);

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      coins.forEach((coin) => {
        drawCoin(coin);

        coin.y += coin.speed;
        coin.rotation += coin.rotationSpeed;

        if (coin.y > canvas.height + 20) {
          coin.y = -20;
          coin.x = Math.random() * canvas.width;
        }
      });

      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [active]);

  if (!active) return null;

  return <canvas ref={canvasRef} className={`pixel-background falling-coins ${className}`} />;
}

/**
 * Starry Night Sky
 */
export function StarrySky({ className = '' }: PixelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    interface Star {
      x: number;
      y: number;
      size: number;
      brightness: number;
      twinkleSpeed: number;
    }

    const stars: Star[] = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() < 0.3 ? 4 : 2,
        brightness: Math.random(),
        twinkleSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.brightness += star.twinkleSpeed;
        if (star.brightness > 1 || star.brightness < 0.3) {
          star.twinkleSpeed *= -1;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className={`pixel-background starry-sky ${className}`} />;
}

/**
 * Combined Pirate Scene
 */
export function PirateScene({ className = '' }: PixelBackgroundProps) {
  return (
    <div className={`pirate-scene ${className}`}>
      <StarrySky className="layer layer-sky" />
      <FloatingClouds className="layer layer-clouds" />
      <OceanWaves className="layer layer-ocean" />
      <PirateShip className="layer layer-ship" />
    </div>
  );
}
