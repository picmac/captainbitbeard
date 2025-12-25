import { Request, Response } from 'express';
import { mediaService } from '../services/media.service';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class MediaController {
  /**
   * Upload trailer video
   * POST /api/games/:gameId/media/trailer
   */
  async uploadTrailer(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const videoUrl = await mediaService.uploadTrailerVideo({
        gameId,
        file: file.buffer,
        fileName: file.originalname,
        mediaType: 'video',
      });

      res.json({
        message: 'Trailer uploaded successfully',
        videoUrl,
      });
    } catch (error: unknown) {
      console.error('Upload trailer error:', error);
      res.status(500).json({ message: getErrorMessage(error) || 'Failed to upload trailer' });
    }
  }

  /**
   * Upload background music
   * POST /api/games/:gameId/media/music
   */
  async uploadBackgroundMusic(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const musicUrl = await mediaService.uploadBackgroundMusic({
        gameId,
        file: file.buffer,
        fileName: file.originalname,
        mediaType: 'music',
      });

      res.json({
        message: 'Background music uploaded successfully',
        musicUrl,
      });
    } catch (error: unknown) {
      console.error('Upload background music error:', error);
      res.status(500).json({ message: getErrorMessage(error) || 'Failed to upload background music' });
    }
  }

  /**
   * Upload animated cover
   * POST /api/games/:gameId/media/animated-cover
   */
  async uploadAnimatedCover(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const coverUrl = await mediaService.uploadAnimatedCover({
        gameId,
        file: file.buffer,
        fileName: file.originalname,
        mediaType: 'animated-cover',
      });

      res.json({
        message: 'Animated cover uploaded successfully',
        coverUrl,
      });
    } catch (error: unknown) {
      console.error('Upload animated cover error:', error);
      res.status(500).json({ message: getErrorMessage(error) || 'Failed to upload animated cover' });
    }
  }

  /**
   * Upload categorized screenshot
   * POST /api/games/:gameId/media/screenshot
   */
  async uploadCategorizedScreenshot(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const body = req.body as { category?: string; caption?: string };
      const { category, caption } = body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const screenshot = await mediaService.uploadCategorizedScreenshot({
        gameId,
        file: file.buffer,
        fileName: file.originalname,
        category,
        caption,
      });

      res.json({
        message: 'Screenshot uploaded successfully',
        screenshot,
      });
    } catch (error: unknown) {
      console.error('Upload screenshot error:', error);
      res.status(500).json({ message: getErrorMessage(error) || 'Failed to upload screenshot' });
    }
  }

  /**
   * Delete trailer video
   * DELETE /api/games/:gameId/media/trailer
   */
  async deleteTrailer(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;

      await mediaService.deleteTrailerVideo(gameId);

      res.json({ message: 'Trailer deleted successfully' });
    } catch (error: unknown) {
      console.error('Delete trailer error:', error);
      res.status(500).json({ message: getErrorMessage(error) || 'Failed to delete trailer' });
    }
  }

  /**
   * Delete background music
   * DELETE /api/games/:gameId/media/music
   */
  async deleteBackgroundMusic(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;

      await mediaService.deleteBackgroundMusic(gameId);

      res.json({ message: 'Background music deleted successfully' });
    } catch (error: unknown) {
      console.error('Delete background music error:', error);
      res.status(500).json({ message: getErrorMessage(error) || 'Failed to delete background music' });
    }
  }

  /**
   * Delete animated cover
   * DELETE /api/games/:gameId/media/animated-cover
   */
  async deleteAnimatedCover(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;

      await mediaService.deleteAnimatedCover(gameId);

      res.json({ message: 'Animated cover deleted successfully' });
    } catch (error: unknown) {
      console.error('Delete animated cover error:', error);
      res.status(500).json({ message: getErrorMessage(error) || 'Failed to delete animated cover' });
    }
  }

  /**
   * Get screenshots by category
   * GET /api/games/:gameId/media/screenshots?category=GAMEPLAY
   */
  async getScreenshotsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const { category } = req.query;

      const screenshots = await mediaService.getScreenshotsByCategory(
        gameId,
        category as string | undefined
      );

      res.json({ screenshots });
    } catch (error: unknown) {
      console.error('Get screenshots error:', error);
      res.status(500).json({ message: getErrorMessage(error) || 'Failed to get screenshots' });
    }
  }

  /**
   * Update screenshot metadata
   * PATCH /api/screenshots/:screenshotId
   */
  async updateScreenshot(req: Request, res: Response): Promise<void> {
    try {
      const { screenshotId } = req.params;
      const body = req.body as { category?: string; caption?: string };
      const { category, caption } = body;

      const screenshot = await mediaService.updateScreenshot(screenshotId, {
        category,
        caption,
      });

      res.json({
        message: 'Screenshot updated successfully',
        screenshot,
      });
    } catch (error: unknown) {
      console.error('Update screenshot error:', error);
      res.status(500).json({ message: getErrorMessage(error) || 'Failed to update screenshot' });
    }
  }
}

export const mediaController = new MediaController();
export const mediaUpload = upload;
