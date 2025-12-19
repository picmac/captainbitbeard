import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminService {
  // Get system statistics
  async getSystemStats() {
    const [
      totalGames,
      totalUsers,
      totalCollections,
      totalSaveStates,
      totalPlaySessions,
      totalScreenshots,
      usersByRole,
      gamesBySystem,
      recentUsers,
      recentGames,
    ] = await Promise.all([
      // Total counts
      prisma.game.count(),
      prisma.user.count(),
      prisma.collection.count(),
      prisma.saveState.count(),
      prisma.playHistory.count(),
      prisma.screenshot.count(),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),

      // Games by system
      prisma.game.groupBy({
        by: ['system'],
        _count: true,
        orderBy: {
          _count: {
            system: 'desc',
          },
        },
      }),

      // Recent users (last 10)
      prisma.user.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),

      // Recent games (last 10)
      prisma.game.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          system: true,
          coverUrl: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      overview: {
        totalGames,
        totalUsers,
        totalCollections,
        totalSaveStates,
        totalPlaySessions,
        totalScreenshots,
      },
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      gamesBySystem: gamesBySystem.map((item) => ({
        system: item.system,
        count: item._count,
      })),
      recentUsers,
      recentGames,
    };
  }

  // Get all users with details
  async getAllUsers(includeStats = false) {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ...(includeStats && {
          _count: {
            select: {
              collections: true,
              favorites: true,
              playHistory: true,
              saveStates: true,
            },
          },
        }),
      },
    });

    return users;
  }

  // Update user role
  async updateUserRole(userId: string, role: UserRole) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return user;
  }

  // Delete user
  async deleteUser(userId: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  }

  // Bulk delete games
  async bulkDeleteGames(gameIds: string[]) {
    const result = await prisma.game.deleteMany({
      where: {
        id: {
          in: gameIds,
        },
      },
    });

    return { deletedCount: result.count };
  }

  // Bulk update games (e.g., change system, genre, etc.)
  async bulkUpdateGames(
    gameIds: string[],
    updates: {
      system?: string;
      genre?: string;
      developer?: string;
      publisher?: string;
    }
  ) {
    const result = await prisma.game.updateMany({
      where: {
        id: {
          in: gameIds,
        },
      },
      data: updates,
    });

    return { updatedCount: result.count };
  }

  // Find duplicate games (by title and system)
  async findDuplicates() {
    const games = await prisma.game.findMany({
      select: {
        id: true,
        title: true,
        system: true,
        createdAt: true,
      },
      orderBy: {
        title: 'asc',
      },
    });

    // Group by title + system
    const grouped = games.reduce((acc, game) => {
      const key = `${game.title.toLowerCase()}_${game.system}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(game);
      return acc;
    }, {} as Record<string, typeof games>);

    // Filter groups with more than one game
    const duplicates = Object.values(grouped).filter((group) => group.length > 1);

    return duplicates;
  }

  // Get storage statistics
  async getStorageStats() {
    // This would require querying MinIO or file system
    // For now, return placeholder data
    return {
      totalGames: await prisma.game.count(),
      gamesWithCover: await prisma.game.count({
        where: {
          coverUrl: {
            not: null,
          },
        },
      }),
      totalScreenshots: await prisma.screenshot.count(),
      totalSaveStates: await prisma.saveState.count(),
    };
  }

  // Get activity statistics (last 30 days)
  async getActivityStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newGames, newUsers, playSessions, newCollections] = await Promise.all([
      prisma.game.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.playHistory.count({
        where: {
          playedAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.collection.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ]);

    return {
      newGames,
      newUsers,
      playSessions,
      newCollections,
    };
  }
}

export const adminService = new AdminService();
