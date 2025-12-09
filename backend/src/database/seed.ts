#!/usr/bin/env tsx

/**
 * Database Seed Script
 *
 * Seeds the database with initial data for development and testing.
 *
 * Usage:
 *   npm run seed
 */

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Seed users
 */
async function seedUsers(): Promise<void> {
  logger.info('Seeding users...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (existingAdmin) {
    logger.info('Admin user already exists, skipping...');
  } else {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin', config.bcrypt.rounds);
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@captainbitbeard.local',
        passwordHash: adminPassword,
        role: UserRole.ADMIN,
      },
    });
    logger.info('Admin user created (username: admin, password: admin)');
  }

  // Check if test user already exists
  const existingUser = await prisma.user.findUnique({
    where: { username: 'testuser' },
  });

  if (existingUser) {
    logger.info('Test user already exists, skipping...');
  } else {
    // Create test user
    const userPassword = await bcrypt.hash('password123', config.bcrypt.rounds);
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@captainbitbeard.local',
        passwordHash: userPassword,
        role: UserRole.USER,
      },
    });

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: testUser.id,
        bio: 'Test user for development',
      },
    });

    logger.info('Test user created (username: testuser, password: password123)');
  }
}

/**
 * Seed games (placeholder for future implementation)
 */
async function seedGames(): Promise<void> {
  logger.info('Seeding games...');
  // TODO: Add sample games if needed for development
  logger.info('No games to seed (add ROMs manually)');
}

/**
 * Main seed function
 */
async function seed(): Promise<void> {
  try {
    logger.info('🌱 Starting database seed...');

    await seedUsers();
    await seedGames();

    logger.info('✅ Database seeded successfully!');
  } catch (error) {
    logger.error({ err: error }, '❌ Error seeding database:');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seed()
  .then(() => {
    console.log('\n🎉 Seed completed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });
