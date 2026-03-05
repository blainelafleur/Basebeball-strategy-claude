// Cloudflare Worker — xAI API proxy + promo codes + user accounts for Baseball Strategy Master
// Secrets: XAI_API_KEY, RESEND_API_KEY
// Bindings: PROMO_CODES (KV), DB (D1)

const ALLOWED_ORIGINS = [
  "https://bsm-app.pages.dev",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:8080",
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

// Level 2 D1 migrations:
// CREATE TABLE IF NOT EXISTS scenario_grades (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   scenario_id TEXT NOT NULL,
//   position TEXT,
//   source TEXT DEFAULT 'ai',
//   quality_score REAL DEFAULT 0,
//   correct_rate REAL DEFAULT 0,
//   flag_rate REAL DEFAULT 0,
//   grader_details TEXT,
//   created_at INTEGER NOT NULL
// );
// CREATE INDEX IF NOT EXISTS idx_grades_scenario ON scenario_grades(scenario_id);
// CREATE INDEX IF NOT EXISTS idx_grades_position ON scenario_grades(position);
//
// CREATE TABLE IF NOT EXISTS scenario_difficulty (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   scenario_id TEXT NOT NULL,
//   position TEXT,
//   concept TEXT,
//   difficulty INTEGER DEFAULT 1,
//   is_correct INTEGER DEFAULT 0,
//   is_ai INTEGER DEFAULT 0,
//   session_hash TEXT,
//   created_at INTEGER NOT NULL
// );
// CREATE INDEX IF NOT EXISTS idx_diff_concept ON scenario_difficulty(concept);
// CREATE INDEX IF NOT EXISTS idx_diff_position ON scenario_difficulty(position);

// Level 3: learning_events table (richer than scenario_difficulty — includes age_group, level)
// CREATE TABLE IF NOT EXISTS learning_events (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   scenario_id TEXT,
//   position TEXT NOT NULL,
//   concept TEXT NOT NULL,
//   difficulty INTEGER DEFAULT 1,
//   is_correct INTEGER DEFAULT 0,
//   is_ai INTEGER DEFAULT 0,
//   session_hash TEXT,
//   age_group TEXT DEFAULT '11-12',
//   level INTEGER DEFAULT 1,
//   timestamp INTEGER NOT NULL,
//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
// );
// CREATE INDEX IF NOT EXISTS idx_le_concept_ts ON learning_events(concept, timestamp);
// CREATE INDEX IF NOT EXISTS idx_le_position_ts ON learning_events(position, timestamp);
// CREATE INDEX IF NOT EXISTS idx_le_age ON learning_events(age_group);

// Level 4: ab_results table (A/B test outcome tracking)
// CREATE TABLE IF NOT EXISTS ab_results (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   test_id TEXT NOT NULL,
//   variant_id TEXT NOT NULL,
//   session_hash TEXT,
//   metric TEXT NOT NULL,
//   value REAL DEFAULT 0,
//   timestamp INTEGER NOT NULL,
//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
// );
// CREATE INDEX IF NOT EXISTS idx_ab_test ON ab_results(test_id, variant_id);

// Community Scenario Pool — shared across all users
// CREATE TABLE IF NOT EXISTS scenario_pool (
//   id TEXT PRIMARY KEY,
//   position TEXT NOT NULL,
//   difficulty INTEGER NOT NULL DEFAULT 2,
//   concept TEXT,
//   concept_tag TEXT,
//   title TEXT NOT NULL,
//   scenario_json TEXT NOT NULL,
//   quality_score REAL DEFAULT 0,
//   audit_score REAL DEFAULT 0,
//   times_served INTEGER DEFAULT 0,
//   times_correct INTEGER DEFAULT 0,
//   times_wrong INTEGER DEFAULT 0,
//   times_flagged INTEGER DEFAULT 0,
//   correct_rate REAL GENERATED ALWAYS AS (CASE WHEN times_served > 0 THEN CAST(times_correct AS REAL) / times_served ELSE 0 END) STORED,
//   flag_rate REAL GENERATED ALWAYS AS (CASE WHEN times_served > 0 THEN CAST(times_flagged AS REAL) / times_served ELSE 0 END) STORED,
//   source TEXT DEFAULT 'ai',
//   contributed_by TEXT,
//   created_at INTEGER NOT NULL,
//   last_served_at INTEGER,
//   retired INTEGER DEFAULT 0
// );
// CREATE INDEX IF NOT EXISTS idx_pool_position ON scenario_pool(position);
// CREATE INDEX IF NOT EXISTS idx_pool_pos_diff ON scenario_pool(position, difficulty);
// CREATE INDEX IF NOT EXISTS idx_pool_concept ON scenario_pool(concept_tag);
// CREATE INDEX IF NOT EXISTS idx_pool_quality ON scenario_pool(quality_score);
// CREATE INDEX IF NOT EXISTS idx_pool_retired ON scenario_pool(retired);

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
  if (!env.XAI_API_KEY) {
    console.error("[BSM Worker] XAI_API_KEY secret not configured");
    return jsonResponse({ error: { message: "AI service not configured — XAI_API_KEY missing", type: "auth_error", status: 503 } }, 503, cors);
  }
  const body = await request.text();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
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
      const errType = xaiResponse.status === 401 || xaiResponse.status === 403 ? "auth_error"
        : xaiResponse.status === 429 ? "rate_limit"
        : "xai_server_error";
      return jsonResponse({
        error: { message: `xAI API error: ${xaiResponse.status}`, type: errType, status: xaiResponse.status, detail: errBody.slice(0, 300) }
      }, xaiResponse.status, { ...cors, "X-XAI-Elapsed": String(elapsed) });
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
      console.error("[BSM Worker] xAI timeout after 60s");
      return jsonResponse({ error: { message: "xAI API timeout (60s)", type: "timeout" } }, 504, cors);
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

// Level 1.5: GET /flagged-scenarios — read back flagged patterns for AI prompt injection
async function handleFlaggedScenarios(request, env, cors) {
  const url = new URL(request.url);
  const position = url.searchParams.get("position") || "";
  const limit = Math.min(parseInt(url.searchParams.get("limit")) || 10, 50);
  try {
    let query, params;
    if (position) {
      query = "SELECT scenario_id, flag_count, position, flagged_at FROM flagged_scenarios WHERE position = ? ORDER BY flag_count DESC LIMIT ?";
      params = [position, limit];
    } else {
      query = "SELECT scenario_id, flag_count, position, flagged_at FROM flagged_scenarios ORDER BY flag_count DESC LIMIT ?";
      params = [limit];
    }
    const results = await env.DB.prepare(query).bind(...params).all();
    return jsonResponse({ ok: true, flagged: results.results || [] }, 200, cors);
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, cors);
  }
}

