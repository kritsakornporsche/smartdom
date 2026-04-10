const bcrypt = require('bcryptjs');
const hash = '$2b$12$VyZ3F73uHkbv2a5t1rdLreFljl18kYFljkM2iHFobsbKFj4fJsKpm';
const pws = ['password', '12345678', 'guest123', 'smartdom123', 'smartdom', 'tenant123', 'porsche123', 'porsche', 'asdfghjkl'];

for (const pw of pws) {
  if (bcrypt.compareSync(pw, hash)) {
    console.log('MATCH FOUND:', pw);
    process.exit(0);
  }
}
console.log('No match found');
