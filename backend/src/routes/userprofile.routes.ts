import { Router } from 'express';
import { userProfileController } from '../controllers/userprofile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user's profile
router.get('/me', (req, res) =>
  userProfileController.getMyProfile(req as any, res)
);

// Update current user's profile
router.patch('/me', (req, res) =>
  userProfileController.updateMyProfile(req as any, res)
);

// Get public profile of another user
router.get('/:userId', (req, res) =>
  userProfileController.getUserProfile(req as any, res)
);

export default router;
