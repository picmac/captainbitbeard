import { MinioService } from '../../services/minio.service';

describe('MinioService', () => {
  let minioService: MinioService;

  beforeEach(() => {
    minioService = new MinioService();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize MinIO and create bucket if not exists', async () => {
      await expect(minioService.initialize()).resolves.not.toThrow();
    });
  });

  describe('uploadRom', () => {
    it('should upload ROM file and return path', async () => {
      const fileName = 'super-mario.nes';
      const system = 'nes';
      const fileBuffer = Buffer.from('mock-rom-data');

      const result = await minioService.uploadRom(
        fileName,
        system,
        fileBuffer
      );

      expect(result).toBe(`roms/${system}/${fileName}`);
    });

    it.skip('should handle upload errors', async () => {
      const mockError = new Error('Upload failed');
      const minioClient = (minioService as any).client;
      minioClient.putObject.mockRejectedValueOnce(mockError);

      await expect(
        minioService.uploadRom('test.nes', 'nes', Buffer.from('data'))
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('uploadCover', () => {
    it('should upload cover image and return public URL', async () => {
      const gameId = 'game-123';
      const imageBuffer = Buffer.from('mock-image-data');

      const result = await minioService.uploadCover(gameId, imageBuffer);

      expect(result).toContain(`covers/${gameId}.jpg`);
    });
  });

  describe('getRomDownloadUrl', () => {
    it('should generate presigned URL for ROM', async () => {
      const romPath = 'roms/nes/super-mario.nes';

      const result = await minioService.getRomDownloadUrl(romPath);

      expect(result).toBe('https://mock-url.com/file');
    });

    it('should use custom expiration time', async () => {
      const romPath = 'roms/nes/test.nes';
      const expiresIn = 7200;

      const minioClient = (minioService as any).client;
      await minioService.getRomDownloadUrl(romPath, expiresIn);

      expect(minioClient.presignedGetObject).toHaveBeenCalledWith(
        expect.any(String),
        romPath,
        expiresIn
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file from MinIO', async () => {
      const objectName = 'roms/nes/old-game.nes';

      await expect(minioService.deleteFile(objectName)).resolves.not.toThrow();

      const minioClient = (minioService as any).client;
      expect(minioClient.removeObject).toHaveBeenCalledWith(
        expect.any(String),
        objectName
      );
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      const result = await minioService.fileExists('roms/nes/test.nes');

      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      const minioClient = (minioService as any).client;
      minioClient.statObject.mockRejectedValueOnce(new Error('Not found'));

      const result = await minioService.fileExists('roms/nes/missing.nes');

      expect(result).toBe(false);
    });
  });

  describe('getFileInfo', () => {
    it('should return file metadata', async () => {
      const result = await minioService.getFileInfo('roms/nes/test.nes');

      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('lastModified');
      expect(result).toHaveProperty('etag');
      expect(result.size).toBe(1024);
    });
  });

  describe('getPublicUrl', () => {
    it('should generate public URL', () => {
      const objectName = 'covers/game-123.jpg';

      const result = minioService.getPublicUrl(objectName);

      expect(result).toContain(objectName);
      expect(result).toMatch(/^http/);
    });
  });

  describe('listFiles', () => {
    it('should list files with given prefix', async () => {
      const files = await minioService.listFiles('roms/nes/');

      expect(files).toBeInstanceOf(Array);
      expect(files.length).toBeGreaterThan(0);
    });
  });
});
