const fs = require('fs');
const path = require('path');

const directoriesToProcess = [
  path.join(__dirname, '../app/owner'),
  path.join(__dirname, '../app/keeper'),
  path.join(__dirname, '../app/tenant'),
];

const colorMappings = [
  { from: /bg-\[#FDFBF7\]/g, to: 'bg-[#080F1E]' },
  { from: /bg-\[#FAF8F5\]/g, to: 'bg-[#0F172A]' },
  { from: /bg-white/g, to: 'bg-[#0F172A]' }, // Cards to slate
  { from: /border-\[#E5DFD3\]/g, to: 'border-white/10' },
  { from: /text-\[#3E342B\]/g, to: 'text-white' },
  { from: /text-\[#5A4D41\]/g, to: 'text-white/80' },
  { from: /text-\[#A08D74\]/g, to: 'text-white/50' },
  { from: /bg-\[#F3EFE9\]/g, to: 'bg-white/5' },
  { from: /bg-\[#E5DFD3\]/g, to: 'bg-white/10' },
  { from: /bg-\[#F2EFE9\]/g, to: 'bg-white/5' },
  { from: /border-white/g, to: 'border-white/20' }, // To prevent pure white borders
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

      colorMappings.forEach(mapping => {
        if (content.match(mapping.from)) {
          content = content.replace(mapping.from, mapping.to);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated theme for: ${fullPath}`);
      }
    }
  });
}

console.log('🚀 Starting global theme replacement...');
directoriesToProcess.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
});
console.log('✅ Global theme replacement complete!');
