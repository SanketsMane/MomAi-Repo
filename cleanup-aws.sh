#!/bin/bash

# EC2 Cleanup using AWS Session Manager
set -e

echo "🧹 EC2 CLEANUP via AWS Session Manager"
echo "======================================"

INSTANCE_ID="i-0abcd1234567890ef"  # Replace with actual instance ID
REGION="ap-south-1"

echo ""
echo "🔧 Using AWS Session Manager..."
echo "📡 Region: $REGION"
echo "🖥️  Instance ID: $INSTANCE_ID"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found!"
    echo ""
    echo "🔧 Install AWS CLI:"
    echo "brew install awscli"
    exit 1
fi

# Check if Session Manager plugin is installed
if ! aws ssm describe-instance-information --region $REGION --output text --query 'InstanceInformationList[0].InstanceId' 2>/dev/null; then
    echo "❌ Session Manager plugin not found!"
    echo ""
    echo "🔧 Install Session Manager plugin:"
    echo "curl 'https://s3.amazonaws.com/session-manager-downloads/plugin/latest/mac/sessionmanager-bundle.zip' -o 'sessionmanager-bundle.zip'"
    echo "unzip sessionmanager-bundle.zip"
    echo "sudo ./sessionmanager-bundle/install -i /usr/local/sessionmanagerplugin -b /usr/local/bin/session-manager-plugin"
    exit 1
fi

echo "✅ AWS tools ready!"
echo ""
echo "🧹 Starting cleanup process..."

# Create cleanup script
cat << 'CLEANUP_SCRIPT' > /tmp/cleanup.sh
#!/bin/bash

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
sudo apt-get clean 2>/dev/null || true
sudo npm cache clean --force 2>/dev/null || true

# Remove old logs
echo "• Cleaning logs..."
sudo journalctl --vacuum-time=1d 2>/dev/null || true
sudo rm -rf /var/log/*.log.* 2>/dev/null || true

# Reset Nginx (keep config but clear any custom sites)
echo "• Resetting Nginx..."
sudo systemctl stop nginx 2>/dev/null || true
sudo rm -f /etc/nginx/sites-enabled/mom-ai* 2>/dev/null || true
sudo systemctl start nginx 2>/dev/null || true

# Clean up any leftover processes
echo "• Cleaning processes..."
sudo pkill -f "node" 2>/dev/null || true
sudo pkill -f "npm" 2>/dev/null || true
sudo pkill -f "pnpm" 2>/dev/null || true

echo ""
echo "✅ Cleanup completed successfully!"
echo "🔄 Server is ready for fresh deployment"
echo ""

CLEANUP_SCRIPT

# Execute cleanup via Session Manager
echo "🚀 Executing cleanup on EC2..."
aws ssm start-session --target $INSTANCE_ID --region $REGION --document-name AWS-StartInteractiveCommand --parameters command="bash /tmp/cleanup.sh"

echo ""
echo "✅ EC2 cleanup completed!"
echo "🔄 Ready for fresh deployment"