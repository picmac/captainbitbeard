import { useState } from 'react';
import { SUPPORTED_SYSTEMS } from '../constants/systems';

export interface FilterObject {
  systems: string[];
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  players?: string;
}

interface AdvancedFiltersProps {
  filters: FilterObject;
  onFiltersChange: (filters: FilterObject) => void;
}

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Convert all systems to filter format
  const allSystems = SUPPORTED_SYSTEMS.map(sys => ({
    value: sys.id,
    label: sys.name,
    manufacturer: sys.manufacturer,
  }));

  const genres = [
    'Action',
    'Adventure',
    'RPG',
    'Strategy',
    'Sports',
    'Racing',
    'Puzzle',
    'Fighting',
    'Shooter',
    'Platform',
  ];

  const handleSystemToggle = (system: string) => {
    const newSystems = filters.systems.includes(system)
      ? filters.systems.filter((s) => s !== system)
      : [...filters.systems, system];

    onFiltersChange({ ...filters, systems: newSystems });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      systems: [],
      genre: undefined,
      yearFrom: undefined,
      yearTo: undefined,
      players: undefined,
    });
  };

  const hasActiveFilters =
    filters.systems.length > 0 ||
    filters.genre ||
    filters.yearFrom ||
    filters.yearTo ||
    filters.players;

  return (
    <div className="mb-4">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-retro w-full text-sm flex items-center justify-between"
      >
        <span>🔍 ADVANCED FILTERS {hasActiveFilters && `(${filters.systems.length + (filters.genre ? 1 : 0) + (filters.yearFrom || filters.yearTo ? 1 : 0) + (filters.players ? 1 : 0)} active)`}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="border-4 border-wood-brown bg-sand-beige p-4 mt-2 space-y-4">
          {/* Multi-Select Systems */}
          <div>
            <p className="text-pixel text-xs text-ocean-dark mb-2">SYSTEMS</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {allSystems.map((sys) => (
                <button
                  key={sys.value}
                  onClick={() => handleSystemToggle(sys.value)}
                  className={`text-pixel text-[8px] px-2 py-1 border-2 transition-colors ${
                    filters.systems.includes(sys.value)
                      ? 'bg-pirate-gold border-wood-brown text-ocean-dark'
                      : 'bg-skull-white border-wood-brown text-ocean-dark hover:bg-sand-beige'
                  }`}
                >
                  {sys.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Filter */}
          <div>
            <label htmlFor="genre-filter" className="text-pixel text-xs text-ocean-dark block mb-2">
              GENRE
            </label>
            <select
              id="genre-filter"
              value={filters.genre || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  genre: e.target.value || undefined,
                })
              }
              className="w-full border-2 border-wood-brown bg-skull-white p-2 text-xs text-ocean-dark"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Release Year Range */}
          <div>
            <p className="text-pixel text-xs text-ocean-dark mb-2">RELEASE YEAR</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="From"
                value={filters.yearFrom || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    yearFrom: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full border-2 border-wood-brown bg-skull-white p-2 text-xs text-ocean-dark"
                min="1970"
                max="2025"
              />
              <input
                type="number"
                placeholder="To"
                value={filters.yearTo || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    yearTo: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full border-2 border-wood-brown bg-skull-white p-2 text-xs text-ocean-dark"
                min="1970"
                max="2025"
              />
            </div>
          </div>

          {/* Player Count */}
          <div>
            <p className="text-pixel text-xs text-ocean-dark mb-2">PLAYERS</p>
            <div className="flex gap-2">
              {['1', '2', '3-4', '4+'].map((playerOption) => (
                <button
                  key={playerOption}
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      players: filters.players === playerOption ? undefined : playerOption,
                    })
                  }
                  className={`text-pixel text-xs px-3 py-2 border-2 flex-1 transition-colors ${
                    filters.players === playerOption
                      ? 'bg-pirate-gold border-wood-brown text-ocean-dark'
                      : 'bg-skull-white border-wood-brown text-ocean-dark hover:bg-sand-beige'
                  }`}
                >
                  {playerOption}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="btn-retro w-full text-xs bg-blood-red"
            >
              ✖ CLEAR ALL FILTERS
            </button>
          )}
        </div>
      )}
    </div>
  );
}
