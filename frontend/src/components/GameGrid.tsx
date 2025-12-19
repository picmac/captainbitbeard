import { useEffect, useState } from 'react';
import { gameApi, favoriteApi, type Game } from '../services/api';
import { GameCard } from './GameCard';
import { GameList } from './GameList';
import { QuickActionsMenu } from './QuickActionsMenu';
import { type FilterObject } from './AdvancedFilters';

interface GameGridProps {
  system?: string;
  searchQuery?: string;
  favoritesOnly?: boolean;
  sortBy?: string;
  viewMode?: 'grid' | 'list';
  advancedFilters?: FilterObject;
  customGames?: Game[]; // For advanced search results
}

export function GameGrid({
  system,
  searchQuery,
  favoritesOnly,
  sortBy = 'default',
  viewMode = 'grid',
  advancedFilters,
  customGames
}: GameGridProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);

  useEffect(() => {
    if (customGames) {
      // Use provided custom games (e.g., from advanced search)
      setGames(customGames);
      setLoading(false);
    } else {
      loadGames();
    }
  }, [system, searchQuery, favoritesOnly, refreshKey, customGames]);

  const loadGames = async () => {
    if (customGames) {
      return; // Don't load if custom games are provided
    }

    setLoading(true);
    setError('');

    try {
      let response;

      if (favoritesOnly) {
        // Load favorites
        response = await favoriteApi.getUserFavorites();
      } else if (searchQuery) {
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

  const handleToggleSelection = (game: Game) => {
    setSelectedGames((prev) => {
      const isSelected = prev.some((g) => g.id === game.id);
      if (isSelected) {
        return prev.filter((g) => g.id !== game.id);
      } else {
        return [...prev, game];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedGames([]);
    setSelectionMode(false);
  };

  const handleSelectAll = () => {
    if (selectedGames.length === sortedGames.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(sortedGames);
    }
  };

  // Filter games based on advanced filters
  const filterGames = (games: Game[]): Game[] => {
    if (!advancedFilters) return games;

    return games.filter((game) => {
      // System filter (multi-select)
      if (advancedFilters.systems.length > 0 && !advancedFilters.systems.includes(game.system)) {
        return false;
      }

      // Genre filter
      if (advancedFilters.genre && game.genre !== advancedFilters.genre) {
        return false;
      }

      // Year range filter
      if (game.releaseDate) {
        const gameYear = new Date(game.releaseDate).getFullYear();
        if (advancedFilters.yearFrom && gameYear < advancedFilters.yearFrom) {
          return false;
        }
        if (advancedFilters.yearTo && gameYear > advancedFilters.yearTo) {
          return false;
        }
      }

      // Player count filter
      if (advancedFilters.players && game.players) {
        const playerOption = advancedFilters.players;
        if (playerOption === '1' && game.players !== 1) return false;
        if (playerOption === '2' && game.players !== 2) return false;
        if (playerOption === '3-4' && (game.players < 3 || game.players > 4)) return false;
        if (playerOption === '4+' && game.players < 4) return false;
      }

      return true;
    });
  };

  // Sort games based on sortBy prop
  const sortGames = (games: Game[]): Game[] => {
    const sorted = [...games];

    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'date':
        return sorted.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'system':
        return sorted.sort((a, b) => a.system.localeCompare(b.system));
      default:
        return sorted;
    }
  };

  const filteredGames = filterGames(games);
  const sortedGames = sortGames(filteredGames);

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

  if (sortedGames.length === 0) {
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
      {/* Stats & Actions Bar */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <p className="text-pixel text-xs text-skull-white">
          📦 {sortedGames.length} game{sortedGames.length !== 1 ? 's' : ''} found
          {selectedGames.length > 0 && ` • ${selectedGames.length} selected`}
        </p>

        <div className="flex gap-2">
          {selectionMode && (
            <button
              onClick={handleSelectAll}
              className="btn-retro text-xs px-3 py-1 bg-treasure-green"
            >
              {selectedGames.length === sortedGames.length ? '☐ Deselect All' : '☑ Select All'}
            </button>
          )}
          <button
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedGames([]);
            }}
            className={`btn-retro text-xs px-3 py-1 ${
              selectionMode ? 'bg-blood-red' : 'bg-pirate-gold'
            }`}
          >
            {selectionMode ? '✕ Exit Selection' : '☑ Select Mode'}
          </button>
        </div>
      </div>

      {/* Game Grid or List */}
      {viewMode === 'list' ? (
        <GameList games={sortedGames} onRefresh={handleRefresh} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {sortedGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onMetadataFetched={handleRefresh}
              selectable={selectionMode}
              selected={selectedGames.some((g) => g.id === game.id)}
              onToggleSelect={handleToggleSelection}
            />
          ))}
        </div>
      )}

      {/* Quick Actions Menu */}
      <QuickActionsMenu
        selectedGames={selectedGames}
        onClearSelection={handleClearSelection}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
