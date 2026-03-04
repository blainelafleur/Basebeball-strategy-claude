const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../index.jsx', 'utf8');

// Extract all scenarios with their explanations
const idPattern = /\{id\s*:\s*["']([^"']+)["']/g;
let match;
const positions = [];

while ((match = idPattern.exec(src)) !== null) {
  positions.push({ id: match[1], start: match.index });
}

const weak = [];

for (let i = 0; i < positions.length; i++) {
  const start = positions[i].start;
  const end = i + 1 < positions.length ? positions[i + 1].start : start + 5000;
  const block = src.substring(start, Math.min(end, start + 5000));

  // Extract explanations array
  const explMatch = block.match(/explanations\s*:\s*\[/);
  if (!explMatch) continue;

  let depth = 1;
  let arrStart = explMatch.index + explMatch[0].length;
  let arrEnd = arrStart;
  for (let j = arrStart; j < block.length && depth > 0; j++) {
    if (block[j] === '[') depth++;
    if (block[j] === ']') depth--;
    arrEnd = j;
  }
  const arrContent = block.substring(arrStart, arrEnd);

  // Parse individual strings
  const strings = [];
  let inStr = false, strStart = 0, quoteChar = '';
  for (let j = 0; j < arrContent.length; j++) {
    if (!inStr && (arrContent[j] === '"' || arrContent[j] === "'")) {
      inStr = true; quoteChar = arrContent[j]; strStart = j + 1;
    } else if (inStr && arrContent[j] === quoteChar && arrContent[j - 1] !== '\\') {
      strings.push(arrContent.substring(strStart, j));
      inStr = false;
    }
  }

  // Score each explanation
  for (let ei = 0; ei < strings.length; ei++) {
    const expl = strings[ei];
    const words = expl.split(/\s+/).length;
    const hasData = /\d+%|\d+\.\d+|MLB|average|per|stats?/i.test(expl);
    const hasWhy = /because|since|this is why|the reason|key here/i.test(expl);
    const isGeneric = /good choice|nice|correct|right|wrong/i.test(expl) && words < 15;

    let score = words; // Base score = word count
    if (hasData) score += 10;
    if (hasWhy) score += 5;
    if (isGeneric) score -= 20;

    if (score < 20) {
      weak.push({
        id: positions[i].id,
        optionIdx: ei,
        words,
        score,
        hasData,
        hasWhy,
        text: expl.substring(0, 120) + (expl.length > 120 ? '...' : '')
      });
    }
  }
}

// Sort by score ascending (weakest first)
weak.sort((a, b) => a.score - b.score);

console.log(`Found ${weak.length} weak explanations (score < 20)\n`);
console.log('Top 30 weakest:');
weak.slice(0, 30).forEach((w, i) => {
  console.log(`\n${i + 1}. [${w.id}] option ${w.optionIdx} — score: ${w.score}, words: ${w.words}`);
  console.log(`   "${w.text}"`);
});
