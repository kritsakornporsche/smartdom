const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("process.env.DATABASE_URL || 'postgres://postgres:password@localhost/postgres'")) {
    content = content.replace(/process\.env\.DATABASE_URL \|\| ''/g, "process.env.DATABASE_URL || 'postgres://postgres:password@localhost/postgres'");
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
});
console.log(`Replaced in ${count} files.`);
