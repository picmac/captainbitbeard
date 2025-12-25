import { Response } from 'express';
import { AuthRequest } from '../../controllers/auth.controller';
import { playHistoryController } from '../../controllers/playhistory.controller';
import { playHistoryService } from '../../services/playhistory.service';

// Mock playhistory service
jest.mock('../../services/playhistory.service');

// Helper to create mock request and response
function createMockReqRes() {
  const req = {
    user: { id: 'user-123', username: 'testuser', role: 'USER' },
    params: {},
    query: {},
    body: {},
  } as unknown as AuthRequest;

  const res = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return { req, res };
}

describe('PlayHistory Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordPlay', () => {
    it('should record a play session', async () => {
      (playHistoryService.recordPlay as jest.Mock).mockResolvedValue({
        id: 'play-1',
        userId: 'user-123',
        gameId: 'game-1',
        playedAt: new Date(),
      });

      const { req, res } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await playHistoryController.recordPlay(req, res);

      expect(playHistoryService.recordPlay).toHaveBeenCalledWith('user-123', 'game-1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Play session recorded',
      });
    });

    it('should return 401 if user not authenticated', async () => {
      const { req, res } = createMockReqRes();
      req.user = undefined;
      req.params = { gameId: 'game-1' };

      await playHistoryController.recordPlay(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle errors', async () => {
      (playHistoryService.recordPlay as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { req, res } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await playHistoryController.recordPlay(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to record play session',
      });
    });
  });

  describe('getRecentGames', () => {
    it('should get recent games with default limit', async () => {
      const mockHistory = [
        {
          id: 'play-1',
          userId: 'user-123',
          gameId: 'game-1',
          playedAt: new Date('2025-01-01'),
          game: { id: 'game-1', title: 'Game 1' },
        },
        {
          id: 'play-2',
          userId: 'user-123',
          gameId: 'game-2',
          playedAt: new Date('2025-01-02'),
          game: { id: 'game-2', title: 'Game 2' },
        },
      ];

      (playHistoryService.getRecentGames as jest.Mock).mockResolvedValue(mockHistory);

      const { req, res } = createMockReqRes();

      await playHistoryController.getRecentGames(req, res);

      expect(playHistoryService.getRecentGames).toHaveBeenCalledWith('user-123', 10);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          games: [{ id: 'game-1', title: 'Game 1' }, { id: 'game-2', title: 'Game 2' }],
          playedAt: [new Date('2025-01-01'), new Date('2025-01-02')],
        },
      });
    });

    it('should get recent games with custom limit', async () => {
      (playHistoryService.getRecentGames as jest.Mock).mockResolvedValue([]);

      const { req, res } = createMockReqRes();
      req.query = { limit: '20' };

      await playHistoryController.getRecentGames(req, res);

      expect(playHistoryService.getRecentGames).toHaveBeenCalledWith('user-123', 20);
    });

    it('should return 401 if user not authenticated', async () => {
      const { req, res } = createMockReqRes();
      req.user = undefined;

      await playHistoryController.getRecentGames(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle errors', async () => {
      (playHistoryService.getRecentGames as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { req, res } = createMockReqRes();

      await playHistoryController.getRecentGames(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch recent games',
      });
    });
  });

  describe('getGameHistory', () => {
    it('should get play history for a specific game', async () => {
      const mockHistory = [
        {
          id: 'play-1',
          userId: 'user-123',
          gameId: 'game-1',
          playedAt: new Date('2025-01-01'),
          duration: 3600,
        },
        {
          id: 'play-2',
          userId: 'user-123',
          gameId: 'game-1',
          playedAt: new Date('2025-01-02'),
          duration: 7200,
        },
      ];

      (playHistoryService.getGamePlayHistory as jest.Mock).mockResolvedValue(mockHistory);

      const { req, res } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await playHistoryController.getGameHistory(req, res);

      expect(playHistoryService.getGamePlayHistory).toHaveBeenCalledWith('user-123', 'game-1');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { history: mockHistory },
      });
    });

    it('should return 401 if user not authenticated', async () => {
      const { req, res } = createMockReqRes();
      req.user = undefined;
      req.params = { gameId: 'game-1' };

      await playHistoryController.getGameHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle errors', async () => {
      (playHistoryService.getGamePlayHistory as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { req, res } = createMockReqRes();
      req.params = { gameId: 'game-1' };

      await playHistoryController.getGameHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch game history',
      });
    });
  });
});
