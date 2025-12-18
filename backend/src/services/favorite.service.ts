import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface FavoriteWithGame {
  id: string;
  userId: string;
  gameId: string;
  createdAt: Date;
  game: {
    id: string;
    title: string;
    system: string;
    coverUrl: string | null;
    description: string | null;
    developer: string | null;
    publisher: string | null;
    genre: string | null;
    rating: number | null;
  };
}

export class FavoriteService {
  /**
   * Get all favorites for a user
   */
  async getUserFavorites(userId: string): Promise<FavoriteWithGame[]> {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
          game: {
            select: {
              id: true,
              title: true,
              system: true,
              coverUrl: true,
              description: true,
              developer: true,
              publisher: true,
              genre: true,
              rating: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return favorites;
    } catch (error) {
      logger.error({ err: error }, `Failed to get favorites for user: ${userId}`);
      throw error;
    }
  }

  /**
   * Check if a game is favorited by user
   */
  async isFavorited(userId: string, gameId: string): Promise<boolean> {
    try {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      });

      return !!favorite;
    } catch (error) {
      logger.error({ err: error }, `Failed to check favorite: ${userId}/${gameId}`);
      throw error;
    }
  }

  /**
   * Add game to favorites
   */
  async addFavorite(userId: string, gameId: string): Promise<{ id: string; createdAt: Date }> {
    try {
      // Check if game exists
      const game = await prisma.game.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        throw new Error('Game not found');
      }

      // Check if already favorited
      const existing = await prisma.favorite.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      });

      if (existing) {
        // Already favorited, return existing
        return { id: existing.id, createdAt: existing.createdAt };
      }

      // Create favorite
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          gameId,
        },
      });

      logger.info(`User ${userId} favorited game ${gameId}`);

      return { id: favorite.id, createdAt: favorite.createdAt };
    } catch (error) {
      logger.error({ err: error }, `Failed to add favorite: ${userId}/${gameId}`);
      throw error;
    }
  }

  /**
   * Remove game from favorites
   */
  async removeFavorite(userId: string, gameId: string): Promise<void> {
    try {
      await prisma.favorite.delete({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      });

      logger.info(`User ${userId} unfavorited game ${gameId}`);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        // Record not found, already removed
        logger.warn(`Favorite not found: ${userId}/${gameId}`);
        return;
      }

      logger.error({ err: error }, `Failed to remove favorite: ${userId}/${gameId}`);
      throw error;
    }
  }

  /**
   * Get favorite count for a game
   */
  async getFavoriteCount(gameId: string): Promise<number> {
    try {
      const count = await prisma.favorite.count({
        where: { gameId },
      });

      return count;
    } catch (error) {
      logger.error({ err: error }, `Failed to get favorite count for game: ${gameId}`);
      throw error;
    }
  }

  /**
   * Get multiple games favorite status for a user
   */
  async getMultipleFavoriteStatus(
    userId: string,
    gameIds: string[]
  ): Promise<Record<string, boolean>> {
    try {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId,
          gameId: {
            in: gameIds,
          },
        },
        select: {
          gameId: true,
        },
      });

      const favoriteMap: Record<string, boolean> = {};
      gameIds.forEach((id) => {
        favoriteMap[id] = false;
      });

      favorites.forEach((fav: { gameId: string }) => {
        favoriteMap[fav.gameId] = true;
      });

      return favoriteMap;
    } catch (error) {
      logger.error({ err: error }, 'Failed to get multiple favorite status');
      throw error;
    }
  }
}

export const favoriteService = new FavoriteService();
