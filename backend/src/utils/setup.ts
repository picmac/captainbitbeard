/**
 * Application Setup Utilities
 *
 * Handles initial setup tasks like creating default admin user
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { logger } from './logger';

const prisma = new PrismaClient();

/**
 * Ensure default admin user exists
 * Creates admin user with default credentials if none exists
 */
export async function ensureAdminUser(): Promise<void> {
  try {
    // Check if any admin user exists
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    });

    if (adminUser) {
      logger.info(`✅ Admin user exists: ${adminUser.username}`);
      return;
    }

    // No admin exists, create default admin
    logger.info('👤 No admin user found, creating default admin...');

    const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@captainbitbeard.local';

    // Check if a user with this username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      // Upgrade existing user to admin
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'ADMIN' },
      });
      logger.info(`✅ Upgraded existing user '${username}' to admin role`);
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);

      await prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
          role: 'ADMIN',
        },
      });

      logger.info(`✅ Created default admin user: ${username}`);
      logger.info(`🔐 Default credentials: ${username} / ${password}`);
      logger.info('⚠️  Please change the default password after first login!');
    }
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to ensure admin user exists');
    // Don't throw - let the app continue even if this fails
  }
}

/**
 * Run all setup tasks
 */
export async function runSetup(): Promise<void> {
  try {
    logger.info('🚀 Running application setup...');
    await ensureAdminUser();
    logger.info('✅ Setup completed');
  } catch (error) {
    logger.error({ err: error }, '❌ Setup failed');
  } finally {
    await prisma.$disconnect();
  }
}
