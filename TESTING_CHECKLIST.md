# 🧪 Captain Bitbeard - Testing Checklist

Quick verification guide for all new features.

---

## ⚡ Quick Start Testing (5 minutes)

### 1. Build & Start
```bash
cd frontend
npm run build
npm run preview
```
Open: http://localhost:4173

### 2. Essential Tests

#### ✅ Upload Features (2 min)
1. Navigate to Admin → Upload ROM
2. Select a ROM file
3. **Expected:** See "🔐 VERIFYING ROM INTEGRITY..."
4. **Expected:** If duplicate, see warning modal
5. Try bulk upload with 3 files
6. **Expected:** See individual progress bars per file

#### ✅ Emulator Features (2 min)
1. Play any game from library
2. Press **F5**
3. **Expected:** Toast "Progress saved to slot 1 (F5)"
4. Press **Shift+F5**
5. **Expected:** Toast "Progress restored from slot 1 (F5)"
6. Open on mobile/tablet
7. **Expected:** See D-Pad and A/B buttons

#### ✅ PWA Features (1 min)
1. Wait 30 seconds on homepage
2. **Expected:** See pirate install prompt "🏴‍☠️ AHOY, MATEY!"
3. Disconnect internet (airplane mode)
4. **Expected:** See "📡 OFFLINE MODE" banner
5. Reconnect internet
6. **Expected:** See "⚓ BACK ONLINE!" message

---

## 📋 Comprehensive Testing (15 minutes)

### Feature Set 1: Enhanced Upload

#### MD5 Duplicate Detection
- [ ] Upload a new ROM → Success
- [ ] Upload the same ROM again → Warning modal appears
- [ ] Modal shows: Title, System, Developer, MD5 hash
- [ ] Click "CANCEL" → Upload cancelled
- [ ] Upload same ROM again, click "UPLOAD ANYWAY" → Upload succeeds

#### Client-Side Validation
- [ ] Select a .txt file → Error: "Invalid file type"
- [ ] Select a 200MB file → Error: "exceeds maximum"
- [ ] Select a 0-byte file → Error: "too small"
- [ ] Select valid .nes file → No error, uploads

#### Per-File Progress
- [ ] Bulk upload 5 ROMs
- [ ] Each file shows: ⏳ Pending initially
- [ ] During upload: 📤 with progress bar (0-100%)
- [ ] After success: ✅
- [ ] If error: ❌ with error message
- [ ] Counter shows: "UPLOADING ROMS (2/5 complete)"

---

### Feature Set 2: Enhanced Emulator

#### Quick Save/Load Shortcuts
- [ ] Play a game
- [ ] Press **H** → Hotkey help shows
- [ ] Hotkey help lists F5-F8 shortcuts
- [ ] Press **F5** → Toast: "Quick Saved... slot 1 (F5)"
- [ ] Progress different location, press **F6** → Slot 2 saved
- [ ] Press **Shift+F5** → Toast: "Quick Loaded... slot 1"
- [ ] Game state restored to F5 save
- [ ] Press **Shift+F6** → Restores F6 save
- [ ] Navigate to Save States page
- [ ] See "Quick Save Slot 1" and "Quick Save Slot 2"

#### Touch Controls (Mobile/Tablet)
- [ ] Open game on mobile device
- [ ] See D-Pad on left side
- [ ] Press ↑ → Character moves up
- [ ] Press ↓ → Character moves down
- [ ] Press ← → Character moves left
- [ ] Press → → Character moves right
- [ ] See A/B/X/Y buttons on right
- [ ] Press A (green) → Jump/confirm action
- [ ] Press B (red) → Back/secondary action
- [ ] See Start/Select buttons at bottom
- [ ] Press Start → Pause menu opens
- [ ] See L/R buttons at top
- [ ] Press L → Shoulder action
- [ ] On desktop → Controls don't appear (expected)

---

### Feature Set 3: PWA & Offline

#### PWA Installation
- [ ] Fresh browser (or clear localStorage)
- [ ] Visit homepage
- [ ] After 30 seconds → Install prompt appears
- [ ] Prompt shows: "🏴‍☠️ AHOY, MATEY!"
- [ ] Lists benefits: Play offline, Faster loading, etc.
- [ ] Click "REMIND LATER" → Prompt closes
- [ ] Refresh page, wait 30s → Prompt appears again
- [ ] Click "NO THANKS" → Prompt closes
- [ ] Refresh page, wait 30s → Prompt doesn't appear (remembered)
- [ ] Clear localStorage, refresh → Prompt appears again
- [ ] Click "⚓ INSTALL APP" → Browser install dialog
- [ ] Install succeeds → App opens in standalone mode

#### Offline Mode Detection
- [ ] Open app online
- [ ] Disconnect internet (airplane mode / network tab)
- [ ] Offline banner appears at top
- [ ] Banner shows: "📡 OFFLINE MODE"
- [ ] Lists available features:
  - ✓ Play cached ROMs offline
  - ✓ View saved game states
  - ✓ Browse your library
  - ✗ Upload new ROMs
- [ ] Try to browse library → Works (cached)
- [ ] Try to play previously played game → Works (ROM cached)
- [ ] Try to upload ROM → Fails (expected, network required)
- [ ] Reconnect internet
- [ ] Banner changes to: "⚓ BACK ONLINE!"
- [ ] After 5 seconds → Banner auto-hides

#### Service Worker Caching
Open DevTools → Application → Cache Storage

