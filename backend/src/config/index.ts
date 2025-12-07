import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  env: string;
  port: number;
  database: {
    url: string;
  };
  minio: {
    endpoint: string;
    port: number;
    accessKey: string;
    secretKey: string;
    bucket: string;
    useSSL: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  session: {
    secret: string;
  };
  bcrypt: {
    rounds: number;
  };
  screenscraper: {
    user: string;
    password: string;
    devId: string;
    devPassword: string;
    softName: string;
  };
  pixellab: {
    apiKey: string;
  };
  cors: {
    origin: string;
  };
  logLevel: string;
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  database: {
    url: process.env.DATABASE_URL || '',
  },

  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
    bucket: process.env.MINIO_BUCKET || 'captain-bitbeard',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  session: {
    secret: process.env.SESSION_SECRET || '',
  },

  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  },

  screenscraper: {
    user: process.env.SCREENSCRAPER_USER || '',
    password: process.env.SCREENSCRAPER_PASSWORD || '',
    devId: process.env.SCREENSCRAPER_DEV_ID || '',
    devPassword: process.env.SCREENSCRAPER_DEV_PASSWORD || '',
    softName: process.env.SCREENSCRAPER_SOFT_NAME || 'CaptainBitbeard',
  },

  pixellab: {
    apiKey: process.env.PIXELLAB_API_KEY || '',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate critical configuration
const validateConfig = (): void => {
  const required = [
    'database.url',
    'minio.accessKey',
    'minio.secretKey',
    'jwt.secret',
    'session.secret',
  ];

  const missing: string[] = [];

  for (const key of required) {
    const value = key.split('.').reduce<unknown>((obj, k) => {
      if (obj && typeof obj === 'object' && k in obj) {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, config);
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
};

if (config.env !== 'test') {
  validateConfig();
}
