# Testing Checklist - Enhanced Media Management Feature

## 🐛 Bugs Fixed Before Testing

### Critical Fixes:
1. ✅ **BoxArt3DViewer.tsx** - Fixed incorrect `useState` → `useEffect` for auto-rotate
2. ✅ **BoxArt3DViewer.tsx** - Added missing `useEffect` import
3. ✅ Verified all backend imports (prisma, minio, crypto, path)
4. ✅ Verified all frontend imports and component props
5. ✅ Confirmed multer is in package.json dependencies

---

## 📋 Pre-Testing Setup

### Backend Setup:
```bash
cd backend

# 1. Install dependencies (if needed)
npm install

# 2. Generate Prisma Client (WICHTIG!)
npx prisma generate

# 3. Apply database migration
npx prisma migrate deploy

# 4. Verify schema is synced
npx prisma migrate status

# 5. Start backend
npm run dev
```

### Frontend Setup:
```bash
cd frontend

# 1. Install dependencies (if needed)
npm install

# 2. Start frontend
npm run dev
```

### Verify Services:
- ✅ Backend running on http://localhost:3001
- ✅ Frontend running on http://localhost:5173
- ✅ PostgreSQL running
- ✅ MinIO running (port 9000)

---

## 🧪 Testing Plan

### Phase 1: Database Schema Testing

**Test 1.1: Verify New Columns**
```sql
-- Connect to PostgreSQL
\c captainbitbeard_db

-- Check games table
\d games

-- Should see:
-- - background_music_url
-- - animated_cover_url
-- - region (with default)

-- Check screenshots table
\d screenshots

-- Should see:
-- - category (ScreenshotCategory enum)
-- - caption (nullable)
```

**Test 1.2: Verify Enums**
```sql
-- Check ScreenshotCategory enum
SELECT unnest(enum_range(NULL::\"ScreenshotCategory\"));

-- Should return:
-- GAMEPLAY, TITLE_SCREEN, MENU, CUTSCENE, BOSS_FIGHT,
-- ENDING, CREDITS, EASTER_EGG, MULTIPLAYER, CUSTOM
```

**Expected Result:**
- [ ] All new columns exist in games table
- [ ] All new columns exist in screenshots table
- [ ] ScreenshotCategory enum has all 10 values

---

### Phase 2: Backend API Testing

**Test 2.1: Health Check**
```bash
curl http://localhost:3001/api
# Expected: {"name":"Captain Bitbeard API","version":"1.0.0","status":"operational"}
```

**Test 2.2: Upload Trailer (requires auth token)**
```bash
# Get auth token first
TOKEN="your_admin_token_here"

# Upload a test video
curl -X POST http://localhost:3001/api/media/games/{gameId}/media/trailer \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@/path/to/test.mp4"

# Expected: {"message":"Trailer uploaded successfully","videoUrl":"..."}
```

**Test 2.3: Upload Background Music**
```bash
curl -X POST http://localhost:3001/api/media/games/{gameId}/media/music \
  -H "Authorization: Bearer $TOKEN" \
  -F "music=@/path/to/test.mp3"

# Expected: {"message":"Background music uploaded successfully","musicUrl":"..."}
```

**Test 2.4: Upload Animated Cover**
```bash
curl -X POST http://localhost:3001/api/media/games/{gameId}/media/animated-cover \
  -H "Authorization: Bearer $TOKEN" \
  -F "cover=@/path/to/test.webp"

# Expected: {"message":"Animated cover uploaded successfully","coverUrl":"..."}
```

**Test 2.5: Upload Categorized Screenshot**
```bash
curl -X POST http://localhost:3001/api/media/games/{gameId}/media/screenshot \
  -H "Authorization: Bearer $TOKEN" \
  -F "screenshot=@/path/to/test.jpg" \
  -F "category=BOSS_FIGHT" \
  -F "caption=Epic boss battle"

# Expected: {"message":"Screenshot uploaded successfully","screenshot":{...}}
```

**Test 2.6: Get Screenshots by Category**
```bash
curl http://localhost:3001/api/media/games/{gameId}/media/screenshots?category=BOSS_FIGHT \
  -H "Authorization: Bearer $TOKEN"

# Expected: {"screenshots":[...]}
```