// --- Self-Learning AI: D1 migrations (run once) ---
// CREATE TABLE IF NOT EXISTS scenario_feedback (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   scenario_id TEXT NOT NULL,
//   position TEXT NOT NULL,
//   flag_category TEXT NOT NULL,
//   comment TEXT,
//   scenario_json TEXT NOT NULL,
//   created_at INTEGER NOT NULL
// );
// CREATE INDEX IF NOT EXISTS idx_feedback_position ON scenario_feedback(position);
// CREATE INDEX IF NOT EXISTS idx_feedback_category ON scenario_feedback(flag_category);
// CREATE INDEX IF NOT EXISTS idx_feedback_created ON scenario_feedback(created_at);
//
// CREATE TABLE IF NOT EXISTS ai_audits (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   scenario_id TEXT NOT NULL,
//   position TEXT NOT NULL,
//   score INTEGER NOT NULL,
//   realistic INTEGER DEFAULT 0,
//   options_quality INTEGER DEFAULT 0,
//   coach_accuracy INTEGER DEFAULT 0,
//   tone INTEGER DEFAULT 0,
//   fix_suggestion TEXT,
//   created_at INTEGER NOT NULL
// );
// CREATE INDEX IF NOT EXISTS idx_audits_position ON ai_audits(position);
// CREATE INDEX IF NOT EXISTS idx_audits_score ON ai_audits(score);
//
// CREATE TABLE IF NOT EXISTS prompt_patches (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   position TEXT NOT NULL,
//   patch_text TEXT NOT NULL,
//   trigger_type TEXT NOT NULL,
//   confidence REAL DEFAULT 0.5,
//   expires_at INTEGER NOT NULL,
//   active INTEGER DEFAULT 1,
//   created_at INTEGER NOT NULL,
//   updated_at INTEGER NOT NULL
// );
// CREATE INDEX IF NOT EXISTS idx_patches_position ON prompt_patches(position);
// CREATE INDEX IF NOT EXISTS idx_patches_active ON prompt_patches(active);

// POST /feedback-scenario — rich scenario flagging with category + comment + full snapshot
async function handleFeedbackScenario(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, cors);
  }
  const { scenario_id, position, flag_category, comment, scenario_json } = body;
  if (!scenario_id || !position || !flag_category) {
    return jsonResponse({ error: "missing required fields" }, 400, cors);
  }
  const validCategories = ["wrong_answer", "unrealistic", "wrong_position", "confusing_text", "too_easy_hard"];
  if (!validCategories.includes(flag_category)) {
    return jsonResponse({ error: "invalid flag_category" }, 400, cors);
  }
  try {
    await env.DB.prepare(`
      INSERT INTO scenario_feedback (scenario_id, position, flag_category, comment, scenario_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      scenario_id, position, flag_category,
      (comment || "").slice(0, 140),
      (scenario_json || "{}").slice(0, 5000),
      Date.now()
    ).run();
    // Also update legacy flagged_scenarios for backward compat
    try {
      await env.DB.prepare(`
        INSERT INTO flagged_scenarios (scenario_id, flag_count, position, flagged_at)
        VALUES (?, 1, ?, ?)
        ON CONFLICT(scenario_id) DO UPDATE SET flag_count = flag_count + 1, flagged_at = excluded.flagged_at
      `).bind(scenario_id, position, new Date().toISOString()).run();
    } catch { /* legacy table may not exist */ }
    return jsonResponse({ ok: true }, 200, cors);
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500, cors);
  }
}

// GET /feedback-patterns — aggregate flags by category+position for semantic AI avoidance
async function handleFeedbackPatterns(request, env, cors) {
  const url = new URL(request.url);
  const position = url.searchParams.get("position") || "";
  const sinceDays = Math.min(parseInt(url.searchParams.get("since") || "30"), 90);
  const sinceTs = Date.now() - sinceDays * 24 * 60 * 60 * 1000;
  try {
    const query = position
      ? `SELECT flag_category, COUNT(*) as count,
           GROUP_CONCAT(SUBSTR(comment, 1, 80), ' | ') as sample_comments,
           GROUP_CONCAT(DISTINCT SUBSTR(json_extract(scenario_json, '$.title'), 1, 50)) as sample_titles,
           GROUP_CONCAT(DISTINCT json_extract(scenario_json, '$.concept')) as concepts
         FROM scenario_feedback
         WHERE position = ? AND created_at > ?
         GROUP BY flag_category
         HAVING count >= 2
         ORDER BY count DESC`
      : `SELECT flag_category, position, COUNT(*) as count,
           GROUP_CONCAT(SUBSTR(comment, 1, 80), ' | ') as sample_comments,
           GROUP_CONCAT(DISTINCT SUBSTR(json_extract(scenario_json, '$.title'), 1, 50)) as sample_titles,
           GROUP_CONCAT(DISTINCT json_extract(scenario_json, '$.concept')) as concepts
         FROM scenario_feedback
         WHERE created_at > ?
         GROUP BY flag_category, position
         HAVING count >= 2
         ORDER BY count DESC`;
    const results = position
      ? await env.DB.prepare(query).bind(position, sinceTs).all()
      : await env.DB.prepare(query).bind(sinceTs).all();
    return jsonResponse({ ok: true, patterns: results.results || [] }, 200, cors);
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, cors);
  }
}

// POST /analytics/ai-audit — store audit scores from self-audit second pass
async function handleAIAudit(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, cors);
  }
  const { scenario_id, position, score, realistic, options_quality, coach_accuracy, tone, fix_suggestion } = body;
  if (!scenario_id || !position || typeof score !== "number") {
    return jsonResponse({ error: "missing required fields" }, 400, cors);
  }
  try {
    await env.DB.prepare(`
      INSERT INTO ai_audits (scenario_id, position, score, realistic, options_quality, coach_accuracy, tone, fix_suggestion, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      scenario_id, position, score,
      realistic || 0, options_quality || 0, coach_accuracy || 0, tone || 0,
      (fix_suggestion || "").slice(0, 500), Date.now()
    ).run();
    return jsonResponse({ ok: true }, 200, cors);
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, cors);
  }
}

