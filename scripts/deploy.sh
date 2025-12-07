#!/bin/bash
# Deploy Captain Bitbeard
# This script deploys the application using Docker Compose

set -e

echo "🏴‍☠️ Captain Bitbeard - Deployment Script"
echo "=========================================="
echo ""

# Configuration
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_DIR="$DEPLOY_DIR/docker"
ENV_FILE="$DEPLOY_DIR/.env"

cd "$DEPLOY_DIR"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found!"
    echo "   Copy .env.example to .env and configure it first"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "   Directory: $DEPLOY_DIR"
echo "   Environment: $(grep NODE_ENV $ENV_FILE | cut -d '=' -f2)"
echo ""

# Pull latest code (if in git repo)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull
    echo ""
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
cd "$DOCKER_DIR"
docker-compose down

# Build images
echo "🏗️  Building Docker images..."
docker-compose build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
docker-compose exec -T backend npm run migrate:deploy || echo "⚠️  Migration failed (database might not be ready)"

# Show status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🏥 Health Checks:"
echo -n "   Backend API:  "
curl -sf http://localhost:3001/health > /dev/null && echo "✅ Healthy" || echo "❌ Unhealthy"
echo -n "   Frontend:     "
curl -sf http://localhost:3000 > /dev/null && echo "✅ Healthy" || echo "❌ Unhealthy"
echo -n "   PostgreSQL:   "
docker-compose exec -T postgres pg_isready -U bitbeard > /dev/null && echo "✅ Healthy" || echo "❌ Unhealthy"
echo -n "   MinIO:        "
curl -sf http://localhost:9000/minio/health/live > /dev/null && echo "✅ Healthy" || echo "❌ Unhealthy"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Access URLs:"
echo "   Frontend:      http://localhost:3000"
echo "   Backend API:   http://localhost:3001/api"
echo "   MinIO Console: http://localhost:9001"
echo ""
echo "📝 View logs:"
echo "   docker-compose -f $DOCKER_DIR/docker-compose.yml logs -f"
echo ""
echo "🏴‍☠️ Happy gaming, Captain!"
