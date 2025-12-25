import { Router } from 'express';
import multer from 'multer';
import { gameVersionController } from '../controllers/gameversion.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { AuthRequest } from '../controllers/auth.controller';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

// Public routes (for viewing versions)
router.get('/:gameId', (req, res) =>
  gameVersionController.getGameVersions(req, res)
);

router.get('/:gameId/:versionId/download', (req, res) =>
  gameVersionController.getVersionDownloadUrl(req, res)
);

// Admin routes (require authentication and admin role)
router.use(authenticate);
router.use(requireAdmin);

router.post('/:gameId', upload.single('rom'), (req, res) =>
  gameVersionController.createGameVersion(req as AuthRequest, res)
);

router.patch('/:gameId/:versionId/preferred', (req, res) =>
  gameVersionController.setPreferredVersion(req as AuthRequest, res)
);

router.delete('/:gameId/:versionId', (req, res) =>
  gameVersionController.deleteGameVersion(req as AuthRequest, res)
);

export default router;
