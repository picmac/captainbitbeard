import { PrismaClient } from '@prisma/client';
import { minioService } from './minio.service';
import crypto from 'crypto';
import path from 'path';

const prisma = new PrismaClient();

export interface UploadMediaOptions {
  gameId: string;
  file: Buffer;
  fileName: string;
  mediaType: 'video' | 'music' | 'animated-cover';
}

export interface UploadScreenshotOptions {
  gameId: string;
  file: Buffer;
  fileName: string;
  category?: string;
  caption?: string;
}

export class MediaService {
  /**
   * Upload trailer video for a game
   */
  async uploadTrailerVideo(options: UploadMediaOptions): Promise<string> {
    const { gameId, file, fileName } = options;

    // Validate video file extension
    const ext = path.extname(fileName).toLowerCase();
    const allowedVideoExts = ['.mp4', '.webm', '.mkv', '.avi', '.mov'];
    if (!allowedVideoExts.includes(ext)) {
      throw new Error(`Invalid video format. Allowed: ${allowedVideoExts.join(', ')}`);
    }

    // Generate unique path
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const videoPath = `videos/trailers/${gameId}/${uniqueName}`;

    // Upload to MinIO
    await minioService.uploadFile(file, videoPath, file.length, this.getVideoMimeType(ext));

    // Get public URL
    const videoUrl = minioService.getPublicUrl(videoPath);

    // Update game record
    await prisma.game.update({
      where: { id: gameId },
      data: { videoUrl },
    });

    return videoUrl;
  }

  /**
   * Upload background music for a game
   */
  async uploadBackgroundMusic(options: UploadMediaOptions): Promise<string> {
    const { gameId, file, fileName } = options;

    // Validate audio file extension
    const ext = path.extname(fileName).toLowerCase();
    const allowedAudioExts = ['.mp3', '.ogg', '.wav', '.m4a', '.flac'];
    if (!allowedAudioExts.includes(ext)) {
      throw new Error(`Invalid audio format. Allowed: ${allowedAudioExts.join(', ')}`);
    }

    // Generate unique path
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const musicPath = `music/${gameId}/${uniqueName}`;

    // Upload to MinIO
    await minioService.uploadFile(file, musicPath, file.length, this.getAudioMimeType(ext));

    // Get public URL
    const musicUrl = minioService.getPublicUrl(musicPath);

    // Update game record
    await prisma.game.update({
      where: { id: gameId },
      data: { backgroundMusicUrl: musicUrl },
    });

    return musicUrl;
  }

  /**
   * Upload animated cover (WebP/APNG) for a game
   */
  async uploadAnimatedCover(options: UploadMediaOptions): Promise<string> {
    const { gameId, file, fileName } = options;

    // Validate image file extension
    const ext = path.extname(fileName).toLowerCase();
    const allowedImageExts = ['.webp', '.apng', '.gif'];
    if (!allowedImageExts.includes(ext)) {
      throw new Error(`Invalid animated image format. Allowed: ${allowedImageExts.join(', ')}`);
    }

    // Generate unique path
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const coverPath = `covers/animated/${gameId}/${uniqueName}`;

    // Upload to MinIO
    await minioService.uploadFile(file, coverPath, file.length, this.getImageMimeType(ext));

    // Get public URL
    const coverUrl = minioService.getPublicUrl(coverPath);

    // Update game record
    await prisma.game.update({
      where: { id: gameId },
      data: { animatedCoverUrl: coverUrl },
    });

    return coverUrl;
  }

  /**
   * Upload categorized screenshot
   */
  async uploadCategorizedScreenshot(options: UploadScreenshotOptions): Promise<any> {
    const { gameId, file, fileName, category, caption } = options;

    // Validate image file extension
    const ext = path.extname(fileName).toLowerCase();
    const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowedImageExts.includes(ext)) {
      throw new Error(`Invalid image format. Allowed: ${allowedImageExts.join(', ')}`);
    }

    // Generate unique path
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const screenshotPath = `screenshots/${gameId}/${category || 'gameplay'}/${uniqueName}`;

    // Upload to MinIO
    await minioService.uploadFile(file, screenshotPath, file.length, this.getImageMimeType(ext));

    // Get public URL
    const url = minioService.getPublicUrl(screenshotPath);

    // Get next order number
    const existingScreenshots = await prisma.screenshot.findMany({
      where: { gameId },
      orderBy: { order: 'desc' },
      take: 1,
    });
    const nextOrder = existingScreenshots.length > 0 ? existingScreenshots[0].order + 1 : 0;

    // Create screenshot record
    const screenshot = await prisma.screenshot.create({
      data: {
        gameId,
        url,
        type: category || 'gameplay',
        category: category?.toUpperCase() as any || 'GAMEPLAY',
        caption,
        order: nextOrder,
      },
    });

    return screenshot;
  }

  /**
   * Delete trailer video
   */
  async deleteTrailerVideo(gameId: string): Promise<void> {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || !game.videoUrl) {
      throw new Error('No trailer video found for this game');
    }

    // Extract path from URL
    const urlPath = this.extractMinioPath(game.videoUrl);
    if (urlPath) {
      await minioService.deleteFile(urlPath);
    }

    // Update game record
    await prisma.game.update({
      where: { id: gameId },
      data: { videoUrl: null },
    });
  }

  /**
   * Delete background music
   */
  async deleteBackgroundMusic(gameId: string): Promise<void> {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || !game.backgroundMusicUrl) {
      throw new Error('No background music found for this game');
    }

    // Extract path from URL
    const urlPath = this.extractMinioPath(game.backgroundMusicUrl);
    if (urlPath) {
      await minioService.deleteFile(urlPath);
    }

    // Update game record
    await prisma.game.update({
      where: { id: gameId },
      data: { backgroundMusicUrl: null },
    });
  }

  /**
   * Delete animated cover
   */
  async deleteAnimatedCover(gameId: string): Promise<void> {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || !game.animatedCoverUrl) {
      throw new Error('No animated cover found for this game');
    }

    // Extract path from URL
    const urlPath = this.extractMinioPath(game.animatedCoverUrl);
    if (urlPath) {
      await minioService.deleteFile(urlPath);
    }

    // Update game record
    await prisma.game.update({
      where: { id: gameId },
      data: { animatedCoverUrl: null },
    });
  }

  /**
   * Get screenshots by category
   */
  async getScreenshotsByCategory(gameId: string, category?: string): Promise<any[]> {
    const where: any = { gameId };
    if (category) {
      where.category = category.toUpperCase();
    }

    return prisma.screenshot.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
  }

  /**
   * Update screenshot category and caption
   */
  async updateScreenshot(screenshotId: string, data: { category?: string; caption?: string }): Promise<any> {
    return prisma.screenshot.update({
      where: { id: screenshotId },
      data: {
        ...(data.category && { category: data.category.toUpperCase() as any }),
        ...(data.caption !== undefined && { caption: data.caption }),
      },
    });
  }

  // Helper methods

  private getVideoMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private getAudioMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.ogg': 'audio/ogg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.flac': 'audio/flac',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private getImageMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.apng': 'image/apng',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private extractMinioPath(url: string): string | null {
    try {
      // Extract path from presigned URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Remove first two parts (bucket name and any prefix)
      return pathParts.slice(2).join('/');
    } catch {
      return null;
    }
  }
}

export const mediaService = new MediaService();
