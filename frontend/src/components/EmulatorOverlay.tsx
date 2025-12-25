import { useState, useEffect } from 'react';

interface EmulatorOverlayProps {
  onSave: () => void;
  onLoad: () => void;
  onQuickSave: (slot: number) => void;
  onQuickLoad: (slot: number) => void;
  onScreenshot: () => void;
  onFullscreen: () => void;
  onExit: () => void;
  isFullscreen: boolean;
  emulatorReady: boolean;
}

export function EmulatorOverlay({
  onSave,
  onLoad,
  onQuickSave,
  onQuickLoad,
  onScreenshot,
  onFullscreen,
  onExit,
  isFullscreen,
  emulatorReady,
}: EmulatorOverlayProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showFPS, setShowFPS] = useState(false);
  const [fps, setFPS] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [hideControls, setHideControls] = useState(false);
  const [idleTimer, setIdleTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const resetTimer = () => {
      setHideControls(false);
      if (idleTimer) clearTimeout(idleTimer);
      const timer = setTimeout(() => setHideControls(true), 3000);
      setIdleTimer(timer);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [idleTimer]);

  // FPS Counter simulation
  useEffect(() => {
    if (!showFPS) return;
    const interval = setInterval(() => {
      setFPS(Math.floor(58 + Math.random() * 4)); // Simulate 58-62 FPS
    }, 500);
    return () => clearInterval(interval);
  }, [showFPS]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't intercept if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Quick Save/Load shortcuts (F5-F8)
      if (e.key === 'F5' || e.key === 'F6' || e.key === 'F7' || e.key === 'F8') {
        e.preventDefault();
        const slot = parseInt(e.key.substring(1)) - 4; // F5=slot1, F6=slot2, F7=slot3, F8=slot4
        if (e.shiftKey) {
          onQuickLoad(slot);
        } else {
          onQuickSave(slot);
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          if (e.ctrlKey) {
            e.preventDefault();
            onFullscreen();
          }
          break;
        case 's':
          if (e.ctrlKey) {
            e.preventDefault();
            onSave();
          }
          break;
        case 'l':
          if (e.ctrlKey) {
            e.preventDefault();
            onLoad();
          }
          break;
        case 'p':
          if (e.ctrlKey) {
            e.preventDefault();
            onScreenshot();
          }
          break;
        case 'escape':
          if (showMenu) {
            setShowMenu(false);
          } else if (isFullscreen) {
            onFullscreen();
          }
          break;
        case 'm':
          e.preventDefault();
          setShowMenu(!showMenu);
          break;
        case 'h':
          e.preventDefault();
          setShowHotkeys(!showHotkeys);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showMenu, showHotkeys, isFullscreen, onFullscreen, onSave, onLoad, onQuickSave, onQuickLoad, onScreenshot]);

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (window.EJS_emulator?.audio) {
      window.EJS_emulator.audio.volume = newVolume / 100;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(volume || 80);
    } else {
      handleVolumeChange(0);
    }
  };

  return (
    <>
      {/* Top Bar - Auto-hide */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          hideControls && !showMenu ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="bg-gradient-to-b from-black/90 to-transparent p-3">
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={onExit}
                className="flex items-center gap-1 border-2 border-blood-red bg-blood-red/90 px-3 py-1.5 text-xs text-skull-white hover:bg-blood-red transition-colors"
                title="Exit (ESC)"
              >
                <span>←</span>
                <span className="hidden sm:inline">EXIT</span>
              </button>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1 border-2 border-pirate-gold bg-pirate-gold/90 px-3 py-1.5 text-xs text-ocean-dark hover:bg-pirate-gold transition-colors"
                title="Menu (M)"
              >
                <span>☰</span>
                <span className="hidden sm:inline">MENU</span>
              </button>
            </div>

            {/* Center Info */}
            <div className="flex items-center gap-3">
              {showFPS && (
                <div className="border-2 border-treasure-green bg-treasure-green/90 px-2 py-1 text-xs text-ocean-dark font-bold">
                  {fps} FPS
                </div>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHotkeys(!showHotkeys)}
                className="border-2 border-sand-beige bg-sand-beige/90 px-3 py-1.5 text-xs text-ocean-dark hover:bg-sand-beige transition-colors"
                title="Hotkeys (H)"
              >
                <span className="hidden sm:inline">⌨️ </span>KEYS
              </button>

              <button
                onClick={onFullscreen}
                className="border-2 border-sand-beige bg-sand-beige/90 px-3 py-1.5 text-xs text-ocean-dark hover:bg-sand-beige transition-colors"
                title="Fullscreen (Ctrl+F)"
              >
                {isFullscreen ? '⊡' : '⛶'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar - Right Side */}
      {emulatorReady && !showMenu && (
        <div
          className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
            hideControls ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="bg-black/80 border-l-4 border-pirate-gold p-2 space-y-2">
            <button
              onClick={onSave}
              className="block w-full border-2 border-pirate-gold bg-pirate-gold/90 p-2 text-xs hover:bg-pirate-gold transition-colors"
              title="Save State (Ctrl+S)"
            >
              💾
            </button>

            <button
              onClick={onLoad}
              className="block w-full border-2 border-treasure-green bg-treasure-green/90 p-2 text-xs hover:bg-treasure-green transition-colors"
              title="Load State (Ctrl+L)"
            >
              📂
            </button>

            <button
              onClick={onScreenshot}
              className="block w-full border-2 border-sand-beige bg-sand-beige/90 p-2 text-xs hover:bg-sand-beige transition-colors"
              title="Screenshot (Ctrl+P)"
            >
              📷
            </button>

            <button
              onClick={toggleMute}
              className="block w-full border-2 border-skull-white bg-skull-white/90 p-2 text-xs hover:bg-skull-white transition-colors"
              title="Mute/Unmute"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            <button
              onClick={() => setShowFPS(!showFPS)}
              className={`block w-full border-2 p-2 text-xs transition-colors ${
                showFPS
                  ? 'border-treasure-green bg-treasure-green/90 hover:bg-treasure-green'
                  : 'border-wood-brown bg-wood-brown/90 hover:bg-wood-brown text-skull-white'
              }`}
              title="Show FPS"
            >
              FPS
            </button>
          </div>
        </div>
      )}

      {/* Side Menu - Slide in from right */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-ocean-dark border-l-4 border-pirate-gold z-50 overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-pirate-gold">
                <h2 className="text-pixel text-lg text-pirate-gold">EMULATOR MENU</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="text-blood-red hover:text-blood-red/80 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Audio Section */}
              <div className="mb-6">
                <h3 className="text-pixel text-sm text-skull-white mb-3 flex items-center gap-2">
                  <span>🔊</span> AUDIO
                </h3>
                <div className="space-y-3 bg-night-sky p-3 border-2 border-wood-brown">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-pixel text-xs text-sand-beige">Volume</span>
                      <span className="text-pixel text-xs text-pirate-gold">{volume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={toggleMute}
                    className="btn-retro w-full text-xs"
                  >
                    {isMuted ? '🔇 UNMUTE' : '🔊 MUTE'}
                  </button>
                </div>
              </div>

              {/* Display Section */}
              <div className="mb-6">
                <h3 className="text-pixel text-sm text-skull-white mb-3 flex items-center gap-2">
                  <span>🖥️</span> DISPLAY
                </h3>
                <div className="space-y-2 bg-night-sky p-3 border-2 border-wood-brown">
                  <button
                    onClick={onFullscreen}
                    className="btn-retro w-full text-xs"
                  >
                    {isFullscreen ? '⊡ EXIT FULLSCREEN' : '⛶ FULLSCREEN'}
                  </button>
                  <button
                    onClick={() => setShowFPS(!showFPS)}
                    className={`btn-retro w-full text-xs ${showFPS ? 'bg-treasure-green' : ''}`}
                  >
                    {showFPS ? '✓ HIDE FPS' : 'SHOW FPS'}
                  </button>
                  <button
                    onClick={onScreenshot}
                    className="btn-retro w-full text-xs"
                  >
                    📷 SCREENSHOT
                  </button>
                </div>
              </div>

              {/* Save States Section */}
              <div className="mb-6">
                <h3 className="text-pixel text-sm text-skull-white mb-3 flex items-center gap-2">
                  <span>💾</span> SAVE STATES
                </h3>
                <div className="space-y-2 bg-night-sky p-3 border-2 border-wood-brown">
                  <button
                    onClick={() => { onSave(); setShowMenu(false); }}
                    className="btn-retro w-full text-xs"
                  >
                    💾 SAVE STATE
                  </button>
                  <button
                    onClick={() => { onLoad(); setShowMenu(false); }}
                    className="btn-retro w-full text-xs"
                  >
                    📂 LOAD STATE
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="text-pixel text-xs text-sand-beige bg-night-sky p-3 border-2 border-wood-brown">
                <div className="mb-1">Press <kbd className="bg-pirate-gold px-1">M</kbd> to toggle menu</div>
                <div className="mb-1">Press <kbd className="bg-pirate-gold px-1">H</kbd> for hotkeys</div>
                <div>Press <kbd className="bg-pirate-gold px-1">ESC</kbd> to exit fullscreen</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hotkeys Overlay */}
      {showHotkeys && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHotkeys(false)}
        >
          <div className="bg-ocean-dark border-4 border-pirate-gold p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-pixel text-lg text-pirate-gold mb-4 text-center">⌨️ KEYBOARD SHORTCUTS</h2>

            <div className="space-y-2 text-pixel text-xs text-skull-white">
              <div className="flex justify-between items-center">
                <span>Menu</span>
                <kbd className="bg-pirate-gold text-ocean-dark px-2 py-1">M</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Hotkeys</span>
                <kbd className="bg-pirate-gold text-ocean-dark px-2 py-1">H</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Save State</span>
                <kbd className="bg-pirate-gold text-ocean-dark px-2 py-1">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Load State</span>
                <kbd className="bg-pirate-gold text-ocean-dark px-2 py-1">Ctrl + L</kbd>
              </div>
              <hr className="border-wood-brown my-2" />
              <div className="flex justify-between items-center">
                <span className="text-treasure-green">⚡ Quick Save Slot 1-4</span>
                <kbd className="bg-treasure-green text-ocean-dark px-2 py-1">F5-F8</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ocean-blue">⚡ Quick Load Slot 1-4</span>
                <kbd className="bg-ocean-blue text-skull-white px-2 py-1">Shift + F5-F8</kbd>
              </div>
              <hr className="border-wood-brown my-2" />
              <div className="flex justify-between items-center">
                <span>Screenshot</span>
                <kbd className="bg-pirate-gold text-ocean-dark px-2 py-1">Ctrl + P</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Fullscreen</span>
                <kbd className="bg-pirate-gold text-ocean-dark px-2 py-1">Ctrl + F</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Exit Fullscreen</span>
                <kbd className="bg-pirate-gold text-ocean-dark px-2 py-1">ESC</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowHotkeys(false)}
              className="btn-retro w-full mt-4 text-xs"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
