#!/bin/bash

# Quick Start Script - Enhanced Media Management
# Starts backend and frontend servers
# Usage: ./quick-start.sh

echo "🏴‍☠️ Captain Bitbeard - Quick Start"
echo "=================================="
echo ""

# Check if setup was run
if [ ! -d "backend/node_modules" ]; then
    echo "⚠️  Backend dependencies not installed"
    echo "   Run setup first: ./setup-and-test.sh"
    echo ""
    read -p "Run setup now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./setup-and-test.sh
    else
        exit 1
    fi
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to be ready..."
sleep 5

echo "🚀 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=================================="
echo "✅ Servers are running!"
echo "=================================="
echo ""
echo "📡 Backend:  http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "🎮 Next steps:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Login as admin"
echo "   3. Navigate to any game details page"
echo "   4. Click '🎬 UPLOAD MEDIA' to test new features"
echo ""
echo "📖 Features to test:"
echo "   • Upload trailer videos"
echo "   • Upload background music"
echo "   • Upload animated covers"
echo "   • Upload categorized screenshots"
echo "   • View 3D box art"
echo "   • Watch enhanced video player"
echo "   • Listen to background music"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

# Keep script running
wait
