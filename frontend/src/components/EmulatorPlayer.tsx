import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { saveStateApi, type SaveState } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EmulatorOverlay } from './EmulatorOverlay';
import { TouchControls } from './TouchControls';
import { toast } from '../utils/toast';
import { ConfirmationModal } from './ConfirmationModal';

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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [error, setError] = useState('');
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [saveStates, setSaveStates] = useState<SaveState[]>([]);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [saveDescription, setSaveDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingSaves, setLoadingSaves] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveStateToDelete, setSaveStateToDelete] = useState<{ id: string; slot: number } | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const lastScreenshotRef = useRef<number>(0);

  // Memoize emulator core mapping to avoid recreation on every render
  const emulatorCore = useMemo(() => {
    const coreMap: Record<string, string> = {
      // Nintendo
      nes: 'fceumm',                    // NES / Famicom
      snes: 'snes9x',                   // Super Nintendo
      n64: 'mupen64plus_next',          // Nintendo 64
      gba: 'mgba',                      // Game Boy Advance
      nds: 'melonds',                   // Nintendo DS
      gb: 'gambatte',                   // Game Boy
      gbc: 'gambatte',                  // Game Boy Color
      vb: 'beetle_vb',                  // Virtual Boy

      // Sega
      genesis: 'genesis_plus_gx',       // Genesis / Mega Drive
      megadrive: 'genesis_plus_gx',     // Mega Drive
      sega32x: 'picodrive',             // Sega 32X
      segacd: 'genesis_plus_gx',        // Sega CD
      saturn: 'yabause',                // Sega Saturn
      sms: 'smsplus',                   // Master System
      gg: 'genesis_plus_gx',            // Game Gear

      // Sony
      psx: 'mednafen_psx_hw',           // PlayStation 1
      ps1: 'mednafen_psx_hw',           // PlayStation 1 (alt)
      psp: 'ppsspp',                    // PlayStation Portable

      // Atari
      atari2600: 'stella2014',          // Atari 2600
      atari5200: 'a5200',               // Atari 5200
      atari7800: 'prosystem',           // Atari 7800
      lynx: 'handy',                    // Atari Lynx
      jaguar: 'virtualjaguar',          // Atari Jaguar

      // Other Consoles
      '3do': 'opera',                   // 3DO
      colecovision: 'gearcoleco',       // ColecoVision
      ngp: 'mednafen_ngp',              // Neo Geo Pocket
      pce: 'mednafen_pce',              // PC Engine / TurboGrafx-16
      pcfx: 'mednafen_pcfx',            // PC-FX
      ws: 'mednafen_wswan',             // WonderSwan

      // Computers
      msx: 'fmsx',                      // MSX
      amstradcpc: 'cap32',              // Amstrad CPC
      zxspectrum: 'fuse',               // ZX Spectrum
      c64: 'vice_x64',                  // Commodore 64
      c128: 'vice_x128',                // Commodore 128
      vic20: 'vice_xvic',               // VIC-20
      amiga: 'puae',                    // Amiga
      dos: 'dosbox_pure',               // DOS

      // Arcade
      arcade: 'fbneo',                  // Arcade (FBNeo)
      mame: 'mame2003_plus',            // MAME
      neogeo: 'fbneo',                  // Neo Geo
      cps1: 'fbalpha2012_cps1',         // CPS1
      cps2: 'fbalpha2012_cps2',         // CPS2

      // Other
      doom: 'prboom',                   // Doom
      '81': '81',                       // Sinclair ZX81
      cdi: 'same_cdi',                  // Philips CD-i
    };
    return coreMap[system] || system;
  }, [system]);

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
      void initializeEmulator();
    };

    script.onerror = () => {
      setError('Failed to load emulator');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script
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

  const initializeEmulator = async () => {
    try {
      setLoadingStatus('Initializing emulator...');
      setLoadingProgress(10);

      // Configure EmulatorJS - let it handle core loading
      window.EJS_core = emulatorCore;
      window.EJS_gameUrl = romUrl;
      window.EJS_pathtodata = '/emulatorjs/data/';
      window.EJS_gameID = gameId;
      window.EJS_gameName = gameTitle;
      window.EJS_color = '#0F4C81';
      window.EJS_startOnLoaded = true;
      window.EJS_letterBox = '#191970';
      window.EJS_player = '#emulator-container';

      setLoadingProgress(30);
      setLoadingStatus('Loading game...');

      // Monitor loading progress
      const progressInterval = setInterval(() => {
        if (window.EJS_emulator?.gameManager?.started) {
          setLoadingProgress(100);
          setLoadingStatus('Starting game...');
          clearInterval(progressInterval);
        } else if (loadingProgress < 90) {
          setLoadingProgress((prev) => Math.min(prev + 3, 90));
        }
      }, 1000);

      // Set up ready callback
      window.EJS_ready = () => {
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setLoadingStatus('Ready!');
        setLoading(false);
        retryCountRef.current = 0;
        console.log('🎮 Emulator ready');
        if (user) {
          loadSaveStates();
        }
      };

      // Timeout handler with retry
      setTimeout(() => {
        if (loading && !window.EJS_emulator?.gameManager?.started) {
          clearInterval(progressInterval);
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            const delay = Math.pow(2, retryCountRef.current) * 1000;
            setLoadingStatus(
              `Connection error. Retrying in ${delay / 1000}s... (${retryCountRef.current}/${maxRetries})`
            );
            setTimeout(() => {
              setLoadingProgress(0);
              void initializeEmulator();
            }, delay);
          } else {
            setError('Failed to load game after multiple attempts. Please check your connection.');
            setLoading(false);
          }
        }
      }, 60000);
    } catch (err: any) {
      console.error('Emulator initialization error:', err);

      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        setLoadingStatus(
          `Error: ${err.message}. Retrying in ${delay / 1000}s... (${retryCountRef.current}/${maxRetries})`
        );
        setTimeout(() => {
          setLoadingProgress(0);
          void initializeEmulator();
        }, delay);
      } else {
        setError(err.message || 'Failed to initialize emulator');
        setLoading(false);
      }
    }
  };

  const loadSaveStates = useCallback(async () => {
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
  }, [user, gameId]);

  const handleSaveState = async () => {
    if (!user || !window.EJS_emulator) {
      toast.warning('Login Required', 'Please log in to save your progress');
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
      toast.success('Game Saved', `Progress saved to slot ${selectedSlot}`);
    } catch (err: any) {
      toast.error(err, 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadState = async (saveState: SaveState) => {
    if (!window.EJS_emulator) {
      toast.warning('Not Ready', 'Emulator is still loading. Please wait a moment.');
      return;
    }

    try {
      // Load state data from backend
      const blob = await saveStateApi.loadSaveState(saveState.id);
      const arrayBuffer = await blob.arrayBuffer();

      // Load state into EmulatorJS
      window.EJS_emulator.gameManager.loadState(new Uint8Array(arrayBuffer));

      setShowSaveMenu(false);
      toast.success('Game Loaded', `Progress restored from slot ${saveState.slot}`);
    } catch (err: any) {
      toast.error(err, 'Failed to load progress');
    }
  };

  const handleQuickSave = async (slot: number) => {
    if (!user || !window.EJS_emulator) {
      toast.warning('Login Required', 'Please log in to save your progress');
      return;
    }

    try {
      // Get save state from EmulatorJS
      const stateData = window.EJS_emulator.gameManager.getState();
      if (!stateData) {
        throw new Error('Failed to get save state from emulator');
      }

      // Convert to base64
      const base64State = btoa(String.fromCharCode(...new Uint8Array(stateData)));

      // Get screenshot
      let screenshot: string | undefined;
      try {
        const canvas = document.querySelector('#emulator-container canvas') as HTMLCanvasElement;
        if (canvas) {
          screenshot = canvas.toDataURL('image/png');
        }
      } catch (err) {
        console.error('Failed to capture screenshot:', err);
      }

      // Save to backend
      await saveStateApi.createSaveState(gameId!, {
        slot,
        stateData: base64State,
        screenshot,
        description: `Quick Save Slot ${slot}`,
      });

      await loadSaveStates();
      toast.success('Quick Saved', `Progress saved to slot ${slot} (F${slot + 4})`);
    } catch (err: any) {
      toast.error(err, `Failed to quick save to slot ${slot}`);
    }
  };

  const handleQuickLoad = async (slot: number) => {
    if (!window.EJS_emulator) {
      toast.warning('Not Ready', 'Emulator is still loading');
      return;
    }

    try {
      // Find save state for this slot
      const saveState = saveStates.find((s) => s.slot === slot);
      if (!saveState) {
        toast.warning('No Save Found', `Slot ${slot} is empty`);
        return;
      }

      // Load state data from backend
      const blob = await saveStateApi.loadSaveState(saveState.id);
      const arrayBuffer = await blob.arrayBuffer();

      // Load state into EmulatorJS
      window.EJS_emulator.gameManager.loadState(new Uint8Array(arrayBuffer));

      toast.success('Quick Loaded', `Progress restored from slot ${slot} (F${slot + 4})`);
    } catch (err: any) {
      toast.error(err, `Failed to quick load from slot ${slot}`);
    }
  };

  const handleDeleteState = (id: string, slot: number) => {
    setSaveStateToDelete({ id, slot });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteState = async () => {
    if (!saveStateToDelete) return;

    try {
      await saveStateApi.deleteSaveState(saveStateToDelete.id);
      await loadSaveStates();
      toast.success('Save Deleted', `Slot ${saveStateToDelete.slot} removed successfully`);
    } catch (err: any) {
      toast.error(err, 'Failed to delete save state');
    }
  };

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Failed to exit fullscreen:', err);
      });
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    // Throttle screenshots to prevent spam (1 per second)
    const now = Date.now();
    if (now - lastScreenshotRef.current < 1000) {
      toast.info('Please Wait', 'Screenshots are limited to one per second');
      return;
    }
    lastScreenshotRef.current = now;

    try {
      const canvas = document.querySelector('#emulator-container canvas') as HTMLCanvasElement;
      if (!canvas) {
        toast.error(new Error('Canvas not found'), 'Screenshot Failed');
        return;
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error(new Error('Failed to create screenshot'), 'Screenshot Failed');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${gameTitle}_${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Screenshot Saved', `${gameTitle}_${Date.now()}.png`);
      });
    } catch (err) {
      console.error('Screenshot error:', err);
      toast.error(err, 'Screenshot Failed');
    }
  }, [gameTitle]);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="gameplay-mode bg-night-sky">
      {/* EmulatorJS Overlay Controls */}
      {!loading && !error && onExit && (
        <EmulatorOverlay
          onSave={() => setShowSaveMenu(true)}
          onLoad={() => setShowSaveMenu(true)}
          onQuickSave={handleQuickSave}
          onQuickLoad={handleQuickLoad}
          onScreenshot={handleScreenshot}
          onFullscreen={handleFullscreen}
          onExit={onExit}
          isFullscreen={isFullscreen}
          emulatorReady={!loading && !error}
        />
      )}

      {/* Touch Controls for Mobile */}
      <TouchControls show={!loading && !error} />

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
                          onClick={() => handleDeleteState(saveState.id, saveState.slot)}
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
          <div className="text-center max-w-md mx-auto px-4">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-pixel text-sm text-skull-white mb-2">
              Loading {gameTitle}...
            </p>
            <p className="text-pixel text-xs text-sand-beige mb-4">
              System: {system.toUpperCase()}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-6 border-4 border-pirate-gold bg-ocean-dark mb-2">
              <div
                className="h-full bg-pirate-gold transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-pixel text-xs text-pirate-gold">
              {loadingProgress}% - {loadingStatus}
            </p>

            {retryCountRef.current > 0 && (
              <p className="text-pixel text-xs text-blood-red mt-2">
                Retry attempt {retryCountRef.current}/{maxRetries}
              </p>
            )}
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

      {/* Delete Save State Confirmation Modal */}
      {saveStateToDelete && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteState}
          title="Delete Save State"
          message={`Are you sure you want to delete save slot ${saveStateToDelete.slot}? This action cannot be undone.`}
          confirmText="DELETE SAVE"
          cancelText="CANCEL"
          type="danger"
        >
          <div className="text-pixel text-sm text-ocean-dark">
            <div className="font-bold mb-2">This will permanently delete:</div>
            <ul className="text-xs text-left space-y-1">
              <li>• Save slot {saveStateToDelete.slot}</li>
              <li>• All progress saved in this slot</li>
              <li>• Screenshot (if any)</li>
            </ul>
          </div>
        </ConfirmationModal>
      )}
    </div>
  );
}
