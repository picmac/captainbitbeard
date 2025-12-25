# 🏴‍☠️ Captain Bitbeard - Deployment Guide

## 📦 New Features Implemented

This deployment includes three major feature sets:

### Feature Set 1: Enhanced Game Upload
- ✅ MD5 duplicate detection with warning modal
- ✅ Client-side file validation (size, type, extension)
- ✅ Per-file progress tracking in bulk uploads

### Feature Set 2: Enhanced Emulator
- ✅ Quick save/load shortcuts (F5-F8)
- ✅ On-screen touch controls for mobile gaming
- ✅ Enhanced keyboard shortcut help

### Feature Set 3: PWA & Offline Features
- ✅ Progressive Web App configuration
- ✅ Pirate-themed install prompt
- ✅ Offline detection and UI
- ✅ Comprehensive service worker caching

---

## 🚀 Deployment Steps

### Prerequisites
- Node.js 20+
- npm 10+
- Docker & Docker Compose (for full stack)

### 1. Backend Deployment

```bash
cd backend

# Install dependencies (if needed)
npm install

# Run database migrations
npx prisma migrate deploy

# Build
npm run build

# Start production server
npm start
```

**Environment Variables Required:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/captainbitbeard
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_USE_SSL=false
JWT_SECRET=your-jwt-secret
BACKEND_URL=http://localhost:3001
```

### 2. Frontend Deployment

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Preview build (optional)
npm run preview
```

**Environment Variables Required:**
```env
VITE_API_URL=http://localhost:3001
```

**Output:**
- Build artifacts in `/dist`
- Service worker: `/dist/sw.js`
- PWA manifest: `/dist/manifest.webmanifest`

### 3. PWA Icons Setup

**Generate PWA Icons:**

The project includes a script to generate placeholder PWA icons with the Captain Bitbeard theme:

```bash
cd frontend

# Install pngjs if not already installed
npm install

# Generate PWA icons
node generate-icons.mjs
```

This will create:
```
/public/pwa-192x192.png     (192x192 icon)
/public/pwa-512x512.png     (512x512 icon)
/public/apple-touch-icon.png (Apple devices - 180x180)
/public/favicon.png         (32x32 favicon)
```

**Note:** The generated icons are placeholder designs with the Captain Bitbeard color scheme (ocean dark blue background with a gold border and white cross symbol). For production, consider creating custom pirate-themed icons with a skull and crossbones design.

**Custom Icons (Optional):**
If you want to create custom icons, ensure they match these sizes and place them in `/frontend/public/`:
- pwa-192x192.png (192x192)
- pwa-512x512.png (512x512)
- apple-touch-icon.png (180x180)
- favicon.png (32x32)

### 4. Docker Compose Deployment

```bash
# From project root
docker-compose up -d

# Check logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## ✅ Post-Deployment Testing

### Test Checklist

#### 1. Upload Features
- [ ] Upload a ROM file - verify client-side validation
- [ ] Upload the same ROM twice - verify duplicate detection warning
- [ ] Bulk upload 5 files - verify per-file progress bars
- [ ] Upload invalid file (.txt) - verify rejection

#### 2. Emulator Features
- [ ] Play a game
- [ ] Press F5 - verify quick save
- [ ] Press Shift+F5 - verify quick load
- [ ] Open on mobile/tablet - verify touch controls appear
- [ ] Test D-Pad, A/B buttons, Start/Select on mobile

#### 3. PWA Features
- [ ] Wait 30 seconds - verify install prompt appears
- [ ] Click "Install App" - verify PWA installation
- [ ] Disconnect internet - verify offline indicator shows
- [ ] Browse library offline - verify cached games load
- [ ] Reconnect internet - verify "back online" notification

#### 4. Keyboard Shortcuts
- [ ] Press H - verify hotkey help modal
- [ ] Verify F5-F8 shown in hotkey help
- [ ] Test Ctrl+S, Ctrl+L, Ctrl+F (existing shortcuts)

### Browser Testing

**Desktop:**
- [ ] Chrome/Edge (PWA support required)
- [ ] Firefox
- [ ] Safari (macOS)

**Mobile:**
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Firefox (Android)

---

## 🔧 Configuration Options

### PWA Development Mode

To test PWA features in development:

```typescript
// vite.config.ts
VitePWA({
  devOptions: {
    enabled: true, // Enable PWA in dev
  },
  // ...
})
```

### Caching Strategy Tuning

Adjust cache sizes in `vite.config.ts`:

```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /\/emulatorjs\/data\/cores\/.*\.data$/i,
      options: {
        expiration: {
          maxEntries: 200, // Adjust based on disk space
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
  ],
}
```

### Touch Controls Opacity

Adjust in `EmulatorPlayer.tsx`:

```typescript
<TouchControls show={!loading && !error} opacity={0.7} />
//                                              ^^^^ 0.0 to 1.0
```

---

## 📊 Monitoring

### Service Worker Status

Check in browser DevTools → Application → Service Workers:
- Status should be "activated and running"
- Update cycle should be "autoUpdate"

### Cache Status

DevTools → Application → Cache Storage:
```
google-fonts-cache        (Google Fonts)
emulator-cores-cache      (EmulatorJS cores)
emulatorjs-assets-cache   (JS/WASM files)
roms-cache                (Recently played ROMs)
images-cache              (Cover art, screenshots)
api-games-cache           (Game metadata)
save-states-cache         (Save state data)
```

### PWA Install Metrics

Track in analytics:
- `pwa-install-prompt-seen` (localStorage)
- `pwa-install-prompt-dismissed` (localStorage)
- `beforeinstallprompt` event fired
- Install acceptance rate

---

## 🐛 Troubleshooting

### Issue: Install prompt doesn't appear

**Causes:**
- Not HTTPS (PWA requires HTTPS or localhost)
- Already installed
- User dismissed previously
- Browser doesn't support PWA

**Fix:**
```javascript
// Clear localStorage to reset
localStorage.removeItem('pwa-install-prompt-seen');
localStorage.removeItem('pwa-install-prompt-dismissed');
```

### Issue: Touch controls not showing

**Causes:**
- Desktop browser (expected)
- JavaScript disabled
- Emulator not loaded

**Check:**
```javascript
// In browser console
console.log('Touch support:', 'ontouchstart' in window);
console.log('Max touch points:', navigator.maxTouchPoints);
```

### Issue: Offline mode not working

**Causes:**
- Service worker not registered
- Cache not populated
- API routes not cached

**Fix:**
```bash
# Force service worker update
1. DevTools → Application → Service Workers → "Update"
2. Hard reload (Ctrl+Shift+R)
3. Unregister SW and reload
```

### Issue: Quick save shortcuts not working

**Causes:**
- Focused on input field
- Browser intercepts F5 (refresh)
- Emulator not ready

**Fix:**
- Ensure focus is on game, not input
- F5 is prevented by default in overlay
- Check emulator ready state

---

## 🔒 Security Considerations

### Service Worker Scope

- Service worker is scoped to `/`
- Only caches same-origin resources
- API calls require CORS headers

### Content Security Policy

Add to nginx/Apache if needed:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' http://localhost:3001;";
```

