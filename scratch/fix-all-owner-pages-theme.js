const fs = require('fs');
const path = require('path');

const files = [
  'app/owner/billing/page.tsx',
  'app/owner/bookings/page.tsx',
  'app/owner/contracts/page.tsx',
  'app/owner/accounting/page.tsx',
  'app/owner/settings/page.tsx',
  'app/owner/maintenance/page.tsx',
  'app/owner/keepers/page.tsx',
  'app/owner/tenants/page.tsx',
];

files.forEach(rel => {
  const filePath = path.join(__dirname, '..', rel);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Root background
  content = content.replaceAll('bg-[#080F1E] text-slate-100', 'bg-background text-foreground');
  content = content.replaceAll('bg-[#080F1E]', 'bg-secondary/40');

  // Dark card backgrounds
  content = content.replaceAll('bg-[#0F172A]/90', 'bg-card/90');
  content = content.replaceAll('bg-[#0F172A]/80', 'bg-card/80');
  content = content.replaceAll('bg-[#0F172A]/70', 'bg-card/70');
  content = content.replaceAll('bg-[#0F172A]', 'bg-card');

  // Borders
  content = content.replaceAll('border-white/10', 'border-border');
  content = content.replaceAll('border-white/5', 'border-border');

  // Headings
  content = content.replaceAll('font-black text-white', 'font-black text-foreground');
  content = content.replaceAll('font-bold text-white', 'font-bold text-foreground');
  content = content.replaceAll('text-white/50', 'text-muted-foreground');
  content = content.replaceAll('text-white/40', 'text-muted-foreground');
  content = content.replaceAll('text-white/60', 'text-muted-foreground');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully updated theme for ${rel}`);
});
