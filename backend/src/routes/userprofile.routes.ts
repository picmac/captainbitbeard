import { Router } from 'express';
import { userProfileController } from '../controllers/userprofile.controller';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../controllers/auth.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user's profile
router.get('/me', (req, res) =>
  userProfileController.getMyProfile(req as AuthRequest, res)
);

// Update current user's profile
router.patch('/me', (req, res) =>
  userProfileController.updateMyProfile(req as AuthRequest, res)
);

// Get public profile of another user
router.get('/:userId', (req, res) =>
  userProfileController.getUserProfile(req as AuthRequest, res)
);

export default router;
