import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SaveStateService {
  // Create or update a save state
  async createOrUpdateSaveState(
    userId: string,
    gameId: string,
    slot: number,
    statePath: string,
    screenshotUrl?: string,
    description?: string
  ) {
    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Upsert save state (create or update if exists)
    const saveState = await prisma.saveState.upsert({
      where: {
        userId_gameId_slot: {
          userId,
          gameId,
          slot,
        },
      },
      create: {
        userId,
        gameId,
        slot,
        statePath,
        screenshotUrl,
        description,
      },
      update: {
        statePath,
        screenshotUrl,
        description,
        updatedAt: new Date(),
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            system: true,
            coverUrl: true,
          },
        },
      },
    });

    return saveState;
  }

  // Get all save states for a game (user's own states)
  async getSaveStatesByGame(gameId: string, userId: string) {
    const saveStates = await prisma.saveState.findMany({
      where: {
        gameId,
        userId,
      },
      orderBy: [
        { slot: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        game: {
          select: {
            id: true,
            title: true,
            system: true,
            coverUrl: true,
          },
        },
      },
    });

    return saveStates;
  }

  // Get all save states for a user (across all games)
  async getSaveStatesByUser(userId: string) {
    const saveStates = await prisma.saveState.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            system: true,
            coverUrl: true,
          },
        },
      },
    });

    return saveStates;
  }

  // Get specific save state by ID
  async getSaveStateById(id: string, userId: string) {
    const saveState = await prisma.saveState.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            system: true,
            coverUrl: true,
          },
        },
      },
    });

    if (!saveState) {
      throw new Error('Save state not found or access denied');
    }

    return saveState;
  }

  // Update save state description
  async updateSaveState(id: string, userId: string, description?: string) {
    // Verify ownership
    const saveState = await prisma.saveState.findFirst({
      where: { id, userId },
    });

    if (!saveState) {
      throw new Error('Save state not found or access denied');
    }

    const updated = await prisma.saveState.update({
      where: { id },
      data: { description },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            system: true,
            coverUrl: true,
          },
        },
      },
    });

    return updated;
  }

  // Delete save state
  async deleteSaveState(id: string, userId: string) {
    // Verify ownership
    const saveState = await prisma.saveState.findFirst({
      where: { id, userId },
    });

    if (!saveState) {
      throw new Error('Save state not found or access denied');
    }

    await prisma.saveState.delete({
      where: { id },
    });

    return { success: true, statePath: saveState.statePath };
  }

  // Get save state by game and slot (for quick slot loading)
  async getSaveStateBySlot(gameId: string, userId: string, slot: number) {
    const saveState = await prisma.saveState.findUnique({
      where: {
        userId_gameId_slot: {
          userId,
          gameId,
          slot,
        },
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            system: true,
            coverUrl: true,
          },
        },
      },
    });

    return saveState;
  }

  // Get total save state count for a user
  async getSaveStateCount(userId: string) {
    const count = await prisma.saveState.count({
      where: { userId },
    });

    return count;
  }
}

export const saveStateService = new SaveStateService();
