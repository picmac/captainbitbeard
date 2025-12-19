import { Request, Response } from 'express';
import { screenshotService } from '../services/screenshot.service';
import { minioService } from '../services/minio.service';
import { Readable } from 'stream';

interface AddScreenshotBody {
  url?: string;
  type?: string;
  order?: number;
  imageData?: string; // Base64 encoded image
}

interface BulkAddScreenshotsBody {
  screenshots: Array<{
    url?: string;
    imageData?: string;
    type?: string;
    order?: number;
  }>;
}

interface ReorderScreenshotsBody {
  updates: Array<{ id: string; order: number }>;
}

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class ScreenshotController {
  // Add screenshot to game
  async addScreenshot(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const { url, type, order, imageData } = req.body as AddScreenshotBody;

      let screenshotUrl = url;

      // If image data provided, upload to MinIO
      if (imageData) {
        const imageBuffer = Buffer.from(imageData, 'base64');
        const imagePath = `screenshots/${gameId}/${Date.now()}.png`;
        const imageStream = Readable.from(imageBuffer);

        await minioService.uploadFile(
          imageStream,
          imagePath,
          imageBuffer.length,
          'image/png'
        );

        screenshotUrl = await minioService.getFileUrl(imagePath);
      }

      if (!screenshotUrl) {
        res.status(400).json({
          status: 'error',
          message: 'Screenshot URL or image data is required',
        });
        return;
      }

      const screenshot = await screenshotService.addScreenshot(
        gameId,
        screenshotUrl,
        type,
        order
      );

      res.status(201).json({
        status: 'success',
        data: { screenshot },
      });
    } catch (error: unknown) {
      console.error('Error adding screenshot:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to add screenshot',
      });
    }
  }

  // Get all screenshots for a game
  async getScreenshots(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const { type } = req.query;

      let screenshots;
      if (type && typeof type === 'string') {
        screenshots = await screenshotService.getScreenshotsByType(gameId, type);
      } else {
        screenshots = await screenshotService.getScreenshotsByGame(gameId);
      }

      res.json({
        status: 'success',
        data: { screenshots },
      });
    } catch (error: unknown) {
      console.error('Error fetching screenshots:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch screenshots',
      });
    }
  }

  // Delete screenshot
  async deleteScreenshot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await screenshotService.deleteScreenshot(id);

      // Try to delete from MinIO (best effort)
      if (result.url.includes('screenshots/')) {
        try {
          const path = result.url.split('/').slice(-3).join('/');
          await minioService.deleteFile(path);
        } catch (err) {
          console.error('Error deleting screenshot from MinIO:', err);
        }
      }

      res.json({
        status: 'success',
        message: 'Screenshot deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting screenshot:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to delete screenshot',
      });
    }
  }

  // Bulk add screenshots
  async bulkAddScreenshots(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const { screenshots } = req.body as BulkAddScreenshotsBody;

      if (!screenshots || !Array.isArray(screenshots)) {
        res.status(400).json({
          status: 'error',
          message: 'Screenshots array is required',
        });
        return;
      }

      const processedScreenshots = await Promise.all(
        screenshots.map(async (screenshot, index) => {
          let url = screenshot.url;

          // Upload image data if provided
          if (screenshot.imageData) {
            const imageBuffer = Buffer.from(screenshot.imageData, 'base64');
            const imagePath = `screenshots/${gameId}/${Date.now()}-${index}.png`;
            const imageStream = Readable.from(imageBuffer);

            await minioService.uploadFile(
              imageStream,
              imagePath,
              imageBuffer.length,
              'image/png'
            );

            url = await minioService.getFileUrl(imagePath);
          }

          return {
            url: url!,
            type: screenshot.type,
            order: screenshot.order,
          };
        })
      );

      const result = await screenshotService.bulkAddScreenshots(
        gameId,
        processedScreenshots
      );

      res.status(201).json({
        status: 'success',
        data: { count: result.count },
      });
    } catch (error: unknown) {
      console.error('Error bulk adding screenshots:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to bulk add screenshots',
      });
    }
  }

  // Reorder screenshots
  async reorderScreenshots(req: Request, res: Response): Promise<void> {
    try {
      const { updates } = req.body as ReorderScreenshotsBody;

      if (!updates || !Array.isArray(updates)) {
        res.status(400).json({
          status: 'error',
          message: 'Updates array is required',
        });
        return;
      }

      const screenshots = await screenshotService.reorderScreenshots(updates);

      res.json({
        status: 'success',
        data: { screenshots },
      });
    } catch (error: unknown) {
      console.error('Error reordering screenshots:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to reorder screenshots',
      });
    }
  }
}

export const screenshotController = new ScreenshotController();
