# 🚀 MOM AI Production Deployment - 2.0_Ai Branch

## ✅ **PRODUCTION READY CONFIGURATION**

Your MOM AI project is now configured for **PRODUCTION DEPLOYMENT** on the **2.0_Ai branch**.

## 🎯 One-Command Deployment

Run this single command to deploy to production:

```bash
./deploy-production.sh
```

## 📋 What's Been Fixed

### ✅ **Production Optimizations**
- ✅ Next.js configs optimized for production
- ✅ Removed hardcoded development paths
- ✅ Added compression and performance optimizations
- ✅ Proper React strict mode for production
- ✅ Security headers configured

### ✅ **Build Configuration**
- ✅ Production build scripts added
- ✅ Standalone output for better performance
- ✅ Environment-specific configurations

### ✅ **Deployment Infrastructure**
- ✅ PM2 ecosystem configuration for production
- ✅ Nginx reverse proxy setup
- ✅ Auto-restart and monitoring
- ✅ Production logging configuration

### ✅ **Environment Management**
- ✅ `.env.production` template created
- ✅ Separate environment configs for each app
- ✅ Production-specific variables

## 🔧 **CRITICAL: Update These Before Deployment**

Edit `.env.production` with your actual production values:

```env
# Replace with your production Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxx

# Replace with your production Convex URL
NEXT_PUBLIC_CONVEX_URL=https://your-production.convex.cloud
CONVEX_DEPLOYMENT=your-production-deployment

# Replace with your domain or keep IP for now
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🚀 **Deployment Process**

The `deploy-production.sh` script will:

1. **🔑 Test SSH Connection** - Verify access to your AWS server
2. **📦 Install Dependencies** - Node.js 20, pnpm, PM2, Nginx
3. **📥 Deploy Code** - Clone 2.0_Ai branch and build
4. **⚙️ Configure Services** - PM2 and Nginx setup
5. **🚀 Start Applications** - Launch in production mode
6. **✅ Verify Deployment** - Health checks and status

## 📊 **After Deployment**

Your applications will be available at:
- **🌐 Main App**: http://3.111.199.28
- **🔧 Widget**: http://3.111.199.28/widget

## 🔍 **Monitoring Commands**

```bash
# SSH to your server
ssh -i ~/.ssh/mom-ai-key ubuntu@3.111.199.28

# Check application status
pm2 status
pm2 logs

# Monitor in real-time
pm2 monit

# Restart if needed
pm2 restart all
```

## 🔒 **Production Security (Recommended)**

1. **SSL Certificate Setup**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Firewall Configuration**:
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   ```

## ⚠️ **Important Notes**

- ✅ This configuration is for **2.0_Ai branch ONLY**
- ✅ All changes are optimized for production
- ✅ Development mode warnings are suppressed
- ✅ Performance optimizations are enabled
- ✅ Security headers are configured

## 🎉 **Ready to Deploy!**

Your project is now **production-ready** on the **2.0_Ai branch**. Run the deployment script when you're ready to go live!

```bash
./deploy-production.sh
```