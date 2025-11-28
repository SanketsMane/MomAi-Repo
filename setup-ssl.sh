#!/bin/bash

# SSL Certificate Setup for AWS EC2
# This script sets up SSL certificates using Let's Encrypt

set -e

echo "🔒 Setting up SSL Certificates"
echo "=============================="

# Install certbot
echo "📦 Installing certbot..."
sudo yum install -y python3-pip
sudo pip3 install certbot certbot-nginx

# Stop nginx temporarily
sudo systemctl stop nginx

# Get SSL certificates
echo "🔒 Getting SSL certificates..."
sudo certbot certonly --standalone \
  -d momdigital.in \
  -d www.momdigital.in \
  -d widget.momdigital.in \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Copy certificates to nginx directory
echo "📋 Copying certificates..."
sudo mkdir -p /etc/ssl/certs /etc/ssl/private
sudo cp /etc/letsencrypt/live/momdigital.in/fullchain.pem /etc/ssl/certs/momdigital.in.crt
sudo cp /etc/letsencrypt/live/momdigital.in/privkey.pem /etc/ssl/private/momdigital.in.key

# Set proper permissions
sudo chmod 644 /etc/ssl/certs/momdigital.in.crt
sudo chmod 600 /etc/ssl/private/momdigital.in.key

# Copy nginx configuration
echo "⚙️  Setting up nginx configuration..."
sudo cp nginx-momdigital.conf /etc/nginx/conf.d/
sudo nginx -t

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Set up auto-renewal
echo "🔄 Setting up SSL auto-renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

echo "✅ SSL setup completed!"
echo "🌐 Your sites should now be accessible via HTTPS"