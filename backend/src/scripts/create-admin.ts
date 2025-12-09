#!/usr/bin/env tsx

/**
 * Create Admin User Script
 *
 * Creates an admin user for Captain Bitbeard.
 * Can be run with default credentials or custom ones via environment variables.
 *
 * Usage:
 *   npm run create-admin
 *
 * Or with custom credentials:
 *   ADMIN_USERNAME=myadmin ADMIN_PASSWORD=mypass ADMIN_EMAIL=admin@example.com npm run create-admin
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from '../config';
import readline from 'readline';

const prisma = new PrismaClient();

interface AdminCredentials {
  username: string;
  email: string;
  password: string;
}

/**
 * Prompt user for input
 */
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Get admin credentials from environment or user input
 */
async function getAdminCredentials(): Promise<AdminCredentials> {
  // Check for environment variables first
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    return {
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL || `${process.env.ADMIN_USERNAME}@captainbitbeard.local`,
      password: process.env.ADMIN_PASSWORD,
    };
  }

  // Use default credentials
  const useDefaults = process.env.USE_DEFAULTS !== 'false';

  if (useDefaults) {
    console.log('Using default credentials: admin / admin');
    return {
      username: 'admin',
      email: 'admin@captainbitbeard.local',
      password: 'admin',
    };
  }

  // Interactive mode
  console.log('Creating admin user...\n');
  const username = await prompt('Username (default: admin): ') || 'admin';
  const email = await prompt('Email (default: admin@captainbitbeard.local): ') || 'admin@captainbitbeard.local';
  const password = await prompt('Password (default: admin): ') || 'admin';

  return { username, email, password };
}

/**
 * Create admin user
 */
async function createAdmin(): Promise<void> {
  try {
    console.log('🏴‍☠️ Captain Bitbeard - Admin User Creation\n');

    // Get credentials
    const credentials = await getAdminCredentials();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: credentials.username },
          { email: credentials.email },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        console.log(`\n⚠️  Admin user already exists:`);
        console.log(`   Username: ${existingUser.username}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Role: ${existingUser.role}`);
        console.log(`\n✅ No action needed.`);
        return;
      } else {
        // Upgrade existing user to admin
        console.log(`\n📝 Upgrading existing user to admin...`);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: 'ADMIN' },
        });
        console.log(`\n✅ User upgraded to admin successfully!`);
        console.log(`   Username: ${existingUser.username}`);
        console.log(`   Email: ${existingUser.email}`);
        return;
      }
    }

    // Hash password
    console.log(`\n🔐 Hashing password...`);
    const passwordHash = await bcrypt.hash(credentials.password, config.bcrypt.rounds);

    // Create admin user
    console.log(`👤 Creating admin user...`);
    const admin = await prisma.user.create({
      data: {
        username: credentials.username,
        email: credentials.email,
        passwordHash,
        role: 'ADMIN',
      },
    });

    console.log(`\n✅ Admin user created successfully!`);
    console.log(`\n📋 Admin Details:`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${admin.createdAt.toISOString()}`);
    console.log(`\n🏴‍☠️ You can now login at the frontend!`);

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdmin()
  .then(() => {
    console.log('\n🎉 Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
