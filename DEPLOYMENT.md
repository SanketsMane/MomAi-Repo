# MOM AI Production Deployment Guide - 2.0_Ai Branch

## 🚀 Quick Production Deployment

### Prerequisites Checklist
Before deploying, ensure you have:

- [x] EC2 instance running (3.111.199.28)
- [x] SSH key pair configured for EC2 access
- [ ] Production Convex deployment setup (get deployment URL)
- [ ] Production Clerk account setup (get API keys)
- [ ] Domain name (recommended for production)

## 🎯 One-Command Production Deployment

### 1. Make deployment script executable
```bash
chmod +x deploy-production.sh
```

### 2. Deploy to Production (2.0_Ai Branch)
```bash
./deploy-production.sh
```

This automated script will:
- ✅ Test SSH connection
- ✅ Install required software (Node.js 20, pnpm, PM2, Nginx)
- ✅ Clone 2.0_Ai branch from GitHub
- ✅ Build applications in production mode
- ✅ Configure PM2 for process management
- ✅ Set up Nginx reverse proxy
- ✅ Start applications automatically

### 3. Configure Environment Variables
After deployment, SSH to your server and update the configuration:
```bash
ssh ubuntu@3.111.199.28
cd mom-ai
nano .env.production
```

Update these required values:
```env
# Convex (from your Convex dashboard)
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk (from your Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxx
```

### 4. Restart Services
```bash
pm2 restart all
```

### 5. Verify Deployment
```bash
pm2 status
curl http://localhost:3001
curl http://localhost:3002
```

## Access Your Application
- **Web Application**: http://3.111.199.28
- **Widget**: http://3.111.199.28/widget

## Post-Deployment Tasks

### Set up SSL Certificate (Recommended for Production)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Monitor Applications
```bash
pm2 monit          # Real-time monitoring
pm2 logs           # View logs
pm2 restart all    # Restart all apps
pm2 stop all       # Stop all apps
```

### Update Application
To update the application later:
1. Make changes locally
2. Run `./deploy-advanced.sh` again
3. The script will backup the old version and deploy the new one

## Troubleshooting

### Check Application Status
```bash
pm2 status
pm2 logs mom-ai-web
pm2 logs mom-ai-widget
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check Firewall
```bash
sudo ufw status
```

### Common Issues
1. **Apps won't start**: Check environment variables in `.env.production`
2. **502 Bad Gateway**: Apps might not be running, check `pm2 status`
3. **Can't access from outside**: Check firewall settings and security groups

## Security Recommendations
1. Set up SSL certificate
2. Use environment variables for secrets
3. Regular security updates: `sudo apt update && sudo apt upgrade`
4. Monitor logs regularly
5. Set up automated backups

## Support
If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables
4. Ensure all API keys are correct