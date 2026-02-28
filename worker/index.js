// Cloudflare Worker — xAI API proxy + promo codes + user accounts for Baseball Strategy Master
// Secrets: XAI_API_KEY, RESEND_API_KEY
// Bindings: PROMO_CODES (KV), DB (D1)

const ALLOWED_ORIGINS = [
  "https://bsm-app.pages.dev",
];

const RATE_LIMIT_AI = 10; // AI proxy: req/min/IP
const RATE_LIMIT_AUTH = 20; // auth endpoints: req/min/IP
const RATE_LIMIT_SYNC = 30; // sync: req/min/user
const RATE_LIMIT_VERIFY = 20; // verify-pro: req/min/IP
const RATE_LIMIT_PROMO = 5; // promo code: req/min/IP (tight to prevent brute-force)
const LOGIN_MAX_ATTEMPTS = 5; // per email per 15 min
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
const VERIFY_TTL = 24 * 60 * 60 * 1000; // 24 hours
const PBKDF2_ITERATIONS = 100_000;

// D1 migration for subscriptions table (run once):
// CREATE TABLE IF NOT EXISTS subscriptions (
//   id TEXT PRIMARY KEY,
//   user_id TEXT,
//   email TEXT NOT NULL,
//   stripe_customer_id TEXT,
//   stripe_subscription_id TEXT,
//   plan TEXT NOT NULL DEFAULT 'monthly',
//   status TEXT NOT NULL DEFAULT 'active',
//   current_period_start INTEGER,
//   current_period_end INTEGER,
//   cancel_at_period_end INTEGER DEFAULT 0,
//   promo_code TEXT,
//   created_at INTEGER NOT NULL,
//   updated_at INTEGER NOT NULL
// );
// CREATE INDEX IF NOT EXISTS idx_subs_email ON subscriptions(email);
// CREATE INDEX IF NOT EXISTS idx_subs_stripe_cust ON subscriptions(stripe_customer_id);
// CREATE INDEX IF NOT EXISTS idx_subs_stripe_sub ON subscriptions(stripe_subscription_id);

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

// --- Sprint 4.1: Server-side Pro verification ---

// POST /verify-pro — check Pro status from server
// Accepts: { email, isPro, proExpiry, proPlan } from client
// Returns: { ok, isPro, proExpiry, proPlan, source } — authoritative server answer
async function handleVerifyPro(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email) {
    // No email — can't verify server-side, trust client (graceful degradation)
    return jsonResponse({ ok: true, isPro: !!body.isPro, source: "client_trusted" }, 200, cors);
  }

  // Check subscriptions table for active subscription
  const sub = await env.DB.prepare(
    "SELECT * FROM subscriptions WHERE email = ? AND status IN ('active', 'trialing') ORDER BY updated_at DESC LIMIT 1"
  ).bind(email).first();

  if (sub) {
    const now = Date.now();
    const isActive = !sub.current_period_end || sub.current_period_end > now;
    if (isActive) {
      return jsonResponse({
        ok: true,
        isPro: true,
        proExpiry: sub.current_period_end || null,
        proPlan: sub.plan,
        source: "server_subscription",
        cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      }, 200, cors);
    }
    // Subscription exists but expired — mark inactive
    await env.DB.prepare(
      "UPDATE subscriptions SET status = 'expired', updated_at = ? WHERE id = ?"
    ).bind(now, sub.id).run();
  }

  // Check for promo-based Pro (stored in KV or subscriptions with promo plan)
  const promoSub = await env.DB.prepare(
    "SELECT * FROM subscriptions WHERE email = ? AND plan LIKE 'promo-%' AND status = 'active' ORDER BY updated_at DESC LIMIT 1"
  ).bind(email).first();

  if (promoSub) {
    const now = Date.now();
    if (!promoSub.current_period_end || promoSub.current_period_end > now) {
      return jsonResponse({
        ok: true,
        isPro: true,
        proExpiry: promoSub.current_period_end || null,
        proPlan: promoSub.plan,
        source: "server_promo",
      }, 200, cors);
    }
    await env.DB.prepare(
      "UPDATE subscriptions SET status = 'expired', updated_at = ? WHERE id = ?"
    ).bind(now, promoSub.id).run();
  }

  // No active subscription found — check if client claims Pro
  if (body.isPro && body.proExpiry && body.proExpiry > Date.now()) {
    // Client says Pro but server has no record — create a reconciliation record
    // This handles the transition for existing Pro users before server tracking existed
    const subId = generateId();
    const now = Date.now();
    await env.DB.prepare(
      "INSERT INTO subscriptions (id, email, plan, status, current_period_end, created_at, updated_at) VALUES (?, ?, ?, 'active', ?, ?, ?)"
    ).bind(subId, email, body.proPlan || "monthly", body.proExpiry, now, now).run();
    return jsonResponse({
      ok: true,
      isPro: true,
      proExpiry: body.proExpiry,
      proPlan: body.proPlan || "monthly",
      source: "client_reconciled",
    }, 200, cors);
  }

  // Not Pro
  return jsonResponse({ ok: true, isPro: false, source: "server_none" }, 200, cors);
}

