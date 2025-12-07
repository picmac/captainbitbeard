#!/bin/bash
# Setup EmulatorJS for self-hosting
# This script downloads the latest EmulatorJS release

set -e

EMULATOR_DIR="frontend/public/emulatorjs"
EMULATOR_REPO="https://github.com/EmulatorJS/EmulatorJS"
LATEST_RELEASE="https://api.github.com/repos/EmulatorJS/EmulatorJS/releases/latest"

echo "🏴‍☠️ Captain Bitbeard - EmulatorJS Setup"
echo "=========================================="

# Create emulator directory if it doesn't exist
mkdir -p "$EMULATOR_DIR"

# Get latest release tag
echo "📡 Fetching latest EmulatorJS release..."
RELEASE_TAG=$(curl -s "$LATEST_RELEASE" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$RELEASE_TAG" ]; then
    echo "❌ Failed to fetch latest release"
    exit 1
fi

echo "✅ Latest version: $RELEASE_TAG"

# Download EmulatorJS
echo "📥 Downloading EmulatorJS..."
DOWNLOAD_URL="$EMULATOR_REPO/archive/refs/tags/$RELEASE_TAG.tar.gz"

curl -L "$DOWNLOAD_URL" -o /tmp/emulatorjs.tar.gz

# Extract
echo "📦 Extracting files..."
tar -xzf /tmp/emulatorjs.tar.gz -C /tmp

# Copy to public directory
EXTRACTED_DIR="/tmp/EmulatorJS-${RELEASE_TAG#v}"
cp -r "$EXTRACTED_DIR/data" "$EMULATOR_DIR/"
cp "$EXTRACTED_DIR/loader.js" "$EMULATOR_DIR/"

# Clean up
rm -rf /tmp/emulatorjs.tar.gz "$EXTRACTED_DIR"

echo "✅ EmulatorJS installed successfully!"
echo "📁 Location: $EMULATOR_DIR"
echo ""
echo "🎮 Next steps:"
echo "   1. Place ROM files in MinIO"
echo "   2. Configure EmulatorJS in your React components"
echo "   3. Add BIOS files if required for certain systems"
