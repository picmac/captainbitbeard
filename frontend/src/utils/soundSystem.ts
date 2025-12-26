/**
 * Retro 8-bit Sound System
 * Generates authentic retro game sounds using Web Audio API
 */

class RetroSoundSystem {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.3;
  private isMuted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }
    return this.audioContext;
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Mute/Unmute all sounds
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Play a simple beep tone
   */
  playBeep(frequency = 440, duration = 0.1) {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  /**
   * Coin pickup sound (Super Mario style)
   */
  playCoin() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';

    // Musical sequence for coin sound
    oscillator.frequency.setValueAtTime(988, ctx.currentTime); // B5
    oscillator.frequency.setValueAtTime(1319, ctx.currentTime + 0.05); // E6

    gainNode.gain.setValueAtTime(this.masterVolume * 0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }

  /**
   * Power-up sound (item collected)
   */
  playPowerUp() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';

    // Ascending arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
    });

    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }

  /**
   * Achievement unlocked sound (Zelda treasure chest style)
   */
  playAchievement() {
    if (this.isMuted) return;

    const ctx = this.getContext();

    // Main melody
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'square';
      oscillator.frequency.value = frequency;

      gainNode.gain.setValueAtTime(this.masterVolume * 0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Zelda treasure jingle
    const now = ctx.currentTime;
    playNote(784, now, 0.15); // G5
    playNote(988, now + 0.15, 0.15); // B5
    playNote(1175, now + 0.3, 0.15); // D6
    playNote(1568, now + 0.45, 0.5); // G6
  }

  /**
   * Error/damage sound
   */
  playError() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';

    // Descending pitch for error
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }

  /**
   * Jump sound
   */
  playJump() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';

    // Quick rising pitch
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }

  /**
   * Cannon fire sound
   */
  playCannon() {
    if (this.isMuted) return;

    const ctx = this.getContext();

    // Low boom
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  }

  /**
   * Menu select sound
   */
  playMenuSelect() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.value = 600;

    gainNode.gain.setValueAtTime(this.masterVolume * 0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  }

  /**
   * Menu navigate sound (cursor move)
   */
  playMenuNavigate() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.value = 400;

    gainNode.gain.setValueAtTime(this.masterVolume * 0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }

  /**
   * Treasure chest opening sound
   */
  playTreasureOpen() {
    if (this.isMuted) return;

    const ctx = this.getContext();

    // Creaking sound (low frequency modulation)
    const playCreak = (startTime: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sawtooth';
      lfo.type = 'sine';

      oscillator.frequency.value = 200;
      lfo.frequency.value = 10;
      lfoGain.gain.value = 50;

      gainNode.gain.setValueAtTime(this.masterVolume * 0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      lfo.start(startTime);
      oscillator.stop(startTime + 0.3);
      lfo.stop(startTime + 0.3);
    };

    playCreak(ctx.currentTime);
  }

  /**
   * Victory fanfare (short)
   */
  playVictory() {
    if (this.isMuted) return;

    const ctx = this.getContext();

    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'square';
      oscillator.frequency.value = frequency;

      gainNode.gain.setValueAtTime(this.masterVolume * 0.25, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Victory melody
    const now = ctx.currentTime;
    playNote(523, now, 0.15); // C5
    playNote(659, now + 0.15, 0.15); // E5
    playNote(784, now + 0.3, 0.15); // G5
    playNote(1047, now + 0.45, 0.4); // C6
  }

  /**
   * Level up sound
   */
  playLevelUp() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';

    // Rising spiral
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    for (let i = 1; i <= 8; i++) {
      oscillator.frequency.setValueAtTime(200 * (1 + i * 0.2), ctx.currentTime + i * 0.05);
    }

    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.6);
  }

  /**
   * Explosion sound
   */
  playExplosion() {
    if (this.isMuted) return;

    const ctx = this.getContext();

    // White noise for explosion
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    noise.buffer = buffer;
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.5);
  }
}

// Singleton instance
export const soundSystem = new RetroSoundSystem();

// Sound presets for easy access
export const Sounds = {
  BEEP: () => soundSystem.playBeep(),
  COIN: () => soundSystem.playCoin(),
  POWER_UP: () => soundSystem.playPowerUp(),
  ACHIEVEMENT: () => soundSystem.playAchievement(),
  ERROR: () => soundSystem.playError(),
  JUMP: () => soundSystem.playJump(),
  CANNON: () => soundSystem.playCannon(),
  MENU_SELECT: () => soundSystem.playMenuSelect(),
  MENU_NAVIGATE: () => soundSystem.playMenuNavigate(),
  TREASURE_OPEN: () => soundSystem.playTreasureOpen(),
  VICTORY: () => soundSystem.playVictory(),
  LEVEL_UP: () => soundSystem.playLevelUp(),
  EXPLOSION: () => soundSystem.playExplosion(),
};

export default soundSystem;
