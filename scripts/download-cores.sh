#!/bin/bash
set -e

echo "🎮 Setting up EmulatorJS cores..."

# Define paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CORES_DIR="$PROJECT_ROOT/frontend/public/emulatorjs/data/cores"
DOWNLOAD_URL="https://github.com/EmulatorJS/EmulatorJS/releases/download/v4.2.3/4.2.3.7z"
TEMP_FILE="/tmp/emulatorjs-cores.7z"
TEMP_EXTRACT="/tmp/emulatorjs-extract"

# Check if cores directory already has files
if [ -d "$CORES_DIR" ] && [ "$(find "$CORES_DIR" -name "*.data" 2>/dev/null | wc -l)" -gt 5 ]; then
    echo "✅ EmulatorJS cores already installed"
    echo "   Found $(find "$CORES_DIR" -name "*.data" 2>/dev/null | wc -l) core files"
    exit 0
fi

# Create cores directory if it doesn't exist
mkdir -p "$CORES_DIR"

# Download cores
echo "📥 Downloading EmulatorJS cores (v4.2.3) - 289MB..."
wget -q --show-progress -O "$TEMP_FILE" "$DOWNLOAD_URL" || {
    echo "❌ Failed to download cores"
    exit 1
}

# Extract cores to temp directory
echo "📦 Extracting cores..."
mkdir -p "$TEMP_EXTRACT"
7z x "$TEMP_FILE" -o"$TEMP_EXTRACT" -y > /dev/null || {
    echo "❌ Failed to extract cores (7z required: apt install p7zip-full)"
    rm -rf "$TEMP_FILE" "$TEMP_EXTRACT"
    exit 1
}

# Copy cores from extracted archive
echo "📁 Installing cores..."
if [ -d "$TEMP_EXTRACT/data/cores" ]; then
    cp -r "$TEMP_EXTRACT/data/cores/"* "$CORES_DIR/"
else
    echo "❌ Unexpected archive structure"
    rm -rf "$TEMP_FILE" "$TEMP_EXTRACT"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_FILE" "$TEMP_EXTRACT"

# Count installed cores
CORE_COUNT=$(find "$CORES_DIR" -name "*.data" 2>/dev/null | wc -l)
echo "✅ EmulatorJS cores installed successfully!"
echo "   Installed $CORE_COUNT core files in $CORES_DIR"
