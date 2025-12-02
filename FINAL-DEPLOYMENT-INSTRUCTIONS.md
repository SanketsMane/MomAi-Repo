# 🚀 MOM AI Deployment - Final Instructions

## Current Status ✅
- ✅ Deployment scripts created
- ✅ SSH key generated
- ✅ Nginx configuration ready
- ✅ PM2 configuration prepared
- ✅ Environment templates created

## SSH Key Setup (Required First Step)

### Your SSH Public Key:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOdtoGCBcd+2En60uv9qqkCOGDnT8Mty0SV5EpBkXMb0 sanket@Sankets-MacBook-Air.local
```

### Add SSH Key to EC2 Instance:

**Method 1: AWS EC2 Console (Recommended)**
1. Go to AWS EC2 Console
2. Select your instance (3.111.199.28)
3. Click "Connect" → "EC2 Instance Connect"
4. Once connected, run:
```bash
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOdtoGCBcd+2En60uv9qqkCOGDnT8Mty0SV5EpBkXMb0 sanket@Sankets-MacBook-Air.local" >> ~/.ssh/authorized_keys
```

**Method 2: AWS CLI (If you have access)**
```bash
aws ec2-instance-connect send-ssh-public-key \
    --instance-id i-your-instance-id \
    --availability-zone your-az \
    --instance-os-user ubuntu \
    --ssh-public-key file://~/.ssh/mom-ai-key.pub
```

## Test SSH Connection
After adding the key, test the connection:
```bash
ssh -i ~/.ssh/mom-ai-key ubuntu@3.111.199.28
```

## Automated Deployment
Once SSH is working, run the deployment:
```bash
./deploy-advanced.sh
```

## Manual Deployment (Alternative)
If automated deployment has issues, you can deploy manually:

### 1. Connect to EC2
```bash
ssh -i ~/.ssh/mom-ai-key ubuntu@3.111.199.28
```

### 2. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm, PM2, and Nginx
sudo npm install -g pnpm@latest pm2@latest
sudo apt install -y nginx git

# Verify installations
node --version    # Should be v20.x
pnpm --version   # Should be 9.x or higher
pm2 --version    # Should be 5.x or higher
```

### 3. Deploy Application
```bash
# Clone repository
git clone https://github.com/SanketsMane/MomAi-Repo.git mom-ai
cd mom-ai

# Checkout dev branch (if needed)
git checkout dev

# Install dependencies
pnpm install --frozen-lockfile

# Build applications
pnpm build

# Create production environment file
nano .env.production
```

### 4. Environment Configuration
Add this content to `.env.production`:
```env
NODE_ENV=production

# Convex Configuration (UPDATE THESE!)
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication (UPDATE THESE!)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Application URLs
NEXT_PUBLIC_APP_URL=http://3.111.199.28
NEXT_PUBLIC_WIDGET_URL=http://3.111.199.28/widget
```

### 5. Start Applications with PM2
```bash
# Start web application
cd apps/web
pm2 start "pnpm start" --name "mom-ai-web" -- --port 3001

# Start widget application
cd ../widget
pm2 start "pnpm start" --name "mom-ai-widget" -- --port 3002

# Save PM2 configuration
pm2 save
pm2 startup
```

### 6. Configure Nginx
```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/mom-ai
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name 3.111.199.28;
    
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
    
    location /widget {
        rewrite ^/widget(.*)$ $1 break;
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/mom-ai /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## Verification Commands
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs

# Test applications locally
curl http://localhost:3001
curl http://localhost:3002

# Test through Nginx
curl http://3.111.199.28

# Check Nginx status
sudo systemctl status nginx
```

## Application Access
- **Main Application**: http://3.111.199.28
- **Widget**: http://3.111.199.28/widget
- **Direct Web App**: http://3.111.199.28:3001
- **Direct Widget**: http://3.111.199.28:3002

## Required API Keys

### Convex Setup
1. Go to https://dashboard.convex.dev
2. Create/select your deployment
3. Get deployment URL and add to `.env.production`

### Clerk Setup  
1. Go to https://dashboard.clerk.com
2. Create/select your application
3. Get publishable key and secret key
4. Add to `.env.production`

## Post-Deployment Tasks
1. ✅ Add API keys to environment
2. ✅ Test user authentication  
3. ✅ Verify chat functionality
4. ✅ Set up SSL certificate (optional)
5. ✅ Configure domain (optional)
6. ✅ Set up monitoring

## Troubleshooting
```bash
# View logs
pm2 logs mom-ai-web
pm2 logs mom-ai-widget
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart all
sudo systemctl restart nginx

# Check processes
pm2 status
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3001
```

## Need Help?
If you encounter issues:
1. Check the logs using commands above
2. Ensure all API keys are correctly set
3. Verify network connectivity
4. Check firewall rules

Your MOM AI application should now be successfully deployed! 🎉