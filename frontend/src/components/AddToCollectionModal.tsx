import { useState, useEffect } from 'react';
import { collectionApi, type Collection } from '../services/api';

interface AddToCollectionModalProps {
  gameId: string;
  gameName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddToCollectionModal({
  gameId,
  gameName,
  onClose,
  onSuccess,
}: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

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

  const handleAddToCollection = async (collectionId: string) => {
    try {
      await collectionApi.addGameToCollection(collectionId, gameId);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to add game to collection';
      alert(message);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setCreating(true);
    try {
      const response = await collectionApi.createCollection(newCollectionName.trim());
      const newCollection = response.data.collection;

      // Add the game to the new collection
      await collectionApi.addGameToCollection(newCollection.id, gameId);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create collection';
      alert(message);
    } finally {
      setCreating(false);
    }
  };

  // Check if game is already in collection
  const isGameInCollection = (collection: Collection) => {
    return collection.games.some((cg) => cg.gameId === gameId);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="border-4 border-wood-brown bg-sand-beige p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-pixel text-sm text-ocean-dark mb-2">
            📚 ADD TO COLLECTION
          </h2>
          <p className="text-pixel text-[8px] text-wood-brown">
            {gameName}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-2"></div>
            <p className="text-pixel text-[8px] text-ocean-dark">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="border-4 border-blood-red bg-blood-red/20 p-4 mb-4">
            <p className="text-pixel text-[8px] text-blood-red">{error}</p>
          </div>
        )}

        {/* Collections List */}
        {!loading && !error && (
          <div className="space-y-2 mb-4">
            {collections.length === 0 ? (
              <p className="text-pixel text-[8px] text-ocean-dark/70 text-center py-4">
                No collections yet. Create one below!
              </p>
            ) : (
              collections.map((collection) => {
                const alreadyInCollection = isGameInCollection(collection);
                return (
                  <button
                    key={collection.id}
                    onClick={() => !alreadyInCollection && handleAddToCollection(collection.id)}
                    disabled={alreadyInCollection}
                    className={`w-full border-4 p-3 text-left transition-colors ${
                      alreadyInCollection
                        ? 'border-treasure-green bg-treasure-green/20 cursor-not-allowed'
                        : 'border-wood-brown bg-white hover:bg-pirate-gold/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-pixel text-[8px] text-ocean-dark truncate">
                          {collection.name}
                        </p>
                        <p className="text-pixel text-[7px] text-wood-brown">
                          {collection.games.length} {collection.games.length === 1 ? 'game' : 'games'}
                        </p>
                      </div>
                      {alreadyInCollection && (
                        <span className="text-pixel text-[8px] text-treasure-green ml-2">
                          ✓ ADDED
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Create New Collection */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-retro w-full text-[8px] mb-3"
          >
            ➕ CREATE NEW COLLECTION
          </button>
        ) : (
          <form onSubmit={handleCreateCollection} className="mb-3">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name..."
              className="w-full border-4 border-wood-brown bg-white p-2 mb-2 text-pixel text-[8px] text-ocean-dark"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating || !newCollectionName.trim()}
                className="btn-retro flex-1 text-[8px]"
              >
                {creating ? 'Creating...' : '✓ CREATE & ADD'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewCollectionName('');
                }}
                className="btn-retro bg-blood-red text-[8px] px-3"
              >
                ✕
              </button>
            </div>
          </form>
        )}

        {/* Close Button */}
        <button onClick={onClose} className="btn-retro w-full text-[8px]">
          CLOSE
        </button>
      </div>
    </div>
  );
}
