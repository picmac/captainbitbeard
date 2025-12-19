import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PlayHistoryService {
  /**
   * Record a play session
   */
  async recordPlay(userId: string, gameId: string): Promise<void> {
    await prisma.playHistory.create({
      data: {
        userId,
        gameId,
        playedAt: new Date(),
      },
    });
  }

  /**
   * Get recent games played by user
   */
  async getRecentGames(userId: string, limit: number = 10) {
    const recentPlays = await prisma.playHistory.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: limit,
      distinct: ['gameId'], // Only get unique games
      include: {
        game: true,
      },
    });

    return recentPlays.map((play) => ({
      game: play.game,
      playedAt: play.playedAt,
    }));
  }

  /**
   * Get play history for a specific game
   */
  async getGamePlayHistory(userId: string, gameId: string) {
    return await prisma.playHistory.findMany({
      where: {
        userId,
        gameId,
      },
      orderBy: { playedAt: 'desc' },
    });
  }
}

export const playHistoryService = new PlayHistoryService();