### PWA Permissions

PWA may request:
- **Screen orientation lock** (for gaming)
- **Wake lock** (prevent screen sleep)
- **Persistent storage** (for large caches)

---

## 📈 Performance Metrics

### Expected Load Times

| Resource | First Load | Cached Load |
|----------|------------|-------------|
| **App Shell** | ~2s | <500ms |
| **Emulator Core** | ~5-10s | <1s |
| **ROM (10MB)** | ~3-5s | <500ms |
| **Game Library** | ~1-2s | <300ms |

### Cache Size Estimates

```
App Shell:           ~500 KB
Emulator Cores:      ~50-100 MB (all 200 cores)
Single Core:         ~200-500 KB
10 ROMs:             ~100-500 MB
Images (100):        ~20-50 MB
─────────────────────────────────
Total (typical):     ~200-300 MB
Total (maximum):     ~700 MB
```

---

## 🎮 Feature Documentation

### Quick Save Shortcuts Reference

| Key | Action |
|-----|--------|
| F5 | Quick Save Slot 1 |
| F6 | Quick Save Slot 2 |
| F7 | Quick Save Slot 3 |
| F8 | Quick Save Slot 4 |
| Shift+F5 | Quick Load Slot 1 |
| Shift+F6 | Quick Load Slot 2 |
| Shift+F7 | Quick Load Slot 3 |
| Shift+F8 | Quick Load Slot 4 |

### Touch Controls Mapping

| Button | Key | RetroArch Mapping |
|--------|-----|-------------------|
| D-Pad Up | ↑ | Directional Up |
| D-Pad Down | ↓ | Directional Down |
| D-Pad Left | ← | Directional Left |
| D-Pad Right | → | Directional Right |
| A Button | X | Action A |
| B Button | Z | Action B |
| X Button | S | Action X |
| Y Button | A | Action Y |
| Start | Enter | Start |
| Select | Shift | Select |
| L Shoulder | Q | Left Shoulder |
| R Shoulder | W | Right Shoulder |

---

## 📞 Support

### Common User Questions

**Q: How do I install the app?**
A: Wait for the pirate-themed prompt (30 seconds), or use browser menu → "Install Captain Bitbeard"

**Q: Can I play offline?**
A: Yes! After playing a game once, it's cached for offline play. Emulator cores cache automatically.

**Q: Why don't touch controls show on my tablet?**
A: Ensure JavaScript is enabled and you're playing a game (not just browsing).

**Q: Quick save isn't working**
A: Make sure you're logged in and the emulator is fully loaded. Check console for errors.

---

## 🎉 Success Criteria

Deployment is successful when:

- ✅ Frontend builds without errors
- ✅ Backend migrations complete
- ✅ PWA install prompt appears after 30s
- ✅ Service worker registers successfully
- ✅ Offline mode shows indicator when disconnected
- ✅ Touch controls appear on mobile devices
- ✅ Quick save F5-F8 works in emulator
- ✅ Duplicate ROM upload shows warning
- ✅ Bulk upload shows per-file progress

---

**Deployment Ready! ⚓🏴‍☠️🎮**

Generated: 2025-12-25
Version: 1.0.0
