#!/bin/bash

# EC2 Cleanup using SSH with PEM key
set -e

echo "🧹 EC2 CLEANUP with SSH"
echo "======================="

SERVER_IP="3.111.199.28"
SERVER_USER="ubuntu"
SSH_KEY="mom-aiserver-ec2.pem"

echo ""
echo "🔑 Using PEM key: $SSH_KEY"
echo "📡 Connecting to: $SERVER_USER@$SERVER_IP"
echo ""

# Test SSH connection
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    echo "❌ SSH connection failed!"
    echo ""
    echo "🔧 Try these fixes:"
    echo "1. Make sure PEM key file exists: ls -la $SSH_KEY"
    echo "2. Set proper permissions: chmod 400 $SSH_KEY"
    echo "3. Check if key name is correct"
    echo ""
    exit 1
fi

echo "✅ SSH connection successful!"
echo ""
echo "🧹 Starting cleanup process..."

ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP << 'EOF'

echo "📍 Connected to server: $(hostname)"
echo "🧹 Starting complete cleanup..."

# Kill all PM2 processes
echo "• Stopping PM2 processes..."
sudo pm2 kill 2>/dev/null || true

# Remove all application files
echo "• Removing application files..."
sudo rm -rf /home/ubuntu/mom-ai
sudo rm -rf /home/ubuntu/*.tar.gz
sudo rm -rf /home/ubuntu/.pm2

# Clean caches
echo "• Cleaning caches..."
sudo rm -rf /home/ubuntu/.npm
sudo rm -rf /home/ubuntu/.pnpm-store  
sudo rm -rf /home/ubuntu/.cache

# Clean nginx configs
echo "• Cleaning nginx configurations..."
sudo rm -f /etc/nginx/sites-available/momdigital*
sudo rm -f /etc/nginx/sites-enabled/momdigital*

# Stop services
echo "• Stopping services..."
sudo systemctl stop nginx 2>/dev/null || true

# Kill any stuck processes
echo "• Killing stuck processes..."
sudo fuser -k 3000/tcp 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true

# Optional: Clean system logs
echo "• Cleaning system logs..."
sudo journalctl --vacuum-time=1d 2>/dev/null || true

echo ""
echo "✅ EC2 CLEANUP COMPLETE!"
echo "========================"

EOF

echo ""
echo "🎉 CLEANUP SUCCESSFUL!"
echo "======================"
echo ""
echo "✅ All applications stopped"
echo "✅ All files removed"
echo "✅ Caches cleared"
echo "✅ Nginx reset"
echo ""
echo "🚀 Ready for fresh deployment!"
echo "   Run: ./fresh-deploy.sh"