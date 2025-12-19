import { Response } from 'express';
import { playHistoryService } from '../services/playhistory.service';
import { AuthRequest } from './auth.controller';
import { logger } from '../utils/logger';

export class PlayHistoryController {
  /**
   * Record a play session
   * POST /api/play-history/:gameId
   */
  async recordPlay(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await playHistoryService.recordPlay(userId, gameId);

      res.status(201).json({
        status: 'success',
        message: 'Play session recorded',
      });
    } catch (error) {
      logger.error({ err: error }, 'Error recording play session');
      res.status(500).json({
        error: 'Failed to record play session',
      });
    }
  }

  /**
   * Get recent games played by user
   * GET /api/play-history/recent
   */
  async getRecentGames(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const recentGames = await playHistoryService.getRecentGames(userId, limit);

      res.json({
        status: 'success',
        data: {
          games: recentGames.map((item) => item.game),
          playedAt: recentGames.map((item) => item.playedAt),
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'Error fetching recent games');
      res.status(500).json({
        error: 'Failed to fetch recent games',
      });
    }
  }

  /**
   * Get play history for a specific game
   * GET /api/play-history/game/:gameId
   */
  async getGameHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const history = await playHistoryService.getGamePlayHistory(userId, gameId);

      res.json({
        status: 'success',
        data: { history },
      });
    } catch (error) {
      logger.error({ err: error }, 'Error fetching game history');
      res.status(500).json({
        error: 'Failed to fetch game history',
      });
    }
  }
}

export const playHistoryController = new PlayHistoryController();
