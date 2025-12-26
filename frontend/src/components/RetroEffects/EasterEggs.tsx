import { useEffect, useState, useCallback, useRef } from 'react';
import './EasterEggs.css';
import { Sounds } from '../../utils/soundSystem';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface EasterEgg {
  id: string;
  name: string;
  description: string;
  trigger: string; // sequence of keys
  unlocked: boolean;
  effect: () => void;
}

export type KonamiCodeCallback = () => void;

// ============================================
// KONAMI CODE HOOK
// ============================================

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export function useKonamiCode(onSuccess: KonamiCodeCallback) {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prevKeys) => {
        const newKeys = [...prevKeys, e.key];

        // Keep only the last 10 keys
        if (newKeys.length > KONAMI_CODE.length) {
          newKeys.shift();
        }

        // Check if Konami Code matches
        if (newKeys.length === KONAMI_CODE.length) {
          const matches = newKeys.every((key, index) => key === KONAMI_CODE[index]);

          if (matches) {
            Sounds.ACHIEVEMENT();
            onSuccess();
            return [];
          }
        }

        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSuccess]);

  return { keys, progress: (keys.length / KONAMI_CODE.length) * 100 };
}

// ============================================
// GENERIC KEY SEQUENCE DETECTOR HOOK
// ============================================

export function useKeySequence(sequence: string[], onSuccess: () => void) {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prevKeys) => {
        const newKeys = [...prevKeys, e.key.toLowerCase()];

        if (newKeys.length > sequence.length) {
          newKeys.shift();
        }

        if (newKeys.length === sequence.length) {
          const matches = newKeys.every((key, index) => key === sequence[index].toLowerCase());

          if (matches) {
            Sounds.POWER_UP();
            onSuccess();
            return [];
          }
        }

        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequence, onSuccess]);

  return { keys, progress: (keys.length / sequence.length) * 100 };
}

// ============================================
// EASTER EGG MANAGER HOOK
// ============================================

export function useEasterEggs() {
  const [unlockedEggs, setUnlockedEggs] = useState<Set<string>>(new Set());
  const [activeEffect, setActiveEffect] = useState<string | null>(null);

  const unlockEgg = useCallback((eggId: string) => {
    setUnlockedEggs((prev) => {
      const newSet = new Set(prev);
      newSet.add(eggId);
      return newSet;
    });

    // Store in localStorage
    const stored = localStorage.getItem('easterEggs');
    const eggs = stored ? JSON.parse(stored) : [];
    if (!eggs.includes(eggId)) {
      eggs.push(eggId);
      localStorage.setItem('easterEggs', JSON.stringify(eggs));
    }
  }, []);

  const activateEffect = useCallback((effectId: string, duration: number = 5000) => {
    setActiveEffect(effectId);
    setTimeout(() => setActiveEffect(null), duration);
  }, []);

  // Load unlocked eggs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('easterEggs');
    if (stored) {
      const eggs = JSON.parse(stored);
      setUnlockedEggs(new Set(eggs));
    }
  }, []);

  return {
    unlockedEggs,
    activeEffect,
    unlockEgg,
    activateEffect,
    isUnlocked: (eggId: string) => unlockedEggs.has(eggId),
  };
}

// ============================================
// FALLING COINS EFFECT
// ============================================

export function FallingCoinsEffect({ active = false }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    Sounds.COIN();

    interface Coin {
      x: number;
      y: number;
      speed: number;
      rotation: number;
      rotationSpeed: number;
      size: number;
    }

    const coins: Coin[] = [];
    for (let i = 0; i < 50; i++) {
      coins.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        speed: 2 + Math.random() * 4,
        rotation: 0,
        rotationSpeed: 0.05 + Math.random() * 0.1,
        size: 20 + Math.random() * 20,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      coins.forEach((coin) => {
        coin.y += coin.speed;
        coin.rotation += coin.rotationSpeed;

        if (coin.y > canvas.height + coin.size) {
          coin.y = -coin.size;
          coin.x = Math.random() * canvas.width;
        }

        const wobble = Math.abs(Math.sin(coin.rotation));

        ctx.save();
        ctx.translate(coin.x, coin.y);

        // Coin body
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(
          -coin.size * wobble * 0.5,
          -coin.size * 0.5,
          coin.size * wobble,
          coin.size
        );

        // Coin shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(
          -coin.size * wobble * 0.3,
          -coin.size * 0.3,
          coin.size * wobble * 0.2,
          coin.size * 0.4
        );

        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="falling-coins-effect"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9998,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
      }}
    />
  );
}

// ============================================
// MATRIX RAIN EFFECT
// ============================================

