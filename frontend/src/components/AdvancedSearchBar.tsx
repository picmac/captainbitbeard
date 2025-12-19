import { useState, useEffect } from 'react';
import {
  type Game,
  type SavedSearch,
  type AdvancedSearchParams,
  advancedSearchApi,
  savedSearchApi,
} from '../services/api';

interface AdvancedSearchBarProps {
  onResults: (games: Game[]) => void;
}

export function AdvancedSearchBar({ onResults }: AdvancedSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  // Search Parameters
  const [query, setQuery] = useState('');
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [developers, setDevelopers] = useState<string[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState<string>('');
  const [yearTo, setYearTo] = useState('');
  const [players, setPlayers] = useState<string>('');

  const [searching, setSearching] = useState(false);

  const systems = [
    'nes', 'snes', 'gb', 'gbc', 'gba', 'n64', 'nds',
    'genesis', 'sms', 'gg', 'psx', 'psp'
  ];

  const genres = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Puzzle',
    'Sports', 'Racing', 'Fighting', 'Platformer', 'Shooter'
  ];

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      const response = await savedSearchApi.getUserSavedSearches();
      setSavedSearches(response.data.savedSearches);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  };

  const handleSearch = async () => {
    setSearching(true);

    try {
      const params: AdvancedSearchParams = {
        query: query || undefined,
        systems: selectedSystems.length > 0 ? selectedSystems : undefined,
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        developers: developers.length > 0 ? developers : undefined,
        publishers: publishers.length > 0 ? publishers : undefined,
        yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
        yearTo: yearTo ? parseInt(yearTo) : undefined,
        players: players ? parseInt(players) : undefined,
      };

      const response = await advancedSearchApi.search(params);
      onResults(response.data.games);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    try {
      await savedSearchApi.createSavedSearch({
        name: saveSearchName,
        query,
        systems: selectedSystems,
        genres: selectedGenres,
        developers,
        publishers,
        yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
        yearTo: yearTo ? parseInt(yearTo) : undefined,
        players: players ? parseInt(players) : undefined,
      });

      alert('✅ Search saved successfully!');
      setSaveSearchName('');
      setShowSaveModal(false);
      loadSavedSearches();
    } catch (error) {
      console.error('Failed to save search:', error);
      alert('Failed to save search');
    }
  };

  const handleLoadSearch = async (search: SavedSearch) => {
    setQuery(search.query || '');
    setSelectedSystems(search.systems);
    setSelectedGenres(search.genres);
    setDevelopers(search.developers);
    setPublishers(search.publishers);
    setYearFrom(search.yearFrom ? search.yearFrom.toString() : '');
    setYearTo(search.yearTo ? search.yearTo.toString() : '');
    setPlayers(search.players ? search.players.toString() : '');
    setShowSavedSearches(false);

    // Execute the search
    try {
      const response = await savedSearchApi.executeSavedSearch(search);
      onResults(response.data.games);
    } catch (error) {
      console.error('Failed to execute saved search:', error);
    }
  };

  const handleDeleteSearch = async (id: string) => {
    if (!confirm('Delete this saved search?')) return;

    try {
      await savedSearchApi.deleteSavedSearch(id);
      loadSavedSearches();
    } catch (error) {
      console.error('Failed to delete search:', error);
      alert('Failed to delete search');
    }
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedSystems([]);
    setSelectedGenres([]);
    setDevelopers([]);
    setPublishers([]);
    setYearFrom('');
    setYearTo('');
    setPlayers('');
  };

  return (
    <div className="border-4 border-wood-brown bg-sand-beige p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-pixel text-sm text-ocean-dark">🔍 ADVANCED SEARCH</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            className="btn-retro text-[10px] px-2 py-1 bg-treasure-green"
            title="Saved Searches"
          >
            💾 ({savedSearches.length})
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-retro text-[10px] px-2 py-1"
          >
            {isExpanded ? '▲ COLLAPSE' : '▼ EXPAND'}
          </button>
        </div>
      </div>

      {/* Saved Searches Dropdown */}
      {showSavedSearches && (
        <div className="mb-3 border-2 border-wood-brown bg-skull-white p-2 max-h-60 overflow-y-auto">
          {savedSearches.length === 0 ? (
            <p className="text-pixel text-[10px] text-ocean-dark/50 text-center py-2">
              No saved searches yet
            </p>
          ) : (
            savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-2 hover:bg-pirate-gold/20 border-b-2 border-wood-brown last:border-b-0"
              >
                <button
                  onClick={() => handleLoadSearch(search)}
                  className="text-pixel text-[10px] text-ocean-dark text-left flex-1"
                >
                  {search.name}
                </button>
                <button
                  onClick={() => handleDeleteSearch(search.id)}
                  className="btn-retro text-[8px] px-2 py-1 bg-blood-red ml-2"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Main Search Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search title, description, developer, publisher..."
        className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs text-ocean-dark mb-3"
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-3 mb-3">
          {/* Systems */}
          <div>
            <label className="text-pixel text-[10px] text-ocean-dark block mb-1">SYSTEMS:</label>
            <div className="flex flex-wrap gap-1">
              {systems.map((system) => (
                <button
                  key={system}
                  onClick={() => {
                    if (selectedSystems.includes(system)) {
                      setSelectedSystems(selectedSystems.filter((s) => s !== system));
                    } else {
                      setSelectedSystems([...selectedSystems, system]);
                    }
                  }}
                  className={`btn-retro text-[8px] px-2 py-1 ${
                    selectedSystems.includes(system) ? 'bg-pirate-gold' : 'bg-wood-brown'
                  }`}
                >
                  {system.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="text-pixel text-[10px] text-ocean-dark block mb-1">GENRES:</label>
            <div className="flex flex-wrap gap-1">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    if (selectedGenres.includes(genre)) {
                      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
                    } else {
                      setSelectedGenres([...selectedGenres, genre]);
                    }
                  }}
                  className={`btn-retro text-[8px] px-2 py-1 ${
                    selectedGenres.includes(genre) ? 'bg-pirate-gold' : 'bg-wood-brown'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-pixel text-[10px] text-ocean-dark block mb-1">YEAR FROM:</label>
              <input
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="1980"
                className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-[10px] text-ocean-dark"
                min="1970"
                max="2030"
              />
            </div>
            <div>
              <label className="text-pixel text-[10px] text-ocean-dark block mb-1">YEAR TO:</label>
              <input
                type="number"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                placeholder="2024"
                className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-[10px] text-ocean-dark"
                min="1970"
                max="2030"
              />
            </div>
          </div>

          {/* Players */}
          <div>
            <label className="text-pixel text-[10px] text-ocean-dark block mb-1">PLAYERS:</label>
            <select
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-[10px] text-ocean-dark"
            >
              <option value="">Any</option>
              <option value="1">1 Player</option>
              <option value="2">2 Players</option>
              <option value="3">3 Players</option>
              <option value="4">4+ Players</option>
            </select>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          disabled={searching}
          className="btn-retro text-[10px] flex-1 bg-treasure-green"
        >
          {searching ? '⏳ SEARCHING...' : '🔍 SEARCH'}
        </button>
        <button
          onClick={() => setShowSaveModal(true)}
          className="btn-retro text-[10px] px-3 bg-pirate-gold"
          title="Save this search"
        >
          💾 SAVE
        </button>
        <button
          onClick={clearFilters}
          className="btn-retro text-[10px] px-3 bg-wood-brown"
          title="Clear all filters"
        >
          ✕
        </button>
      </div>

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="border-4 border-wood-brown bg-sand-beige p-6 max-w-md w-full">
            <h3 className="text-pixel text-sm text-ocean-dark mb-3">💾 SAVE SEARCH</h3>
            <input
              type="text"
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Search name..."
              className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs text-ocean-dark mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSaveSearch} className="btn-retro text-[10px] flex-1">
                ✓ SAVE
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveSearchName('');
                }}
                className="btn-retro text-[10px] px-4 bg-blood-red"
              >
                ✕ CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
