import { Response } from 'express';
import { AuthRequest } from './auth.controller';
import { collectionShareService } from '../services/collectionshare.service';
import { CollectionVisibility, SharePermission } from '@prisma/client';

interface UpdateVisibilityBody {
  visibility: CollectionVisibility;
}

interface ShareWithUserBody {
  userId: string;
  permission: SharePermission;
}

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class CollectionShareController {
  // Update collection visibility
  async updateVisibility(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId } = req.params;
      const { visibility } = req.body as UpdateVisibilityBody;

      const collection = await collectionShareService.updateVisibility(
        collectionId,
        userId,
        visibility
      );

      res.json({
        status: 'success',
        data: { collection },
      });
    } catch (error: unknown) {
      console.error('Error updating visibility:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to update visibility',
      });
    }
  }

  // Generate share link
  async generateShareLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId } = req.params;

      const collection = await collectionShareService.generateShareLink(collectionId, userId);

      res.json({
        status: 'success',
        data: { collection, shareUrl: `/shared/${collection.shareLink}` },
      });
    } catch (error: unknown) {
      console.error('Error generating share link:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to generate share link',
      });
    }
  }

  // Remove share link
  async removeShareLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId } = req.params;

      const collection = await collectionShareService.removeShareLink(collectionId, userId);

      res.json({
        status: 'success',
        data: { collection },
      });
    } catch (error: unknown) {
      console.error('Error removing share link:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to remove share link',
      });
    }
  }

  // Share with specific user
  async shareWithUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId } = req.params;
      const { userId: targetUserId, permission } = req.body as ShareWithUserBody;

      const share = await collectionShareService.shareWithUser(
        collectionId,
        userId,
        targetUserId,
        permission
      );

      res.status(201).json({
        status: 'success',
        data: { share },
      });
    } catch (error: unknown) {
      console.error('Error sharing collection:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to share collection',
      });
    }
  }

  // Remove user access
  async removeUserAccess(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId, userId: targetUserId } = req.params;

      await collectionShareService.removeUserAccess(collectionId, userId, targetUserId);

      res.json({
        status: 'success',
        message: 'Access removed successfully',
      });
    } catch (error: unknown) {
      console.error('Error removing access:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to remove access',
      });
    }
  }

  // Get shared users
  async getSharedUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { collectionId } = req.params;

      const shares = await collectionShareService.getSharedUsers(collectionId, userId);

      res.json({
        status: 'success',
        data: { shares },
      });
    } catch (error: unknown) {
      console.error('Error fetching shared users:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to fetch shared users',
      });
    }
  }

  // Get collections shared with me
  async getSharedWithMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const collections = await collectionShareService.getSharedWithMe(userId);

      res.json({
        status: 'success',
        data: { collections },
      });
    } catch (error: unknown) {
      console.error('Error fetching shared collections:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch shared collections',
      });
    }
  }

  // Get collection by share link (public endpoint)
  async getByShareLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { shareLink } = req.params;

      const collection = await collectionShareService.getByShareLink(shareLink);

      res.json({
        status: 'success',
        data: { collection },
      });
    } catch (error: unknown) {
      console.error('Error fetching shared collection:', error);
      res.status(404).json({
        status: 'error',
        message: 'Collection not found or not accessible',
      });
    }
  }
}

export const collectionShareController = new CollectionShareController();
