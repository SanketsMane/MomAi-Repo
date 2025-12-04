# MOM AI - Production Deployment Guide

## 🚀 Quick Production Setup

This project is now fully deployment-ready with Docker containerization, production builds, and automated deployment scripts.

### Prerequisites

- **Server**: Ubuntu 20.04+ with 2GB+ RAM
- **Docker**: Latest version
- **Domain**: Configure DNS A records
- **SSL**: Self-signed certificates included (replace with proper ones)

### 1. Environment Configuration

Copy and configure production environment:
```bash
cp .env.production.example .env.production
```

Edit `.env.production` with your production values:
- Convex production URL
- Clerk production keys  
- Domain configuration
- Sentry DSN (optional)

### 2. Deploy to Production

**Automated Deployment:**
```bash
sudo ./deploy.sh production
```

**Manual Docker Deployment:**
```bash
# Build and start services
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. DNS Configuration

Set up DNS A records pointing to your server IP:
```
momdigital.in → YOUR_SERVER_IP
www.momdigital.in → YOUR_SERVER_IP  
widget.momdigital.in → YOUR_SERVER_IP
```

### 4. SSL Certificates

**Self-signed (included):**
- Generated automatically by deployment script
- Works for testing but shows browser warnings

**Production SSL (recommended):**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d momdigital.in -d www.momdigital.in -d widget.momdigital.in
```

## 📊 Service Architecture

### Applications
- **Web App**: `https://momdigital.in` (Port 3001)
- **Widget**: `https://widget.momdigital.in` (Port 3002)  
- **Nginx**: Reverse proxy + SSL termination (Ports 80/443)

### Containers
- `mom-ai_web`: Next.js web application
- `mom-ai_widget`: Next.js widget application  
- `mom-ai_nginx`: Nginx reverse proxy

## 🛠️ Management Commands

```bash
# Deployment
pnpm deploy              # Build and deploy
pnpm deploy:logs         # View logs
pnpm deploy:restart      # Restart services
pnpm deploy:stop         # Stop services
pnpm deploy:clean        # Clean Docker cache

# System Service
sudo systemctl start mom-ai     # Start
sudo systemctl stop mom-ai      # Stop
sudo systemctl restart mom-ai   # Restart
sudo systemctl status mom-ai    # Status

# Direct Docker Commands
docker-compose ps               # Service status
docker-compose logs -f web      # Web app logs
docker-compose logs -f widget   # Widget logs
docker-compose logs -f nginx    # Nginx logs
```

## 🔧 Configuration Files

### Production Environment (`.env.production`)
- Database URLs and API keys
- Domain and security configuration
- Feature flags and monitoring

### Docker Configuration
- `Dockerfile`: Multi-stage build for web + widget
- `docker-compose.yml`: Service orchestration
- `nginx/nginx.conf`: Reverse proxy + SSL

### Build Configuration  
- **Turbo**: Monorepo build system
- **Next.js**: Production optimization
- **pnpm**: Package management

## 🚨 Health Monitoring

### Automatic Health Checks
- Web app: `http://localhost:3001`
- Widget: `http://localhost:3002` 
- Nginx: `http://localhost:80`

### Log Files
- Application: `/var/log/mom-ai-deploy.log`
- Nginx: `/var/log/nginx/access.log`
- Docker: `docker-compose logs`

## 📋 Post-Deployment Checklist

### Required
- [ ] Configure `.env.production` with real values
- [ ] Set up proper SSL certificates
- [ ] Configure DNS records
- [ ] Test widget embedding functionality
- [ ] Verify authentication flow

### Recommended  
- [ ] Set up monitoring (Sentry, Uptime Robot)
- [ ] Configure automated backups
- [ ] Set up firewall rules
- [ ] Enable log rotation
- [ ] Configure alerts

### Security
- [ ] Change default organization IDs
- [ ] Review CORS settings
- [ ] Audit environment variables
- [ ] Enable rate limiting
- [ ] Set up intrusion detection

## 🆘 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check port conflicts
sudo lsof -i :3001 -i :3002 -i :80 -i :443

# Check Docker status  
docker-compose ps
docker-compose logs
```

**SSL Certificate errors:**
```bash
# Regenerate self-signed
pnpm ssl:generate

# Check certificate validity
openssl x509 -in nginx/ssl/momdigital.in.crt -text -noout
```

**Widget not loading:**
```bash
# Check widget service
curl -I http://localhost:3002
curl -I https://widget.momdigital.in

# Check widget.js file
curl https://widget.momdigital.in/widget.js
```

### Performance Optimization

**Database:**
- Enable Convex production mode
- Configure proper indexes
- Set up query optimization

**CDN:**
- Use Cloudflare or AWS CloudFront
- Cache static assets
- Enable image optimization

**Monitoring:**
- Set up APM monitoring
- Configure error tracking
- Enable performance metrics

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest code
git pull origin main

# Redeploy
sudo ./deploy.sh production
```

### System Maintenance
```bash
# Clean Docker cache
docker system prune -f

# Update system packages
sudo apt update && sudo apt upgrade

# Backup data
sudo tar -czf backup-$(date +%Y%m%d).tar.gz .
```

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify configuration: `.env.production`
3. Test individual services: `curl` health checks
4. Review this deployment guide

---

**Status**: ✅ Production Ready  
**Last Updated**: December 2024  
**Next Review**: Quarterly