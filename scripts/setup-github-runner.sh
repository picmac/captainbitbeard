#!/bin/bash
# Setup GitHub Self-Hosted Runner for Captain Bitbeard
# This script installs and configures a GitHub Actions runner on your local machine

set -e

echo "🏴‍☠️ Captain Bitbeard - GitHub Runner Setup"
echo "==========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
   echo "⚠️  Please do not run this script as root"
   exit 1
fi

# Configuration
RUNNER_VERSION="2.311.0"
RUNNER_DIR="$HOME/actions-runner"
REPO_URL="" # Will be set by user input

# Detect architecture
ARCH=$(uname -m)
case $ARCH in
    x86_64)
        RUNNER_ARCH="x64"
        ;;
    aarch64|arm64)
        RUNNER_ARCH="arm64"
        ;;
    *)
        echo "❌ Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

echo "📦 Detected architecture: $RUNNER_ARCH"
echo ""

# Get GitHub repository details
echo "Please provide your GitHub repository information:"
read -p "GitHub username/organization: " GITHUB_USER
read -p "Repository name: " REPO_NAME
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}"

echo ""
echo "Repository: $REPO_URL"
echo ""

# Get runner registration token
echo "📝 To get the runner registration token:"
echo "   1. Go to: ${REPO_URL}/settings/actions/runners/new"
echo "   2. Copy the registration token"
echo ""
read -p "Enter registration token: " RUNNER_TOKEN

if [ -z "$RUNNER_TOKEN" ]; then
    echo "❌ Registration token is required"
    exit 1
fi

# Create runner directory
echo ""
echo "📁 Creating runner directory..."
mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

# Download runner
echo "📥 Downloading GitHub Actions runner v${RUNNER_VERSION}..."
RUNNER_FILE="actions-runner-linux-${RUNNER_ARCH}-${RUNNER_VERSION}.tar.gz"
curl -o "$RUNNER_FILE" -L "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${RUNNER_FILE}"

# Verify checksum (optional but recommended)
echo "🔍 Verifying checksum..."
if command -v sha256sum &> /dev/null; then
    echo "Run: sha256sum -c <(curl -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${RUNNER_FILE}.sha256)"
fi

# Extract runner
echo "📦 Extracting runner..."
tar xzf "$RUNNER_FILE"
rm "$RUNNER_FILE"

# Configure runner
echo ""
echo "⚙️  Configuring runner..."
./config.sh \
    --url "$REPO_URL" \
    --token "$RUNNER_TOKEN" \
    --name "captain-bitbeard-$(hostname)" \
    --labels "self-hosted,captain-bitbeard,${RUNNER_ARCH}" \
    --work "_work" \
    --unattended \
    --replace

# Install as service
echo ""
echo "🔧 Installing runner as system service..."
sudo ./svc.sh install
sudo ./svc.sh start

echo ""
echo "✅ GitHub Runner installed successfully!"
echo ""
echo "📊 Runner Status:"
sudo ./svc.sh status
echo ""
echo "🎮 Next steps:"
echo "   1. Verify runner appears in: ${REPO_URL}/settings/actions/runners"
echo "   2. Ensure Docker is installed and accessible"
echo "   3. Push code to trigger CI/CD pipeline"
echo ""
echo "📝 Useful commands:"
echo "   Start:   sudo ${RUNNER_DIR}/svc.sh start"
echo "   Stop:    sudo ${RUNNER_DIR}/svc.sh stop"
echo "   Status:  sudo ${RUNNER_DIR}/svc.sh status"
echo "   Logs:    sudo journalctl -u actions.runner.* -f"
echo ""
echo "🏴‍☠️ Happy sailing, Captain!"
