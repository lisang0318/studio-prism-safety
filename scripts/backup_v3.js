const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\안전관리';
const dstDir = 'C:\\안전관리_V3_SNAPSHOT';

const exclude = new Set(['node_modules', '.next', '.git']);

function copyRecursive(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (exclude.has(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

if (fs.existsSync(dstDir)) {
  fs.rmSync(dstDir, { recursive: true, force: true });
}

console.log('Starting V3 Backup...');
copyRecursive(srcDir, dstDir);
console.log('V3 Backup Successfully Created at: ' + dstDir);
