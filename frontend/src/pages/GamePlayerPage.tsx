import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameApi, playHistoryApi, type Game } from '../services/api';
import { EmulatorPlayer } from '../components/EmulatorPlayer';
import { useAuth } from '../context/AuthContext';

export function GamePlayerPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!gameId) {
      navigate('/library');
      return;
    }

    loadGame();
  }, [gameId]);

  const loadGame = async () => {
    if (!gameId) return;

    try {
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    navigate('/library');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky">
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
    <EmulatorPlayer
      gameId={game.id}
      gameTitle={game.title}
      system={game.system}
      romUrl={game.romDownloadUrl}
      onExit={handleExit}
    />
  );
}
