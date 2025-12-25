import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameApi, playHistoryApi, saveStateApi, type Game, type SaveState } from '../services/api';
import { EmulatorPlayer } from '../components/EmulatorPlayer';
import { SaveStateSelectionModal } from '../components/SaveStateSelectionModal';
import { useAuth } from '../context/AuthContext';
import { PageTitle } from '../components/PageTitle';

// Helper function to get latest save state by updatedAt
const getLatestSaveState = (saveStates: SaveState[]): SaveState | null => {
  if (saveStates.length === 0) return null;
  return [...saveStates].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
};

export function GamePlayerPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Save state dialog management
  const [showSaveDialog, setShowSaveDialog] = useState(true);
  const [saveStates, setSaveStates] = useState<SaveState[]>([]);
  const [loadingSaves, setLoadingSaves] = useState(false);
  const [selectedSaveStateId, setSelectedSaveStateId] = useState<string | null>(null);
  const [startEmulator, setStartEmulator] = useState(false);

  useEffect(() => {
    if (!gameId) {
      navigate('/library');
      return;
    }

    loadGameAndSaves();
  }, [gameId]);

  const loadGameAndSaves = async () => {
    if (!gameId) return;

    try {
      // Load game data
      const response = await gameApi.getGameForPlay(gameId);
      setGame(response.data.game);

      // Record play session if user is logged in
      if (user) {
        try {
          await playHistoryApi.recordPlay(gameId);
        } catch (err) {
          // Silently fail - don't block gameplay
          console.error('Failed to record play session:', err);
        }
      }

      // Load save states if logged in
      if (user) {
        setLoadingSaves(true);
        try {
          const savesResponse = await saveStateApi.getSaveStatesByGame(gameId);
          setSaveStates(savesResponse.data.saveStates);

          // Check for loadLatest URL param (from Continue button)
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('loadLatest') === 'true') {
            const latest = getLatestSaveState(savesResponse.data.saveStates);
            if (latest) {
              setSelectedSaveStateId(latest.id);
              setShowSaveDialog(false);
              setStartEmulator(true);
              setLoadingSaves(false);
              return;
            }
          }
        } catch (err) {
          console.error('Failed to load save states:', err);
          // On error, skip dialog and start fresh game
          setSaveStates([]);
          setShowSaveDialog(false);
          setStartEmulator(true);
        } finally {
          setLoadingSaves(false);
        }
      } else {
        // Not logged in - skip dialog, start fresh
        setShowSaveDialog(false);
        setStartEmulator(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSave = (saveState: SaveState) => {
    setSelectedSaveStateId(saveState.id);
    setShowSaveDialog(false);
    setStartEmulator(true);
  };

  const handleNewGame = () => {
    setSelectedSaveStateId(null);
    setShowSaveDialog(false);
    setStartEmulator(true);
  };

  const handleLoadLatest = () => {
    const latest = getLatestSaveState(saveStates);
    if (latest) {
      handleSelectSave(latest);
    } else {
      handleNewGame();
    }
  };

  const handleExit = () => {
    navigate('/library');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky">
        <PageTitle
          title="Loading Game"
          description="Loading game..."
        />
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-pixel text-sm text-skull-white">
            Loading game...
          </p>
        </div>
      </div>
    );
  }

  if (error || !game || !game.romDownloadUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky p-4">
        <PageTitle
          title="Error"
          description="Error loading game"
        />
        <div className="border-4 border-blood-red bg-blood-red/20 p-6 text-center">
          <p className="text-pixel mb-4 text-sm text-skull-white">
            ❌ ERROR
          </p>
          <p className="text-pixel mb-4 text-xs text-skull-white">
            {error || 'Game not found'}
          </p>
          <button onClick={handleExit} className="btn-retro text-xs">
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle
        title={game ? `Playing ${game.title}` : 'Loading Game'}
        description={game ? `Now playing ${game.title} for ${game.system}` : 'Loading game...'}
      />
      {game && <h1 className="sr-only">Playing {game.title}</h1>}

      {/* Save Selection Dialog */}
      {!loading && !error && showSaveDialog && user && game && (
        <SaveStateSelectionModal
          isOpen={showSaveDialog}
          gameTitle={game.title}
          system={game.system}
          saveStates={saveStates}
          loading={loadingSaves}
          onSelectSave={handleSelectSave}
          onNewGame={handleNewGame}
          onLoadLatest={handleLoadLatest}
          onClose={() => navigate('/library')}
        />
      )}

      {/* Emulator - only render after dialog dismissed */}
      {!loading && !error && startEmulator && game && (
        <EmulatorPlayer
          gameId={game.id}
          gameTitle={game.title}
          system={game.system}
          romUrl={game.romDownloadUrl}
          initialSaveStateId={selectedSaveStateId}
          onExit={handleExit}
        />
      )}
    </>
  );
}
