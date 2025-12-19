import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CollectionService {
  // Create a new collection
  async createCollection(userId: string, name: string, description?: string) {
    return await prisma.collection.create({
      data: {
        userId,
        name,
        description,
      },
      include: {
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
  }

  // Get all collections for a user
  async getUserCollections(userId: string) {
    return await prisma.collection.findMany({
      where: {
        userId,
      },
      include: {
        games: {
          include: {
            game: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get a single collection by ID
  async getCollectionById(collectionId: string, userId: string) {
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId,
      },
      include: {
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

    if (!collection) {
      throw new Error('Collection not found');
    }

    return collection;
  }

  // Update collection
  async updateCollection(
    collectionId: string,
    userId: string,
    updates: { name?: string; description?: string }
  ) {
    // Verify ownership
    await this.getCollectionById(collectionId, userId);

    return await prisma.collection.update({
      where: {
        id: collectionId,
      },
      data: updates,
      include: {
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
  }

  // Delete collection
  async deleteCollection(collectionId: string, userId: string) {
    // Verify ownership
    await this.getCollectionById(collectionId, userId);

    await prisma.collection.delete({
      where: {
        id: collectionId,
      },
    });
  }

  // Add game to collection
  async addGameToCollection(collectionId: string, gameId: string, userId: string) {
    // Verify ownership
    await this.getCollectionById(collectionId, userId);

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Check if already in collection
    const existing = await prisma.collectionGame.findUnique({
      where: {
        collectionId_gameId: {
          collectionId,
          gameId,
        },
      },
    });

    if (existing) {
      throw new Error('Game already in collection');
    }

    // Get the highest order number
    const lastGame = await prisma.collectionGame.findFirst({
      where: { collectionId },
      orderBy: { order: 'desc' },
    });

    const nextOrder = lastGame ? lastGame.order + 1 : 0;

    return await prisma.collectionGame.create({
      data: {
        collectionId,
        gameId,
        order: nextOrder,
      },
      include: {
        game: true,
      },
    });
  }

  // Remove game from collection
  async removeGameFromCollection(collectionId: string, gameId: string, userId: string) {
    // Verify ownership
    await this.getCollectionById(collectionId, userId);

    await prisma.collectionGame.delete({
      where: {
        collectionId_gameId: {
          collectionId,
          gameId,
        },
      },
    });
  }

  // Reorder games in collection
  async reorderGames(
    collectionId: string,
    userId: string,
    gameOrders: Array<{ gameId: string; order: number }>
  ) {
    // Verify ownership
    await this.getCollectionById(collectionId, userId);

    // Update orders in a transaction
    await prisma.$transaction(
      gameOrders.map((item) =>
        prisma.collectionGame.update({
          where: {
            collectionId_gameId: {
              collectionId,
              gameId: item.gameId,
            },
          },
          data: {
            order: item.order,
          },
        })
      )
    );

    return await this.getCollectionById(collectionId, userId);
  }

  // Get all collections that contain a specific game
  async getCollectionsWithGame(gameId: string, userId: string) {
    return await prisma.collection.findMany({
      where: {
        userId,
        games: {
          some: {
            gameId,
          },
        },
      },
      include: {
        games: {
          where: {
            gameId,
          },
        },
      },
    });
  }
}

export const collectionService = new CollectionService();
