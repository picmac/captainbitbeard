#!/usr/bin/env node
/**
 * Alt Text Audit Script
 *
 * Scans the codebase for <img> tags and verifies they have meaningful alt text
 * according to WCAG 2.1 Level AA guidelines.
 *
 * Usage: node scripts/audit-alt-text.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const EXCLUDED_DIRS = ['node_modules', 'build', 'dist', '.git'];

// Common meaningless alt text values
const MEANINGLESS_ALT_TEXT = [
  '',
  'image',
  'img',
  'photo',
  'picture',
  'graphic',
  'icon',
  'logo',
  'banner',
  'avatar',
  'screenshot',
  'cover',
];

// Results tracking
const results = {
  totalImages: 0,
  missingAlt: [],
  emptyAlt: [],
  meaninglessAlt: [],
  goodAlt: [],
  decorativeImages: [],
};

/**
 * Check if a directory should be excluded from scanning
 */
function shouldExcludeDir(dirPath) {
  return EXCLUDED_DIRS.some(excluded => dirPath.includes(excluded));
}

/**
 * Recursively scan directory for TSX/JSX files
 */
function scanDirectory(dir, files = []) {
  if (shouldExcludeDir(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, files);
    } else if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract line number for a match
 */
function getLineNumber(content, matchIndex) {
  const beforeMatch = content.substring(0, matchIndex);
  return beforeMatch.split('\n').length;
}

/**
 * Check if alt text is meaningful
 */
function isMeaningfulAltText(altText) {
  const normalized = altText.toLowerCase().trim();

  // Check if it's in the meaningless list
  if (MEANINGLESS_ALT_TEXT.includes(normalized)) {
    return false;
  }

  // Check if it's too short (less than 3 characters, excluding decorative)
  if (normalized.length > 0 && normalized.length < 3) {
    return false;
  }

  return true;
}

/**
 * Analyze an image tag
 */
function analyzeImageTag(filePath, content, match, matchIndex) {
  results.totalImages++;

  const lineNumber = getLineNumber(content, matchIndex);
  const imageTag = match[0];
  const relativePath = path.relative(process.cwd(), filePath);
  const location = `${relativePath}:${lineNumber}`;

  // Check for alt attribute (both quoted strings and JSX expressions)
  // Match alt="..." or alt='...' or alt={...}
  let altText = null;
  const quotedAltMatch = imageTag.match(/alt=["']([^"']*)["']/);
  const jsxAltMatch = imageTag.match(/alt=\{([^}]+)\}/);

  if (quotedAltMatch) {
    altText = quotedAltMatch[1];
  } else if (jsxAltMatch) {
    // For JSX expressions, mark as present (can't evaluate at build time)
    altText = '[JSX expression]';
  }

  // Check for aria-hidden (decorative images)
  const isAriaHidden = imageTag.includes('aria-hidden="true"');

  if (isAriaHidden && (altText === '' || altText === null)) {
    // This is correctly marked as decorative
    results.decorativeImages.push({
      location,
      tag: imageTag.substring(0, 100) + '...',
      note: 'Correctly marked as decorative with aria-hidden',
    });
    return;
  }

  if (altText === null) {
    // Missing alt attribute entirely
    results.missingAlt.push({
      location,
      tag: imageTag.substring(0, 100) + '...',
      issue: 'Missing alt attribute',
    });
  } else if (altText === '') {
    // Empty alt (should only be for decorative images)
    if (!isAriaHidden) {
      results.emptyAlt.push({
        location,
        tag: imageTag.substring(0, 100) + '...',
        issue: 'Empty alt text without aria-hidden="true"',
        suggestion: 'Add aria-hidden="true" if decorative, or provide meaningful alt text',
      });
    } else {
      results.decorativeImages.push({
        location,
        tag: imageTag.substring(0, 100) + '...',
        note: 'Correctly marked as decorative',
      });
    }
  } else if (!isMeaningfulAltText(altText)) {
    // Meaningless alt text
    results.meaninglessAlt.push({
      location,
      tag: imageTag.substring(0, 100) + '...',
      altText,
      issue: 'Alt text is too generic or meaningless',
      suggestion: 'Describe what the image shows or its purpose',
    });
  } else {
    // Good alt text!
    results.goodAlt.push({
      location,
      altText,
    });
  }
}

