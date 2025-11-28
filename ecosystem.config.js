module.exports = {
  apps: [
    {
      name: 'mom-ai-web',
      script: 'pnpm',
      args: 'start',
      cwd: '/var/www/mom-ai/apps/web',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/mom-ai-web-error.log',
      out_file: '/var/log/pm2/mom-ai-web-out.log',
      log_file: '/var/log/pm2/mom-ai-web.log'
    },
    {
      name: 'mom-ai-widget',
      script: 'pnpm',
      args: 'start',
      cwd: '/var/www/mom-ai/apps/widget',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: '/var/log/pm2/mom-ai-widget-error.log',
      out_file: '/var/log/pm2/mom-ai-widget-out.log',
      log_file: '/var/log/pm2/mom-ai-widget.log',
      time: true
    }
  ]
};