// Simple line-count utility to compute lines per file extension in the repo.
// Run with: node scripts/linecount.js

const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      filelist = walk(full, filelist);
    } else {
      filelist.push(full);
    }
  });
  return filelist;
}

function countLines(file) {
  const content = fs.readFileSync(file, 'utf8');
  return content.split('\n').length;
}

function main() {
  const root = path.resolve(__dirname, '..');
  const files = walk(root).filter(f => !f.includes(path.join('node_modules')));
  const stats = {};
  let total = 0;
  files.forEach(f => {
    const ext = path.extname(f) || '(noext)';
    try {
      const lines = countLines(f);
      stats[ext] = (stats[ext] || 0) + lines;
      total += lines;
    } catch (e) {
      // ignore binary or unreadable files
    }
  });

  const items = Object.keys(stats).map(k => ({ ext: k, lines: stats[k] }));
  items.sort((a, b) => b.lines - a.lines);

  console.log('Lines per extension:');
  items.forEach(it => {
    console.log(`${it.ext.padEnd(8)} ${it.lines.toString().padStart(6)}   ${((it.lines/total)*100).toFixed(1)}%`);
  });
  console.log('---------------------------------');
  console.log(`Total lines: ${total}`);
}

main();
