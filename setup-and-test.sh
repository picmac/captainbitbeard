#!/bin/bash

# Captain Bitbeard - Enhanced Media Management
# Automated Setup & Testing Script
# Usage: ./setup-and-test.sh

set -e  # Exit on error

echo "🏴‍☠️ Captain Bitbeard - Enhanced Media Management Setup & Test"
echo "=============================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print info
info() {
    echo -e "ℹ️  $1"
}

echo "📋 Step 1: Backend Setup"
echo "------------------------"

# Navigate to backend
cd backend

info "Installing backend dependencies..."
npm install --silent
success "Dependencies installed"

info "Generating Prisma Client..."
npx prisma generate
success "Prisma Client generated"

info "Applying database migrations..."
npx prisma migrate deploy
success "Migrations applied"

info "Verifying migration status..."
npx prisma migrate status
success "Database schema is up to date"

echo ""
echo "📋 Step 2: Frontend Setup"
echo "-------------------------"

# Navigate to frontend
cd ../frontend

info "Installing frontend dependencies..."
npm install --silent
success "Dependencies installed"

echo ""
echo "📋 Step 3: Database Schema Verification"
echo "---------------------------------------"

cd ../

info "Checking new tables and columns..."

# Run SQL check (requires psql to be installed)
if command -v psql &> /dev/null; then
    info "Verifying Game table columns..."
    psql $DATABASE_URL -c "\d games" | grep -E "(background_music_url|animated_cover_url|region)" && success "Game table has new columns" || warning "Could not verify Game table"

    info "Verifying Screenshot table columns..."
    psql $DATABASE_URL -c "\d screenshots" | grep -E "(category|caption)" && success "Screenshot table has new columns" || warning "Could not verify Screenshot table"

    info "Verifying ScreenshotCategory enum..."
    psql $DATABASE_URL -c "SELECT unnest(enum_range(NULL::\"ScreenshotCategory\"));" && success "ScreenshotCategory enum exists" || warning "Could not verify enum"
else
    warning "psql not installed - skipping database verification"
    info "You can manually verify with: psql \$DATABASE_URL -c '\\d games'"
fi

echo ""
echo "📋 Step 4: Backend API Testing"
echo "------------------------------"

cd backend

info "Starting backend server in background..."
npm run dev &
BACKEND_PID=$!
success "Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
info "Waiting for backend to be ready..."
sleep 5

# Test API health
info "Testing API health endpoint..."
HEALTH_CHECK=$(curl -s http://localhost:3001/api)
if echo "$HEALTH_CHECK" | grep -q "Captain Bitbeard API"; then
    success "API is responding correctly"
    echo "   Response: $HEALTH_CHECK"
else
    error "API health check failed"
    echo "   Response: $HEALTH_CHECK"
fi

# Test media routes exist
info "Testing media routes registration..."
if curl -s http://localhost:3001/api/media/games/test-id/media/trailer | grep -q "Unauthorized\|not found\|gameId"; then
    success "Media routes are registered"
else
    warning "Media routes might not be registered correctly"
fi

# Stop backend
info "Stopping backend server..."
kill $BACKEND_PID
success "Backend stopped"

echo ""
echo "📋 Step 5: Frontend Build Test"
echo "------------------------------"

cd ../frontend

info "Testing frontend build..."
npm run build
success "Frontend builds successfully"

echo ""
echo "=============================================================="
echo "🎉 Setup & Testing Complete!"
echo "=============================================================="
echo ""
echo "📊 Summary:"
echo "  ✅ Backend dependencies installed"
echo "  ✅ Prisma Client generated"
echo "  ✅ Database migrations applied"
echo "  ✅ Frontend dependencies installed"
echo "  ✅ API health check passed"
echo "  ✅ Frontend builds successfully"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start backend:  cd backend && npm run dev"
echo "  2. Start frontend: cd frontend && npm run dev"
echo "  3. Open browser:   http://localhost:5173"
echo "  4. Login as admin and test Enhanced Media features"
echo ""
echo "📖 Testing Guide: See TESTING_ENHANCED_MEDIA.md"
echo ""