// GET /prompt-patches — fetch active prompt patches for a position
async function handleGetPromptPatches(request, env, cors) {
  const url = new URL(request.url);
  const position = url.searchParams.get("position") || "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "3"), 5);
  const now = Date.now();
  try {
    const results = await env.DB.prepare(`
      SELECT patch_text, confidence, trigger_type FROM prompt_patches
      WHERE position = ? AND active = 1 AND expires_at > ? AND confidence >= 0.2
      ORDER BY confidence DESC LIMIT ?
    `).bind(position, now, limit).all();
    return jsonResponse({ ok: true, patches: results.results || [] }, 200, cors);
  } catch (e) {
    return jsonResponse({ ok: false, patches: [] }, 200, cors);
  }
}

// Level 2.1: GET /analytics/ai-quality — aggregated AI quality metrics
async function handleAIQualityAnalytics(request, env, cors) {
  const adminKey = request.headers.get("X-Admin-Key");
  if (!adminKey || adminKey !== env.ADMIN_KEY) {
    return jsonResponse({ error: "Unauthorized" }, 401, cors);
  }
  try {
    // AI errors by type (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const errorsByType = await env.DB.prepare(
      "SELECT error_type, COUNT(*) as count FROM error_logs WHERE error_type LIKE 'ai_%' AND created_at > ? GROUP BY error_type ORDER BY count DESC"
    ).bind(thirtyDaysAgo).all();

    // Flagged scenarios by position
    const flagsByPosition = await env.DB.prepare(
      "SELECT position, COUNT(*) as count, SUM(flag_count) as total_flags FROM flagged_scenarios GROUP BY position ORDER BY total_flags DESC"
    ).all();

    // Most flagged individual scenarios
    const topFlagged = await env.DB.prepare(
      "SELECT scenario_id, flag_count, position FROM flagged_scenarios ORDER BY flag_count DESC LIMIT 20"
    ).all();

    // Error trend (daily for last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const dailyErrors = await env.DB.prepare(
      "SELECT DATE(created_at/1000, 'unixepoch') as day, COUNT(*) as count FROM error_logs WHERE error_type LIKE 'ai_%' AND created_at > ? GROUP BY day ORDER BY day"
    ).bind(sevenDaysAgo).all();

    return jsonResponse({
      ok: true,
      period: "30d",
      errorsByType: errorsByType.results || [],
      flagsByPosition: flagsByPosition.results || [],
      topFlagged: topFlagged.results || [],
      dailyErrors: dailyErrors.results || [],
    }, 200, cors);
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, cors);
  }
}

