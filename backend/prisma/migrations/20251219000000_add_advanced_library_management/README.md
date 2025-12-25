# Migration: Add Advanced Library Management

**Date:** 2025-12-19
**Type:** Schema Extension

## Overview

This migration adds comprehensive advanced library management features including multi-file game support, ROM version tracking, BIOS management enhancements, and saved search functionality.

## Changes

### 1. Game Region Support

- **New Enum:** `GameRegion`
  - Values: USA, EUR, JPN, KOR, CHN, BRA, AUS, WORLD, UNK
  - Used for tracking game regions and ROM versions

### 2. Multi-File Game Support

Extended the `games` table with:
- `parent_game_id`: References parent game for multi-disc/file games
- `file_number`: Disc/file number (1, 2, 3, etc.)
- `is_multi_file`: Boolean flag indicating if game is part of a multi-file set

**Use Cases:**
- PlayStation multi-disc games (Final Fantasy VII, Metal Gear Solid)
- Multi-part ROM archives
- Game compilations split across files

### 3. ROM Version Tracking

Extended the `games` table with:
- `region`: GameRegion enum (default: USA)
- `revision`: ROM revision identifier (Rev A, Rev B, v1.0, etc.)
- `version_notes`: Text notes about version-specific changes

**New Table:** `game_versions`
- Stores alternate ROM versions per game
- Fields: versionName, region, revision, romPath, md5Hash, fileSize
- Supports preferred version selection with `is_preferred` flag
- Includes release dates and change notes

### 4. BIOS File Management Enhancements

Extended the `bios_files` table with:
- `file_size`: BIOS file size in bytes
- `description`: What the BIOS is for
- `region`: Regional variant (USA, JPN, EUR, etc.)
- `version`: BIOS version identifier
- `verified`: MD5 verification status
- `uploaded_by`: User ID who uploaded the BIOS

### 5. Saved Search Functionality

**New Table:** `saved_searches`
- Allows users to save complex search queries
- Supports full-text search terms
- Filter arrays: systems, genres, developers, publishers
- Date range filters: yearFrom, yearTo
- Player count filter

## Indexes

Added indexes for optimal query performance:
- `games.parent_game_id` - For multi-file game queries
- `game_versions.game_id` - For version lookup
- `game_versions.region` - For region-based filtering
- `saved_searches.user_id` - For user's saved searches

## Foreign Keys

- `games.parent_game_id` → `games.id` (CASCADE delete)
- `game_versions.game_id` → `games.id` (CASCADE delete)
- `saved_searches.user_id` → `users.id` (CASCADE delete)

## Backwards Compatibility

- All new columns in existing tables are nullable or have defaults
- Existing data remains unchanged
- BIOS file extensions use conditional logic to avoid conflicts

## Related Features

This migration supports the following application features:

1. **Advanced Search & Filter**
   - Full-text search across multiple game fields
   - Saved search queries for quick access
   - Complex filter combinations

2. **ROM Version Management**
   - Multiple ROM versions per game (different regions, revisions)
   - Preferred version selection
   - MD5 verification for integrity

3. **Multi-File Game Support**
   - Parent-child relationships for multi-disc games
   - Automatic disc number tracking
   - Unified game library display

4. **Enhanced BIOS Management**
   - Detailed BIOS metadata
   - Regional variants
   - Verification status tracking
   - Upload attribution

## Testing

After applying this migration, verify:

1. Existing games are not affected
2. New game uploads include region/version fields
3. Multi-file game linking works correctly
4. BIOS upload and verification functions properly
5. Saved searches persist and execute correctly

## Rollback

To rollback this migration:
```sql
-- Drop new tables
DROP TABLE IF EXISTS "saved_searches";
DROP TABLE IF EXISTS "game_versions";

-- Remove new columns from games
ALTER TABLE "games"
  DROP COLUMN IF EXISTS "parent_game_id",
  DROP COLUMN IF EXISTS "file_number",
  DROP COLUMN IF EXISTS "is_multi_file",
  DROP COLUMN IF EXISTS "region",
  DROP COLUMN IF EXISTS "revision",
  DROP COLUMN IF EXISTS "version_notes";

-- Drop enum
DROP TYPE IF EXISTS "GameRegion";
```
