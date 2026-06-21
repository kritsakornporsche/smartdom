const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'node_modules', '@neondatabase', 'serverless');
const adapterSource = path.join(__dirname, 'lib', 'mysql-adapter.js');

if (!fs.existsSync(targetDir)) {
  console.error('❌ Error: node_modules/@neondatabase/serverless not found. Please run npm install first.');
  process.exit(1);
}

try {
  // 1. Write index.js (CommonJS)
  const adapterContent = fs.readFileSync(adapterSource, 'utf8');
  fs.writeFileSync(path.join(targetDir, 'index.js'), adapterContent, 'utf8');
  console.log('✅ Successfully patched index.js in node_modules/@neondatabase/serverless');

  // 2. Write index.mjs (ESM)
  const esmContent = `import mysqlCore from './index.js';
export const neon = mysqlCore.neon;
export const Pool = mysqlCore.Pool;
export default { neon, Pool };
`;
  fs.writeFileSync(path.join(targetDir, 'index.mjs'), esmContent, 'utf8');
  console.log('✅ Successfully patched index.mjs in node_modules/@neondatabase/serverless');
} catch (err) {
  console.error('❌ Error patching @neondatabase/serverless:', err.message);
  process.exit(1);
}
