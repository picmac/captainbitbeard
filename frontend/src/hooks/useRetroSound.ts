import { useCallback, useEffect, useState } from 'react';
import { soundSystem, Sounds } from '../utils/soundSystem';

/**
 * Hook for playing retro sounds
 */
export function useRetroSound() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);

  const toggleMute = useCallback(() => {
    const newMuteState = soundSystem.toggleMute();
    setIsMuted(newMuteState);
    return newMuteState;
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    soundSystem.setVolume(newVolume);
    setVolume(newVolume);
  }, []);

  return {
    ...Sounds,
    isMuted,
    volume,
    toggleMute,
    setVolume: changeVolume,
  };
}

/**
 * Hook for button click sounds
 */
export function useButtonSound(soundType: keyof typeof Sounds = 'MENU_SELECT') {
  const sound = Sounds[soundType];

  const playSound = useCallback(() => {
    sound();
  }, [sound]);

  return playSound;
}

/**
 * Hook for menu navigation sounds
 */
export function useMenuSounds() {
  const playNavigate = useCallback(() => {
    Sounds.MENU_NAVIGATE();
  }, []);

  const playSelect = useCallback(() => {
    Sounds.MENU_SELECT();
  }, []);

  const playBack = useCallback(() => {
    Sounds.ERROR();
  }, []);

  return {
    playNavigate,
    playSelect,
    playBack,
  };
}

/**
 * Hook for game sounds
 */
export function useGameSounds() {
  const playCollect = useCallback(() => {
    Sounds.COIN();
  }, []);

  const playPowerUp = useCallback(() => {
    Sounds.POWER_UP();
  }, []);

  const playAchievement = useCallback(() => {
    Sounds.ACHIEVEMENT();
  }, []);

  const playLevelUp = useCallback(() => {
    Sounds.LEVEL_UP();
  }, []);

  const playVictory = useCallback(() => {
    Sounds.VICTORY();
  }, []);

  const playDamage = useCallback(() => {
    Sounds.ERROR();
  }, []);

  return {
    playCollect,
    playPowerUp,
    playAchievement,
    playLevelUp,
    playVictory,
    playDamage,
  };
}

/**
 * Hook to play sound on keyboard events
 */
export function useKeyboardSounds(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        Sounds.MENU_SELECT();
      } else if (e.key === 'Escape') {
        Sounds.ERROR();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        Sounds.MENU_NAVIGATE();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}

/**
 * Hook to play hover sounds on elements
 */
export function useHoverSound(soundType: keyof typeof Sounds = 'MENU_NAVIGATE') {
  const sound = Sounds[soundType];

  const onMouseEnter = useCallback(() => {
    sound();
  }, [sound]);

  return { onMouseEnter };
}
