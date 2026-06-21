const fs = require('fs');
const path = require('path');

const directoriesToProcess = [
  path.join(__dirname, '../app/owner'),
  path.join(__dirname, '../app/keeper'),
  path.join(__dirname, '../app/tenant'),
];

const fixes = [
  { from: /bg-\[#0F172A\]\/5/g, to: 'bg-white/5' },
  { from: /bg-\[#0F172A\]\/10/g, to: 'bg-white/10' },
  { from: /bg-\[#0F172A\]\/20/g, to: 'bg-white/20' },
  { from: /bg-\[#0F172A\]\/30/g, to: 'bg-white/30' },
  { from: /bg-\[#0F172A\]\/40/g, to: 'bg-white/40' },
  { from: /bg-\[#0F172A\]\/50/g, to: 'bg-white/50' },
  { from: /bg-\[#0F172A\]\/60/g, to: 'bg-white/60' },
  { from: /bg-\[#0F172A\]\/70/g, to: 'bg-[#0F172A] backdrop-blur-md' },
  { from: /border-white\/20\/10/g, to: 'border-white/10' },
  { from: /border-white\/20\/20/g, to: 'border-white/20' },
  { from: /border-white\/20\/30/g, to: 'border-white/30' },
  { from: /bg-\[#3E342B\]/g, to: 'bg-violet-600' }, // Change primary button color to match Platform (or blue for owner)
  { from: /text-\[#3E342B\]/g, to: 'text-white' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      fixes.forEach(mapping => {
        if (content.match(mapping.from)) {
          content = content.replace(mapping.from, mapping.to);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed CSS in: ${fullPath}`);
      }
    }
  });
}

processDirectory(directoriesToProcess[0]);
processDirectory(directoriesToProcess[1]);
processDirectory(directoriesToProcess[2]);
console.log('✅ Fixes applied!');
