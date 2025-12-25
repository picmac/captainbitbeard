import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { apiLimiter } from './middleware/rate-limit';
import { minioService } from './services/minio.service';
import { runSetup } from './utils/setup';
import routes from './routes';

// Fix BigInt serialization
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(BigInt.prototype as any).toJSON = function (this: bigint): string {
  return this.toString();
};

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Smart compression - skip already compressed files
app.use(compression({
  filter: (req, res) => {
    // Skip compression for ROM streaming endpoint
    if (req.path.endsWith('/rom')) {
      return false;
    }

    // Skip compression for already compressed file types
    const contentType = res.getHeader('Content-Type') as string;
    if (contentType) {
      const skipTypes = [
        'application/zip',
        'application/x-7z-compressed',
        'application/x-rar-compressed',
        'application/gzip',
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/',
      ];
      if (skipTypes.some(type => contentType.includes(type))) {
        return false;
      }
    }

    // Use default compression filter for everything else
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses > 1KB
  level: 6, // Balanced compression level (1=fastest, 9=best compression)
}));

// Request logging
app.use(requestLogger);

// Rate limiting for API routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Initialize services and start server
const startServer = async (): Promise<void> => {
  try {
    // Run application setup (create default admin, etc.)
    await runSetup();

    // Initialize MinIO
    logger.info('🗄️  Initializing MinIO...');
    await minioService.initialize();

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`🏴‍☠️ Captain Bitbeard Backend running on port ${config.port}`);
      logger.info(`📊 Environment: ${config.env}`);
      logger.info(`🔗 API: http://localhost:${config.port}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (): Promise<void> => {
      logger.info('🛑 Shutting down gracefully...');

      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to start server');
    process.exit(1);
  }
};

void startServer();

export default app;
