import { PrismaClient, Game, Prisma } from '@prisma/client';
import { minioService } from './minio.service';
import { screenScraperService } from './screenscraper.service';
import { logger } from '../utils/logger';
import { SUPPORTED_SYSTEMS, isValidSystem } from '../constants/systems';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface CreateGameDto {
  title: string;
  system: string;
  romBuffer: Buffer;
  romFileName: string;
  coverBuffer?: Buffer;
  description?: string;
  releaseDate?: Date;
  developer?: string;
  publisher?: string;
  genre?: string;
  players?: number;
}

export interface GameWithUrls extends Game {
  romDownloadUrl?: string;
}

export class GameService {
  /**
   * Create a new game with ROM upload
   */
  async createGame(data: CreateGameDto): Promise<Game> {
    try {
      // Validate system
      if (!isValidSystem(data.system)) {
        const validSystems = SUPPORTED_SYSTEMS.map(s => s.id).join(', ');
        throw new Error(`Unsupported system: ${data.system}. Valid systems are: ${validSystems}`);
      }

      // Upload ROM to MinIO
      const romPath = await minioService.uploadRom(
        data.romFileName,
        data.system,
        data.romBuffer
      );

      // Upload cover if provided
      let coverUrl: string | undefined;
      if (data.coverBuffer) {
        const tempGameId = crypto.randomUUID();
        coverUrl = await minioService.uploadCover(tempGameId, data.coverBuffer);
      }

      // Calculate MD5 hash
      const md5Hash = crypto
        .createHash('md5')
        .update(data.romBuffer)
        .digest('hex');

      // Create game in database
      const game = await prisma.game.create({
        data: {
          title: data.title,
          system: data.system,
          romPath,
          coverUrl,
          description: data.description,
          releaseDate: data.releaseDate,
          developer: data.developer,
          publisher: data.publisher,
          genre: data.genre,
          players: data.players,
          metadata: {
            create: {
              fileSize: BigInt(data.romBuffer.length),
              md5Hash,
            },
          },
        },
        include: {
          metadata: true,
        },
      });

      logger.info(`Game created: ${game.title} (${game.id})`);
      return game;
    } catch (error) {
      logger.error({ err: error }, 'Failed to create game');
      throw error;
    }
  }

  /**
   * Get all games with optional filters
   */
  async getAllGames(filters?: {
    system?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ games: Game[]; total: number }> {
    const where: Prisma.GameWhereInput = {};

    if (filters?.system) {
      where.system = filters.system;
    }

    if (filters?.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          metadata: true,
          screenshots: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.game.count({ where }),
    ]);

    return { games, total };
  }

  /**
   * Get game by ID
   */
  async getGameById(id: string): Promise<Prisma.GameGetPayload<{ include: { metadata: true; screenshots: true } }> | null> {
    return prisma.game.findUnique({
      where: { id },
      include: {
        metadata: true,
        screenshots: true,
      },
    });
  }

  /**
   * Get game by ID with ROM download URL
   */
  async getGameWithDownloadUrl(id: string): Promise<GameWithUrls | null> {
    const game = await this.getGameById(id);
    if (!game) return null;

    // Use backend streaming endpoint instead of presigned URL
    // This avoids signature issues when replacing internal hostnames
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const romDownloadUrl = `${backendUrl}/api/games/${id}/rom`;

    return {
      ...game,
      romDownloadUrl,
    };
  }

  /**
   * Get games by system
   */
  async getGamesBySystem(system: string): Promise<Game[]> {
    return prisma.game.findMany({
      where: { system },
      include: {
        metadata: true,
      },
      orderBy: {
        title: 'asc',
      },
    });
  }

  /**
   * Search games by title (simple search - kept for backwards compatibility)
   */
  async searchGames(query: string): Promise<Game[]> {
    return this.fullTextSearch({ query });
  }

  /**
   * Full-text search across multiple fields with advanced filtering
   */
  async fullTextSearch(options: {
    query?: string;
    systems?: string[];
    genres?: string[];
    developers?: string[];
    publishers?: string[];
    yearFrom?: number;
    yearTo?: number;
    players?: number;
    limit?: number;
  }): Promise<Game[]> {
    const {
      query,
      systems,
      genres,
      developers,
      publishers,
      yearFrom,
      yearTo,
      players,
      limit = 20,
    } = options;

    // Build the where clause for full-text search
    const where: Prisma.GameWhereInput = {};

    // Full-text search across multiple fields
    if (query && query.trim()) {
      where.OR = [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          developer: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          publisher: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          genre: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ];
    }

    // System filter
    if (systems && systems.length > 0) {
      where.system = {
        in: systems,
      };
    }

    // Genre filter
    if (genres && genres.length > 0) {
      where.genre = {
        in: genres,
      };
    }

    // Developer filter
    if (developers && developers.length > 0) {
      where.developer = {
        in: developers,
      };
    }

    // Publisher filter
    if (publishers && publishers.length > 0) {
      where.publisher = {
        in: publishers,
      };
    }

    // Year range filter
    if (yearFrom || yearTo) {
      where.releaseDate = {};
      if (yearFrom) {
        where.releaseDate.gte = new Date(`${yearFrom}-01-01`);
      }
      if (yearTo) {
        where.releaseDate.lte = new Date(`${yearTo}-12-31`);
      }
    }

    // Player count filter
    if (players) {
      where.players = players;
    }

    return prisma.game.findMany({
      where,
      include: {
        metadata: true,
      },
      take: limit,
      orderBy: {
        title: 'asc',
      },
    });
  }

