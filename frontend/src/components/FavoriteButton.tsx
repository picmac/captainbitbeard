import { useState, useEffect } from 'react';
import { favoriteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FavoriteButtonProps {
  gameId: string;
  onToggle?: () => void;
}

export function FavoriteButton({ gameId, onToggle }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err: any) {
      // Silently fail - not favorited
      setIsFavorited(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!user) {
      alert('Please log in to add favorites');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await favoriteApi.toggleFavorite(gameId);
      setIsFavorited(response.data.isFavorited);

      if (onToggle) {
        onToggle();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle favorite');
      alert(`❌ ${error || 'Failed to toggle favorite'}`);
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
