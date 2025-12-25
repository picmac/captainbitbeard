import { Request, Response } from 'express';
import { AuthRequest } from './auth.controller';
import { biosService } from '../services/bios.service';

interface UpdateBiosBody {
  description?: string;
  region?: string;
  version?: string;
  required?: boolean;
  verified?: boolean;
}

interface VerifyBiosMd5Body {
  expectedMd5: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class BiosController {
  /**
   * Upload a BIOS file
   * POST /api/bios/upload
   */
  async uploadBiosFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          status: 'error',
          message: 'BIOS file is required',
        });
        return;
      }

      const { system, description, region, version, required } = req.body;

      if (!system) {
        res.status(400).json({
          status: 'error',
          message: 'System is required',
        });
        return;
      }

      const biosFile = await biosService.uploadBiosFile({
        system,
        fileName: file.originalname,
        fileBuffer: file.buffer,
        description,
        region,
        version,
        required: required === 'true',
        uploadedBy: req.user!.id,
      });

      res.status(201).json({
        status: 'success',
        data: { biosFile },
      });
    } catch (error: unknown) {
      console.error('Error uploading BIOS file:', error);
      res.status(500).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to upload BIOS file',
      });
    }
  }

  /**
   * Get all BIOS files
   * GET /api/bios
   */
  async getAllBiosFiles(_req: Request, res: Response): Promise<void> {
    try {
      const biosFiles = await biosService.getAllBiosFiles();

      res.json({
        status: 'success',
        data: { biosFiles },
      });
    } catch (error: unknown) {
      console.error('Error fetching BIOS files:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch BIOS files',
      });
    }
  }

  /**
   * Get BIOS files by system
   * GET /api/bios/system/:system
   */
  async getBiosFilesBySystem(req: Request, res: Response): Promise<void> {
    try {
      const { system } = req.params;
      const biosFiles = await biosService.getBiosFilesBySystem(system);

      res.json({
        status: 'success',
        data: { biosFiles },
      });
    } catch (error: unknown) {
      console.error('Error fetching BIOS files:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch BIOS files',
      });
    }
  }

  /**
   * Update BIOS file metadata
   * PATCH /api/bios/:id
   */
  async updateBiosFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body as UpdateBiosBody;

      const biosFile = await biosService.updateBiosFile(id, updates);

      res.json({
        status: 'success',
        data: { biosFile },
      });
    } catch (error: unknown) {
      console.error('Error updating BIOS file:', error);
      res.status(500).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to update BIOS file',
      });
    }
  }

  /**
   * Delete BIOS file
   * DELETE /api/bios/:id
   */
  async deleteBiosFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await biosService.deleteBiosFile(id);

      res.json({
        status: 'success',
        message: 'BIOS file deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting BIOS file:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to delete BIOS file',
      });
    }
  }

  /**
   * Get download URL for a BIOS file
   * GET /api/bios/:id/download
   */
  async getBiosDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const url = await biosService.getBiosDownloadUrl(id);

      res.json({
        status: 'success',
        data: { url },
      });
    } catch (error: unknown) {
      console.error('Error getting BIOS download URL:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to get download URL',
      });
    }
  }

  /**
   * Verify BIOS file MD5 hash
   * POST /api/bios/:id/verify
   */
  async verifyBiosMd5(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { expectedMd5 } = req.body as VerifyBiosMd5Body;

      if (!expectedMd5) {
        res.status(400).json({
          status: 'error',
          message: 'Expected MD5 hash is required',
        });
        return;
      }

      const isValid = await biosService.verifyBiosMd5(id, expectedMd5);

      res.json({
        status: 'success',
        data: { isValid },
      });
    } catch (error: unknown) {
      console.error('Error verifying BIOS MD5:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to verify BIOS MD5',
      });
    }
  }

  /**
   * Get systems that require BIOS files
   * GET /api/bios/systems/requiring-bios
   */
  async getSystemsRequiringBios(_req: Request, res: Response): Promise<void> {
    try {
      const systems = biosService.getSystemsRequiringBios();

      res.json({
        status: 'success',
        data: { systems },
      });
    } catch (error: unknown) {
      console.error('Error getting systems requiring BIOS:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get systems requiring BIOS',
      });
    }
  }
}

export const biosController = new BiosController();
