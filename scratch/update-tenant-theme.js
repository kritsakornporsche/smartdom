const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'app/tenant/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace hardcoded dark backgrounds
content = content.replaceAll('bg-[#0F172A]', 'bg-card');
content = content.replaceAll('border-white/20/10', 'border-border');
content = content.replaceAll('border-white/10', 'border-border');

// Text colors
content = content.replaceAll('text-4xl md:text-5xl font-black text-white', 'text-4xl md:text-5xl font-black text-foreground');
content = content.replaceAll('text-3xl font-black text-white', 'text-3xl font-black text-foreground');
content = content.replaceAll('text-lg font-black text-white', 'text-lg font-black text-foreground');
content = content.replaceAll('text-2xl sm:text-3xl font-black text-white', 'text-2xl sm:text-3xl font-black text-foreground');
content = content.replaceAll('text-[10px] font-black uppercase tracking-[0.2em] text-white/50', 'text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated app/tenant/page.tsx theme styling!');