**Expected Results:**
- [ ] All upload endpoints work
- [ ] Files are stored in MinIO
- [ ] URLs are returned correctly
- [ ] Categories are saved correctly
- [ ] Auth middleware blocks unauthenticated requests
- [ ] requireAdmin blocks non-admin users

---

### Phase 3: Frontend Component Testing

#### Test 3.1: EnhancedVideoPlayer Component

**Manual Test Steps:**
1. Navigate to a game with `videoUrl` in GameDetailsPage
2. Video player should appear in "🎬 TRAILER" section

**Verify:**
- [ ] Video loads and displays poster image
- [ ] Play button overlay appears when paused
- [ ] Click play button → video starts
- [ ] Hover over video → controls appear
- [ ] Progress bar updates as video plays
- [ ] Volume slider works
- [ ] Mute button works
- [ ] Fullscreen button works
- [ ] Time display shows current/total time (format: MM:SS)
- [ ] Controls auto-hide after 2 seconds

**Edge Cases:**
- [ ] Video without poster shows fallback
- [ ] Long videos (>1 hour) display time correctly
- [ ] Seeking works smoothly

---

#### Test 3.2: BackgroundMusicPlayer Component

**Manual Test Steps:**
1. Navigate to a game with `backgroundMusicUrl`
2. Floating music player should appear bottom-right

**Verify:**
- [ ] Player appears in bottom-right corner
- [ ] Music does NOT auto-play by default (autoPlay=false)
- [ ] Click play → music starts
- [ ] Progress bar animates
- [ ] Volume slider works
- [ ] Mute button works
- [ ] Loop icon shows (🔁) when loop is enabled
- [ ] Minimize button (▬) works → player collapses to small widget
- [ ] Minimized player shows only 🎵 icon
- [ ] Click minimize again → player expands
- [ ] "Now Playing" indicator pulses when playing

**Edge Cases:**
- [ ] Player persists when scrolling page
- [ ] Player doesn't block other UI elements
- [ ] Music continues playing when navigating away (if SPA)

---

#### Test 3.3: CategorizedScreenshotGallery Component

**Manual Test Steps:**
1. Upload screenshots with different categories via admin modal
2. Navigate to game details page

**Verify:**
- [ ] Screenshot gallery appears in "📸 SCREENSHOTS" section
- [ ] Category filter tabs appear at top
- [ ] "All" tab shows total count
- [ ] Each category tab shows count in parentheses
- [ ] Click category tab → only screenshots in that category show
- [ ] Screenshots display in grid (2-4 columns based on screen size)
- [ ] Category badge appears top-left of each screenshot
- [ ] Hover over screenshot → zoom effect + 🔍 icon
- [ ] Click screenshot → lightbox modal opens
- [ ] Lightbox shows full-size image
- [ ] Lightbox shows category and date
- [ ] Lightbox shows caption if available
- [ ] Click "✕ CLOSE" or outside modal → lightbox closes

**Edge Cases:**
- [ ] Empty category shows "No screenshots in this category"
- [ ] Screenshots without captions don't show caption area
- [ ] Very long captions are truncated (line-clamp-2)

---

#### Test 3.4: BoxArt3DViewer Component

**Manual Test Steps:**
1. Navigate to a game with `coverUrl` (and optionally `boxArtUrl`)
2. 3D Box Art Viewer should appear in "📦 3D BOX ART" section

**Verify:**
- [ ] Box displays with front cover
- [ ] Box auto-rotates smoothly (360° loop)
- [ ] Click and drag → manual rotation works
- [ ] Auto-rotation stops when dragging starts
- [ ] "📦 FRONT" button → rotates to front view (rotateY=0)
- [ ] "📦 BACK" button → rotates to back view (rotateY=180) (if backCoverUrl exists)
- [ ] "📦 SPINE" button → rotates to spine view (rotateY=90) (if spineUrl exists)
- [ ] "▶ AUTO" button → toggles auto-rotation
- [ ] Button shows "⏸ AUTO" when auto-rotating
- [ ] "🔄 RESET" button → returns to default view
- [ ] Instruction text updates based on state
- [ ] Box has 3D perspective effect
- [ ] All sides have proper borders

