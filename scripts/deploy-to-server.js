const { Client } = require('ssh2');
const WebSocket = require('ws');

const conn = new Client();
const ws = new WebSocket('wss://172.67.144.197/', {
  headers: { 'Host': 'ssh.phannext.com' },
  servername: 'ssh.phannext.com',
  rejectUnauthorized: false
});

const PROJECT_DIR = 'C:\\kritsakorn\\smartdom';

ws.on('open', () => {
  const duplex = WebSocket.createWebSocketStream(ws);
  conn.connect({ sock: duplex, username: 'buain', password: 'Zn@27124700', readyTimeout: 25000 });
});

conn.on('ready', async () => {
  const run = (cmd, timeoutMs = 60000) => new Promise((res) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return res({ out: '', err: err.message });
      let out = '', e = '';
      const t = setTimeout(() => { stream.destroy(); res({ out: out || '[timeout]', err: e }); }, timeoutMs);
      stream.on('data', d => out += d.toString());
      stream.stderr.on('data', d => e += d.toString());
      stream.on('close', () => { clearTimeout(t); res({ out, err: e }); });
    });
  });

  console.log(`[SSH] Connected. Deploying to ${PROJECT_DIR}\n`);

  // ── STEP 1: Git Pull ──────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[1/5] Git Sync (fetch & reset to origin/main)...');
  const gitCmd = `set "PATH=%PATH%;C:\\tools\\git\\cmd;C:\\tools;C:\\tools\\git\\mingw64\\bin" && cd /d "${PROJECT_DIR}" && git fetch origin main 2>&1 && git reset --hard origin/main 2>&1`;
  const pull = await run(gitCmd, 60000);
  console.log(pull.out || pull.err || '[no output]');

  // ── STEP 2: npm install ───────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[2/5] npm install...');
  const install = await run(`cd /d "${PROJECT_DIR}" && npm install --legacy-peer-deps 2>&1`, 120000);
  const installOut = (install.out + install.err);
  // Show last part only (may be long)
  console.log(installOut.slice(-600) || '[no output]');

  // ── STEP 3: Build ─────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[3/5] npm run build (this may take 2-5 min)...');
  const build = await run(`cd /d "${PROJECT_DIR}" && npm run build 2>&1`, 600000);
  const buildOut = (build.out + build.err);
  console.log(buildOut.slice(-2000) || '[no output]');

  // ── STEP 4: Stop existing tasks ───────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[4/5] Stop & restart scheduled tasks...');
  const stop1 = await run('schtasks /end /tn "SmartDomServer" 2>&1', 10000);
  const stop2 = await run('schtasks /end /tn "SmartdomApp3000" 2>&1', 10000);
  const stop3 = await run('schtasks /end /tn "Smartdom3000" 2>&1', 10000);
  console.log('Stop SmartDomServer:', stop1.out.trim() || stop1.err.trim() || 'ok');
  console.log('Stop SmartdomApp3000:', stop2.out.trim() || stop2.err.trim() || 'ok');
  console.log('Stop Smartdom3000:', stop3.out.trim() || stop3.err.trim() || 'ok');

  // Kill any lingering node on port 3000
  const kill = await run('for /f "tokens=5" %a in (\'netstat -aon ^| find ":3000" ^| find "LISTENING"\') do taskkill /F /PID %a 2>&1', 10000);
  console.log('Kill port 3000:', kill.out.trim() || kill.err.trim() || 'no process');

  // ── STEP 5: Start ─────────────────────────────────────────────────────────
  console.log('\n[5/5] Start tasks...');
  // Try to run the most likely active task
  const start1 = await run('schtasks /run /tn "SmartDomServer" 2>&1', 10000);
  console.log('Start SmartDomServer:', start1.out.trim() || start1.err.trim());

  // Wait 5 seconds then check if port 3000 is up
  await new Promise(r => setTimeout(r, 5000));
  const portCheck = await run('netstat -ano | findstr ":3000" | findstr "LISTENING" 2>&1', 10000);
  console.log('\n[Port 3000 status]:', portCheck.out.trim() || portCheck.err.trim() || 'NOT LISTENING yet (may still be starting)');

  console.log('\n[DEPLOY COMPLETE] ✓');
  conn.end();
  ws.close();
  process.exit(0);
});

conn.on('error', (e) => { console.error('[SSH Error]', e.message); ws.close(); process.exit(1); });
ws.on('error', (e) => { console.error('[WS Error]', e.message); process.exit(1); });
setTimeout(() => { console.error('[TIMEOUT - 12 min exceeded]'); conn.end(); ws.close(); process.exit(1); }, 720000);
