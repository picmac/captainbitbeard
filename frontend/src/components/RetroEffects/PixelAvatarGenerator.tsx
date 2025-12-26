import { useEffect, useRef, useState } from 'react';
import './PixelAvatarGenerator.css';
import { Sounds } from '../../utils/soundSystem';

// Avatar customization options
export interface AvatarConfig {
  skinTone: 'light' | 'tan' | 'dark' | 'pale';
  beardStyle: 'none' | 'full' | 'goatee' | 'braided' | 'long' | 'scruffy';
  beardColor: 'black' | 'brown' | 'red' | 'blonde' | 'gray' | 'white';
  eyePatch: 'none' | 'left' | 'right';
  hat: 'none' | 'captain' | 'tricorne' | 'bandana' | 'sailor';
  parrot: boolean;
  scar: 'none' | 'left-eye' | 'right-eye' | 'cheek';
  tattoo: 'none' | 'anchor' | 'skull' | 'crossbones';
}

interface PixelAvatarGeneratorProps {
  initialConfig?: Partial<AvatarConfig>;
  size?: number;
  onConfigChange?: (config: AvatarConfig) => void;
  className?: string;
}

const defaultConfig: AvatarConfig = {
  skinTone: 'tan',
  beardStyle: 'full',
  beardColor: 'brown',
  eyePatch: 'none',
  hat: 'captain',
  parrot: true,
  scar: 'none',
  tattoo: 'none',
};

// Color palettes
const SKIN_COLORS = {
  light: '#FFD1B3',
  tan: '#E0AC69',
  dark: '#8B5A3C',
  pale: '#F5E6D3',
};

const HAIR_COLORS = {
  black: '#1A1A1A',
  brown: '#5C3317',
  red: '#8B2500',
  blonde: '#DAA520',
  gray: '#808080',
  white: '#E8E8E8',
};

const HAT_COLORS = {
  captain: { primary: '#1E3A8A', accent: '#FFD700' },
  tricorne: { primary: '#2C1810', accent: '#654321' },
  bandana: { primary: '#DC143C', accent: '#8B0000' },
  sailor: { primary: '#FFFFFF', accent: '#1E3A8A' },
};

/**
 * Pixel Avatar Generator Component
 */
