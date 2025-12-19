import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi, type Game } from '../services/api';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<Game[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recent_searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value || value.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await gameApi.searchGames(value);
        setSuggestions(response.data.games.slice(0, 5)); // Top 5 results
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce: wait 300ms after user stops typing
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle ESC key to close dropdown
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowDropdown(true);
  };

  const handleSelectGame = (game: Game) => {
    // Save to recent searches
    addToRecentSearches(game.title);
    setShowDropdown(false);
    onChange('');
    navigate(`/game/${game.id}`);
  };

  const handleSelectRecentSearch = (query: string) => {
    onChange(query);
    setShowDropdown(false);
  };

  const addToRecentSearches = (query: string) => {
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const clearSearch = () => {
    onChange('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-pirate-gold text-ocean-dark">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const showSuggestions = showDropdown && value.length >= 2 && suggestions.length > 0;
  const showRecents = showDropdown && value.length === 0 && recentSearches.length > 0;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id="game-search"
          name="search"
          placeholder="Search games..."
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="w-full border-4 border-wood-brown bg-sand-beige p-3 pr-10 text-sm text-ocean-dark"
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ocean-dark hover:text-blood-red text-xl"
            title="Clear search"
          >
            ✖
          </button>
        )}
      </div>

      {/* Dropdown */}
      {(showSuggestions || showRecents) && (
        <div className="absolute z-50 w-full mt-1 border-4 border-wood-brown bg-sand-beige shadow-lg max-h-80 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="p-3 text-center">
              <p className="text-pixel text-xs text-ocean-dark">Searching...</p>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && !loading && (
            <div>
              <p className="text-pixel text-[8px] uppercase text-wood-brown p-2 bg-sand-beige/50">
                Search Results
              </p>
              {suggestions.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className="w-full p-2 flex gap-3 items-center hover:bg-pirate-gold/20 transition-colors text-left border-t-2 border-wood-brown"
                >
                  {/* Small Cover */}
                  <div className="pixel-art w-12 h-12 flex-shrink-0 bg-ocean-dark">
                    {game.coverUrl ? (
                      <img
                        src={game.coverUrl}
                        alt={game.title}
                        className="pixel-art w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-pixel text-xs">🎮</span>
                      </div>
                    )}
                  </div>

                  {/* Game Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-pixel text-xs text-ocean-dark truncate">
                      {highlightMatch(game.title, value)}
                    </p>
                    <p className="text-pixel text-[8px] uppercase text-wood-brown mt-1">
                      {game.system}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {showRecents && !loading && (
            <div>
              <p className="text-pixel text-[8px] uppercase text-wood-brown p-2 bg-sand-beige/50">
                Recent Searches
              </p>
              {recentSearches.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectRecentSearch(query)}
                  className="w-full p-2 text-left hover:bg-pirate-gold/20 transition-colors border-t-2 border-wood-brown"
                >
                  <p className="text-pixel text-xs text-ocean-dark">🔍 {query}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
