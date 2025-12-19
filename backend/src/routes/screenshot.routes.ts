import { Router } from 'express';
import { screenshotController } from '../controllers/screenshot.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Get screenshots for a game (public)
router.get('/game/:gameId', (req, res) =>
  screenshotController.getScreenshots(req, res)
);

// Admin-only routes
router.use(authenticate, requireAdmin);

// Add screenshot to game
router.post('/game/:gameId', (req, res) =>
  screenshotController.addScreenshot(req, res)
);

// Bulk add screenshots
router.post('/game/:gameId/bulk', (req, res) =>
  screenshotController.bulkAddScreenshots(req, res)
);

// Reorder screenshots
router.put('/reorder', (req, res) =>
  screenshotController.reorderScreenshots(req, res)
);

// Delete screenshot
router.delete('/:id', (req, res) =>
  screenshotController.deleteScreenshot(req, res)
);

export default router;
