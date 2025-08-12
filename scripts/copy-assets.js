const fs = require('fs');
const path = require('path');

const from = path.join(__dirname, '..', 'assets');
const to = path.join(__dirname, '..', 'public', 'assets');

fs.mkdirSync(to, { recursive: true });
if (!fs.existsSync(from)) {
  console.log('assets/ folder not found, skipping');
  process.exit(0);
}
for (const f of fs.readdirSync(from)) {
  fs.copyFileSync(path.join(from, f), path.join(to, f));
}
console.log('✔ Copied assets → /public/assets');


