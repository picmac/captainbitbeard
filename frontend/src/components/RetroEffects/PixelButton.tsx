import { ButtonHTMLAttributes, useState } from 'react';
import '../../styles/retro-effects.css';
import './PixelButton.css';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'treasure' | 'danger' | 'wood' | 'gold' | 'skull';
  size?: 'sm' | 'md' | 'lg';
  pixelated?: boolean;
  glowing?: boolean;
  animated?: boolean;
  children: React.ReactNode;
}

/**
 * Retro Pixel Art Button Component
 * Pirate-themed buttons with awesome animations
 */
export function PixelButton({
  variant = 'treasure',
  size = 'md',
  pixelated = true,
  glowing = false,
  animated = true,
  className = '',
  children,
  onClick,
  ...props
}: PixelButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animated) {
      setIsPressed(true);
      setShowParticles(true);

      setTimeout(() => setIsPressed(false), 200);
      setTimeout(() => setShowParticles(false), 600);
    }

    onClick?.(e);
  };

  const buttonClasses = [
    'pixel-button',
    `pixel-button--${variant}`,
    `pixel-button--${size}`,
    pixelated && 'pixel-grid',
    glowing && 'pixel-text-glow',
    animated && 'pixel-button--animated',
    isPressed && 'pixel-button--pressed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={buttonClasses} onClick={handleClick} {...props}>
      <span className="pixel-button__content">
        {children}
      </span>

      {showParticles && (
        <span className="pixel-button__particles">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="pixel-button__particle" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </span>
      )}

      <span className="pixel-button__shine" />
    </button>
  );
}

/**
 * Treasure Chest Button
 * Opens like a chest on click
 */
export function TreasureChestButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(true);
    setTimeout(() => setIsOpen(false), 800);
    props.onClick?.(e);
  };

  return (
    <button className={`treasure-chest-button ${isOpen ? 'open' : ''} ${className}`} onClick={handleClick} {...props}>
      <div className="treasure-chest-button__lid">
        <div className="treasure-chest-button__lock">🔒</div>
      </div>
      <div className="treasure-chest-button__body">
        <div className="treasure-chest-button__content">
          {children}
        </div>
        {isOpen && (
          <div className="treasure-chest-button__coins">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="coin" style={{ '--i': i } as React.CSSProperties}>
                🪙
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

/**
 * Cannon Button
 * Fires with smoke effect on click
 */
export function CannonButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const [isFiring, setIsFiring] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsFiring(true);
    setTimeout(() => setIsFiring(false), 600);
    props.onClick?.(e);
  };

  return (
    <button className={`cannon-button ${isFiring ? 'firing' : ''} ${className}`} onClick={handleClick} {...props}>
      <div className="cannon-button__cannon">⚔️</div>
      <div className="cannon-button__content">{children}</div>
      {isFiring && (
        <>
          <div className="cannon-button__smoke" />
          <div className="cannon-button__flash">💥</div>
        </>
      )}
    </button>
  );
}

/**
 * Floating Ship Button
 * Gently rocks like a ship on waves
 */
export function ShipButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`ship-button ${className}`} {...props}>
      <div className="ship-button__ship">
        <div className="ship-button__sails">⛵</div>
        <div className="ship-button__content">{children}</div>
      </div>
      <div className="ship-button__waves">
        <span className="wave wave-1">~</span>
        <span className="wave wave-2">~</span>
        <span className="wave wave-3">~</span>
      </div>
    </button>
  );
}

/**
 * Skull Button
 * Eyes glow on hover
 */
export function SkullButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`skull-button ${className}`} {...props}>
      <div className="skull-button__skull">
        💀
        <div className="skull-button__eyes">
          <span className="eye eye-left">👁️</span>
          <span className="eye eye-right">👁️</span>
        </div>
      </div>
      <div className="skull-button__content">{children}</div>
    </button>
  );
}
