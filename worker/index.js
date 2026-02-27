// Cloudflare Worker — xAI API proxy + promo codes + user accounts for Baseball Strategy Master
// Secrets: XAI_API_KEY, RESEND_API_KEY
// Bindings: PROMO_CODES (KV), DB (D1)

const ALLOWED_ORIGINS = [
  "https://bsm-app.pages.dev",
  "https://baseball-strategy-master-blafleur.replit.app",
  "http://localhost:3000",
  "http://localhost:5000",
];

const RATE_LIMIT_AI = 10; // AI proxy: req/min/IP
const RATE_LIMIT_AUTH = 20; // auth endpoints: req/min/IP
const RATE_LIMIT_SYNC = 30; // sync: req/min/user
const LOGIN_MAX_ATTEMPTS = 5; // per email per 15 min
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
const VERIFY_TTL = 24 * 60 * 60 * 1000; // 24 hours
const PBKDF2_ITERATIONS = 100_000;

const rateCounts = new Map();
const loginAttempts = new Map();

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function checkRateLimit(key, limit) {
  const now = Date.now();
  const window = 60_000;
  let entry = rateCounts.get(key);
  if (!entry || now - entry.start > window) {
    entry = { start: now, count: 0 };
    rateCounts.set(key, entry);
  }
  entry.count++;
  if (rateCounts.size > 2000) {
    for (const [k, v] of rateCounts) {
      if (now - v.start > window) rateCounts.delete(k);
    }
  }
  return entry.count <= limit;
}

function checkLoginAttempts(email) {
  const now = Date.now();
  const window = 15 * 60_000;
  const key = `login:${email.toLowerCase()}`;
  let entry = loginAttempts.get(key);
  if (!entry || now - entry.start > window) {
    entry = { start: now, count: 0 };
    loginAttempts.set(key, entry);
  }
  entry.count++;
  if (loginAttempts.size > 1000) {
    for (const [k, v] of loginAttempts) {
      if (now - v.start > window) loginAttempts.delete(k);
    }
  }
  return entry.count <= LOGIN_MAX_ATTEMPTS;
}

function jsonResponse(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function htmlResponse(html, status, cors) {
  return new Response(html, {
    status,
    headers: { ...cors, "Content-Type": "text/html; charset=utf-8" },
  });
}

// --- Crypto helpers (Web Crypto API PBKDF2) ---

function generateId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const saltBytes = hexToBytes(salt);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial, 256
  );
  return bytesToHex(new Uint8Array(bits));
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

function generateSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

// --- Validation ---

function validateEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function validatePassword(pw) {
  return typeof pw === "string" && pw.length >= 8 && pw.length <= 128;
}

function validateName(name) {
  return typeof name === "string" && name.trim().length >= 1 && name.trim().length <= 50;
}

// --- Session auth middleware ---

async function getSession(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const row = await env.DB.prepare(
    "SELECT s.*, u.id as uid, u.email, u.first_name, u.last_name, u.role, u.email_verified, p.id as pid, p.display_name, p.age_group, p.stats_json FROM sessions s JOIN users u ON s.user_id = u.id LEFT JOIN profiles p ON s.profile_id = p.id WHERE s.token = ? AND s.expires_at > ?"
  ).bind(token, Date.now()).first();
  if (!row) return null;
  return {
    sessionId: row.id,
    token: row.token,
    user: { id: row.uid, email: row.email, firstName: row.first_name, lastName: row.last_name, role: row.role, emailVerified: !!row.email_verified },
    profile: row.pid ? { id: row.pid, displayName: row.display_name, ageGroup: row.age_group } : null,
    stats: row.stats_json ? JSON.parse(row.stats_json) : {},
  };
}

// --- Email via Resend ---

async function sendEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Baseball Strategy Master <noreply@mail.baseballstrategymaster.com>",
        to: [to],
        subject,
        html,
      }),
    });
  } catch {}
}

// --- Auth endpoints ---