**Edge Cases:**
- [ ] Game without coverUrl → shows "No box art available" message
- [ ] Game without backCoverUrl → BACK button doesn't appear
- [ ] Game without spineUrl → SPINE button doesn't appear
- [ ] Rapid dragging doesn't break rotation

---

#### Test 3.5: EnhancedMediaUploadModal Component

**Manual Test Steps (Admin Only):**
1. Login as admin
2. Navigate to game details page
3. Click "🎬 UPLOAD MEDIA" button

**Verify:**
- [ ] Modal appears with title "📤 UPLOAD MEDIA - {gameName}"
- [ ] Four media type buttons appear (Trailer, Music, Animated Cover, Screenshot)
- [ ] Default selection is "Screenshot"
- [ ] Clicking media type button highlights it (bg-pirate-gold)

**Test Each Media Type:**

**Screenshot Upload:**
- [ ] Category dropdown appears (only for screenshots)
- [ ] Caption input appears (only for screenshots)
- [ ] All 10 categories appear in dropdown
- [ ] File input accepts: .jpg, .jpeg, .png, .webp, .gif
- [ ] Max size shows "5MB"
- [ ] Select file → file name and size appear
- [ ] Click "✓ UPLOAD" → progress bar animates
- [ ] Success → alert "✅ {message}"
- [ ] Modal closes
- [ ] Screenshot appears in gallery

**Trailer Video Upload:**
- [ ] Category/caption inputs disappear
- [ ] File input accepts: .mp4, .webm, .mkv, .avi, .mov
- [ ] Max size shows "500MB"
- [ ] Upload works
- [ ] Video player appears after upload

**Background Music Upload:**
- [ ] File input accepts: .mp3, .ogg, .wav, .m4a, .flac
- [ ] Max size shows "50MB"
- [ ] Upload works
- [ ] Music player appears bottom-right after upload

**Animated Cover Upload:**
- [ ] File input accepts: .webp, .apng, .gif
- [ ] Max size shows "10MB"
- [ ] Upload works
- [ ] Animated cover displays in main cover area

**Edge Cases:**
- [ ] Upload without selecting file → shows error
- [ ] Invalid file format → backend rejects with error message
- [ ] Click "CANCEL" → modal closes without upload
- [ ] Close modal with ✕ → modal closes
- [ ] Progress bar animates smoothly (0% → 100%)

---

### Phase 4: Integration Testing

**Test 4.1: Full Game Details Page**

Navigate to a game with ALL media types:
- coverUrl
- boxArtUrl
- videoUrl
- backgroundMusicUrl
- animatedCoverUrl (if available)
- Multiple screenshots in different categories

**Verify Page Layout:**
- [ ] Header with game title
- [ ] "BACK TO LIBRARY" button
- [ ] Cover image (or 3D box art)
- [ ] Metadata display
- [ ] Action buttons (Play, Favorite, Add to Collection)
- [ ] Admin buttons (if admin): Fetch Metadata, Add Screenshots, Upload Media, Delete
- [ ] 3D Box Art section (if cover exists)
- [ ] Screenshots section with category filters
- [ ] Trailer section with enhanced video player
- [ ] Game Version Manager section
- [ ] Background music player floating bottom-right
- [ ] Add to Collection modal (if triggered)
- [ ] Screenshot upload modal (if triggered)
- [ ] Enhanced media upload modal (if triggered)

**Verify No Conflicts:**
- [ ] Background music player doesn't overlap video controls
- [ ] Lightbox modal has highest z-index
- [ ] Upload modals appear above all content
- [ ] No layout shifts when components load
- [ ] All modals can be closed

**Test 4.2: Responsive Design**

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Verify:**
- [ ] Screenshot grid adjusts columns (4 → 3 → 2 → 1)
- [ ] Video player remains responsive
- [ ] 3D Box Art works on touch devices
- [ ] Modals are scrollable on small screens
- [ ] Music player doesn't cover important content

---

### Phase 5: Data Persistence Testing

**Test 5.1: Verify MinIO Storage**

