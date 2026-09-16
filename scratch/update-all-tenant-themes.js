const fs = require('fs');
const path = require('path');

const files = [
  'app/tenant/billing/page.tsx',
  'app/tenant/maintenance/page.tsx',
  'app/tenant/contract/page.tsx',
  'app/tenant/move-out/page.tsx',
];

files.forEach(rel => {
  const file = path.join(__dirname, '..', rel);
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace dark backgrounds with theme card/secondary
  content = content.replaceAll('bg-[#0F172A]', 'bg-card');
  content = content.replaceAll('bg-[#080F1E]', 'bg-secondary/40');
  content = content.replaceAll('bg-[#0B0F19]', 'bg-secondary/60');
  content = content.replaceAll('bg-slate-900', 'bg-card');

  // Borders
  content = content.replaceAll('border-white/20/10/50', 'border-border');
  content = content.replaceAll('border-white/20/10', 'border-border');
  content = content.replaceAll('border-white/10', 'border-border');

  // Text
  content = content.replaceAll('text-3xl font-black text-white', 'text-3xl font-black text-foreground');
  content = content.replaceAll('text-2xl font-black text-white', 'text-2xl font-black text-foreground');
  content = content.replaceAll('text-xl font-black text-white', 'text-xl font-black text-foreground');
  content = content.replaceAll('text-4xl font-black text-white', 'text-4xl font-black text-foreground');
  content = content.replaceAll('text-white/50', 'text-muted-foreground');
  content = content.replaceAll('text-white/40', 'text-muted-foreground');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${rel}`);
});
