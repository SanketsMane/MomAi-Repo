#!/bin/bash

# Production Monitoring and Auto-Recovery Script for MOM AI
# This script ensures applications are always running and healthy

LOG_FILE="/home/ubuntu/production-monitor.log"
CHATBOT_DIR="/home/ubuntu/CHATBOT-MOM"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to check application health
check_app_health() {
    local port=$1
    local app_name=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port)
    
    if [ "$response" = "200" ]; then
        log_message "✅ $app_name (port $port) is healthy"
        return 0
    else
        log_message "❌ $app_name (port $port) is unhealthy (response: $response)"
        return 1
    fi
}

# Function to restart applications
restart_applications() {
    log_message "🔄 Restarting applications..."
    
    cd "$CHATBOT_DIR"
    source ~/.nvm/nvm.sh
    nvm use node
    
    # Stop all processes
    pm2 delete all 2>/dev/null || true
    pkill -f "next" 2>/dev/null || true
    
    sleep 5
    
    # Start applications
    pm2 start production.ecosystem.config.js
    
    sleep 10
    
    log_message "🚀 Applications restarted"
}

# Function to check and restart Nginx
check_nginx() {
    if ! sudo systemctl is-active --quiet nginx; then
        log_message "🔧 Nginx is down, restarting..."
        sudo systemctl restart nginx
        log_message "✅ Nginx restarted"
    fi
}

# Main monitoring loop
main() {
    log_message "🚀 Starting production monitoring for MOM AI"
    
    # Check Nginx
    check_nginx
    
    # Check applications
    web_healthy=false
    widget_healthy=false
    
    if check_app_health 3000 "Web App"; then
        web_healthy=true
    fi
    
    if check_app_health 3001 "Widget App"; then
        widget_healthy=true
    fi
    
    # Restart if any application is unhealthy
    if [ "$web_healthy" = false ] || [ "$widget_healthy" = false ]; then
        log_message "🚨 One or more applications are unhealthy, initiating restart..."
        restart_applications
        
        # Wait and check again
        sleep 30
        
        web_status="Failed"
        widget_status="Failed"
        
        if check_app_health 3000 "Web App"; then
            web_status="OK"
        fi
        
        if check_app_health 3001 "Widget App"; then
            widget_status="OK"
        fi
        
        log_message "📊 Post-restart status - Web: $web_status, Widget: $widget_status"
    fi
    
    # Check disk space
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 80 ]; then
        log_message "⚠️ Disk usage is $disk_usage% - consider cleanup"
    fi
    
    # Check memory
    memory_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    log_message "📊 System stats - Memory: ${memory_usage}%, Disk: ${disk_usage}%"
    
    log_message "✅ Monitoring cycle completed"
}

# Create systemd service for this monitor
create_systemd_service() {
    sudo tee /etc/systemd/system/mom-ai-monitor.service << 'EOF'
[Unit]
Description=MOM AI Production Monitor
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=/home/ubuntu/production-monitor.sh
Restart=always
RestartSec=300

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable mom-ai-monitor.service
    sudo systemctl start mom-ai-monitor.service
}

# Set up cron job for regular monitoring
setup_cron() {
    (crontab -l 2>/dev/null; echo "*/5 * * * * /home/ubuntu/production-monitor.sh") | crontab -
    log_message "⏰ Cron job set up for 5-minute monitoring intervals"
}

# If script is run with 'install' parameter, set up monitoring
if [ "$1" = "install" ]; then
    log_message "📦 Installing production monitoring system..."
    create_systemd_service
    setup_cron
    log_message "✅ Production monitoring system installed"
else
    # Run monitoring check
    main
fi