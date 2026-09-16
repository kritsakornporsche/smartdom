const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'app/owner/rooms/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Root container
content = content.replace(
  'className="flex-1 flex flex-col bg-[#080F1E] overflow-hidden"',
  'className="flex-1 flex flex-col bg-background text-foreground overflow-hidden"'
);

// 2. Header
content = content.replace(
  'bg-[#0F172A]/70 backdrop-blur-xl border-b border-white/20/10',
  'bg-card/80 backdrop-blur-xl border-b border-border'
);
content = content.replace(
  'text-2xl font-black text-white tracking-tight',
  'text-2xl font-black text-foreground tracking-tight'
);
content = content.replace(
  'text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]',
  'text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]'
);

// 3. Stats & Cards
content = content.replaceAll(
  'bg-[#0F172A] p-5 rounded-3xl border border-white/20/10',
  'bg-card p-5 rounded-3xl border border-border shadow-sm'
);
content = content.replaceAll(
  'text-2xl font-black text-white',
  'text-2xl font-black text-foreground'
);
content = content.replaceAll(
  'text-[10px] font-bold text-white/50 uppercase tracking-widest',
  'text-[10px] font-bold text-muted-foreground uppercase tracking-widest'
);

// 4. Modals and general card backgrounds
content = content.replaceAll(
  'bg-[#0F172A]',
  'bg-card'
);
content = content.replaceAll(
  'border-white/20/10',
  'border-border'
);
content = content.replaceAll(
  'border-white/10',
  'border-border'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated app/owner/rooms/page.tsx theme styling!');
