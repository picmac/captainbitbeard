import { Response } from 'express';
import { AuthRequest } from './auth.controller';
import { userProfileService } from '../services/userprofile.service';

interface UpdateProfileBody {
  avatarUrl?: string;
  bio?: string;
}

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class UserProfileController {
  // Get current user's profile
  async getMyProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const profile = await userProfileService.getProfile(userId);
      const stats = await userProfileService.getUserStats(userId);

      res.json({
        status: 'success',
        data: { profile, stats },
      });
    } catch (error: unknown) {
      console.error('Error fetching profile:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch profile',
      });
    }
  }

  // Update current user's profile
  async updateMyProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { avatarUrl, bio } = req.body as UpdateProfileBody;

      const profile = await userProfileService.updateProfile(userId, {
        avatarUrl,
        bio,
      });

      res.json({
        status: 'success',
        data: { profile },
      });
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to update profile',
      });
    }
  }

  // Get public profile of another user
  async getUserProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const profile = await userProfileService.getPublicProfile(userId);
      const stats = await userProfileService.getUserStats(userId);

      if (!profile) {
        res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      res.json({
        status: 'success',
        data: { profile, stats },
      });
    } catch (error: unknown) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user profile',
      });
    }
  }
}

export const userProfileController = new UserProfileController();
