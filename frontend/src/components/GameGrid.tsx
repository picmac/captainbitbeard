import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi, type Game } from '../services/api';

interface GameGridProps {
  system?: string;
  searchQuery?: string;
}

export function GameGrid({ system, searchQuery }: GameGridProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadGames();
  }, [system, searchQuery]);

  const loadGames = async () => {
    setLoading(true);
    setError('');

    try {
      let response;

      if (searchQuery) {
        response = await gameApi.searchGames(searchQuery);
      } else if (system) {
        response = await gameApi.getGamesBySystem(system);
      } else {
        response = await gameApi.getGames();
      }

      setGames(response.data.games);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (gameId: string) => {
    navigate(`/play/${gameId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-pixel text-sm text-skull-white">
            Loading games...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-4 border-blood-red bg-blood-red/20 p-6 text-center">
        <p className="text-pixel text-sm text-skull-white">❌ {error}</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="border-4 border-wood-brown bg-sand-beige p-8 text-center">
        <p className="text-pixel text-sm text-ocean-dark">
          No games found
        </p>
        <p className="text-pixel mt-2 text-xs text-ocean-dark">
          Upload some ROMs to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {games.map((game) => (
        <div
          key={game.id}
          onClick={() => handlePlayGame(game.id)}
          className="group cursor-pointer transition-transform hover:scale-105"
        >
          {/* Game Card */}
          <div className="border-4 border-wood-brown bg-sand-beige">
            {/* Cover Image */}
            <div className="pixel-art aspect-square overflow-hidden bg-ocean-dark">
              {game.coverUrl ? (
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="pixel-art h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-pixel text-2xl">🎮</span>
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="p-2">
              <h3 className="text-pixel truncate text-xs text-ocean-dark group-hover:text-pirate-gold">
                {game.title}
              </h3>
              <p className="text-pixel mt-1 text-[8px] uppercase text-wood-brown">
                {game.system}
              </p>
            </div>
          </div>

          {/* Play Button Overlay (visible on hover on desktop) */}
          <div className="hidden group-hover:block">
            <div className="relative -mt-16 flex justify-center">
              <button className="btn-retro z-10 text-xs">
                ▶ PLAY
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
