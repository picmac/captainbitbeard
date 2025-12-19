import { Router } from 'express';
import { savedSearchController } from '../controllers/savedsearch.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Saved Search Routes
router.post('/', (req, res) =>
  savedSearchController.createSavedSearch(req as any, res)
);

router.get('/', (req, res) =>
  savedSearchController.getUserSavedSearches(req as any, res)
);

router.get('/:id', (req, res) =>
  savedSearchController.getSavedSearchById(req as any, res)
);

router.patch('/:id', (req, res) =>
  savedSearchController.updateSavedSearch(req as any, res)
);

router.delete('/:id', (req, res) =>
  savedSearchController.deleteSavedSearch(req as any, res)
);

export default router;
