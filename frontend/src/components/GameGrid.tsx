import { useEffect, useState } from 'react';
import { gameApi, type Game } from '../services/api';
import { GameCard } from './GameCard';

interface GameGridProps {
  system?: string;
  searchQuery?: string;
}

export function GameGrid({ system, searchQuery }: GameGridProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadGames();
  }, [system, searchQuery, refreshKey]);

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

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-pixel text-sm text-skull-white">Loading games...</p>
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
        <p className="text-pixel text-sm text-ocean-dark">No games found</p>
        <p className="text-pixel mt-2 text-xs text-ocean-dark">
          Upload some ROMs to get started!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Bar */}
      <div className="mb-4 text-center">
        <p className="text-pixel text-xs text-skull-white">
          📦 {games.length} game{games.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} onMetadataFetched={handleRefresh} />
        ))}
      </div>
    </div>
  );
}
