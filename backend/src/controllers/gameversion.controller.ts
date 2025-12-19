import { Request, Response } from 'express';
import { AuthRequest } from './auth.controller';
import { gameVersionService } from '../services/gameversion.service';
import { GameRegion } from '@prisma/client';

interface CreateGameVersionBody {
  versionName: string;
  region: GameRegion;
  revision?: string;
  releaseDate?: string;
  changes?: string;
  isPreferred?: boolean;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class GameVersionController {
  /**
   * Create a new game version
   * POST /api/game-versions/:gameId
   */
  async createGameVersion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          status: 'error',
          message: 'ROM file is required',
        });
        return;
      }

      const body = req.body as CreateGameVersionBody;

      if (!body.versionName || !body.region) {
        res.status(400).json({
          status: 'error',
          message: 'Version name and region are required',
        });
        return;
      }

      const version = await gameVersionService.createGameVersion({
        gameId,
        versionName: body.versionName,
        region: body.region,
        revision: body.revision,
        romBuffer: file.buffer,
        romFileName: file.originalname,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
        changes: body.changes,
        isPreferred: body.isPreferred,
      });

      res.status(201).json({
        status: 'success',
        data: { version },
      });
    } catch (error: unknown) {
      console.error('Error creating game version:', error);
      res.status(500).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to create game version',
      });
    }
  }

  /**
   * Get all versions for a game
   * GET /api/game-versions/:gameId
   */
  async getGameVersions(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const versions = await gameVersionService.getGameVersions(gameId);

      res.json({
        status: 'success',
        data: { versions },
      });
    } catch (error: unknown) {
      console.error('Error fetching game versions:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch game versions',
      });
    }
  }

  /**
   * Set preferred version
   * PATCH /api/game-versions/:gameId/:versionId/preferred
   */
  async setPreferredVersion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gameId, versionId } = req.params;
      const version = await gameVersionService.setPreferredVersion(gameId, versionId);

      res.json({
        status: 'success',
        data: { version },
      });
    } catch (error: unknown) {
      console.error('Error setting preferred version:', error);
      res.status(500).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to set preferred version',
      });
    }
  }

  /**
   * Delete a game version
   * DELETE /api/game-versions/:gameId/:versionId
   */
  async deleteGameVersion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { versionId } = req.params;
      await gameVersionService.deleteGameVersion(versionId);

      res.json({
        status: 'success',
        message: 'Game version deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting game version:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to delete game version',
      });
    }
  }

  /**
   * Get download URL for a version's ROM
   * GET /api/game-versions/:gameId/:versionId/download
   */
  async getVersionDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { versionId } = req.params;
      const url = await gameVersionService.getVersionDownloadUrl(versionId);

      res.json({
        status: 'success',
        data: { url },
      });
    } catch (error: unknown) {
      console.error('Error getting version download URL:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to get download URL',
      });
    }
  }
}

export const gameVersionController = new GameVersionController();
