import { Router } from 'express';
import { collectionShareController } from '../controllers/collectionshare.controller';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../controllers/auth.controller';

const router = Router();

// Get collection by share link (no auth required)
router.get('/shared/:shareLink', (req, res) =>
  collectionShareController.getByShareLink(req as AuthRequest, res)
);

// All other routes require authentication
router.use(authenticate);

// Get collections shared with me
router.get('/shared-with-me', (req, res) =>
  collectionShareController.getSharedWithMe(req as AuthRequest, res)
);

// Update collection visibility
router.patch('/:collectionId/visibility', (req, res) =>
  collectionShareController.updateVisibility(req as AuthRequest, res)
);

// Generate share link
router.post('/:collectionId/share-link', (req, res) =>
  collectionShareController.generateShareLink(req as AuthRequest, res)
);

// Remove share link
router.delete('/:collectionId/share-link', (req, res) =>
  collectionShareController.removeShareLink(req as AuthRequest, res)
);

// Share with specific user
router.post('/:collectionId/share', (req, res) =>
  collectionShareController.shareWithUser(req as AuthRequest, res)
);

// Get users with access
router.get('/:collectionId/shares', (req, res) =>
  collectionShareController.getSharedUsers(req as AuthRequest, res)
);

// Remove user access
router.delete('/:collectionId/shares/:userId', (req, res) =>
  collectionShareController.removeUserAccess(req as AuthRequest, res)
);

export default router;
