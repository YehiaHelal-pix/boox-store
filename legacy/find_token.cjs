const fs = require('fs');
const os = require('os');

function walk(dir, depth = 0) {
  if (depth > 3) return;
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = dir + '/' + item;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        console.log('  '.repeat(depth) + '[DIR] ' + item);
        walk(full, depth + 1);
      } else {
        console.log('  '.repeat(depth) + item + ' (' + stat.size + ' bytes)');
        if (item.endsWith('.json') || item.endsWith('.db') || item.includes('token') || item.includes('auth')) {
          try {
            const content = fs.readFileSync(full, 'utf8');
            console.log('  '.repeat(depth) + '  → ' + content.slice(0, 200));
          } catch {}
        }
      }
    }
  } catch(e) { console.log('Error:', e.message); }
}

const base = os.homedir() + '/AppData/Roaming/com.vercel.cli';
console.log('Walking:', base);
walk(base);
