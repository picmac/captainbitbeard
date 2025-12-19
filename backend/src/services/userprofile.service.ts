import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserProfileService {
  // Get user profile
  async getProfile(userId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return profile;
  }

  // Get or create user profile
  async getOrCreateProfile(userId: string) {
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId },
      });
    }

    return profile;
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updates: {
      avatarUrl?: string;
      bio?: string;
    }
  ) {
    // Ensure profile exists
    await this.getOrCreateProfile(userId);

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: updates,
    });

    return profile;
  }

  // Get public profile (for viewing other users)
  async getPublicProfile(userId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
      },
    });

    return profile;
  }

  // Get user statistics
  async getUserStats(userId: string) {
    const [collectionsCount, favoritesCount, playHistoryCount] =
      await Promise.all([
        prisma.collection.count({ where: { userId } }),
        prisma.favorite.count({ where: { userId } }),
        prisma.playHistory.count({ where: { userId } }),
      ]);

    return {
      collectionsCount,
      favoritesCount,
      playHistoryCount,
    };
  }
}

export const userProfileService = new UserProfileService();
