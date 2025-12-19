import { useState } from 'react';
import { gameApi, type Game } from '../services/api';
import { AddToCollectionModal } from './AddToCollectionModal';

interface QuickActionsMenuProps {
  selectedGames: Game[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function QuickActionsMenu({
  selectedGames,
  onClearSelection,
  onRefresh,
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [loading, setLoading] = useState(false);

  if (selectedGames.length === 0) {
    return null;
  }

  const handleBulkAddToCollection = () => {
    setShowAddToCollection(true);
  };

  const handleBulkScrapeMetadata = async () => {
    if (!confirm(`Fetch metadata for ${selectedGames.length} games? This may take a while.`)) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const game of selectedGames) {
      try {
        await gameApi.scrapeMetadata(game.id);
        successCount++;
      } catch {
        errorCount++;
      }
    }

    setLoading(false);
    alert(`✅ Metadata fetched for ${successCount} games. ${errorCount > 0 ? `❌ ${errorCount} failed.` : ''}`);
    onRefresh();
    onClearSelection();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`⚠️ DELETE ${selectedGames.length} GAMES? This cannot be undone!`)) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const game of selectedGames) {
      try {
        await gameApi.deleteGame(game.id);
        successCount++;
      } catch {
        errorCount++;
      }
    }

    setLoading(false);
    alert(`✅ Deleted ${successCount} games. ${errorCount > 0 ? `❌ ${errorCount} failed.` : ''}`);
    onRefresh();
    onClearSelection();
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <div className="relative">
          {/* Selected Count Badge */}
          <div className="absolute -top-2 -right-2 bg-blood-red text-skull-white text-pixel text-xs px-2 py-1 rounded-full border-2 border-wood-brown">
            {selectedGames.length}
          </div>

          {/* Main Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`btn-retro text-sm px-4 py-3 shadow-lg ${
              isOpen ? 'bg-pirate-gold' : 'bg-treasure-green'
            }`}
            disabled={loading}
            title="Quick Actions"
          >
            {loading ? '⏳' : '⚡'}
          </button>

          {/* Actions Menu */}
          {isOpen && (
            <div className="absolute bottom-full right-0 mb-2 border-4 border-wood-brown bg-sand-beige shadow-xl min-w-[200px]">
              <div className="p-2 space-y-1">
                <div className="text-pixel text-xs text-ocean-dark font-bold px-2 py-1 bg-wood-brown text-skull-white">
                  QUICK ACTIONS
                </div>

                <button
                  onClick={handleBulkAddToCollection}
                  className="btn-retro text-xs w-full text-left px-3 py-2 bg-treasure-green hover:bg-pirate-gold"
                  disabled={loading}
                >
                  📚 Add to Collection
                </button>

                <button
                  onClick={handleBulkScrapeMetadata}
                  className="btn-retro text-xs w-full text-left px-3 py-2 bg-treasure-green hover:bg-pirate-gold"
                  disabled={loading}
                >
                  🎨 Fetch Metadata
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="btn-retro text-xs w-full text-left px-3 py-2 bg-blood-red hover:bg-blood-red/80"
                  disabled={loading}
                >
                  🗑️ Delete Games
                </button>

                <hr className="border-wood-brown my-1" />

                <button
                  onClick={onClearSelection}
                  className="btn-retro text-xs w-full text-left px-3 py-2 bg-wood-brown hover:bg-ocean-dark"
                  disabled={loading}
                >
                  ✕ Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add to Collection Modal */}
      {showAddToCollection && selectedGames.length > 0 && (
        <AddToCollectionModal
          gameId={selectedGames[0].id}
          onClose={() => {
            setShowAddToCollection(false);
            onClearSelection();
          }}
          bulkGameIds={selectedGames.map(g => g.id)}
        />
      )}
    </>
  );
}
