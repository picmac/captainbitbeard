import { Response } from 'express';
import { AuthRequest } from './auth.controller';
import { adminService } from '../services/admin.service';
import { UserRole } from '@prisma/client';

interface UpdateUserRoleBody {
  role: UserRole;
}

interface BulkDeleteGamesBody {
  gameIds: string[];
}

interface BulkUpdateGamesBody {
  gameIds: string[];
  updates: {
    system?: string;
    genre?: string;
    developer?: string;
    publisher?: string;
  };
}

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class AdminController {
  // Get system statistics
  async getSystemStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await adminService.getSystemStats();

      res.json({
        status: 'success',
        data: stats,
      });
    } catch (error: unknown) {
      console.error('Error fetching system stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch system statistics',
      });
    }
  }

  // Get all users
  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const includeStats = req.query.includeStats === 'true';
      const users = await adminService.getAllUsers(includeStats);

      res.json({
        status: 'success',
        data: { users },
      });
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch users',
      });
    }
  }

  // Update user role
  async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body as UpdateUserRoleBody;

      if (!role || !['USER', 'ADMIN'].includes(role)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid role. Must be USER or ADMIN',
        });
        return;
      }

      // Prevent self-demotion
      if (userId === req.user!.id && role === UserRole.USER) {
        res.status(400).json({
          status: 'error',
          message: 'Cannot demote yourself',
        });
        return;
      }

      const user = await adminService.updateUserRole(userId, role);

      res.json({
        status: 'success',
        data: { user },
      });
    } catch (error: unknown) {
      console.error('Error updating user role:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to update user role',
      });
    }
  }

  // Delete user
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Prevent self-deletion
      if (userId === req.user!.id) {
        res.status(400).json({
          status: 'error',
          message: 'Cannot delete yourself',
        });
        return;
      }

      await adminService.deleteUser(userId);

      res.json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      const statusCode = getErrorMessage(error).includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        message: getErrorMessage(error) || 'Failed to delete user',
      });
    }
  }

  // Bulk delete games
  async bulkDeleteGames(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gameIds } = req.body as BulkDeleteGamesBody;

      if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'gameIds array is required',
        });
        return;
      }

      const result = await adminService.bulkDeleteGames(gameIds);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error: unknown) {
      console.error('Error bulk deleting games:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to bulk delete games',
      });
    }
  }

  // Bulk update games
  async bulkUpdateGames(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gameIds, updates } = req.body as BulkUpdateGamesBody;

      if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'gameIds array is required',
        });
        return;
      }

      if (!updates || Object.keys(updates).length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'updates object is required',
        });
        return;
      }

      const result = await adminService.bulkUpdateGames(gameIds, updates);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error: unknown) {
      console.error('Error bulk updating games:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to bulk update games',
      });
    }
  }

  // Find duplicate games
  async findDuplicates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const duplicates = await adminService.findDuplicates();

      res.json({
        status: 'success',
        data: { duplicates },
      });
    } catch (error: unknown) {
      console.error('Error finding duplicates:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to find duplicates',
      });
    }
  }

  // Get storage stats
  async getStorageStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await adminService.getStorageStats();

      res.json({
        status: 'success',
        data: stats,
      });
    } catch (error: unknown) {
      console.error('Error fetching storage stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch storage statistics',
      });
    }
  }

  // Get activity stats
  async getActivityStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await adminService.getActivityStats();

      res.json({
        status: 'success',
        data: stats,
      });
    } catch (error: unknown) {
      console.error('Error fetching activity stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch activity statistics',
      });
    }
  }
}

export const adminController = new AdminController();
