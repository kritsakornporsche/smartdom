const bcrypt = require('bcryptjs');
const hash = '$2b$12$VyZ3F73uHkbv2a5t1rdLreFljl18kYFljl18kYFljkM2iHFobsbKFj4fJsKpm';
const pws = ['guesttotenant', 'guesttotenant123', 'guest12345678', 'guest1234', '12341234', 'password1234'];

for (const pw of pws) {
  if (bcrypt.compareSync(pw, hash)) {
    console.log('MATCH FOUND:', pw);
    process.exit(0);
  }
}
console.log('No match found');
