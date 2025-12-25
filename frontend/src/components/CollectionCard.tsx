import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Collection } from '../services/api';
import { ConfirmationModal } from './ConfirmationModal';

interface CollectionCardProps {
  collection: Collection;
  onDelete?: (collectionId: string) => void;
}

export function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleClick = () => {
    navigate(`/collections/${collection.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(collection.id);
    }
  };

  // Get first 4 game covers for preview
  const previewGames = collection.games.slice(0, 4);

  return (
    <div
      onClick={handleClick}
      className="border-4 border-wood-brown bg-sand-beige p-4 hover:bg-pirate-gold/20 transition-colors cursor-pointer"
    >
      {/* Preview Grid */}
      <div className="grid grid-cols-2 gap-1 mb-3 aspect-square bg-ocean-dark">
        {previewGames.map((collectionGame) => (
          <div key={collectionGame.gameId} className="relative overflow-hidden">
            {collectionGame.game.coverUrl ? (
              <img
                src={collectionGame.game.coverUrl}
                alt={collectionGame.game.title}
                className="pixel-art w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-ocean-dark/50">
                <span className="text-pixel text-sm">🎮</span>
              </div>
            )}
          </div>
        ))}
        {/* Fill empty slots */}
        {[...Array(Math.max(0, 4 - previewGames.length))].map((_, i) => (
          <div key={`empty-${i}`} className="bg-ocean-dark/30"></div>
        ))}
      </div>

      {/* Collection Info */}
      <h3 className="text-pixel text-xs text-ocean-dark mb-1 truncate">
        {collection.name}
      </h3>
      <p className="text-pixel text-[8px] text-wood-brown mb-2">
        {collection.games.length} {collection.games.length === 1 ? 'game' : 'games'}
      </p>

      {/* Description */}
      {collection.description && (
        <p className="text-pixel text-[7px] text-ocean-dark/70 mb-3 line-clamp-2">
          {collection.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleClick}
          className="btn-retro flex-1 text-[8px] py-1"
        >
          👁️ VIEW
        </button>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="btn-retro bg-blood-red text-[8px] py-1 px-3"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
        }}
        onConfirm={() => {
          confirmDelete();
          setShowDeleteConfirm(false);
        }}
        title="Delete Collection"
        message={`Are you sure you want to delete "${collection.name}"? Games in this collection will not be deleted, only the collection itself.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        type="danger"
      >
        <div className="text-pixel text-sm text-ocean-dark">
          <div className="font-bold mb-2">This will permanently delete:</div>
          <ul className="text-xs text-left space-y-1">
            <li>• Collection: {collection.name}</li>
            <li>• Organization of {collection.games.length} {collection.games.length === 1 ? 'game' : 'games'}</li>
          </ul>
          <div className="mt-3 text-[10px] text-wood-brown">
            Note: The games themselves will remain in your library
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}
