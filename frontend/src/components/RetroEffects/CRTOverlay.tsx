import { useEffect, useState } from 'react';
import '../../styles/retro-effects.css';

interface CRTOverlayProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  enableScanlines?: boolean;
  enableCurvature?: boolean;
  enableGlow?: boolean;
  enableFlicker?: boolean;
  className?: string;
}

/**
 * CRT Monitor Effect Overlay Component
 * Adds authentic retro CRT screen effects to any content
 */
export function CRTOverlay({
  children,
  intensity = 'medium',
  enableScanlines = true,
  enableCurvature = true,
  enableGlow = true,
  enableFlicker = false,
  className = '',
}: CRTOverlayProps) {
  const [powerOn, setPowerOn] = useState(false);

  useEffect(() => {
    // Power-on animation on mount
    const timer = setTimeout(() => setPowerOn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const containerClasses = [
    'crt-container',
    enableCurvature && 'crt-screen',
    enableScanlines && (intensity === 'heavy' ? 'scanlines scanlines-heavy' : 'scanlines'),
    enableGlow && 'phosphor-glow',
    enableFlicker && 'crt-flicker',
    'screen-reflection',
    powerOn && 'power-on',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

/**
 * VHS Glitch Effect Component
 * Adds VHS tape-style distortion
 */
export function VHSGlitch({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`vhs-glitch ${className}`}>
      {children}
    </div>
  );
}

/**
 * TV Static Effect Component
 * Shows TV static noise (for loading/transitions)
 */
export function TVStatic({ active = false, className = '' }: { active?: boolean; className?: string }) {
  return (
    <div className={`tv-static ${active ? 'active' : ''} ${className}`} />
  );
}

/**
 * Screen Burn Effect Component
 * Adds CRT burn-in effect
 */
export function ScreenBurn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`screen-burn ${className}`}>
      {children}
    </div>
  );
}

/**
 * RGB Split Text Component
 * Adds chromatic aberration to text
 */
export function RGBSplitText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`rgb-split ${className}`} data-text={text}>
      {text}
    </span>
  );
}

/**
 * Power On/Off Animation Hook
 */
export function usePowerAnimation() {
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isPoweredOff, setIsPoweredOff] = useState(false);

  const powerOn = () => {
    setIsPoweredOff(false);
    setIsPoweredOn(true);
  };

  const powerOff = () => {
    setIsPoweredOn(false);
    setIsPoweredOff(true);
  };

  return {
    isPoweredOn,
    isPoweredOff,
    powerOn,
    powerOff,
    powerOnClass: isPoweredOn ? 'power-on' : '',
    powerOffClass: isPoweredOff ? 'power-off' : '',
  };
}