// POST /stripe-webhook — Stripe sends payment events here
// Secret: STRIPE_WEBHOOK_SECRET (env binding)
async function handleStripeWebhook(request, env, cors) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return jsonResponse({ error: "Missing signature" }, 400, cors);
  }

  const rawBody = await request.text();

  // Verify Stripe webhook signature
  let event;
  try {
    event = await verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[BSM Worker] Stripe webhook signature verification failed:", err.message);
    return jsonResponse({ error: "Invalid signature" }, 401, cors);
  }

  const now = Date.now();

  // Handle relevant event types
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const email = (session.customer_email || session.customer_details?.email || "").toLowerCase();
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const plan = session.metadata?.plan || (session.amount_total >= 2000 ? "yearly" : "monthly");

      if (!email) break;

      // Calculate period end based on plan
      const periodEnd = plan === "yearly"
        ? now + 365 * 86400000
        : now + 31 * 86400000;

      // Upsert subscription
      const subId = generateId();
      await env.DB.prepare(`
        INSERT INTO subscriptions (id, email, stripe_customer_id, stripe_subscription_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET status = 'active', plan = excluded.plan, stripe_customer_id = excluded.stripe_customer_id, stripe_subscription_id = excluded.stripe_subscription_id, current_period_start = excluded.current_period_start, current_period_end = excluded.current_period_end, updated_at = excluded.updated_at
      `).bind(subId, email, customerId, subscriptionId, plan, now, periodEnd, now, now).run();
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const customerId = sub.customer;
      const status = sub.status === "active" || sub.status === "trialing" ? "active" : sub.status;
      const periodEnd = sub.current_period_end ? sub.current_period_end * 1000 : null;
      const cancelAtEnd = sub.cancel_at_period_end ? 1 : 0;

      await env.DB.prepare(`
        UPDATE subscriptions SET status = ?, current_period_end = ?, cancel_at_period_end = ?, updated_at = ?
        WHERE stripe_customer_id = ? OR stripe_subscription_id = ?
      `).bind(status, periodEnd, cancelAtEnd, now, customerId, sub.id).run();
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await env.DB.prepare(`
        UPDATE subscriptions SET status = 'canceled', updated_at = ?
        WHERE stripe_customer_id = ? OR stripe_subscription_id = ?
      `).bind(now, sub.customer, sub.id).run();
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      await env.DB.prepare(`
        UPDATE subscriptions SET status = 'past_due', updated_at = ?
        WHERE stripe_customer_id = ?
      `).bind(now, customerId).run();
      break;
    }

    default:
      // Unhandled event type — acknowledge receipt
      break;
  }

  return jsonResponse({ received: true }, 200, cors);
}

