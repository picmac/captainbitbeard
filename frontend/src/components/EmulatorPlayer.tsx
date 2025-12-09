import { useEffect, useRef, useState } from 'react';

interface EmulatorPlayerProps {
  gameId: string;
  gameTitle: string;
  system: string;
  romUrl: string;
  onExit?: () => void;
}

declare global {
  interface Window {
    EJS_player: any;
    EJS_emulator: any;
    EJS_ready?: () => void;
    EJS_core: string;
    EJS_gameUrl: string;
    EJS_biosUrl?: string;
    EJS_pathtodata: string;
    EJS_gameID?: string;
    EJS_gameName?: string;
    EJS_color: string;
    EJS_startOnLoaded: boolean;
    EJS_letterBox: string;
  }
}

export function EmulatorPlayer({
  gameId,
  gameTitle,
  system,
  romUrl,
  onExit,
}: EmulatorPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // System to EmulatorJS core mapping
  const getEmulatorCore = (sys: string): string => {
    const coreMap: Record<string, string> = {
      nes: 'nes',
      snes: 'snes',
      gb: 'gb',
      gbc: 'gbc',
      gba: 'gba',
      n64: 'n64',
      nds: 'nds',
      genesis: 'segaMD',
      sms: 'segaMS',
      gg: 'segaGG',
      psx: 'psx',
      psp: 'psp',
    };
    return coreMap[sys] || sys;
  };

  useEffect(() => {
    // Lock screen orientation to portrait on mobile
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait-primary').catch(() => {
        // Orientation lock failed, continue anyway
      });
    }

    // Prevent screen sleep
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch(() => {
        // Wake lock failed, continue anyway
      });
    }

    // Load EmulatorJS script
    const script = document.createElement('script');
    script.src = '/emulatorjs/loader.js';
    script.async = true;

    script.onload = () => {
      // Initialize emulator configuration
      // The loader.js will automatically create the emulator instance
      initializeEmulator();
    };

    script.onerror = () => {
      setError('Failed to load emulator');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (window.EJS_emulator) {
        delete window.EJS_emulator;
      }
      if (window.EJS_player) {
        delete window.EJS_player;
      }
      if (window.EJS_ready) {
        delete window.EJS_ready;
      }

      // Unlock orientation
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };
  }, [gameId, romUrl, system]);

  const initializeEmulator = () => {
    try {
      // Configure EmulatorJS
      window.EJS_core = getEmulatorCore(system);
      window.EJS_gameUrl = romUrl;
      // Use local cores (downloaded from GitHub release v4.2.3)
      window.EJS_pathtodata = '/emulatorjs/data/';
      window.EJS_gameID = gameId;
      window.EJS_gameName = gameTitle;
      window.EJS_color = '#0F4C81'; // Captain Bitbeard ocean blue
      window.EJS_startOnLoaded = true;
      window.EJS_letterBox = '#191970'; // Night sky background

      // Don't set EJS_VirtualGamepadSettings - let EmulatorJS use built-in defaults
      // EmulatorJS automatically shows virtual gamepad on mobile devices
      // and uses default layouts for each system (NES, SNES, GBA, etc.)

      // Set the player container selector
      // The loader.js will automatically create the emulator instance
      window.EJS_player = '#emulator-container';

      // Set up ready callback
      window.EJS_ready = () => {
        setLoading(false);
        console.log('🎮 Emulator ready');
      };
    } catch (err: any) {
      setError(err.message || 'Failed to initialize emulator');
      setLoading(false);
    }
  };

  return (
    <div className="gameplay-mode bg-night-sky">
      {/* Exit Button */}
      {onExit && (
        <button
          onClick={onExit}
          className="fixed right-4 top-4 z-50 border-4 border-blood-red bg-blood-red px-4 py-2 text-xs text-skull-white"
          style={{ imageRendering: 'pixelated' }}
        >
          ✕ EXIT
        </button>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-pixel text-sm text-skull-white">
              Loading {gameTitle}...
            </p>
            <p className="text-pixel mt-2 text-xs text-sand-beige">
              System: {system.toUpperCase()}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex h-full items-center justify-center p-4">
          <div className="border-4 border-blood-red bg-blood-red/20 p-6 text-center">
            <p className="text-pixel mb-4 text-sm text-skull-white">
              ❌ ERROR
            </p>
            <p className="text-pixel text-xs text-skull-white">{error}</p>
            {onExit && (
              <button onClick={onExit} className="btn-retro mt-4 text-xs">
                GO BACK
              </button>
            )}
          </div>
        </div>
      )}

      {/* Emulator Container */}
      <div
        id="emulator-container"
        ref={containerRef}
        className="h-full w-full"
        style={{ display: loading || error ? 'none' : 'block' }}
      />
    </div>
  );
}
