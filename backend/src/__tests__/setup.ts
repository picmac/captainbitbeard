import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    game: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    saveState: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock MinIO
jest.mock('minio', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      bucketExists: jest.fn().mockResolvedValue(true),
      makeBucket: jest.fn().mockResolvedValue(undefined),
      setBucketPolicy: jest.fn().mockResolvedValue(undefined),
      putObject: jest.fn().mockResolvedValue({ etag: 'mock-etag' }),
      getObject: jest.fn().mockResolvedValue(Buffer.from('mock-data')),
      presignedGetObject: jest.fn().mockResolvedValue('https://mock-url.com/file'),
      removeObject: jest.fn().mockResolvedValue(undefined),
      statObject: jest.fn().mockResolvedValue({
        size: 1024,
        lastModified: new Date(),
        etag: 'mock-etag',
      }),
      listObjects: jest.fn().mockReturnValue({
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback({ name: 'test-file.nes' });
          }
          if (event === 'end') {
            callback();
          }
        }),
      }),
    })),
  };
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.MINIO_ENDPOINT = 'localhost';
process.env.MINIO_PORT = '9000';
process.env.MINIO_ACCESS_KEY = 'test';
process.env.MINIO_SECRET_KEY = 'test-secret';
process.env.MINIO_BUCKET = 'test-bucket';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_SECRET = 'test-session-secret';
