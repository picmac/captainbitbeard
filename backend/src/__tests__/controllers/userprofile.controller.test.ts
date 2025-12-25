import { Response } from 'express';
import { AuthRequest } from '../../controllers/auth.controller';
import { userProfileController } from '../../controllers/userprofile.controller';
import { userProfileService } from '../../services/userprofile.service';

// Mock userprofile service
jest.mock('../../services/userprofile.service');

// Helper to create mock request and response
function createMockReqRes() {
  const req = {
    user: { id: 'user-123', username: 'testuser', role: 'USER' },
    params: {},
    body: {},
  } as unknown as AuthRequest;

  const res = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return { req, res };
}

describe('UserProfile Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should get current user profile and stats', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-123',
        avatarUrl: 'http://example.com/avatar.png',
        bio: 'Test bio',
      };

      const mockStats = {
        gamesPlayed: 10,
        totalPlayTime: 3600,
        favoriteCount: 5,
      };

      (userProfileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);
      (userProfileService.getUserStats as jest.Mock).mockResolvedValue(mockStats);

      const { req, res } = createMockReqRes();

      await userProfileController.getMyProfile(req, res);

      expect(userProfileService.getProfile).toHaveBeenCalledWith('user-123');
      expect(userProfileService.getUserStats).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { profile: mockProfile, stats: mockStats },
      });
    });

    it('should handle errors', async () => {
      (userProfileService.getProfile as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { req, res } = createMockReqRes();

      await userProfileController.getMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to fetch profile',
      });
    });
  });

  describe('updateMyProfile', () => {
    it('should update user profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-123',
        avatarUrl: 'http://example.com/new-avatar.png',
        bio: 'Updated bio',
      };

      (userProfileService.updateProfile as jest.Mock).mockResolvedValue(mockProfile);

      const { req, res } = createMockReqRes();
      req.body = {
        avatarUrl: 'http://example.com/new-avatar.png',
        bio: 'Updated bio',
      };

      await userProfileController.updateMyProfile(req, res);

      expect(userProfileService.updateProfile).toHaveBeenCalledWith('user-123', {
        avatarUrl: 'http://example.com/new-avatar.png',
        bio: 'Updated bio',
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { profile: mockProfile },
      });
    });

    it('should handle partial updates', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-123',
        avatarUrl: null,
        bio: 'Only bio updated',
      };

      (userProfileService.updateProfile as jest.Mock).mockResolvedValue(mockProfile);

      const { req, res } = createMockReqRes();
      req.body = { bio: 'Only bio updated' };

      await userProfileController.updateMyProfile(req, res);

      expect(userProfileService.updateProfile).toHaveBeenCalledWith('user-123', {
        avatarUrl: undefined,
        bio: 'Only bio updated',
      });
    });

    it('should handle update errors', async () => {
      (userProfileService.updateProfile as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const { req, res } = createMockReqRes();
      req.body = { bio: 'New bio' };

      await userProfileController.updateMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Update failed',
      });
    });
  });

  describe('getUserProfile', () => {
    it('should get public profile of another user', async () => {
      const mockProfile = {
        id: 'profile-2',
        userId: 'user-456',
        username: 'otheruser',
        avatarUrl: 'http://example.com/other-avatar.png',
      };

      const mockStats = {
        gamesPlayed: 20,
        totalPlayTime: 7200,
        favoriteCount: 15,
      };

      (userProfileService.getPublicProfile as jest.Mock).mockResolvedValue(mockProfile);
      (userProfileService.getUserStats as jest.Mock).mockResolvedValue(mockStats);

      const { req, res } = createMockReqRes();
      req.params = { userId: 'user-456' };

      await userProfileController.getUserProfile(req, res);

      expect(userProfileService.getPublicProfile).toHaveBeenCalledWith('user-456');
      expect(userProfileService.getUserStats).toHaveBeenCalledWith('user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { profile: mockProfile, stats: mockStats },
      });
    });

    it('should return 404 if user not found', async () => {
      (userProfileService.getPublicProfile as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMockReqRes();
      req.params = { userId: 'non-existent' };

      await userProfileController.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found',
      });
    });

    it('should handle errors', async () => {
      (userProfileService.getPublicProfile as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { req, res } = createMockReqRes();
      req.params = { userId: 'user-456' };

      await userProfileController.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to fetch user profile',
      });
    });
  });
});
