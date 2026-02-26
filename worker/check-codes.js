#!/usr/bin/env node
// Check the status of all promo codes in Cloudflare KV
// Usage: node check-codes.js [code]
//   No args:  checks all codes in the PROMO_CODES namespace
//   With arg: checks a single code (e.g., node check-codes.js BSM-KY8EY7)

const { execSync } = require("child_process");

function getKey(key) {
  try {
    const raw = execSync(
      `npx wrangler kv key get --binding=PROMO_CODES --remote "${key}"`,
      { cwd: __dirname, stdio: "pipe" }
    ).toString();
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function listKeys() {
  try {
    const raw = execSync(
      `npx wrangler kv key list --binding=PROMO_CODES --remote`,
      { cwd: __dirname, stdio: "pipe" }
    ).toString();
    return JSON.parse(raw).map((k) => k.name);
  } catch (err) {
    console.error("Failed to list keys:", err.stderr?.toString() || err.message);
    process.exit(1);
  }
}

function formatDate(ts) {
  return ts ? new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";
}

async function main() {
  const single = process.argv[2];

  if (single) {
    const code = single.trim().toUpperCase();
    const entry = getKey(`code:${code}`);
    if (!entry) {
      console.log(`${code}: NOT FOUND`);
    } else {
      console.log(`${code}: ${entry.type} · ${entry.used ? "USED " + formatDate(entry.usedAt) : "AVAILABLE"}`);
    }
    return;
  }

  const keys = listKeys().filter((k) => k.startsWith("code:"));
  if (keys.length === 0) {
    console.log("No promo codes found.");
    return;
  }

  let available = 0, used = 0;
  console.log("");
  console.log("CODE          TYPE       STATUS");
  console.log("----------    --------   -------------------------");

  for (const key of keys.sort()) {
    const code = key.replace("code:", "");
    const entry = getKey(key);
    if (!entry) continue;
    const status = entry.used ? `USED ${formatDate(entry.usedAt)}` : "AVAILABLE";
    if (entry.used) used++; else available++;
    console.log(`${code.padEnd(14)}${entry.type.padEnd(11)}${status}`);
  }

  console.log("");
  console.log(`Total: ${keys.length} · Available: ${available} · Used: ${used}`);
  console.log("");
}

main();
