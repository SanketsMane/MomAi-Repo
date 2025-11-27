module.exports = {
  apps: [
    {
      name: 'mom-ai-web',
      script: 'npm',
      args: 'start',
      cwd: './apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true
    },
    {
      name: 'mom-ai-widget',
      script: 'npm',
      args: 'start',
      cwd: './apps/widget',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/widget-error.log',
      out_file: './logs/widget-out.log',
      log_file: './logs/widget-combined.log',
      time: true
    }
  ]
};