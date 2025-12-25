import { Router } from 'express';
import multer from 'multer';
import { gameController } from '../controllers/game.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { uploadLimiter, bulkUploadLimiter, scrapeLimiter } from '../middleware/rate-limit';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Accept various ROM file extensions
    const allowedExtensions = [
      '.nes',
      '.snes',
      '.sfc',
      '.gb',
      '.gbc',
      '.gba',
      '.n64',
      '.z64',
      '.nds',
      '.smd',
      '.gen',
      '.sms',
      '.gg',
      '.iso',
      '.cue',
      '.bin',
      '.zip',
      '.7z',
      '.rar',
    ];

    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${ext}`));
    }
  },
});

// Public routes (no auth required for MVP)
router.get('/', gameController.getAllGames.bind(gameController));
router.get('/systems', gameController.getSystems.bind(gameController));
router.get('/search', gameController.searchGames.bind(gameController));
router.get('/advanced-search', gameController.advancedSearch.bind(gameController));
router.get('/:id', gameController.getGameById.bind(gameController));
router.get('/:id/play', gameController.getGameForPlay.bind(gameController));
router.get('/:id/rom', gameController.streamRom.bind(gameController));
router.get('/system/:system', gameController.getGamesBySystem.bind(gameController));

// Admin routes - require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);
router.post('/upload', uploadLimiter, upload.single('rom'), gameController.uploadRom.bind(gameController));
router.post(
  '/bulk-upload',
  bulkUploadLimiter,
  upload.array('roms', 50), // Allow up to 50 files at once
  gameController.bulkUploadRoms.bind(gameController)
);
router.post('/:id/scrape', scrapeLimiter, gameController.scrapeMetadata.bind(gameController));
router.post('/bulk-scrape', scrapeLimiter, gameController.bulkScrapeMetadata.bind(gameController));
router.patch('/:id', gameController.updateGame.bind(gameController));
router.delete('/:id', gameController.deleteGame.bind(gameController));

export default router;