// Stripe webhook signature verification (HMAC-SHA256)
async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!secret) throw new Error("No webhook secret configured");

  const parts = {};
  sigHeader.split(",").forEach(item => {
    const [key, value] = item.split("=");
    parts[key.trim()] = value;
  });

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) throw new Error("Invalid signature format");

  // Reject timestamps older than 5 minutes
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
  if (age > 300) throw new Error("Timestamp too old");

  const signedPayload = `${timestamp}.${payload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, "0")).join("");

  if (expectedSig !== signature) throw new Error("Signature mismatch");

  return JSON.parse(payload);
}

// POST /activate-pro — called after Stripe redirect to record subscription server-side
async function handleActivatePro(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const email = (body.email || "").trim().toLowerCase();
  const plan = body.plan || "monthly";
  const proExpiry = body.proExpiry;

  if (!email) {
    return jsonResponse({ ok: true, recorded: false, reason: "no_email" }, 200, cors);
  }

  // Check for existing active subscription
  const existing = await env.DB.prepare(
    "SELECT id FROM subscriptions WHERE email = ? AND status = 'active'"
  ).bind(email).first();

  if (existing) {
    // Already active — just update expiry
    await env.DB.prepare(
      "UPDATE subscriptions SET plan = ?, current_period_end = ?, updated_at = ? WHERE id = ?"
    ).bind(plan, proExpiry, Date.now(), existing.id).run();
    return jsonResponse({ ok: true, recorded: true, updated: true }, 200, cors);
  }

  // Create new subscription record
  const subId = generateId();
  const now = Date.now();
  await env.DB.prepare(
    "INSERT INTO subscriptions (id, email, plan, status, current_period_start, current_period_end, created_at, updated_at) VALUES (?, ?, ?, 'active', ?, ?, ?, ?)"
  ).bind(subId, email, plan, now, proExpiry, now, now).run();

  return jsonResponse({ ok: true, recorded: true }, 201, cors);
}

// --- Sprint 4.2: Real-time analytics pipeline ---

// D1 migration for analytics table:
// CREATE TABLE IF NOT EXISTS analytics_events (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   session_hash TEXT NOT NULL,
//   event_type TEXT NOT NULL,
//   event_data TEXT,
//   age_group TEXT,
//   is_pro INTEGER DEFAULT 0,
//   platform TEXT,
//   created_at INTEGER NOT NULL
// );
// CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
// CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);
// CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_hash);

const RATE_LIMIT_ANALYTICS = 60; // analytics: req/min/IP

// POST /analytics — batch event ingestion (anonymized)
async function handleAnalytics(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const events = body.events;
  if (!Array.isArray(events) || events.length === 0 || events.length > 50) {
    return jsonResponse({ ok: false, error: "Events array required (1-50)" }, 400, cors);
  }

  const now = Date.now();
  const sessionHash = body.sessionHash || "anon";

  // Batch insert (D1 supports batch)
  const stmts = events.map(evt => {
    const eventType = (evt.type || "unknown").slice(0, 50);
    const eventData = evt.data ? JSON.stringify(evt.data).slice(0, 2000) : null;
    const ageGroup = (evt.ageGroup || "").slice(0, 10);
    const isPro = evt.isPro ? 1 : 0;
    const platform = (evt.platform || "web").slice(0, 20);
    const ts = evt.ts || now;

    return env.DB.prepare(
      "INSERT INTO analytics_events (session_hash, event_type, event_data, age_group, is_pro, platform, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(sessionHash, eventType, eventData, ageGroup, isPro, platform, ts);
  });

  try {
    await env.DB.batch(stmts);
    return jsonResponse({ ok: true, count: events.length }, 200, cors);
  } catch (err) {
    console.error("[BSM Worker] Analytics insert error:", err);
    return jsonResponse({ ok: false, error: "Insert failed" }, 500, cors);
  }
}

// GET /analytics/summary — aggregate dashboard (admin only, protected by header)
async function handleAnalyticsSummary(request, env, cors) {
  const adminKey = request.headers.get("X-Admin-Key");
  if (!adminKey || adminKey !== env.ADMIN_KEY) {
    return jsonResponse({ error: "Unauthorized" }, 401, cors);
  }

  const now = Date.now();
  const day = 86400000;
  const week = 7 * day;

  try {
    const [dailyActive, weeklyActive, topEvents, proRate, ageDistribution] = await Promise.all([
      env.DB.prepare("SELECT COUNT(DISTINCT session_hash) as count FROM analytics_events WHERE created_at > ?").bind(now - day).first(),
      env.DB.prepare("SELECT COUNT(DISTINCT session_hash) as count FROM analytics_events WHERE created_at > ?").bind(now - week).first(),
      env.DB.prepare("SELECT event_type, COUNT(*) as count FROM analytics_events WHERE created_at > ? GROUP BY event_type ORDER BY count DESC LIMIT 20").bind(now - week).all(),
      env.DB.prepare("SELECT is_pro, COUNT(DISTINCT session_hash) as count FROM analytics_events WHERE created_at > ? GROUP BY is_pro").bind(now - week).all(),
      env.DB.prepare("SELECT age_group, COUNT(DISTINCT session_hash) as count FROM analytics_events WHERE created_at > ? AND age_group != '' GROUP BY age_group ORDER BY count DESC").bind(now - week).all(),
    ]);

    return jsonResponse({
      ok: true,
      daily_active_users: dailyActive?.count || 0,
      weekly_active_users: weeklyActive?.count || 0,
      top_events: topEvents?.results || [],
      pro_distribution: proRate?.results || [],
      age_distribution: ageDistribution?.results || [],
    }, 200, cors);
  } catch (err) {
    return jsonResponse({ error: "Query failed" }, 500, cors);
  }
}

// --- Sprint 4.4: Error monitoring + alerting ---

// D1 migration for error_logs table:
// CREATE TABLE IF NOT EXISTS error_logs (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   error_type TEXT NOT NULL,
//   error_message TEXT,
//   error_context TEXT,
//   session_hash TEXT,
//   user_agent TEXT,
//   created_at INTEGER NOT NULL
// );
// CREATE INDEX IF NOT EXISTS idx_errors_type ON error_logs(error_type);
// CREATE INDEX IF NOT EXISTS idx_errors_date ON error_logs(created_at);

const RATE_LIMIT_ERRORS = 30; // error reports: req/min/IP

// POST /error-report — client error collection
async function handleErrorReport(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false }, 400, cors);
  }

  const errors = Array.isArray(body.errors) ? body.errors.slice(0, 20) : [body];
  const now = Date.now();
  const ua = (request.headers.get("User-Agent") || "").slice(0, 200);

  const stmts = errors.map(err => {
    return env.DB.prepare(
      "INSERT INTO error_logs (error_type, error_message, error_context, session_hash, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      (err.type || "unknown").slice(0, 50),
      (err.message || "").slice(0, 500),
      err.context ? JSON.stringify(err.context).slice(0, 2000) : null,
      (err.sessionHash || "anon").slice(0, 32),
      ua,
      err.ts || now
    );
  });

  try {
    await env.DB.batch(stmts);

    // Check for alert threshold — if >10 AI errors in last 5 minutes, send alert
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM error_logs WHERE error_type LIKE 'ai_%' AND created_at > ?"
    ).bind(now - 5 * 60 * 1000).first();

    if (recent && recent.count >= 10 && env.ALERT_WEBHOOK_URL) {
      // Send alert via webhook (Discord/Slack compatible)
      fetch(env.ALERT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🚨 **BSM AI Alert**: ${recent.count} AI errors in the last 5 minutes. Most recent: ${errors[0]?.message || "unknown"}`,
        }),
      }).catch(() => {});
    }

    return jsonResponse({ ok: true, count: errors.length }, 200, cors);
  } catch (err) {
    return jsonResponse({ ok: false }, 500, cors);
  }
}

