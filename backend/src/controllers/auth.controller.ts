import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

/**
 * Login user and return JWT token
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({
        error: 'Username and password are required',
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      logger.warn({ username }, 'Login attempt with non-existent user');
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      logger.warn({ username }, 'Login attempt with invalid password');
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    logger.info({ username, userId: user.id }, 'User logged in successfully');

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Login error');
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Register new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      res.status(400).json({
        error: 'Username, email, and password are required',
      });
      return;
    }

    // Check password length
    if (password.length < 8) {
      res.status(400).json({
        error: 'Password must be at least 8 characters long',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      res.status(409).json({
        error: 'Username or email already exists',
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'USER',
      },
    });

    logger.info({ username, userId: user.id }, 'User registered successfully');

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Registration error');
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Get current user info
 */
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
      });
      return;
    }

    res.json(user);
  } catch (error) {
    logger.error({ err: error }, 'Get user info error');
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Logout user (client should remove token)
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    message: 'Logged out successfully',
  });
};
