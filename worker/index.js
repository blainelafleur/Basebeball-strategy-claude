// Cloudflare Worker — xAI API proxy + promo codes for Baseball Strategy Master
// Hides the xAI API key from the browser. Deployed to Workers free tier.
// Setup: wrangler secret put XAI_API_KEY

const ALLOWED_ORIGINS = [
  "https://bsm-app.pages.dev",
  "https://baseball-strategy-master-blafleur.replit.app",
  "http://localhost:3000",
  "http://localhost:5000",
];

const RATE_LIMIT = 10; // requests per minute per IP
const rateCounts = new Map();

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function checkRateLimit(ip) {
  const now = Date.now();
  const window = 60_000;
  let entry = rateCounts.get(ip);
  if (!entry || now - entry.start > window) {
    entry = { start: now, count: 0 };
    rateCounts.set(ip, entry);
  }
  entry.count++;
  // Prune old entries every 100 checks
  if (rateCounts.size > 1000) {
    for (const [k, v] of rateCounts) {
      if (now - v.start > window) rateCounts.delete(k);
    }
  }
  return entry.count <= RATE_LIMIT;
}

function jsonResponse(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// POST /validate-code — redeem a single-use promo code
async function handleValidateCode(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ valid: false, error: "Invalid JSON" }, 400, cors);
  }

  const code = (body.code || "").trim().toUpperCase();
  if (!code) {
    return jsonResponse({ valid: false }, 400, cors);
  }

  const kvKey = `code:${code}`;
  const raw = await env.PROMO_CODES.get(kvKey);
  if (!raw) {
    return jsonResponse({ valid: false }, 200, cors);
  }

  let entry;
  try {
    entry = JSON.parse(raw);
  } catch {
    return jsonResponse({ valid: false }, 200, cors);
  }

  if (entry.used) {
    return jsonResponse({ valid: false, reason: "already_used" }, 200, cors);
  }

  // Mark as used
  entry.used = true;
  entry.usedAt = Date.now();
  await env.PROMO_CODES.put(kvKey, JSON.stringify(entry));

  return jsonResponse({ valid: true, type: entry.type }, 200, cors);
}

// POST /v1/chat/completions — xAI proxy (existing behavior)
async function handleAIProxy(request, env, cors) {
  const body = await request.text();
  const xaiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.XAI_API_KEY}`,
    },
    body,
  });

  const responseBody = await xaiResponse.text();
  return new Response(responseBody, {
    status: xaiResponse.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (!checkRateLimit(ip)) {
      return jsonResponse({ error: "Rate limited. Try again in a minute." }, 429, cors);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/validate-code") {
        return await handleValidateCode(request, env, cors);
      }
      // Default: xAI proxy (handles /v1/chat/completions and legacy root POST)
      return await handleAIProxy(request, env, cors);
    } catch (err) {
      return jsonResponse({ error: "Proxy error" }, 502, cors);
    }
  },
};