// POST /auth/signup
async function handleSignup(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const { email, password, firstName, lastName, displayName, ageGroup, existingStats } = body;

  // Validate
  if (!validateEmail(email)) return jsonResponse({ ok: false, error: "Invalid email address" }, 400, cors);
  if (!validatePassword(password)) return jsonResponse({ ok: false, error: "Password must be at least 8 characters" }, 400, cors);
  if (!validateName(firstName)) return jsonResponse({ ok: false, error: "First name is required" }, 400, cors);
  if (!validateName(lastName)) return jsonResponse({ ok: false, error: "Last name is required" }, 400, cors);

  // Block under-13 signups (COPPA — Phase B will add parent consent)
  if (ageGroup === "6-8" || ageGroup === "9-10") {
    return jsonResponse({ ok: false, error: "Account creation for younger players is coming soon! A parent will be able to create an account for you." }, 403, cors);
  }

  // Check email not taken
  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase()).first();
  if (existing) return jsonResponse({ ok: false, error: "An account with this email already exists" }, 409, cors);

  // Hash password
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  // Create user
  const userId = generateId();
  const now = Date.now();
  const verifyToken = generateToken();
  const verifyExpires = now + VERIFY_TTL;

  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, password_salt, first_name, last_name, role, email_verified, verify_token, verify_expires, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'player', 0, ?, ?, ?, ?)"
  ).bind(userId, email.toLowerCase(), hash, salt, firstName.trim(), lastName.trim(), verifyToken, verifyExpires, now, now).run();

  // Create profile
  const profileId = generateId();
  const dName = (displayName || firstName).trim().slice(0, 15);
  const ag = ageGroup || "11-12";
  const statsJson = existingStats ? JSON.stringify(existingStats) : "{}";

  await env.DB.prepare(
    "INSERT INTO profiles (id, user_id, display_name, age_group, stats_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(profileId, userId, dName, ag, statsJson, now, now).run();

  // Create session
  const sessionId = generateId();
  const sessionToken = generateToken();
  const expiresAt = now + SESSION_TTL;

  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, profile_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(sessionId, userId, profileId, sessionToken, expiresAt, now).run();

  // Send verification email
  const verifyUrl = `https://bsm-ai-proxy.blafleur.workers.dev/auth/verify-email?token=${verifyToken}`;
  await sendEmail(env, email, "Verify your Baseball Strategy Master account", `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px">
      <h2 style="color:#f59e0b">Welcome to Baseball Strategy Master!</h2>
      <p>Hi ${firstName.trim()},</p>
      <p>Click the button below to verify your email address:</p>
      <a href="${verifyUrl}" style="display:inline-block;background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Verify Email</a>
      <p style="color:#6b7280;font-size:14px">This link expires in 24 hours.</p>
    </div>
  `);

  return jsonResponse({
    ok: true,
    token: sessionToken,
    user: { id: userId, email: email.toLowerCase(), firstName: firstName.trim(), lastName: lastName.trim() },
    profile: { id: profileId, displayName: dName, ageGroup: ag },
    stats: existingStats || {},
  }, 201, cors);
}

// POST /auth/login
async function handleLogin(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const { email, password } = body;
  if (!email || !password) return jsonResponse({ ok: false, error: "Email and password are required" }, 400, cors);

  // Brute-force check
  if (!checkLoginAttempts(email)) {
    return jsonResponse({ ok: false, error: "Too many login attempts. Try again in 15 minutes." }, 429, cors);
  }

  // Find user
  const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email.toLowerCase()).first();
  if (!user) return jsonResponse({ ok: false, error: "Invalid email or password" }, 401, cors);

  // Verify password
  const hash = await hashPassword(password, user.password_salt);
  if (hash !== user.password_hash) {
    return jsonResponse({ ok: false, error: "Invalid email or password" }, 401, cors);
  }

  // Get profile
  const profile = await env.DB.prepare("SELECT * FROM profiles WHERE user_id = ? LIMIT 1").bind(user.id).first();

  // Create session
  const sessionId = generateId();
  const sessionToken = generateToken();
  const now = Date.now();
  const expiresAt = now + SESSION_TTL;

  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, profile_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(sessionId, user.id, profile?.id || null, sessionToken, expiresAt, now).run();

  // Clean up old sessions for this user (keep last 5)
  await env.DB.prepare(
    "DELETE FROM sessions WHERE user_id = ? AND id NOT IN (SELECT id FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5)"
  ).bind(user.id, user.id).run();

  const stats = profile?.stats_json ? JSON.parse(profile.stats_json) : {};

  return jsonResponse({
    ok: true,
    token: sessionToken,
    user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name },
    profile: profile ? { id: profile.id, displayName: profile.display_name, ageGroup: profile.age_group } : null,
    stats,
  }, 200, cors);
}

// POST /auth/logout
async function handleLogout(request, env, cors) {
  const session = await getSession(request, env);
  if (!session) return jsonResponse({ ok: false, error: "Not authenticated" }, 401, cors);

  await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(session.sessionId).run();
  return jsonResponse({ ok: true }, 200, cors);
}

// GET /auth/me
async function handleMe(request, env, cors) {
  const session = await getSession(request, env);
  if (!session) return jsonResponse({ ok: false, error: "Not authenticated" }, 401, cors);

  return jsonResponse({
    ok: true,
    user: session.user,
    profile: session.profile,
    stats: session.stats,
  }, 200, cors);
}

// POST /auth/sync
async function handleSync(request, env, cors) {
  const session = await getSession(request, env);
  if (!session) return jsonResponse({ ok: false, error: "Not authenticated" }, 401, cors);

  // Rate limit per user
  if (!checkRateLimit(`sync:${session.user.id}`, RATE_LIMIT_SYNC)) {
    return jsonResponse({ ok: false, error: "Sync rate limited" }, 429, cors);
  }

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  if (!body.stats || typeof body.stats !== "object") {
    return jsonResponse({ ok: false, error: "Stats object required" }, 400, cors);
  }

  const now = Date.now();
  const statsJson = JSON.stringify(body.stats);

  // Cap stats_json size at 512KB
  if (statsJson.length > 512 * 1024) {
    return jsonResponse({ ok: false, error: "Stats too large" }, 413, cors);
  }

  if (session.profile) {
    await env.DB.prepare(
      "UPDATE profiles SET stats_json = ?, updated_at = ? WHERE id = ?"
    ).bind(statsJson, now, session.profile.id).run();
  }

  return jsonResponse({ ok: true }, 200, cors);
}

