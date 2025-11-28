# AWS Deployment Guide for MOM AI

## 🏗️ Architecture Overview
- **EC2 Instance**: Application hosting (t3.medium recommended)
- **Nginx**: Reverse proxy and SSL termination
- **Let's Encrypt**: Free SSL certificates
- **PM2**: Process management for Node.js apps
- **Route 53**: DNS management (optional)

## 📋 Prerequisites
1. AWS Account with EC2 access
2. Domain name (`momdigital.in`) 
3. SSH key pair for EC2 access

## 🚀 Deployment Steps

### Step 1: Launch EC2 Instance

**Option A: Using CloudFormation (Recommended)**
```bash
# Deploy infrastructure using CloudFormation
aws cloudformation create-stack \
  --stack-name mom-ai-infrastructure \
  --template-body file://cloudformation-template.json \
  --parameters ParameterKey=KeyPairName,ParameterValue=your-key-pair-name \
               ParameterKey=InstanceType,ParameterValue=t3.medium
```

**Option B: Manual EC2 Setup**
1. Launch EC2 instance (Amazon Linux 2)
2. Instance type: t3.medium (2 vCPU, 4GB RAM)
3. Security group: Allow SSH (22), HTTP (80), HTTPS (443)
4. Attach an Elastic IP

### Step 2: Connect and Setup Server
```bash
# SSH to your instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Run the setup script
wget https://raw.githubusercontent.com/SanketsMane/MomAi-Repo/dev/aws-ec2-setup.sh
chmod +x aws-ec2-setup.sh
./aws-ec2-setup.sh
```

### Step 3: Clone and Build Application
```bash
# Clone the repository
cd /var/www/mom-ai
git clone https://github.com/SanketsMane/MomAi-Repo.git .

# Install dependencies and build
pnpm install --frozen-lockfile
pnpm build
```

### Step 4: Configure DNS
Update your domain's DNS records:
```
Type: A Record
Name: @ (or momdigital.in)
Value: YOUR_ELASTIC_IP

Type: A Record  
Name: widget
Value: YOUR_ELASTIC_IP
```

### Step 5: Setup SSL Certificates
```bash
# Run SSL setup (update email in script first)
./setup-ssl.sh
```

### Step 6: Deploy Applications
```bash
# Final deployment
./deploy-aws.sh
```

## 🔧 Management Commands

### Check Application Status
```bash
pm2 status
pm2 logs
pm2 monit
```

### Restart Applications  
```bash
pm2 restart all
pm2 reload all
```

### View Logs
```bash
tail -f /var/log/pm2/mom-ai-web.log
tail -f /var/log/pm2/mom-ai-widget.log
```

### SSL Certificate Renewal
```bash
sudo certbot renew --dry-run
```

## 🌐 Production URLs
- **Main App**: https://momdigital.in
- **Widget**: https://widget.momdigital.in
- **Admin Panel**: https://momdigital.in/dashboard

## 📊 Monitoring & Scaling

### CloudWatch Integration (Optional)
```bash
# Install CloudWatch agent
sudo yum install -y amazon-cloudwatch-agent
```

### Auto Scaling (Advanced)
- Set up Application Load Balancer
- Create Auto Scaling Group
- Use ECS with Fargate for better scaling

## 💰 Cost Estimation
- **t3.medium EC2**: ~$30/month
- **Elastic IP**: $3.65/month (when not attached to running instance)
- **Data Transfer**: Variable based on usage
- **Total**: ~$35-50/month

## 🔒 Security Best Practices
1. ✅ Use SSH keys (no password login)
2. ✅ Enable firewall (Security Groups)
3. ✅ SSL certificates (Let's Encrypt)
4. ✅ Regular updates (`sudo yum update -y`)
5. ✅ PM2 process monitoring
6. 🔲 Set up CloudWatch alarms
7. 🔲 Enable VPC Flow Logs
8. 🔲 Use AWS Systems Manager for maintenance

## 🚨 Troubleshooting

### Application Won't Start
```bash
# Check PM2 status
pm2 status
pm2 logs

# Restart applications
pm2 restart all
```

### SSL Certificate Issues
```bash
# Test SSL renewal
sudo certbot renew --dry-run

# Check certificate expiry
openssl x509 -in /etc/ssl/certs/momdigital.in.crt -text -noout
```

### DNS Issues
```bash
# Test DNS resolution
nslookup momdigital.in
dig momdigital.in
```

## 📈 Next Steps for Production
1. Set up monitoring (CloudWatch, Grafana)
2. Implement CI/CD pipeline (GitHub Actions)
3. Database backups (if using databases)
4. CDN setup (CloudFront)
5. Load balancer for high availability