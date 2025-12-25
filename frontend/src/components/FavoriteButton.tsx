import { useState, useEffect } from 'react';
import { favoriteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';

interface FavoriteButtonProps {
  gameId: string;
  onToggle?: () => void;
}

export function FavoriteButton({ gameId, onToggle }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check favorite status on mount
  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [gameId, user]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteApi.getFavoriteStatus(gameId);
      setIsFavorited(response.data.isFavorited);
    } catch {
      // Silently fail - not favorited
      setIsFavorited(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!user) {
      toast.warning('Login Required', 'Please log in to add favorites');
      return;
    }

    setLoading(true);

    try {
      const response = await favoriteApi.toggleFavorite(gameId);
      setIsFavorited(response.data.isFavorited);

      // Show subtle feedback
      if (response.data.isFavorited) {
        toast.success('Added to Favorites', 'Game saved to your favorites');
      } else {
        toast.info('Removed from Favorites', 'Game removed from favorites');
      }

      if (onToggle) {
        onToggle();
      }
    } catch (err: any) {
      toast.error(err, 'Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  // Don't show if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`btn-retro text-[10px] px-2 py-1 ${
        isFavorited ? 'bg-blood-red' : 'bg-skull-white'
      } transition-colors`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? '⏳' : isFavorited ? '❤️' : '🤍'}
    </button>
  );
}
