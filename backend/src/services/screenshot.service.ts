import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ScreenshotService {
  // Add screenshot to game
  async addScreenshot(
    gameId: string,
    url: string,
    type: string = 'gameplay',
    order: number = 0
  ) {
    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    const screenshot = await prisma.screenshot.create({
      data: {
        gameId,
        url,
        type,
        order,
      },
    });

    return screenshot;
  }

  // Get all screenshots for a game
  async getScreenshotsByGame(gameId: string) {
    const screenshots = await prisma.screenshot.findMany({
      where: { gameId },
      orderBy: [
        { type: 'asc' },
        { order: 'asc' },
      ],
    });

    return screenshots;
  }

  // Get screenshots by type
  async getScreenshotsByType(gameId: string, type: string) {
    const screenshots = await prisma.screenshot.findMany({
      where: {
        gameId,
        type,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return screenshots;
  }

  // Update screenshot order
  async updateScreenshotOrder(id: string, order: number) {
    const screenshot = await prisma.screenshot.update({
      where: { id },
      data: { order },
    });

    return screenshot;
  }

  // Delete screenshot
  async deleteScreenshot(id: string) {
    const screenshot = await prisma.screenshot.findUnique({
      where: { id },
    });

    if (!screenshot) {
      throw new Error('Screenshot not found');
    }

    await prisma.screenshot.delete({
      where: { id },
    });

    return { success: true, url: screenshot.url };
  }

  // Bulk add screenshots
  async bulkAddScreenshots(
    gameId: string,
    screenshots: Array<{ url: string; type?: string; order?: number }>
  ) {
    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    const created = await prisma.screenshot.createMany({
      data: screenshots.map((screenshot, index) => ({
        gameId,
        url: screenshot.url,
        type: screenshot.type || 'gameplay',
        order: screenshot.order ?? index,
      })),
    });

    return created;
  }

  // Reorder screenshots
  async reorderScreenshots(updates: Array<{ id: string; order: number }>) {
    const promises = updates.map(({ id, order }) =>
      prisma.screenshot.update({
        where: { id },
        data: { order },
      })
    );

    const results = await Promise.all(promises);
    return results;
  }
}

export const screenshotService = new ScreenshotService();
