import { Router } from 'express';
import { collectionController } from '../controllers/collection.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All collection routes require authentication
router.use(authenticate);

// Collection CRUD
router.post('/', collectionController.createCollection.bind(collectionController));
router.get('/', collectionController.getUserCollections.bind(collectionController));
router.get('/:collectionId', collectionController.getCollectionById.bind(collectionController));
router.patch('/:collectionId', collectionController.updateCollection.bind(collectionController));
router.delete('/:collectionId', collectionController.deleteCollection.bind(collectionController));

// Game management in collections
router.post(
  '/:collectionId/games/:gameId',
  collectionController.addGameToCollection.bind(collectionController)
);
router.delete(
  '/:collectionId/games/:gameId',
  collectionController.removeGameFromCollection.bind(collectionController)
);
router.put(
  '/:collectionId/reorder',
  collectionController.reorderGames.bind(collectionController)
);

// Get collections containing a game
router.get(
  '/game/:gameId',
  collectionController.getCollectionsWithGame.bind(collectionController)
);

export default router;
