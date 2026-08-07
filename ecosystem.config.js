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
        AUTH_URL: 'http://kritsakorn.thddns.net:5993',
        NEXTAUTH_URL: 'http://kritsakorn.thddns.net:5993',
        AUTH_TRUST_HOST: 'true'
      }
    }
  ]
};