export function PixelAvatarGenerator({
  initialConfig,
  size = 256,
  onConfigChange,
  className = '',
}: PixelAvatarGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<AvatarConfig>({
    ...defaultConfig,
    ...initialConfig,
  });

  // Update config and notify parent
  const updateConfig = (updates: Partial<AvatarConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
    Sounds.MENU_NAVIGATE();
  };

  // Randomize avatar
  const randomize = () => {
    const skinTones: AvatarConfig['skinTone'][] = ['light', 'tan', 'dark', 'pale'];
    const beardStyles: AvatarConfig['beardStyle'][] = ['none', 'full', 'goatee', 'braided', 'long', 'scruffy'];
    const beardColors: AvatarConfig['beardColor'][] = ['black', 'brown', 'red', 'blonde', 'gray', 'white'];
    const eyePatches: AvatarConfig['eyePatch'][] = ['none', 'left', 'right'];
    const hats: AvatarConfig['hat'][] = ['none', 'captain', 'tricorne', 'bandana', 'sailor'];
    const scars: AvatarConfig['scar'][] = ['none', 'left-eye', 'right-eye', 'cheek'];
    const tattoos: AvatarConfig['tattoo'][] = ['none', 'anchor', 'skull', 'crossbones'];

    const newConfig: AvatarConfig = {
      skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
      beardStyle: beardStyles[Math.floor(Math.random() * beardStyles.length)],
      beardColor: beardColors[Math.floor(Math.random() * beardColors.length)],
      eyePatch: eyePatches[Math.floor(Math.random() * eyePatches.length)],
      hat: hats[Math.floor(Math.random() * hats.length)],
      parrot: Math.random() > 0.5,
      scar: scars[Math.floor(Math.random() * scars.length)],
      tattoo: tattoos[Math.floor(Math.random() * tattoos.length)],
    };

    setConfig(newConfig);
    onConfigChange?.(newConfig);
    Sounds.ACHIEVEMENT();
  };

  // Export avatar as PNG
  const exportAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `captain-bitbeard-avatar-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    Sounds.COIN();
  };

  // Draw avatar on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Disable image smoothing for pixelated effect
    ctx.imageSmoothingEnabled = false;

    const pixelSize = size / 32; // 32x32 pixel grid

    // Helper function to draw a pixel
    const drawPixel = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    };

    // Helper function to draw a rectangle
    const drawRect = (x: number, y: number, width: number, height: number, color: string) => {
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          drawPixel(x + i, y + j, color);
        }
      }
    };

    const skinColor = SKIN_COLORS[config.skinTone];
    const hairColor = HAIR_COLORS[config.beardColor];

    // Draw background (transparent)
    // No background needed for avatar

    // Draw neck
    drawRect(13, 26, 6, 6, skinColor);

    // Draw head (oval shape)
    drawRect(11, 10, 10, 16, skinColor);
    drawRect(10, 12, 12, 12, skinColor);

    // Draw ears
    drawPixel(10, 16, skinColor);
    drawPixel(10, 17, skinColor);
    drawPixel(21, 16, skinColor);
    drawPixel(21, 17, skinColor);

    // Draw eyes
    if (config.eyePatch !== 'left') {
      drawRect(13, 15, 2, 2, '#FFFFFF');
      drawPixel(14, 16, '#000000');
    }
    if (config.eyePatch !== 'right') {
      drawRect(17, 15, 2, 2, '#FFFFFF');
      drawPixel(17, 16, '#000000');
    }

    // Draw eye patch
    if (config.eyePatch === 'left') {
      drawRect(12, 14, 3, 3, '#1A1A1A');
      drawPixel(11, 14, '#654321');
      drawPixel(15, 14, '#654321');
    } else if (config.eyePatch === 'right') {
      drawRect(17, 14, 3, 3, '#1A1A1A');
      drawPixel(16, 14, '#654321');
      drawPixel(20, 14, '#654321');
    }

    // Draw nose
    drawRect(15, 18, 2, 3, skinColor);
    drawPixel(15, 20, '#D2691E');
    drawPixel(16, 20, '#D2691E');

    // Draw mouth
    drawRect(14, 22, 4, 1, '#8B4513');

    // Draw beard
    if (config.beardStyle === 'full') {
      drawRect(11, 23, 10, 5, hairColor);
      drawRect(10, 24, 12, 3, hairColor);
    } else if (config.beardStyle === 'goatee') {
      drawRect(14, 23, 4, 4, hairColor);
      drawRect(13, 25, 6, 2, hairColor);
    } else if (config.beardStyle === 'braided') {
      drawRect(12, 23, 8, 3, hairColor);
      drawRect(13, 26, 2, 3, hairColor);
      drawRect(17, 26, 2, 3, hairColor);
    } else if (config.beardStyle === 'long') {
      drawRect(11, 23, 10, 7, hairColor);
      drawRect(10, 24, 12, 5, hairColor);
    } else if (config.beardStyle === 'scruffy') {
      drawPixel(11, 23, hairColor);
      drawPixel(13, 23, hairColor);
      drawPixel(15, 23, hairColor);
      drawPixel(17, 23, hairColor);
      drawPixel(19, 23, hairColor);
      drawRect(12, 24, 8, 2, hairColor);
    }

    // Draw scar
    if (config.scar === 'left-eye') {
      drawPixel(13, 13, '#8B4513');
      drawPixel(14, 14, '#8B4513');
      drawPixel(14, 15, '#8B4513');
      drawPixel(14, 16, '#8B4513');
    } else if (config.scar === 'right-eye') {
      drawPixel(18, 13, '#8B4513');
      drawPixel(17, 14, '#8B4513');
      drawPixel(17, 15, '#8B4513');
      drawPixel(17, 16, '#8B4513');
    } else if (config.scar === 'cheek') {
      drawPixel(19, 19, '#8B4513');
      drawPixel(20, 20, '#8B4513');
      drawPixel(20, 21, '#8B4513');
    }

    // Draw hat
    if (config.hat === 'captain') {
      const hatColor = HAT_COLORS.captain;
      drawRect(10, 8, 12, 2, hatColor.primary);
      drawRect(11, 6, 10, 2, hatColor.primary);
      drawRect(12, 4, 8, 2, hatColor.primary);
      // Gold trim
      drawRect(10, 9, 12, 1, hatColor.accent);
      // Feather
      drawPixel(17, 4, '#FF0000');
      drawPixel(18, 3, '#FF0000');
      drawPixel(19, 2, '#FF0000');
    } else if (config.hat === 'tricorne') {
      const hatColor = HAT_COLORS.tricorne;
      drawRect(9, 8, 14, 2, hatColor.primary);
      drawRect(8, 6, 16, 2, hatColor.primary);
      drawPixel(7, 7, hatColor.primary);
      drawPixel(24, 7, hatColor.primary);
    } else if (config.hat === 'bandana') {
      const hatColor = HAT_COLORS.bandana;
      drawRect(11, 9, 10, 2, hatColor.primary);
      drawRect(10, 11, 12, 1, hatColor.primary);
      // Knot
      drawPixel(22, 10, hatColor.primary);
      drawPixel(23, 10, hatColor.primary);
      drawPixel(22, 11, hatColor.primary);
      drawPixel(23, 11, hatColor.primary);
    } else if (config.hat === 'sailor') {
      const hatColor = HAT_COLORS.sailor;
      drawRect(11, 8, 10, 3, hatColor.primary);
      drawRect(10, 10, 12, 1, hatColor.primary);
      // Blue stripe
      drawRect(11, 9, 10, 1, hatColor.accent);
    }

    // Draw parrot on shoulder
    if (config.parrot) {
      // Parrot body (red)
      drawRect(22, 24, 3, 4, '#DC143C');
      // Parrot wing (darker)
      drawRect(23, 25, 2, 2, '#8B0000');
      // Parrot head
      drawRect(24, 23, 2, 2, '#DC143C');
      // Beak (yellow)
      drawPixel(26, 24, '#FFD700');
      // Eye
      drawPixel(25, 23, '#000000');
      // Tail
      drawPixel(22, 28, '#1E90FF');
      drawPixel(21, 29, '#1E90FF');
    }

    // Draw tattoo on arm/chest
    if (config.tattoo === 'anchor') {
      drawPixel(8, 28, '#1A1A1A');
      drawRect(7, 29, 3, 2, '#1A1A1A');
      drawPixel(8, 31, '#1A1A1A');
    } else if (config.tattoo === 'skull') {
      drawRect(7, 28, 3, 3, '#1A1A1A');
      drawPixel(7, 29, '#FFD700');
      drawPixel(9, 29, '#FFD700');
    } else if (config.tattoo === 'crossbones') {
      drawPixel(7, 29, '#1A1A1A');
      drawPixel(9, 29, '#1A1A1A');
      drawRect(6, 30, 5, 1, '#1A1A1A');
    }
  }, [config, size]);

  return (
    <div className={`pixel-avatar-generator ${className}`}>
      <div className="pixel-avatar-generator__preview">
        <canvas ref={canvasRef} className="pixel-avatar-generator__canvas" />
      </div>

      <div className="pixel-avatar-generator__controls">
        <div className="pixel-avatar-generator__section">
          <h3 className="pixel-avatar-generator__section-title">APPEARANCE</h3>

          <div className="pixel-avatar-generator__control">
            <label>Skin Tone:</label>
            <select value={config.skinTone} onChange={(e) => updateConfig({ skinTone: e.target.value as any })}>
              <option value="pale">Pale</option>
              <option value="light">Light</option>
              <option value="tan">Tan</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="pixel-avatar-generator__control">
            <label>Beard Style:</label>
            <select value={config.beardStyle} onChange={(e) => updateConfig({ beardStyle: e.target.value as any })}>
              <option value="none">Clean Shaven</option>
              <option value="scruffy">Scruffy</option>
              <option value="goatee">Goatee</option>
              <option value="full">Full Beard</option>
              <option value="braided">Braided</option>
              <option value="long">Long Beard</option>
            </select>
          </div>

          <div className="pixel-avatar-generator__control">
            <label>Beard Color:</label>
            <select
              value={config.beardColor}
              onChange={(e) => updateConfig({ beardColor: e.target.value as any })}
              disabled={config.beardStyle === 'none'}
            >
              <option value="black">Black</option>
              <option value="brown">Brown</option>
              <option value="red">Red</option>
              <option value="blonde">Blonde</option>
              <option value="gray">Gray</option>
              <option value="white">White</option>
            </select>
          </div>
        </div>

        <div className="pixel-avatar-generator__section">
          <h3 className="pixel-avatar-generator__section-title">PIRATE GEAR</h3>

          <div className="pixel-avatar-generator__control">
            <label>Hat:</label>
            <select value={config.hat} onChange={(e) => updateConfig({ hat: e.target.value as any })}>
              <option value="none">No Hat</option>
              <option value="captain">Captain Hat</option>
              <option value="tricorne">Tricorne</option>
              <option value="bandana">Bandana</option>
              <option value="sailor">Sailor Cap</option>
            </select>
          </div>

          <div className="pixel-avatar-generator__control">
            <label>Eye Patch:</label>
            <select value={config.eyePatch} onChange={(e) => updateConfig({ eyePatch: e.target.value as any })}>
              <option value="none">No Patch</option>
              <option value="left">Left Eye</option>
              <option value="right">Right Eye</option>
            </select>
          </div>

          <div className="pixel-avatar-generator__control">
            <label>
              <input
                type="checkbox"
                checked={config.parrot}
                onChange={(e) => updateConfig({ parrot: e.target.checked })}
              />
              Shoulder Parrot
            </label>
          </div>
        </div>

        <div className="pixel-avatar-generator__section">
          <h3 className="pixel-avatar-generator__section-title">BATTLE SCARS</h3>

          <div className="pixel-avatar-generator__control">
            <label>Scar:</label>
            <select value={config.scar} onChange={(e) => updateConfig({ scar: e.target.value as any })}>
              <option value="none">No Scar</option>
              <option value="left-eye">Left Eye Scar</option>
              <option value="right-eye">Right Eye Scar</option>
              <option value="cheek">Cheek Scar</option>
            </select>
          </div>

          <div className="pixel-avatar-generator__control">
            <label>Tattoo:</label>
            <select value={config.tattoo} onChange={(e) => updateConfig({ tattoo: e.target.value as any })}>
              <option value="none">No Tattoo</option>
              <option value="anchor">Anchor</option>
              <option value="skull">Skull</option>
              <option value="crossbones">Crossbones</option>
            </select>
          </div>
        </div>

        <div className="pixel-avatar-generator__actions">
          <button onClick={randomize} className="pixel-avatar-generator__button pixel-avatar-generator__button--random">
            🎲 RANDOMIZE
          </button>
          <button onClick={exportAvatar} className="pixel-avatar-generator__button pixel-avatar-generator__button--export">
            💾 EXPORT PNG
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Simplified Avatar Display (read-only)
 */
interface PixelAvatarProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
}

export function PixelAvatar({ config, size = 64, className = '' }: PixelAvatarProps) {
  return (
    <PixelAvatarGenerator
      initialConfig={config}
      size={size}
      className={`pixel-avatar-readonly ${className}`}
    />
  );
}
