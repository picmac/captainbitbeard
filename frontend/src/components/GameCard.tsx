import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi, type Game } from '../services/api';

interface GameCardProps {
  game: Game;
  onMetadataFetched?: () => void;
}

export function GameCard({ game, onMetadataFetched }: GameCardProps) {
  const [scraping, setScraping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const handlePlayGame = () => {
    navigate(`/play/${game.id}`);
  };

  const handleScrapeMetadata = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Fetch metadata and cover for "${game.title}"?`)) {
      return;
    }

    setScraping(true);
    try {
      await gameApi.scrapeMetadata(game.id);
      alert(`✅ Metadata fetched successfully for ${game.title}!`);
      if (onMetadataFetched) {
        onMetadataFetched();
      }
    } catch (error) {
      alert(`❌ Failed to fetch metadata: ${error}`);
    } finally {
      setScraping(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Delete "${game.title}"? This cannot be undone!`)) {
      return;
    }

    try {
      await gameApi.deleteGame(game.id);
      alert(`✅ ${game.title} deleted successfully!`);
      if (onMetadataFetched) {
        onMetadataFetched();
      }
    } catch (error) {
      alert(`❌ Failed to delete game: ${error}`);
    }
  };

  return (
    <div
      className="group relative cursor-pointer transition-transform hover:scale-105"
      onClick={handlePlayGame}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Game Card */}
      <div className="border-4 border-wood-brown bg-sand-beige">
        {/* Cover Image */}
        <div className="pixel-art aspect-square overflow-hidden bg-ocean-dark relative">
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

          {/* Scraping Overlay */}
          {scraping && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="loading-spinner"></div>
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
          {game.description && (
            <p className="text-pixel mt-1 text-[8px] text-ocean-dark line-clamp-2">
              {game.description}
            </p>
          )}
          {(game.developer || game.publisher) && (
            <p className="text-pixel mt-1 text-[7px] text-wood-brown">
              {game.developer && `Dev: ${game.developer}`}
              {game.developer && game.publisher && ' • '}
              {game.publisher && `Pub: ${game.publisher}`}
            </p>
          )}
          {game.releaseDate && (
            <p className="text-pixel mt-1 text-[7px] text-wood-brown">
              {new Date(game.releaseDate).getFullYear()}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons (visible on hover) */}
      {showActions && (
        <div className="absolute top-2 right-2 space-y-1 z-10">
          {!game.coverUrl && (
            <button
              onClick={handleScrapeMetadata}
              disabled={scraping}
              className="btn-retro text-[10px] px-2 py-1 bg-treasure-green"
              title="Fetch cover and metadata from ScreenScraper"
            >
              {scraping ? '⏳' : '🎨'}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="btn-retro text-[10px] px-2 py-1 bg-blood-red block"
            title="Delete game"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Play Button Overlay (visible on hover on desktop) */}
      <div className="hidden group-hover:block">
        <div className="relative -mt-16 flex justify-center">
          <button className="btn-retro z-10 text-xs">▶ PLAY</button>
        </div>
      </div>
    </div>
  );
}
