# 🏴‍☠️ Captain Bitbeard

**Ahoy, Matey!** Welcome aboard Captain Bitbeard, your self-hosted retro gaming platform for reliving the golden age of gaming.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-linux%20%7C%20arm64-lightgrey.svg)

## 🎮 What is Captain Bitbeard?

Captain Bitbeard is a mobile-first, web-based retro gaming platform that lets you play classic games from 20+ retro consoles directly in your browser. Built with a beautiful SNES-era pirate theme, it's perfect for nostalgic gamers who want to self-host their gaming collection.

### ✨ Features

- 🕹️ **Multi-Console Emulation**: Support for NES, SNES, Game Boy, Genesis, PlayStation, and more
- 📱 **Mobile-First Design**: Optimized touch controls for smartphone gaming in portrait mode
- 💾 **Save States**: Save and load your progress at any point
- 🎨 **Pirate Theme**: Gorgeous 16-bit SNES-style pirate aesthetic
- 🔒 **Secure & Private**: Self-hosted with OWASP-compliant security
- 🐳 **Easy Deployment**: One-command Docker setup
- 📦 **Bulk ROM Management**: Upload and organize your game library
- 🖼️ **Auto Metadata**: Fetch covers and info from ScreenScraper.fr
- 🌊 **Open Source**: Free and community-driven

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** installed
- **4GB RAM** recommended (2GB minimum)
- **50GB+ storage** for your ROM collection
- Linux, macOS, or Windows with WSL2

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/picmac/captainbitbeard.git
cd captainbitbeard

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your settings (important: change passwords!)

# 3. Download EmulatorJS cores (required for gameplay)
./scripts/download-cores.sh

# 4. Start all services
cd docker
docker-compose up -d

# 5. Open in browser
# Frontend: http://localhost:3000
# MinIO Console: http://localhost:9001
```

**Note:** An admin user (username: `admin`, password: `admin`) is automatically created on first startup. You can customize this via environment variables:
- `DEFAULT_ADMIN_USERNAME` - Custom admin username (default: admin)
- `DEFAULT_ADMIN_PASSWORD` - Custom admin password (default: admin)
- `DEFAULT_ADMIN_EMAIL` - Custom admin email (default: admin@captainbitbeard.local)

### First Steps

1. **Login** with default admin credentials (`admin` / `admin`)
2. **Change the default password** in the admin settings
3. **Upload ROMs** via the admin panel
4. **Scrape Metadata** from ScreenScraper.fr
5. **Start Gaming!** Browse your library and play

## 📱 Mobile Gaming

Captain Bitbeard is optimized for mobile devices:

1. Open the web app on your smartphone
2. Add to home screen (PWA)
3. Launch any game
4. Enjoy native touch controls in portrait mode

The virtual gamepad overlay is designed for comfortable thumb gaming, just like the classics!

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Cloudflare Tunnel / Nginx         │  (Production)
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│   Frontend (React + EmulatorJS)     │
│   Port 3000                         │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│   Backend (Node.js + Express)       │
│   Port 3001                         │
└──┬────────────┬──────────────┬──────┘
   │            │              │
┌──┴──┐  ┌─────┴─────┐  ┌────┴────┐
│ PG  │  │  MinIO    │  │ Emulator│
│5432 │  │  9000     │  │ JS Lib  │
└─────┘  └───────────┘  └─────────┘
```

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15
- **Storage**: MinIO (S3-compatible)
- **Emulation**: EmulatorJS (self-hosted)
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## 📚 Documentation

- [Product Requirements Document](./PRD.md) - Complete product specification
- [Setup Guide](./docs/setup.md) - Detailed installation instructions
- [Admin Guide](./docs/admin.md) - ROM management and configuration
- [API Documentation](./docs/api.md) - Backend API reference
- [Development Guide](./docs/development.md) - Contributing guidelines

## 🛠️ Development

### Local Development Setup

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Database migrations
cd backend
npm run migrate:dev
```

### Running Tests

```bash
# Backend tests
cd backend
npm run test
npm run test:coverage

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Security audit
npm run audit
```

## 🔒 Security

Captain Bitbeard follows OWASP security best practices:

- ✅ HTTPS-only in production (HSTS enabled)
- ✅ Secure password hashing (bcrypt)
- ✅ JWT authentication
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (CSP headers)
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Dependency scanning
- ✅ Container security scanning

See [SECURITY.md](./SECURITY.md) for reporting vulnerabilities.

## 🎨 Design Philosophy

Captain Bitbeard's design is inspired by:

- **Monkey Island**: Classic pirate adventure aesthetics
- **SNES Era**: 16-bit pixel art style
- **Mobile-First**: Touch-optimized for modern devices
- **Accessibility**: Easy to use for all skill levels

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [x] **Phase 1**: Foundation (MVP)
- [ ] **Phase 2**: Core Features (ROM management, metadata scraping)
- [ ] **Phase 3**: Design & Polish (Pirate theme, PixelLab.AI assets)
- [ ] **Phase 4**: Security & Deployment (OWASP compliance, CI/CD)
- [ ] **Phase 5**: Advanced Features (Achievements, multiplayer)

See [PRD.md](./PRD.md) for detailed roadmap.

## ⚖️ Legal Notice

**IMPORTANT**: Captain Bitbeard is an emulator platform. It does NOT include any copyrighted ROM files or BIOS files.

- You are responsible for legally obtaining ROM files
- Only use ROMs you own physically or homebrew/freeware games
- Respect copyright laws in your jurisdiction
- This software is for educational and preservation purposes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) - Fantastic web-based emulator
- [ROMM](https://github.com/rommapp/romm) - Inspiration for mobile controls
- [ScreenScraper.fr](https://www.screenscraper.fr) - Game metadata API
- [Skyscraper](https://github.com/muldjord/skyscraper) - Scraping reference

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/picmac/captainbitbeard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/picmac/captainbitbeard/discussions)
- **Documentation**: [Wiki](https://github.com/picmac/captainbitbeard/wiki)

---

**Made with ❤️ for retro gaming enthusiasts**

*"The best way to predict the future is to play the past!"* - Captain Bitbeard
