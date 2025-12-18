import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.controller';
import { favoriteService } from '../services/favorite.service';
import { AppError } from '../middleware/error-handler';

export class FavoriteController {
  /**
   * Get all favorites for the authenticated user
   * GET /api/favorites
   */
  async getUserFavorites(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // User ID from auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const favorites = await favoriteService.getUserFavorites(userId);

      res.json({
        status: 'success',
        data: {
          favorites,
          total: favorites.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if a game is favorited
   * GET /api/favorites/:gameId/status
   */
  async getFavoriteStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { gameId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const isFavorited = await favoriteService.isFavorited(userId, gameId);

      res.json({
        status: 'success',
        data: {
          gameId,
          isFavorited,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add game to favorites
   * POST /api/favorites/:gameId
   */
  async addFavorite(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { gameId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const favorite = await favoriteService.addFavorite(userId, gameId);

      res.status(201).json({
        status: 'success',
        data: { favorite },
        message: 'Game added to favorites',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove game from favorites
   * DELETE /api/favorites/:gameId
   */
  async removeFavorite(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { gameId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await favoriteService.removeFavorite(userId, gameId);

      res.json({
        status: 'success',
        message: 'Game removed from favorites',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle favorite status for a game
   * PUT /api/favorites/:gameId/toggle
   */
  async toggleFavorite(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { gameId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const isFavorited = await favoriteService.isFavorited(userId, gameId);

      if (isFavorited) {
        await favoriteService.removeFavorite(userId, gameId);
        res.json({
          status: 'success',
          data: { isFavorited: false },
          message: 'Game removed from favorites',
        });
      } else {
        await favoriteService.addFavorite(userId, gameId);
        res.json({
          status: 'success',
          data: { isFavorited: true },
          message: 'Game added to favorites',
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get favorite count for a game
   * GET /api/favorites/:gameId/count
   */
  async getFavoriteCount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gameId } = req.params;

      const count = await favoriteService.getFavoriteCount(gameId);

      res.json({
        status: 'success',
        data: {
          gameId,
          count,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const favoriteController = new FavoriteController();
