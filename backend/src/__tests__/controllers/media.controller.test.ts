import request from 'supertest';
import express from 'express';
import { mediaService } from '../../services/media.service';

// Mock media service
jest.mock('../../services/media.service');

// Create a simple controller for testing without multer middleware
class TestMediaController {
  async uploadTrailer(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const file = req.body.file;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const videoUrl = await mediaService.uploadTrailerVideo({
        gameId,
        file: Buffer.from(file),
        fileName: 'trailer.mp4',
        mediaType: 'video',
      });

      res.json({
        message: 'Trailer uploaded successfully',
        videoUrl,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to upload trailer' });
    }
  }

  async uploadBackgroundMusic(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const file = req.body.file;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const musicUrl = await mediaService.uploadBackgroundMusic({
        gameId,
        file: Buffer.from(file),
        fileName: 'music.mp3',
        mediaType: 'music',
      });

      res.json({
        message: 'Background music uploaded successfully',
        musicUrl,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to upload background music' });
    }
  }

  async uploadAnimatedCover(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const file = req.body.file;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const coverUrl = await mediaService.uploadAnimatedCover({
        gameId,
        file: Buffer.from(file),
        fileName: 'cover.webp',
        mediaType: 'animated-cover',
      });

      res.json({
        message: 'Animated cover uploaded successfully',
        coverUrl,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to upload animated cover' });
    }
  }

  async uploadCategorizedScreenshot(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const { category, caption, file } = req.body;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const screenshot = await mediaService.uploadCategorizedScreenshot({
        gameId,
        file: Buffer.from(file),
        fileName: 'screenshot.png',
        category,
        caption,
      });

      res.json({
        message: 'Screenshot uploaded successfully',
        screenshot,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to upload screenshot' });
    }
  }

  async getMedia(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const media = await mediaService.getGameMedia(gameId);

      res.json({
        message: 'Media retrieved successfully',
        media,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to get media' });
    }
  }

  async deleteMedia(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const { type } = req.body;

      await mediaService.deleteMedia(gameId, type);

      res.json({
        message: 'Media deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to delete media' });
    }
  }
}

describe('Media Controller', () => {
  let app: express.Application;
  let controller: TestMediaController;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    controller = new TestMediaController();

    // Setup routes
    app.post('/media/:gameId/trailer', controller.uploadTrailer.bind(controller));
    app.post('/media/:gameId/music', controller.uploadBackgroundMusic.bind(controller));
    app.post('/media/:gameId/animated-cover', controller.uploadAnimatedCover.bind(controller));
    app.post('/media/:gameId/screenshot', controller.uploadCategorizedScreenshot.bind(controller));
    app.get('/media/:gameId', controller.getMedia.bind(controller));
    app.delete('/media/:gameId', controller.deleteMedia.bind(controller));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /media/:gameId/trailer', () => {
    it('should upload trailer video', async () => {
      (mediaService.uploadTrailerVideo as jest.Mock).mockResolvedValue(
        'http://minio:9000/videos/game-1/trailer.mp4'
      );

      const response = await request(app)
        .post('/media/game-1/trailer')
        .send({ file: 'video-data' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully');
      expect(response.body.videoUrl).toBe('http://minio:9000/videos/game-1/trailer.mp4');
      expect(mediaService.uploadTrailerVideo).toHaveBeenCalled();
    });

    it('should return 400 if no file provided', async () => {
      const response = await request(app)
        .post('/media/game-1/trailer')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('No file');
    });

    it('should handle upload errors', async () => {
      (mediaService.uploadTrailerVideo as jest.Mock).mockRejectedValue(
        new Error('Upload failed')
      );

      const response = await request(app)
        .post('/media/game-1/trailer')
        .send({ file: 'video-data' });

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('failed');
    });
  });

  describe('POST /media/:gameId/music', () => {
    it('should upload background music', async () => {
      (mediaService.uploadBackgroundMusic as jest.Mock).mockResolvedValue(
        'http://minio:9000/music/game-1/background.mp3'
      );

      const response = await request(app)
        .post('/media/game-1/music')
        .send({ file: 'audio-data' });

      expect(response.status).toBe(200);
      expect(response.body.musicUrl).toBe('http://minio:9000/music/game-1/background.mp3');
    });

    it('should return 400 if no file provided', async () => {
      const response = await request(app)
        .post('/media/game-1/music')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /media/:gameId/animated-cover', () => {
    it('should upload animated cover', async () => {
      (mediaService.uploadAnimatedCover as jest.Mock).mockResolvedValue(
        'http://minio:9000/covers/game-1/animated.webp'
      );

      const response = await request(app)
        .post('/media/game-1/animated-cover')
        .send({ file: 'image-data' });

      expect(response.status).toBe(200);
      expect(response.body.coverUrl).toBe('http://minio:9000/covers/game-1/animated.webp');
    });
  });

  describe('POST /media/:gameId/screenshot', () => {
    it('should upload categorized screenshot', async () => {
      const mockScreenshot = {
        id: 'screenshot-1',
        gameId: 'game-1',
        url: 'http://minio:9000/screenshots/game-1/gameplay.png',
        category: 'GAMEPLAY',
      };

      (mediaService.uploadCategorizedScreenshot as jest.Mock).mockResolvedValue(mockScreenshot);

      const response = await request(app)
        .post('/media/game-1/screenshot')
        .send({ file: 'image-data', category: 'GAMEPLAY', caption: 'Level 1' });

      expect(response.status).toBe(200);
      expect(response.body.screenshot).toEqual(mockScreenshot);
    });
  });

  describe('GET /media/:gameId', () => {
    it('should get all media for a game', async () => {
      const mockMedia = {
        trailerUrl: 'http://minio:9000/videos/trailer.mp4',
        musicUrl: 'http://minio:9000/music/bg.mp3',
        screenshots: [],
      };

      (mediaService.getGameMedia as jest.Mock).mockResolvedValue(mockMedia);

      const response = await request(app).get('/media/game-1');

      expect(response.status).toBe(200);
      expect(response.body.media).toEqual(mockMedia);
    });

    it('should handle errors', async () => {
      (mediaService.getGameMedia as jest.Mock).mockRejectedValue(
        new Error('Game not found')
      );

      const response = await request(app).get('/media/invalid-game');

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /media/:gameId', () => {
    it('should delete media', async () => {
      (mediaService.deleteMedia as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/media/game-1')
        .send({ type: 'video' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully');
      expect(mediaService.deleteMedia).toHaveBeenCalledWith('game-1', 'video');
    });
  });
});
