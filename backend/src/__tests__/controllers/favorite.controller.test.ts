import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../controllers/auth.controller';
import { favoriteController } from '../../controllers/favorite.controller';
import { favoriteService } from '../../services/favorite.service';
import { AppError } from '../../middleware/error-handler';

// Mock favorite service
jest.mock('../../services/favorite.service');

// Helper to create mock request and response
function createMockReqRes() {
  const req = {
    user: { id: 'user-123', username: 'testuser', role: 'USER' },
    params: {},
    body: {},
  } as unknown as AuthRequest;

  const res = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;

  return { req, res, next };
}

describe('Favorite Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserFavorites', () => {
    it('should get all favorites for user', async () => {
      const mockFavorites = [
        { id: 'fav-1', userId: 'user-123', gameId: 'game-1', game: { title: 'Game 1' } },
        { id: 'fav-2', userId: 'user-123', gameId: 'game-2', game: { title: 'Game 2' } },
      ];

      (favoriteService.getUserFavorites as jest.Mock).mockResolvedValue(mockFavorites);

      const { req, res, next } = createMockReqRes();

      await favoriteController.getUserFavorites(req, res, next);

      expect(favoriteService.getUserFavorites).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          favorites: mockFavorites,
          total: 2,
        },
      });
    });

    it('should return 401 if user not authenticated', async () => {
      const { req, res, next } = createMockReqRes();
      req.user = undefined;

      await favoriteController.getUserFavorites(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User not authenticated', statusCode: 401 })
      );
    });
  });

  describe('getFavoriteStatus', () => {
    it('should check if game is favorited', async () => {
      (favoriteService.isFavorited as jest.Mock).mockResolvedValue(true);

      const { req, res, next } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await favoriteController.getFavoriteStatus(req, res, next);

      expect(favoriteService.isFavorited).toHaveBeenCalledWith('user-123', 'game-1');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          gameId: 'game-1',
          isFavorited: true,
        },
      });
    });

    it('should return false if game not favorited', async () => {
      (favoriteService.isFavorited as jest.Mock).mockResolvedValue(false);

      const { req, res, next } = createMockReqRes();
      req.params = { gameId: 'game-2' };

      await favoriteController.getFavoriteStatus(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          gameId: 'game-2',
          isFavorited: false,
        },
      });
    });
  });

  describe('addFavorite', () => {
    it('should add game to favorites', async () => {
      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-123',
        gameId: 'game-1',
      };

      (favoriteService.addFavorite as jest.Mock).mockResolvedValue(mockFavorite);

      const { req, res, next } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await favoriteController.addFavorite(req, res, next);

      expect(favoriteService.addFavorite).toHaveBeenCalledWith('user-123', 'game-1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { favorite: mockFavorite },
        message: 'Game added to favorites',
      });
    });

    it('should handle errors when adding favorite', async () => {
      (favoriteService.addFavorite as jest.Mock).mockRejectedValue(
        new Error('Game already favorited')
      );

      const { req, res, next } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await favoriteController.addFavorite(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('removeFavorite', () => {
    it('should remove game from favorites', async () => {
      (favoriteService.removeFavorite as jest.Mock).mockResolvedValue(undefined);

      const { req, res, next } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await favoriteController.removeFavorite(req, res, next);

      expect(favoriteService.removeFavorite).toHaveBeenCalledWith('user-123', 'game-1');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Game removed from favorites',
      });
    });
  });

  describe('toggleFavorite', () => {
    it('should add game to favorites if not favorited', async () => {
      (favoriteService.isFavorited as jest.Mock).mockResolvedValue(false);
      (favoriteService.addFavorite as jest.Mock).mockResolvedValue({
        id: 'fav-1',
        userId: 'user-123',
        gameId: 'game-1',
      });

      const { req, res, next } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await favoriteController.toggleFavorite(req, res, next);

      expect(favoriteService.addFavorite).toHaveBeenCalledWith('user-123', 'game-1');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { isFavorited: true },
        message: 'Game added to favorites',
      });
    });

    it('should remove game from favorites if already favorited', async () => {
      (favoriteService.isFavorited as jest.Mock).mockResolvedValue(true);
      (favoriteService.removeFavorite as jest.Mock).mockResolvedValue(undefined);

      const { req, res, next } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await favoriteController.toggleFavorite(req, res, next);

      expect(favoriteService.removeFavorite).toHaveBeenCalledWith('user-123', 'game-1');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { isFavorited: false },
        message: 'Game removed from favorites',
      });
    });
  });

  describe('getFavoriteCount', () => {
    it('should get favorite count for a game', async () => {
      (favoriteService.getFavoriteCount as jest.Mock).mockResolvedValue(42);

      const { req, res, next } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await favoriteController.getFavoriteCount(req, res, next);

      expect(favoriteService.getFavoriteCount).toHaveBeenCalledWith('game-1');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          gameId: 'game-1',
          count: 42,
        },
      });
    });

    it('should handle errors', async () => {
      (favoriteService.getFavoriteCount as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { req, res, next } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await favoriteController.getFavoriteCount(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