// Level 2.2: POST /analytics/scenario-grade — store scenario quality grades
async function handleScenarioGrade(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, cors);
  }
  const { scenario_id, position, source, quality_score, correct_rate, flag_rate, grader_details } = body;
  if (!scenario_id) return jsonResponse({ error: "missing scenario_id" }, 400, cors);
  try {
    await env.DB.prepare(`
      INSERT INTO scenario_grades (scenario_id, position, source, quality_score, correct_rate, flag_rate, grader_details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      scenario_id, position || "unknown", source || "ai",
      quality_score || 0, correct_rate || 0, flag_rate || 0,
      grader_details ? JSON.stringify(grader_details) : null, Date.now()
    ).run();
    return jsonResponse({ ok: true }, 200, cors);
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, cors);
  }
}

// ============================================================================
// Community Scenario Pool — shared across all users
// ============================================================================

// POST /scenario-pool/submit — contribute a quality AI scenario to the shared pool
async function handlePoolSubmit(request, env, cors) {
  try {
    const body = await request.json();
    const { scenario, position, quality_score, audit_score, source } = body;

    if (!scenario || !position || !scenario.title) {
      return jsonResponse({ error: "Missing scenario, position, or title" }, 400, cors);
    }

    // Quality gate: only accept scenarios scoring >= 8.0
    if ((quality_score || 0) < 8.0) {
      return jsonResponse({ error: "Quality score too low for pool", min: 8.0, got: quality_score }, 400, cors);
    }

    // Generate stable pool ID from content hash (prevents exact duplicates)
    const hashInput = `${position}:${scenario.title}:${scenario.concept || ""}:${(scenario.options || []).join("|")}`;
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(hashInput));
    const poolId = "pool_" + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);

    // Check for duplicate
    const existing = await env.DB.prepare("SELECT id FROM scenario_pool WHERE id = ?").bind(poolId).first();
    if (existing) {
      // Update quality score if new score is higher
      await env.DB.prepare("UPDATE scenario_pool SET quality_score = MAX(quality_score, ?), audit_score = MAX(audit_score, ?) WHERE id = ?")
        .bind(quality_score || 0, audit_score || 0, poolId).run();
      return jsonResponse({ status: "duplicate_updated", id: poolId }, 200, cors);
    }

    // Strip fields that shouldn't be in the pool (user-specific data)
    const cleanScenario = {
      title: scenario.title,
      diff: scenario.diff,
      description: scenario.description,
      situation: scenario.situation,
      options: scenario.options,
      best: scenario.best,
      explanations: scenario.explanations,
      rates: scenario.rates,
      concept: scenario.concept,
      conceptTag: scenario.conceptTag || null,
      anim: scenario.anim || "freeze",
      explSimple: scenario.explSimple || null,
      explDepth: scenario.explDepth || null
    };

    await env.DB.prepare(`
      INSERT INTO scenario_pool (id, position, difficulty, concept, concept_tag, title, scenario_json, quality_score, audit_score, source, contributed_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      poolId,
      position,
      scenario.diff || 2,
      scenario.concept || "",
      scenario.conceptTag || "",
      scenario.title,
      JSON.stringify(cleanScenario),
      quality_score || 0,
      audit_score || 0,
      source || "ai",
      "anonymous",
      Date.now()
    ).run();

    console.log(`[BSM Pool] New scenario added: "${scenario.title}" (${position}, quality: ${quality_score})`);
    return jsonResponse({ status: "added", id: poolId }, 201, cors);
  } catch (e) {
    console.error("[BSM Pool] Submit error:", e.message);
    return jsonResponse({ error: e.message }, 500, cors);
  }
}

// GET /scenario-pool/fetch?position=X&difficulty=Y&concept=Z&exclude=id1,id2
async function handlePoolFetch(request, env, cors) {
  try {
    const url = new URL(request.url);
    const position = url.searchParams.get("position");
    const difficulty = parseInt(url.searchParams.get("difficulty") || "2");
    const conceptTag = url.searchParams.get("concept") || null;
    const exclude = (url.searchParams.get("exclude") || "").split(",").filter(Boolean);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "3"), 10);

    if (!position) {
      return jsonResponse({ error: "position required" }, 400, cors);
    }

    // Build query — prioritize: high quality, low flag rate, concept match
    let query = `
      SELECT id, scenario_json, quality_score, audit_score, times_served, correct_rate
      FROM scenario_pool
      WHERE position = ? AND difficulty = ? AND retired = 0
        AND (times_served < 10 OR flag_rate < 0.10)
    `;
    const params = [position, difficulty];

    // Exclude already-seen scenarios
    if (exclude.length > 0 && exclude.length <= 200) {
      query += ` AND id NOT IN (${exclude.map(() => "?").join(",")})`;
      params.push(...exclude);
    }

    // Prefer concept match if provided
    if (conceptTag) {
      query += ` ORDER BY CASE WHEN concept_tag = ? THEN 0 ELSE 1 END, quality_score DESC, RANDOM()`;
      params.push(conceptTag);
    } else {
      query += ` ORDER BY quality_score DESC, RANDOM()`;
    }

    query += ` LIMIT ?`;
    params.push(limit);

    const results = await env.DB.prepare(query).bind(...params).all();

    // Update times_served for returned scenarios
    if (results.results && results.results.length > 0) {
      const ids = results.results.map(r => r.id);
      // Non-blocking update
      env.DB.prepare(`UPDATE scenario_pool SET times_served = times_served + 1, last_served_at = ? WHERE id IN (${ids.map(() => "?").join(",")})`)
        .bind(Date.now(), ...ids).run().catch(() => {});
    }

    const scenarios = (results.results || []).map(r => {
      try {
        const sc = JSON.parse(r.scenario_json);
        sc.id = r.id; // use pool ID
        sc.isAI = true;
        sc.isPooled = true;
        sc.poolQuality = r.quality_score;
        return sc;
      } catch { return null; }
    }).filter(Boolean);

    return jsonResponse({
      scenarios,
      total: scenarios.length,
      pool_size: await env.DB.prepare("SELECT COUNT(*) as cnt FROM scenario_pool WHERE position = ? AND retired = 0").bind(position).first().then(r => r?.cnt || 0)
    }, 200, cors);
  } catch (e) {
    console.error("[BSM Pool] Fetch error:", e.message);
    return jsonResponse({ error: e.message }, 500, cors);
  }
}

