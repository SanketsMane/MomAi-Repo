#!/bin/bash

# EC2 Server Setup Script for MOM AI
# Run this script on your EC2 instance to prepare the environment

set -e

echo "🛠️ Setting up EC2 server for MOM AI deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git unzip build-essential

# Install Node.js 18.x (LTS)
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
print_status "Node.js version: $(node --version)"
print_status "NPM version: $(npm --version)"

# Install pnpm
print_status "Installing pnpm..."
sudo npm install -g pnpm

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
print_status "Installing Nginx..."
sudo apt install -y nginx

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/mom-ai
sudo chown -R $USER:$USER /var/www/mom-ai

# Configure firewall (if UFW is enabled)
print_status "Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 4000

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup | tail -1 | sudo bash || true

print_success "✅ EC2 server setup completed!"
print_success "Server is ready for MOM AI deployment."

echo ""
print_status "Next steps:"
echo "1. Upload your .env files to the server"
echo "2. Run the deployment script"
echo "3. Configure Nginx (optional)"

echo ""
print_status "System Information:"
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "PNPM: $(pnpm --version)"
echo "PM2: $(pm2 --version)"
echo "Nginx: $(nginx -v 2>&1)"