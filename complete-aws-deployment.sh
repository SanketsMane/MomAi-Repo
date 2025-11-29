#!/bin/bash

# Complete AWS Deployment Script for MOM AI
# Uses your existing PEM key and guides through the entire process

set -e

PEM_KEY="/Users/sanket/Downloads/mom-aiserver-ec2-1.pem"
GITHUB_REPO="https://github.com/SanketsMane/MomAi-Repo.git"
DOMAIN="momdigital.in"

echo "🚀 MOM AI AWS Deployment Script"
echo "================================"
echo ""

# Check if PEM key exists
if [ ! -f "$PEM_KEY" ]; then
    echo "❌ PEM key not found at $PEM_KEY"
    exit 1
fi

echo "✅ PEM key found: $PEM_KEY"
echo ""

# Step 1: Get EC2 instance details
echo "📋 Step 1: EC2 Instance Setup"
echo "=============================="
echo ""
echo "Please provide your EC2 instance details:"
read -p "Enter your EC2 instance Public IP: " EC2_IP
read -p "Enter your EC2 instance username (default: ubuntu): " EC2_USER
EC2_USER=${EC2_USER:-ubuntu}

echo ""
echo "Testing SSH connection..."
ssh -i "$PEM_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" "echo 'SSH connection successful!'"

if [ $? -eq 0 ]; then
    echo "✅ SSH connection successful!"
else
    echo "❌ SSH connection failed. Please check:"
    echo "   - EC2 instance is running"
    echo "   - Security group allows SSH (port 22)"
    echo "   - Public IP is correct"
    exit 1
fi

echo ""
echo "📦 Step 2: Server Setup"
echo "======================="

# Create and run server setup script
cat << 'EOF' > temp_server_setup.sh
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
sudo sudo apt install -y certbot python3-certbot-nginx

echo "📁 Creating application directory..."
sudo mkdir -p /var/www/mom-ai /var/log/pm2
sudo chown $USER:$USER /var/www/mom-ai /var/log/pm2

echo "✅ Server setup completed!"
EOF

echo "Running server setup on EC2 instance..."
scp -i "$PEM_KEY" temp_server_setup.sh "$EC2_USER@$EC2_IP:/tmp/"
ssh -i "$PEM_KEY" "$EC2_USER@$EC2_IP" "chmod +x /tmp/temp_server_setup.sh && /tmp/temp_server_setup.sh"

rm temp_server_setup.sh

echo ""
echo "📥 Step 3: Deploy Application"
echo "============================"

# Create deployment script
cat << EOF > temp_deploy_app.sh
#!/bin/bash
set -e

echo "📥 Cloning repository..."
cd /var/www/mom-ai
git clone $GITHUB_REPO .
git checkout dev

echo "📦 Installing dependencies..."
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
pnpm install --frozen-lockfile

echo "🔧 Setting up production environment files..."
cp apps/web/.env.production apps/web/.env.local
cp apps/widget/.env.production apps/widget/.env.local
cp packages/backend/.env.production packages/backend/.env.local

echo "🔨 Building applications..."
pnpm build

echo "✅ Application deployed!"
EOF

echo "Deploying application..."
scp -i "$PEM_KEY" temp_deploy_app.sh "$EC2_USER@$EC2_IP:/tmp/"
ssh -i "$PEM_KEY" "$EC2_USER@$EC2_IP" "chmod +x /tmp/temp_deploy_app.sh && /tmp/temp_deploy_app.sh"

rm temp_deploy_app.sh

echo ""
echo "🔒 Step 4: SSL Certificate Setup"
echo "==============================="

read -p "Enter your email for SSL certificates: " SSL_EMAIL

# Create SSL setup script
cat << EOF > temp_ssl_setup.sh
#!/bin/bash
set -e

echo "🔒 Setting up SSL certificates..."

# Stop nginx if running
sudo systemctl stop nginx 2>/dev/null || true

# Get SSL certificates
sudo certbot certonly --standalone \\
  -d $DOMAIN \\
  -d www.$DOMAIN \\
  -d widget.$DOMAIN \\
  --email $SSL_EMAIL \\
  --agree-tos \\
  --non-interactive

# Copy certificates
sudo mkdir -p /etc/ssl/certs /etc/ssl/private
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/ssl/certs/$DOMAIN.crt
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/ssl/private/$DOMAIN.key
sudo chmod 644 /etc/ssl/certs/$DOMAIN.crt
sudo chmod 600 /etc/ssl/private/$DOMAIN.key

echo "✅ SSL certificates installed!"
EOF

echo "Setting up SSL certificates..."
scp -i "$PEM_KEY" temp_ssl_setup.sh "$EC2_USER@$EC2_IP:/tmp/"
ssh -i "$PEM_KEY" "$EC2_USER@$EC2_IP" "chmod +x /tmp/temp_ssl_setup.sh && /tmp/temp_ssl_setup.sh"

rm temp_ssl_setup.sh

echo ""
echo "⚙️  Step 5: Configure Nginx"
echo "=========================="

# Copy nginx configuration
scp -i "$PEM_KEY" nginx-momdigital.conf "$EC2_USER@$EC2_IP:/tmp/"

ssh -i "$PEM_KEY" "$EC2_USER@$EC2_IP" << 'EOF'
sudo cp /tmp/nginx-momdigital.conf /etc/nginx/conf.d/
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
echo "✅ Nginx configured and started!"
EOF

echo ""
echo "🚀 Step 6: Start Applications"
echo "============================="

ssh -i "$PEM_KEY" "$EC2_USER@$EC2_IP" << 'EOF'
cd /var/www/mom-ai

# Load Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Start applications with PM2
pm2 start ecosystem.config.js
pm2 save

# Set up PM2 to start on boot
PM2_PATH=$(which pm2)
NODE_PATH=$(which node)
sudo env PATH=$PATH:$(dirname $NODE_PATH) $PM2_PATH startup systemd -u $USER --hp $HOME

echo "✅ Applications started with PM2!"
EOF

echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "====================================="
echo ""
echo "🌐 Your applications are now live:"
echo "   Main App: https://$DOMAIN"
echo "   Widget:   https://widget.$DOMAIN"
echo ""
echo "📊 Monitor your applications:"
echo "   ssh -i $PEM_KEY $EC2_USER@$EC2_IP"
echo "   pm2 status"
echo "   pm2 logs"
echo "   pm2 monit"
echo ""
echo "🔄 Manage applications:"
echo "   pm2 restart all"
echo "   pm2 reload all"
echo ""
echo "📋 Next steps:"
echo "   1. Update your DNS A records to point to: $EC2_IP"
echo "   2. Test your applications"
echo "   3. Set up monitoring and backups"
echo ""
echo "🎯 DNS Records to add:"
echo "   Type: A, Name: @, Value: $EC2_IP"
echo "   Type: A, Name: widget, Value: $EC2_IP"