// POST /scenario-pool/feedback — report outcome for a pool scenario
async function handlePoolFeedback(request, env, cors) {
  try {
    const { pool_id, correct, flagged } = await request.json();
    if (!pool_id) return jsonResponse({ error: "pool_id required" }, 400, cors);

    if (correct === true) {
      await env.DB.prepare("UPDATE scenario_pool SET times_correct = times_correct + 1 WHERE id = ?").bind(pool_id).run();
    } else if (correct === false) {
      await env.DB.prepare("UPDATE scenario_pool SET times_wrong = times_wrong + 1 WHERE id = ?").bind(pool_id).run();
    }
    if (flagged) {
      await env.DB.prepare("UPDATE scenario_pool SET times_flagged = times_flagged + 1 WHERE id = ?").bind(pool_id).run();
      // Auto-retire if flagged too many times
      await env.DB.prepare("UPDATE scenario_pool SET retired = 1 WHERE id = ? AND times_flagged >= 3 AND times_served >= 5 AND CAST(times_flagged AS REAL) / times_served > 0.15").bind(pool_id).run();
    }

    return jsonResponse({ status: "ok" }, 200, cors);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors);
  }
}

// GET /scenario-pool/stats — pool inventory overview
async function handlePoolStats(request, env, cors) {
  try {
    const byPosition = await env.DB.prepare(`
      SELECT position, difficulty, COUNT(*) as count,
        ROUND(AVG(quality_score), 1) as avg_quality,
        SUM(times_served) as total_served,
        ROUND(AVG(CASE WHEN times_served > 0 THEN CAST(times_correct AS REAL) / times_served ELSE 0 END), 2) as avg_correct_rate
      FROM scenario_pool WHERE retired = 0
      GROUP BY position, difficulty
      ORDER BY position, difficulty
    `).all();

    const total = await env.DB.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN retired = 1 THEN 1 ELSE 0 END) as retired FROM scenario_pool").first();

    return jsonResponse({
      total: total?.total || 0,
      retired: total?.retired || 0,
      active: (total?.total || 0) - (total?.retired || 0),
      by_position: byPosition.results || []
    }, 200, cors);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors);
  }
}

// Level 2.4: POST /analytics/population-difficulty — store aggregated difficulty data
async function handlePopulationDifficulty(request, env, cors) {
  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, cors);
  }
  const { events } = body;
  if (!Array.isArray(events)) return jsonResponse({ error: "missing events array" }, 400, cors);
  try {
    const now = Date.now();
    const stmts = events.slice(0, 50).flatMap(e => {
      const base = [
        e.scenario_id || "unknown", e.position || "unknown", e.concept || "",
        e.difficulty || 1, e.is_correct ? 1 : 0, e.is_ai ? 1 : 0,
        (e.session_hash || "anon").slice(0, 32)
      ];
      const s = [env.DB.prepare(`
        INSERT INTO scenario_difficulty (scenario_id, position, concept, difficulty, is_correct, is_ai, session_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(...base, now)];
      // Also insert into learning_events with age_group and level
      try {
        s.push(env.DB.prepare(`
          INSERT INTO learning_events (scenario_id, position, concept, difficulty, is_correct, is_ai, session_hash, age_group, level, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(...base, e.age_group || "11-12", e.level || 1, e.timestamp || now));
      } catch { /* learning_events table may not exist yet */ }
      return s;
    });
    if (stmts.length > 0) await env.DB.batch(stmts);
    return jsonResponse({ ok: true, count: events.slice(0, 50).length }, 200, cors);
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500, cors);
  }
}

// Level 2.4 (upgraded): GET /analytics/difficulty-calibration — population difficulty from learning_events
async function handleDifficultyCalibration(request, env, cors) {
  const db = env.DB;
  if (!db) {
    return jsonResponse({ error: "No database configured" }, 500, cors);
  }
  try {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const results = await db.prepare(`
      SELECT concept, position, difficulty,
             COUNT(*) as attempts,
             SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
             ROUND(AVG(CASE WHEN is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100) as pct
      FROM learning_events
      WHERE timestamp > ?
        AND concept != ''
      GROUP BY concept, position, difficulty
      HAVING attempts >= 20
      ORDER BY pct ASC
    `).bind(thirtyDaysAgo).all();

    const calibrations = (results.results || [])
      .filter(r => r.pct < 30 || r.pct > 90)
      .map(r => ({
        concept: r.concept,
        position: r.position,
        difficulty: r.difficulty,
        correctRate: r.pct,
        attempts: r.attempts,
        adjustment: r.pct < 30 ? "too_hard" : "too_easy"
      }));

    return jsonResponse({ calibrations, queriedAt: new Date().toISOString() }, 200, cors);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors);
  }
}

// Level 3: GET /analytics/learning-calibration — age-aware difficulty calibration from learning_events
async function handleLearningCalibration(request, env, cors) {
  try {
    const url = new URL(request.url);
    const ageGroup = url.searchParams.get("age_group") || null;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const query = ageGroup
      ? `SELECT concept, position, age_group,
           COUNT(*) as attempts,
           SUM(is_correct) as correct,
           ROUND(100.0 * SUM(is_correct) / COUNT(*), 1) as correct_rate,
           ROUND(AVG(level), 1) as avg_level
         FROM learning_events
         WHERE timestamp > ? AND concept != '' AND age_group = ?
         GROUP BY concept, position, age_group
         HAVING attempts >= 10
         ORDER BY correct_rate ASC`
      : `SELECT concept, position, age_group,
           COUNT(*) as attempts,
           SUM(is_correct) as correct,
           ROUND(100.0 * SUM(is_correct) / COUNT(*), 1) as correct_rate,
           ROUND(AVG(level), 1) as avg_level
         FROM learning_events
         WHERE timestamp > ? AND concept != ''
         GROUP BY concept, position, age_group
         HAVING attempts >= 10
         ORDER BY correct_rate ASC`;
    const results = ageGroup
      ? await env.DB.prepare(query).bind(thirtyDaysAgo, ageGroup).all()
      : await env.DB.prepare(query).bind(thirtyDaysAgo).all();
    const rows = results.results || [];
    return jsonResponse({
      ok: true,
      all: rows,
      tooHard: rows.filter(r => r.correct_rate < 40),
      tooEasy: rows.filter(r => r.correct_rate > 90),
    }, 200, cors);
  } catch (e) {
    // Fallback if learning_events table doesn't exist yet
    return jsonResponse({ ok: false, error: String(e) }, 500, cors);
  }
}

