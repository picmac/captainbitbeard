import { Router } from 'express';
import { savedSearchController } from '../controllers/savedsearch.controller';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../controllers/auth.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Saved Search Routes
router.post('/', (req, res) =>
  savedSearchController.createSavedSearch(req as AuthRequest, res)
);

router.get('/', (req, res) =>
  savedSearchController.getUserSavedSearches(req as AuthRequest, res)
);

router.get('/:id', (req, res) =>
  savedSearchController.getSavedSearchById(req as AuthRequest, res)
);

router.patch('/:id', (req, res) =>
  savedSearchController.updateSavedSearch(req as AuthRequest, res)
);

router.delete('/:id', (req, res) =>
  savedSearchController.deleteSavedSearch(req as AuthRequest, res)
);

export default router;
