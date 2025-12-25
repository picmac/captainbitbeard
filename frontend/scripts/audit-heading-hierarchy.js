#!/usr/bin/env node
/**
 * Heading Hierarchy Audit Script
 *
 * Scans the codebase for heading tags (h1-h6) and verifies they follow
 * proper hierarchy according to WCAG 2.1 Level AA guidelines.
 *
 * Rules:
 * - Each page should have exactly ONE h1
 * - Headings should not skip levels (h1 → h3 without h2)
 * - Headings should be in logical order
 *
 * Usage: node scripts/audit-heading-hierarchy.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PAGES_DIR = path.join(__dirname, '../src/pages');
const EXCLUDED_DIRS = ['node_modules', 'build', 'dist', '.git'];

// Results tracking
const results = {
  totalPages: 0,
  pagesWithIssues: [],
  pagesWithoutIssues: [],
  globalIssues: {
    multipleH1: [],
    noH1: [],
    skippedLevels: [],
    outOfOrder: [],
  },
};

/**
 * Extract headings from file content
 */
function extractHeadings(content) {
  const headings = [];

  // Match h1-h6 tags (including className and other attributes)
  // This is a simplified regex and may not catch all cases
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gis;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2]
      .replace(/<[^>]+>/g, '') // Remove inner HTML tags
      .replace(/\{[^}]+\}/g, '[dynamic]') // Replace JSX expressions with [dynamic]
      .trim();

    const lineNumber = content.substring(0, match.index).split('\n').length;

    headings.push({
      level,
      text: text.substring(0, 50), // Truncate long text
      lineNumber,
      fullMatch: match[0].substring(0, 100) + (match[0].length > 100 ? '...' : ''),
    });
  }

  return headings;
}

/**
 * Check for multiple h1 elements
 */
function checkMultipleH1(headings) {
  const h1Count = headings.filter(h => h.level === 1).length;
  return h1Count > 1 ? h1Count : null;
}

/**
 * Check for missing h1
 */
function checkMissingH1(headings) {
  const h1Count = headings.filter(h => h.level === 1).length;
  return h1Count === 0;
}

/**
 * Check for skipped heading levels
 */
function checkSkippedLevels(headings) {
  const skipped = [];

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1];
    const curr = headings[i];

    // If we jump more than 1 level down (e.g., h1 → h3)
    if (curr.level > prev.level + 1) {
      skipped.push({
        from: prev,
        to: curr,
        issue: `Skipped from h${prev.level} to h${curr.level}`,
      });
    }
  }

  return skipped.length > 0 ? skipped : null;
}

/**
 * Check for headings out of logical order
 * (e.g., h3 before h2, or h2 before h1)
 */
function checkOutOfOrder(headings) {
  const outOfOrder = [];
  let maxLevelSeen = 0;

  for (const heading of headings) {
    // First heading should ideally be h1
    if (maxLevelSeen === 0 && heading.level > 1) {
      outOfOrder.push({
        heading,
        issue: `Page starts with h${heading.level} instead of h1`,
      });
    }

    maxLevelSeen = Math.max(maxLevelSeen, heading.level);
  }

  return outOfOrder.length > 0 ? outOfOrder : null;
}

/**
 * Analyze a single page file
 */
function analyzePage(filePath) {
  results.totalPages++;

  const content = fs.readFileSync(filePath, 'utf-8');
  const headings = extractHeadings(content);
  const relativePath = path.relative(process.cwd(), filePath);

  const pageIssues = {
    file: relativePath,
    headings,
    issues: [],
  };

  // Check for multiple h1s
  const multipleH1 = checkMultipleH1(headings);
  if (multipleH1) {
    const h1s = headings.filter(h => h.level === 1);
    pageIssues.issues.push({
      type: 'multiple_h1',
      severity: 'error',
      message: `Found ${multipleH1} h1 elements (should be exactly 1)`,
      headings: h1s,
    });
    results.globalIssues.multipleH1.push(pageIssues.file);
  }

  // Check for missing h1
  if (checkMissingH1(headings)) {
    pageIssues.issues.push({
      type: 'missing_h1',
      severity: 'error',
      message: 'No h1 element found (each page should have exactly 1)',
    });
    results.globalIssues.noH1.push(pageIssues.file);
  }

  // Check for skipped levels
  const skippedLevels = checkSkippedLevels(headings);
  if (skippedLevels) {
    pageIssues.issues.push({
      type: 'skipped_levels',
      severity: 'warning',
      message: 'Heading levels are skipped',
      details: skippedLevels,
    });
    results.globalIssues.skippedLevels.push(pageIssues.file);
  }

  // Check for out of order
  const outOfOrder = checkOutOfOrder(headings);
  if (outOfOrder) {
    pageIssues.issues.push({
      type: 'out_of_order',
      severity: 'warning',
      message: 'Headings may be out of logical order',
      details: outOfOrder,
    });
    results.globalIssues.outOfOrder.push(pageIssues.file);
  }

  // Store results
  if (pageIssues.issues.length > 0) {
    results.pagesWithIssues.push(pageIssues);
  } else {
    results.pagesWithoutIssues.push(pageIssues);
  }
}

