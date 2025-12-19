import { useEffect, useRef, useState } from 'react';
import { saveStateApi, type SaveState } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [saveStates, setSaveStates] = useState<SaveState[]>([]);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [saveDescription, setSaveDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingSaves, setLoadingSaves] = useState(false);

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
        if (user) {
          loadSaveStates();
        }
      };
    } catch (err: any) {
      setError(err.message || 'Failed to initialize emulator');
      setLoading(false);
    }
  };

  const loadSaveStates = async () => {
    if (!user) return;

    setLoadingSaves(true);
    try {
      const response = await saveStateApi.getSaveStatesByGame(gameId);
      setSaveStates(response.data.saveStates);
    } catch (err) {
      console.error('Failed to load save states:', err);
    } finally {
      setLoadingSaves(false);
    }
  };

  const handleSaveState = async () => {
    if (!user || !window.EJS_emulator) {
      alert('Please log in to save your progress');
      return;
    }

    setSaving(true);
    try {
      // Get save state from EmulatorJS
      const stateData = window.EJS_emulator.gameManager.getState();
      if (!stateData) {
        throw new Error('Failed to get save state from emulator');
      }

      // Convert to base64
      const base64State = btoa(String.fromCharCode(...new Uint8Array(stateData)));

      // Get screenshot (optional)
      let screenshot: string | undefined;
      try {
        const canvas = document.querySelector('#emulator-container canvas') as HTMLCanvasElement;
        if (canvas) {
          screenshot = canvas.toDataURL('image/png').split(',')[1];
        }
      } catch (err) {
        console.error('Failed to capture screenshot:', err);
      }

      // Save to backend
      await saveStateApi.createSaveState(gameId, {
        slot: selectedSlot,
        stateData: base64State,
        screenshot,
        description: saveDescription || undefined,
      });

      // Reload save states list
      await loadSaveStates();

      // Reset form
      setSaveDescription('');
      alert(`Saved to slot ${selectedSlot}!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save state');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadState = async (saveState: SaveState) => {
    if (!window.EJS_emulator) {
      alert('Emulator not ready');
      return;
    }

    try {
      // Load state data from backend
      const blob = await saveStateApi.loadSaveState(saveState.id);
      const arrayBuffer = await blob.arrayBuffer();

      // Load state into EmulatorJS
      window.EJS_emulator.gameManager.loadState(new Uint8Array(arrayBuffer));

      setShowSaveMenu(false);
      alert('State loaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load state');
    }
  };

  const handleDeleteState = async (id: string) => {
    if (!window.confirm('Delete this save state?')) return;

    try {
      await saveStateApi.deleteSaveState(id);
      await loadSaveStates();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete state');
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

      {/* Save/Load Button */}
      {user && !loading && !error && (
        <button
          onClick={() => setShowSaveMenu(!showSaveMenu)}
          className="fixed left-4 top-4 z-50 border-4 border-pirate-gold bg-pirate-gold px-4 py-2 text-xs text-ocean-dark"
          style={{ imageRendering: 'pixelated' }}
        >
          💾 SAVE/LOAD
        </button>
      )}

      {/* Save/Load Menu */}
      {showSaveMenu && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl border-4 border-wood-brown bg-sand-beige p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-pixel text-lg text-ocean-dark">SAVE STATES</h2>
              <button
                onClick={() => setShowSaveMenu(false)}
                className="btn-retro text-xs px-3"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Save New State */}
            <div className="border-4 border-wood-brown bg-white p-4 mb-4">
              <h3 className="text-pixel text-sm text-ocean-dark mb-3">CREATE NEW SAVE</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-pixel text-xs text-wood-brown block mb-1">
                    SLOT (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(Number(e.target.value))}
                    className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs"
                  />
                </div>
                <div>
                  <label className="text-pixel text-xs text-wood-brown block mb-1">
                    DESCRIPTION (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="e.g., Before boss fight..."
                    className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs"
                  />
                </div>
                <button
                  onClick={handleSaveState}
                  disabled={saving || selectedSlot < 1 || selectedSlot > 10}
                  className="btn-retro w-full text-xs"
                >
                  {saving ? 'SAVING...' : '💾 SAVE STATE'}
                </button>
              </div>
            </div>

            {/* Load Existing States */}
            <div className="border-4 border-wood-brown bg-white p-4">
              <h3 className="text-pixel text-sm text-ocean-dark mb-3">LOAD SAVE STATE</h3>
              {loadingSaves ? (
                <p className="text-pixel text-xs text-wood-brown">Loading...</p>
              ) : saveStates.length === 0 ? (
                <p className="text-pixel text-xs text-wood-brown">No save states yet</p>
              ) : (
                <div className="space-y-2">
                  {saveStates.map((saveState) => (
                    <div
                      key={saveState.id}
                      className="border-2 border-wood-brown bg-sand-beige p-3 flex items-start gap-3"
                    >
                      {/* Screenshot */}
                      {saveState.screenshotUrl && (
                        <img
                          src={saveState.screenshotUrl}
                          alt={`Slot ${saveState.slot}`}
                          className="w-24 h-24 object-cover border-2 border-wood-brown"
                        />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-pixel text-xs text-ocean-dark font-bold mb-1">
                          SLOT {saveState.slot}
                        </div>
                        {saveState.description && (
                          <div className="text-pixel text-xs text-wood-brown mb-1">
                            {saveState.description}
                          </div>
                        )}
                        <div className="text-pixel text-[10px] text-wood-brown">
                          {new Date(saveState.updatedAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleLoadState(saveState)}
                          className="btn-retro text-[10px] px-2 py-1 whitespace-nowrap"
                        >
                          📂 LOAD
                        </button>
                        <button
                          onClick={() => handleDeleteState(saveState.id)}
                          className="btn-retro bg-blood-red text-[10px] px-2 py-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
