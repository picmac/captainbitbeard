# 🏴‍☠️ Captain Bitbeard - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- 4GB RAM minimum
- 20GB+ storage

## Step 1: Clone & Configure

```bash
# Clone repository
git clone https://github.com/picmac/captainbitbeard.git
cd captainbitbeard

# Create environment file
cp .env.example .env

# Edit .env and set these REQUIRED values:
# - POSTGRES_PASSWORD
# - MINIO_SECRET_KEY
# - JWT_SECRET
# - SESSION_SECRET
nano .env
```

## Step 2: Download EmulatorJS

```bash
./scripts/setup-emulatorjs.sh
```

## Step 3: Start Services

```bash
cd docker
docker-compose up -d
```

Wait 30-60 seconds for all services to start.

## Step 4: Access the Platform

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **MinIO Console:** http://localhost:9001

## Step 5: Upload Your First ROM

1. Go to http://localhost:3000/admin
2. Click "SELECT FILE" or drag & drop a ROM
3. Fill in game title and select system
4. Click "UPLOAD ROM"

## Step 6: Play!

1. Go to http://localhost:3000/library
2. Click on your game
3. Enjoy! 🎮

## Troubleshooting

### Services won't start

```bash
cd docker
docker-compose logs backend
docker-compose logs frontend
```

### EmulatorJS not loading

```bash
# Re-download EmulatorJS
./scripts/setup-emulatorjs.sh
```

### Can't upload ROMs

Check MinIO is running:
```bash
curl http://localhost:9000/minio/health/live
```

## Optional: GitHub Runner (Auto-Deploy)

```bash
./scripts/setup-github-runner.sh
```

Follow the prompts to register your runner.

## Optional: ScreenScraper Integration

1. Sign up at https://www.screenscraper.fr
2. Add credentials to `.env`:
   ```
   SCREENSCRAPER_USER=your_username
   SCREENSCRAPER_PASSWORD=your_password
   ```

## Next Steps

- Read full [Setup Guide](./docs/setup.md)
- Check [PRD](./PRD.md) for all features
- Join discussions on GitHub

---

**Happy gaming, Captain! ⚓🎮**
