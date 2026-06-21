const fs = require('fs');
const path = require('path');

const replacements = [
  // Primary color variations #8B6A2B
  { search: /text-\[#8B6A2B\]/g, replace: 'text-primary' },
  { search: /bg-\[#8B6A2B\]/g, replace: 'bg-primary' },
  { search: /border-\[#8B6A2B\]/g, replace: 'border-primary' },
  { search: /shadow-\[#8B6A2B\]/g, replace: 'shadow-primary' },
  { search: /ring-\[#8B6A2B\]/g, replace: 'ring-primary' },
  { search: /accent-\[#8B6A2B\]/g, replace: 'accent-primary' },
  { search: /focus:ring-\[#8B6A2B\]/g, replace: 'focus:ring-primary' },
  { search: /focus:border-\[#8B6A2B\]/g, replace: 'focus:border-primary' },
  { search: /hover:bg-\[#725724\]/g, replace: 'hover:bg-primary/90' },
  { search: /hover:bg-\[#A08D74\]/g, replace: 'hover:bg-primary/90' },
  { search: /hover:bg-\[#8B7355\]/g, replace: 'hover:bg-primary/90' },
  
  // Secondary earthtone #8B7355
  { search: /text-\[#8B7355\]/g, replace: 'text-primary' },
  { search: /bg-\[#8B7355\]/g, replace: 'bg-primary' },
  { search: /border-\[#8B7355\]/g, replace: 'border-primary' },
  { search: /shadow-\[#8B7355\]/g, replace: 'shadow-primary' },
  { search: /ring-\[#8B7355\]/g, replace: 'ring-primary' },
  { search: /focus:ring-\[#8B7355\]/g, replace: 'focus:ring-primary' },
  { search: /focus:border-\[#8B7355\]/g, replace: 'focus:border-primary' },
  { search: /border-\[#8B7355\]\/20/g, replace: 'border-primary/20' },
  { search: /border-\[#8B7355\]\/30/g, replace: 'border-primary/30' },
  { search: /border-\[#8B7355\]\/40/g, replace: 'border-primary/40' },
  { search: /border-\[#8B7355\]\/10/g, replace: 'border-primary/10' },
  { search: /focus:ring-\[#8B7355\]\/20/g, replace: 'focus:ring-primary/20' },
  { search: /focus:ring-\[#8B7355\]\/5/g, replace: 'focus:ring-primary/5' },
  { search: /focus:ring-\[#8B7355\]\/10/g, replace: 'focus:ring-primary/10' },
  { search: /background=8B7355/g, replace: 'background=6366F1' },
  { search: /bg-\[#8B7355\]\/5/g, replace: 'bg-primary/5' },
  { search: /bg-\[#8B7355\]\/10/g, replace: 'bg-primary/10' },
  { search: /bg-\[#8B7355\]\/20/g, replace: 'bg-primary/20' },
  { search: /shadow-\[#8B7355\]\/20/g, replace: 'shadow-primary/20' },
  { search: /shadow-\[#8B7355\]\/30/g, replace: 'shadow-primary/30' },
  { search: /hover:border-\[#8B7355\]/g, replace: 'hover:border-primary' },

  // Secondary text & background variations
  { search: /hover:bg-\[#5A4D41\]/g, replace: 'hover:bg-primary/90' },
  { search: /text-\[#8B7355\]/g, replace: 'text-muted-foreground' },
  { search: /text-\[#DCD3C6\]/g, replace: 'text-muted-foreground/60' },
  { search: /border-\[#DCD3C6\]/g, replace: 'border-border' },
  { search: /bg-\[#FAF8F5\]/g, replace: 'bg-background' },
  { search: /border-\[#E5DFD3\]/g, replace: 'border-border' },
  { search: /text-\[#3E342B\]/g, replace: 'text-foreground' },
  { search: /bg-\[#FAF9F6\]/g, replace: 'bg-background' },
  { search: /bg-\[#FDFBF7\]/g, replace: 'bg-background' },
  { search: /bg-\[#F5F3ED\]/g, replace: 'bg-secondary' },
  { search: /bg-\[#F2F1ED\]/g, replace: 'bg-muted' },
  { search: /bg-\[#EFE9DB\]/g, replace: 'bg-accent' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const rep of replacements) {
        if (rep.search.test(content)) {
          content = content.replace(rep.search, rep.replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

// Start processing the app directory
const appDir = path.join(__dirname, '..', 'app');
console.log(`Starting theme replacements in ${appDir}...`);
processDirectory(appDir);
console.log('Theme replacement complete.');
