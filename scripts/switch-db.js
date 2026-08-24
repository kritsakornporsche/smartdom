const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

const target = process.argv[2]?.toLowerCase() || 'toggle';

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found');
  process.exit(1);
}

let content = fs.readFileSync(envPath, 'utf8');

const LOCAL_DB = 'mysql://smartdom:smartdom@localhost:3306/smartdomdb';
const REMOTE_DB = 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb';

const currentIsRemote = content.includes('kritsakorn.thddns.net:5994');

let newDb = '';
let targetMode = '';

if (target === 'local') {
  newDb = LOCAL_DB;
  targetMode = 'LOCAL (localhost:3306)';
} else if (target === 'remote' || target === 'thddns') {
  newDb = REMOTE_DB;
  targetMode = 'REMOTE THDDNS (kritsakorn.thddns.net:5994)';
} else {
  // Toggle
  if (currentIsRemote) {
    newDb = LOCAL_DB;
    targetMode = 'LOCAL (localhost:3306)';
  } else {
    newDb = REMOTE_DB;
    targetMode = 'REMOTE THDDNS (kritsakorn.thddns.net:5994)';
  }
}

if (/DATABASE_URL=.*(\r?\n|$)/.test(content)) {
  content = content.replace(/DATABASE_URL=.*(\r?\n|$)/, `DATABASE_URL="${newDb}"\n`);
} else {
  content += `\nDATABASE_URL="${newDb}"\n`;
}

fs.writeFileSync(envPath, content, 'utf8');

console.log(`\n======================================================`);
console.log(`✅ [Database Switched] 🎯 Current Target: ${targetMode}`);
console.log(`   URL: ${newDb}`);
console.log(`======================================================\n`);
