const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../index.jsx','utf8');

// Find all scenarios and check for explSimple by difficulty
const idPattern = /\{id\s*:\s*["']([^"']+)["']/g;
let match;
const positions = [];
let idx = 0;

while ((match = idPattern.exec(src)) !== null) {
  positions.push({ id: match[1], start: match.index });
}

let d1=0,d1s=0,d2=0,d2s=0,d3=0,d3s=0;
const d2Missing = [];

for (let i = 0; i < positions.length; i++) {
  const start = positions[i].start;
  const end = i+1 < positions.length ? positions[i+1].start : start + 3000;
  const block = src.substring(start, Math.min(end, start + 3000));

  const dm = block.match(/diff\s*:\s*(\d)/);
  if (!dm) continue;
  const d = parseInt(dm[1]);
  const hasSimple = block.includes('explSimple');

  if (d === 1) { d1++; if (hasSimple) d1s++; }
  if (d === 2) { d2++; if (hasSimple) d2s++; if (!hasSimple) d2Missing.push(positions[i].id); }
  if (d === 3) { d3++; if (hasSimple) d3s++; }
}

console.log('Diff 1 (Rookie):', d1s+'/'+d1, 'have explSimple');
console.log('Diff 2 (Pro):', d2s+'/'+d2, 'have explSimple');
console.log('Diff 3 (All-Star):', d3s+'/'+d3, 'have explSimple');
console.log('Total with explSimple:', (d1s+d2s+d3s)+'/'+(d1+d2+d3));
console.log('\nFirst 20 Diff 2 scenarios missing explSimple:');
d2Missing.slice(0, 20).forEach(id => console.log('  ' + id));
console.log('Total Diff 2 missing:', d2Missing.length);
