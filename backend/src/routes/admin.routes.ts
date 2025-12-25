import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { AuthRequest } from '../controllers/auth.controller';

const router = Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

// System Statistics
router.get('/stats/system', (req, res) =>
  adminController.getSystemStats(req as AuthRequest, res)
);

router.get('/stats/storage', (req, res) =>
  adminController.getStorageStats(req as AuthRequest, res)
);

router.get('/stats/activity', (req, res) =>
  adminController.getActivityStats(req as AuthRequest, res)
);

// User Management
router.get('/users', (req, res) =>
  adminController.getAllUsers(req as AuthRequest, res)
);

router.patch('/users/:userId/role', (req, res) =>
  adminController.updateUserRole(req as AuthRequest, res)
);

router.delete('/users/:userId', (req, res) =>
  adminController.deleteUser(req as AuthRequest, res)
);

// Bulk Operations
router.post('/games/bulk-delete', (req, res) =>
  adminController.bulkDeleteGames(req as AuthRequest, res)
);

router.patch('/games/bulk-update', (req, res) =>
  adminController.bulkUpdateGames(req as AuthRequest, res)
);

// Duplicate Detection
router.get('/games/duplicates', (req, res) =>
  adminController.findDuplicates(req as AuthRequest, res)
);

export default router;
