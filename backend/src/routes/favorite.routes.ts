import { Router } from 'express';
import { favoriteController } from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all favorites for authenticated user
router.get('/', favoriteController.getUserFavorites.bind(favoriteController));

// Check if game is favorited
router.get('/:gameId/status', favoriteController.getFavoriteStatus.bind(favoriteController));

// Get favorite count for a game (public, but authenticated)
router.get('/:gameId/count', favoriteController.getFavoriteCount.bind(favoriteController));

// Add game to favorites
router.post('/:gameId', favoriteController.addFavorite.bind(favoriteController));

// Remove game from favorites
router.delete('/:gameId', favoriteController.removeFavorite.bind(favoriteController));

// Toggle favorite status
router.put('/:gameId/toggle', favoriteController.toggleFavorite.bind(favoriteController));

export default router;
