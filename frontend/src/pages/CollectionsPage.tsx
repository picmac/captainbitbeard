import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collectionApi, type Collection } from '../services/api';
import { CollectionCard } from '../components/CollectionCard';
import { useAuth } from '../context/AuthContext';

export function CollectionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCollections();
  }, [user, navigate]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const response = await collectionApi.getUserCollections();
      setCollections(response.data.collections);
    } catch (err: any) {
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setCreating(true);
    try {
      await collectionApi.createCollection(
        newCollectionName.trim(),
        newCollectionDescription.trim() || undefined
      );
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowCreateForm(false);
      await loadCollections();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await collectionApi.deleteCollection(collectionId);
      await loadCollections();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete collection');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-pixel mb-4 text-center text-2xl text-pirate-gold">
          📚 MY COLLECTIONS
        </h1>

        {/* Back to Library */}
        <div className="mx-auto max-w-4xl mb-4">
          <Link to="/library" className="btn-retro text-xs inline-block">
            ← BACK TO LIBRARY
          </Link>
        </div>
      </div>

      {/* Create New Collection */}
      <div className="mx-auto max-w-4xl mb-6">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-retro w-full text-sm"
          >
            ➕ CREATE NEW COLLECTION
          </button>
        ) : (
          <form
            onSubmit={handleCreateCollection}
            className="border-4 border-wood-brown bg-sand-beige p-4"
          >
            <h3 className="text-pixel text-xs text-ocean-dark mb-3">
              CREATE NEW COLLECTION
            </h3>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name..."
              className="w-full border-4 border-wood-brown bg-white p-2 mb-2 text-pixel text-xs text-ocean-dark"
              autoFocus
            />
            <textarea
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
              placeholder="Description (optional)..."
              rows={3}
              className="w-full border-4 border-wood-brown bg-white p-2 mb-3 text-pixel text-xs text-ocean-dark resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating || !newCollectionName.trim()}
                className="btn-retro flex-1 text-xs"
              >
                {creating ? 'CREATING...' : '✓ CREATE'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                }}
                className="btn-retro bg-blood-red text-xs px-4"
              >
                CANCEL
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-pixel text-sm text-skull-white">Loading collections...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mx-auto max-w-4xl">
          <div className="border-4 border-blood-red bg-blood-red/20 p-6 text-center">
            <p className="text-pixel text-sm text-blood-red">{error}</p>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {!loading && !error && (
        <div className="mx-auto max-w-7xl">
          {collections.length === 0 ? (
            <div className="border-4 border-wood-brown bg-sand-beige p-8 text-center">
              <p className="text-pixel text-sm text-ocean-dark mb-4">
                🎮 NO COLLECTIONS YET
              </p>
              <p className="text-pixel text-xs text-wood-brown mb-6">
                Create your first collection to organize your games!
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-retro text-xs"
              >
                ➕ CREATE COLLECTION
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onDelete={handleDeleteCollection}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
