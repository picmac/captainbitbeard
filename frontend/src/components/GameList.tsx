import { useNavigate } from 'react-router-dom';
import { gameApi, type Game } from '../services/api';
import { FavoriteButton } from './FavoriteButton';

interface GameListProps {
  games: Game[];
  onRefresh: () => void;
}

export function GameList({ games, onRefresh }: GameListProps) {
  const navigate = useNavigate();

  const handleViewDetails = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  const handlePlayGame = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    navigate(`/play/${gameId}`);
  };

  const handleScrapeMetadata = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();

    if (!confirm(`Fetch metadata and cover for "${game.title}"?`)) {
      return;
    }

    try {
      await gameApi.scrapeMetadata(game.id);
      alert(`✅ Metadata fetched successfully for ${game.title}!`);
      onRefresh();
    } catch (error) {
      alert(`❌ Failed to fetch metadata: ${error}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();

    if (!confirm(`Delete "${game.title}"? This cannot be undone!`)) {
      return;
    }

    try {
      await gameApi.deleteGame(game.id);
      alert(`✅ ${game.title} deleted successfully!`);
      onRefresh();
    } catch (error) {
      alert(`❌ Failed to delete game: ${error}`);
    }
  };

  return (
    <div className="space-y-2">
      {games.map((game) => (
        <div
          key={game.id}
          className="border-4 border-wood-brown bg-sand-beige p-3 cursor-pointer hover:bg-pirate-gold/20 transition-colors relative"
          onClick={() => handleViewDetails(game.id)}
        >
          <div className="flex gap-4">
            {/* Cover Image */}
            <div className="pixel-art w-20 h-20 flex-shrink-0 bg-ocean-dark overflow-hidden">
              {game.coverUrl ? (
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="pixel-art w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-pixel text-xl">🎮</span>
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-pixel text-sm text-ocean-dark font-bold truncate">
                {game.title}
              </h3>
              <p className="text-pixel text-[10px] uppercase text-wood-brown mt-1">
                {game.system}
              </p>
              {game.description && (
                <p className="text-pixel text-[10px] text-ocean-dark mt-1 line-clamp-2">
                  {game.description}
                </p>
              )}
              <div className="flex gap-3 mt-2">
                {game.developer && (
                  <p className="text-pixel text-[8px] text-wood-brown">
                    Dev: {game.developer}
                  </p>
                )}
                {game.publisher && (
                  <p className="text-pixel text-[8px] text-wood-brown">
                    Pub: {game.publisher}
                  </p>
                )}
                {game.releaseDate && (
                  <p className="text-pixel text-[8px] text-wood-brown">
                    {new Date(game.releaseDate).getFullYear()}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <FavoriteButton gameId={game.id} onToggle={onRefresh} />
              {!game.coverUrl && (
                <button
                  onClick={(e) => handleScrapeMetadata(e, game)}
                  className="btn-retro text-[10px] px-2 py-1 bg-treasure-green"
                  title="Fetch cover and metadata"
                >
                  🎨
                </button>
              )}
              <button
                onClick={(e) => handleDelete(e, game)}
                className="btn-retro text-[10px] px-2 py-1 bg-blood-red"
                title="Delete game"
              >
                🗑️
              </button>
              <button
                onClick={(e) => handlePlayGame(e, game.id)}
                className="btn-retro text-[10px] px-2 py-1 bg-treasure-green"
                title="Play game"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