// GET /auth/verify-email?token=xxx
async function handleVerifyEmail(request, env, cors) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return htmlResponse("<h2>Invalid verification link.</h2>", 400, cors);

  const user = await env.DB.prepare(
    "SELECT id, first_name FROM users WHERE verify_token = ? AND verify_expires > ?"
  ).bind(token, Date.now()).first();

  if (!user) {
    return htmlResponse(`
      <div style="font-family:sans-serif;max-width:480px;margin:40px auto;text-align:center;padding:20px">
        <h2 style="color:#ef4444">Link Expired or Invalid</h2>
        <p>This verification link has expired or was already used. Log in and request a new one.</p>
      </div>
    `, 400, cors);
  }

  await env.DB.prepare(
    "UPDATE users SET email_verified = 1, verify_token = NULL, verify_expires = NULL, updated_at = ? WHERE id = ?"
  ).bind(Date.now(), user.id).run();

  return htmlResponse(`
    <div style="font-family:sans-serif;max-width:480px;margin:40px auto;text-align:center;padding:20px">
      <div style="font-size:48px;margin-bottom:12px">&#9918;</div>
      <h2 style="color:#22c55e">Email Verified!</h2>
      <p>Thanks, ${user.first_name}! Your email is now verified. You can close this tab.</p>
    </div>
  `, 200, cors);
}

// --- Existing handlers ---

// POST /validate-code — redeem a single-use promo code
async function handleValidateCode(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ valid: false, error: "Invalid JSON" }, 400, cors);
  }

  const code = (body.code || "").trim().toUpperCase();
  if (!code) return jsonResponse({ valid: false }, 400, cors);

  const kvKey = `code:${code}`;
  const raw = await env.PROMO_CODES.get(kvKey);
  if (!raw) return jsonResponse({ valid: false }, 200, cors);

  let entry;
  try { entry = JSON.parse(raw); } catch {
    return jsonResponse({ valid: false }, 200, cors);
  }

  if (entry.used) return jsonResponse({ valid: false, reason: "already_used" }, 200, cors);

  entry.used = true;
  entry.usedAt = Date.now();
  await env.PROMO_CODES.put(kvKey, JSON.stringify(entry));

  return jsonResponse({ valid: true, type: entry.type }, 200, cors);
}

// POST /v1/chat/completions — xAI proxy
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
  if (!xaiResponse.ok) {
    console.error(`[BSM Worker] xAI error ${xaiResponse.status}:`, responseBody.slice(0, 500));
  }
  return new Response(responseBody, {
    status: xaiResponse.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// POST /flag-scenario — player flags a confusing AI scenario
async function handleFlagScenario(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, cors);
  }
  const { scenario_id, flag_count, position, flagged_at } = body;
  if (!scenario_id) return jsonResponse({ error: "missing scenario_id" }, 400, cors);
  try {
    await env.DB.prepare(`
      INSERT INTO flagged_scenarios (scenario_id, flag_count, position, flagged_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(scenario_id) DO UPDATE SET
        flag_count = flag_count + 1, flagged_at = excluded.flagged_at
    `).bind(scenario_id, flag_count, position || "unknown", flagged_at).run();
    return jsonResponse({ ok: true }, 200, cors);
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500, cors);
  }
}

// --- Router ---

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    // Auth routes
    if (path.startsWith("/auth/")) {
      if (!checkRateLimit(`auth:${ip}`, RATE_LIMIT_AUTH)) {
        return jsonResponse({ error: "Rate limited. Try again in a minute." }, 429, cors);
      }

      try {
        if (path === "/auth/signup" && request.method === "POST") return await handleSignup(request, env, cors);
        if (path === "/auth/login" && request.method === "POST") return await handleLogin(request, env, cors);
        if (path === "/auth/logout" && request.method === "POST") return await handleLogout(request, env, cors);
        if (path === "/auth/me" && request.method === "GET") return await handleMe(request, env, cors);
        if (path === "/auth/sync" && request.method === "POST") return await handleSync(request, env, cors);
        if (path === "/auth/verify-email" && request.method === "GET") return await handleVerifyEmail(request, env, cors);
        return jsonResponse({ error: "Not found" }, 404, cors);
      } catch (err) {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }

    // Existing routes require POST
    if (request.method !== "POST" && request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    if (request.method === "GET") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    if (!checkRateLimit(`ai:${ip}`, RATE_LIMIT_AI)) {
      return jsonResponse({ error: "Rate limited. Try again in a minute." }, 429, cors);
    }

    try {
      if (path === "/validate-code") return await handleValidateCode(request, env, cors);
      if (path === "/flag-scenario") return await handleFlagScenario(request, env, cors);
      return await handleAIProxy(request, env, cors);
    } catch (err) {
      return jsonResponse({ error: "Proxy error" }, 502, cors);
    }
  },
};
