#!/bin/bash

# AWS EC2 Deployment Script for MOM AI
# Run this script on your AWS EC2 instance

set -e

echo "🚀 MOM AI AWS EC2 Deployment"
echo "============================="

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Install pnpm
echo "📦 Installing pnpm..."
npm install -g pnpm

# Install PM2 for process management
echo "📦 Installing PM2..."
npm install -g pm2

# Install nginx
echo "📦 Installing nginx..."
sudo yum install -y nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/mom-ai
sudo chown ec2-user:ec2-user /var/www/mom-ai
cd /var/www/mom-ai

# Clone repository (you'll need to set up Git credentials)
echo "📥 Cloning repository..."
echo "Please set up your Git credentials and clone the repository manually:"
echo "git clone https://github.com/SanketsMane/MomAi-Repo.git ."
echo "Press Enter when done..."
read

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Copy production environment files
echo "⚙️  Setting up environment files..."
cp apps/web/.env.production apps/web/.env.local
cp apps/widget/.env.production apps/widget/.env.local
cp packages/backend/.env.production packages/backend/.env.local

# Build applications
echo "🔨 Building applications..."
pnpm build

echo "✅ Deployment preparation completed!"
echo "Next steps:"
echo "1. Configure nginx"
echo "2. Set up SSL certificates"
echo "3. Start applications with PM2"