import express from 'express';
import { mediaController, mediaUpload } from '../controllers/media.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// All media routes require authentication
router.use(authenticate);

// Upload media endpoints (Admin only)
router.post(
  '/games/:gameId/media/trailer',
  requireAdmin,
  mediaUpload.single('video'),
  mediaController.uploadTrailer.bind(mediaController)
);

router.post(
  '/games/:gameId/media/music',
  requireAdmin,
  mediaUpload.single('music'),
  mediaController.uploadBackgroundMusic.bind(mediaController)
);

router.post(
  '/games/:gameId/media/animated-cover',
  requireAdmin,
  mediaUpload.single('cover'),
  mediaController.uploadAnimatedCover.bind(mediaController)
);

router.post(
  '/games/:gameId/media/screenshot',
  requireAdmin,
  mediaUpload.single('screenshot'),
  mediaController.uploadCategorizedScreenshot.bind(mediaController)
);

// Delete media endpoints (Admin only)
router.delete(
  '/games/:gameId/media/trailer',
  requireAdmin,
  mediaController.deleteTrailer.bind(mediaController)
);

router.delete(
  '/games/:gameId/media/music',
  requireAdmin,
  mediaController.deleteBackgroundMusic.bind(mediaController)
);

router.delete(
  '/games/:gameId/media/animated-cover',
  requireAdmin,
  mediaController.deleteAnimatedCover.bind(mediaController)
);

// Get screenshots by category (All authenticated users)
router.get(
  '/games/:gameId/media/screenshots',
  mediaController.getScreenshotsByCategory.bind(mediaController)
);

// Update screenshot metadata (Admin only)
router.patch(
  '/screenshots/:screenshotId',
  requireAdmin,
  mediaController.updateScreenshot.bind(mediaController)
);

export default router;
