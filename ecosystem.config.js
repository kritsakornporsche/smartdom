module.exports = {
  apps: [
    {
      name: 'smartdom-3000',
      script: 'node_modules/next/dist/bin/next',
      interpreter: 'node',
      args: 'start -p 3000 -H 0.0.0.0',
      exec_mode: 'fork',
      cwd: 'C:/kritsakorn/smartdom',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        AUTH_URL: 'https://smartdorm.phannext.com',
        NEXTAUTH_URL: 'https://smartdorm.phannext.com',
        AUTH_TRUST_HOST: 'true'
      }
    }
  ]
};


