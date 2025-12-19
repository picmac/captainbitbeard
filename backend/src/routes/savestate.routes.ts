import { Router } from 'express';
import { saveStateController } from '../controllers/savestate.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all save states for current user (across all games)
router.get('/my-saves', (req, res) =>
  saveStateController.getMySaveStates(req as any, res)
);

// Get all save states for a specific game
router.get('/game/:gameId', (req, res) =>
  saveStateController.getSaveStatesByGame(req as any, res)
);

// Create or update save state for a game
router.post('/game/:gameId', (req, res) =>
  saveStateController.createSaveState(req as any, res)
);

// Get specific save state by ID
router.get('/:id', (req, res) =>
  saveStateController.getSaveStateById(req as any, res)
);

// Load save state data (download file)
router.get('/:id/load', (req, res) =>
  saveStateController.loadSaveState(req as any, res)
);

// Update save state
router.patch('/:id', (req, res) =>
  saveStateController.updateSaveState(req as any, res)
);

// Delete save state
router.delete('/:id', (req, res) =>
  saveStateController.deleteSaveState(req as any, res)
);

export default router;
