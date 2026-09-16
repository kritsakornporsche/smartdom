const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'app/owner/meters/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Root page container
content = content.replace(
  'className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10 text-white min-h-screen bg-[#0E071D]"',
  'className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10 text-foreground min-h-screen bg-background"'
);

// 2. Header text
content = content.replace(
  'text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2',
  'text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2'
);
content = content.replace(
  'text-xs text-white/50 font-medium mt-1',
  'text-xs text-muted-foreground font-medium mt-1'
);

// 3. Stats cards and filter container
content = content.replaceAll(
  'bg-[#180D2F] border border-purple-500/20',
  'bg-card border border-border'
);
content = content.replaceAll(
  'bg-[#180D2F] rounded-3xl border border-purple-500/20',
  'bg-card rounded-3xl border border-border'
);

// 4. Inputs inside filters and forms
content = content.replaceAll(
  'bg-[#0E071D] border border-purple-500/20 text-white',
  'bg-background border border-border text-foreground'
);
content = content.replaceAll(
  'bg-[#0E071D] border border-purple-500/20',
  'bg-background border border-border text-foreground'
);
content = content.replaceAll(
  'bg-[#0E071D] border border-purple-500/30 text-white',
  'bg-background border border-border text-foreground'
);
content = content.replaceAll(
  'bg-[#0E071D] border border-purple-500/30',
  'bg-background border border-border text-foreground'
);
content = content.replaceAll(
  'bg-[#0E071D]',
  'bg-secondary/40'
);
content = content.replaceAll(
  'bg-[#180D2F]',
  'bg-card'
);
content = content.replaceAll(
  'bg-[#130924]',
  'bg-secondary/30'
);

// 5. Text whites to text-foreground on important elements
content = content.replaceAll('text-white font-mono', 'text-foreground font-mono');
content = content.replaceAll('text-white font-black', 'text-foreground font-black');
content = content.replaceAll('text-white/60 font-mono', 'text-muted-foreground font-mono');
content = content.replaceAll('text-white/70 font-medium', 'text-muted-foreground font-medium');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated app/owner/meters/page.tsx theme styling!');
