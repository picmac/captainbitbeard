# Database Migration Guide - Advanced Library Management

## Migration Created: `20251219000000_add_advanced_library_management`

### Overview

A comprehensive database migration has been created to support advanced library management features including multi-file games, ROM version tracking, BIOS management, and saved searches.

### Files Created

1. **backend/prisma/migrations/migration_lock.toml**
   - Prisma migration tracking file
   - Specifies PostgreSQL as the database provider

2. **backend/prisma/migrations/20251219000000_add_advanced_library_management/migration.sql**
   - Complete SQL migration with all schema changes
   - Includes conditional logic for backwards compatibility

3. **backend/prisma/migrations/20251219000000_add_advanced_library_management/README.md**
   - Detailed documentation of all changes
   - Rollback instructions included

### What This Migration Adds

#### 1. New Database Objects

- **GameRegion Enum**: USA, EUR, JPN, KOR, CHN, BRA, AUS, WORLD, UNK
- **game_versions Table**: Tracks alternate ROM versions per game
- **saved_searches Table**: Saves user search queries with filters

#### 2. Games Table Extensions

Added columns for multi-file game support:
- `parent_game_id` - Links child game files to parent
- `file_number` - Disc/file number (1, 2, 3, etc.)
- `is_multi_file` - Boolean flag for multi-file games

Added columns for version tracking:
- `region` - GameRegion enum (default: USA)
- `revision` - ROM revision (Rev A, Rev B, v1.0, etc.)
- `version_notes` - Version-specific notes

#### 3. BIOS Files Table Extensions

Enhanced with:
- `file_size` - File size in bytes
- `description` - BIOS description
- `region` - Regional variant
- `version` - BIOS version identifier
- `verified` - MD5 verification status
- `uploaded_by` - Uploader user ID

### How to Apply This Migration

#### Development Environment

If you have Node.js and Prisma CLI installed locally:

```bash
cd backend
npx prisma migrate deploy
```

This will:
1. Read the migration files
2. Apply the SQL changes to your database
3. Update the migration tracking table

#### Production/CI/CD Environment

The migration will be automatically applied when the backend starts if you have Prisma's migration auto-deployment enabled.

Alternatively, run manually:

```bash
cd backend
npx prisma migrate deploy
```

#### Verify Migration

After applying, verify with:

```bash
npx prisma db pull  # Sync schema with database
npx prisma generate  # Regenerate Prisma client
```

### Database Impact

**Estimated Migration Time**: < 1 second (for small databases)

**Downtime Required**: No - all changes are additive with defaults

**Data Loss Risk**: None - existing data is preserved

### Features Enabled

Once migrated, these application features become available:

1. **Advanced Search & Filter**
   - Full-text search across game fields
   - Save complex search queries
   - Multi-criteria filtering

2. **Multi-File Game Support**
   - Link multi-disc games (PSX, Dreamcast, etc.)
   - Automatic file number tracking
   - Unified library display

3. **ROM Version Management**
   - Upload multiple ROM versions per game
   - Regional variants (USA, EUR, JPN, etc.)
   - Preferred version selection
   - Revision tracking (Rev A, Rev B, v1.0)

4. **Enhanced BIOS Management**
   - Detailed BIOS metadata
   - MD5 verification
   - Regional variants
   - Version tracking

### Rollback

If you need to rollback this migration:

```bash
cd backend
npx prisma migrate rollback
```

Or run the SQL rollback commands found in the migration README.

### Next Steps

1. **Commit the migration files** to version control:
   ```bash
   git add backend/prisma/migrations/
   git commit -m "Add database migration for advanced library management"
   ```

2. **Apply the migration** in your development environment

3. **Regenerate Prisma client**:
   ```bash
   cd backend
   npx prisma generate
   ```

4. **Test the new features**:
   - Try creating saved searches
   - Upload multi-disc games
   - Add ROM versions
   - Upload and verify BIOS files

### Troubleshooting

**Issue**: Migration fails with "column already exists"
- **Solution**: Some columns may already exist. The migration includes conditional logic to handle this.

**Issue**: Prisma client out of sync
- **Solution**: Run `npx prisma generate` to regenerate the client

**Issue**: TypeScript errors after migration
- **Solution**: Restart your TypeScript server and rebuild the project

### Support

For issues with this migration, refer to:
- Migration README: `backend/prisma/migrations/20251219000000_add_advanced_library_management/README.md`
- Prisma documentation: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Project schema: `backend/prisma/schema.prisma`
