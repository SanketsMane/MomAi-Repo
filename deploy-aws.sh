#!/bin/bash

# Complete AWS Deployment Script
# Run this after initial setup is complete

set -e

echo "🚀 Final AWS Deployment Steps"
echo "============================="

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/log/pm2
sudo chown ec2-user:ec2-user /var/log/pm2

# Copy ecosystem config
echo "📋 Setting up PM2 configuration..."
cp ecosystem.config.js /var/www/mom-ai/

# Start applications with PM2
echo "🚀 Starting applications..."
cd /var/www/mom-ai
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v20.*/bin /home/ec2-user/.nvm/versions/node/v20.*/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your applications are now running:"
echo "   Main app: https://momdigital.in"
echo "   Widget: https://widget.momdigital.in"
echo ""
echo "📊 Monitor applications:"
echo "   pm2 status"
echo "   pm2 logs"
echo "   pm2 monit"
echo ""
echo "🔄 Manage applications:"
echo "   pm2 restart all"
echo "   pm2 stop all"
echo "   pm2 reload all"