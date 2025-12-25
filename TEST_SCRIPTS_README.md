# Test Scripts - Enhanced Media Management

## 🚀 Quick Start (Recommended)

The fastest way to test everything:

```bash
# Make scripts executable
chmod +x *.sh

# Run complete setup and testing
./setup-and-test.sh
```

This will:
1. ✅ Install all dependencies (backend + frontend)
2. ✅ Generate Prisma Client
3. ✅ Apply database migrations
4. ✅ Verify database schema
5. ✅ Test API endpoints
6. ✅ Build frontend

**Time:** ~2-3 minutes

---

## 📜 Available Scripts

### 1. `setup-and-test.sh` - Complete Setup & Testing

**What it does:**
- Installs npm dependencies for backend and frontend
- Generates Prisma Client with new schema
- Applies database migrations
- Verifies all new columns and tables exist
- Tests API health and route registration
- Builds frontend to verify no compile errors

**Usage:**
```bash
./setup-and-test.sh
```

**When to use:**
- First time setup
- After pulling new changes
- To verify everything is working

---

### 2. `test-database-schema.sh` - Database Verification

**What it does:**
- Connects to PostgreSQL
- Verifies all new columns exist in `games` and `screenshots` tables
- Verifies `GameRegion` and `ScreenshotCategory` enums exist
- Checks all 10 screenshot category values
- Verifies `game_versions` and `saved_searches` tables exist

**Usage:**
```bash
# Using DATABASE_URL from environment
./test-database-schema.sh

# Or provide DATABASE_URL directly
./test-database-schema.sh "postgresql://user:pass@localhost:5432/captain_bitbeard"
```

**Requires:**
- `psql` command-line tool installed
- Valid DATABASE_URL

**Example output:**
```
✅ background_music_url column... PASS
✅ animated_cover_url column... PASS
✅ category column... PASS
✅ ScreenshotCategory enum exists... PASS
...
✅ All schema checks passed! (18/18)
```

---

### 3. `test-backend-api.sh` - API Endpoint Testing

**What it does:**
- Tests that backend server is running
- Verifies all media API routes are registered
- Tests authentication middleware
- Checks each endpoint responds correctly

**Usage:**
```bash
# Interactive mode (will prompt for token and game ID)
./test-backend-api.sh

# Or provide directly
./test-backend-api.sh YOUR_AUTH_TOKEN GAME_ID
```

**How to get auth token:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173 and login
4. Open browser DevTools (F12)
5. Go to Application → Local Storage
6. Copy the `token` value

**Example output:**
```
Testing: Get screenshots by category... ✅ PASS (HTTP 200)
Testing: Upload trailer endpoint... ✅ PASS (HTTP 400)
Testing: Delete music endpoint... ✅ PASS (HTTP 401)
...
✅ All tests passed! (9/9)
```

---

### 4. `quick-start.sh` - Start Servers

**What it does:**
- Starts backend server (port 3001)
- Starts frontend server (port 5173)
- Keeps both running until you press Ctrl+C
- Automatically stops both servers on exit

**Usage:**
```bash
./quick-start.sh
```

**What you'll see:**
```
🚀 Starting backend server...
⏳ Waiting for backend to be ready...
🚀 Starting frontend server...

✅ Servers are running!

📡 Backend:  http://localhost:3001
🌐 Frontend: http://localhost:5173

Press Ctrl+C to stop servers
```

---

## 📋 Complete Testing Workflow

**Step 1: Initial Setup**
```bash
chmod +x *.sh
./setup-and-test.sh
```

**Step 2: Verify Database** (optional)
```bash
./test-database-schema.sh
```

**Step 3: Start Servers**
```bash
./quick-start.sh
```

**Step 4: Manual Testing**
- Open http://localhost:5173
- Login as admin
- Go to any game details page
- Click "🎬 UPLOAD MEDIA"
- Test each upload type:
  - Trailer Video (MP4, WebM, etc.)
  - Background Music (MP3, OGG, etc.)
  - Animated Cover (WebP, APNG, GIF)
  - Screenshots (with categories)

**Step 5: Test API** (optional)
```bash
# In a new terminal (while servers are running)
./test-backend-api.sh YOUR_TOKEN GAME_ID
```

---

## 🐛 Troubleshooting

### "Permission denied" when running scripts

```bash
chmod +x *.sh
```

### "Backend is not running" error

```bash
# Start backend first
cd backend && npm run dev

# Then run tests in another terminal
```

### "DATABASE_URL not provided" error

```bash
# Set environment variable
export DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Or provide directly
./test-database-schema.sh "postgresql://..."
```

### "psql: command not found" error

```bash
# Install PostgreSQL client

# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql
```

### Tests failing with "Route not found (404)"

Check that media routes are mounted in `backend/src/routes/index.ts`:
```typescript
import mediaRoutes from './media.routes';
router.use('/media', mediaRoutes);
```

### Migration errors

```bash
cd backend

# Check migration status
npx prisma migrate status

# If needed, reset and reapply
npx prisma migrate reset
npx prisma migrate deploy
```

---

## 📊 Expected Results

After running all tests, you should see:

**Database Schema:** ✅ 18 checks passed
- 3 new columns in `games` table
- 2 new columns in `screenshots` table
- 2 new enums (GameRegion, ScreenshotCategory)
- 10 screenshot category values
- 2 new tables (game_versions, saved_searches)

**Backend API:** ✅ 9 endpoints registered
- GET /api/media/games/:id/media/screenshots
- POST /api/media/games/:id/media/trailer
- POST /api/media/games/:id/media/music
- POST /api/media/games/:id/media/animated-cover
- POST /api/media/games/:id/media/screenshot
- DELETE /api/media/games/:id/media/trailer
- DELETE /api/media/games/:id/media/music
- DELETE /api/media/games/:id/media/animated-cover
- PATCH /api/media/screenshots/:id

**Frontend:** ✅ Builds without errors
- All components compile
- No TypeScript errors
- All imports resolved

---

## 🎯 What's Being Tested

### Automated Tests:
- [x] Database schema is correct
- [x] API routes are registered
- [x] Authentication middleware works
- [x] Frontend builds successfully
- [x] Backend server starts without errors

### Manual Tests (you need to do):
- [ ] Upload trailer video works
- [ ] Upload background music works
- [ ] Upload animated cover works
- [ ] Upload categorized screenshot works
- [ ] 3D box art viewer displays and rotates
- [ ] Enhanced video player controls work
- [ ] Background music player works
- [ ] Screenshot category filtering works
- [ ] Lightbox modal works

**For detailed manual testing checklist, see:** `TESTING_ENHANCED_MEDIA.md`

---

## 📞 Support

If tests fail or you encounter issues:

1. Check the troubleshooting section above
2. Review error messages carefully
3. Check backend console for detailed errors
4. Verify all prerequisites are installed (Node.js, PostgreSQL, MinIO)
5. Ensure environment variables are set correctly

**Most common issues:**
- Database not running → Start PostgreSQL
- MinIO not running → Start MinIO
- Wrong DATABASE_URL → Check .env file
- Missing dependencies → Run `npm install`
- Outdated Prisma Client → Run `npx prisma generate`

---

**Ready to test?** Run: `./setup-and-test.sh` 🚀
