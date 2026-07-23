module.exports = {
  apps: [
    {
      name: 'smartdom-3000',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000 -H 0.0.0.0',
      interpreter: 'node',
      cwd: 'D:/kritsakorn/smartdom',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        AUTH_URL: 'http://kritsakorn.thddns.net:5993',
        NEXTAUTH_URL: 'http://kritsakorn.thddns.net:5993',
        AUTH_TRUST_HOST: 'true'
      }
    },
    {
      name: 'smartdom-5993',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 5993 -H 0.0.0.0',
      interpreter: 'node',
      cwd: 'D:/kritsakorn/smartdom',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 5993,
        HOSTNAME: '0.0.0.0',
        AUTH_URL: 'http://kritsakorn.thddns.net:5993',
        NEXTAUTH_URL: 'http://kritsakorn.thddns.net:5993',
        AUTH_TRUST_HOST: 'true'
      }
    }
  ]
};

