import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveStateApi, type SaveState } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PageTitle } from '../components/PageTitle';

export function SaveStatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saveStates, setSaveStates] = useState<SaveState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSaveState, setSelectedSaveState] = useState<{ id: string; slot: number; game: string } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadSaveStates();
  }, [user, navigate]);

  const loadSaveStates = async () => {
    setLoading(true);
    try {
      const response = await saveStateApi.getMySaveStates();
      setSaveStates(response.data.saveStates);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load save states');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, slot: number, gameTitle: string) => {
    setSelectedSaveState({ id, slot, game: gameTitle });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedSaveState) return;

    try {
      await saveStateApi.deleteSaveState(selectedSaveState.id);
      await loadSaveStates();
      toast.success('Save Deleted', `Slot ${selectedSaveState.slot} has been removed`);
    } catch (err: any) {
      toast.error(err, 'Failed to delete save state');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <PageTitle
        title="My Save States"
        description="View and manage all your game save states in one place"
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-pixel mb-4 text-center text-2xl text-pirate-gold">
          💾 MY SAVE STATES
        </h1>

        {/* Back to Library */}
        <div className="mx-auto max-w-4xl mb-4">
          <Link to="/library" className="btn-retro text-xs inline-block">
            ← BACK TO LIBRARY
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl">
        {loading ? (
          <div className="border-4 border-wood-brown bg-sand-beige p-8 text-center">
            <p className="text-pixel text-sm text-wood-brown">LOADING...</p>
          </div>
        ) : error ? (
          <div className="border-4 border-wood-brown bg-sand-beige p-8 text-center">
            <p className="text-pixel text-sm text-blood-red mb-4">{error}</p>
            <button onClick={loadSaveStates} className="btn-retro text-xs">
              TRY AGAIN
            </button>
          </div>
        ) : saveStates.length === 0 ? (
          <div className="border-4 border-wood-brown bg-sand-beige p-8 text-center">
            <p className="text-pixel text-sm text-ocean-dark mb-4">
              💾 NO SAVE STATES YET
            </p>
            <p className="text-pixel text-xs text-wood-brown mb-6">
              Save states are created while playing games
            </p>
            <Link to="/library" className="btn-retro text-xs">
              GO TO LIBRARY
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group by game */}
            {Object.entries(
              saveStates.reduce((acc, saveState) => {
                const gameId = saveState.game.id;
                if (!acc[gameId]) {
                  acc[gameId] = [];
                }
                acc[gameId].push(saveState);
                return acc;
              }, {} as Record<string, SaveState[]>)
            ).map(([gameId, gameSaveStates]) => {
              const game = gameSaveStates[0].game;
              return (
                <div key={gameId} className="border-4 border-wood-brown bg-sand-beige p-4">
                  {/* Game Header */}
                  <div className="flex items-center gap-4 mb-4">
                    {game.coverUrl && (
                      <img
                        src={game.coverUrl}
                        alt={game.title}
                        className="w-16 h-24 object-cover border-2 border-wood-brown"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-pixel text-sm text-ocean-dark mb-1">
                        {game.title}
                      </h2>
                      <p className="text-pixel text-xs text-wood-brown">
                        {game.system.toUpperCase()} • {gameSaveStates.length}{' '}
                        {gameSaveStates.length === 1 ? 'save' : 'saves'}
                      </p>
                    </div>
                    <Link
                      to={`/play/${gameId}`}
                      className="btn-retro text-xs whitespace-nowrap"
                    >
                      ▶️ PLAY
                    </Link>
                  </div>

                  {/* Save States */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {gameSaveStates
                      .sort((a, b) => a.slot - b.slot)
                      .map((saveState) => (
                        <div
                          key={saveState.id}
                          className="border-2 border-wood-brown bg-white p-3 flex gap-3"
                        >
                          {/* Screenshot */}
                          {saveState.screenshotUrl && (
                            <img
                              src={saveState.screenshotUrl}
                              alt={`Slot ${saveState.slot}`}
                              className="w-20 h-20 object-cover border-2 border-wood-brown"
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

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(saveState.id, saveState.slot, game.title)}
                            className="btn-retro bg-blood-red text-[10px] px-2 self-start"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedSaveState && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete Save State"
          message={`Are you sure you want to delete save slot ${selectedSaveState.slot} from ${selectedSaveState.game}? This action cannot be undone.`}
          confirmText="DELETE SAVE"
          cancelText="CANCEL"
          type="danger"
        >
          <div className="text-pixel text-sm text-ocean-dark">
            <div className="font-bold mb-2">This will permanently delete:</div>
            <ul className="text-xs text-left space-y-1">
              <li>• Save slot {selectedSaveState.slot}</li>
              <li>• All progress saved in this slot</li>
              <li>• Screenshot (if any)</li>
            </ul>
          </div>
        </ConfirmationModal>
      )}
    </div>
  );
}
