import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gameApi, screenshotApi, saveStateApi, type Game, type Screenshot } from '../services/api';
import { GameMetadataDisplay } from '../components/GameMetadataDisplay';
import { FavoriteButton } from '../components/FavoriteButton';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { ScreenshotUploadModal } from '../components/ScreenshotUploadModal';
import { GameVersionManager } from '../components/GameVersionManager';
import { EnhancedVideoPlayer } from '../components/EnhancedVideoPlayer';
import { BackgroundMusicPlayer } from '../components/BackgroundMusicPlayer';
import { CategorizedScreenshotGallery } from '../components/CategorizedScreenshotGallery';
import { BoxArt3DViewer } from '../components/BoxArt3DViewer';
import { EnhancedMediaUploadModal } from '../components/EnhancedMediaUploadModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';
import { PageTitle } from '../components/PageTitle';

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
  const [showEnhancedMediaModal, setShowEnhancedMediaModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showScrapeConfirm, setShowScrapeConfirm] = useState(false);

  // Save states for Continue button
  const [hasSaveStates, setHasSaveStates] = useState(false);
  const [loadingHasSaves, setLoadingHasSaves] = useState(true);

  useEffect(() => {
    if (!gameId) {
      navigate('/library');
      return;
    }
    loadGame();
  }, [gameId]);

  // Check if user has save states for this game
  useEffect(() => {
    const checkSaveStates = async () => {
      if (!user || !gameId) {
        setLoadingHasSaves(false);
        return;
      }

      try {
        const response = await saveStateApi.getSaveStatesByGame(gameId);
        setHasSaveStates(response.data.saveStates.length > 0);
      } catch (err) {
        console.error('Failed to check save states:', err);
      } finally {
        setLoadingHasSaves(false);
      }
    };

    checkSaveStates();
  }, [gameId, user]);

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

  const handleContinue = () => {
    if (game) {
      navigate(`/play/${game.id}?loadLatest=true`);
    }
  };

  const handleDelete = async () => {
    if (!game) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!game) return;

    try {
      await gameApi.deleteGame(game.id);
      toast.success('Game Deleted', `${game.title} has been removed from your library`);
      navigate('/library');
    } catch (error) {
      toast.error(error, 'Failed to delete game');
    }
  };

  const handleScrapeMetadata = async () => {
    if (!game) return;
    setShowScrapeConfirm(true);
  };

  const confirmScrape = async () => {
    if (!game) return;

    try {
      await gameApi.scrapeMetadata(game.id);
      toast.success('Metadata Updated', 'Game information and cover art have been refreshed');
      loadGame(); // Refresh
    } catch (error) {
      toast.error(error, 'Failed to fetch metadata');
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
      <PageTitle
        title={game.title}
        description={`Play ${game.title} for ${game.system} - View screenshots, manage save states, and more`}
      />

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
          {user && hasSaveStates && !loadingHasSaves && (
            <button
              onClick={handleContinue}
              className="btn-retro bg-treasure-green"
            >
              ⚡ CONTINUE
            </button>
          )}
          <button
            onClick={handlePlay}
            className={`btn-retro ${hasSaveStates && !loadingHasSaves ? '' : 'bg-treasure-green'}`}
          >
            {hasSaveStates && !loadingHasSaves ? '🆕 NEW GAME' : '▶ PLAY GAME'}
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
              <button
                onClick={() => setShowEnhancedMediaModal(true)}
                className="btn-retro text-sm bg-treasure-green"
              >
                🎬 UPLOAD MEDIA
              </button>
              <button onClick={handleDelete} className="btn-retro text-sm bg-blood-red">
                🗑️ DELETE GAME
              </button>
            </>
          )}
        </div>

        {/* 3D Box Art Viewer */}
        {(game.coverUrl || game.boxArtUrl) && (
          <div className="mt-8">
            <div className="border-4 border-wood-brown bg-sand-beige p-6">
              <h2 className="text-pixel text-lg text-ocean-dark mb-4">📦 3D BOX ART</h2>
              <BoxArt3DViewer
                frontCoverUrl={game.coverUrl || undefined}
                backCoverUrl={game.boxArtUrl || undefined}
                gameName={game.title}
              />
            </div>
          </div>
        )}

        {/* Categorized Screenshot Gallery */}
        {screenshots.length > 0 && (
          <div className="mt-8">
            <div className="border-4 border-wood-brown bg-sand-beige p-6">
              <h2 className="text-pixel text-lg text-ocean-dark mb-4">📸 SCREENSHOTS</h2>
              <CategorizedScreenshotGallery screenshots={screenshots} />
            </div>
          </div>
        )}

        {/* Enhanced Video Player */}
        {game.videoUrl && (
          <div className="mt-8">
            <div className="border-4 border-wood-brown bg-sand-beige p-6">
              <h2 className="text-pixel text-lg text-ocean-dark mb-4">🎬 TRAILER</h2>
              <EnhancedVideoPlayer
                videoUrl={game.videoUrl}
                posterUrl={game.coverUrl || undefined}
                title={`${game.title} Trailer`}
              />
            </div>
          </div>
        )}

        {/* Game Version Manager */}
        {game && (
          <div className="mt-8">
            <GameVersionManager gameId={game.id} isAdmin={user?.role === 'ADMIN'} />
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
            toast.success('Added to Collection', `${game.title} has been added to your collection`);
            setShowCollectionModal(false);
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

      {/* Enhanced Media Upload Modal */}
      {showEnhancedMediaModal && game && (
        <EnhancedMediaUploadModal
          gameId={game.id}
          gameName={game.title}
          onClose={() => setShowEnhancedMediaModal(false)}
          onSuccess={loadGame}
        />
      )}

      {/* Background Music Player */}
      {game?.backgroundMusicUrl && (
        <BackgroundMusicPlayer
          musicUrl={game.backgroundMusicUrl}
          gameName={game.title}
          autoPlay={false}
          loop={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      {game && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete Game"
          message={`Are you sure you want to delete "${game.title}"? This action cannot be undone and will remove all associated save states, screenshots, and metadata.`}
          confirmText="DELETE"
          cancelText="CANCEL"
          type="danger"
        >
          <div className="flex items-center gap-3">
            {game.coverUrl && (
              <img
                src={game.coverUrl}
                alt={game.title}
                className="h-16 w-16 border-2 border-wood-brown object-cover"
              />
            )}
            <div>
              <div className="text-pixel text-sm text-ocean-dark font-bold">
                {game.title}
              </div>
              <div className="text-pixel text-xs text-wood-brown">
                {game.system?.toUpperCase()}
              </div>
            </div>
          </div>
        </ConfirmationModal>
      )}

      {/* Scrape Metadata Confirmation Modal */}
      {game && (
        <ConfirmationModal
          isOpen={showScrapeConfirm}
          onClose={() => setShowScrapeConfirm(false)}
          onConfirm={confirmScrape}
          title="Fetch Metadata"
          message={`Fetch updated game information and cover art for "${game.title}"? This will overwrite existing metadata.`}
          confirmText="FETCH"
          cancelText="CANCEL"
          type="info"
        />
      )}
    </div>
  );
}
