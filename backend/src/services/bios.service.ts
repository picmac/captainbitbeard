import { PrismaClient, BiosFile } from '@prisma/client';
import { minioService } from './minio.service';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface CreateBiosFileData {
  system: string;
  fileName: string;
  fileBuffer: Buffer;
  description?: string;
  region?: string;
  version?: string;
  required?: boolean;
  uploadedBy?: string;
}

interface UpdateBiosFileData {
  description?: string;
  region?: string;
  version?: string;
  required?: boolean;
  verified?: boolean;
}

export class BiosService {
  /**
   * Upload a BIOS file
   */
  async uploadBiosFile(data: CreateBiosFileData): Promise<BiosFile> {
    // Calculate MD5 hash
    const md5Hash = crypto.createHash('md5').update(data.fileBuffer).digest('hex');

    // Check if BIOS with same system and filename already exists
    const existing = await prisma.biosFile.findFirst({
      where: {
        system: data.system.toLowerCase(),
        fileName: data.fileName,
      },
    });

    if (existing) {
      throw new Error(`BIOS file ${data.fileName} already exists for system ${data.system}`);
    }

    // Upload to MinIO
    const filePath = await minioService.uploadBios(
      data.system.toLowerCase(),
      data.fileName,
      data.fileBuffer
    );

    return prisma.biosFile.create({
      data: {
        system: data.system.toLowerCase(),
        fileName: data.fileName,
        filePath,
        md5Hash,
        fileSize: BigInt(data.fileBuffer.length),
        description: data.description,
        region: data.region,
        version: data.version,
        required: data.required !== undefined ? data.required : true,
        verified: false,
        uploadedBy: data.uploadedBy,
      },
    });
  }

  /**
   * Get all BIOS files
   */
  async getAllBiosFiles(): Promise<BiosFile[]> {
    return prisma.biosFile.findMany({
      orderBy: [{ system: 'asc' }, { fileName: 'asc' }],
    });
  }

  /**
   * Get BIOS files by system
   */
  async getBiosFilesBySystem(system: string): Promise<BiosFile[]> {
    return prisma.biosFile.findMany({
      where: { system: system.toLowerCase() },
      orderBy: { fileName: 'asc' },
    });
  }

  /**
   * Get BIOS file by ID
   */
  async getBiosFileById(id: string): Promise<BiosFile | null> {
    return prisma.biosFile.findUnique({
      where: { id },
    });
  }

  /**
   * Update BIOS file metadata
   */
  async updateBiosFile(id: string, data: UpdateBiosFileData): Promise<BiosFile> {
    return prisma.biosFile.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete BIOS file
   */
  async deleteBiosFile(id: string): Promise<void> {
    const biosFile = await this.getBiosFileById(id);
    if (!biosFile) {
      throw new Error('BIOS file not found');
    }

    // Delete from MinIO
    try {
      await minioService.deleteFile(biosFile.filePath);
    } catch (error) {
      console.error('Error deleting BIOS from MinIO:', error);
    }

    // Delete from database
    await prisma.biosFile.delete({
      where: { id },
    });
  }

  /**
   * Get download URL for a BIOS file
   */
  async getBiosDownloadUrl(id: string): Promise<string> {
    const biosFile = await this.getBiosFileById(id);
    if (!biosFile) {
      throw new Error('BIOS file not found');
    }

    // Generate presigned URL (valid for 1 hour)
    // Use backend streaming endpoint instead
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${backendUrl}/api/bios/${id}/download`;
  }

  /**
   * Verify BIOS file MD5 hash
   */
  async verifyBiosMd5(id: string, expectedMd5: string): Promise<boolean> {
    const biosFile = await this.getBiosFileById(id);
    if (!biosFile) {
      throw new Error('BIOS file not found');
    }

    const isValid = biosFile.md5Hash.toLowerCase() === expectedMd5.toLowerCase();

    // Update verified status
    await prisma.biosFile.update({
      where: { id },
      data: { verified: isValid },
    });

    return isValid;
  }

  /**
   * Get systems that need BIOS files
   */
  getSystemsRequiringBios(): string[] {
    return [
      'psx',     // PlayStation 1
      'ps2',     // PlayStation 2
      'psp',     // PlayStation Portable
      'saturn',  // Sega Saturn
      'dreamcast', // Sega Dreamcast
      'cd32',    // Amiga CD32
      'cdtv',    // Commodore CDTV
      'fds',     // Famicom Disk System
      'segacd',  // Sega CD
    ];
  }

  /**
   * Check if a system requires BIOS files
   */
  systemRequiresBios(system: string): boolean {
    return this.getSystemsRequiringBios().includes(system.toLowerCase());
  }
}

export const biosService = new BiosService();
