#!/bin/bash
set -e

echo "🐋 Installing Docker on Ubuntu 24.04..."

# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
sudo apt-get update

# Install Docker Engine, containerd, and Docker Compose
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

echo "✅ Docker installation complete!"
echo ""
echo "Docker version:"
docker --version
echo ""
echo "Docker Compose version:"
docker compose version
echo ""
echo "⚠️  WICHTIG: Sie müssen sich ab- und wieder anmelden, damit die Gruppenmitgliedschaft wirksam wird!"
echo "    Alternativ: newgrp docker"
echo ""
echo "Test: docker run hello-world"
