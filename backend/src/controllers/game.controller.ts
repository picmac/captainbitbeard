import { Request, Response, NextFunction } from 'express';
import { gameService } from '../services/game.service';
import { AppError } from '../middleware/error-handler';

interface UploadRomBody {
  title: string;
  system: string;
  description?: string;
  developer?: string;
  publisher?: string;
  genre?: string;
  players?: string;
}

interface UpdateGameBody {
  title?: string;
  description?: string;
  developer?: string;
  publisher?: string;
  releaseYear?: number;
  genre?: string;
  players?: number;
}

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
        req.body as UploadRomBody;

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
        players: players ? parseInt(players, 10) : undefined,
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
   * Advanced full-text search with filters
   * GET /api/games/advanced-search
   */
  async advancedSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        q,
        systems,
        genres,
        developers,
        publishers,
        yearFrom,
        yearTo,
        players,
        limit,
      } = req.query;

      const games = await gameService.fullTextSearch({
        query: q as string,
        systems: systems ? (systems as string).split(',') : undefined,
        genres: genres ? (genres as string).split(',') : undefined,
        developers: developers ? (developers as string).split(',') : undefined,
        publishers: publishers ? (publishers as string).split(',') : undefined,
        yearFrom: yearFrom ? parseInt(yearFrom as string) : undefined,
        yearTo: yearTo ? parseInt(yearTo as string) : undefined,
        players: players ? parseInt(players as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

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
      const updates = req.body as UpdateGameBody;

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
  async getSystems(_req: Request, res: Response, next: NextFunction): Promise<void> {
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

  /**
   * Bulk upload ROMs
   * POST /api/games/bulk-upload
   */
  async bulkUploadRoms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError('No ROM files provided', 400);
      }

      const { system, autoScrape } = req.body as { system?: string; autoScrape?: string | boolean };

      if (!system) {
        throw new AppError('System is required', 400);
      }

      const results = {
        total: files.length,
        successful: [] as string[],
        failed: [] as { filename: string; error: string }[],
      };

      // Process each file
      for (const file of files) {
        try {
          // Extract title from filename (remove extension)
          const title = file.originalname.replace(/\.[^/.]+$/, '');

          const game = await gameService.createGame({
            title,
            system: system.toLowerCase(),
            romBuffer: file.buffer,
            romFileName: file.originalname,
          });

          results.successful.push(game.id);

          // Auto-scrape metadata if requested
          if (autoScrape === 'true' || autoScrape === true) {
            try {
              await gameService.fetchMetadata(game.id);
            } catch (scrapeError) {
              // Log but don't fail the upload
              console.error(`Failed to scrape metadata for ${title}:`, scrapeError);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.failed.push({
            filename: file.originalname,
            error: errorMessage,
          });
        }
      }

      res.status(201).json({
        status: 'success',
        data: { results },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch metadata for a single game
   * POST /api/games/:id/scrape
   */
  async scrapeMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const game = await gameService.fetchMetadata(id);

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
   * Bulk fetch metadata for multiple games
   * POST /api/games/bulk-scrape
   */
  async bulkScrapeMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gameIds } = req.body as { gameIds?: unknown };

      if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
        throw new AppError('Game IDs array is required', 400);
      }

      const results = await gameService.bulkFetchMetadata(gameIds);

      res.json({
        status: 'success',
        data: { results },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Stream ROM file directly
   * GET /api/games/:id/rom
   */
  async streamRom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const game = await gameService.getGameById(id);

      if (!game) {
        throw new AppError('Game not found', 404);
      }

      // Import minioService here to avoid circular dependency
      const { minioService } = await import('../services/minio.service');

      // Get file metadata
      const fileName = game.romPath.split('/').pop() || 'game.rom';
      const fileSize = game.metadata?.fileSize ? Number(game.metadata.fileSize) : 0;
      const etag = game.metadata?.md5Hash || `"${game.id}"`;

      // Check If-None-Match for 304 Not Modified
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        res.status(304).end();
        return;
      }

      // Set caching headers
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
      res.setHeader('Last-Modified', game.createdAt.toUTCString());
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, ETag');

      // Handle Range requests for resumable downloads
      const range = req.headers.range;
      if (range && fileSize > 0) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        // Validate range
        if (start >= fileSize || end >= fileSize) {
          res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
          return;
        }

        // Get partial stream from MinIO
        const romStream = await minioService.streamRomRange(game.romPath, start, end);

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Content-Length', chunkSize.toString());
        romStream.pipe(res);
      } else {
        // Full file streaming
        const romStream = await minioService.streamRom(game.romPath);

        if (fileSize > 0) {
          res.setHeader('Content-Length', fileSize.toString());
        }
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        romStream.pipe(res);
      }
    } catch (error) {
      next(error);
    }
  }
}

export const gameController = new GameController();
