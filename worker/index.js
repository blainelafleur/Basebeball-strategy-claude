// Cloudflare Worker — xAI API proxy for Baseball Strategy Master
// Hides the xAI API key from the browser. Deployed to Workers free tier.
// Setup: wrangler secret put XAI_API_KEY

const ALLOWED_ORIGINS = [
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
      return new Response(JSON.stringify({ error: "Rate limited. Try again in a minute." }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    try {
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
    } catch (err) {
      return new Response(JSON.stringify({ error: "Proxy error" }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
};
