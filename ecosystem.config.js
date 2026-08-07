module.exports = {
  apps: [
    {
      name: 'smartdom-3001',
      script: 'npm',
      args: 'start',
      exec_mode: 'fork',
      cwd: 'C:/kritsakorn/smartdom',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '0.0.0.0',
        AUTH_URL: 'http://kritsakorn.thddns.net:5996',
        NEXTAUTH_URL: 'http://kritsakorn.thddns.net:5996',
        AUTH_TRUST_HOST: 'true'
      }
    }
  ]
};