- [ ] **google-fonts-cache** exists with Press Start 2P font
- [ ] **emulator-cores-cache** exists (grows as you play games)
- [ ] **emulatorjs-assets-cache** exists with .js/.wasm files
- [ ] **roms-cache** exists with recently played ROMs
- [ ] **images-cache** exists with cover images
- [ ] Play a game → Core added to cache (~500KB)
- [ ] Play different system → Different core cached
- [ ] Check Storage → See cache sizes

#### App Shortcuts
- [ ] Install app (PWA)
- [ ] Right-click app icon (desktop) or long-press (mobile)
- [ ] See shortcuts:
  - Game Library
  - Save States
  - Collections
- [ ] Click "Game Library" → Opens directly to /library
- [ ] Click "Save States" → Opens directly to /save-states

---

## 🎯 Edge Cases

### Upload Edge Cases
- [ ] Upload 50 files at once → All process sequentially
- [ ] Cancel bulk upload mid-way → Already uploaded files remain
- [ ] Upload duplicate with different name → Still detected by MD5
- [ ] Upload .zip ROM → Accepted (supported format)

### Emulator Edge Cases
- [ ] Quick save slot 1, then quick save slot 1 again → Overwrites
- [ ] Quick load empty slot → Toast: "Slot X is empty"
- [ ] F5 while typing in chat (if applicable) → Doesn't save (expected)
- [ ] Touch controls on iPad → Appear (has touch)
- [ ] Touch controls on Surface with pen → May or may not appear

### PWA Edge Cases
- [ ] Install on non-HTTPS site → Warning or fails (expected)
- [ ] Install prompt on Firefox → May not appear (limited support)
- [ ] Offline mode on first visit → Can't cache anything yet
- [ ] Service worker update → Auto-updates on next page load

---

## 🔍 Visual Verification

### Upload UI
```
┌─────────────────────────────┐
│ ❌ Invalid files detected:  │
│                             │
│ test.txt: Invalid file type│
│ huge.bin: File size ... MB │
│ exceeds maximum            │
└─────────────────────────────┘

┌─────────────────────────────┐
│ UPLOADING ROMS (2/5 complete)│
│                             │
│ Mario.nes           ✅      │
│ Zelda.nes           ✅      │
│ Metroid.nes   [=====> ] 67%│
│ Castlevania.nes     ⏳      │
│ MegaMan.nes         ⏳      │
└─────────────────────────────┘
```

### Emulator Hotkeys
```
⌨️ KEYBOARD SHORTCUTS

Menu                    [M]
Hotkeys                 [H]
Save State              [Ctrl + S]
Load State              [Ctrl + L]
─────────────────────────────────
⚡ Quick Save Slot 1-4  [F5-F8]
⚡ Quick Load Slot 1-4  [Shift + F5-F8]
─────────────────────────────────
Screenshot              [Ctrl + P]
Fullscreen              [Ctrl + F]
```

### Touch Controls Layout
```
Mobile Screen:
┌─────────────────────────┐
│     [L]         [R]     │ ← Shoulders
│                         │
│         GAME            │
│                         │
│    ▲                    │
│  ◀ ⊙ ▶    [Y]    [X]  │ ← D-Pad & Buttons
│    ▼       [B]  [A]    │
│                         │
│  [START]  [SELECT]     │ ← Start/Select
└─────────────────────────┘
```

---

## 🐛 Known Issues / Expected Behavior

### Browser Compatibility
- **Firefox:** Install prompt may not appear (limited PWA support)
- **Safari iOS:** Touch controls work, but install prompt may differ
- **Chrome Android:** Full PWA support, all features work

### Performance
- First load of emulator core: 5-10 seconds (downloading)
- Second load: <1 second (cached)
- Large ROM first load: 3-5 seconds
- Cached ROM load: <500ms

### Limitations
- Service worker requires HTTPS (or localhost)
- Offline mode only works for previously visited pages/games
- Touch controls only on devices with touch support
- Quick save requires login (cloud storage)

---

## ✅ Success Criteria

All features pass when:

### Upload ✅
- Duplicate detection catches same MD5
- Invalid files rejected before upload
- Bulk upload shows per-file progress

### Emulator ✅
- F5-F8 saves to correct slots
- Shift+F5-F8 loads from correct slots
- Touch controls appear on mobile
- All buttons map correctly

### PWA ✅
- Install prompt appears after 30s
- Offline banner shows when disconnected
- Service worker caches resources
- App shortcuts work after install

---

## 📞 If Something Doesn't Work

### Check Browser Console
```javascript
// Check service worker
navigator.serviceWorker.getRegistration().then(console.log)

// Check cache
caches.keys().then(console.log)

// Check touch support
console.log('Touch:', 'ontouchstart' in window, navigator.maxTouchPoints)
```

### Check Network Tab
- ROMs should load from cache (200 from ServiceWorker)
- API calls should be NetworkFirst
- Cores should be CacheFirst

### Clear Everything & Retry
```javascript
// Clear all caches
caches.keys().then(keys =>
  Promise.all(keys.map(key => caches.delete(key)))
)

// Unregister service worker
navigator.serviceWorker.getRegistrations().then(regs =>
  regs.forEach(reg => reg.unregister())
)

// Clear localStorage
localStorage.clear()
```

---

**Testing Complete! 🎉**

Report issues at: https://github.com/anthropics/claude-code/issues
