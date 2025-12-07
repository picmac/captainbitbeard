import { Request, Response, NextFunction } from 'express';
import { gameService } from '../services/game.service';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

export class GameController {
  /**
   * Upload ROM and create game
   * POST /api/games/upload
   */
  async uploadRom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No ROM file provided', 400);
      }

      const { title, system, description, developer, publisher, genre, players } =
        req.body;

      if (!title || !system) {
        throw new AppError('Title and system are required', 400);
      }

      const game = await gameService.createGame({
        title,
        system: system.toLowerCase(),
        romBuffer: req.file.buffer,
        romFileName: req.file.originalname,
        description,
        developer,
        publisher,
        genre,
        players: players ? parseInt(players) : undefined,
      });

      res.status(201).json({
        status: 'success',
        data: { game },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all games
   * GET /api/games
   */
  async getAllGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { system, search, limit, offset } = req.query;

      const result = await gameService.getAllGames({
        system: system as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json({
        status: 'success',
        data: {
          games: result.games,
          total: result.total,
          limit: limit ? parseInt(limit as string) : 50,
          offset: offset ? parseInt(offset as string) : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get game by ID
   * GET /api/games/:id
   */
  async getGameById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const game = await gameService.getGameById(id);

      if (!game) {
        throw new AppError('Game not found', 404);
      }

      res.json({
        status: 'success',
        data: { game },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get game with ROM download URL (for playing)
   * GET /api/games/:id/play
   */
  async getGameForPlay(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const game = await gameService.getGameWithDownloadUrl(id);

      if (!game) {
        throw new AppError('Game not found', 404);
      }

      res.json({
        status: 'success',
        data: { game },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get games by system
   * GET /api/games/system/:system
   */
  async getGamesBySystem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { system } = req.params;
      const games = await gameService.getGamesBySystem(system.toLowerCase());

      res.json({
        status: 'success',
        data: { games, count: games.length },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search games
   * GET /api/games/search?q=
   */
  async searchGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        throw new AppError('Search query required', 400);
      }

      const games = await gameService.searchGames(q);

      res.json({
        status: 'success',
        data: { games, count: games.length },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update game metadata
   * PATCH /api/games/:id
   */
  async updateGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const game = await gameService.updateGame(id, updates);

      res.json({
        status: 'success',
        data: { game },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete game
   * DELETE /api/games/:id
   */
  async deleteGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await gameService.deleteGame(id);

      res.json({
        status: 'success',
        message: 'Game deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get supported systems
   * GET /api/games/systems
   */
  async getSystems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const systems = await gameService.getSupportedSystems();

      res.json({
        status: 'success',
        data: { systems },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const gameController = new GameController();
