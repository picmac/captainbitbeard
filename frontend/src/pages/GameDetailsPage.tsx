import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gameApi, screenshotApi, type Game, type Screenshot } from '../services/api';
import { GameMetadataDisplay } from '../components/GameMetadataDisplay';
import { FavoriteButton } from '../components/FavoriteButton';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { ImageGallery } from '../components/ImageGallery';
import { ScreenshotUploadModal } from '../components/ScreenshotUploadModal';
import { useAuth } from '../context/AuthContext';

export function GameDetailsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (!gameId) {
      navigate('/library');
      return;
    }
    loadGame();
  }, [gameId]);

  const loadGame = async () => {
    if (!gameId) return;

    setLoading(true);
    setError('');

    try {
      const response = await gameApi.getGame(gameId);
      setGame(response.data.game);
      await loadScreenshots();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const loadScreenshots = async () => {
    if (!gameId) return;

    try {
      const response = await screenshotApi.getScreenshots(gameId);
      setScreenshots(response.data.screenshots);
    } catch (err) {
      console.error('Failed to load screenshots:', err);
    }
  };

  const handlePlay = () => {
    if (game) {
      navigate(`/play/${game.id}`);
    }
  };

  const handleDelete = async () => {
    if (!game) return;

    if (!confirm(`Delete "${game.title}"? This cannot be undone!`)) {
      return;
    }

    try {
      await gameApi.deleteGame(game.id);
      alert(`✅ ${game.title} deleted successfully!`);
      navigate('/library');
    } catch (error) {
      alert(`❌ Failed to delete game: ${error}`);
    }
  };

  const handleScrapeMetadata = async () => {
    if (!game) return;

    if (!confirm(`Fetch metadata and cover for "${game.title}"?`)) {
      return;
    }

    try {
      await gameApi.scrapeMetadata(game.id);
      alert(`✅ Metadata fetched successfully!`);
      loadGame(); // Refresh
    } catch (error) {
      alert(`❌ Failed to fetch metadata: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-pixel text-sm text-skull-white">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen p-4">
        <div className="border-4 border-blood-red bg-blood-red/20 p-6 text-center max-w-2xl mx-auto mt-8">
          <p className="text-pixel text-sm text-skull-white">❌ {error || 'Game not found'}</p>
          <Link to="/library" className="btn-retro mt-4 inline-block text-xs">
            ← BACK TO LIBRARY
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/library" className="btn-retro text-xs inline-block mb-4">
            ← BACK TO LIBRARY
          </Link>
          <h1 className="text-pixel text-2xl text-pirate-gold text-center">
            {game.title}
          </h1>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Cover Image */}
          <div>
            <div className="border-4 border-wood-brown bg-sand-beige p-4">
              <div className="pixel-art aspect-square bg-ocean-dark overflow-hidden">
                {game.coverUrl ? (
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="pixel-art w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-pixel text-6xl">🎮</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Metadata */}
          <div>
            <div className="border-4 border-wood-brown bg-sand-beige p-4">
              <GameMetadataDisplay game={game} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button onClick={handlePlay} className="btn-retro bg-treasure-green">
            ▶ PLAY GAME
          </button>

          {user && (
            <>
              <div className="inline-block">
                <FavoriteButton gameId={game.id} onToggle={loadGame} />
              </div>
              <button
                onClick={() => setShowCollectionModal(true)}
                className="btn-retro text-sm"
              >
                📚 ADD TO COLLECTION
              </button>
            </>
          )}

          {user && user.role === 'ADMIN' && (
            <>
              {!game.coverUrl && (
                <button
                  onClick={handleScrapeMetadata}
                  className="btn-retro text-sm bg-treasure-green"
                >
                  🎨 FETCH METADATA
                </button>
              )}
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-retro text-sm bg-pirate-gold"
              >
                📸 ADD SCREENSHOTS
              </button>
              <button onClick={handleDelete} className="btn-retro text-sm bg-blood-red">
                🗑️ DELETE GAME
              </button>
            </>
          )}
        </div>

        {/* Image Gallery */}
        {(screenshots.length > 0 ||
          game.coverUrl ||
          game.boxArtUrl ||
          game.backgroundUrl ||
          game.logoUrl) && (
          <div className="mt-8">
            <div className="border-4 border-wood-brown bg-sand-beige p-6">
              <h2 className="text-pixel text-lg text-ocean-dark mb-4">📸 MEDIA GALLERY</h2>
              <ImageGallery
                screenshots={screenshots}
                coverUrl={game.coverUrl}
                boxArtUrl={game.boxArtUrl}
                backgroundUrl={game.backgroundUrl}
                logoUrl={game.logoUrl}
              />
            </div>
          </div>
        )}

        {/* Video Section */}
        {game.videoUrl && (
          <div className="mt-8">
            <div className="border-4 border-wood-brown bg-sand-beige p-6">
              <h2 className="text-pixel text-lg text-ocean-dark mb-4">🎬 VIDEO</h2>
              <div className="aspect-video bg-black">
                <video
                  src={game.videoUrl}
                  controls
                  className="w-full h-full"
                  poster={game.coverUrl || undefined}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add to Collection Modal */}
      {showCollectionModal && game && (
        <AddToCollectionModal
          gameId={game.id}
          gameName={game.title}
          onClose={() => setShowCollectionModal(false)}
          onSuccess={() => {
            alert(`✅ ${game.title} added to collection!`);
          }}
        />
      )}

      {/* Screenshot Upload Modal */}
      {showUploadModal && game && (
        <ScreenshotUploadModal
          gameId={game.id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={loadScreenshots}
        />
      )}
    </div>
  );
}
