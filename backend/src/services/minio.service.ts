import { Client } from 'minio';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Readable } from 'stream';

export class MinioService {
  private client: Client;
  private bucket: string;

  constructor() {
    this.client = new Client({
      endPoint: config.minio.endpoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
    this.bucket = config.minio.bucket;
  }

  /**
   * Initialize MinIO connection and ensure bucket exists
   */
  async initialize(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
        logger.info(`MinIO bucket created: ${this.bucket}`);
      }

      // Set bucket policy for public read on covers/screenshots
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [
              `arn:aws:s3:::${this.bucket}/covers/*`,
              `arn:aws:s3:::${this.bucket}/screenshots/*`,
            ],
          },
        ],
      };

      await this.client.setBucketPolicy(this.bucket, JSON.stringify(policy));
      logger.info('MinIO initialized successfully');
    } catch (error) {
      logger.error({ err: error }, 'Failed to initialize MinIO');
      throw error;
    }
  }

  /**
   * Upload ROM file
   */
  async uploadRom(
    fileName: string,
    system: string,
    fileBuffer: Buffer,
    contentType: string = 'application/octet-stream'
  ): Promise<string> {
    const objectName = `roms/${system}/${fileName}`;

    try {
      await this.client.putObject(
        this.bucket,
        objectName,
        fileBuffer,
        fileBuffer.length,
        {
          'Content-Type': contentType,
        }
      );

      logger.info(`ROM uploaded: ${objectName}`);
      return objectName;
    } catch (error) {
      logger.error({ err: error }, `Failed to upload ROM: ${fileName}`);
      throw error;
    }
  }

  /**
   * Upload cover image
   */
  async uploadCover(
    gameId: string,
    imageBuffer: Buffer,
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    const objectName = `covers/${gameId}.jpg`;

    try {
      await this.client.putObject(
        this.bucket,
        objectName,
        imageBuffer,
        imageBuffer.length,
        {
          'Content-Type': contentType,
        }
      );

      logger.info(`Cover uploaded: ${objectName}`);
      return this.getPublicUrl(objectName);
    } catch (error) {
      logger.error({ err: error }, `Failed to upload cover for game: ${gameId}`);
      throw error;
    }
  }

  /**
   * Upload screenshot
   */
  async uploadScreenshot(
    gameId: string,
    index: number,
    imageBuffer: Buffer,
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    const objectName = `screenshots/${gameId}/${index}.jpg`;

    try {
      await this.client.putObject(
        this.bucket,
        objectName,
        imageBuffer,
        imageBuffer.length,
        {
          'Content-Type': contentType,
        }
      );

      logger.info(`Screenshot uploaded: ${objectName}`);
      return this.getPublicUrl(objectName);
    } catch (error) {
      logger.error({ err: error }, `Failed to upload screenshot: ${gameId}/${index}`);
      throw error;
    }
  }

  /**
   * Upload BIOS file
   */
  async uploadBios(
    system: string,
    fileName: string,
    fileBuffer: Buffer
  ): Promise<string> {
    const objectName = `bios/${system}/${fileName}`;

    try {
      await this.client.putObject(
        this.bucket,
        objectName,
        fileBuffer,
        fileBuffer.length,
        {
          'Content-Type': 'application/octet-stream',
        }
      );

      logger.info(`BIOS uploaded: ${objectName}`);
      return objectName;
    } catch (error) {
      logger.error({ err: error }, `Failed to upload BIOS: ${fileName}`);
      throw error;
    }
  }

  /**
   * Upload save state
   */
  async uploadSaveState(
    userId: string,
    gameId: string,
    slot: number,
    stateBuffer: Buffer
  ): Promise<string> {
    const objectName = `saves/${userId}/${gameId}/slot${slot}.state`;

    try {
      await this.client.putObject(
        this.bucket,
        objectName,
        stateBuffer,
        stateBuffer.length,
        {
          'Content-Type': 'application/octet-stream',
        }
      );

      logger.info(`Save state uploaded: ${objectName}`);
      return objectName;
    } catch (error) {
      logger.error({ err: error }, `Failed to upload save state: ${userId}/${gameId}`);
      throw error;
    }
  }

  /**
   * Get presigned URL for ROM download (for EmulatorJS)
   */
  async getRomDownloadUrl(romPath: string, expiresIn: number = 3600): Promise<string> {
    try {
      let url = await this.client.presignedGetObject(
        this.bucket,
        romPath,
        expiresIn
      );

      // Replace internal Docker hostname with external host for browser access
      const serverHost = process.env.SERVER_HOST || 'localhost';
      const minioPort = config.minio.port;
      url = url.replace(`http://${config.minio.endpoint}:${minioPort}`, `http://${serverHost}:${minioPort}`);

      return url;
    } catch (error) {
      logger.error({ err: error }, `Failed to get presigned URL for: ${romPath}`);
      throw error;
    }
  }

  /**
   * Stream ROM file (alternative to presigned URL)
   */
  async streamRom(romPath: string): Promise<Readable> {
    try {
      const stream = await this.client.getObject(this.bucket, romPath);
      return stream;
    } catch (error) {
      logger.error({ err: error }, `Failed to stream ROM: ${romPath}`);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, objectName);
      logger.info(`File deleted: ${objectName}`);
    } catch (error) {
      logger.error({ err: error }, `Failed to delete file: ${objectName}`);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, objectName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(objectName: string): Promise<{
    size: number;
    lastModified: Date;
    etag: string;
  }> {
    try {
      const stat = await this.client.statObject(this.bucket, objectName);
      return {
        size: stat.size,
        lastModified: stat.lastModified,
        etag: stat.etag,
      };
    } catch (error) {
      logger.error({ err: error }, `Failed to get file info: ${objectName}`);
      throw error;
    }
  }

  /**
   * Get public URL for publicly accessible files (covers, screenshots)
   */
  getPublicUrl(objectName: string): string {
    const protocol = config.minio.useSSL ? 'https' : 'http';
    const serverHost = process.env.SERVER_HOST || 'localhost';
    return `${protocol}://${serverHost}:${config.minio.port}/${this.bucket}/${objectName}`;
  }

  /**
   * List files in a directory
   */
  async listFiles(prefix: string): Promise<string[]> {
    const files: string[] = [];

    return new Promise((resolve, reject) => {
      const stream = this.client.listObjects(this.bucket, prefix, true);

      stream.on('data', (obj) => {
        if (obj.name) {
          files.push(obj.name);
        }
      });

      stream.on('error', (err) => {
        logger.error({ err }, `Failed to list files with prefix: ${prefix}`);
        reject(err);
      });

      stream.on('end', () => {
        resolve(files);
      });
    });
  }
}

// Singleton instance
export const minioService = new MinioService();