// GET /errors/summary — error dashboard (admin only)
async function handleErrorsSummary(request, env, cors) {
  const adminKey = request.headers.get("X-Admin-Key");
  if (!adminKey || adminKey !== env.ADMIN_KEY) {
    return jsonResponse({ error: "Unauthorized" }, 401, cors);
  }

  const now = Date.now();
  const hour = 3600000;
  const day = 86400000;

  try {
    const [hourlyErrors, dailyByType, recentErrors] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) as count FROM error_logs WHERE created_at > ?").bind(now - hour).first(),
      env.DB.prepare("SELECT error_type, COUNT(*) as count FROM error_logs WHERE created_at > ? GROUP BY error_type ORDER BY count DESC LIMIT 10").bind(now - day).all(),
      env.DB.prepare("SELECT error_type, error_message, created_at FROM error_logs ORDER BY created_at DESC LIMIT 20").all(),
    ]);

    return jsonResponse({
      ok: true,
      errors_last_hour: hourlyErrors?.count || 0,
      daily_by_type: dailyByType?.results || [],
      recent: (recentErrors?.results || []).map(r => ({
        type: r.error_type,
        message: r.error_message,
        time: new Date(r.created_at).toISOString(),
      })),
    }, 200, cors);
  } catch {
    return jsonResponse({ error: "Query failed" }, 500, cors);
  }
}

// --- Sprint C1: Team code system ---

// D1 migration for teams:
// CREATE TABLE IF NOT EXISTS teams (
//   id TEXT PRIMARY KEY,
//   code TEXT UNIQUE NOT NULL,
//   name TEXT NOT NULL,
//   coach_name TEXT NOT NULL,
//   coach_pin TEXT NOT NULL,
//   created_at INTEGER NOT NULL
// );
// CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(code);
//
// CREATE TABLE IF NOT EXISTS team_members (
//   id TEXT PRIMARY KEY,
//   team_id TEXT NOT NULL,
//   player_hash TEXT NOT NULL,
//   display_name TEXT NOT NULL DEFAULT 'Player',
//   last_sync INTEGER NOT NULL,
//   stats_json TEXT,
//   FOREIGN KEY(team_id) REFERENCES teams(id)
// );
// CREATE INDEX IF NOT EXISTS idx_members_team ON team_members(team_id);
// CREATE UNIQUE INDEX IF NOT EXISTS idx_members_unique ON team_members(team_id, player_hash);

