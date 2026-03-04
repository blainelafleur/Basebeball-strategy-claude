#!/usr/bin/env node
/**
 * BSM Code Quality Audit
 * Checks index.jsx for code health issues.
 * Run: node scripts/audit-code.js
 */

const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '..', 'index.jsx');

function main() {
  console.log('🔍 BSM Code Quality Audit\n');

  if (!fs.existsSync(INDEX_PATH)) {
    console.error(`❌ index.jsx not found at ${INDEX_PATH}`);
    process.exit(1);
  }

  const source = fs.readFileSync(INDEX_PATH, 'utf8');
  const lines = source.split('\n');
  console.log(`📄 index.jsx: ${(source.length / 1024).toFixed(0)} KB, ${lines.length} lines\n`);

  const errors = [];
  const warnings = [];
  const info = [];

  // --- Check 1: Scenario count in code vs comments ---
  const scenarioCountMatch = source.match(/(\d+)\s*handcrafted/);
  const actualCount = (source.match(/\{id\s*:\s*["'][^"']+["']/g) || []).length;
  if (scenarioCountMatch) {
    const documented = parseInt(scenarioCountMatch[1]);
    if (Math.abs(documented - actualCount) > 5) {
      warnings.push(`Documented scenario count (${documented}) differs from actual (${actualCount})`);
    } else {
      info.push(`Scenario count: documented=${documented}, actual=${actualCount} ✓`);
    }
  }

  // --- Check 2: AI Proxy URL ---
  const proxyMatch = source.match(/AI_PROXY_URL\s*=\s*["']([^"']+)["']/);
  if (proxyMatch) {
    const url = proxyMatch[1];
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      errors.push(`AI_PROXY_URL points to localhost: ${url}`);
    } else if (url.includes('workers.dev')) {
      info.push(`AI_PROXY_URL: ${url} ✓`);
    } else {
      warnings.push(`AI_PROXY_URL may not be production: ${url}`);
    }
  } else {
    warnings.push('Could not find AI_PROXY_URL constant');
  }

  // --- Check 3: Stripe Payment Links ---
  const stripeLinks = source.match(/https:\/\/buy\.stripe\.com\/[^\s"']+/g) || [];
  if (stripeLinks.length >= 2) {
    info.push(`Stripe Payment Links found: ${stripeLinks.length} ✓`);
  } else if (stripeLinks.length === 0) {
    warnings.push('No Stripe Payment Links found in code');
  } else {
    warnings.push(`Only ${stripeLinks.length} Stripe link(s) found (expected 2: monthly + yearly)`);
  }

  // --- Check 4: console.log statements ---
  const consoleLogs = [];
  lines.forEach((line, i) => {
    // Only flag console.log, not console.warn/error/info
    if (line.match(/console\.log\s*\(/) && !line.trim().startsWith('//')) {
      consoleLogs.push({ line: i + 1, text: line.trim().substring(0, 80) });
    }
  });
  if (consoleLogs.length > 20) {
    warnings.push(`${consoleLogs.length} console.log statements found (consider removing for production)`);
    // Show first 5
    consoleLogs.slice(0, 5).forEach(l => {
      info.push(`  Line ${l.line}: ${l.text}`);
    });
  } else if (consoleLogs.length > 0) {
    info.push(`console.log statements: ${consoleLogs.length} (acceptable)`);
  }

  // --- Check 5: TODO/FIXME/HACK comments ---
  const todoComments = [];
  lines.forEach((line, i) => {
    if (line.match(/\/\/\s*(TODO|FIXME|HACK|XXX|TEMP)\b/i)) {
      todoComments.push({ line: i + 1, text: line.trim().substring(0, 100) });
    }
  });
  if (todoComments.length > 0) {
    warnings.push(`${todoComments.length} TODO/FIXME/HACK comments found:`);
    todoComments.forEach(t => {
      warnings.push(`  Line ${t.line}: ${t.text}`);
    });
  } else {
    info.push('No TODO/FIXME/HACK comments ✓');
  }

  // --- Check 6: Animation types referenced vs defined ---
  const animTypes = new Set();
  const animRefs = source.match(/anim\s*:\s*["'](\w+)["']/g) || [];
  animRefs.forEach(m => {
    const val = m.match(/["'](\w+)["']/);
    if (val) animTypes.add(val[1]);
  });
  info.push(`Animation types used in scenarios: ${[...animTypes].join(', ')}`);

  // --- Check 7: Position arrays all exist ---
  const positions = ['pitcher','catcher','firstBase','secondBase','shortstop','thirdBase',
    'leftField','centerField','rightField','batter','baserunner','manager','famous','rules','counts'];
  const missingPos = positions.filter(p => !source.includes(`${p}:[`) && !source.includes(`${p}: [`));
  if (missingPos.length > 0) {
    errors.push(`Missing position arrays: ${missingPos.join(', ')}`);
  } else {
    info.push('All 15 position arrays present ✓');
  }

  // --- Check 8: DEFAULT state object ---
  if (source.includes('DEFAULT')) {
    const requiredFields = ['gp', 'pts', 'co', 'lv', 'xp', 'str', 'ds', 'bs', 'cl', 'isPro'];
    const missingFields = requiredFields.filter(f => {
      const re = new RegExp(`${f}\\s*:`);
      return !re.test(source.substring(source.indexOf('DEFAULT'), source.indexOf('DEFAULT') + 2000));
    });
    if (missingFields.length > 0) {
      warnings.push(`DEFAULT state may be missing fields: ${missingFields.join(', ')}`);
    } else {
      info.push('DEFAULT state has all required fields ✓');
    }
  } else {
    errors.push('DEFAULT state object not found');
  }

  // --- Check 9: Dead code detection (unreferenced functions) ---
  const funcDefs = source.match(/(?:const|function)\s+(\w+)\s*(?:=\s*(?:\([^)]*\)\s*=>|\w+\s*=>|function)|(?:\s*\())/g) || [];
  const funcNames = funcDefs.map(f => f.match(/(?:const|function)\s+(\w+)/)?.[1]).filter(Boolean);
  let unreferenced = 0;
  funcNames.forEach(name => {
    // Count occurrences (should be at least 2: definition + usage)
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    const matches = source.match(regex) || [];
    if (matches.length === 1 && name.length > 3 && !name.startsWith('_')) {
      unreferenced++;
      if (unreferenced <= 5) {
        warnings.push(`Potentially unreferenced: ${name} (only 1 occurrence)`);
      }
    }
  });
  if (unreferenced > 5) {
    warnings.push(`... and ${unreferenced - 5} more potentially unreferenced functions`);
  }

  // --- Check 10: File size check ---
  const fileSizeKB = source.length / 1024;
  if (fileSizeKB > 2000) {
    warnings.push(`index.jsx is ${fileSizeKB.toFixed(0)} KB — very large, consider if anything can be trimmed`);
  } else {
    info.push(`File size: ${fileSizeKB.toFixed(0)} KB ✓`);
  }

  // --- Report ---
  console.log('═══════════════════════════════════════════');
  console.log('  CODE QUALITY AUDIT REPORT');
  console.log('═══════════════════════════════════════════\n');

  if (info.length > 0) {
    console.log('ℹ️  INFO:');
    info.forEach(i => console.log(`   ${i}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(w => console.log(`   ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(e => console.log(`   ${e}`));
    console.log('');
  }

  const grade = errors.length === 0 ? (warnings.length < 10 ? '🟢 HEALTHY' : '🟡 NEEDS ATTENTION') : '🔴 ISSUES FOUND';
  console.log(`VERDICT: ${grade} (${errors.length} errors, ${warnings.length} warnings)\n`);

  // Write JSON report
  const reportPath = path.join(__dirname, 'code-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    verdict: grade,
    fileSize: `${fileSizeKB.toFixed(0)} KB`,
    lineCount: lines.length,
    scenarioCount: actualCount,
    errors, warnings, info
  }, null, 2));
  console.log(`📝 Report saved to: scripts/code-audit-report.json`);

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
