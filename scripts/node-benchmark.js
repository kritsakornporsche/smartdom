const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  // Sync the optimized app/api/dorms/route.ts
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('app/api/dorms/route.ts', 'C:/kritsakorn/smartdom/app/api/dorms/route.ts', (err2) => {
      if (err2) throw err2;
      console.log('✅ app/api/dorms/route.ts synced to server.');

      const nodeScript = `
        const http = require('http');
        
        const urls = [
          'http://[::1]:3000/',
          'http://[::1]:3000/api/updates',
          'http://[::1]:3000/api/dorms',
          'http://[::1]:3000/api/rooms'
        ];
        
        async function testUrl(u) {
          const start = Date.now();
          return new Promise(resolve => {
            http.get(u, res => {
              let d = '';
              res.on('data', c => d += c);
              res.on('end', () => {
                const duration = Date.now() - start;
                console.log(\`[\${res.statusCode}] \${duration}ms -> \${u} (size: \${d.length} bytes)\`);
                resolve();
              });
            }).on('error', e => {
              console.error(\`[ERR] -> \${u}: \${e.message}\`);
              resolve();
            });
          });
        }
        
        async function main() {
          console.log('--- NODE REAL LATENCY BENCHMARK ---');
          for (const u of urls) {
            await testUrl(u);
          }
        }
        main();
      `;

      conn.exec(`node -e "${nodeScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, (err3, stream) => {
        if (err3) throw err3;
        stream.on('data', d => process.stdout.write(d.toString()));
        stream.stderr.on('data', d => process.stderr.write(d.toString()));
        stream.on('close', code => {
          console.log('\nNode benchmark complete.');
          conn.end();
        });
      });
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
