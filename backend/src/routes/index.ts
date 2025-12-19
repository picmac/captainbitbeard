import { Router } from 'express';
import gameRoutes from './game.routes';
import authRoutes from './auth.routes';
import favoriteRoutes from './favorite.routes';
import playHistoryRoutes from './playhistory.routes';
import collectionRoutes from './collection.routes';

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

export default router;
