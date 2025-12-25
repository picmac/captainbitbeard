#!/bin/bash

# Database Schema Verification Script
# Verifies all new columns and tables exist
# Usage: ./test-database-schema.sh [DATABASE_URL]

echo "🗄️  Database Schema Verification"
echo "================================"
echo ""

# Get DATABASE_URL from argument or environment
if [ -z "$1" ]; then
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ DATABASE_URL not provided"
        echo "   Usage: ./test-database-schema.sh postgresql://user:pass@localhost:5432/dbname"
        echo "   Or set: export DATABASE_URL=postgresql://..."
        exit 1
    fi
else
    DATABASE_URL=$1
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ psql is not installed"
    echo "   Install it with:"
    echo "   - Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "   - macOS: brew install postgresql"
    exit 1
fi

echo "✅ Using database: ${DATABASE_URL:0:30}..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to run SQL and check result
check_sql() {
    local name=$1
    local sql=$2
    local expected=$3

    echo -n "Checking: $name... "

    result=$(psql "$DATABASE_URL" -t -c "$sql" 2>&1)

    if echo "$result" | grep -qi "error"; then
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Error: $result"
        ((CHECKS_FAILED++))
    elif echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠️  UNEXPECTED${NC}"
        echo "   Expected: $expected"
        echo "   Got: $result"
        ((CHECKS_FAILED++))
    fi
}

echo "📋 Testing Game Table Extensions:"
echo "--------------------------------"

check_sql "background_music_url column" \
    "SELECT column_name FROM information_schema.columns WHERE table_name='games' AND column_name='background_music_url';" \
    "background_music_url"

check_sql "animated_cover_url column" \
    "SELECT column_name FROM information_schema.columns WHERE table_name='games' AND column_name='animated_cover_url';" \
    "animated_cover_url"

check_sql "region column" \
    "SELECT column_name FROM information_schema.columns WHERE table_name='games' AND column_name='region';" \
    "region"

echo ""
echo "📋 Testing Screenshot Table Extensions:"
echo "---------------------------------------"

check_sql "category column" \
    "SELECT column_name FROM information_schema.columns WHERE table_name='screenshots' AND column_name='category';" \
    "category"

check_sql "caption column" \
    "SELECT column_name FROM information_schema.columns WHERE table_name='screenshots' AND column_name='caption';" \
    "caption"

echo ""
echo "📋 Testing Enums:"
echo "----------------"

check_sql "GameRegion enum exists" \
    "SELECT typname FROM pg_type WHERE typname='GameRegion';" \
    "GameRegion"

check_sql "ScreenshotCategory enum exists" \
    "SELECT typname FROM pg_type WHERE typname='ScreenshotCategory';" \
    "ScreenshotCategory"

echo ""
echo "📋 Testing ScreenshotCategory Values:"
echo "------------------------------------"

VALUES=("GAMEPLAY" "TITLE_SCREEN" "MENU" "CUTSCENE" "BOSS_FIGHT" "ENDING" "CREDITS" "EASTER_EGG" "MULTIPLAYER" "CUSTOM")

for value in "${VALUES[@]}"; do
    check_sql "$value enum value" \
        "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'ScreenshotCategory' AND enumlabel='$value';" \
        "$value"
done

echo ""
echo "📋 Testing New Tables:"
echo "---------------------"

check_sql "game_versions table exists" \
    "SELECT table_name FROM information_schema.tables WHERE table_name='game_versions';" \
    "game_versions"

check_sql "saved_searches table exists" \
    "SELECT table_name FROM information_schema.tables WHERE table_name='saved_searches';" \
    "saved_searches"

echo ""
echo "================================"
echo "📊 Verification Results:"
echo "   Passed: $CHECKS_PASSED"
echo "   Failed: $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All schema checks passed!${NC}"
    echo ""
    echo "🎉 Database schema is correct!"
    echo ""
    echo "Next steps:"
    echo "   1. Test backend API: ./test-backend-api.sh"
    echo "   2. Start servers and test frontend"
    exit 0
else
    echo -e "${RED}❌ Some schema checks failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "   - Run migrations: cd backend && npx prisma migrate deploy"
    echo "   - Check migration status: npx prisma migrate status"
    echo "   - Review schema file: backend/prisma/schema.prisma"
    exit 1
fi