export function MatrixRainEffect({ active = false }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(0);

    const characters = '01☠️🏴‍☠️⚓🗡️💀🦜💰';

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px "Press Start 2P"`;

      for (let i = 0; i < drops.length; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain-effect"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    />
  );
}

// ============================================
// RAINBOW MODE EFFECT
// ============================================

export function RainbowModeEffect({ active = false }: { active: boolean }) {
  if (!active) return null;

  return (
    <div
      className="rainbow-mode-effect"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9997,
        pointerEvents: 'none',
        background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
        backgroundSize: '400% 400%',
        animation: 'rainbow-gradient 3s ease infinite',
        opacity: 0.3,
        mixBlendMode: 'overlay',
      }}
    />
  );
}

// ============================================
// PIRATE SHIP BATTLE EFFECT
// ============================================

export function PirateShipBattleEffect({ active = false }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    Sounds.CANNON();

    interface Cannonball {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }

    const cannonballs: Cannonball[] = [];

    const createCannonball = () => {
      cannonballs.push({
        x: Math.random() < 0.5 ? 0 : canvas.width,
        y: canvas.height * 0.7,
        vx: (Math.random() < 0.5 ? 1 : -1) * (5 + Math.random() * 5),
        vy: -5 - Math.random() * 5,
        size: 10 + Math.random() * 10,
      });

      if (Math.random() > 0.7) {
        Sounds.CANNON();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create new cannonballs
      if (Math.random() > 0.95) {
        createCannonball();
      }

      // Update and draw cannonballs
      for (let i = cannonballs.length - 1; i >= 0; i--) {
        const ball = cannonballs[i];

        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += 0.3; // Gravity

        // Draw cannonball
        ctx.fillStyle = '#2C2C2C';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw smoke trail
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Remove if out of bounds
        if (ball.y > canvas.height || ball.x < -100 || ball.x > canvas.width + 100) {
          cannonballs.splice(i, 1);

          // Create splash effect
          if (ball.y > canvas.height) {
            for (let j = 0; j < 5; j++) {
              ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
              ctx.beginPath();
              ctx.arc(
                ball.x + (Math.random() - 0.5) * 30,
                canvas.height - 10,
                5 + Math.random() * 10,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          }
        }
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pirate-ship-battle-effect"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9998,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
      }}
    />
  );
}

// ============================================
// DEBUG MODE INDICATOR
// ============================================

export function DebugModeIndicator({ active = false }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="debug-mode-indicator">
      <div className="debug-mode-indicator__content">
        <div className="debug-mode-indicator__icon">🔧</div>
        <div className="debug-mode-indicator__text">DEBUG MODE</div>
      </div>
      <div className="debug-mode-indicator__info">
        <div>FPS: {Math.round(performance.now() / 1000)} </div>
        <div>Memory: N/A</div>
      </div>
    </div>
  );
}

// ============================================
// SECRET MESSAGE COMPONENT
// ============================================

interface SecretMessageProps {
  message: string;
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}

export function SecretMessage({ message, active, duration = 5000, onComplete }: SecretMessageProps) {
  useEffect(() => {
    if (active) {
      Sounds.ACHIEVEMENT();
      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  if (!active) return null;

  return (
    <div className="secret-message">
      <div className="secret-message__border">
        <div className="secret-message__content">
          <div className="secret-message__icon">🏴‍☠️</div>
          <div className="secret-message__text">{message}</div>
          <div className="secret-message__icon">🏴‍☠️</div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EASTER EGG NOTIFICATION
// ============================================

interface EasterEggNotificationProps {
  eggName: string;
  active: boolean;
  onComplete?: () => void;
}

export function EasterEggNotification({ eggName, active, onComplete }: EasterEggNotificationProps) {
  useEffect(() => {
    if (active) {
      Sounds.ACHIEVEMENT();
      const timer = setTimeout(() => {
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="easter-egg-notification">
      <div className="easter-egg-notification__header">🥚 EASTER EGG FOUND! 🥚</div>
      <div className="easter-egg-notification__body">
        <div className="easter-egg-notification__icon">🎉</div>
        <div className="easter-egg-notification__name">{eggName}</div>
      </div>
    </div>
  );
}

// ============================================
// KONAMI CODE PROGRESS INDICATOR
// ============================================

interface KonamiCodeProgressProps {
  progress: number;
  show: boolean;
}

export function KonamiCodeProgress({ progress, show }: KonamiCodeProgressProps) {
  if (!show) return null;

  return (
    <div className="konami-code-progress">
      <div className="konami-code-progress__label">KONAMI CODE</div>
      <div className="konami-code-progress__bar">
        <div
          className="konami-code-progress__fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="konami-code-progress__text">{Math.round(progress)}%</div>
    </div>
  );
}
