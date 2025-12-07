import { Router } from 'express';

const router = Router();

// Version endpoint
router.get('/', (_req, res) => {
  res.json({
    name: 'Captain Bitbeard API',
    version: '1.0.0',
    status: 'operational',
  });
});

// TODO: Add route modules
// import authRoutes from './auth.routes';
// import gamesRoutes from './games.routes';
// import userRoutes from './user.routes';
// router.use('/auth', authRoutes);
// router.use('/games', gamesRoutes);
// router.use('/users', userRoutes);

export default router;
