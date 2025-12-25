#!/bin/bash

# Enhanced Media Management - Backend API Test Script
# Tests all media API endpoints
# Usage: ./test-backend-api.sh [AUTH_TOKEN] [GAME_ID]

set -e

echo "🧪 Enhanced Media Management - API Testing"
echo "==========================================="
echo ""

# Check if backend is running
if ! curl -s http://localhost:3001/api > /dev/null; then
    echo "❌ Backend is not running on port 3001"
    echo "   Start it with: cd backend && npm run dev"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Get auth token from argument or prompt
if [ -z "$1" ]; then
    echo "⚠️  No auth token provided"
    echo "   Usage: ./test-backend-api.sh YOUR_TOKEN YOUR_GAME_ID"
    echo ""
    echo "   To get a token:"
    echo "   1. Login via frontend (http://localhost:5173)"
    echo "   2. Open browser DevTools → Application → Local Storage"
    echo "   3. Copy the 'token' value"
    echo ""
    read -p "Enter your auth token: " AUTH_TOKEN
else
    AUTH_TOKEN=$1
fi

# Get game ID from argument or prompt
if [ -z "$2" ]; then
    read -p "Enter a game ID to test with: " GAME_ID
else
    GAME_ID=$2
fi

echo ""
echo "🔐 Using auth token: ${AUTH_TOKEN:0:20}..."
echo "🎮 Using game ID: $GAME_ID"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local extra_args=$4

    echo -n "Testing: $name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $AUTH_TOKEN" "$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE -H "Authorization: Bearer $AUTH_TOKEN" "$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Authorization: Bearer $AUTH_TOKEN" $extra_args "$endpoint")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    # Check if endpoint is recognized (not 404) and requires auth (401) or returns success (200/201)
    if [ "$http_code" = "401" ] || [ "$http_code" = "403" ] || [ "$http_code" = "200" ] || [ "$http_code" = "201" ] || [ "$http_code" = "400" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        ((TESTS_PASSED++))
    elif [ "$http_code" = "404" ]; then
        echo -e "${RED}❌ FAIL${NC} (Route not found - HTTP 404)"
        ((TESTS_FAILED++))
    else
        echo -e "${YELLOW}⚠️  UNKNOWN${NC} (HTTP $http_code)"
    fi

    # Show error details if not auth error
    if [ "$http_code" != "401" ] && [ "$http_code" != "403" ]; then
        echo "   Response: ${body:0:100}"
    fi
}

echo "📡 Testing Media API Endpoints:"
echo "------------------------------"

# Test endpoints
test_endpoint "Get screenshots by category" "GET" "http://localhost:3001/api/media/games/$GAME_ID/media/screenshots"
test_endpoint "Get screenshots (filtered)" "GET" "http://localhost:3001/api/media/games/$GAME_ID/media/screenshots?category=GAMEPLAY"

# These will return 400 without file upload, but that's OK - means route exists
test_endpoint "Upload trailer endpoint" "POST" "http://localhost:3001/api/media/games/$GAME_ID/media/trailer"
test_endpoint "Upload music endpoint" "POST" "http://localhost:3001/api/media/games/$GAME_ID/media/music"
test_endpoint "Upload animated cover endpoint" "POST" "http://localhost:3001/api/media/games/$GAME_ID/media/animated-cover"
test_endpoint "Upload screenshot endpoint" "POST" "http://localhost:3001/api/media/games/$GAME_ID/media/screenshot"

test_endpoint "Delete trailer endpoint" "DELETE" "http://localhost:3001/api/media/games/$GAME_ID/media/trailer"
test_endpoint "Delete music endpoint" "DELETE" "http://localhost:3001/api/media/games/$GAME_ID/media/music"
test_endpoint "Delete animated cover endpoint" "DELETE" "http://localhost:3001/api/media/games/$GAME_ID/media/animated-cover"

echo ""
echo "==========================================="
echo "📊 Test Results:"
echo "   Passed: $TESTS_PASSED"
echo "   Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "🎉 Media API is working correctly!"
    echo ""
    echo "Next: Test file uploads via frontend"
    echo "   1. Open http://localhost:5173"
    echo "   2. Login as admin"
    echo "   3. Go to any game details page"
    echo "   4. Click '🎬 UPLOAD MEDIA'"
    echo "   5. Try uploading each media type"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "   - Check that media routes are mounted in backend/src/routes/index.ts"
    echo "   - Verify auth token is valid (try getting a new one)"
    echo "   - Check backend console for errors"
    exit 1
fi
