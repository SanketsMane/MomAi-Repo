#!/bin/bash

# Quick EC2 Deployment Commands
# Usage: Source this file to get quick deployment functions

# Load configuration
if [ -f "./deployment.config" ]; then
    source ./deployment.config
fi

EC2_KEY_PATH="./mom-aiserver-ec2.pem"
EC2_USER="ubuntu"

# Quick SSH connection
ec2-ssh() {
    local host=${1:-$EC2_HOST}
    if [ -z "$host" ]; then
        echo "Usage: ec2-ssh <ec2-host>"
        return 1
    fi
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$host"
}

# Quick deployment
ec2-deploy() {
    local host=${1:-$EC2_HOST}
    if [ -z "$host" ]; then
        echo "Usage: ec2-deploy <ec2-host>"
        return 1
    fi
    ./deploy-ec2.sh production "$host"
}

# Check service status on EC2
ec2-status() {
    local host=${1:-$EC2_HOST}
    if [ -z "$host" ]; then
        echo "Usage: ec2-status <ec2-host>"
        return 1
    fi
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$host" "cd /home/ubuntu/mom-ai/current && sudo docker-compose ps"
}

# View logs on EC2
ec2-logs() {
    local host=${1:-$EC2_HOST}
    if [ -z "$host" ]; then
        echo "Usage: ec2-logs <ec2-host>"
        return 1
    fi
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$host" "cd /home/ubuntu/mom-ai/current && sudo docker-compose logs -f"
}

# Restart services on EC2
ec2-restart() {
    local host=${1:-$EC2_HOST}
    if [ -z "$host" ]; then
        echo "Usage: ec2-restart <ec2-host>"
        return 1
    fi
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$host" "cd /home/ubuntu/mom-ai/current && sudo docker-compose restart"
}

# Stop services on EC2
ec2-stop() {
    local host=${1:-$EC2_HOST}
    if [ -z "$host" ]; then
        echo "Usage: ec2-stop <ec2-host>"
        return 1
    fi
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$host" "cd /home/ubuntu/mom-ai/current && sudo docker-compose down"
}

# Update only code (without full redeployment)
ec2-update() {
    local host=${1:-$EC2_HOST}
    if [ -z "$host" ]; then
        echo "Usage: ec2-update <ec2-host>"
        return 1
    fi
    
    echo "🔄 Quick code update to $host..."
    
    # Create quick update package
    tar --exclude='.git' \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='*.log' \
        --exclude='.DS_Store' \
        -czf update.tar.gz .
    
    # Upload and extract
    scp -i "$EC2_KEY_PATH" update.tar.gz "$EC2_USER@$host:/home/ubuntu/mom-ai/"
    
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$host" "
        cd /home/ubuntu/mom-ai/current
        sudo docker-compose down
        tar -xzf ../update.tar.gz
        sudo docker-compose build --no-cache
        sudo docker-compose up -d
    "
    
    rm -f update.tar.gz
    echo "✅ Code update completed"
}

# Get EC2 instance info
ec2-info() {
    local host=${1:-$EC2_HOST}
    if [ -z "$host" ]; then
        echo "Usage: ec2-info <ec2-host>"
        return 1
    fi
    
    echo "🖥️  EC2 Instance Information for $host"
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$host" "
        echo '--- System Info ---'
        uname -a
        echo
        echo '--- Disk Usage ---'
        df -h
        echo
        echo '--- Memory Usage ---'
        free -h
        echo
        echo '--- Docker Info ---'
        sudo docker system df
        echo
        echo '--- Service Status ---'
        if [ -f '/home/ubuntu/mom-ai/current/docker-compose.yml' ]; then
            cd /home/ubuntu/mom-ai/current && sudo docker-compose ps
        else
            echo 'No deployment found'
        fi
    "
}

# Setup SSL certificates using Let's Encrypt
ec2-ssl() {
    local host=${1:-$EC2_HOST}
    local domain=${2:-$PRODUCTION_DOMAIN}
    if [ -z "$host" ] || [ -z "$domain" ]; then
        echo "Usage: ec2-ssl <ec2-host> <domain>"
        return 1
    fi
    
    echo "🔒 Setting up SSL certificates for $domain on $host..."
    
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$host" "
        # Install certbot
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
        
        # Stop nginx temporarily
        cd /home/ubuntu/mom-ai/current
        sudo docker-compose stop nginx
        
        # Generate certificates
        sudo certbot certonly --standalone -d $domain -d www.$domain -d widget.$domain --non-interactive --agree-tos --email admin@$domain
        
        # Copy certificates to nginx directory
        sudo cp /etc/letsencrypt/live/$domain/fullchain.pem nginx/ssl/momdigital.in.crt
        sudo cp /etc/letsencrypt/live/$domain/privkey.pem nginx/ssl/momdigital.in.key
        sudo chown $USER:$USER nginx/ssl/*
        
        # Restart nginx
        sudo docker-compose up -d nginx
        
        echo 'SSL certificates installed successfully'
    "
}

# Show available commands
ec2-help() {
    echo "🚀 MOM AI EC2 Management Commands:"
    echo
    echo "Deployment:"
    echo "  ec2-deploy <host>     - Full deployment to EC2"
    echo "  ec2-update <host>     - Quick code update"
    echo
    echo "Management:"
    echo "  ec2-ssh <host>        - SSH into EC2 instance"
    echo "  ec2-status <host>     - Check service status"
    echo "  ec2-logs <host>       - View service logs"
    echo "  ec2-restart <host>    - Restart services"
    echo "  ec2-stop <host>       - Stop services"
    echo
    echo "Monitoring:"
    echo "  ec2-info <host>       - Show system information"
    echo
    echo "SSL:"
    echo "  ec2-ssl <host> <domain> - Setup SSL certificates"
    echo
    echo "Configuration:"
    echo "  EC2_HOST=$EC2_HOST"
    echo "  EC2_USER=$EC2_USER"
    echo "  EC2_KEY_PATH=$EC2_KEY_PATH"
    echo
    echo "Note: <host> parameter is optional if EC2_HOST is set in deployment.config"
}

# Show help by default
echo "MOM AI EC2 deployment commands loaded!"
echo "Run 'ec2-help' to see available commands"