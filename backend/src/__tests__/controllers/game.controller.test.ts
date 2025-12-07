import request from 'supertest';
import express from 'express';
import gameRoutes from '../../routes/game.routes';
import { gameService } from '../../services/game.service';
import { errorHandler } from '../../middleware/error-handler';

// Mock game service
jest.mock('../../services/game.service', () => ({
  gameService: {
    createGame: jest.fn(),
    getAllGames: jest.fn(),
    getGameById: jest.fn(),
    getGameWithDownloadUrl: jest.fn(),
    getGamesBySystem: jest.fn(),
    searchGames: jest.fn(),
    updateGame: jest.fn(),
    deleteGame: jest.fn(),
    getSupportedSystems: jest.fn(),
  },
}));

describe('Game API Endpoints', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/games', gameRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/games', () => {
    it('should return all games', async () => {
      const mockGames = {
        games: [
          { id: '1', title: 'Game 1', system: 'nes' },
          { id: '2', title: 'Game 2', system: 'snes' },
        ],
        total: 2,
      };

      (gameService.getAllGames as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/api/games');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.games).toEqual(mockGames.games);
      expect(response.body.data.total).toBe(2);
    });

    it('should filter by system', async () => {
      const mockGames = {
        games: [{ id: '1', title: 'NES Game', system: 'nes' }],
        total: 1,
      };

      (gameService.getAllGames as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/api/games?system=nes');

      expect(response.status).toBe(200);
      expect(gameService.getAllGames).toHaveBeenCalledWith({
        system: 'nes',
        search: undefined,
        limit: undefined,
        offset: undefined,
      });
    });

    it('should support pagination', async () => {
      const mockGames = { games: [], total: 0 };

      (gameService.getAllGames as jest.Mock).mockResolvedValue(mockGames);

      await request(app).get('/api/games?limit=10&offset=20');

      expect(gameService.getAllGames).toHaveBeenCalledWith({
        system: undefined,
        search: undefined,
        limit: 10,
        offset: 20,
      });
    });
  });

  describe('GET /api/games/:id', () => {
    it('should return game by ID', async () => {
      const mockGame = {
        id: 'game-123',
        title: 'Test Game',
        system: 'nes',
      };

      (gameService.getGameById as jest.Mock).mockResolvedValue(mockGame);

      const response = await request(app).get('/api/games/game-123');

      expect(response.status).toBe(200);
      expect(response.body.data.game).toEqual(mockGame);
    });

    it('should return 404 if game not found', async () => {
      (gameService.getGameById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/games/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Game not found');
    });
  });

  describe('GET /api/games/:id/play', () => {
    it('should return game with ROM download URL', async () => {
      const mockGame = {
        id: 'game-123',
        title: 'Test',
        romDownloadUrl: 'https://example.com/rom.nes',
      };

      (gameService.getGameWithDownloadUrl as jest.Mock).mockResolvedValue(
        mockGame
      );

      const response = await request(app).get('/api/games/game-123/play');

      expect(response.status).toBe(200);
      expect(response.body.data.game.romDownloadUrl).toBeTruthy();
    });
  });

  describe('GET /api/games/search', () => {
    it('should search games by query', async () => {
      const mockGames = [{ id: '1', title: 'Super Mario' }];

      (gameService.searchGames as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/api/games/search?q=mario');

      expect(response.status).toBe(200);
      expect(response.body.data.games).toEqual(mockGames);
      expect(gameService.searchGames).toHaveBeenCalledWith('mario');
    });

    it('should return 400 if query is missing', async () => {
      const response = await request(app).get('/api/games/search');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Search query required');
    });
  });

  describe('GET /api/games/system/:system', () => {
    it('should return games by system', async () => {
      const mockGames = [{ id: '1', title: 'NES Game', system: 'nes' }];

      (gameService.getGamesBySystem as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/api/games/system/nes');

      expect(response.status).toBe(200);
      expect(response.body.data.games).toEqual(mockGames);
      expect(gameService.getGamesBySystem).toHaveBeenCalledWith('nes');
    });
  });

  describe('GET /api/games/systems', () => {
    it('should return supported systems with counts', async () => {
      const mockSystems = [
        { system: 'nes', count: 10 },
        { system: 'snes', count: 5 },
      ];

      (gameService.getSupportedSystems as jest.Mock).mockResolvedValue(
        mockSystems
      );

      const response = await request(app).get('/api/games/systems');

      expect(response.status).toBe(200);
      expect(response.body.data.systems).toEqual(mockSystems);
    });
  });

  describe('PATCH /api/games/:id', () => {
    it('should update game metadata', async () => {
      const mockUpdatedGame = {
        id: 'game-123',
        title: 'Updated Title',
      };

      (gameService.updateGame as jest.Mock).mockResolvedValue(mockUpdatedGame);

      const response = await request(app)
        .patch('/api/games/game-123')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.data.game).toEqual(mockUpdatedGame);
    });
  });

  describe('DELETE /api/games/:id', () => {
    it('should delete game', async () => {
      (gameService.deleteGame as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete('/api/games/game-123');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Game deleted successfully');
      expect(gameService.deleteGame).toHaveBeenCalledWith('game-123');
    });
  });
});