/**
 * Scan a single file for image tags
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Match <img> tags (simplified regex, may not catch all edge cases)
  const imgRegex = /<img[^>]+>/gi;
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    analyzeImageTag(filePath, content, match, match.index);
  }
}

/**
 * Print results
 */
function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('ALT TEXT AUDIT REPORT');
  console.log('='.repeat(80) + '\n');

  console.log(`📊 SUMMARY:`);
  console.log(`  Total images found: ${results.totalImages}`);
  console.log(`  ✅ Good alt text: ${results.goodAlt.length}`);
  console.log(`  🎨 Decorative (aria-hidden): ${results.decorativeImages.length}`);
  console.log(`  ❌ Missing alt: ${results.missingAlt.length}`);
  console.log(`  ⚠️  Empty alt (not decorative): ${results.emptyAlt.length}`);
  console.log(`  ⚠️  Meaningless alt: ${results.meaninglessAlt.length}`);

  const issuesCount = results.missingAlt.length + results.emptyAlt.length + results.meaninglessAlt.length;
  const successRate = results.totalImages > 0
    ? (((results.goodAlt.length + results.decorativeImages.length) / results.totalImages) * 100).toFixed(1)
    : 0;

  console.log(`\n  Success Rate: ${successRate}%`);
  console.log(`  Issues to Fix: ${issuesCount}\n`);

  // Missing alt attributes
  if (results.missingAlt.length > 0) {
    console.log('❌ MISSING ALT ATTRIBUTES:');
    console.log('-'.repeat(80));
    results.missingAlt.forEach((item, i) => {
      console.log(`${i + 1}. ${item.location}`);
      console.log(`   ${item.tag}`);
      console.log(`   Issue: ${item.issue}\n`);
    });
  }

  // Empty alt without aria-hidden
  if (results.emptyAlt.length > 0) {
    console.log('⚠️  EMPTY ALT TEXT (Not Marked as Decorative):');
    console.log('-'.repeat(80));
    results.emptyAlt.forEach((item, i) => {
      console.log(`${i + 1}. ${item.location}`);
      console.log(`   ${item.tag}`);
      console.log(`   Issue: ${item.issue}`);
      console.log(`   Suggestion: ${item.suggestion}\n`);
    });
  }

  // Meaningless alt text
  if (results.meaninglessAlt.length > 0) {
    console.log('⚠️  MEANINGLESS ALT TEXT:');
    console.log('-'.repeat(80));
    results.meaninglessAlt.forEach((item, i) => {
      console.log(`${i + 1}. ${item.location}`);
      console.log(`   Alt text: "${item.altText}"`);
      console.log(`   ${item.tag}`);
      console.log(`   Issue: ${item.issue}`);
      console.log(`   Suggestion: ${item.suggestion}\n`);
    });
  }

  // Good examples (show first 5)
  if (results.goodAlt.length > 0) {
    console.log('✅ GOOD ALT TEXT EXAMPLES (First 5):');
    console.log('-'.repeat(80));
    results.goodAlt.slice(0, 5).forEach((item, i) => {
      console.log(`${i + 1}. ${item.location}`);
      console.log(`   Alt text: "${item.altText}"\n`);
    });
  }

  console.log('='.repeat(80));

  // Exit with error code if there are issues
  if (issuesCount > 0) {
    console.log(`\n❌ Found ${issuesCount} accessibility issues that need fixing.`);
    console.log('📖 See ACCESSIBILITY_IMPLEMENTATION_GUIDE.md for alt text guidelines.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All images have proper alt text! Great job!\n');
    process.exit(0);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Scanning for image tags in', SRC_DIR);
  console.log('This may take a moment...\n');

  const files = scanDirectory(SRC_DIR);
  console.log(`Found ${files.length} TSX/JSX files to scan.\n`);

  files.forEach(file => scanFile(file));

  printResults();
}

// Run the script
main();