// Level 4: POST /analytics/ab-results — store A/B test outcome data
async function handleABResults(request, env, cors) {
  const db = env.DB;
  if (!db) {
    return jsonResponse({ error: "No database configured" }, 500, cors);
  }
  try {
    const body = await request.json();
    const events = Array.isArray(body.events) ? body.events : [body];
    for (const event of events.slice(0, 50)) {
      await db.prepare(`
        INSERT INTO ab_results (test_id, variant_id, session_hash, metric, value, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        event.testId || "",
        event.variantId || "",
        event.sessionHash || "",
        event.metric || "",
        event.value || 0,
        event.timestamp || Date.now()
      ).run();
    }
    return jsonResponse({ stored: events.length }, 200, cors);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500, cors);
  }
}

// --- Level 2.1: Weekly Cron Trigger for AI Quality Aggregation ---
// Runs every Monday at 6am UTC. Creates weekly_ai_report entries in D1.
// Identifies: degraded concepts (<40% correct), too-easy concepts (>90%), high flag-rate positions (>5%).

async function handleScheduled(event, env) {
  const now = Date.now()
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000

  try {
    // 1. Aggregate difficulty data from last 7 days
    const diffData = await env.DB.prepare(`
      SELECT concept, position, difficulty,
        COUNT(*) as attempts,
        SUM(is_correct) as correct,
        ROUND(100.0 * SUM(is_correct) / COUNT(*), 1) as correct_rate,
        SUM(is_ai) as ai_count,
        COUNT(*) - SUM(is_ai) as hc_count
      FROM scenario_difficulty
      WHERE created_at > ? AND concept != ''
      GROUP BY concept, position, difficulty
      HAVING attempts >= 5
      ORDER BY correct_rate ASC
    `).bind(weekAgo).all()

    const allConcepts = diffData.results || []
    const tooHard = allConcepts.filter(r => r.correct_rate < 40)
    const tooEasy = allConcepts.filter(r => r.correct_rate > 90)

    // 2. Aggregate flag data
    const flagData = await env.DB.prepare(`
      SELECT position, COUNT(*) as flagged_count, SUM(flag_count) as total_flags
      FROM flagged_scenarios
      WHERE flagged_at > ?
      GROUP BY position
      ORDER BY total_flags DESC
    `).bind(weekAgo).all()

    const highFlagPositions = (flagData.results || []).filter(r => {
      const posTotal = allConcepts.filter(c => c.position === r.position).reduce((sum, c) => sum + c.attempts, 0)
      return posTotal > 0 && (r.total_flags / posTotal) > 0.05
    })

    // 3. AI vs HC quality comparison
    const aiQuality = await env.DB.prepare(`
      SELECT source, COUNT(*) as count, ROUND(AVG(quality_score), 1) as avg_score
      FROM scenario_grades
      WHERE created_at > ?
      GROUP BY source
    `).bind(weekAgo).all()

    // 4. Error trends
    const errorTrend = await env.DB.prepare(`
      SELECT error_type, COUNT(*) as count
      FROM error_logs
      WHERE error_type LIKE 'ai_%' AND created_at > ?
      GROUP BY error_type
      ORDER BY count DESC
    `).bind(weekAgo).all()

    // 5. Store weekly report
    const report = {
      period_start: weekAgo,
      period_end: now,
      total_concepts_tracked: allConcepts.length,
      too_hard: tooHard.map(r => ({ concept: r.concept, position: r.position, rate: r.correct_rate, attempts: r.attempts })),
      too_easy: tooEasy.map(r => ({ concept: r.concept, position: r.position, rate: r.correct_rate, attempts: r.attempts })),
      high_flag_positions: highFlagPositions.map(r => ({ position: r.position, flags: r.total_flags })),
      ai_quality: aiQuality.results || [],
      error_summary: (errorTrend.results || []).slice(0, 10),
      generated_at: now
    }

    // Ensure weekly_ai_report table exists (idempotent)
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS weekly_ai_report (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        period_start INTEGER NOT NULL,
        period_end INTEGER NOT NULL,
        report_json TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run()

    await env.DB.prepare(`
      INSERT INTO weekly_ai_report (period_start, period_end, report_json, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(weekAgo, now, JSON.stringify(report), now).run()

    console.log(`[BSM Cron] Weekly report generated: ${allConcepts.length} concepts, ${tooHard.length} too hard, ${tooEasy.length} too easy, ${highFlagPositions.length} high-flag positions`)
  } catch (e) {
    console.error("[BSM Cron] Weekly aggregation failed:", e.message)
  }

  // --- Phase D: Generate prompt patches from accumulated data ---
  try {
    const positions = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField","batter","baserunner","manager"];
    const patchWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    for (const pos of positions) {
      // Check feedback patterns for this position
      let feedbackPatterns = [];
      try {
        const fbRes = await env.DB.prepare(`
          SELECT flag_category, COUNT(*) as count
          FROM scenario_feedback WHERE position = ? AND created_at > ?
          GROUP BY flag_category ORDER BY count DESC
        `).bind(pos, patchWeekAgo).all();
        feedbackPatterns = fbRes.results || [];
      } catch { /* table may not exist */ }

      // Check audit scores for this position
      let avgAuditScore = null;
      try {
        const auditRes = await env.DB.prepare(`
          SELECT ROUND(AVG(score), 1) as avg_score, COUNT(*) as count
          FROM ai_audits WHERE position = ? AND created_at > ?
        `).bind(pos, patchWeekAgo).first();
        if (auditRes && auditRes.count >= 3) avgAuditScore = auditRes.avg_score;
      } catch { /* table may not exist */ }

      // Check AI error rates
      let errorCounts = {};
      try {
        const errRes = await env.DB.prepare(`
          SELECT error_type, COUNT(*) as count FROM error_logs
          WHERE error_type LIKE 'ai_%' AND error_data LIKE ? AND created_at > ?
          GROUP BY error_type
        `).bind(`%${pos}%`, patchWeekAgo).all();
        for (const r of (errRes.results || [])) errorCounts[r.error_type] = r.count;
      } catch {}

      const newPatches = [];

      // Trigger: 5+ wrong_answer flags
      const wrongAnswerFlags = feedbackPatterns.find(p => p.flag_category === "wrong_answer");
      if (wrongAnswerFlags && wrongAnswerFlags.count >= 5) {
        newPatches.push({
          text: `QUALITY ALERT (${pos}): Recent ${pos} scenarios had ${wrongAnswerFlags.count} "wrong best answer" flags. Double-check that the best answer is what a real coach would teach. Verify the explanation for the best answer specifically argues FOR that option.`,
          trigger: "wrong_answer_flags"
        });
      }

      // Trigger: 5+ unrealistic flags
      const unrealisticFlags = feedbackPatterns.find(p => p.flag_category === "unrealistic");
      if (unrealisticFlags && unrealisticFlags.count >= 5) {
        newPatches.push({
          text: `REALISM ALERT (${pos}): ${unrealisticFlags.count} players flagged recent ${pos} scenarios as unrealistic. Make sure the game situation would actually happen. Use common counts, realistic scores, and real in-game decisions.`,
          trigger: "unrealistic_flags"
        });
      }

      // Trigger: 5+ wrong_position flags
      const wrongPosFlags = feedbackPatterns.find(p => p.flag_category === "wrong_position");
      if (wrongPosFlags && wrongPosFlags.count >= 5) {
        newPatches.push({
          text: `ROLE ALERT (${pos}): ${wrongPosFlags.count} players said recent ${pos} scenarios asked them to do another position's job. Every option must be an action THIS position performs.`,
          trigger: "wrong_position_flags"
        });
      }

      // Trigger: Low audit score
      if (avgAuditScore !== null && avgAuditScore < 3.5) {
        newPatches.push({
          text: `AUTHENTICITY ALERT (${pos}): Recent ${pos} scenarios scored ${avgAuditScore}/5 on baseball authenticity. Make the situation feel like a real game — use coaching language, realistic timing, and decisions that matter.`,
          trigger: "low_audit_score"
        });
      }

      // Trigger: High role-violation error rate
      if ((errorCounts["ai_role-violation"] || 0) >= 5) {
        newPatches.push({
          text: `BOUNDARY ALERT (${pos}): ${errorCounts["ai_role-violation"]} recent role violations. Strictly limit options to actions this position performs. Review the POSITION-ACTION BOUNDARIES section.`,
          trigger: "role_violation_spike"
        });
      }

      // Apply patches: update existing or create new
      for (const patch of newPatches.slice(0, 5)) {
        try {
          // Check if similar patch already exists
          const existing = await env.DB.prepare(`
            SELECT id, confidence FROM prompt_patches
            WHERE position = ? AND trigger_type = ? AND active = 1
          `).bind(pos, patch.trigger).first();

          if (existing) {
            // Boost confidence
            const newConf = Math.min(1.0, (existing.confidence || 0.5) + 0.1);
            await env.DB.prepare(`
              UPDATE prompt_patches SET confidence = ?, patch_text = ?, updated_at = ?, expires_at = ?
              WHERE id = ?
            `).bind(newConf, patch.text, now, now + thirtyDays, existing.id).run();
          } else {
            // Count active patches for this position
            const activeCount = await env.DB.prepare(`
              SELECT COUNT(*) as count FROM prompt_patches WHERE position = ? AND active = 1
            `).bind(pos).first();
            if ((activeCount?.count || 0) < 5) {
              await env.DB.prepare(`
                INSERT INTO prompt_patches (position, patch_text, trigger_type, confidence, expires_at, active, created_at, updated_at)
                VALUES (?, ?, ?, 0.5, ?, 1, ?, ?)
              `).bind(pos, patch.text, patch.trigger, now + thirtyDays, now, now).run();
            }
          }
        } catch {}
      }

      // Decay patches that no longer have active triggers
      try {
        const activePatches = await env.DB.prepare(`
          SELECT id, trigger_type, confidence FROM prompt_patches
          WHERE position = ? AND active = 1
        `).bind(pos).all();
        const activeTriggers = new Set(newPatches.map(p => p.trigger));
        for (const p of (activePatches.results || [])) {
          if (!activeTriggers.has(p.trigger_type)) {
            const newConf = Math.max(0, (p.confidence || 0.5) - 0.15);
            if (newConf < 0.2) {
              await env.DB.prepare("UPDATE prompt_patches SET active = 0, updated_at = ? WHERE id = ?").bind(now, p.id).run();
            } else {
              await env.DB.prepare("UPDATE prompt_patches SET confidence = ?, updated_at = ? WHERE id = ?").bind(newConf, now, p.id).run();
            }
          }
        }
      } catch {}
    }
    console.log("[BSM Cron] Prompt patch generation complete")
  } catch (e) {
    console.error("[BSM Cron] Prompt patch generation failed:", e.message)
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

    // Community Scenario Pool endpoints
    if (path === "/scenario-pool/submit" && request.method === "POST") {
      if (!checkRateLimit(`ai:${ip}`, RATE_LIMIT_AI)) {
        return jsonResponse({ error: "Rate limited. Try again in a minute." }, 429, cors);
      }
      try {
        return await handlePoolSubmit(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }
    if (path === "/scenario-pool/fetch" && request.method === "GET") {
      try {
        return await handlePoolFetch(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }
    if (path === "/scenario-pool/feedback" && request.method === "POST") {
      if (!checkRateLimit(`ai:${ip}`, RATE_LIMIT_AI)) {
        return jsonResponse({ error: "Rate limited. Try again in a minute." }, 429, cors);
      }
      try {
        return await handlePoolFeedback(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }
    if (path === "/scenario-pool/stats" && request.method === "GET") {
      try {
        return await handlePoolStats(request, env, cors);
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

    if (path === "/analytics/ai-quality" && request.method === "GET") {
      try {
        return await handleAIQualityAnalytics(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }

    if (path === "/analytics/ai-audit" && request.method === "POST") {
      if (!checkRateLimit(`analytics:${ip}`, RATE_LIMIT_ANALYTICS)) {
        return jsonResponse({ ok: false, error: "Rate limited" }, 429, cors);
      }
      try {
        return await handleAIAudit(request, env, cors);
      } catch {
        return jsonResponse({ ok: false }, 500, cors);
      }
    }

    if (path === "/analytics/scenario-grade" && request.method === "POST") {
      if (!checkRateLimit(`analytics:${ip}`, RATE_LIMIT_ANALYTICS)) {
        return jsonResponse({ ok: false, error: "Rate limited" }, 429, cors);
      }
      try {
        return await handleScenarioGrade(request, env, cors);
      } catch {
        return jsonResponse({ ok: false }, 500, cors);
      }
    }

    if (path === "/analytics/population-difficulty" && request.method === "POST") {
      if (!checkRateLimit(`analytics:${ip}`, RATE_LIMIT_ANALYTICS)) {
        return jsonResponse({ ok: false, error: "Rate limited" }, 429, cors);
      }
      try {
        return await handlePopulationDifficulty(request, env, cors);
      } catch {
        return jsonResponse({ ok: false }, 500, cors);
      }
    }

    if (path === "/analytics/difficulty-calibration" && request.method === "GET") {
      try {
        return await handleDifficultyCalibration(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }

    if (path === "/analytics/learning-calibration" && request.method === "GET") {
      try {
        return await handleLearningCalibration(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }

    if (path === "/analytics/ab-results" && request.method === "POST") {
      if (!checkRateLimit(`analytics:${ip}`, RATE_LIMIT_ANALYTICS)) {
        return jsonResponse({ error: "Rate limited" }, 429, cors);
      }
      try {
        return await handleABResults(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }

    // Level 2.1: GET /analytics/weekly-report — fetch latest weekly AI quality reports
    if (path === "/analytics/weekly-report" && request.method === "GET") {
      const adminKey = request.headers.get("X-Admin-Key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      try {
        const reports = await env.DB.prepare(
          "SELECT id, period_start, period_end, report_json, created_at FROM weekly_ai_report ORDER BY created_at DESC LIMIT 5"
        ).all();
        const parsed = (reports.results || []).map(r => ({ ...r, report: JSON.parse(r.report_json || "{}") }));
        return jsonResponse({ ok: true, reports: parsed }, 200, cors);
      } catch (e) {
        return jsonResponse({ ok: false, error: String(e) }, 500, cors);
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
      if (path === "/flagged-scenarios") {
        try {
          return await handleFlaggedScenarios(request, env, cors);
        } catch {
          return jsonResponse({ ok: false }, 500, cors);
        }
      }
      if (path === "/feedback-patterns") {
        try {
          return await handleFeedbackPatterns(request, env, cors);
        } catch {
          return jsonResponse({ ok: false, patterns: [] }, 200, cors);
        }
      }
      if (path === "/prompt-patches") {
        try {
          return await handleGetPromptPatches(request, env, cors);
        } catch {
          return jsonResponse({ ok: false, patches: [] }, 200, cors);
        }
      }
      if (path === "/health") {
        return jsonResponse({ ok: true, ts: Date.now() }, 200, cors);
      }
      if (path === "/ai-test") {
        const adminKey = request.headers.get("X-Admin-Key");
        if (!adminKey || adminKey !== env.ADMIN_KEY) {
          return jsonResponse({ error: "Unauthorized" }, 401, cors);
        }
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
      if (path === "/feedback-scenario") return await handleFeedbackScenario(request, env, cors);
      return await handleAIProxy(request, env, cors);
    } catch (err) {
      return jsonResponse({ error: "Proxy error" }, 502, cors);
    }
  },

  // Level 2.1: Cron Trigger — runs weekly analytics aggregation
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(event, env))
  },
};
