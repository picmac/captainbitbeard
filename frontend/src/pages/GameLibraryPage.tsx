import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GameGrid } from '../components/GameGrid';

export function GameLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');

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
          <input
            type="text"
            id="game-search"
            name="search"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-sm text-ocean-dark"
          />

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
            <option value="gba">Game Boy Advance</option>
            <option value="n64">Nintendo 64</option>
            <option value="genesis">Sega Genesis</option>
            <option value="psx">PlayStation 1</option>
          </select>
        </div>
      </div>

      {/* Game Grid */}
      <div className="mx-auto max-w-7xl">
        <GameGrid
          system={selectedSystem || undefined}
          searchQuery={searchQuery || undefined}
        />
      </div>

      {/* Admin Link */}
      <div className="mt-8 text-center">
        <Link to="/admin" className="btn-retro text-xs">
          ⚙️ ADMIN PANEL
        </Link>
      </div>
    </div>
  );
}
