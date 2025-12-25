#!/usr/bin/env node
import { PNG } from 'pngjs';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Captain Bitbeard theme colors
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const OCEAN_DARK = hexToRgb('#191970');
const PIRATE_GOLD = hexToRgb('#FFD700');
const SKULL_WHITE = hexToRgb('#F5F5DC');

const createIcon = (size, outputPath) => {
  const png = new PNG({ width: size, height: size });

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Calculate distance from center
      const centerX = size / 2;
      const centerY = size / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Create a circular pirate flag design
      const radius = size * 0.4;
      const borderRadius = size * 0.45;

      // Border (gold ring)
      if (distance > radius && distance < borderRadius) {
        png.data[idx] = PIRATE_GOLD.r;
        png.data[idx + 1] = PIRATE_GOLD.g;
        png.data[idx + 2] = PIRATE_GOLD.b;
        png.data[idx + 3] = 255;
      }
      // Inner circle (ocean dark)
      else if (distance <= radius) {
        png.data[idx] = OCEAN_DARK.r;
        png.data[idx + 1] = OCEAN_DARK.g;
        png.data[idx + 2] = OCEAN_DARK.b;
        png.data[idx + 3] = 255;

        // Add a simple skull pattern (white cross in center)
        const crossSize = size * 0.15;
        if ((Math.abs(dx) < crossSize / 4 && Math.abs(dy) < crossSize) ||
            (Math.abs(dy) < crossSize / 4 && Math.abs(dx) < crossSize)) {
          png.data[idx] = SKULL_WHITE.r;
          png.data[idx + 1] = SKULL_WHITE.g;
          png.data[idx + 2] = SKULL_WHITE.b;
          png.data[idx + 3] = 255;
        }
      }
      // Outside circle (transparent or dark background)
      else {
        png.data[idx] = OCEAN_DARK.r;
        png.data[idx + 1] = OCEAN_DARK.g;
        png.data[idx + 2] = OCEAN_DARK.b;
        png.data[idx + 3] = 255;
      }
    }
  }

  const buffer = PNG.sync.write(png);
  writeFileSync(outputPath, buffer);
  console.log(`✓ Generated ${outputPath} (${size}x${size})`);
};

async function main() {
  try {
    console.log('🏴‍☠️ Generating Captain Bitbeard PWA icons...\n');

    // Generate PWA icons
    createIcon(192, join('public', 'pwa-192x192.png'));
    createIcon(512, join('public', 'pwa-512x512.png'));
    createIcon(180, join('public', 'apple-touch-icon.png'));
    createIcon(32, join('public', 'favicon.png'));

    // Also create favicon.ico (just copy the 32x32 png for now)
    console.log('\n✅ All PWA icons generated successfully!');
    console.log('\nGenerated files:');
    console.log('  • public/pwa-192x192.png (192x192)');
    console.log('  • public/pwa-512x512.png (512x512)');
    console.log('  • public/apple-touch-icon.png (180x180)');
    console.log('  • public/favicon.png (32x32)');
    console.log('\n💡 Note: These are placeholder icons with Captain Bitbeard theme.');
    console.log('   For production, consider creating custom pirate-themed icons.');
    console.log('\n🏴‍☠️ Ready to set sail!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

main();
