#!/usr/bin/env node
// Generate single-use promo codes and store them in Cloudflare KV
// Usage: node generate-codes.js <type> <count>
//   type:  "lifetime" or "30day"
//   count: number of codes to generate (default: 1)
//
// Requires: npx wrangler must be available, and wrangler.toml must have
// the PROMO_CODES KV namespace configured with a valid ID.

const { execSync } = require("child_process");
const crypto = require("crypto");

// Alphanumeric chars excluding ambiguous ones (0/O, 1/I/l)
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode() {
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += CHARS[bytes[i] % CHARS.length];
  }
  return `BSM-${code}`;
}

async function main() {
  const type = process.argv[2];
  const count = parseInt(process.argv[3]) || 1;

  if (!type || !["lifetime", "30day"].includes(type)) {
    console.error("Usage: node generate-codes.js <lifetime|30day> <count>");
    console.error("  type:  'lifetime' or '30day'");
    console.error("  count: number of codes to generate (default: 1)");
    process.exit(1);
  }

  if (count < 1 || count > 50) {
    console.error("Count must be between 1 and 50");
    process.exit(1);
  }

  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = generateCode();
    const kvKey = `code:${code}`;
    const kvValue = JSON.stringify({
      type,
      used: false,
      createdAt: Date.now(),
    });

    try {
      execSync(
        `npx wrangler kv key put --binding=PROMO_CODES --remote "${kvKey}" '${kvValue}'`,
        { cwd: __dirname, stdio: "pipe" }
      );
      codes.push(code);
    } catch (err) {
      console.error(`Failed to store ${code}:`, err.stderr?.toString() || err.message);
      console.error("Make sure wrangler.toml has a valid PROMO_CODES KV namespace ID.");
      process.exit(1);
    }
  }

  console.log(`\nGenerated ${codes.length} ${type} code${codes.length > 1 ? "s" : ""}:\n`);
  codes.forEach((c) => console.log(`  ${c}`));
  console.log("");
}

main();