  /**
   * Update game metadata
   */
  async updateGame(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      releaseDate: Date;
      developer: string;
      publisher: string;
      genre: string;
      players: number;
      rating: number;
    }>
  ): Promise<Game> {
    return prisma.game.update({
      where: { id },
      data,
      include: {
        metadata: true,
      },
    });
  }

  /**
   * Delete game (and ROM from MinIO)
   */
  async deleteGame(id: string): Promise<void> {
    const game = await this.getGameById(id);
    if (!game) {
      throw new Error('Game not found');
    }

    try {
      // Delete ROM from MinIO
      await minioService.deleteFile(game.romPath);

      // Delete cover if exists
      if (game.coverUrl) {
        const coverPath = game.coverUrl.split('/').slice(-2).join('/');
        await minioService.deleteFile(coverPath);
      }

      // Delete game from database (cascade deletes metadata, screenshots, etc.)
      await prisma.game.delete({
        where: { id },
      });

      logger.info(`Game deleted: ${game.title} (${id})`);
    } catch (error) {
      logger.error({ err: error }, `Failed to delete game: ${id}`);
      throw error;
    }
  }

  /**
   * Get supported systems with metadata
   */
  async getSupportedSystems(): Promise<Array<{
    id: string;
    name: string;
    manufacturer: string;
    core: string;
    extensions: string[];
    biosRequired: boolean;
    count: number;
  }>> {
    // Get game counts from database
    const gameCounts = await prisma.game.groupBy({
      by: ['system'],
      _count: {
        system: true,
      },
    });

    // Create a map of system -> count
    const countMap = new Map(
      gameCounts.map((s) => [s.system, s._count.system])
    );

    // Return all supported systems with their counts
    return SUPPORTED_SYSTEMS.map((sys) => ({
      id: sys.id,
      name: sys.name,
      manufacturer: sys.manufacturer,
      core: sys.core,
      extensions: sys.extensions,
      biosRequired: sys.biosRequired,
      count: countMap.get(sys.id) || 0,
    }));
  }

  /**
   * Fetch metadata from ScreenScraper and update game
   */
  async fetchMetadata(gameId: string): Promise<Game | null> {
    const game = await this.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    try {
      logger.info(`Fetching metadata for game: ${game.title}`);

      // Extract ROM filename from path
      const romFileName = game.romPath.split('/').pop() || game.title;

      // Try to fetch by ROM name
      let metadata = await screenScraperService.searchGameByRomName(romFileName, game.system);

      // If not found, try by CRC/MD5 if available
      if (!metadata && game.metadata?.md5Hash) {
        metadata = await screenScraperService.searchGameByCrc(
          game.metadata.md5Hash,
          game.system
        );
      }

      if (!metadata) {
        logger.warn(`No metadata found for: ${game.title}`);
        return game;
      }

      // Download cover image if available
      let coverUrl = game.coverUrl;
      if (metadata.coverUrl) {
        const coverBuffer = await screenScraperService.downloadImage(metadata.coverUrl);
        if (coverBuffer) {
          coverUrl = await minioService.uploadCover(game.id, coverBuffer);
          logger.info(`Cover uploaded for: ${game.title}`);
        }
      }

      // Download screenshots if available
      if (metadata.screenshotUrls && metadata.screenshotUrls.length > 0) {
        for (let i = 0; i < Math.min(metadata.screenshotUrls.length, 4); i++) {
          const screenshotBuffer = await screenScraperService.downloadImage(
            metadata.screenshotUrls[i]
          );
          if (screenshotBuffer) {
            const screenshotUrl = await minioService.uploadScreenshot(
              game.id,
              i,
              screenshotBuffer
            );

            // Create screenshot record
            await prisma.screenshot.create({
              data: {
                gameId: game.id,
                url: screenshotUrl,
                order: i,
              },
            });

            logger.info(`Screenshot ${i + 1} uploaded for: ${game.title}`);
          }
        }
      }

      // Update game with metadata
      const updatedGame = await prisma.game.update({
        where: { id: gameId },
        data: {
          title: metadata.title || game.title,
          description: metadata.description,
          coverUrl,
          releaseDate: metadata.releaseDate ? new Date(metadata.releaseDate) : undefined,
          developer: metadata.developer,
          publisher: metadata.publisher,
          genre: metadata.genre,
          players: metadata.players,
          rating: metadata.rating,
        },
        include: {
          metadata: true,
          screenshots: true,
        },
      });

      logger.info(`Metadata updated for: ${game.title}`);
      return updatedGame;
    } catch (error) {
      logger.error({ err: error }, `Failed to fetch metadata for game: ${gameId}`);
      throw error;
    }
  }

  /**
   * Bulk fetch metadata for multiple games
   */
  async bulkFetchMetadata(gameIds: string[]): Promise<{
    success: number;
    failed: number;
    results: Array<{ gameId: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ gameId: string; success: boolean; error?: string }> = [];
    let success = 0;
    let failed = 0;

    for (const gameId of gameIds) {
      try {
        await this.fetchMetadata(gameId);
        results.push({ gameId, success: true });
        success++;

        // Rate limiting: wait 1 second between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ gameId, success: false, error: errorMessage });
        failed++;
        logger.error({ err: error }, `Failed to fetch metadata for game: ${gameId}`);
      }
    }

    return { success, failed, results };
  }
}

export const gameService = new GameService();
