# Captain Bitbeard - Setup Guide

Complete installation and configuration guide for Captain Bitbeard.

## Prerequisites

### Required Software
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**
- **Node.js** (v20+) - for local development
- **npm** (v10+)

### Hardware Requirements

**Minimum:**
- 2GB RAM
- 20GB storage
- 2 CPU cores

**Recommended:**
- 4GB RAM
- 50GB+ storage for ROM collection
- 4 CPU cores

**Raspberry Pi:**
- Raspberry Pi 4 (4GB RAM minimum)
- 64GB+ SD card or SSD
- Active cooling recommended

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/picmac/captainbitbeard.git
cd captainbitbeard
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update the following **required** settings:

```bash
# CRITICAL: Change these passwords!
POSTGRES_PASSWORD=your_secure_postgres_password
MINIO_SECRET_KEY=your_secure_minio_secret_key_at_least_32_chars
JWT_SECRET=your_secure_jwt_secret_at_least_64_chars
SESSION_SECRET=your_secure_session_secret

# ScreenScraper API (sign up at https://www.screenscraper.fr)
SCREENSCRAPER_USER=your_username
SCREENSCRAPER_PASSWORD=your_password
SCREENSCRAPER_DEV_ID=your_dev_id
SCREENSCRAPER_DEV_PASSWORD=your_dev_password
```

### 3. Download EmulatorJS

```bash
chmod +x scripts/setup-emulatorjs.sh
./scripts/setup-emulatorjs.sh
```

This will download the latest EmulatorJS release to `frontend/public/emulatorjs/`.

### 4. Start Services

```bash
cd docker
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- MinIO (ports 9000, 9001)
- Backend API (port 3001)
- Frontend (port 3000)

### 5. Check Status

```bash
docker-compose ps
```

All services should show as "healthy" after 30-60 seconds.

### 6. Create Admin User

```bash
docker-compose exec backend npm run create-admin
```

Follow the prompts to create your first admin account.

### 7. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **MinIO Console:** http://localhost:9001

## Development Setup

For local development without Docker:

### Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run migrate:dev

# Start development server
npm run dev
```

Backend will run on http://localhost:3001

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

## Database Management

### Run Migrations

```bash
cd backend
npm run migrate:dev  # Development
npm run migrate:deploy  # Production
```

### Access Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Open http://localhost:5555 to view and edit database records.

### Backup Database

```bash
docker-compose exec postgres pg_dump -U bitbeard captainbitbeard > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U bitbeard captainbitbeard
```

## MinIO Setup

### Access MinIO Console

1. Go to http://localhost:9001
2. Login with credentials from `.env`:
   - Username: `MINIO_ACCESS_KEY`
   - Password: `MINIO_SECRET_KEY`

### Buckets

The following bucket is created automatically:
- `captain-bitbeard` - Main storage bucket

### Directory Structure

```
captain-bitbeard/
├── roms/
│   ├── nes/
│   ├── snes/
│   ├── gb/
│   └── ...
├── bios/
├── covers/
├── screenshots/
└── saves/
```

## ScreenScraper Setup

### Create Account

1. Register at https://www.screenscraper.fr
2. Verify your email
3. Apply for dev credentials (optional, for higher rate limits)

### Configure

Add credentials to `.env`:

```bash
SCREENSCRAPER_USER=your_username
SCREENSCRAPER_PASSWORD=your_password
SCREENSCRAPER_DEV_ID=your_dev_id  # Optional
SCREENSCRAPER_DEV_PASSWORD=your_dev_password  # Optional
```

### Rate Limits

- **Free account:** 1 request/2 seconds
- **Dev account:** Higher limits, better performance

## Production Deployment

### Cloudflare Tunnel

1. Install Cloudflare Tunnel:
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

2. Login and create tunnel:
```bash
cloudflared tunnel login
cloudflared tunnel create captain-bitbeard
```

3. Configure tunnel in `~/.cloudflared/config.yml`:
```yaml
tunnel: <TUNNEL-ID>
credentials-file: /root/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: games.example.com
    service: http://localhost:3000
  - hostname: api.games.example.com
    service: http://localhost:3001
  - service: http_status:404
```

4. Run tunnel:
```bash
cloudflared tunnel run captain-bitbeard
```

### Nginx + Let's Encrypt

1. Install Nginx:
```bash
sudo apt-get install nginx certbot python3-certbot-nginx
```

2. Create Nginx config `/etc/nginx/sites-available/captainbitbeard`:
```nginx
server {
    listen 80;
    server_name games.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. Enable and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/captainbitbeard /etc/nginx/sites-enabled/
sudo certbot --nginx -d games.example.com
sudo systemctl restart nginx
```

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```

### Database connection errors

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check credentials in .env match backend config
cat .env | grep POSTGRES
```

### Frontend can't connect to backend

Check CORS settings in `.env`:
```bash
CORS_ORIGIN=http://localhost:3000
```

### EmulatorJS not loading

```bash
# Verify EmulatorJS files exist
ls frontend/public/emulatorjs/

# Re-download if missing
./scripts/setup-emulatorjs.sh
```

## Updating

```bash
# Pull latest code
git pull

# Rebuild containers
cd docker
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate:deploy
```

## Monitoring (Phase 2)

Start Prometheus and Grafana:

```bash
cd docker
docker-compose --profile monitoring up -d
```

- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3002

Default Grafana credentials:
- Username: `admin`
- Password: From `GRAFANA_ADMIN_PASSWORD` in `.env`

## Support

- **Issues:** https://github.com/picmac/captainbitbeard/issues
- **Discussions:** https://github.com/picmac/captainbitbeard/discussions
- **Documentation:** https://github.com/picmac/captainbitbeard/wiki
