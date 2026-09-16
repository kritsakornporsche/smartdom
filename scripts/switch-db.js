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

let newDb = LOCAL_DB;
let targetMode = 'LOCAL (localhost:3306) [THDDNS has been completely disabled]';

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
