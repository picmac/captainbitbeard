import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playHistoryApi, type Game } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ContinuePlaying() {
  const { user } = useAuth();
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadRecentGames();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadRecentGames = async () => {
    setLoading(true);
    try {
      const response = await playHistoryApi.getRecentGames(10);
      setRecentGames(response.data.games);
    } catch (error) {
      // Silently fail
      setRecentGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (gameId: string) => {
    navigate(`/play/${gameId}`);
  };

  const formatTimeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    return `${Math.floor(seconds / 2592000)}mo ago`;
  };

  // Don't show if not logged in or no recent games
  if (!user || loading || recentGames.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-pixel text-sm text-pirate-gold mb-3">🎮 CONTINUE PLAYING</h2>

      <div className="flex gap-3 overflow-x-auto pb-3">
        {recentGames.map((game) => (
          <button
            key={game.id}
            onClick={() => handlePlayGame(game.id)}
            className="flex-shrink-0 w-32 border-4 border-wood-brown bg-sand-beige hover:bg-pirate-gold/20 transition-colors"
          >
            {/* Small Cover */}
            <div className="pixel-art aspect-square bg-ocean-dark overflow-hidden">
              {game.coverUrl ? (
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="pixel-art w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-pixel text-xl">🎮</span>
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="p-2">
              <p className="text-pixel text-[8px] text-ocean-dark truncate">
                {game.title}
              </p>
              <p className="text-pixel text-[7px] text-wood-brown mt-1">
                {game.createdAt && formatTimeAgo(game.createdAt)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
