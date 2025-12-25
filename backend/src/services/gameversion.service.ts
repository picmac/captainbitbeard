import { PrismaClient, GameVersion, GameRegion } from '@prisma/client';
import { minioService } from './minio.service';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface CreateGameVersionData {
  gameId: string;
  versionName: string;
  region: GameRegion;
  revision?: string;
  romBuffer: Buffer;
  romFileName: string;
  releaseDate?: Date;
  changes?: string;
  isPreferred?: boolean;
}

export class GameVersionService {
  /**
   * Create a new game version
   */
  async createGameVersion(data: CreateGameVersionData): Promise<GameVersion> {
    // Calculate MD5 hash
    const md5Hash = crypto.createHash('md5').update(data.romBuffer).digest('hex');

    // Upload ROM to MinIO
    const romPath = `roms/versions/${data.gameId}/${data.versionName}-${Date.now()}.rom`;
    await minioService.uploadFile(data.romBuffer, romPath, data.romBuffer.length, 'application/octet-stream');

    // If this is marked as preferred, unset other preferred versions
    if (data.isPreferred) {
      await prisma.gameVersion.updateMany({
        where: {
          gameId: data.gameId,
          isPreferred: true,
        },
        data: {
          isPreferred: false,
        },
      });
    }

    return prisma.gameVersion.create({
      data: {
        gameId: data.gameId,
        versionName: data.versionName,
        region: data.region,
        revision: data.revision,
        romPath,
        md5Hash,
        fileSize: BigInt(data.romBuffer.length),
        releaseDate: data.releaseDate,
        changes: data.changes,
        isPreferred: data.isPreferred || false,
      },
    });
  }

  /**
   * Get all versions for a game
   */
  async getGameVersions(gameId: string): Promise<GameVersion[]> {
    return prisma.gameVersion.findMany({
      where: { gameId },
      orderBy: [{ isPreferred: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get version by ID
   */
  async getVersionById(id: string): Promise<GameVersion | null> {
    return prisma.gameVersion.findUnique({
      where: { id },
      include: {
        game: true,
      },
    });
  }

  /**
   * Set preferred version
   */
  async setPreferredVersion(gameId: string, versionId: string): Promise<GameVersion> {
    // Unset all preferred versions for this game
    await prisma.gameVersion.updateMany({
      where: { gameId },
      data: { isPreferred: false },
    });

    // Set this version as preferred
    return prisma.gameVersion.update({
      where: { id: versionId },
      data: { isPreferred: true },
    });
  }

  /**
   * Delete a game version
   */
  async deleteGameVersion(id: string): Promise<void> {
    const version = await this.getVersionById(id);
    if (!version) {
      throw new Error('Version not found');
    }

    // Delete ROM from MinIO
    try {
      await minioService.deleteFile(version.romPath);
    } catch (error) {
      console.error('Error deleting ROM from MinIO:', error);
    }

    // Delete from database
    await prisma.gameVersion.delete({
      where: { id },
    });
  }

  /**
   * Get download URL for a version's ROM
   */
  async getVersionDownloadUrl(id: string): Promise<string> {
    const version = await this.getVersionById(id);
    if (!version) {
      throw new Error('Version not found');
    }

    // Generate presigned URL (valid for 1 hour)
    // Use backend streaming endpoint instead
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${backendUrl}/api/game-versions/${id}/download`;
  }
}

export const gameVersionService = new GameVersionService();