const RATE_LIMIT_TEAM = 20;

function generateTeamCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// POST /team/create — coach creates a team
async function handleTeamCreate(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const { teamName, coachName, coachPin } = body;
  if (!teamName || !coachName || !coachPin) {
    return jsonResponse({ ok: false, error: "Team name, coach name, and PIN required" }, 400, cors);
  }
  if (String(coachPin).length < 4 || String(coachPin).length > 8) {
    return jsonResponse({ ok: false, error: "PIN must be 4-8 characters" }, 400, cors);
  }

  const teamId = generateId();
  const code = generateTeamCode();
  const now = Date.now();

  try {
    await env.DB.prepare(
      "INSERT INTO teams (id, code, name, coach_name, coach_pin, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(teamId, code, teamName.trim().slice(0, 40), coachName.trim().slice(0, 30), String(coachPin), now).run();

    return jsonResponse({ ok: true, teamId, code, teamName: teamName.trim() }, 201, cors);
  } catch (err) {
    // Retry with different code on unique constraint violation
    const code2 = generateTeamCode();
    try {
      await env.DB.prepare(
        "INSERT INTO teams (id, code, name, coach_name, coach_pin, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(teamId, code2, teamName.trim().slice(0, 40), coachName.trim().slice(0, 30), String(coachPin), now).run();
      return jsonResponse({ ok: true, teamId, code: code2, teamName: teamName.trim() }, 201, cors);
    } catch {
      return jsonResponse({ ok: false, error: "Failed to create team" }, 500, cors);
    }
  }
}

// POST /team/join — player joins a team
async function handleTeamJoin(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const { code, playerHash, displayName } = body;
  if (!code || !playerHash) {
    return jsonResponse({ ok: false, error: "Team code and player ID required" }, 400, cors);
  }

  const team = await env.DB.prepare("SELECT * FROM teams WHERE code = ?").bind(code.toUpperCase().trim()).first();
  if (!team) return jsonResponse({ ok: false, error: "Team not found" }, 404, cors);

  const memberId = generateId();
  const now = Date.now();
  const name = (displayName || "Player").trim().slice(0, 15);

  try {
    await env.DB.prepare(
      "INSERT INTO team_members (id, team_id, player_hash, display_name, last_sync, stats_json) VALUES (?, ?, ?, ?, ?, '{}') ON CONFLICT(team_id, player_hash) DO UPDATE SET display_name = excluded.display_name, last_sync = excluded.last_sync"
    ).bind(memberId, team.id, playerHash.slice(0, 32), name, now).run();

    return jsonResponse({ ok: true, teamName: team.name, coachName: team.coach_name }, 200, cors);
  } catch (err) {
    return jsonResponse({ ok: false, error: "Failed to join team" }, 500, cors);
  }
}

// POST /team/sync — player syncs stats to team
async function handleTeamSync(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const { code, playerHash, stats } = body;
  if (!code || !playerHash || !stats) {
    return jsonResponse({ ok: false, error: "Code, player hash, and stats required" }, 400, cors);
  }

  const team = await env.DB.prepare("SELECT id FROM teams WHERE code = ?").bind(code.toUpperCase().trim()).first();
  if (!team) return jsonResponse({ ok: false, error: "Team not found" }, 404, cors);

  // Only store aggregate stats, not the full player state
  const summary = JSON.stringify({
    gp: stats.gp || 0,
    pts: stats.pts || 0,
    str: stats.str || 0,
    bs: stats.bs || 0,
    ds: stats.ds || 0,
    lv: stats.lv || 1,
    co: stats.co || 0,
    cl: (stats.cl || []).length,
    ps: stats.ps || {},
    posPlayed: stats.posPlayed || {},
    ageGroup: stats.ageGroup || "",
    masteryData: stats.masteryData ? {
      concepts: Object.fromEntries(
        Object.entries(stats.masteryData.concepts || {}).map(([k, v]) => [k, { correct: v.correct || 0, total: v.total || 0 }])
      )
    } : {},
  }).slice(0, 8192);

  const now = Date.now();
  await env.DB.prepare(
    "UPDATE team_members SET stats_json = ?, last_sync = ? WHERE team_id = ? AND player_hash = ?"
  ).bind(summary, now, team.id, playerHash.slice(0, 32)).run();

  return jsonResponse({ ok: true }, 200, cors);
}

// POST /team/report — coach views team report (requires PIN)
async function handleTeamReport(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const { code, coachPin } = body;
  if (!code || !coachPin) {
    return jsonResponse({ ok: false, error: "Team code and PIN required" }, 400, cors);
  }

  const team = await env.DB.prepare("SELECT * FROM teams WHERE code = ?").bind(code.toUpperCase().trim()).first();
  if (!team) return jsonResponse({ ok: false, error: "Team not found" }, 404, cors);
  if (team.coach_pin !== String(coachPin)) {
    return jsonResponse({ ok: false, error: "Incorrect PIN" }, 403, cors);
  }

  const members = await env.DB.prepare(
    "SELECT display_name, last_sync, stats_json FROM team_members WHERE team_id = ? ORDER BY last_sync DESC"
  ).bind(team.id).all();

  const players = (members?.results || []).map(m => {
    const s = m.stats_json ? JSON.parse(m.stats_json) : {};
    return {
      name: m.display_name,
      lastActive: m.last_sync,
      gamesPlayed: s.gp || 0,
      points: s.pts || 0,
      streak: s.ds || 0,
      level: s.lv || 1,
      scenariosCompleted: s.cl || 0,
      positionAccuracy: s.ps || {},
      conceptMastery: s.masteryData?.concepts || {},
    };
  });

  // Aggregate team stats
  const totalGames = players.reduce((a, p) => a + p.gamesPlayed, 0);
  const activeThisWeek = players.filter(p => Date.now() - p.lastActive < 7 * 86400000).length;

  // Find weakest concepts across team
  const conceptTotals = {};
  players.forEach(p => {
    Object.entries(p.conceptMastery).forEach(([tag, data]) => {
      if (!conceptTotals[tag]) conceptTotals[tag] = { correct: 0, total: 0 };
      conceptTotals[tag].correct += data.correct || 0;
      conceptTotals[tag].total += data.total || 0;
    });
  });
  const weakConcepts = Object.entries(conceptTotals)
    .filter(([, d]) => d.total >= 3)
    .map(([tag, d]) => ({ tag, accuracy: Math.round((d.correct / d.total) * 100) }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const strongConcepts = Object.entries(conceptTotals)
    .filter(([, d]) => d.total >= 3)
    .map(([tag, d]) => ({ tag, accuracy: Math.round((d.correct / d.total) * 100) }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  return jsonResponse({
    ok: true,
    team: { name: team.name, code: team.code, coachName: team.coach_name, created: team.created_at },
    summary: { totalPlayers: players.length, activeThisWeek, totalGames, weakConcepts, strongConcepts },
    players,
  }, 200, cors);
}

// --- Sprint D3: Challenge a Friend ---

// D1 migration for challenges:
// CREATE TABLE IF NOT EXISTS challenges (
//   id TEXT PRIMARY KEY,
//   creator_name TEXT NOT NULL,
//   creator_score INTEGER DEFAULT 0,
//   scenario_ids TEXT NOT NULL,
//   challenger_name TEXT,
//   challenger_score INTEGER,
//   created_at INTEGER NOT NULL,
//   expires_at INTEGER NOT NULL
// );

// POST /challenge/create — create a 5-scenario challenge
async function handleChallengeCreate(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const { creatorName, scenarioIds, creatorScore } = body;
  if (!scenarioIds || !Array.isArray(scenarioIds) || scenarioIds.length !== 5) {
    return jsonResponse({ ok: false, error: "Exactly 5 scenario IDs required" }, 400, cors);
  }

  const challengeId = generateId().slice(0, 12);
  const now = Date.now();
  const expiresAt = now + 7 * 86400000; // 7 days

  await env.DB.prepare(
    "INSERT INTO challenges (id, creator_name, creator_score, scenario_ids, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(challengeId, (creatorName || "Player").slice(0, 15), creatorScore || 0, JSON.stringify(scenarioIds), now, expiresAt).run();

  return jsonResponse({ ok: true, challengeId, expiresAt }, 201, cors);
}

// POST /challenge/get — retrieve a challenge
async function handleChallengeGet(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const { challengeId } = body;
  if (!challengeId) return jsonResponse({ ok: false, error: "Challenge ID required" }, 400, cors);

  const challenge = await env.DB.prepare(
    "SELECT * FROM challenges WHERE id = ?"
  ).bind(challengeId).first();

  if (!challenge) return jsonResponse({ ok: false, error: "Challenge not found" }, 404, cors);
  if (challenge.expires_at < Date.now()) return jsonResponse({ ok: false, error: "Challenge expired" }, 410, cors);

  return jsonResponse({
    ok: true,
    creatorName: challenge.creator_name,
    creatorScore: challenge.creator_score,
    scenarioIds: JSON.parse(challenge.scenario_ids),
    challengerName: challenge.challenger_name,
    challengerScore: challenge.challenger_score,
    expiresAt: challenge.expires_at,
  }, 200, cors);
}

// POST /challenge/submit — challenger submits their score
async function handleChallengeSubmit(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, cors);
  }

  const { challengeId, challengerName, challengerScore } = body;
  if (!challengeId) return jsonResponse({ ok: false, error: "Challenge ID required" }, 400, cors);

  const challenge = await env.DB.prepare("SELECT * FROM challenges WHERE id = ?").bind(challengeId).first();
  if (!challenge) return jsonResponse({ ok: false, error: "Challenge not found" }, 404, cors);
  if (challenge.challenger_score !== null) return jsonResponse({ ok: false, error: "Challenge already completed" }, 409, cors);

  await env.DB.prepare(
    "UPDATE challenges SET challenger_name = ?, challenger_score = ? WHERE id = ?"
  ).bind((challengerName || "Challenger").slice(0, 15), challengerScore || 0, challengeId).run();

  return jsonResponse({
    ok: true,
    creatorName: challenge.creator_name,
    creatorScore: challenge.creator_score,
    challengerName: (challengerName || "Challenger").slice(0, 15),
    challengerScore: challengerScore || 0,
    winner: (challengerScore || 0) > challenge.creator_score ? "challenger" : challenge.creator_score > (challengerScore || 0) ? "creator" : "tie",
  }, 200, cors);
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

  // Sprint 4.1: Record promo subscription server-side if email provided
  const email = (body.email || "").trim().toLowerCase();
  if (email) {
    const subId = generateId();
    const now = Date.now();
    const proExpiry = entry.type === "30day" ? now + 30 * 86400000 : null;
    try {
      await env.DB.prepare(
        "INSERT INTO subscriptions (id, email, plan, status, promo_code, current_period_end, created_at, updated_at) VALUES (?, ?, ?, 'active', ?, ?, ?, ?)"
      ).bind(subId, email, "promo-" + entry.type, code, proExpiry, now, now).run();
    } catch {}
  }

  return jsonResponse({ valid: true, type: entry.type }, 200, cors);
}

// POST /v1/chat/completions — xAI proxy (with timeout + streaming passthrough)
async function handleAIProxy(request, env, cors) {
  const body = await request.text();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 22000);
  try {
    const t0 = Date.now();
    const xaiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.XAI_API_KEY}`,
      },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const elapsed = Date.now() - t0;
    if (!xaiResponse.ok) {
      const errBody = await xaiResponse.text();
      console.error(`[BSM Worker] xAI error ${xaiResponse.status} (${elapsed}ms):`, errBody.slice(0, 500));
      return new Response(errBody, {
        status: xaiResponse.status,
        headers: { ...cors, "Content-Type": "application/json", "X-XAI-Elapsed": String(elapsed) },
      });
    }
    console.log(`[BSM Worker] xAI responded ${xaiResponse.status} in ${elapsed}ms`);
    // Stream response through directly — no buffering
    return new Response(xaiResponse.body, {
      status: xaiResponse.status,
      headers: { ...cors, "Content-Type": "application/json", "X-XAI-Elapsed": String(elapsed) },
    });
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") {
      console.error("[BSM Worker] xAI timeout after 22s");
      return jsonResponse({ error: { message: "xAI API timeout (22s)", type: "timeout" } }, 504, cors);
    }
    console.error("[BSM Worker] xAI fetch error:", e.message);
    return jsonResponse({ error: { message: e.message, type: "fetch_error" } }, 502, cors);
  }
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

    // Sprint 4.4: Error monitoring endpoints
    if (path === "/error-report" && request.method === "POST") {
      if (!checkRateLimit(`errors:${ip}`, RATE_LIMIT_ERRORS)) {
        return jsonResponse({ ok: false }, 429, cors);
      }
      try {
        return await handleErrorReport(request, env, cors);
      } catch {
        return jsonResponse({ ok: false }, 500, cors);
      }
    }

    if (path === "/errors/summary" && request.method === "GET") {
      try {
        return await handleErrorsSummary(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }

    // Sprint 4.2: Analytics endpoints
    if (path === "/analytics" && request.method === "POST") {
      if (!checkRateLimit(`analytics:${ip}`, RATE_LIMIT_ANALYTICS)) {
        return jsonResponse({ ok: false, error: "Rate limited" }, 429, cors);
      }
      try {
        return await handleAnalytics(request, env, cors);
      } catch {
        return jsonResponse({ ok: false }, 500, cors);
      }
    }

    if (path === "/analytics/summary" && request.method === "GET") {
      try {
        return await handleAnalyticsSummary(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }

    // Sprint 4.1: Stripe webhook (POST, no CORS — Stripe calls directly)
    if (path === "/stripe-webhook" && request.method === "POST") {
      try {
        return await handleStripeWebhook(request, env, cors);
      } catch (err) {
        console.error("[BSM Worker] Stripe webhook error:", err);
        return jsonResponse({ error: "Webhook error" }, 500, cors);
      }
    }

    // Sprint 4.1: Pro verification
    if (path === "/verify-pro" && request.method === "POST") {
      if (!checkRateLimit(`verify:${ip}`, RATE_LIMIT_VERIFY)) {
        return jsonResponse({ error: "Rate limited" }, 429, cors);
      }
      try {
        return await handleVerifyPro(request, env, cors);
      } catch (err) {
        // Graceful degradation — if server check fails, don't block the user
        return jsonResponse({ ok: true, isPro: false, source: "server_error" }, 200, cors);
      }
    }

    // Sprint 4.1: Activate Pro after Stripe redirect
    if (path === "/activate-pro" && request.method === "POST") {
      if (!checkRateLimit(`verify:${ip}`, RATE_LIMIT_VERIFY)) {
        return jsonResponse({ error: "Rate limited" }, 429, cors);
      }
      try {
        return await handleActivatePro(request, env, cors);
      } catch (err) {
        return jsonResponse({ ok: false, error: "Server error" }, 500, cors);
      }
    }

    // Sprint C1: Team endpoints
    if (path.startsWith("/team/") && request.method === "POST") {
      if (!checkRateLimit(`team:${ip}`, RATE_LIMIT_TEAM)) {
        return jsonResponse({ ok: false, error: "Rate limited" }, 429, cors);
      }
      try {
        if (path === "/team/create") return await handleTeamCreate(request, env, cors);
        if (path === "/team/join") return await handleTeamJoin(request, env, cors);
        if (path === "/team/sync") return await handleTeamSync(request, env, cors);
        if (path === "/team/report") return await handleTeamReport(request, env, cors);
        return jsonResponse({ error: "Not found" }, 404, cors);
      } catch (err) {
        console.error("[BSM Worker] Team error:", err);
        return jsonResponse({ ok: false, error: "Server error" }, 500, cors);
      }
    }

    // Sprint D3: Challenge a Friend endpoints
    if (path.startsWith("/challenge/") && request.method === "POST") {
      if (!checkRateLimit(`challenge:${ip}`, RATE_LIMIT_TEAM)) {
        return jsonResponse({ ok: false, error: "Rate limited" }, 429, cors);
      }
      try {
        if (path === "/challenge/create") return await handleChallengeCreate(request, env, cors);
        if (path === "/challenge/get") return await handleChallengeGet(request, env, cors);
        if (path === "/challenge/submit") return await handleChallengeSubmit(request, env, cors);
        return jsonResponse({ error: "Not found" }, 404, cors);
      } catch (err) {
        return jsonResponse({ ok: false, error: "Server error" }, 500, cors);
      }
    }

    // Existing routes require POST
    if (request.method !== "POST" && request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    if (request.method === "GET") {
      if (path === "/health") {
        return jsonResponse({ ok: true, ts: Date.now() }, 200, cors);
      }
      if (path === "/ai-test") {
        try {
          const r = await fetch("https://api.x.ai/v1/models", {
            headers: { "Authorization": `Bearer ${env.XAI_API_KEY}` },
          });
          const body = await r.text();
          return new Response(body, { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
        } catch (e) {
          return jsonResponse({ error: e.message }, 500, cors);
        }
      }
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    if (!checkRateLimit(`ai:${ip}`, RATE_LIMIT_AI)) {
      return jsonResponse({ error: "Rate limited. Try again in a minute." }, 429, cors);
    }

    try {
      if (path === "/validate-code") {
        if (!checkRateLimit(`promo:${ip}`, RATE_LIMIT_PROMO)) {
          return jsonResponse({ valid: false, error: "Too many attempts. Try again in a minute." }, 429, cors);
        }
        return await handleValidateCode(request, env, cors);
      }
      if (path === "/flag-scenario") return await handleFlagScenario(request, env, cors);
      return await handleAIProxy(request, env, cors);
    } catch (err) {
      return jsonResponse({ error: "Proxy error" }, 502, cors);
    }
  },
};