/**
 * Print results
 */
function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('HEADING HIERARCHY AUDIT REPORT');
  console.log('='.repeat(80) + '\n');

  console.log(`📊 SUMMARY:`);
  console.log(`  Total pages scanned: ${results.totalPages}`);
  console.log(`  ✅ Pages without issues: ${results.pagesWithoutIssues.length}`);
  console.log(`  ⚠️  Pages with issues: ${results.pagesWithIssues.length}`);
  console.log(`  ❌ Multiple h1s: ${results.globalIssues.multipleH1.length}`);
  console.log(`  ❌ Missing h1: ${results.globalIssues.noH1.length}`);
  console.log(`  ⚠️  Skipped levels: ${results.globalIssues.skippedLevels.length}`);
  console.log(`  ⚠️  Out of order: ${results.globalIssues.outOfOrder.length}\n`);

  const successRate = results.totalPages > 0
    ? ((results.pagesWithoutIssues.length / results.totalPages) * 100).toFixed(1)
    : 0;

  console.log(`  Success Rate: ${successRate}%\n`);

  // Print pages with issues
  if (results.pagesWithIssues.length > 0) {
    console.log('⚠️  PAGES WITH ISSUES:');
    console.log('='.repeat(80) + '\n');

    results.pagesWithIssues.forEach((page, i) => {
      console.log(`${i + 1}. ${page.file}`);
      console.log('-'.repeat(80));

      // Show heading structure
      console.log('Heading Structure:');
      page.headings.forEach(h => {
        const indent = '  '.repeat(h.level - 1);
        console.log(`  ${indent}h${h.level} (line ${h.lineNumber}): ${h.text}`);
      });
      console.log('');

      // Show issues
      console.log('Issues:');
      page.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        console.log(`  ${icon} ${issue.message}`);

        if (issue.details) {
          issue.details.forEach(detail => {
            if (detail.from && detail.to) {
              console.log(`     Line ${detail.from.lineNumber}: h${detail.from.level} "${detail.from.text}"`);
              console.log(`     Line ${detail.to.lineNumber}: h${detail.to.level} "${detail.to.text}"`);
              console.log(`     ${detail.issue}`);
            } else if (detail.heading) {
              console.log(`     Line ${detail.heading.lineNumber}: ${detail.issue}`);
            }
          });
        }

        if (issue.headings) {
          issue.headings.forEach(h => {
            console.log(`     Line ${h.lineNumber}: "${h.text}"`);
          });
        }

        console.log('');
      });

      console.log('');
    });
  }

  // Print pages without issues (just list)
  if (results.pagesWithoutIssues.length > 0) {
    console.log('✅ PAGES WITHOUT ISSUES:');
    console.log('-'.repeat(80));
    results.pagesWithoutIssues.forEach((page, i) => {
      console.log(`${i + 1}. ${page.file} (${page.headings.length} headings)`);
    });
    console.log('\n');
  }

  console.log('='.repeat(80));

  // Exit with error code if there are issues
  if (results.pagesWithIssues.length > 0) {
    console.log(`\n❌ Found issues in ${results.pagesWithIssues.length} page(s).`);
    console.log('📖 See ACCESSIBILITY_IMPLEMENTATION_GUIDE.md for heading hierarchy guidelines.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All pages have proper heading hierarchy! Great job!\n');
    process.exit(0);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Scanning heading hierarchy in', PAGES_DIR);
  console.log('This may take a moment...\n');

  const files = fs.readdirSync(PAGES_DIR)
    .filter(f => f.endsWith('.tsx'))
    .map(f => path.join(PAGES_DIR, f));

  console.log(`Found ${files.length} page files to scan.\n`);

  files.forEach(file => analyzePage(file));

  printResults();
}

// Run the script
main();
