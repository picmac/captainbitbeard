# Captain Bitbeard - Product Requirements Document (PRD)

**Version:** 1.0
**Date:** December 7, 2025
**Status:** Draft
**Project Type:** Open Source Retro Gaming Platform

---

## 🏴‍☠️ Executive Summary

Captain Bitbeard is a self-hosted, mobile-first retro gaming platform designed for nostalgic gamers who grew up in the 8-bit and 16-bit era. The platform enables users to play classic games from multiple retro consoles directly in their web browser, with a beautifully crafted SNES-era pirate theme inspired by Monkey Island aesthetics.

**Key Value Propositions:**
- 🎮 Play retro games on any device, optimized for mobile
- 💾 Self-hosted solution with full data ownership
- 🎨 Unique 16-bit pirate-themed UI/UX
- 🔒 OWASP-compliant security standards
- 🐳 Easy deployment via Docker (multi-arch support)
- 🌊 Open source and community-driven

---

## 🎯 Project Vision & Goals

### Vision
Create the ultimate self-hosted retro gaming experience that brings the magic of classic gaming to modern devices while respecting user privacy and data ownership.

### Primary Goals
1. Provide seamless retro gaming experience on mobile devices
2. Support comprehensive emulation for all major retro consoles
3. Deliver production-grade security and performance
4. Enable easy self-hosting for technical enthusiasts
5. Create an immersive pirate-themed gaming atmosphere

### Success Metrics
- Smooth 60fps gameplay on mobile devices
- ROM loading time < 3 seconds
- 99.9% uptime for self-hosted instances
- Zero critical security vulnerabilities
- Support for 20+ retro gaming systems

---

## 👥 Target Audience

### Primary Persona: "Nostalgic Gamer Nick"
- **Age:** 30-45 years old
- **Background:** Grew up playing NES, SNES, Game Boy in childhood
- **Technical Level:** Comfortable with Docker and self-hosting
- **Use Case:** Wants to relive childhood gaming memories with friends
- **Device:** Primarily uses mobile phone/tablet for casual gaming
- **Environment:** Self-hosted on home network, shared with close friends

### Secondary Persona: "Technical Enthusiast Emma"
- **Age:** 25-40 years old
- **Background:** Enjoys tinkering with self-hosted solutions
- **Technical Level:** Advanced (Raspberry Pi, Docker, CI/CD)
- **Use Case:** Builds retro gaming station for family gatherings
- **Device:** Multiple devices (x64 server, Raspberry Pi)
- **Environment:** Home lab with monitoring and automation

---

## 🎮 Platform Overview

### Platform Type
**Web-based, Mobile-First Application**

- Runs entirely in modern web browsers
- Progressive Web App (PWA) capabilities
- Optimized touch controls for mobile devices
- Responsive design for desktop/tablet/mobile
- No app store distribution required

### Deployment Model
**Self-Hosted via Docker**

- Docker Compose orchestration
- Multi-architecture support (x64, ARM64/Raspberry Pi)
- Single-command deployment
- Automatic updates via CI/CD
- Environment-based configuration

---

## 🕹️ Supported Gaming Systems

### Emulator Technology
**EmulatorJS (Self-Hosted)**

- Local hosting of EmulatorJS library (not CDN)
- Source: https://github.com/EmulatorJS/EmulatorJS
- Custom integration inspired by ROMM implementation
- Optimized button overlays for mobile touch controls
- Grid layout for game selection

### Supported Consoles

All systems supported by EmulatorJS, including but not limited to:

**Nintendo:**
- Nintendo Entertainment System (NES)
- Super Nintendo Entertainment System (SNES)
- Nintendo 64 (N64)
- Game Boy (GB)
- Game Boy Color (GBC)
- Game Boy Advance (GBA)
- Nintendo DS (NDS)

**Sega:**
- Sega Genesis/Mega Drive
- Sega Master System
- Sega Game Gear
- Sega Saturn
- Sega Dreamcast

**Sony:**
- PlayStation 1 (PSX)
- PlayStation Portable (PSP)

**Arcade:**
- MAME (Multiple Arcade Machine Emulator)
- Neo Geo
- Atari 2600, 5200, 7800
- Atari Lynx

**Other:**
- Virtual Boy
- WonderSwan/WonderSwan Color
- NEC TurboGrafx-16/PC Engine

### BIOS Management
- Automatic BIOS detection and management
- Admin upload interface for required BIOS files
- System validation before emulation starts
- Secure storage in MinIO

---

## 🎯 Core Features

### Phase 1: MVP (Minimum Viable Product)

