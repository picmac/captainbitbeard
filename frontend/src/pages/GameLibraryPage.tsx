import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GameGrid } from '../components/GameGrid';
import { SortControls } from '../components/SortControls';
import { AdvancedFilters, type FilterObject } from '../components/AdvancedFilters';
import { SearchBar } from '../components/SearchBar';
import { ContinuePlaying } from '../components/ContinuePlaying';
import { AdvancedSearchBar } from '../components/AdvancedSearchBar';
import { type Game } from '../services/api';
import { getSystemsByManufacturer } from '../constants/systems';
import { Tooltip } from '../components/Tooltip';
import { OnboardingTour, useOnboarding } from '../components/OnboardingTour';
import { HelpModal } from '../components/HelpModal';
import { PageTitle } from '../components/PageTitle';

export function GameLibraryPage() {
  const systemsByManufacturer = getSystemsByManufacturer();
  const { showTour, completeTour } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterObject>({
    systems: [],
    genre: undefined,
    yearFrom: undefined,
    yearTo: undefined,
    players: undefined,
  });
  const [advancedSearchResults, setAdvancedSearchResults] = useState<Game[] | null>(null);

  const handleAdvancedSearchResults = (games: Game[]) => {
    setAdvancedSearchResults(games);
  };

  return (
    <div className="min-h-screen p-4">
      <PageTitle
        title="Game Library"
        description="Browse and play your retro game collection from Nintendo, Sega, PlayStation, and more"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-pixel text-center text-2xl text-pirate-gold">
            🎮 TREASURE CHEST
          </h1>
          <Tooltip content="Get help and view documentation (Keyboard: Shift+?)">
            <button
              onClick={() => setShowHelpModal(true)}
              className="btn-retro text-xs px-3 py-2 bg-treasure-green"
            >
              📖 HELP
            </button>
          </Tooltip>
        </div>

        {/* Search & Filter */}
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Search */}
          <div data-tour="search-bar">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* System Filter */}
          <select
            id="system-filter"
            name="system-filter"
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="w-full border-4 border-wood-brown bg-sand-beige p-3 text-sm text-ocean-dark"
          >
            <option value="">All Systems</option>
            {Array.from(systemsByManufacturer.entries()).map(([manufacturer, systems]) => (
              <optgroup key={manufacturer} label={manufacturer}>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
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
      <div className="mx-auto max-w-7xl" data-tour="game-grid">
        <ContinuePlaying />

        {/* Advanced Search Bar */}
        <AdvancedSearchBar onResults={handleAdvancedSearchResults} />

        {advancedSearchResults ? (
          /* Show Advanced Search Results */
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-pixel text-xs text-skull-white">
                📦 {advancedSearchResults.length} result{advancedSearchResults.length !== 1 ? 's' : ''} from advanced search
              </p>
              <button
                onClick={() => setAdvancedSearchResults(null)}
                className="btn-retro text-xs px-3 py-1 bg-blood-red"
              >
                ✕ CLEAR SEARCH
              </button>
            </div>
            <SortControls
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <GameGrid
              system={undefined}
              searchQuery={undefined}
              favoritesOnly={false}
              sortBy={sortBy}
              viewMode={viewMode}
              advancedFilters={{
                systems: [],
                genre: undefined,
                yearFrom: undefined,
                yearTo: undefined,
                players: undefined,
              }}
              customGames={advancedSearchResults}
            />
          </>
        ) : (
          /* Show Regular Library View */
          <>
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
          </>
        )}
      </div>

      {/* Navigation Links */}
      <div className="mt-8 flex gap-4 justify-center flex-wrap">
        <Tooltip content="Navigate to Collections (Keyboard: Shift+C)">
          <Link to="/collections" className="btn-retro text-xs" data-tour="collections-link">
            📚 MY COLLECTIONS
          </Link>
        </Tooltip>
        <Tooltip content="Navigate to Save States (Keyboard: Shift+S)">
          <Link to="/save-states" className="btn-retro text-xs" data-tour="save-states-link">
            💾 MY SAVES
          </Link>
        </Tooltip>
        <Tooltip content="Navigate to Profile (Keyboard: Shift+P)">
          <Link to="/profile" className="btn-retro text-xs">
            👤 MY PROFILE
          </Link>
        </Tooltip>
        <Tooltip content="Navigate to Admin Panel (Keyboard: Shift+A)">
          <Link to="/admin" className="btn-retro text-xs">
            ⚙️ ADMIN PANEL
          </Link>
        </Tooltip>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour run={showTour} onComplete={completeTour} />

      {/* Help Modal */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}
