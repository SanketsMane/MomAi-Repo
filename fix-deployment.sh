#!/bin/bash

# Fix deployment by removing macOS metadata files
set -e

echo "🧹 FIXING DEPLOYMENT - Removing macOS metadata files"
echo "=================================================="

SERVER_IP="3.111.199.28"
SERVER_USER="ubuntu"
SSH_KEY="mom-aiserver-ec2.pem"

echo ""
echo "🔑 Using SSH key: $SSH_KEY"
echo "📡 Connecting to: $SERVER_USER@$SERVER_IP"
echo ""

ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP << 'EOF'

echo "📍 Connected to server: $(hostname)"
echo "🧹 Cleaning macOS metadata files..."

cd /home/ubuntu/mom-ai

# Remove all macOS metadata files
find . -name "._*" -type f -delete
echo "✅ Removed $(find . -name "._*" -type f | wc -l) metadata files"

# Remove .DS_Store files
find . -name ".DS_Store" -type f -delete
echo "✅ Removed .DS_Store files"

echo ""
echo "🔄 Rebuilding applications..."

# Rebuild with cleaned files
pnpm run build

echo ""
echo "⚙️ Creating environment file..."

# Create production environment file
cat > .env.production << 'ENVEOF'
# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsubW9tZGlnaXRhbC5pbiQ"
CLERK_SECRET_KEY="sk_live_clsk_test_xxxxxxxxxxxxxxxx"

# Convex
CONVEX_DEPLOYMENT="pleasant-antelope-42"
NEXT_PUBLIC_CONVEX_URL="https://pleasant-antelope-42.convex.cloud"

# Domain configuration  
NEXT_PUBLIC_APP_URL="https://momdigital.in"
NEXT_PUBLIC_WIDGET_URL="https://widget.momdigital.in"

# Node environment
NODE_ENV="production"
ENVEOF

echo "✅ Environment file created"

echo ""
echo "🚀 Starting applications with PM2..."

# Start applications
pm2 start apps/web/package.json --name "web-app" -- start
pm2 start apps/widget/package.json --name "widget-app" -- start

# Save PM2 configuration
pm2 save
pm2 startup

echo ""
echo "🌐 Configuring Nginx..."

# Update Nginx configuration
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name momdigital.in www.momdigital.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name momdigital.in www.momdigital.in;
    
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name widget.momdigital.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name widget.momdigital.in;
    
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

# Test and restart Nginx
sudo nginx -t && sudo systemctl restart nginx

echo ""
echo "✅ DEPLOYMENT FIXED!"
echo "==================="

echo ""
echo "📊 Status check:"
pm2 status
echo ""
echo "🌐 Nginx status:"
sudo systemctl status nginx --no-pager -l

EOF

echo ""
echo "✅ DEPLOYMENT FIX COMPLETED!"
echo "============================"