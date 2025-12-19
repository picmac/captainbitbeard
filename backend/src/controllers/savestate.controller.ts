import { Response } from 'express';
import { AuthRequest } from './auth.controller';
import { saveStateService } from '../services/savestate.service';
import { minioService } from '../services/minio.service';
import { Readable } from 'stream';

interface CreateSaveStateBody {
  slot: number;
  stateData: string; // Base64 encoded save state data
  screenshot?: string; // Base64 encoded screenshot
  description?: string;
}

interface UpdateSaveStateBody {
  description?: string;
}

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class SaveStateController {
  // Create or update save state
  async createSaveState(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { gameId } = req.params;
      const { slot, stateData, screenshot, description } = req.body as CreateSaveStateBody;

      if (!stateData || !slot) {
        res.status(400).json({
          status: 'error',
          message: 'Save state data and slot are required',
        });
        return;
      }

      // Validate slot number (1-10)
      if (slot < 1 || slot > 10) {
        res.status(400).json({
          status: 'error',
          message: 'Slot must be between 1 and 10',
        });
        return;
      }

      // Convert base64 to buffer
      const stateBuffer = Buffer.from(stateData, 'base64');

      // Upload state file to MinIO
      const statePath = `save-states/${userId}/${gameId}/slot-${slot}.state`;
      const stateStream = Readable.from(stateBuffer);

      await minioService.uploadFile(
        stateStream,
        statePath,
        stateBuffer.length,
        'application/octet-stream'
      );

      // Upload screenshot if provided
      let screenshotUrl: string | undefined;
      if (screenshot) {
        const screenshotBuffer = Buffer.from(screenshot, 'base64');
        const screenshotPath = `save-states/${userId}/${gameId}/slot-${slot}.png`;
        const screenshotStream = Readable.from(screenshotBuffer);

        await minioService.uploadFile(
          screenshotStream,
          screenshotPath,
          screenshotBuffer.length,
          'image/png'
        );

        screenshotUrl = await minioService.getFileUrl(screenshotPath);
      }

      // Create or update save state in database
      const saveState = await saveStateService.createOrUpdateSaveState(
        userId,
        gameId,
        slot,
        statePath,
        screenshotUrl,
        description
      );

      res.status(201).json({
        status: 'success',
        data: { saveState },
      });
    } catch (error: unknown) {
      console.error('Error creating save state:', error);
      res.status(500).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to create save state',
      });
    }
  }

  // Get all save states for a game
  async getSaveStatesByGame(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { gameId } = req.params;

      const saveStates = await saveStateService.getSaveStatesByGame(gameId, userId);

      res.json({
        status: 'success',
        data: { saveStates },
      });
    } catch (error: unknown) {
      console.error('Error fetching save states:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch save states',
      });
    }
  }

  // Get all save states for current user
  async getMySaveStates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const saveStates = await saveStateService.getSaveStatesByUser(userId);

      res.json({
        status: 'success',
        data: { saveStates },
      });
    } catch (error: unknown) {
      console.error('Error fetching save states:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch save states',
      });
    }
  }

  // Get specific save state by ID
  async getSaveStateById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const saveState = await saveStateService.getSaveStateById(id, userId);

      res.json({
        status: 'success',
        data: { saveState },
      });
    } catch (error: unknown) {
      console.error('Error fetching save state:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to fetch save state',
      });
    }
  }

  // Load save state data (download file)
  async loadSaveState(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const saveState = await saveStateService.getSaveStateById(id, userId);

      // Get file from MinIO
      const fileStream = await minioService.getFile(saveState.statePath);

      // Stream the file to response
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="save-state-slot-${saveState.slot}.state"`);

      fileStream.pipe(res);
    } catch (error: unknown) {
      console.error('Error loading save state:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to load save state',
      });
    }
  }

  // Update save state
  async updateSaveState(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { description } = req.body as UpdateSaveStateBody;

      const saveState = await saveStateService.updateSaveState(id, userId, description);

      res.json({
        status: 'success',
        data: { saveState },
      });
    } catch (error: unknown) {
      console.error('Error updating save state:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to update save state',
      });
    }
  }

  // Delete save state
  async deleteSaveState(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await saveStateService.deleteSaveState(id, userId);

      // Delete file from MinIO
      try {
        await minioService.deleteFile(result.statePath);
      } catch (error) {
        console.error('Error deleting save state file from MinIO:', error);
        // Continue even if file deletion fails
      }

      res.json({
        status: 'success',
        message: 'Save state deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting save state:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to delete save state',
      });
    }
  }
}

export const saveStateController = new SaveStateController();
