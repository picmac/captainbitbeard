import request from 'supertest';
import express from 'express';
import { screenshotController } from '../../controllers/screenshot.controller';
import { screenshotService } from '../../services/screenshot.service';
import { minioService } from '../../services/minio.service';

// Mock services
jest.mock('../../services/screenshot.service');
jest.mock('../../services/minio.service');

describe('Screenshot Controller', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Setup routes
    app.post('/screenshots/:gameId', screenshotController.addScreenshot.bind(screenshotController));
    app.get('/screenshots/:gameId', screenshotController.getScreenshots.bind(screenshotController));
    app.delete('/screenshots/:id', screenshotController.deleteScreenshot.bind(screenshotController));
    app.post('/screenshots/:gameId/bulk', screenshotController.bulkAddScreenshots.bind(screenshotController));
    app.put('/screenshots/reorder', screenshotController.reorderScreenshots.bind(screenshotController));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /screenshots/:gameId', () => {
    it('should add screenshot with URL', async () => {
      const mockScreenshot = {
        id: 'screenshot-1',
        gameId: 'game-1',
        url: 'http://example.com/screenshot.png',
        type: 'gameplay',
        order: 0,
      };

      (screenshotService.addScreenshot as jest.Mock).mockResolvedValue(mockScreenshot);

      const response = await request(app)
        .post('/screenshots/game-1')
        .send({ url: 'http://example.com/screenshot.png', type: 'gameplay', order: 0 });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.screenshot).toEqual(mockScreenshot);
      expect(screenshotService.addScreenshot).toHaveBeenCalledWith(
        'game-1',
        'http://example.com/screenshot.png',
        'gameplay',
        0
      );
    });

    it('should add screenshot with base64 image data', async () => {
      const mockScreenshot = {
        id: 'screenshot-2',
        gameId: 'game-1',
        url: 'http://minio:9000/screenshots/game-1/12345.png',
        type: 'title',
        order: 1,
      };

      (minioService.uploadFile as jest.Mock).mockResolvedValue('screenshots/game-1/12345.png');
      (minioService.getFileUrl as jest.Mock).mockResolvedValue('http://minio:9000/screenshots/game-1/12345.png');
      (screenshotService.addScreenshot as jest.Mock).mockResolvedValue(mockScreenshot);

      const response = await request(app)
        .post('/screenshots/game-1')
        .send({
          imageData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          type: 'title',
          order: 1
        });

      expect(response.status).toBe(201);
      expect(minioService.uploadFile).toHaveBeenCalled();
      expect(screenshotService.addScreenshot).toHaveBeenCalled();
    });

    it('should return 400 if no URL or image data provided', async () => {
      const response = await request(app)
        .post('/screenshots/game-1')
        .send({ type: 'gameplay' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('required');
    });

    it('should return 404 if game not found', async () => {
      (screenshotService.addScreenshot as jest.Mock).mockRejectedValue(
        new Error('Game not found')
      );

      const response = await request(app)
        .post('/screenshots/invalid-game')
        .send({ url: 'http://example.com/screenshot.png' });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /screenshots/:gameId', () => {
    it('should get all screenshots for a game', async () => {
      const mockScreenshots = [
        { id: '1', gameId: 'game-1', url: 'url1', type: 'gameplay', order: 0 },
        { id: '2', gameId: 'game-1', url: 'url2', type: 'title', order: 1 },
      ];

      (screenshotService.getScreenshotsByGame as jest.Mock).mockResolvedValue(mockScreenshots);

      const response = await request(app).get('/screenshots/game-1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.screenshots).toEqual(mockScreenshots);
      expect(screenshotService.getScreenshotsByGame).toHaveBeenCalledWith('game-1');
    });

    it('should filter screenshots by type', async () => {
      const mockScreenshots = [
        { id: '1', gameId: 'game-1', url: 'url1', type: 'gameplay', order: 0 },
      ];

      (screenshotService.getScreenshotsByType as jest.Mock).mockResolvedValue(mockScreenshots);

      const response = await request(app).get('/screenshots/game-1?type=gameplay');

      expect(response.status).toBe(200);
      expect(screenshotService.getScreenshotsByType).toHaveBeenCalledWith('game-1', 'gameplay');
    });
  });

  describe('DELETE /screenshots/:id', () => {
    it('should delete screenshot', async () => {
      const mockResult = {
        id: 'screenshot-1',
        url: 'http://minio:9000/bucket/screenshots/game-1/screenshot.png',
      };

      (screenshotService.deleteScreenshot as jest.Mock).mockResolvedValue(mockResult);
      (minioService.deleteFile as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete('/screenshots/screenshot-1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(screenshotService.deleteScreenshot).toHaveBeenCalledWith('screenshot-1');
    });

    it('should return 404 if screenshot not found', async () => {
      (screenshotService.deleteScreenshot as jest.Mock).mockRejectedValue(
        new Error('Screenshot not found')
      );

      const response = await request(app).delete('/screenshots/invalid-id');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /screenshots/:gameId/bulk', () => {
    it('should bulk add screenshots', async () => {
      (screenshotService.bulkAddScreenshots as jest.Mock).mockResolvedValue({ count: 3 });

      const response = await request(app)
        .post('/screenshots/game-1/bulk')
        .send({
          screenshots: [
            { url: 'url1', type: 'gameplay', order: 0 },
            { url: 'url2', type: 'title', order: 1 },
            { url: 'url3', type: 'menu', order: 2 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.count).toBe(3);
    });

    it('should return 400 if screenshots array is missing', async () => {
      const response = await request(app)
        .post('/screenshots/game-1/bulk')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });
  });

  describe('PUT /screenshots/reorder', () => {
    it('should reorder screenshots', async () => {
      const mockScreenshots = [
        { id: '1', order: 2 },
        { id: '2', order: 1 },
      ];

      (screenshotService.reorderScreenshots as jest.Mock).mockResolvedValue(mockScreenshots);

      const response = await request(app)
        .put('/screenshots/reorder')
        .send({
          updates: [
            { id: '1', order: 2 },
            { id: '2', order: 1 },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.screenshots).toEqual(mockScreenshots);
    });

    it('should return 400 if updates array is missing', async () => {
      const response = await request(app)
        .put('/screenshots/reorder')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });
  });
});
