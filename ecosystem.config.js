module.exports = {
  apps: [
    {
      name: 'smartdom',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 5993',
      interpreter: 'node',
      cwd: 'D:/kritsakorn/smartdom',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5993,
        HOSTNAME: '0.0.0.0'
      }
    }
  ]
};
