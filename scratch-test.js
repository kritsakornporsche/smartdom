const fs = require('fs');
const path = require('path');

const srcHeader = path.join(__dirname, 'lib', 'header.jfif');
const destHeaderJpg = path.join(__dirname, 'public', 'up-header.jpg');
const destHeaderJfif = path.join(__dirname, 'public', 'header.jfif');

if (fs.existsSync(srcHeader)) {
  fs.copyFileSync(srcHeader, destHeaderJpg);
  fs.copyFileSync(srcHeader, destHeaderJfif);
  console.log('Successfully copied lib/header.jfif to public/up-header.jpg!');
} else {
  console.error('lib/header.jfif not found');
}
