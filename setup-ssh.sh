#!/bin/bash

# SSH Setup and Deployment Guide for MOM AI
# This script will guide you through SSH setup and deployment

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() { echo -e "${BLUE}[STEP]${NC} $1"; }

print_header "MOM AI Deployment Setup"
print_status "EC2 Instance: 3.111.199.28"
print_status ""

print_error "SSH Connection Failed - Permission denied (publickey)"
print_status ""
print_warning "You need to set up SSH access to your EC2 instance first."
print_status ""

print_header "SSH Setup Options:"
print_status ""
print_status "Option 1: Use existing PEM key from AWS"
print_status "If you have a .pem file from when you created the EC2 instance:"
print_status "  1. Move your .pem file to ~/.ssh/ directory"
print_status "  2. Set correct permissions: chmod 400 ~/.ssh/your-key.pem"
print_status "  3. Test connection: ssh -i ~/.ssh/your-key.pem ubuntu@3.111.199.28"
print_status ""

print_status "Option 2: Generate new SSH key and add to EC2"
print_status "  1. Generate key: ssh-keygen -t rsa -b 4096 -f ~/.ssh/mom-ai-key"
print_status "  2. Copy public key: cat ~/.ssh/mom-ai-key.pub"
print_status "  3. Add to EC2 instance authorized_keys (through EC2 console or existing access)"
print_status ""

print_status "Option 3: Use AWS Systems Manager Session Manager"
print_status "  1. Install AWS CLI: brew install awscli"
print_status "  2. Configure: aws configure"
print_status "  3. Install session manager plugin"
print_status "  4. Connect: aws ssm start-session --target i-your-instance-id"
print_status ""

print_header "Quick Setup Commands:"
print_status ""

# Check if user has AWS CLI
if command -v aws &> /dev/null; then
    print_status "✅ AWS CLI found"
else
    print_warning "❌ AWS CLI not found. Install with: brew install awscli"
fi

# Check for existing SSH keys
if [ -f ~/.ssh/id_rsa.pub ]; then
    print_status "✅ SSH key found: ~/.ssh/id_rsa.pub"
    print_status "Public key content:"
    print_status "$(cat ~/.ssh/id_rsa.pub)"
    print_status ""
    print_warning "Copy the above public key to your EC2 instance ~/.ssh/authorized_keys file"
elif [ -f ~/.ssh/id_ed25519.pub ]; then
    print_status "✅ SSH key found: ~/.ssh/id_ed25519.pub"
    print_status "Public key content:"
    print_status "$(cat ~/.ssh/id_ed25519.pub)"
    print_status ""
    print_warning "Copy the above public key to your EC2 instance ~/.ssh/authorized_keys file"
else
    print_warning "❌ No SSH keys found. Generate one with:"
    print_status "ssh-keygen -t ed25519 -f ~/.ssh/mom-ai-key"
fi

print_status ""
print_header "After SSH Setup, Deploy with:"
print_status "./deploy-advanced.sh"
print_status ""

print_header "Alternative: Manual Deployment"
print_status "If SSH setup is complex, you can deploy manually:"
print_status ""
print_status "1. Connect to EC2 through AWS console (EC2 Instance Connect)"
print_status "2. Run these commands on the server:"
print_status ""

cat << 'EOF'
# Update system
sudo apt update

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm and PM2
sudo npm install -g pnpm pm2

# Install Nginx
sudo apt install -y nginx

# Clone or upload your project
git clone https://github.com/SanketsMane/MomAi-Repo.git mom-ai
# OR upload files manually

cd mom-ai
pnpm install
pnpm build

# Start with PM2
cd apps/web
pm2 start "pnpm start" --name "mom-ai-web" -- --port 3001

cd ../widget  
pm2 start "pnpm start" --name "mom-ai-widget" -- --port 3002

# Save PM2 config
pm2 save
pm2 startup
EOF

print_status ""
print_warning "Remember to:"
print_status "1. Set up environment variables"
print_status "2. Configure Nginx reverse proxy"
print_status "3. Set up firewall rules"
print_status "4. Add your Convex and Clerk API keys"