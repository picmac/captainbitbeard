import { PrismaClient, CollectionVisibility, SharePermission } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export class CollectionShareService {
  // Update collection visibility
  async updateVisibility(collectionId: string, userId: string, visibility: CollectionVisibility) {
    // Verify ownership
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new Error('Collection not found or access denied');
    }

    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data: { visibility },
    });

    return updated;
  }

  // Generate share link for unlisted collection
  async generateShareLink(collectionId: string, userId: string) {
    // Verify ownership
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new Error('Collection not found or access denied');
    }

    const shareLink = randomUUID();

    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        shareLink,
        visibility: CollectionVisibility.UNLISTED,
      },
    });

    return updated;
  }

  // Remove share link
  async removeShareLink(collectionId: string, userId: string) {
    // Verify ownership
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new Error('Collection not found or access denied');
    }

    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        shareLink: null,
        visibility: CollectionVisibility.PRIVATE,
      },
    });

    return updated;
  }

  // Share collection with specific user
  async shareWithUser(
    collectionId: string,
    ownerId: string,
    targetUserId: string,
    permission: SharePermission
  ) {
    // Verify ownership
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: ownerId },
    });

    if (!collection) {
      throw new Error('Collection not found or access denied');
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // Create or update share
    const share = await prisma.collectionShare.upsert({
      where: {
        collectionId_userId: {
          collectionId,
          userId: targetUserId,
        },
      },
      create: {
        collectionId,
        userId: targetUserId,
        permission,
      },
      update: {
        permission,
      },
    });

    return share;
  }

  // Remove user access
  async removeUserAccess(collectionId: string, ownerId: string, targetUserId: string) {
    // Verify ownership
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: ownerId },
    });

    if (!collection) {
      throw new Error('Collection not found or access denied');
    }

    await prisma.collectionShare.deleteMany({
      where: {
        collectionId,
        userId: targetUserId,
      },
    });

    return { success: true };
  }

  // Get all users with access to collection
  async getSharedUsers(collectionId: string, userId: string) {
    // Verify ownership
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new Error('Collection not found or access denied');
    }

    const shares = await prisma.collectionShare.findMany({
      where: { collectionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return shares;
  }

  // Get collections shared with user
  async getSharedWithMe(userId: string) {
    const shares = await prisma.collectionShare.findMany({
      where: { userId },
      include: {
        collection: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
            games: {
              include: {
                game: true,
              },
            },
          },
        },
      },
    });

    return shares.map((share) => ({
      ...share.collection,
      permission: share.permission,
    }));
  }

  // Get collection by share link
  async getByShareLink(shareLink: string) {
    const collection = await prisma.collection.findUnique({
      where: { shareLink },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        games: {
          include: {
            game: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!collection || collection.visibility !== CollectionVisibility.UNLISTED) {
      throw new Error('Collection not found or not accessible');
    }

    return collection;
  }

  // Check if user can access collection
  async canUserAccess(collectionId: string, userId: string | null) {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      return false;
    }

    // Owner always has access
    if (userId && collection.userId === userId) {
      return true;
    }

    // Public collections are accessible to all
    if (collection.visibility === CollectionVisibility.PUBLIC) {
      return true;
    }

    // Check if user has explicit share access
    if (userId) {
      const share = await prisma.collectionShare.findUnique({
        where: {
          collectionId_userId: {
            collectionId,
            userId,
          },
        },
      });

      if (share) {
        return true;
      }
    }

    return false;
  }
}

export const collectionShareService = new CollectionShareService();
