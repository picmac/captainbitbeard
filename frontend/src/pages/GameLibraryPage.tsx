import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GameGrid } from '../components/GameGrid';
import { SortControls } from '../components/SortControls';
import { AdvancedFilters, type FilterObject } from '../components/AdvancedFilters';
import { SearchBar } from '../components/SearchBar';
import { ContinuePlaying } from '../components/ContinuePlaying';

export function GameLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [advancedFilters, setAdvancedFilters] = useState<FilterObject>({
    systems: [],
    genre: undefined,
    yearFrom: undefined,
    yearTo: undefined,
    players: undefined,
  });

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-pixel mb-4 text-center text-2xl text-pirate-gold">
          🎮 TREASURE CHEST
        </h1>

        {/* Search & Filter */}
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Search */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* System Filter */}
          <select
            id="system-filter"
            name="system-filter"
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-sm text-ocean-dark"
          >
            <option value="">All Systems</option>
            <option value="nes">Nintendo (NES)</option>
            <option value="snes">Super Nintendo (SNES)</option>
            <option value="gb">Game Boy</option>
            <option value="gbc">Game Boy Color (GBC)</option>
            <option value="gba">Game Boy Advance (GBA)</option>
            <option value="n64">Nintendo 64 (N64)</option>
            <option value="nds">Nintendo DS (NDS)</option>
            <option value="genesis">Sega Genesis</option>
            <option value="sms">Sega Master System (SMS)</option>
            <option value="gg">Sega Game Gear (GG)</option>
            <option value="psx">PlayStation 1 (PSX)</option>
            <option value="psp">PlayStation Portable (PSP)</option>
          </select>

          {/* Favorites Filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`btn-retro w-full text-sm ${
              showFavoritesOnly ? 'bg-blood-red' : 'bg-pirate-gold'
            }`}
          >
            {showFavoritesOnly ? '❤️ SHOWING FAVORITES' : '🤍 SHOW ALL GAMES'}
          </button>
        </div>
      </div>

      {/* Game Grid */}
      <div className="mx-auto max-w-7xl">
        <ContinuePlaying />
        <AdvancedFilters filters={advancedFilters} onFiltersChange={setAdvancedFilters} />
        <SortControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <GameGrid
          system={selectedSystem || undefined}
          searchQuery={searchQuery || undefined}
          favoritesOnly={showFavoritesOnly}
          sortBy={sortBy}
          viewMode={viewMode}
          advancedFilters={advancedFilters}
        />
      </div>

      {/* Navigation Links */}
      <div className="mt-8 flex gap-4 justify-center flex-wrap">
        <Link to="/collections" className="btn-retro text-xs">
          📚 MY COLLECTIONS
        </Link>
        <Link to="/save-states" className="btn-retro text-xs">
          💾 MY SAVES
        </Link>
        <Link to="/profile" className="btn-retro text-xs">
          👤 MY PROFILE
        </Link>
        <Link to="/admin" className="btn-retro text-xs">
          ⚙️ ADMIN PANEL
        </Link>
      </div>
    </div>
  );
}
