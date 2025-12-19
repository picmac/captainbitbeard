import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collectionApi, type Collection } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function CollectionDetailPage() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !collectionId) {
      navigate('/collections');
      return;
    }
    loadCollection();
  }, [user, collectionId, navigate]);

  const loadCollection = async () => {
    if (!collectionId) return;

    setLoading(true);
    try {
      const response = await collectionApi.getCollectionById(collectionId);
      setCollection(response.data.collection);
      setEditName(response.data.collection.name);
      setEditDescription(response.data.collection.description || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!collectionId || !editName.trim()) return;

    setSaving(true);
    try {
      await collectionApi.updateCollection(collectionId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setEditing(false);
      await loadCollection();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update collection');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveGame = async (gameId: string) => {
    if (!collectionId) return;
    if (!window.confirm('Remove this game from the collection?')) return;

    try {
      await collectionApi.removeGameFromCollection(collectionId, gameId);
      await loadCollection();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove game');
    }
  };

  const handleDeleteCollection = async () => {
    if (!collectionId) return;
    if (!window.confirm(`Delete collection "${collection?.name}"? This cannot be undone.`)) return;

    try {
      await collectionApi.deleteCollection(collectionId);
      navigate('/collections');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete collection');
    }
  };

  const handlePlayGame = (gameId: string) => {
    navigate(`/play/${gameId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-pixel text-sm text-skull-white">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="border-4 border-blood-red bg-blood-red/20 p-6 text-center">
          <p className="text-pixel mb-4 text-sm text-skull-white">
            ❌ ERROR
          </p>
          <p className="text-pixel mb-4 text-xs text-skull-white">
            {error || 'Collection not found'}
          </p>
          <Link to="/collections" className="btn-retro text-xs">
            BACK TO COLLECTIONS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="mx-auto max-w-7xl">
          <Link to="/collections" className="btn-retro text-xs inline-block mb-4">
            ← BACK TO COLLECTIONS
          </Link>
        </div>
      </div>

      {/* Collection Info */}
      <div className="mx-auto max-w-7xl mb-6">
        {!editing ? (
          <div className="border-4 border-wood-brown bg-sand-beige p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-pixel text-xl text-ocean-dark mb-2">
                  📚 {collection.name}
                </h1>
                <p className="text-pixel text-xs text-wood-brown mb-3">
                  {collection.games.length} {collection.games.length === 1 ? 'game' : 'games'}
                </p>
                {collection.description && (
                  <p className="text-pixel text-xs text-ocean-dark/70">
                    {collection.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setEditing(true)}
                  className="btn-retro text-[8px] px-3"
                >
                  ✏️ EDIT
                </button>
                <button
                  onClick={handleDeleteCollection}
                  className="btn-retro bg-blood-red text-[8px] px-3"
                >
                  🗑️ DELETE
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-4 border-wood-brown bg-sand-beige p-6">
            <h2 className="text-pixel text-xs text-ocean-dark mb-3">EDIT COLLECTION</h2>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Collection name..."
              className="w-full border-4 border-wood-brown bg-white p-2 mb-2 text-pixel text-xs text-ocean-dark"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description (optional)..."
              rows={3}
              className="w-full border-4 border-wood-brown bg-white p-2 mb-3 text-pixel text-xs text-ocean-dark resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editName.trim()}
                className="btn-retro flex-1 text-xs"
              >
                {saving ? 'SAVING...' : '✓ SAVE'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditName(collection.name);
                  setEditDescription(collection.description || '');
                }}
                className="btn-retro bg-blood-red text-xs px-4"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Games Grid */}
      <div className="mx-auto max-w-7xl">
        {collection.games.length === 0 ? (
          <div className="border-4 border-wood-brown bg-sand-beige p-8 text-center">
            <p className="text-pixel text-sm text-ocean-dark mb-4">
              🎮 NO GAMES IN COLLECTION
            </p>
            <p className="text-pixel text-xs text-wood-brown mb-6">
              Go to the library and add games to this collection!
            </p>
            <Link to="/library" className="btn-retro text-xs">
              GO TO LIBRARY
            </Link>
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
                        <button
                          onClick={() => handleRemoveGame(game.id)}
                          className="btn-retro bg-blood-red text-[8px] w-full"
                        >
                          🗑️ REMOVE
                        </button>
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
