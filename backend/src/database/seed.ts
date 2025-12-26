#!/usr/bin/env tsx

/**
 * Database Seed Script
 *
 * Seeds the database with initial data for development and testing.
 *
 * Usage:
 *   npm run seed
 */

import { PrismaClient, UserRole, GameRegion, ScreenshotCategory } from '@prisma/client';
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
 * Seed games for testing
 */
async function seedGames(): Promise<void> {
  logger.info('Seeding games...');

  // Check if F-Zero test game already exists
  const existingFZero = await prisma.game.findFirst({
    where: { title: 'F-Zero' },
  });

  if (existingFZero) {
    logger.info('F-Zero test game already exists, skipping...');
    return;
  }

  // Create F-Zero test game
  const fzero = await prisma.game.create({
    data: {
      title: 'F-Zero',
      system: 'snes',
      romPath: 'test/fzero.smc', // Placeholder path for testing
      description: 'A futuristic racing game set in the year 2560. Race against opponents in anti-gravity vehicles at speeds exceeding 400 km/h. TEST GAME for E2E testing.',
      releaseDate: new Date('1990-11-21'),
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      genre: 'Racing',
      players: 1,
      region: GameRegion.USA,
      coverUrl: 'https://picsum.photos/seed/fzero-cover/300/400',
      boxArtUrl: 'https://picsum.photos/seed/fzero-box/600/800',
    },
  });

  // Add some screenshots
  await prisma.screenshot.createMany({
    data: [
      {
        gameId: fzero.id,
        url: 'https://picsum.photos/seed/fzero-1/640/480',
        type: 'gameplay',
        category: ScreenshotCategory.TITLE_SCREEN,
        caption: 'F-Zero Title Screen',
        order: 1,
      },
      {
        gameId: fzero.id,
        url: 'https://picsum.photos/seed/fzero-2/640/480',
        type: 'gameplay',
        category: ScreenshotCategory.GAMEPLAY,
        caption: 'Mute City Circuit',
        order: 2,
      },
      {
        gameId: fzero.id,
        url: 'https://picsum.photos/seed/fzero-3/640/480',
        type: 'gameplay',
        category: ScreenshotCategory.GAMEPLAY,
        caption: 'Racing at high speed',
        order: 3,
      },
    ],
  });

  // Add metadata
  await prisma.gameMetadata.create({
    data: {
      gameId: fzero.id,
      esrbRating: 'E',
      region: 'USA',
      language: 'English',
      fileSize: BigInt(524288), // 512 KB
    },
  });

  logger.info('✅ F-Zero test game created for E2E testing');
  logger.info('⚠️  Note: This uses a placeholder ROM path. Upload a real ROM for actual gameplay.');
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
