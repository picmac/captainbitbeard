import { Router } from 'express';
import gameRoutes from './game.routes';
import authRoutes from './auth.routes';
import favoriteRoutes from './favorite.routes';
import playHistoryRoutes from './playhistory.routes';
import collectionRoutes from './collection.routes';
import collectionShareRoutes from './collectionshare.routes';
import userprofileRoutes from './userprofile.routes';
import saveStateRoutes from './savestate.routes';
import screenshotRoutes from './screenshot.routes';

const router = Router();

// Version endpoint
router.get('/', (_req, res) => {
  res.json({
    name: 'Captain Bitbeard API',
    version: '1.0.0',
    status: 'operational',
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/games', gameRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/play-history', playHistoryRoutes);
router.use('/collections', collectionRoutes);
router.use('/collection-sharing', collectionShareRoutes);
router.use('/profile', userprofileRoutes);
router.use('/save-states', saveStateRoutes);
router.use('/screenshots', screenshotRoutes);

export default router;
