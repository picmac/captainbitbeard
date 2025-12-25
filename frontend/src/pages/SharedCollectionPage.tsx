import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collectionShareApi, type Collection } from '../services/api';
import { PageTitle } from '../components/PageTitle';

export function SharedCollectionPage() {
  const { shareLink } = useParams<{ shareLink: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shareLink) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }
    loadCollection();
  }, [shareLink]);

  const loadCollection = async () => {
    if (!shareLink) return;

    setLoading(true);
    try {
      const response = await collectionShareApi.getByShareLink(shareLink);
      setCollection(response.data.collection);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Collection not found or not accessible');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (gameId: string) => {
    navigate(`/play/${gameId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageTitle
          title="Loading Collection"
          description="Loading shared collection..."
        />
        <div className="text-pixel text-pirate-gold text-xl">LOADING...</div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen p-4">
        <PageTitle
          title="Collection Not Found"
          description="The requested collection could not be found or is not accessible"
        />
        <div className="max-w-4xl mx-auto">
          <div className="border-4 border-wood-brown bg-sand-beige p-6 text-center">
            <p className="text-pixel text-wood-brown mb-4">
              {error || 'Collection not found'}
            </p>
            <Link to="/" className="btn-retro text-xs">
              ← GO HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <PageTitle
        title={`Shared: ${collection.name}`}
        description={collection.description || `A shared collection with ${collection.games.length} games`}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="mx-auto max-w-7xl">
          <Link to="/" className="btn-retro text-xs inline-block mb-4">
            ← GO HOME
          </Link>
        </div>
      </div>

      {/* Collection Info */}
      <div className="mx-auto max-w-7xl mb-6">
        <div className="border-4 border-wood-brown bg-sand-beige p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-pixel text-xl text-ocean-dark mb-2">
                📚 {collection.name}
              </h1>
              {collection.user && (
                <p className="text-pixel text-xs text-wood-brown mb-2">
                  Shared by: {collection.user.username}
                </p>
              )}
              <p className="text-pixel text-xs text-wood-brown mb-3">
                {collection.games.length} {collection.games.length === 1 ? 'game' : 'games'}
              </p>
              {collection.description && (
                <p className="text-pixel text-xs text-ocean-dark/70">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="mx-auto max-w-7xl">
        {collection.games.length === 0 ? (
          <div className="border-4 border-wood-brown bg-sand-beige p-8 text-center">
            <p className="text-pixel text-sm text-ocean-dark">
              🎮 NO GAMES IN COLLECTION
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {collection.games
              .sort((a, b) => a.order - b.order)
              .map((collectionGame) => {
                const game = collectionGame.game;
                return (
                  <div
                    key={game.id}
                    className="border-4 border-wood-brown bg-sand-beige overflow-hidden group"
                  >
                    {/* Cover */}
                    <div className="pixel-art aspect-[2/3] bg-ocean-dark overflow-hidden relative">
                      {game.coverUrl ? (
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          className="pixel-art w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-pixel text-4xl">🎮</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <button
                          onClick={() => handlePlayGame(game.id)}
                          className="btn-retro text-[8px] w-full"
                        >
                          ▶️ PLAY
                        </button>
                        <Link
                          to={`/game/${game.id}`}
                          className="btn-retro text-[8px] w-full text-center"
                        >
                          ℹ️ INFO
                        </Link>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="p-2">
                      <p className="text-pixel text-[8px] text-ocean-dark truncate">
                        {game.title}
                      </p>
                      <p className="text-pixel text-[7px] text-wood-brown">
                        {game.system.toUpperCase()}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
