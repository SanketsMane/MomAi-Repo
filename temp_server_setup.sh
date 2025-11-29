#!/bin/bash
set -e

echo "📦 Installing system dependencies..."
sudo apt update && sudo apt upgrade -y

echo "📦 Installing Node.js 20..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20

echo "📦 Installing pnpm and PM2..."
npm install -g pnpm pm2

echo "📦 Installing Nginx..."
sudo apt install -y nginx

echo "📦 Installing Git and other tools..."
sudo apt install -y git python3-pip

echo "🔒 Installing certbot for SSL..."
sudo pip3 install certbot certbot-nginx

echo "📁 Creating application directory..."
sudo mkdir -p /var/www/mom-ai /var/log/pm2
sudo chown $USER:$USER /var/www/mom-ai /var/log/pm2

echo "✅ Server setup completed!"
