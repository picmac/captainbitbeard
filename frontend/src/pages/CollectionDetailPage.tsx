import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  collectionApi,
  collectionShareApi,
  type Collection,
  type CollectionShare,
  CollectionVisibility,
  SharePermission,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PageTitle } from '../components/PageTitle';

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
  const [showSharingOptions, setShowSharingOptions] = useState(false);
  const [changingVisibility, setChangingVisibility] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<CollectionShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [shareUserId, setShareUserId] = useState('');
  const [sharePermission, setSharePermission] = useState<SharePermission>(SharePermission.VIEW);
  const [sharing, setSharing] = useState(false);

  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemoveGameConfirm, setShowRemoveGameConfirm] = useState(false);
  const [showRemoveShareLinkConfirm, setShowRemoveShareLinkConfirm] = useState(false);
  const [showRemoveUserConfirm, setShowRemoveUserConfirm] = useState(false);
  const [gameToRemove, setGameToRemove] = useState<{ id: string; title: string } | null>(null);
  const [userToRemove, setUserToRemove] = useState<{ id: string; username: string } | null>(null);

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
      await loadSharedUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const loadSharedUsers = async () => {
    if (!collectionId) return;

    setLoadingShares(true);
    try {
      const response = await collectionShareApi.getSharedUsers(collectionId);
      setSharedUsers(response.data.shares);
    } catch (err: any) {
      console.error('Failed to load shared users:', err);
    } finally {
      setLoadingShares(false);
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
      toast.success('Collection Updated', 'Your changes have been saved');
    } catch (err: any) {
      toast.error(err, 'Failed to update collection');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveGame = (gameId: string, gameTitle: string) => {
    setGameToRemove({ id: gameId, title: gameTitle });
    setShowRemoveGameConfirm(true);
  };

  const confirmRemoveGame = async () => {
    if (!collectionId || !gameToRemove) return;

    try {
      await collectionApi.removeGameFromCollection(collectionId, gameToRemove.id);
      await loadCollection();
      toast.success('Game Removed', `${gameToRemove.title} removed from collection`);
    } catch (err: any) {
      toast.error(err, 'Failed to remove game');
    }
  };

  const handleDeleteCollection = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCollection = async () => {
    if (!collectionId) return;

    try {
      await collectionApi.deleteCollection(collectionId);
      toast.success('Collection Deleted', `${collection?.name} has been removed`);
      navigate('/collections');
    } catch (err: any) {
      toast.error(err, 'Failed to delete collection');
    }
  };

  const handlePlayGame = (gameId: string) => {
    navigate(`/play/${gameId}`);
  };

  const handleChangeVisibility = async (visibility: CollectionVisibility) => {
    if (!collectionId) return;

    setChangingVisibility(true);
    try {
      const response = await collectionShareApi.updateVisibility(collectionId, visibility);
      setCollection(response.data.collection);
      toast.success('Visibility Updated', `Collection is now ${visibility.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err, 'Failed to update visibility');
    } finally {
      setChangingVisibility(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!collectionId) return;

    setChangingVisibility(true);
    try {
      const response = await collectionShareApi.generateShareLink(collectionId);
      setCollection(response.data.collection);
      toast.success('Share Link Generated', 'Copy the link below to share your collection');
    } catch (err: any) {
      toast.error(err, 'Failed to generate share link');
    } finally {
      setChangingVisibility(false);
    }
  };

  const handleRemoveShareLink = () => {
    setShowRemoveShareLinkConfirm(true);
  };

  const confirmRemoveShareLink = async () => {
    if (!collectionId) return;

    setChangingVisibility(true);
    try {
      const response = await collectionShareApi.removeShareLink(collectionId);
      setCollection(response.data.collection);
      toast.success('Share Link Removed', 'Collection is now private');
    } catch (err: any) {
      toast.error(err, 'Failed to remove share link');
    } finally {
      setChangingVisibility(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!collection?.shareLink) return;
    const fullUrl = `${window.location.origin}/shared/${collection.shareLink}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link Copied', 'Share link copied to clipboard');
  };

  const getVisibilityLabel = (visibility: CollectionVisibility) => {
    switch (visibility) {
      case CollectionVisibility.PRIVATE:
        return '🔒 PRIVATE';
      case CollectionVisibility.PUBLIC:
        return '🌐 PUBLIC';
      case CollectionVisibility.UNLISTED:
        return '🔗 UNLISTED';
      default:
        return visibility;
    }
  };

  const handleShareWithUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionId || !shareUserId.trim()) return;

    setSharing(true);
    try {
      await collectionShareApi.shareWithUser(collectionId, shareUserId.trim(), sharePermission);
      setShareUserId('');
      setSharePermission(SharePermission.VIEW);
      await loadSharedUsers();
      toast.success('Collection Shared', `Shared with user successfully`);
    } catch (err: any) {
      toast.error(err, 'Failed to share collection');
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveUserAccess = (userId: string, username: string) => {
    setUserToRemove({ id: userId, username });
    setShowRemoveUserConfirm(true);
  };

  const confirmRemoveUserAccess = async () => {
    if (!collectionId || !userToRemove) return;

    try {
      await collectionShareApi.removeUserAccess(collectionId, userToRemove.id);
      await loadSharedUsers();
      toast.success('Access Removed', `${userToRemove.username}'s access has been revoked`);
    } catch (err: any) {
      toast.error(err, 'Failed to remove access');
    }
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
      <PageTitle
        title={collection.name}
        description={collection.description || `View and manage games in the ${collection.name} collection`}
      />

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

      {/* Visibility & Sharing */}
      <div className="mx-auto max-w-7xl mb-6">
        <div className="border-4 border-wood-brown bg-sand-beige p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-pixel text-sm text-ocean-dark">SHARING & PRIVACY</h2>
            <button
              onClick={() => setShowSharingOptions(!showSharingOptions)}
              className="btn-retro text-[8px] px-3"
            >
              {showSharingOptions ? '▲ HIDE' : '▼ SHOW'}
            </button>
          </div>

          {showSharingOptions && (
            <div className="space-y-4">
              {/* Current Visibility */}
              <div>
                <p className="text-pixel text-xs text-wood-brown mb-2">
                  Current visibility: {getVisibilityLabel(collection.visibility)}
                </p>
              </div>

              {/* Visibility Options */}
              <div>
                <label className="text-pixel text-xs text-ocean-dark block mb-2">
                  CHANGE VISIBILITY
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleChangeVisibility(CollectionVisibility.PRIVATE)}
                    disabled={changingVisibility || collection.visibility === CollectionVisibility.PRIVATE}
                    className={`btn-retro text-[8px] ${
                      collection.visibility === CollectionVisibility.PRIVATE
                        ? 'bg-pirate-gold'
                        : ''
                    }`}
                  >
                    🔒 PRIVATE
                  </button>
                  <button
                    onClick={() => handleChangeVisibility(CollectionVisibility.PUBLIC)}
                    disabled={changingVisibility || collection.visibility === CollectionVisibility.PUBLIC}
                    className={`btn-retro text-[8px] ${
                      collection.visibility === CollectionVisibility.PUBLIC
                        ? 'bg-pirate-gold'
                        : ''
                    }`}
                  >
                    🌐 PUBLIC
                  </button>
                </div>
                <div className="mt-2 text-pixel text-[7px] text-wood-brown space-y-1">
                  <p>🔒 PRIVATE: Only you can see this collection</p>
                  <p>🌐 PUBLIC: Anyone can find and view this collection</p>
                  <p>🔗 UNLISTED: Only people with the link can access</p>
                </div>
              </div>

              {/* Share Link Section */}
              <div className="border-t-2 border-wood-brown pt-4">
                <label className="text-pixel text-xs text-ocean-dark block mb-2">
                  SHARE LINK
                </label>
                {collection.shareLink ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/shared/${collection.shareLink}`}
                        className="flex-1 border-2 border-wood-brown bg-white p-2 text-pixel text-[8px] text-ocean-dark"
                      />
                      <button
                        onClick={handleCopyShareLink}
                        className="btn-retro text-[8px] px-3"
                      >
                        📋 COPY
                      </button>
                    </div>
                    <button
                      onClick={handleRemoveShareLink}
                      disabled={changingVisibility}
                      className="btn-retro bg-blood-red text-[8px] w-full"
                    >
                      🗑️ REMOVE LINK
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-pixel text-[7px] text-wood-brown mb-2">
                      Generate a shareable link. Anyone with the link can view this collection.
                    </p>
                    <button
                      onClick={handleGenerateShareLink}
                      disabled={changingVisibility}
                      className="btn-retro text-[8px]"
                    >
                      🔗 GENERATE LINK
                    </button>
                  </div>
                )}
              </div>

              {/* Share with Specific Users */}
              <div className="border-t-2 border-wood-brown pt-4">
                <label className="text-pixel text-xs text-ocean-dark block mb-2">
                  SHARE WITH USERS
                </label>

                {/* Add User Form */}
                <form onSubmit={handleShareWithUser} className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={shareUserId}
                      onChange={(e) => setShareUserId(e.target.value)}
                      placeholder="User ID..."
                      className="flex-1 border-2 border-wood-brown bg-white p-2 text-pixel text-[8px] text-ocean-dark"
                    />
                    <select
                      value={sharePermission}
                      onChange={(e) => setSharePermission(e.target.value as SharePermission)}
                      className="border-2 border-wood-brown bg-white p-2 text-pixel text-[8px] text-ocean-dark"
                    >
                      <option value={SharePermission.VIEW}>VIEW</option>
                      <option value={SharePermission.EDIT}>EDIT</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={sharing || !shareUserId.trim()}
                    className="btn-retro text-[8px] w-full"
                  >
                    {sharing ? 'SHARING...' : '➕ SHARE'}
                  </button>
                </form>

                {/* Shared Users List */}
                <div>
                  {loadingShares ? (
                    <p className="text-pixel text-[7px] text-wood-brown">Loading...</p>
                  ) : sharedUsers.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-pixel text-[7px] text-wood-brown mb-2">
                        {sharedUsers.length} user(s) with access:
                      </p>
                      {sharedUsers.map((share) => (
                        <div
                          key={share.id}
                          className="flex items-center justify-between border-2 border-wood-brown bg-white p-2"
                        >
                          <div className="flex-1">
                            <p className="text-pixel text-[8px] text-ocean-dark">
                              {share.user.username}
                            </p>
                            <p className="text-pixel text-[7px] text-wood-brown">
                              {share.permission === SharePermission.VIEW ? '👁️ View' : '✏️ Edit'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveUserAccess(share.userId, share.user.username)}
                            className="btn-retro bg-blood-red text-[8px] px-2"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-pixel text-[7px] text-wood-brown">
                      No users shared yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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
                          onClick={() => handleRemoveGame(game.id, game.title)}
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteCollection}
        title="Delete Collection"
        message={`Are you sure you want to delete "${collection?.name}"? This action cannot be undone.`}
        confirmText="DELETE"
        type="danger"
      >
        <div className="text-pixel text-sm text-center">
          <p className="text-xs text-wood-brown mb-2">This will permanently delete:</p>
          <ul className="text-[8px] text-left space-y-1">
            <li>• Collection: {collection?.name}</li>
            <li>• {collection?.games.length} game references</li>
            <li>• All sharing settings</li>
          </ul>
        </div>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={showRemoveGameConfirm}
        onClose={() => setShowRemoveGameConfirm(false)}
        onConfirm={confirmRemoveGame}
        title="Remove Game"
        message={`Remove "${gameToRemove?.title}" from this collection?`}
        confirmText="REMOVE"
        type="warning"
      />

      <ConfirmationModal
        isOpen={showRemoveShareLinkConfirm}
        onClose={() => setShowRemoveShareLinkConfirm(false)}
        onConfirm={confirmRemoveShareLink}
        title="Remove Share Link"
        message="Remove the share link? This will make the collection private and the link will no longer work."
        confirmText="REMOVE LINK"
        type="warning"
      />

      <ConfirmationModal
        isOpen={showRemoveUserConfirm}
        onClose={() => setShowRemoveUserConfirm(false)}
        onConfirm={confirmRemoveUserAccess}
        title="Remove User Access"
        message={`Remove ${userToRemove?.username}'s access to this collection?`}
        confirmText="REMOVE ACCESS"
        type="warning"
      />
    </div>
  );
}
