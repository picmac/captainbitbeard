import { Router } from 'express';
import { playHistoryController } from '../controllers/playhistory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get recent games
router.get('/recent', playHistoryController.getRecentGames.bind(playHistoryController));

// Get play history for a specific game
router.get('/game/:gameId', playHistoryController.getGameHistory.bind(playHistoryController));

// Record a play session
router.post('/:gameId', playHistoryController.recordPlay.bind(playHistoryController));

export default router;
