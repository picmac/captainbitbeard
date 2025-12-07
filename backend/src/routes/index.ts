import { Router } from 'express';
import gameRoutes from './game.routes';

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
router.use('/games', gameRoutes);

// TODO: Add more route modules
// import authRoutes from './auth.routes';
// import userRoutes from './user.routes';
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);

export default router;