#### 1. Game Library Management (Admin Only)
**As an admin, I can:**
- ✅ Bulk upload ROM files (single or multiple)
- ✅ Upload BIOS files for systems that require them
- ✅ Automatically extract compressed files (ZIP, RAR, 7Z)
- ✅ Fetch game metadata from ScreenScraper.fr:
  - Game covers/box art
  - Screenshots
  - Descriptions
  - Release dates
  - Developer/publisher info
  - Ratings
- ✅ Manually edit game metadata
- ✅ Delete/archive games
- ✅ Organize games by system/category

**Technical Implementation:**
- ScreenScraper.fr API integration (https://www.screenscraper.fr/webapi2.php)
- Scraping logic inspired by Skyscraper (https://github.com/muldjord/skyscraper)
- Batch processing for bulk uploads
- Progress indicators for long-running operations

#### 2. Game Discovery & Browsing
**As a user, I can:**
- ✅ Browse games in a responsive grid layout
- ✅ Filter by console/system
- ✅ Search by game name
- ✅ Sort by name, release date, recently added
- ✅ View game details (cover, description, metadata)
- ✅ Mark games as favorites
- ✅ See recently played games

**UI/UX Requirements:**
- Grid layout with cover art prominently displayed
- Mobile-optimized touch targets
- Smooth scrolling and lazy loading
- Fast filter/search response (< 100ms)

#### 3. Gameplay Experience
**As a player, I can:**
- ✅ Launch games with one tap/click
- ✅ Play games with responsive controls:
  - Touch-based virtual gamepad (mobile)
  - Keyboard controls (desktop)
  - Bluetooth/USB controller support
- ✅ Save game states at any point
- ✅ Load previously saved states
- ✅ Access quick save/load functionality
- ✅ Adjust emulator settings:
  - Video filters (CRT, scanlines, etc.)
  - Audio volume
  - Control mapping
- ✅ Full-screen mode
- ✅ Fast-forward/rewind gameplay (if emulator supports)

**Performance Requirements:**
- ROM loading: < 3 seconds
- Steady 60fps gameplay on modern mobile devices
- Input latency: < 50ms
- Save state creation: < 1 second
- Save state loading: < 2 seconds

**Mobile-Specific Requirements:**
- **Native EmulatorJS virtual gamepad overlay** (built-in mobile controls)
- Layout implementation inspired by ROMM (reference: https://github.com/rommapp/romm)
- **Optimized for Portrait Mode (Hochformat)**:
  - D-Pad positioned lower-left for thumb reach
  - Action buttons (A/B/X/Y) positioned lower-right
  - Start/Select buttons centered at bottom
  - Shoulder buttons (L/R) at top corners
  - Transparent overlay with haptic feedback
- Responsive button sizing for different screen sizes
- Prevent screen sleep during gameplay
- Auto-save on app backgrounding
- Touch zones optimized for thumb ergonomics in portrait orientation

#### 4. User Management & Authentication
**As a user, I can:**
- ✅ Create an account
- ✅ Log in securely
- ✅ Manage my profile
- ✅ Track my gameplay history
- ✅ Manage my save states

**Security Requirements:**
- Secure password hashing (bcrypt/Argon2)
- JWT-based authentication
- Session management
- Role-based access control (Admin/User)
- OWASP compliance for auth flows

### Phase 2: Enhanced Features (Post-MVP)

#### 5. Achievements & Progression (Optional)
- Achievement system integration
- Trophy unlocks
- Progress tracking
- Achievement notifications

#### 6. Community Features (Optional)
- Leaderboards for high scores
- User comments/ratings on games
- Favorite game lists sharing

#### 7. Multiplayer (Future)
- Local multiplayer (multiple controllers)
- Netplay integration for online multiplayer
- Lobby system for matchmaking

---

## 🎨 Design & Branding

### Design Theme
**SNES-era 16-bit Pirate Adventure**

- Visual inspiration: Monkey Island classic adventure games
- Art style: 16-bit pixel art reminiscent of SNES titles
- Color palette: Rich, vibrant colors typical of 16-bit era
- Atmosphere: Swashbuckling pirate adventure on the high seas

### Brand Identity
**Name:** Captain Bitbeard
**Tagline:** "Sail the Seas of Retro Gaming"

**Visual Elements:**
- Pirate ship motifs
- Treasure chests (for game library)
- Compass navigation
- Pixel art skull and crossbones
- Nautical UI elements (ropes, wood textures, parchment)
- Sea-themed loading animations

### Design Asset Creation
**PixelLab.AI Integration**

- API: https://api.pixellab.ai/v2/llms.txt
- Generate custom pixel art assets:
  - UI elements (buttons, frames, borders)
  - Character sprites (Captain Bitbeard mascot)
  - Background scenes (ship deck, treasure island)
  - Icons for different console systems
  - Loading animations
  - Achievement badges

### Key UI Screens
1. **Login/Splash Screen:** Pirate ship sailing on pixel waves
2. **Main Menu:** Ship's deck with treasure chest (game library)
3. **Game Grid:** Organized shelves in captain's quarters
4. **Game Detail:** Opened treasure chest revealing game
5. **Gameplay:** Full-screen with themed overlay controls
6. **Settings:** Captain's navigational instruments
7. **Profile:** Pirate's logbook

---

## 🏗️ Technical Architecture

### Architecture Overview
**Modern Full-Stack Web Application**

```
┌─────────────────────────────────────────────────┐
│           Cloudflare Tunnel / Nginx             │
│              (Reverse Proxy + SSL)              │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│              Frontend (React PWA)               │
│  - Mobile-first responsive design               │
│  - EmulatorJS integration                       │
│  - State management (Redux/Zustand)             │
└────────────────────┬────────────────────────────┘
                     │
                     │ REST API / WebSocket
                     │
┌────────────────────┴────────────────────────────┐
│            Backend API Server                   │
│  - RESTful API                                  │
│  - Authentication & Authorization               │
│  - Game metadata management                     │
│  - ScreenScraper integration                    │
└─────┬──────────────┬──────────────┬─────────────┘
      │              │              │
      │              │              │
┌─────┴─────┐  ┌────┴─────┐  ┌─────┴──────────┐
│ PostgreSQL│  │  MinIO   │  │ EmulatorJS Lib │
│           │  │  (S3)    │  │  (Self-hosted) │
│ User Data │  │   ROMs   │  │                │
│ Metadata  │  │   BIOS   │  │                │
│ Saves     │  │  Covers  │  │                │
└───────────┘  └──────────┘  └────────────────┘
```

### Technology Stack

#### Frontend
**Framework:** React 18+

**Key Libraries:**
- **UI Framework:** Material-UI or custom component library
- **State Management:** Redux Toolkit or Zustand
- **Routing:** React Router v6
- **API Client:** Axios or React Query
- **Forms:** React Hook Form + Zod validation
- **EmulatorJS:** Self-hosted EmulatorJS library
- **PWA:** Workbox for service workers
- **Styling:** Tailwind CSS or Styled Components
- **Icons:** Custom pixel art icons + React Icons

**Build Tools:**
- Vite or Create React App
- TypeScript for type safety
- ESLint + Prettier for code quality

#### EmulatorJS Configuration

**Self-Hosted Setup:**
```javascript
// EmulatorJS will be hosted locally, not via CDN
const EJS_player = new EmulatorJS('#game', {
  // Core settings
  dataPath: '/emulatorjs/',  // Local path to EmulatorJS files
  system: 'nes',             // Dynamic based on game
  gameName: 'Super Mario Bros',
  gameUrl: '/api/roms/123/download',  // MinIO URL via backend

  // Mobile Controls (CRITICAL)
  mobileControls: true,      // Enable native mobile overlay

  // Portrait Mode Optimization
  virtualGamepad: {
    enabled: true,
    layout: 'portrait',      // Portrait-optimized layout
    style: 'romm',           // ROMM-style positioning
    opacity: 0.7,            // Semi-transparent buttons
    haptic: true,            // Haptic feedback

    // Button positions (CSS-based, portrait mode)
    dpad: {
      bottom: '80px',
      left: '20px',
      size: '120px'
    },
    actionButtons: {
      bottom: '80px',
      right: '20px',
      size: '50px'
    },
    startSelect: {
      bottom: '20px',
      centered: true,
      size: '40px'
    },
    shoulders: {
      top: '10px',
      size: '60px'
    }
  },

  // Performance
  threads: navigator.hardwareConcurrency || 4,

  // Save states
  saveStateName: 'user_123_game_456',

  // Callbacks
  onReady: () => console.log('Emulator ready'),
  onSave: (state) => uploadSaveState(state),
  onLoad: () => console.log('Game loaded')
});
```

**Key Implementation Notes:**
- **No CDN:** All EmulatorJS files served from `/public/emulatorjs/`
- **ROMM Reference:** Study ROMM's mobile control implementation
- **Portrait First:** Default to portrait, allow landscape as secondary
- **Touch Optimization:** Ensure 44x44px minimum touch targets
- **Performance:** Lazy-load emulator cores, cache aggressively

#### Backend
**Language:** Node.js (TypeScript) or Python

**Framework Options:**
- Node.js: Express.js or Fastify
- Python: FastAPI or Django

**Key Libraries:**
- **Authentication:** Passport.js (Node) or OAuth libraries
- **ORM:** Prisma (Node) or SQLAlchemy (Python)
- **File Processing:**
  - Compression: unzipper, node-7z (Node)
  - Image processing: Sharp
- **API Integrations:** axios for ScreenScraper
- **Validation:** Zod (Node) or Pydantic (Python)

#### Data Storage

**PostgreSQL (Relational Database)**
- User accounts and profiles
- Game metadata (title, description, ratings, etc.)
- Save state metadata
- Achievement data
- User progress and statistics
- Admin configuration

**MinIO (S3-Compatible Object Storage)**
- ROM files (organized by system)
- BIOS files
- Game covers and screenshots
- Save state files
- User profile images
- Generated pixel art assets

**Database Schema (High-Level):**

```sql
-- Users
users (id, username, email, password_hash, role, created_at, updated_at)
user_profiles (user_id, avatar_url, bio, favorite_systems)

-- Games
games (id, title, system, rom_path, cover_url, description, release_date, etc.)
game_metadata (game_id, developer, publisher, genre, rating, players)

-- Save States
save_states (id, user_id, game_id, slot, state_file_path, screenshot_url, created_at)

-- Admin
bios_files (id, system, file_path, md5_hash, required)
upload_jobs (id, admin_id, status, progress, created_at)

-- Optional: Achievements
achievements (id, game_id, title, description, icon_url, points)
user_achievements (user_id, achievement_id, unlocked_at)
```

#### Infrastructure

**Containerization:**
- Docker & Docker Compose
- Multi-stage builds for optimization
- Health checks for all services

**Services:**
```yaml
services:
  frontend:
    - React app served by Nginx
    - Static assets
    - EmulatorJS files

  backend:
    - API server
    - ScreenScraper integration
    - File processing workers

  postgres:
    - Persistent volume for data
    - Automated backups

  minio:
    - Persistent volume for objects
    - Bucket policies for access control

  prometheus: (Phase 2)
    - Metrics collection

  grafana: (Phase 2)
    - Monitoring dashboards
```

**Multi-Architecture Support:**
- Docker buildx for multi-platform builds
- Support for:
  - linux/amd64 (x64 servers)
  - linux/arm64 (Raspberry Pi 4/5)
- Automated builds in CI/CD

### Network & Security

**Reverse Proxy Options:**

**Option 1: Cloudflare Tunnel**
- Zero-trust network access
- No port forwarding required
- Built-in DDoS protection
- Free SSL certificates
- Easy setup for home hosting

**Option 2: Nginx + Let's Encrypt**
- Self-managed reverse proxy
- Automatic SSL certificate renewal
- Custom caching rules
- Rate limiting
- More control over routing

**Multi-Factor Authentication (Phase 2):**
- TOTP (Time-based One-Time Password)
- Integration with authenticator apps
- Backup codes
- SMS fallback (optional)

**Security Best Practices:**
- HTTPS-only (HSTS enabled)
- Secure headers (CSP, X-Frame-Options, etc.)
- Rate limiting on API endpoints
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- CSRF tokens
- Regular security audits
- Dependency vulnerability scanning

---

## 📊 Monitoring & Observability (Phase 2)

### Prometheus Integration
**Metrics Collection:**
- API request rates and latency
- ROM loading times
- Active user sessions
- Database query performance
- MinIO storage usage
- Error rates and types
- Emulator performance metrics

### Grafana Dashboards
**Key Dashboards:**
1. **System Health:** CPU, memory, disk usage
2. **Application Performance:** API response times, throughput
3. **User Activity:** Active users, popular games, session duration
4. **Storage:** ROM storage usage, save state counts
5. **Errors:** Error rates, failed logins, 4xx/5xx responses

### Logging
- Structured logging (JSON format)
- Log aggregation
- Error tracking (Sentry integration optional)
- Audit logs for admin actions

---

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
**Self-Hosted Runner on Local Machine**

#### Pipeline Stages

**1. Code Quality & Security (on every push)**
```yaml
- Linting (ESLint, Pylint)
- Code formatting check (Prettier, Black)
- TypeScript type checking
- Unit tests (Jest, pytest)
- Integration tests
- Code coverage reporting (>80% target)
```

**2. Security Scanning**
```yaml
- Dependency vulnerability scanning (npm audit, pip-audit)
- OWASP Dependency-Check
- Container image scanning (Trivy, Grype)
- Static Application Security Testing (SAST)
- Secret scanning (GitGuardian, TruffleHog)
- License compliance checking
```

**3. Build & Package**
```yaml
- Frontend build (React production build)
- Backend build (TypeScript compilation)
- Docker image builds (multi-arch)
- Image tagging (semantic versioning)
- Push to container registry (GitHub Container Registry)
```

**4. Testing**
```yaml
- E2E tests (Playwright, Cypress)
- Performance tests
- Mobile responsiveness tests
- Accessibility tests (WCAG compliance)
```

**5. Deployment (on main branch)**
```yaml
- Deploy to staging environment
- Smoke tests on staging
- Manual approval gate
- Deploy to production
- Health check validation
- Rollback on failure
```

### OWASP Compliance

**OWASP Top 10 Mitigation:**

1. **Broken Access Control**
   - Role-based access control (RBAC)
   - JWT validation on all protected endpoints
   - Admin-only routes enforcement

2. **Cryptographic Failures**
   - TLS 1.3 for all connections
   - Secure password hashing (Argon2/bcrypt)
   - Encrypted storage for sensitive data

3. **Injection**
   - Parameterized queries (ORM usage)
   - Input validation and sanitization
   - Content Security Policy (CSP)

4. **Insecure Design**
   - Threat modeling during architecture phase
   - Security requirements in PRD
   - Security review gates in CI/CD

5. **Security Misconfiguration**
   - Hardened Docker images
   - Minimal base images (Alpine Linux)
   - Regular dependency updates
   - Security headers enabled

6. **Vulnerable and Outdated Components**
   - Automated dependency scanning
   - Regular update schedule
   - LTS version usage

7. **Identification and Authentication Failures**
   - MFA support
   - Account lockout after failed attempts
   - Secure session management
   - Password strength requirements

8. **Software and Data Integrity Failures**
   - Signed commits required
   - Container image signing
   - Checksum verification for ROMs/BIOS

9. **Security Logging and Monitoring Failures**
   - Comprehensive audit logging
   - Prometheus metrics
   - Alerting on security events

10. **Server-Side Request Forgery (SSRF)**
    - URL validation for external requests
    - Allowlist for ScreenScraper API
    - Network segmentation

### Testing Strategy

**Unit Tests:**
- Frontend components (React Testing Library)
- Backend business logic
- Utility functions
- Coverage: >80%

**Integration Tests:**
- API endpoint testing
- Database operations
- MinIO file operations
- ScreenScraper integration

**E2E Tests:**
- User registration and login
- Game browsing and filtering
- ROM upload (admin)
- Game launch and save state
- Mobile touch controls

**Performance Tests:**
- Load testing (k6 or Artillery)
- ROM loading benchmarks
- Concurrent user testing
- Database query optimization

**Security Tests:**
- OWASP ZAP automated scans
- Penetration testing (manual)
- Authentication bypass attempts
- CSRF/XSS testing

---

## 📱 Mobile Optimization

### Responsive Design
- Mobile-first CSS approach
- Breakpoints for phone/tablet/desktop
- Touch-friendly UI elements (min 44x44px targets)
- Optimized images (WebP format, lazy loading)

### Performance Optimization
- Code splitting and lazy loading
- Service worker caching
- Optimized bundle sizes (< 200KB initial load)
- Compression (Brotli/Gzip)

### PWA Features
- Add to home screen
- Offline game library browsing
- Background sync for save states
- Push notifications (optional)

### Touch Controls
**EmulatorJS Native Mobile Controls**

EmulatorJS comes with built-in mobile overlay controls that we will use directly:

- **Portrait Mode Optimization (Primary Focus)**:
  - Use EmulatorJS's native virtual gamepad overlay
  - Layout matches ROMM implementation style
  - D-Pad: Lower-left corner, optimized for left thumb
  - Action Buttons (A/B/X/Y): Lower-right corner, optimized for right thumb
  - Start/Select: Bottom-center, easily accessible
  - L/R Shoulder Buttons: Top corners when needed
  - Semi-transparent buttons with visual feedback

- **EmulatorJS Features to Enable**:
  - Built-in touch handlers
  - Multi-touch support (simultaneous button presses)
  - Haptic feedback API integration
  - Auto-hide controls option
  - Button opacity adjustment

- **Additional Enhancements**:
  - Screen orientation lock to portrait during gameplay
  - Gesture controls: Swipe down from top for menu overlay
  - Double-tap to toggle fullscreen
  - Long-press for quick save

**Reference Implementation:** ROMM's mobile interface
**Documentation:** EmulatorJS mobile controls configuration

---

## 🗂️ File Organization & Storage

### MinIO Bucket Structure
```
captain-bitbeard/
├── roms/
│   ├── nes/
│   ├── snes/
│   ├── gb/
│   ├── gba/
│   └── ...
├── bios/
│   ├── ps1/
│   ├── saturn/
│   └── ...
├── covers/
│   ├── {game_id}/
│   │   ├── front.jpg
│   │   ├── back.jpg
│   │   └── screenshots/
├── saves/
│   ├── {user_id}/
│   │   ├── {game_id}/
│   │   │   ├── slot1.state
│   │   │   ├── slot2.state
│   │   │   └── ...
├── assets/
│   ├── ui/
│   ├── characters/
│   └── backgrounds/
└── temp/
    └── uploads/
```

### Compression Support
- Automatic detection of compressed files
- Supported formats: ZIP, RAR, 7Z
- Extract on upload to MinIO
- Validate ROM after extraction
- Clean up temporary files

---

## 🔐 User Roles & Permissions

### Roles

**Admin:**
- Upload/delete ROMs and BIOS
- Trigger metadata scraping
- Manage users
- View system metrics
- Access admin panel

**User:**
- Browse game library
- Play games
- Save/load game states
- Manage profile
- View own statistics

### Permission Matrix

| Feature | Admin | User |
|---------|-------|------|
| Browse games | ✅ | ✅ |
| Play games | ✅ | ✅ |
| Save/load states | ✅ | ✅ |
| Upload ROMs | ✅ | ❌ |
| Delete ROMs | ✅ | ❌ |
| Edit metadata | ✅ | ❌ |
| Manage users | ✅ | ❌ |
| View metrics | ✅ | ❌ |

---

## 📦 Deployment

### Prerequisites
- Docker & Docker Compose installed
- Minimum 2GB RAM (4GB recommended for Raspberry Pi 4)
- 50GB+ storage for ROM library
- Network access for ScreenScraper API

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/[username]/captain-bitbeard.git
cd captain-bitbeard

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Start services
docker-compose up -d

# 4. Create admin user
docker-compose exec backend npm run create-admin

# 5. Access application
# http://localhost:3000
```

### Environment Variables
```env
# Application
NODE_ENV=production
FRONTEND_URL=https://games.example.com
BACKEND_URL=https://api.games.example.com

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=captainbitbeard
POSTGRES_USER=bitbeard
POSTGRES_PASSWORD=<secure-password>

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=<access-key>
MINIO_SECRET_KEY=<secret-key>
MINIO_BUCKET=captain-bitbeard

# Authentication
JWT_SECRET=<random-secret>
SESSION_SECRET=<random-secret>
PASSWORD_MIN_LENGTH=12

# ScreenScraper API
SCREENSCRAPER_USER=<username>
SCREENSCRAPER_PASSWORD=<password>
SCREENSCRAPER_DEV_ID=<dev-id>
SCREENSCRAPER_DEV_PASSWORD=<dev-password>

# Monitoring (Phase 2)
PROMETHEUS_ENABLED=false
GRAFANA_ADMIN_PASSWORD=<password>

# MFA (Phase 2)
MFA_ENABLED=false
MFA_ISSUER=CaptainBitbeard
```

---

## 🎯 Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Goal:** Working MVP with core gameplay

- [ ] Project setup and infrastructure
  - [ ] GitHub repository initialization
  - [ ] Docker Compose configuration
  - [ ] CI/CD pipeline setup
- [ ] Backend foundation
  - [ ] Database schema design
  - [ ] User authentication
  - [ ] API framework setup
  - [ ] MinIO integration
- [ ] Frontend foundation
  - [ ] React app setup
  - [ ] Routing structure
  - [ ] UI component library
  - [ ] Authentication flow
- [ ] EmulatorJS integration
  - [ ] Self-hosted library setup (not CDN)
  - [ ] Basic game loading and ROM handling
  - [ ] Enable native mobile overlay controls
  - [ ] Configure portrait mode layout (ROMM-style)
  - [ ] Test touch input on mobile devices

### Phase 2: Core Features (Weeks 5-8)
**Goal:** Complete game library management

- [ ] Admin panel
  - [ ] ROM upload (single & bulk)
  - [ ] BIOS management
  - [ ] Compression handling (ZIP/RAR/7Z)
- [ ] ScreenScraper integration
  - [ ] API authentication
  - [ ] Metadata fetching
  - [ ] Cover art download
  - [ ] Bulk scraping
- [ ] Game library UI
  - [ ] Grid layout
  - [ ] Filtering and search
  - [ ] Game detail pages
- [ ] Save state system
  - [ ] Save state creation
  - [ ] Load state
  - [ ] Multiple save slots

### Phase 3: Design & Polish (Weeks 9-10)
**Goal:** Beautiful pirate-themed experience

- [ ] PixelLab.AI integration
  - [ ] Generate UI assets
  - [ ] Create character sprites
  - [ ] Design backgrounds
- [ ] Theme implementation
  - [ ] Pirate UI components
  - [ ] Animations
  - [ ] Sound effects (optional)
- [ ] Mobile optimization
  - [ ] Touch control refinement
  - [ ] PWA implementation
  - [ ] Performance tuning

### Phase 4: Security & Deployment (Weeks 11-12)
**Goal:** Production-ready system

- [ ] Security hardening
  - [ ] OWASP compliance audit
  - [ ] Penetration testing
  - [ ] Security headers
- [ ] Deployment setup
  - [ ] Cloudflare Tunnel OR Nginx config
  - [ ] SSL certificates
  - [ ] Backup strategy
- [ ] Documentation
  - [ ] User guide
  - [ ] Admin guide
  - [ ] Developer docs

### Phase 5: Advanced Features (Post-Launch)
**Goal:** Enhanced experience

- [ ] MFA implementation
- [ ] Prometheus + Grafana monitoring
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Netplay/multiplayer
- [ ] Mobile apps (React Native)

---

## 🧪 Testing Requirements

### Test Coverage Goals
- Unit tests: >80% coverage
- Integration tests: All API endpoints
- E2E tests: Critical user journeys
- Performance tests: Load testing

### Critical Test Scenarios

**Authentication:**
- User registration
- Login/logout
- Password reset
- Session expiration
- Role-based access

**Game Library:**
- Browse games (all systems)
- Search functionality
- Filter by system
- Game detail view

**ROM Management (Admin):**
- Single ROM upload
- Bulk ROM upload
- Compressed file extraction
- BIOS upload
- Metadata scraping
- Manual metadata edit

**Gameplay:**
- Game launch
- Controls (keyboard, touch, gamepad)
- Save state creation
- Load save state
- Full-screen mode
- Audio/video settings

**Mobile:**
- Touch controls responsiveness
- Virtual gamepad accuracy
- Screen rotation handling
- Performance on mobile devices

---

## 📚 Documentation Requirements

### User Documentation
- Getting started guide
- How to play games
- Controller setup
- Save state usage
- FAQ

### Admin Documentation
- Installation guide
- ROM upload process
- BIOS setup per system
- ScreenScraper configuration
- Backup and restore
- Troubleshooting

### Developer Documentation
- Architecture overview
- API documentation (OpenAPI/Swagger)
- Database schema
- Contributing guidelines
- Code style guide
- Local development setup

---

## 🔮 Future Considerations

### Potential Enhancements
- **Social Features:** Friend lists, activity feeds
- **Game Collections:** Custom playlists, curated collections
- **Advanced Filtering:** By genre, year, rating, player count
- **Game Recommendations:** Based on play history
- **Statistics:** Playtime tracking, most played games
- **Themes:** Multiple UI themes beyond pirate
- **Languages:** Multi-language support (i18n)
- **Mobile Apps:** Native iOS/Android apps
- **Desktop Apps:** Electron-based desktop client
- **Cloud Saves:** Cross-device save synchronization
- **RetroAchievements:** Integration with RetroAchievements.org
- **Screenshot Gallery:** In-game screenshot capture
- **Video Recording:** Gameplay recording and sharing
- **Twitch Integration:** Stream gameplay

### Scalability Considerations
- CDN for static assets
- Database read replicas
- Redis caching layer
- Queue system for long-running tasks (BullMQ)
- Microservices architecture (if needed)

---

## ⚖️ Legal & Compliance

### Copyright & ROMs
- Platform does not provide copyrighted ROM files
- Users responsible for legal ownership of ROMs
- Recommended sources: Personal backups, homebrew games
- Terms of Service must include legal disclaimers
- Compliance with DMCA takedown procedures

### Open Source License
- **License:** MIT or GPL-3.0 (to be decided)
- Attribution requirements
- Contribution guidelines
- Code of Conduct

### Privacy
- GDPR considerations (if EU users)
- Privacy policy
- Data retention policy
- Right to deletion
- Minimal data collection

---

## 📞 Support & Community

### Community Building
- GitHub Issues for bug reports
- GitHub Discussions for feature requests
- Discord server (optional)
- Regular release notes
- Contributor recognition

### Support Channels
- Documentation first
- GitHub Issues for technical problems
- Community forum for general help
- Admin-only support channels

---

## 🎨 Visual Design Specifications

### Color Palette (16-bit Pirate Theme)
```
Primary Colors:
- Ocean Blue: #0F4C81
- Sand Beige: #E8D5B7
- Pirate Gold: #FFD700
- Wood Brown: #8B4513

Accent Colors:
- Skull White: #F5F5F5
- Blood Red: #DC143C
- Treasure Green: #2E8B57
- Night Sky: #191970

UI States:
- Success: #3CB371
- Warning: #FF8C00
- Error: #DC143C
- Info: #4682B4
```

### Typography
- **Headers:** Pixel-style font (e.g., Press Start 2P, VT323)
- **Body:** Readable pixel font (e.g., Silkscreen, Pixelify Sans)
- **Monospace:** For code/stats (e.g., Fira Code, JetBrains Mono)

### UI Components Style Guide
- Borders: 4px pixel-style borders
- Buttons: Raised 3D pixel buttons
- Frames: Wooden plank-style frames
- Backgrounds: Parchment or ocean wave textures
- Icons: 16x16 or 32x32 pixel art icons
- Animations: 8-12 FPS for retro feel

---

## 📏 Performance Benchmarks

### Target Metrics

**Frontend:**
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3s
- Lighthouse Score: > 90
- Bundle Size: < 200KB (gzipped)

**Backend:**
- API Response Time: < 100ms (p95)
- ROM Download Start: < 500ms
- Database Queries: < 50ms (p95)

**Gameplay:**
- Frame Rate: 60fps stable
- Input Latency: < 50ms
- Audio Sync: < 20ms drift
- Save State: < 1s to create
- Load State: < 2s to load

**Mobile:**
- Touch Response: < 16ms
- Battery Impact: Minimal
- Network Usage: Efficient caching

---

## 🚨 Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| EmulatorJS compatibility issues | Medium | High | Thorough testing on multiple devices |
| ROM loading performance | Medium | High | CDN-like serving from MinIO, caching |
| Mobile control accuracy | Low | Medium | Extensive mobile testing, user feedback |
| ScreenScraper API rate limits | Medium | Low | Caching, queue system, backoff strategy |
| Multi-arch build complexity | Medium | Medium | Early testing on both platforms |

### Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Unauthorized ROM access | Medium | High | Strong authentication, RBAC |
| Data breach | Low | Critical | Encryption, security audits, monitoring |
| DDoS attacks | Low | High | Cloudflare protection, rate limiting |
| Malicious ROM uploads | Medium | Medium | File validation, virus scanning |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Storage capacity issues | Medium | Medium | Monitoring, alerts, cleanup jobs |
| Backup failures | Low | High | Automated testing of backups |
| Network outages | Low | Medium | Offline mode (PWA), graceful degradation |

---

## ✅ Success Criteria

### Launch Criteria (MVP Ready)
- [ ] Core gameplay working on mobile and desktop
- [ ] Admin can upload and manage ROMs
- [ ] Users can browse and play games
- [ ] Save states work reliably
- [ ] No critical security vulnerabilities
- [ ] Docker deployment works on x64 and ARM64
- [ ] Basic pirate theme implemented
- [ ] Documentation complete

### Post-Launch Success Indicators
- Friends/family actively using the platform
- 99%+ uptime
- Zero data loss incidents
- Positive user feedback
- Community contributions (issues, PRs)
- Featured in retro gaming communities

---

## 📋 Appendix

### Reference Projects
- **ROMM:** https://github.com/rommapp/romm
- **EmulatorJS:** https://github.com/EmulatorJS/EmulatorJS
- **Skyscraper:** https://github.com/muldjord/skyscraper

### API Documentation
- **ScreenScraper API:** https://www.screenscraper.fr/webapi2.php
- **PixelLab.AI:** https://api.pixellab.ai/v2/llms.txt

### Glossary
- **ROM:** Read-Only Memory file containing game data
- **BIOS:** Basic Input/Output System required by some emulators
- **Save State:** Snapshot of game state at a specific moment
- **Netplay:** Online multiplayer via emulation
- **PWA:** Progressive Web App
- **OWASP:** Open Web Application Security Project

---

## 📝 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-07 | Claude | Initial PRD creation based on user requirements |

---

**End of PRD**

*This document is a living specification and will be updated as the project evolves.*
