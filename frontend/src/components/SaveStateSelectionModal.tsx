import { type SaveState } from '../services/api';

interface SaveStateSelectionModalProps {
  isOpen: boolean;
  gameTitle: string;
  system: string;
  saveStates: SaveState[];
  loading: boolean;
  onSelectSave: (saveState: SaveState) => void;
  onNewGame: () => void;
  onLoadLatest: () => void;
  onClose: () => void;
}

interface SaveStateCardProps {
  saveState: SaveState;
  onClick: () => void;
  isLatest: boolean;
}

// Helper function to get latest save state by updatedAt
const getLatestSaveState = (saveStates: SaveState[]): SaveState | null => {
  if (saveStates.length === 0) return null;
  return [...saveStates].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
};

// Helper function to format timestamp
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

function SaveStateCard({ saveState, onClick, isLatest }: SaveStateCardProps) {
  return (
    <button
      onClick={onClick}
      className="border-4 border-wood-brown bg-white p-3 hover:bg-pirate-gold/20 transition-colors text-left relative"
    >
      {isLatest && (
        <div className="absolute top-2 right-2 bg-treasure-green text-skull-white text-pixel text-[8px] px-2 py-1 z-10">
          LATEST
        </div>
      )}

      {/* Screenshot */}
      <div className="aspect-video bg-ocean-dark mb-2 overflow-hidden border-2 border-wood-brown">
        {saveState.screenshotUrl ? (
          <img
            src={saveState.screenshotUrl}
            alt={`Slot ${saveState.slot}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-4xl">💾</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-pixel text-xs text-ocean-dark font-bold mb-1">
        SLOT {saveState.slot}
      </div>
      {saveState.description && (
        <div className="text-pixel text-[10px] text-wood-brown mb-1 truncate">
          {saveState.description}
        </div>
      )}
      <div className="text-pixel text-[8px] text-wood-brown">
        {formatTimestamp(saveState.updatedAt)}
      </div>
    </button>
  );
}

export function SaveStateSelectionModal({
  isOpen,
  gameTitle,
  system,
  saveStates,
  loading,
  onSelectSave,
  onNewGame,
  onLoadLatest,
  onClose,
}: SaveStateSelectionModalProps) {
  if (!isOpen) return null;

  const latestSave = getLatestSaveState(saveStates);
  const hasSaves = saveStates.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-4xl border-4 border-wood-brown bg-sand-beige p-6 max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <h2
            id="save-dialog-title"
            className="text-pixel text-lg sm:text-xl text-ocean-dark mb-2"
          >
            🏴‍☠️ AHOY, CAPTAIN! READY TO SAIL?
          </h2>
          <p className="text-pixel text-xs sm:text-sm text-wood-brown mb-6">
            {gameTitle} • {system.toUpperCase()}
          </p>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-pixel text-xs text-ocean-dark">
                Loading save states...
              </p>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  onClick={onLoadLatest}
                  disabled={!hasSaves}
                  className={`btn-retro text-xs sm:text-sm ${
                    hasSaves
                      ? 'bg-treasure-green'
                      : 'bg-wood-brown/50 cursor-not-allowed'
                  }`}
                >
                  ⚡ LOAD LATEST SAVE
                </button>
                <button onClick={onNewGame} className="btn-retro text-xs sm:text-sm">
                  🆕 START NEW GAME
                </button>
              </div>

              {/* Save States Grid or Empty State */}
              {hasSaves ? (
                <div>
                  <h3 className="text-pixel text-xs sm:text-sm text-ocean-dark mb-3">
                    OR LOAD A SPECIFIC SAVE:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {saveStates.map((saveState) => (
                      <SaveStateCard
                        key={saveState.id}
                        saveState={saveState}
                        onClick={() => onSelectSave(saveState)}
                        isLatest={latestSave?.id === saveState.id}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-4 border-wood-brown bg-white p-8 text-center mb-6">
                  <p className="text-pixel text-xs sm:text-sm text-wood-brown mb-2">
                    ⚓ NO SAVE STATES YET
                  </p>
                  <p className="text-pixel text-[10px] sm:text-xs text-ocean-dark">
                    Start your adventure and save your progress along the way!
                  </p>
                </div>
              )}
            </>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="btn-retro w-full text-xs sm:text-sm"
          >
            ← BACK TO LIBRARY
          </button>
        </div>
      </div>
    </>
  );
}