Access MinIO console (http://localhost:9001):
```bash
# Login to MinIO
# Navigate to 'games' bucket

# Verify folders exist:
videos/trailers/{gameId}/
music/{gameId}/
covers/animated/{gameId}/
screenshots/{gameId}/{category}/
```

**Expected:**
- [ ] All uploaded files are in correct folders
- [ ] Files have unique names (timestamp + random hash)
- [ ] Files are accessible via presigned URLs

**Test 5.2: Verify Database Persistence**

```sql
-- Check game has media URLs
SELECT id, title, video_url, background_music_url, animated_cover_url
FROM games
WHERE id = 'test-game-id';

-- Check screenshots have categories
SELECT id, category, caption, created_at
FROM screenshots
WHERE game_id = 'test-game-id'
ORDER BY category, created_at;
```

**Expected:**
- [ ] All URLs are saved in database
- [ ] Screenshots have correct categories
- [ ] Captions are saved properly

---

### Phase 6: Error Handling Testing

**Test 6.1: Invalid File Uploads**
- [ ] Upload .exe file as video → backend rejects
- [ ] Upload .txt file as music → backend rejects
- [ ] Upload oversized file → shows error
- [ ] Upload without authentication → 401 error
- [ ] Upload as non-admin → 403 error

**Test 6.2: Missing Media**
- [ ] Game without videoUrl → video section doesn't appear
- [ ] Game without backgroundMusicUrl → music player doesn't appear
- [ ] Game without screenshots → gallery doesn't appear
- [ ] Game without coverUrl → 3D viewer shows fallback message

**Test 6.3: Network Errors**
- [ ] Stop backend → upload shows error
- [ ] Slow network → progress bar shows correctly
- [ ] Interrupted upload → proper error message

---

### Phase 7: Performance Testing

**Test 7.1: Large Files**
- [ ] Upload 100MB video → works smoothly
- [ ] Upload 30MB music file → works smoothly
- [ ] Upload 100 screenshots → gallery loads without lag

**Test 7.2: Media Playback**
- [ ] 4K video plays smoothly
- [ ] FLAC audio plays without stuttering
- [ ] Large animated GIF loads and plays

**Test 7.3: 3D Box Art**
- [ ] Rotation is smooth (60 FPS)
- [ ] No jank when dragging
- [ ] Auto-rotation doesn't consume excessive CPU

---

## ✅ Sign-Off Checklist

Before marking feature as complete:

### Backend:
- [ ] All migrations applied successfully
- [ ] All API endpoints tested and working
- [ ] File uploads to MinIO working
- [ ] Authentication/authorization working
- [ ] No TypeScript errors in backend code
- [ ] No console errors in backend logs

### Frontend:
- [ ] All components render without errors
- [ ] All uploads working through UI
- [ ] All modals working
- [ ] Responsive design works
- [ ] No TypeScript errors in frontend code
- [ ] No console errors in browser
- [ ] No React warnings

### Integration:
- [ ] Backend + Frontend working together
- [ ] MinIO + Backend integration working
- [ ] Database + Backend integration working
- [ ] All media types supported end-to-end

### User Experience:
- [ ] UI is intuitive
- [ ] No broken layouts
- [ ] No missing images/icons
- [ ] Loading states show properly
- [ ] Error messages are clear
- [ ] Success messages appear

---

## 🐛 Known Issues / Limitations

Document any issues found during testing:

1. **Issue:** _____________
   - **Severity:** Low / Medium / High / Critical
   - **Steps to Reproduce:** _____________
   - **Expected:** _____________
   - **Actual:** _____________
   - **Status:** Open / Fixed / Won't Fix

---

## 📝 Testing Notes

Document any observations or notes during testing:

- Date: __________
- Tester: __________
- Environment: __________
- Notes: __________

---

## 🎯 Next Steps After Testing

Once testing is complete and all boxes are checked:

1. [ ] Fix any critical bugs found
2. [ ] Document any known limitations
3. [ ] Create git commit with all changes
4. [ ] Push to repository
5. [ ] Create pull request (if applicable)
6. [ ] Update main branch
7. [ ] Deploy to production (if applicable)

---

**Testing completed by:** __________

**Date:** __________

**Approved for deployment:** [ ] Yes [ ] No

**Notes:** __________
