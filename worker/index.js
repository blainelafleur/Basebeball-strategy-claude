// Cloudflare Worker — xAI API proxy + promo codes + user accounts for Baseball Strategy Master
// Secrets: XAI_API_KEY, RESEND_API_KEY
// Bindings: PROMO_CODES (KV), DB (D1), VECTORIZE (Vectorize), AI (Workers AI)

import { embedAllKnowledge, queryKnowledge } from "./scripts/embed-knowledge.js";

const ALLOWED_ORIGINS = [
  "https://bsm-app.pages.dev",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:8080",
];

// Multi-agent pipeline (Phase 0 — Claude Opus + RAG)
const ANTHROPIC_MODEL = "claude-opus-4-20250514";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MULTI_AGENT_TIMEOUT = 80000; // 80s total pipeline budget (client times out at 90s — leave margin)
const STAGE_TIMEOUT = 35000; // 35s per stage max (Opus typically responds in 5-20s)

// Fine-tuned 70B model (drop-in ready — set LLM_70B_* secrets when deployed)
// Supports any OpenAI-compatible API (vLLM, Together, Fireworks, RunPod, etc.)
const LLM_70B_TIMEOUT = 90000; // 90s timeout for 70B inference
const LLM_70B_DEFAULT_MAX_TOKENS = 2000;

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

// Prompt versioning — track prompt composition and correlate with quality
// CREATE TABLE IF NOT EXISTS prompt_versions (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   scenario_id TEXT,
//   position TEXT,
//   prompt_hash TEXT,
//   system_message_length INTEGER,
//   user_message_length INTEGER,
//   injected_patches INTEGER DEFAULT 0,
//   injected_calibration INTEGER DEFAULT 0,
//   injected_error_patterns INTEGER DEFAULT 0,
//   injected_audit_insights INTEGER DEFAULT 0,
//   generation_grade REAL,
//   pipeline TEXT DEFAULT 'standard',
//   temperature REAL,
//   model TEXT DEFAULT 'grok-4',
//   timestamp INTEGER
// );
// CREATE INDEX IF NOT EXISTS idx_prompt_hash ON prompt_versions(prompt_hash);
// CREATE INDEX IF NOT EXISTS idx_pv_position ON prompt_versions(position);

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
//   retired INTEGER DEFAULT 0,
//   generation_grade REAL DEFAULT NULL,
//   tier TEXT DEFAULT 'new',
//   scenario_signature TEXT DEFAULT ''
// );
// -- Migration: ALTER TABLE scenario_pool ADD COLUMN generation_grade REAL DEFAULT NULL;
// -- Migration: ALTER TABLE scenario_pool ADD COLUMN tier TEXT DEFAULT 'new';
// -- Migration: CREATE INDEX IF NOT EXISTS idx_pool_tier ON scenario_pool(tier);
// -- Migration: ALTER TABLE scenario_pool ADD COLUMN scenario_signature TEXT DEFAULT '';
// -- Migration: CREATE INDEX IF NOT EXISTS idx_pool_signature ON scenario_pool(scenario_signature);
// -- Migration: ALTER TABLE scenario_pool ADD COLUMN evolved_from TEXT DEFAULT NULL;
// CREATE INDEX IF NOT EXISTS idx_pool_position ON scenario_pool(position);
// CREATE INDEX IF NOT EXISTS idx_pool_pos_diff ON scenario_pool(position, difficulty);
// CREATE INDEX IF NOT EXISTS idx_pool_concept ON scenario_pool(concept_tag);
// CREATE INDEX IF NOT EXISTS idx_pool_quality ON scenario_pool(quality_score);
// CREATE INDEX IF NOT EXISTS idx_pool_retired ON scenario_pool(retired);

// AutoResearch: Prompt optimization cycle tracking
// See worker/migrations/autoresearch_tables.sql
// CREATE TABLE IF NOT EXISTS prompt_optimization_cycles (cycle_id TEXT PRIMARY KEY, timestamp TEXT NOT NULL, control_avg_score REAL, control_pass_rate REAL, control_tier1_fails INTEGER, variants_tested INTEGER, variants_adopted INTEGER, results_json TEXT, changelog_entry TEXT);
// CREATE TABLE IF NOT EXISTS prompt_variants_log (variant_id TEXT PRIMARY KEY, cycle_id TEXT REFERENCES prompt_optimization_cycles(cycle_id), mutation_type TEXT NOT NULL, mutations_json TEXT NOT NULL, avg_score REAL, pass_rate REAL, delta_vs_control REAL, adopted BOOLEAN DEFAULT FALSE, created_at TEXT NOT NULL);

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
  const timeout = setTimeout(() => controller.abort(), 90000);
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
      }, xaiResponse.status, { ...cors, "X-XAI-Elapsed": String(elapsed), "X-XAI-Timeout": "90000" });
    }
    console.log(`[BSM Worker] xAI responded ${xaiResponse.status} in ${elapsed}ms`);
    // Stream response through directly — no buffering
    return new Response(xaiResponse.body, {
      status: xaiResponse.status,
      headers: { ...cors, "Content-Type": "application/json", "X-XAI-Elapsed": String(elapsed), "X-XAI-Timeout": "90000" },
    });
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") {
      console.error("[BSM Worker] xAI timeout after 90s");
      return jsonResponse({ error: { message: "xAI API timeout (90s)", type: "timeout" } }, 504, { ...cors, "X-XAI-Timeout": "90000" });
    }
    console.error("[BSM Worker] xAI fetch error:", e.message);
    return jsonResponse({ error: { message: e.message, type: "fetch_error" } }, 502, { ...cors, "X-XAI-Timeout": "90000" });
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

    // Real-time prompt patch: if 3+ flags for this position+category in last 7 days, auto-create patch
    try {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const flagCount = await env.DB.prepare(
        'SELECT COUNT(*) as cnt FROM scenario_feedback WHERE position = ? AND flag_category = ? AND created_at > ?'
      ).bind(position, flag_category, sevenDaysAgo).first()

      if (flagCount?.cnt >= 3) {
        const existingPatch = await env.DB.prepare(
          'SELECT id FROM prompt_patches WHERE position = ? AND trigger_type = ? AND active = 1 AND expires_at > ?'
        ).bind(position, flag_category, Date.now()).first()

        if (!existingPatch) {
          const PATCH_TEMPLATES = {
            confusing_text: `QUALITY ALERT for ${position}: Recent player feedback reports confusing explanations. Write SHORT, CLEAR sentences. Start explanations with "You..." or "The problem with..." NO filler phrases. NO abstract language. Be specific about what happens on the field.`,
            wrong_answer: `ACCURACY ALERT for ${position}: Recent player feedback reports incorrect best answers. Double-check that the best option follows standard coaching consensus. Verify the game situation makes the answer possible.`,
            unrealistic: `REALISM ALERT for ${position}: Recent player feedback reports unrealistic game situations. Ensure the scenario could actually happen in a real game. Check that outs, runners, score, and inning are consistent.`,
            too_easy_hard: `DIFFICULTY ALERT for ${position}: Recent data shows scenarios are too easy or too hard. Make wrong options more plausible. Include at least one "sounds smart but wrong" option rated 45-60.`,
            wrong_position: `ROLE ALERT for ${position}: Recent player feedback says scenarios ask this position to do another position's job. Every option must be an action THIS position performs.`,
          }
          const patchText = PATCH_TEMPLATES[flag_category] || `QUALITY ALERT for ${position}: Multiple player flags (${flag_category}). Review and improve scenario quality.`
          const thirtyDays = 30 * 24 * 60 * 60 * 1000
          await env.DB.prepare(
            'INSERT INTO prompt_patches (position, patch_text, trigger_type, confidence, expires_at, active, created_at, updated_at) VALUES (?, ?, ?, 0.5, ?, 1, ?, ?)'
          ).bind(position, patchText, flag_category, Date.now() + thirtyDays, Date.now(), Date.now()).run()
          console.log(`[BSM Feedback] Auto-created prompt patch for ${position}:${flag_category} (${flagCount.cnt} flags)`)
        }
      }
    } catch (e) {
      console.warn("[BSM Feedback] Prompt patch auto-generation failed:", e.message)
    }

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

// POST /analytics/prompt-version — store prompt metadata for quality correlation
async function handlePromptVersion(request, env, cors) {
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)
  try {
    const body = await request.json()
    await db.prepare(`
      INSERT INTO prompt_versions (scenario_id, position, prompt_hash, system_message_length, user_message_length, injected_patches, injected_calibration, injected_error_patterns, injected_audit_insights, generation_grade, pipeline, temperature, model, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.scenarioId || '', body.position || '', body.promptHash || '',
      body.systemMessageLength || 0, body.userMessageLength || 0,
      body.injectedPatches || 0, body.injectedCalibration || 0,
      body.injectedErrorPatterns || 0, body.injectedAuditInsights || 0,
      body.generationGrade || 0, body.pipeline || 'standard',
      body.temperature || 0.4, body.model || 'grok-4', Date.now()
    ).run()
    return jsonResponse({ ok: true }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
  }
}

// GET /analytics/audit-insights — aggregate weak spots from self-audit scores
async function handleAuditInsights(request, env, cors) {
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)
  try {
    const url = new URL(request.url)
    const position = url.searchParams.get("position")
    const days = parseInt(url.searchParams.get("days") || "30")
    const since = Date.now() - days * 24 * 60 * 60 * 1000

    const query = position
      ? `SELECT position,
              COUNT(*) as audit_count,
              ROUND(AVG(score), 2) as avg_score,
              MIN(score) as min_score,
              ROUND(AVG(realistic), 2) as avg_realistic,
              ROUND(AVG(options_quality), 2) as avg_options,
              ROUND(AVG(coach_accuracy), 2) as avg_coach,
              ROUND(AVG(tone), 2) as avg_tone,
              GROUP_CONCAT(DISTINCT fix_suggestion) as feedback_samples
         FROM ai_audits
         WHERE created_at > ? AND position = ?
         GROUP BY position
         HAVING audit_count >= 3 AND avg_score < 3.5
         ORDER BY avg_score ASC
         LIMIT 10`
      : `SELECT position,
              COUNT(*) as audit_count,
              ROUND(AVG(score), 2) as avg_score,
              MIN(score) as min_score,
              ROUND(AVG(realistic), 2) as avg_realistic,
              ROUND(AVG(options_quality), 2) as avg_options,
              ROUND(AVG(coach_accuracy), 2) as avg_coach,
              ROUND(AVG(tone), 2) as avg_tone,
              GROUP_CONCAT(DISTINCT fix_suggestion) as feedback_samples
         FROM ai_audits
         WHERE created_at > ?
         GROUP BY position
         HAVING audit_count >= 3 AND avg_score < 3.5
         ORDER BY avg_score ASC
         LIMIT 20`

    const results = position
      ? await db.prepare(query).bind(since, position).all()
      : await db.prepare(query).bind(since).all()

    return jsonResponse({
      weakSpots: results.results || [],
      queriedAt: new Date().toISOString()
    }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
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

// Extract a concept tag from free-text concept description via keyword matching
function extractConceptTag(conceptText) {
  if (!conceptText) return ''
  const TAG_MAP = {
    'steal': 'steal-window',
    'pickoff': 'pickoff-mechanics',
    'pick.?off': 'pickoff-mechanics',
    'first.?pitch': 'first-pitch-strike',
    'count': 'count-leverage',
    'relay': 'relay-double-cut',
    'cutoff': 'cutoff-alignment',
    'cut.?off': 'cutoff-alignment',
    'backup': 'backup-duties',
    'back.?up': 'backup-duties',
    'bunt': 'bunt-defense',
    'double.?play': 'double-play-turn',
    'force': 'force-vs-tag',
    'tag.?up': 'tag-up-rules',
    'fly.?ball': 'fly-ball-priority',
    'pitch.?clock': 'pitch-clock-strategy',
    'two.?strike': 'two-strike-approach',
    '2.?strike': 'two-strike-approach',
    'situational': 'situational-hitting',
    'pitch.?call': 'pitch-calling',
    'pitch.?sequence': 'pitch-sequencing',
    'hold': 'holding-runners',
    'squeeze': 'squeeze-play',
    'hit.?and.?run': 'hit-and-run',
    'rundown': 'rundown',
    'sacrifice': 'sacrifice-bunt',
    'infield.?fly': 'infield-fly-rule',
    'ibb': 'ibb-strategy',
    'intentional': 'ibb-strategy',
  }
  const lc = conceptText.toLowerCase()
  for (const [pattern, tag] of Object.entries(TAG_MAP)) {
    if (new RegExp(pattern, 'i').test(lc)) return tag
  }
  return ''
}

// Semantic signature for near-duplicate detection
function computeScenarioSignature(scenario, position) {
  const concept = scenario.conceptTag || scenario.concept || ''
  const inningBucket = (() => {
    const inn = scenario.situation?.inning || ''
    const num = parseInt(inn.replace(/\D/g, '')) || 5
    if (num <= 3) return 'early'
    if (num <= 6) return 'mid'
    return 'late'
  })()
  const scoreDiff = (() => {
    const score = scenario.situation?.score || [0, 0]
    const diff = score[0] - score[1]
    if (diff > 2) return 'blowout-lead'
    if (diff > 0) return 'close-lead'
    if (diff === 0) return 'tied'
    if (diff > -3) return 'close-trail'
    return 'blowout-trail'
  })()
  const runners = (scenario.situation?.runners || []).sort().join('')
  const outs = scenario.situation?.outs ?? ''
  return `${position}|${concept}|${inningBucket}|${outs}|${scoreDiff}|${runners}`
}

// POST /scenario-pool/submit — contribute a quality AI scenario to the shared pool
async function handlePoolSubmit(request, env, cors) {
  try {
    const body = await request.json();
    const { scenario, position, quality_score, audit_score, source, generation_grade } = body;

    if (!scenario || !position || !scenario.title) {
      return jsonResponse({ error: "Missing scenario, position, or title" }, 400, cors);
    }

    // Quality gate: dynamic threshold based on pool size for this position
    // Underserved positions (< 5 scenarios) get a lower gate to bootstrap the pool
    const poolCount = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM scenario_pool WHERE position = ? AND retired = 0'
    ).bind(position).first()
    const qualityGate = (poolCount?.cnt || 0) < 5 ? 6.5 : 7.5

    if ((quality_score || 0) < qualityGate) {
      return jsonResponse({ error: "Quality score too low for pool", min: qualityGate, got: quality_score, pool_size: poolCount?.cnt || 0 }, 400, cors);
    }

    // Generate stable pool ID from content hash (prevents exact duplicates)
    const hashInput = `${position}:${scenario.title}:${scenario.concept || ""}:${(scenario.options || []).join("|")}`;
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(hashInput));
    const poolId = "pool_" + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);

    // Check for duplicate
    const existing = await env.DB.prepare("SELECT id FROM scenario_pool WHERE id = ?").bind(poolId).first();
    if (existing) {
      // Update quality score if new score is higher
      await env.DB.prepare("UPDATE scenario_pool SET quality_score = MAX(quality_score, ?), audit_score = MAX(audit_score, ?), generation_grade = COALESCE(MAX(generation_grade, ?), ?) WHERE id = ?")
        .bind(quality_score || 0, audit_score || 0, generation_grade || 0, generation_grade || 0, poolId).run();
      return jsonResponse({ status: "duplicate_updated", id: poolId }, 200, cors);
    }

    // Semantic dedup: reject near-identical scenarios unless significantly better quality
    const signature = computeScenarioSignature(scenario, position)
    if (signature) {
      try {
        const sigMatch = await env.DB.prepare(`
          SELECT id, quality_score, tier FROM scenario_pool
          WHERE scenario_signature = ? AND retired = 0 AND tier IN ('gold', 'validated')
          ORDER BY quality_score DESC LIMIT 1
        `).bind(signature).first()

        if (sigMatch) {
          // Normalize to 0-10 scale: quality_score is already 0-10, generation_grade is 0-100
          const newQuality = quality_score > 0 ? quality_score : (generation_grade > 0 ? generation_grade / 10 : 7.0)
          if (newQuality < sigMatch.quality_score * 1.10) {
            console.log(`[BSM Pool] Semantic duplicate rejected: "${scenario.title}" matches ${sigMatch.id} (sig: ${signature})`)
            return jsonResponse({
              status: "duplicate_signature",
              existingId: sigMatch.id,
              existingQuality: sigMatch.quality_score,
              existingTier: sigMatch.tier,
              signature
            }, 200, cors)
          }
          // New scenario is significantly better — retire the old one
          await env.DB.prepare("UPDATE scenario_pool SET tier = 'replaced', retired = 1 WHERE id = ?").bind(sigMatch.id).run()
          console.log(`[BSM Pool] Replacing ${sigMatch.id} (quality ${sigMatch.quality_score}) with better scenario (quality ${newQuality})`)
        }
      } catch (sigErr) {
        // Non-blocking — if signature check fails, allow the insert
        console.warn("[BSM Pool] Signature check failed:", sigErr.message)
      }
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
      INSERT INTO scenario_pool (id, position, difficulty, concept, concept_tag, title, scenario_json, quality_score, audit_score, source, contributed_by, created_at, generation_grade, scenario_signature)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      poolId,
      position,
      scenario.diff || 2,
      scenario.concept || "",
      scenario.conceptTag || extractConceptTag(scenario.concept || ""),
      scenario.title,
      JSON.stringify(cleanScenario),
      quality_score || 0,
      audit_score || 0,
      source || "ai",
      "anonymous",
      Date.now(),
      generation_grade || null,
      signature || ""
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
    const excludeTitles = (url.searchParams.get("exclude_titles") || "").split("|").filter(Boolean);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "3"), 10);

    if (!position) {
      return jsonResponse({ error: "position required" }, 400, cors);
    }

    // Build query — prioritize: gold > validated > new, then quality, concept match
    let query = `
      SELECT id, scenario_json, quality_score, audit_score, times_served, correct_rate, tier
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

    if (excludeTitles.length > 0 && excludeTitles.length <= 50) {
      query += ` AND title NOT IN (${excludeTitles.map(() => "?").join(",")})`;
      params.push(...excludeTitles);
    }

    // Prefer concept match if provided; always prioritize tier (gold > validated > new)
    const tierOrder = `CASE COALESCE(tier, 'new') WHEN 'gold' THEN 1 WHEN 'validated' THEN 2 WHEN 'new' THEN 3 ELSE 4 END`
    if (conceptTag) {
      query += ` ORDER BY CASE WHEN concept_tag = ? THEN 0 ELSE 1 END, ${tierOrder}, quality_score DESC, RANDOM()`;
      params.push(conceptTag);
    } else {
      query += ` ORDER BY ${tierOrder}, quality_score DESC, RANDOM()`;
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
        sc.poolTier = r.tier || "new";
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
      await env.DB.prepare("UPDATE scenario_pool SET retired = 1, tier = 'retired' WHERE id = ? AND times_flagged >= 3 AND times_served >= 5 AND CAST(times_flagged AS REAL) / times_served > 0.15").bind(pool_id).run();
    }

    return jsonResponse({ status: "ok" }, 200, cors);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors);
  }
}

// POST /scenario-pool/promote — run tier promotion/demotion lifecycle
async function handlePoolPromotion(env) {
  const db = env.DB
  if (!db) return { error: "No database configured" }
  try {
    // Promote: new → validated (5+ serves, <15% flag rate)
    const promoted = await db.prepare(`
      UPDATE scenario_pool SET tier = 'validated'
      WHERE tier = 'new' AND retired = 0
        AND times_served >= 5
        AND (CAST(times_flagged AS REAL) / MAX(times_served, 1)) < 0.15
    `).run()

    // Promote: validated → gold (50+ serves, >35% correct rate, quality >= 8.0, <10% flag rate)
    const golded = await db.prepare(`
      UPDATE scenario_pool SET tier = 'gold'
      WHERE tier = 'validated' AND retired = 0
        AND times_served >= 50
        AND (CAST(times_correct AS REAL) / MAX(times_served, 1)) > 0.35
        AND (CAST(times_flagged AS REAL) / MAX(times_served, 1)) < 0.10
        AND quality_score >= 8.0
    `).run()

    // Demote/retire: 10+ serves and flag rate > 15%
    const retired = await db.prepare(`
      UPDATE scenario_pool SET tier = 'retired', retired = 1
      WHERE retired = 0
        AND times_served >= 10
        AND (CAST(times_flagged AS REAL) / MAX(times_served, 1)) > 0.15
    `).run()

    // Demote gold → validated if flag rate crept above 10%
    const demoted = await db.prepare(`
      UPDATE scenario_pool SET tier = 'validated'
      WHERE tier = 'gold' AND retired = 0
        AND times_served >= 50
        AND (CAST(times_flagged AS REAL) / MAX(times_served, 1)) >= 0.10
    `).run()

    return {
      promoted: promoted.meta?.changes || 0,
      golded: golded.meta?.changes || 0,
      retired: retired.meta?.changes || 0,
      demoted: demoted.meta?.changes || 0,
      timestamp: new Date().toISOString()
    }
  } catch (e) {
    return { error: e.message }
  }
}

// GET /scenario-pool/quality-audit — join generation grades with player feedback to find mismatches
async function handlePoolQualityAudit(request, env, cors) {
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)
  try {
    const url = new URL(request.url)
    const position = url.searchParams.get("position")

    let query = `
      SELECT p.id, p.position, p.concept_tag as concept, p.quality_score as pool_quality,
             p.generation_grade,
             p.times_served as served_count, p.times_correct as correct_count, p.times_flagged as flagged_count,
             CASE WHEN p.times_served > 0
               THEN ROUND(100.0 * p.times_flagged / p.times_served, 1)
               ELSE 0 END as flag_rate,
             CASE WHEN p.times_served > 0
               THEN ROUND(100.0 * p.times_correct / p.times_served, 1)
               ELSE 0 END as accuracy_rate,
             g.quality_score as generation_grade_reported
      FROM scenario_pool p
      LEFT JOIN scenario_grades g ON p.id = g.scenario_id
      WHERE p.retired = 0 AND p.times_served >= 5`
    const params = []

    if (position) {
      query += ` AND p.position = ?`
      params.push(position)
    }

    query += ` ORDER BY flag_rate DESC LIMIT 50`

    const results = await db.prepare(query).bind(...params).all()
    const rows = results.results || []

    // Use whichever grade source is available: pool's generation_grade or grades table
    const enriched = rows.map(r => ({
      ...r,
      best_grade: r.generation_grade || r.generation_grade_reported || r.pool_quality || 0
    }))

    // Mismatches: high generation score + high flag rate = prompt/grading problem
    const mismatches = enriched.filter(r =>
      r.best_grade > 7 && r.flag_rate > 10
    )

    // Retire candidates: persistently flagged or never answered correctly
    const retireCandidates = enriched.filter(r => r.flag_rate > 15 || r.accuracy_rate < 20)

    return jsonResponse({
      all: enriched,
      mismatches,
      retireCandidates,
      total: enriched.length,
      queriedAt: new Date().toISOString()
    }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
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

// GET /knowledge-base/coverage — coverage matrix of validated scenarios by position/concept/difficulty
async function handleKBCoverage(request, env, cors) {
  const db = env.DB
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors)
  try {
    const poolCoverage = await db.prepare(`
      SELECT position, concept_tag as concept, difficulty,
             COUNT(*) as pool_count,
             ROUND(AVG(quality_score), 2) as avg_quality,
             SUM(CASE WHEN times_served >= 50 AND quality_score >= 8.0
                  AND (CAST(times_flagged AS REAL) / MAX(times_served, 1)) < 0.15
                  THEN 1 ELSE 0 END) as gold_count,
             SUM(CASE WHEN times_served >= 5
                  AND (CAST(times_flagged AS REAL) / MAX(times_served, 1)) < 0.15
                  THEN 1 ELSE 0 END) as validated_count,
             MAX(created_at) as last_generated
      FROM scenario_pool
      WHERE retired = 0
      GROUP BY position, concept_tag, difficulty
      ORDER BY position, concept_tag, difficulty
    `).all()

    const rows = poolCoverage.results || []

    const positions = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase",
                       "leftField","centerField","rightField","batter","baserunner","manager"]
    const difficulties = [1, 2, 3]
    const concepts = [...new Set(rows.map(r => r.concept).filter(Boolean))]

    const totalCells = positions.length * concepts.length * difficulties.length
    const coveredCells = rows.filter(r => r.pool_count > 0).length
    const goldCells = rows.filter(r => r.gold_count > 0).length

    return jsonResponse({
      coverage: rows,
      summary: {
        totalPossibleCells: totalCells,
        coveredCells,
        goldCells,
        coveragePercent: totalCells > 0 ? Math.round(100 * coveredCells / totalCells) : 0,
        goldPercent: totalCells > 0 ? Math.round(100 * goldCells / totalCells) : 0,
        positions: positions.length,
        uniqueConcepts: concepts.length,
        difficulties: difficulties.length
      },
      queriedAt: new Date().toISOString()
    }, 200, cors)
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors)
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

// GET /analytics/ab-results — analyze A/B test results with winner detection
async function handleABAnalysis(request, env, cors) {
  const db = env.DB;
  if (!db) return jsonResponse({ error: "No database configured" }, 500, cors);
  try {
    const url = new URL(request.url);
    const testId = url.searchParams.get("test_id");
    const days = parseInt(url.searchParams.get("days") || "30");
    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    const query = testId
      ? `SELECT test_id, variant_id, metric,
              COUNT(*) as sample_size,
              ROUND(AVG(value), 4) as avg_value,
              ROUND(SUM(value), 2) as total_value,
              MIN(timestamp) as first_seen,
              MAX(timestamp) as last_seen
         FROM ab_results
         WHERE timestamp > ? AND test_id = ?
         GROUP BY test_id, variant_id, metric
         ORDER BY test_id, metric, avg_value DESC`
      : `SELECT test_id, variant_id, metric,
              COUNT(*) as sample_size,
              ROUND(AVG(value), 4) as avg_value,
              ROUND(SUM(value), 2) as total_value,
              MIN(timestamp) as first_seen,
              MAX(timestamp) as last_seen
         FROM ab_results
         WHERE timestamp > ?
         GROUP BY test_id, variant_id, metric
         ORDER BY test_id, metric, avg_value DESC`;

    const results = testId
      ? await db.prepare(query).bind(since, testId).all()
      : await db.prepare(query).bind(since).all();

    const tests = {};
    for (const row of (results.results || [])) {
      if (!tests[row.test_id]) tests[row.test_id] = { metrics: {} };
      if (!tests[row.test_id].metrics[row.metric]) tests[row.test_id].metrics[row.metric] = [];
      tests[row.test_id].metrics[row.metric].push(row);
    }

    const analysis = Object.entries(tests).map(([tid, data]) => {
      const metricAnalysis = Object.entries(data.metrics).map(([metric, variants]) => {
        const sorted = variants.sort((a, b) => b.avg_value - a.avg_value);
        const winner = sorted[0];
        const runnerUp = sorted[1];
        const totalSamples = variants.reduce((s, v) => s + v.sample_size, 0);
        const isSignificant = variants.every(v => v.sample_size >= 50);
        return {
          metric,
          winner: winner?.variant_id,
          winnerAvg: winner?.avg_value,
          runnerUpAvg: runnerUp?.avg_value,
          lift: runnerUp ? ((winner.avg_value - runnerUp.avg_value) / Math.max(runnerUp.avg_value, 0.001) * 100).toFixed(1) + "%" : "N/A",
          totalSamples,
          isSignificant,
          variants
        };
      });
      return { testId: tid, metrics: metricAnalysis };
    });

    return jsonResponse({ analysis, queriedAt: new Date().toISOString(), dayRange: days }, 200, cors);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500, cors);
  }
}

// --- Scenario Evolution: refresh stale Gold scenarios with accuracy drift ---
// POST /admin/evolve-scenarios — find Gold scenarios that are too easy (>95%) or too hard (<25%) and generate variants
async function handleEvolveScenarios(env, options = {}) {
  const db = env.DB
  if (!db) return { error: "No database configured" }
  if (!env.XAI_API_KEY) return { error: "XAI_API_KEY not configured" }

  const maxEvolve = Math.min(options.limit || 5, 10)

  // Find Gold scenarios with accuracy drift (times_served >= 30, correct_rate drifted)
  let candidates
  try {
    candidates = await db.prepare(`
      SELECT id, position, concept_tag, difficulty, scenario_json, quality_score,
             times_served, times_correct,
             ROUND(100.0 * CAST(times_correct AS REAL) / MAX(times_served, 1), 1) as accuracy
      FROM scenario_pool
      WHERE tier = 'gold' AND retired = 0 AND times_served >= 30
        AND (
          (CAST(times_correct AS REAL) / MAX(times_served, 1)) > 0.95
          OR (CAST(times_correct AS REAL) / MAX(times_served, 1)) < 0.25
        )
      ORDER BY times_served DESC
      LIMIT ?
    `).bind(maxEvolve * 2).all()
  } catch (e) {
    return { error: "Query failed: " + e.message }
  }

  const results = []
  for (const candidate of (candidates.results || []).slice(0, maxEvolve)) {
    let original
    try { original = JSON.parse(candidate.scenario_json) } catch { results.push({ id: candidate.id, status: "bad_json" }); continue }

    const isTooEasy = candidate.accuracy > 95
    const posLabel = candidate.position.replace(/([A-Z])/g, ' $1').trim().toLowerCase()
    const newDiff = isTooEasy ? Math.min((candidate.difficulty || 2) + 1, 3) : Math.max((candidate.difficulty || 2) - 1, 1)

    const userPrompt = `You are evolving an existing baseball scenario. The original scenario for ${posLabel} about "${candidate.concept_tag || original.conceptTag || original.concept || ''}" has become ${isTooEasy ? 'too easy (95%+ accuracy)' : 'too hard (<25% accuracy)'}.

ORIGINAL SCENARIO:
Title: ${original.title || ''}
Description: ${original.description || ''}
Situation: Inning ${original.situation?.inning || '?'}, ${original.situation?.outs ?? '?'} outs, runners on ${(original.situation?.runners || []).join(', ') || 'none'}, score ${(original.situation?.score || [0,0]).join('-')}
Options: ${(original.options || []).map((o, i) => `${i}: ${o}`).join(' | ')}
Best: ${original.best ?? '?'}

CREATE A VARIANT that keeps the same core concept but ${isTooEasy
  ? 'adds a realistic complication or edge case that requires deeper strategic thinking. Change the game situation (different inning, different score, different runners) to create a scenario where the obvious answer is actually wrong.'
  : 'simplifies the decision. Make the correct answer more discoverable. Use a game situation where the strategic reasoning is clearer. Provide an especially instructive explanation.'
}

RULES:
- Change at least TWO of: inning, score differential, runner configuration, out count.
- Keep the same position (${posLabel}) and core concept.
- All 4 options must be actions ONLY this position performs.
- The best option must have the highest rate (>=70). Include one yellow option (45-65).
- score=[HOME,AWAY]. If inning starts with "Bot", offensive team is HOME (score[0]).

Return ONLY valid JSON: {"title":"...","diff":${newDiff},"description":"...","situation":{"inning":"...","outs":0,"count":"1-1","runners":[],"score":[0,0]},"options":["A","B","C","D"],"best":0,"explanations":["...","...","...","..."],"rates":[85,55,25,15],"concept":"...","conceptTag":"...","anim":"freeze"}`

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 55000)

      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.XAI_API_KEY}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: "grok-4", max_tokens: 2500, temperature: 0.5,
          messages: [
            { role: "system", content: `You are the world's most experienced baseball coach, teaching kids ages 6-18 via Baseball Strategy Master. OUTPUT: Respond with ONLY valid JSON — no markdown, no explanation. GOLDEN RULE: Every scenario teaches ONE clear baseball concept. EXPLANATION RULES: 2-4 sentences each. BEST explanation: the action + WHY it's correct + the positive result. WRONG explanations: the action + WHY it fails + consequences. OPTION RULES: All 4 options happen at the SAME decision moment. Each must be specific, concrete, and strategically distinct. POSITION BOUNDARIES: Only actions the ${posLabel} actually performs.` },
            { role: "user", content: userPrompt }
          ]
        })
      })
      clearTimeout(timeout)

      if (!response.ok) { results.push({ id: candidate.id, status: "api_error", code: response.status }); continue }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ""
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      let variant
      try { variant = JSON.parse(cleaned) } catch (pe) { results.push({ id: candidate.id, status: "parse_error", error: pe.message }); continue }

      // Structural validation
      const issues = []
      if (!variant.title) issues.push("missing title")
      if (!Array.isArray(variant.options) || variant.options.length !== 4) issues.push("need 4 options")
      if (typeof variant.best !== "number" || variant.best < 0 || variant.best > 3) issues.push("invalid best")
      if (!Array.isArray(variant.explanations) || variant.explanations.length !== 4) issues.push("need 4 explanations")
      if (!Array.isArray(variant.rates) || variant.rates.length !== 4) issues.push("need 4 rates")
      if (variant.rates && variant.rates[variant.best] < 70) issues.push("best rate < 70")
      if (!variant.description) issues.push("missing description")
      if (!variant.situation) issues.push("missing situation")

      if (issues.length > 0) { results.push({ id: candidate.id, status: "validation_failed", issues }); continue }

      // Generate pool ID
      const hashInput = `evolved:${candidate.id}:${variant.title}:${(variant.options || []).join("|")}`
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(hashInput))
      const newId = "evolved_" + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16)

      // Check duplicate
      const dup = await db.prepare("SELECT id FROM scenario_pool WHERE id = ?").bind(newId).first()
      if (dup) { results.push({ id: candidate.id, status: "duplicate", newId }); continue }

      const conceptTag = variant.conceptTag || candidate.concept_tag || ""

      await db.prepare(`
        INSERT INTO scenario_pool (id, position, difficulty, concept, concept_tag, title, scenario_json, quality_score, audit_score, source, contributed_by, created_at, evolved_from)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'evolved', 'cron', ?, ?)
      `).bind(
        newId, candidate.position, variant.diff || newDiff,
        variant.concept || "", conceptTag,
        variant.title, JSON.stringify(variant),
        7.0, Date.now(), candidate.id
      ).run()

      results.push({
        id: candidate.id, status: "evolved", newId,
        reason: isTooEasy ? "too_easy" : "too_hard",
        oldAccuracy: candidate.accuracy, newDiff,
        title: variant.title
      })
      console.log(`[BSM Evolve] ${isTooEasy ? "Harder" : "Easier"} variant of "${original.title}" → "${variant.title}" (${candidate.position}, ${candidate.accuracy}% accuracy)`)

    } catch (e) {
      results.push({ id: candidate.id, status: "fetch_error", error: e.message })
    }
  }

  const summary = {
    evolved: results.filter(r => r.status === "evolved").length,
    failed: results.filter(r => r.status !== "evolved").length,
    results,
    timestamp: new Date().toISOString()
  }
  console.log(`[BSM Evolve] Complete: ${summary.evolved} evolved, ${summary.failed} failed`)
  return summary
}

// --- Level 2.1: Weekly Cron Trigger for AI Quality Aggregation ---
// Runs every Monday at 6am UTC. Creates weekly_ai_report entries in D1.
// Identifies: degraded concepts (<40% correct), too-easy concepts (>90%), high flag-rate positions (>5%).

// POST /admin/batch-generate — generate scenarios for coverage gaps (admin or cron)
async function handleBatchGenerate(env, options = {}) {
  const db = env.DB
  if (!db) return { error: "No database configured" }
  if (!env.XAI_API_KEY) return { error: "XAI_API_KEY not configured" }

  const batchSize = Math.min(options.count || 10, 25)
  const targetPosition = options.position || null

  const positions = targetPosition ? [targetPosition] :
    ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase",
     "leftField","centerField","rightField","batter","baserunner","manager"]

  // Find positions with lowest pool counts
  const poolCounts = await db.prepare(`
    SELECT position, COUNT(*) as count
    FROM scenario_pool WHERE retired = 0
    GROUP BY position
  `).all()

  const countMap = {}
  for (const r of (poolCounts.results || [])) countMap[r.position] = r.count

  // Sort positions by lowest coverage first
  const sortedPositions = [...positions].sort((a, b) => (countMap[a] || 0) - (countMap[b] || 0))

  const results = []

  for (let i = 0; i < batchSize; i++) {
    const position = sortedPositions[i % sortedPositions.length]
    const diffTarget = (i % 3) + 1
    const posLabel = position.replace(/([A-Z])/g, ' $1').trim().toLowerCase()

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000)

      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.XAI_API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "grok-4",
          max_tokens: 2500,
          temperature: 0.5,
          messages: [
            { role: "system", content: `You are the world's most experienced baseball coach, teaching kids ages 6-18 via Baseball Strategy Master. OUTPUT: Respond with ONLY valid JSON — no markdown, no explanation. GOLDEN RULE: Every scenario teaches ONE clear baseball concept. EXPLANATION RULES: 2-4 sentences each. BEST explanation: the action + WHY it's correct + the positive result. WRONG explanations: the action + WHY it fails + consequences. Use player perspective ("you"). OPTION RULES: All 4 options happen at the SAME decision moment. Each must be specific, concrete, and strategically distinct. Include one common mistake kids make. POSITION BOUNDARIES: Only actions the ${posLabel} actually performs. score=[HOME,AWAY]. outs: 0-2. count: "B-S" or "-". runners array must match description.` },
            { role: "user", content: `Create a baseball strategy scenario for position: ${position}, difficulty ${diffTarget}/3.
THE QUESTION: "What should the ${posLabel} do?"
All 4 options must be actions ONLY this position makes.
Return ONLY valid JSON: {"title":"Short Title","diff":${diffTarget},"description":"2-3 sentence scenario","situation":{"inning":"Bot 5","outs":1,"count":"1-1","runners":[],"score":[2,3]},"options":["A","B","C","D"],"best":0,"explanations":["Why A","Why B","Why C","Why D"],"rates":[85,55,25,15],"concept":"One-sentence lesson","conceptTag":"concept-tag","anim":"freeze"}
The best option must have the highest rate (>=70). Include one yellow option (45-65). conceptTag should be a kebab-case tag like "steal-window" or "cutoff-alignment".` }
          ]
        })
      })
      clearTimeout(timeout)

      if (!response.ok) {
        results.push({ position, diff: diffTarget, status: "api_error", code: response.status })
        continue
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ""

      // Parse and validate
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      let scenario
      try {
        scenario = JSON.parse(cleaned)
      } catch (parseErr) {
        results.push({ position, diff: diffTarget, status: "parse_error", error: parseErr.message })
        continue
      }

      // Structural validation
      const issues = []
      if (!scenario.title) issues.push("missing title")
      if (!Array.isArray(scenario.options) || scenario.options.length !== 4) issues.push("need 4 options")
      if (typeof scenario.best !== "number" || scenario.best < 0 || scenario.best > 3) issues.push("invalid best")
      if (!Array.isArray(scenario.explanations) || scenario.explanations.length !== 4) issues.push("need 4 explanations")
      if (!Array.isArray(scenario.rates) || scenario.rates.length !== 4) issues.push("need 4 rates")
      if (scenario.rates && scenario.rates[scenario.best] < 70) issues.push("best rate < 70")
      if (!scenario.description) issues.push("missing description")
      if (!scenario.situation) issues.push("missing situation")

      if (issues.length > 0) {
        results.push({ position, diff: diffTarget, status: "validation_failed", title: scenario.title || "?", issues })
        continue
      }

      // Generate pool ID via content hash
      const hashInput = `${position}:${scenario.title}:${scenario.concept || ""}:${(scenario.options || []).join("|")}`
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(hashInput))
      const poolId = "batch_" + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16)

      // Check for duplicate
      const existing = await db.prepare("SELECT id FROM scenario_pool WHERE id = ?").bind(poolId).first()
      if (existing) {
        results.push({ position, diff: diffTarget, status: "duplicate", title: scenario.title, id: poolId })
        continue
      }

      // Clean and insert
      const cleanScenario = {
        title: scenario.title, diff: scenario.diff || diffTarget, description: scenario.description,
        situation: scenario.situation, options: scenario.options, best: scenario.best,
        explanations: scenario.explanations, rates: scenario.rates,
        concept: scenario.concept || "", conceptTag: scenario.conceptTag || extractConceptTag(scenario.concept || ""),
        anim: scenario.anim || "freeze"
      }

      const batchSignature = computeScenarioSignature(scenario, position)

      // Semantic dedup for batch: skip if gold/validated with same signature exists
      if (batchSignature) {
        try {
          const sigMatch = await db.prepare(`
            SELECT id FROM scenario_pool
            WHERE scenario_signature = ? AND retired = 0 AND tier IN ('gold', 'validated')
            LIMIT 1
          `).bind(batchSignature).first()
          if (sigMatch) {
            results.push({ position, diff: diffTarget, status: "duplicate_signature", title: scenario.title, matchedId: sigMatch.id })
            continue
          }
        } catch { /* non-blocking */ }
      }

      await db.prepare(`
        INSERT INTO scenario_pool (id, position, difficulty, concept, concept_tag, title, scenario_json, quality_score, audit_score, source, contributed_by, created_at, scenario_signature)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'batch', 'cron', ?, ?)
      `).bind(
        poolId, position, cleanScenario.diff,
        cleanScenario.concept, cleanScenario.conceptTag,
        cleanScenario.title, JSON.stringify(cleanScenario),
        7.0, Date.now(), batchSignature || ""
      ).run()

      results.push({ position, diff: diffTarget, status: "success", title: scenario.title, concept: cleanScenario.conceptTag || cleanScenario.concept, id: poolId })
      console.log(`[BSM Batch] Generated: "${scenario.title}" (${position}, diff ${diffTarget})`)

    } catch (fetchErr) {
      results.push({ position, diff: (i % 3) + 1, status: "fetch_error", error: fetchErr.message })
    }
  }

  const summary = {
    generated: results.filter(r => r.status === "success").length,
    failed: results.filter(r => r.status !== "success").length,
    duplicates: results.filter(r => r.status === "duplicate").length,
    results,
    timestamp: new Date().toISOString()
  }
  console.log(`[BSM Batch] Complete: ${summary.generated} generated, ${summary.failed} failed, ${summary.duplicates} duplicates`)
  return summary
}

async function handleScheduled(event, env) {
  const now = Date.now()
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000
  const isMonday = new Date(now).getUTCDay() === 1

  // Weekly report + prompt patches only run on Mondays
  if (!isMonday) {
    console.log("[BSM Cron] Skipping weekly report/patches (not Monday). Running batch generation only.")
  }

  if (isMonday) {
  try {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000
    const positions = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField","batter","baserunner","manager"]

    // ===== Section 1: Aggregate metrics from past 7 days =====

    // 1a. Generation success rate from analytics_events
    let genSuccessRate = 0, genTotal = 0, genSuccess = 0
    try {
      const genAttempts = await env.DB.prepare(`
        SELECT event_type, COUNT(*) as count FROM analytics_events
        WHERE event_type IN ('ai_scenario_generated', 'ai_scenario_failed', 'ai_scenario_timeout', 'ai_scenario_fallback')
        AND created_at > ?
        GROUP BY event_type
      `).bind(weekAgo).all()
      const genMap = {}
      for (const r of (genAttempts.results || [])) genMap[r.event_type] = r.count
      genSuccess = genMap["ai_scenario_generated"] || 0
      genTotal = genSuccess + (genMap["ai_scenario_failed"] || 0) + (genMap["ai_scenario_timeout"] || 0) + (genMap["ai_scenario_fallback"] || 0)
      genSuccessRate = genTotal > 0 ? Math.round(100 * genSuccess / genTotal) : 0
    } catch {}

    // 1b. Average quality score from scenario_grades
    let avgQualityScore = 0, totalGraded = 0
    try {
      const qualRes = await env.DB.prepare(`
        SELECT ROUND(AVG(quality_score), 2) as avg_score, COUNT(*) as count
        FROM scenario_grades WHERE created_at > ?
      `).bind(weekAgo).first()
      if (qualRes) { avgQualityScore = qualRes.avg_score || 0; totalGraded = qualRes.count || 0 }
    } catch {}

    // 1c. Flag rate by position from scenario_feedback
    let flagsByPosition = []
    try {
      const fbRes = await env.DB.prepare(`
        SELECT position, flag_category, COUNT(*) as count
        FROM scenario_feedback WHERE created_at > ?
        GROUP BY position, flag_category
        ORDER BY count DESC
      `).bind(weekAgo).all()
      // Aggregate by position
      const posMap = {}
      for (const r of (fbRes.results || [])) {
        if (!posMap[r.position]) posMap[r.position] = { position: r.position, total_flags: 0, categories: {} }
        posMap[r.position].total_flags += r.count
        posMap[r.position].categories[r.flag_category] = r.count
      }
      flagsByPosition = Object.values(posMap).sort((a, b) => b.total_flags - a.total_flags)
    } catch {}

    // 1d. A/B test results summary from ab_results
    let abSummary = []
    try {
      const abRes = await env.DB.prepare(`
        SELECT test_id, variant_id, metric,
          COUNT(*) as samples,
          ROUND(AVG(value), 3) as avg_value
        FROM ab_results WHERE timestamp > ?
        GROUP BY test_id, variant_id, metric
        ORDER BY test_id, variant_id
      `).bind(weekAgo).all()
      abSummary = abRes.results || []
    } catch {}

    // 1e. Knowledge base coverage delta — new Gold scenarios this week
    let newGoldCount = 0, totalGold = 0, totalPool = 0
    try {
      const goldDelta = await env.DB.prepare(`
        SELECT COUNT(*) as new_gold FROM scenario_pool
        WHERE tier = 'gold' AND created_at > ?
      `).bind(weekAgo).first()
      newGoldCount = goldDelta?.new_gold || 0
      const poolStats = await env.DB.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN tier = 'gold' THEN 1 ELSE 0 END) as gold,
          SUM(CASE WHEN tier = 'validated' THEN 1 ELSE 0 END) as validated,
          SUM(CASE WHEN tier = 'new' THEN 1 ELSE 0 END) as new_tier,
          SUM(CASE WHEN retired = 1 THEN 1 ELSE 0 END) as retired
        FROM scenario_pool
      `).first()
      totalGold = poolStats?.gold || 0
      totalPool = poolStats?.total || 0
    } catch {}

    // 1f. Difficulty data (existing — concept-level correct rates)
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

    // 1g. AI vs HC quality comparison
    const aiQuality = await env.DB.prepare(`
      SELECT source, COUNT(*) as count, ROUND(AVG(quality_score), 1) as avg_score
      FROM scenario_grades
      WHERE created_at > ?
      GROUP BY source
    `).bind(weekAgo).all()

    // 1h. Error trends
    const errorTrend = await env.DB.prepare(`
      SELECT error_type, COUNT(*) as count
      FROM error_logs
      WHERE error_type LIKE 'ai_%' AND created_at > ?
      GROUP BY error_type
      ORDER BY count DESC
    `).bind(weekAgo).all()

    // ===== Section 2: Identify top 5 worst position/concept combos =====
    // Combine flag data from scenario_feedback with quality scores from scenario_grades
    let worstCombos = []
    try {
      // Get flag rates by position/concept from scenario_feedback
      const comboFlags = await env.DB.prepare(`
        SELECT sf.position, COALESCE(json_extract(sf.scenario_json, '$.conceptTag'), 'unknown') as concept,
          COUNT(*) as flag_count
        FROM scenario_feedback sf
        WHERE sf.created_at > ?
        GROUP BY sf.position, concept
        ORDER BY flag_count DESC
      `).bind(weekAgo).all()

      // Get quality scores by position from scenario_grades
      const comboQuality = await env.DB.prepare(`
        SELECT position, ROUND(AVG(quality_score), 2) as avg_quality, COUNT(*) as graded_count
        FROM scenario_grades
        WHERE created_at > ?
        GROUP BY position
      `).bind(weekAgo).all()
      const qualityMap = {}
      for (const r of (comboQuality.results || [])) qualityMap[r.position] = r

      // Get total attempts by position from scenario_difficulty for rate calculation
      const comboAttempts = await env.DB.prepare(`
        SELECT position, COUNT(*) as total_attempts
        FROM scenario_difficulty
        WHERE created_at > ?
        GROUP BY position
      `).bind(weekAgo).all()
      const attemptMap = {}
      for (const r of (comboAttempts.results || [])) attemptMap[r.position] = r.total_attempts

      // Score each combo: higher = worse (high flag rate + low quality)
      for (const r of (comboFlags.results || [])) {
        const totalAttempts = attemptMap[r.position] || 1
        const flagRate = Math.round(100 * r.flag_count / totalAttempts)
        const avgQual = qualityMap[r.position]?.avg_quality || 5.0
        // Composite badness score: flag rate weight + inverse quality weight
        const badnessScore = flagRate * 2 + (10 - avgQual) * 10
        worstCombos.push({
          position: r.position,
          concept: r.concept,
          flag_count: r.flag_count,
          flag_rate_pct: flagRate,
          avg_quality: avgQual,
          sample_size: totalAttempts,
          badness_score: Math.round(badnessScore * 10) / 10
        })
      }
      worstCombos.sort((a, b) => b.badness_score - a.badness_score)
      worstCombos = worstCombos.slice(0, 5)
    } catch (e) {
      console.error("[BSM Cron] Worst combos analysis failed:", e.message)
    }

    // ===== Section 3: Auto-generate prompt patches for top 3 worst combos =====
    let patchesGenerated = 0
    try {
      // Get the top feedback categories per position for richer patch text
      const feedbackDetail = await env.DB.prepare(`
        SELECT position, flag_category, COUNT(*) as count
        FROM scenario_feedback WHERE created_at > ?
        GROUP BY position, flag_category
        ORDER BY position, count DESC
      `).bind(weekAgo).all()
      const feedbackByPos = {}
      for (const r of (feedbackDetail.results || [])) {
        if (!feedbackByPos[r.position]) feedbackByPos[r.position] = []
        feedbackByPos[r.position].push(`${r.flag_category} (${r.count}x)`)
      }

      for (const combo of worstCombos.slice(0, 3)) {
        const topFeedback = (feedbackByPos[combo.position] || []).slice(0, 3).join(", ") || "mixed issues"
        const patchText = `QUALITY ALERT for ${combo.position}/${combo.concept}: ${combo.flag_rate_pct}% flag rate, ${combo.avg_quality} avg quality over ${combo.sample_size} scenarios in the past week. Common issues: ${topFeedback}. REQUIREMENT: Double-check that all options are realistic for this position, explanations reference the specific game situation, and the correct answer has clear strategic reasoning.`
        const triggerType = `weekly_auto_${combo.concept}`

        // Check if similar patch already exists
        const existing = await env.DB.prepare(`
          SELECT id, confidence FROM prompt_patches
          WHERE position = ? AND trigger_type = ? AND active = 1
        `).bind(combo.position, triggerType).first()

        if (existing) {
          const newConf = Math.min(1.0, (existing.confidence || 0.5) + 0.15)
          await env.DB.prepare(`
            UPDATE prompt_patches SET confidence = ?, patch_text = ?, updated_at = ?, expires_at = ?
            WHERE id = ?
          `).bind(newConf, patchText, now, now + thirtyDays, existing.id).run()
        } else {
          const activeCount = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM prompt_patches WHERE position = ? AND active = 1"
          ).bind(combo.position).first()
          if ((activeCount?.count || 0) < 8) {
            await env.DB.prepare(`
              INSERT INTO prompt_patches (position, patch_text, trigger_type, confidence, expires_at, active, created_at, updated_at)
              VALUES (?, ?, ?, 0.8, ?, 1, ?, ?)
            `).bind(combo.position, patchText, triggerType, now + thirtyDays, now, now).run()
          }
        }
        patchesGenerated++
      }
    } catch (e) {
      console.error("[BSM Cron] Auto-patch generation failed:", e.message)
    }

    // ===== Section 4: Store the full report =====
    const report = {
      version: 2,
      period: { start: weekAgo, end: now, start_iso: new Date(weekAgo).toISOString(), end_iso: new Date(now).toISOString() },
      generation: { success_rate_pct: genSuccessRate, total_attempts: genTotal, successful: genSuccess },
      quality: { avg_score: avgQualityScore, total_graded: totalGraded, ai_vs_hc: aiQuality.results || [] },
      flags: { by_position: flagsByPosition, total: flagsByPosition.reduce((s, p) => s + p.total_flags, 0) },
      ab_testing: abSummary,
      knowledge_base: { new_gold_this_week: newGoldCount, total_gold: totalGold, total_pool: totalPool },
      concepts: {
        total_tracked: allConcepts.length,
        too_hard: tooHard.map(r => ({ concept: r.concept, position: r.position, rate: r.correct_rate, attempts: r.attempts })),
        too_easy: tooEasy.map(r => ({ concept: r.concept, position: r.position, rate: r.correct_rate, attempts: r.attempts }))
      },
      worst_combos: worstCombos,
      patches_generated: patchesGenerated,
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

    console.log(`[BSM Cron] Weekly report v2: gen ${genSuccessRate}% success (${genTotal} attempts), avg quality ${avgQualityScore}, ${flagsByPosition.length} positions with flags, ${worstCombos.length} worst combos, ${patchesGenerated} patches generated, ${newGoldCount} new gold scenarios`)

  } catch (e) {
    console.error("[BSM Cron] Weekly aggregation failed:", e.message)
  }

  // --- Phase D: Generate prompt patches from feedback-triggered data (weekly) ---
  try {
    const patchWeekAgo = now - 7 * 24 * 60 * 60 * 1000
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    for (const pos of positions) {
      // Check feedback patterns for this position
      let feedbackPatterns = []
      try {
        const fbRes = await env.DB.prepare(`
          SELECT flag_category, COUNT(*) as count
          FROM scenario_feedback WHERE position = ? AND created_at > ?
          GROUP BY flag_category ORDER BY count DESC
        `).bind(pos, patchWeekAgo).all()
        feedbackPatterns = fbRes.results || []
      } catch {}

      // Check audit scores for this position
      let avgAuditScore = null
      try {
        const auditRes = await env.DB.prepare(`
          SELECT ROUND(AVG(score), 1) as avg_score, COUNT(*) as count
          FROM ai_audits WHERE position = ? AND created_at > ?
        `).bind(pos, patchWeekAgo).first()
        if (auditRes && auditRes.count >= 3) avgAuditScore = auditRes.avg_score
      } catch {}

      // Check AI error rates
      let errorCounts = {}
      try {
        const errRes = await env.DB.prepare(`
          SELECT error_type, COUNT(*) as count FROM error_logs
          WHERE error_type LIKE 'ai_%' AND error_context LIKE ? AND created_at > ?
          GROUP BY error_type
        `).bind(`%${pos}%`, patchWeekAgo).all()
        for (const r of (errRes.results || [])) errorCounts[r.error_type] = r.count
      } catch {}

      const newPatches = []

      // Trigger: 5+ wrong_answer flags
      const wrongAnswerFlags = feedbackPatterns.find(p => p.flag_category === "wrong_answer")
      if (wrongAnswerFlags && wrongAnswerFlags.count >= 5) {
        newPatches.push({
          text: `QUALITY ALERT (${pos}): Recent ${pos} scenarios had ${wrongAnswerFlags.count} "wrong best answer" flags. Double-check that the best answer is what a real coach would teach. Verify the explanation for the best answer specifically argues FOR that option.`,
          trigger: "wrong_answer_flags"
        })
      }

      // Trigger: 5+ unrealistic flags
      const unrealisticFlags = feedbackPatterns.find(p => p.flag_category === "unrealistic")
      if (unrealisticFlags && unrealisticFlags.count >= 5) {
        newPatches.push({
          text: `REALISM ALERT (${pos}): ${unrealisticFlags.count} players flagged recent ${pos} scenarios as unrealistic. Make sure the game situation would actually happen. Use common counts, realistic scores, and real in-game decisions.`,
          trigger: "unrealistic_flags"
        })
      }

      // Trigger: 5+ wrong_position flags
      const wrongPosFlags = feedbackPatterns.find(p => p.flag_category === "wrong_position")
      if (wrongPosFlags && wrongPosFlags.count >= 5) {
        newPatches.push({
          text: `ROLE ALERT (${pos}): ${wrongPosFlags.count} players said recent ${pos} scenarios asked them to do another position's job. Every option must be an action THIS position performs.`,
          trigger: "wrong_position_flags"
        })
      }

      // Trigger: Low audit score
      if (avgAuditScore !== null && avgAuditScore < 3.5) {
        newPatches.push({
          text: `AUTHENTICITY ALERT (${pos}): Recent ${pos} scenarios scored ${avgAuditScore}/5 on baseball authenticity. Make the situation feel like a real game — use coaching language, realistic timing, and decisions that matter.`,
          trigger: "low_audit_score"
        })
      }

      // Trigger: High role-violation error rate
      if ((errorCounts["ai_role-violation"] || 0) >= 5) {
        newPatches.push({
          text: `BOUNDARY ALERT (${pos}): ${errorCounts["ai_role-violation"]} recent role violations. Strictly limit options to actions this position performs. Review the POSITION-ACTION BOUNDARIES section.`,
          trigger: "role_violation_spike"
        })
      }

      // Apply patches: update existing or create new
      for (const patch of newPatches.slice(0, 5)) {
        try {
          const existing = await env.DB.prepare(`
            SELECT id, confidence FROM prompt_patches
            WHERE position = ? AND trigger_type = ? AND active = 1
          `).bind(pos, patch.trigger).first()

          if (existing) {
            const newConf = Math.min(1.0, (existing.confidence || 0.5) + 0.1)
            await env.DB.prepare(`
              UPDATE prompt_patches SET confidence = ?, patch_text = ?, updated_at = ?, expires_at = ?
              WHERE id = ?
            `).bind(newConf, patch.text, now, now + thirtyDaysMs, existing.id).run()
          } else {
            const activeCount = await env.DB.prepare(
              "SELECT COUNT(*) as count FROM prompt_patches WHERE position = ? AND active = 1"
            ).bind(pos).first()
            if ((activeCount?.count || 0) < 8) {
              await env.DB.prepare(`
                INSERT INTO prompt_patches (position, patch_text, trigger_type, confidence, expires_at, active, created_at, updated_at)
                VALUES (?, ?, ?, 0.5, ?, 1, ?, ?)
              `).bind(pos, patch.text, patch.trigger, now + thirtyDaysMs, now, now).run()
            }
          }
        } catch {}
      }

      // Decay patches that no longer have active triggers
      try {
        const activePatches = await env.DB.prepare(`
          SELECT id, trigger_type, confidence FROM prompt_patches
          WHERE position = ? AND active = 1
        `).bind(pos).all()
        const activeTriggers = new Set(newPatches.map(p => p.trigger))
        for (const p of (activePatches.results || [])) {
          if (!activeTriggers.has(p.trigger_type) && !p.trigger_type.startsWith("weekly_auto_")) {
            const newConf = Math.max(0, (p.confidence || 0.5) - 0.15)
            if (newConf < 0.2) {
              await env.DB.prepare("UPDATE prompt_patches SET active = 0, updated_at = ? WHERE id = ?").bind(now, p.id).run()
            } else {
              await env.DB.prepare("UPDATE prompt_patches SET confidence = ?, updated_at = ? WHERE id = ?").bind(newConf, now, p.id).run()
            }
          }
        }
      } catch {}
    }
    console.log("[BSM Cron] Prompt patch generation complete")
  } catch (e) {
    console.error("[BSM Cron] Prompt patch generation failed:", e.message)
  }
  } // end isMonday

  // --- Phase E: Batch scenario generation to fill coverage gaps (daily) ---
  try {
    const batchResult = await handleBatchGenerate(env, { count: 6 })
    console.log(`[BSM Cron] Batch generation: ${batchResult.generated || 0} new scenarios, ${batchResult.failed || 0} failed`)
  } catch (e) {
    console.error("[BSM Cron] Batch generation failed:", e.message)
  }

  // --- Phase F: Pool tier promotion/demotion (daily) ---
  try {
    const promoResult = await handlePoolPromotion(env)
    console.log(`[BSM Cron] Pool promotion: ${promoResult.promoted || 0} promoted, ${promoResult.golded || 0} golded, ${promoResult.demoted || 0} demoted, ${promoResult.retired || 0} retired`)
  } catch (e) {
    console.error("[BSM Cron] Pool promotion failed:", e.message)
  }

  // --- Phase G: Scenario evolution — refresh stale Gold scenarios (weekly, Monday only) ---
  if (isMonday) {
    try {
      const evolveResult = await handleEvolveScenarios(env, { limit: 3 })
      console.log(`[BSM Cron] Scenario evolution: ${evolveResult.evolved || 0} evolved, ${evolveResult.failed || 0} failed`)
    } catch (e) {
      console.error("[BSM Cron] Scenario evolution failed:", e.message)
    }
  }
}

// ─── Multi-Agent Pipeline (Phase 0: Claude Opus + Vectorize RAG) ─────────────

/** Call Claude Opus API with timeout */
async function callClaude(system, userMessage, env, maxTokens = 1500, timeoutMs = STAGE_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const t0 = Date.now();
  try {
    const makeRequest = async () => {
      const res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: maxTokens,
          system,
          messages: [{ role: "user", content: userMessage }]
        }),
        signal: controller.signal
      });
      const data = await res.json();
      if (res.status === 429) {
        // Rate limited — wait and retry once
        const retryAfter = parseInt(res.headers.get("retry-after") || "15") * 1000;
        await new Promise(r => setTimeout(r, Math.min(retryAfter, 30000)));
        const res2 = await fetch(ANTHROPIC_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: ANTHROPIC_MODEL,
            max_tokens: maxTokens,
            system,
            messages: [{ role: "user", content: userMessage }]
          }),
          signal: controller.signal
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.error?.message || `Claude API ${res2.status} (after retry)`);
        return data2;
      }
      if (!res.ok) throw new Error(data.error?.message || `Claude API ${res.status}`);
      return data;
    };
    const data = await makeRequest();
    const text = data.content?.[0]?.text || "";
    return { text, usage: data.usage || {}, elapsed: Date.now() - t0 };
  } finally {
    clearTimeout(timer);
  }
}

/** Query Vectorize with embedding + metadata filter */
async function queryVectorize(env, queryText, position = null, topK = 3, typeFilter = null) {
  const embedResult = await env.AI.run("@cf/baai/bge-large-en-v1.5", { text: [queryText] });
  if (!embedResult?.data?.[0]) return [];
  const filter = {};
  if (position) filter.position = { $eq: position };
  if (typeFilter) filter.type = { $eq: typeFilter };
  const opts = { topK, returnMetadata: "all", returnValues: false };
  if (Object.keys(filter).length > 0) opts.filter = filter;
  const results = await env.VECTORIZE.query(embedResult.data[0], opts);
  return (results.matches || []).map(m => ({
    text: m.metadata?.text || "",
    metadata: m.metadata || {},
    score: m.score
  }));
}

/** Extract JSON from Claude response (handles markdown code blocks) */
function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}
  // Try extracting from ```json ... ``` block
  const mdMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (mdMatch) try { return JSON.parse(mdMatch[1]); } catch {}
  // Try finding first { ... } or [ ... ]
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) try { return JSON.parse(braceMatch[0]); } catch {}
  return null;
}

// ─── Stage System Prompts ────────────────────────────────────────────────────

const PLANNER_SYSTEM = `You are a baseball strategy scenario planner for Baseball Strategy Master, an educational app for kids ages 6-18.

Your job: create a PLAN for a scenario, NOT the scenario itself. Output a JSON plan.

RULES:
- teachingGoal must be one of: "introduce" (new concept), "reinforce" (practice known concept), "assess" (test mastery)
- difficulty: 1 (Rookie, ages 6-8), 2 (Pro, ages 9-12), 3 (All-Star, ages 13+)
- gameState must be physically possible (0-2 outs, valid runners, valid count, score as [home, away])
- Score perspective: score[0]=HOME, score[1]=AWAY. Bot inning = HOME team bats. Top inning = AWAY team bats.
- If "down 3-2" and player is HOME: score[0] < score[1], e.g. score=[2,3]
- keyDistractors: 2-3 tempting wrong answers that test common misconceptions
- dataToReference: specific stats/rules the scenario should reference (e.g., "RE24 with runners on 2nd", "steal break-even rate")

Output ONLY valid JSON:
{
  "teachingGoal": "introduce"|"reinforce"|"assess",
  "targetConcept": "specific concept name",
  "difficulty": 1|2|3,
  "gameState": { "inning": "Top 3"|"Bot 7", "outs": 0|1|2, "runners": [1]|[1,2]|[], "score": [2, 3], "count": "1-2"|null },
  "scenarioFocus": "one sentence describing the key decision",
  "keyDistractors": ["tempting wrong answer 1", "tempting wrong answer 2"],
  "dataToReference": "specific data point or rule"
}`;

const GENERATOR_SYSTEM = `You are a baseball strategy scenario writer for Baseball Strategy Master, an educational app teaching kids ages 6-18.

OUTPUT FORMAT: Valid JSON only. No markdown, no explanation outside the JSON.

MANDATORY RULES:
1. PERSPECTIVE: ALL text must use 2nd person ("you", "your"). NEVER "the pitcher should" — always "you should".
2. SCORE PERSPECTIVE: score=[HOME, AWAY]. score[0] is HOME, score[1] is AWAY. Bot inning = HOME bats. Top = AWAY bats.
   Example: "Bot 7, score [3, 5]" means HOME=3, AWAY=5, so the HOME team trails 3-5.
   If description says "down 6-5", HOME team has 5 and AWAY has 6: score=[5,6].
3. POSITION BOUNDARIES: Pitcher NEVER acts as cutoff/relay. Catcher NEVER leaves home unguarded. Outfielders throw TO relay man.
4. EXPLANATIONS: Each explanation must discuss THAT specific option. The best option's explanation must argue FOR it (positive).
5. RATES: Best option gets highest rate (75-90). One tempting wrong answer gets 40-65. Others get 15-40. Sum should be 165-195.
6. OPTIONS: Exactly 4, strategically distinct. Not just "throw to different bases."
7. AGE-APPROPRIATE: diff:1 = simple words, short sentences. diff:2 = baseball terminology OK. diff:3 = advanced stats/strategy.
8. CONCEPT: Must be specific (e.g., "cutoff-relay assignment from RF") not generic ("defense").

JSON SCHEMA:
{
  "title": "Short descriptive title",
  "description": "2-3 sentences setting the scene. Use 2nd person. Include game context.",
  "situation": { "inning": "Top 3", "outs": 1, "count": "2-1", "runners": [1, 2], "score": [2, 3] },
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "best": 0-3,
  "explanations": ["Explains option A", "Explains option B", "Explains option C", "Explains option D"],
  "rates": [85, 45, 30, 20],
  "concept": "Human-readable concept sentence",
  "conceptTag": "kebab-case-tag",
  "diff": 1|2|3,
  "anim": "steal"|"score"|"hit"|"throwHome"|"doubleplay"|"strike"|"strikeout"|"groundout"|"flyout"|"catch"|"advance"|"walk"|"bunt"|"safe"|"freeze"
}`;

const CRITIC_SYSTEM = `You are a quality auditor for Baseball Strategy Master, an educational baseball app for kids ages 6-18.

Evaluate the scenario against a 32-item checklist and a 6-dimension rubric. Be STRICT — only truly excellent scenarios should score 9.5+.

THE 31-ITEM CHECKLIST:
1. Does the scenario have exactly 4 options?
2. Is the best answer index valid (0-3)?
3. Does each explanation specifically discuss THAT option (not a generic response)?
4. Does the best explanation argue FOR the correct choice (positive reasoning, not just "others are worse")?
5. Is the score perspective correct? (Bot inning = HOME bats, score[0]=HOME, score[1]=AWAY)
6. Is the game situation physically possible? (valid outs, runners, count, score)
7. Does the pitcher NEVER act as cutoff man?
8. Does the catcher NEVER leave home plate unguarded with runners in scoring position?
9. Do outfielders throw TO the relay man (not relay themselves)?
10. Are cutoff/relay assignments correct per standard baseball? (3B cuts LF→home, 1B cuts CF/RF→home, SS relays left side, 2B relays right side)
11. Is the difficulty tag appropriate for the vocabulary used?
12. Does the best option have the highest success rate?
13. Do rates sum to approximately 165-195?
14. Is there at least one "tempting wrong answer" (rate 40-65)?
15. Does the description set the scene with enough game context (inning, outs, runners, score)?
16. Is the concept tag specific (not generic like "defense" or "strategy")?
17. Would the explanations actually teach something to a young player?
18. Are any statistics or rules referenced accurate?
19. Are all four options strategically distinct (not just variations of the same action)?
20. Is the language age-appropriate for the stated difficulty/ageMin?
21. Would a real youth baseball coach agree with the correct answer?
22. Does the conceptTag match what the scenario actually teaches?
23. Is the count field a specific balls-strikes value (not placeholder "-")?
24. Does the score perspective match the inning half? (Top=away bats, Bot=home bats)
25. Does each explanation address its corresponding option (not a generic response)?
26. Are the 4 explanations teaching 4 DIFFERENT principles?
27. Are force/tag play mechanics correct? (stepping on base removes force at next base)
28. Is vocabulary complexity appropriate for the difficulty level?
29. BSM uses 15 categories including 'famous' (historical strategic lessons), 'rules' (rule knowledge), and 'counts' (count-leverage strategy) — these are VALID categories, not errors.
30. Does the relay/cutoff terminology match the throw distance? ('relay' for deep throws, 'cutoff' for shorter throws)
31. Does the scenario teach a CLEAR single concept (not muddled)?
32. Are ALL 4 options actions that THIS SPECIFIC POSITION actually performs? A catcher scenario must have catching/blocking/framing/calling options, NOT batting/baserunning options. A pitcher scenario must have pitching options, NOT fielding-only options. If the options belong to a different position, FAIL this item.

EXPLANATION QUALITY DEEP CHECK (applies to all 4 explanations, not just best):
- Each explanation must contain causal reasoning ("because", "which means", "the key", "since", "otherwise")
- Each explanation must teach a DIFFERENT principle from the other 3
- Wrong-answer explanations must explain WHY the option fails, not just say "this is wrong" or "not ideal"
- Explanations should be 40-120 words each (not too short to teach, not too long to read)
- The best explanation must argue POSITIVELY for the choice (not just "others are worse")

POSITION-SPECIFIC VALIDATION:
- pitcher: pitch selection must match age/difficulty; pickoff scenarios must involve actual pickoff mechanics
- catcher: framing/blocking descriptions must be technically correct
- infield positions: force/tag plays must be accurate for the base; DP mechanics must be correct
- outfield: backup duties must be correct (LF→3B, RF→1B, CF→2B); relay targets must be correct
- batter: count leverage must be properly taught
- baserunner: steal/tag-up mechanics must be accurate
- manager: must involve strategic decisions, not physical play descriptions
- famous: must teach strategy through history, not just describe what happened
- rules: must test rule KNOWLEDGE with strategic implications
- counts: must involve count-specific strategic decisions

THE 6-DIMENSION RUBRIC (score each 1-10):
- factualAccuracy: Are all baseball facts, rules, and statistics correct?
- explanationStrength: Do explanations teach WHY, not just WHAT?
- ageAppropriateness: Language matches the difficulty level?
- educationalValue: Would a kid actually learn something from this?
- varietyDistinctness: Are the 4 options genuinely different strategic choices?
- conceptClarity: Does the scenario teach one clear, focused concept?

OVERALL SCORE: weighted average (factualAccuracy 2x, explanationStrength 2x, conceptClarity 1x, others 1x), scaled to 1-10.
PASS: overallScore >= 9.5 AND zero checklist failures.

Output ONLY valid JSON:
{
  "checklist": { "item_1": true, "item_2": true, ..., "item_32": true },
  "checklistFailures": ["item_5: Score perspective wrong — Bot 3rd but uses score[0] for batting team"],
  "rubric": {
    "factualAccuracy": 9,
    "explanationStrength": 8,
    "ageAppropriateness": 10,
    "educationalValue": 9,
    "varietyDistinctness": 8,
    "conceptClarity": 9
  },
  "overallScore": 8.75,
  "pass": false,
  "issues": ["Explanation for option 2 doesn't address that specific choice"],
  "suggestions": ["Rewrite explanation 2 to specifically discuss why throwing to second is suboptimal here"]
}`;

const REWRITER_SYSTEM = `You are a scenario editor for Baseball Strategy Master. Fix ONLY the identified issues — do not change anything that isn't broken.

RULES:
- Keep the same game situation, concept, and teaching goal
- Fix ONLY the specific issues identified by the critic
- Maintain 2nd-person perspective throughout ("you", "your")
- Ensure score perspective is correct (Bot = home bats, score[0]=HOME, score[1]=AWAY)
- Keep rates distributed properly (best=highest, one tempting wrong at 40-65, sum 165-195)

Output ONLY the corrected scenario as valid JSON (same schema as the original).`;

// ─── handleMultiAgent ────────────────────────────────────────────────────────

async function handleMultiAgent(request, env, cors) {
  const pipelineStart = Date.now();
  const stages = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let ragHits = 0;

  try {
    const body = await request.json();
    const { position, playerContext, positionRules, targetConcept, maxRetries = 1 } = body;

    if (!position) return jsonResponse({ error: "position is required" }, 400, cors);

    // ─── STAGE 1: PLANNER ─────────────────────────────────────────────────────

    // RAG: get similar existing scenarios to avoid duplication
    let planContext = [];
    try {
      planContext = await queryVectorize(env, `${position} ${playerContext || ""} baseball strategy scenario`, position, 3, "scenario");
      ragHits += planContext.length;
    } catch (e) { /* RAG failure is non-fatal */ }

    const existingScenarios = planContext.length > 0
      ? "\n\nSIMILAR EXISTING SCENARIOS (avoid duplicating these):\n" + planContext.map((s, i) => `${i + 1}. ${s.text.slice(0, 300)}`).join("\n")
      : "";

    const plannerUserMsg = `Create a scenario plan for position: ${position}.
Player context: ${playerContext || "No player history available."}
${targetConcept ? `Target concept: ${targetConcept}` : "Choose an appropriate concept for this position."}
${positionRules ? `\nPosition rules: ${positionRules}` : ""}${existingScenarios}`;

    const planResult = await callClaude(PLANNER_SYSTEM, plannerUserMsg, env, 400, STAGE_TIMEOUT);
    totalInputTokens += planResult.usage.input_tokens || 0;
    totalOutputTokens += planResult.usage.output_tokens || 0;
    stages.push({ name: "planner", elapsed: planResult.elapsed, tokens: (planResult.usage.input_tokens || 0) + (planResult.usage.output_tokens || 0) });

    const plan = extractJSON(planResult.text);
    if (!plan || !plan.gameState) {
      return jsonResponse({ error: "Planner failed to produce valid plan", raw: planResult.text.slice(0, 500) }, 500, cors);
    }

    // Validate planner output
    if (!["introduce", "reinforce", "assess"].includes(plan.teachingGoal)) plan.teachingGoal = "reinforce";
    if (!Array.isArray(plan.gameState.score) || plan.gameState.score.length !== 2) {
      plan.gameState.score = [0, 0];
    }

    // ─── STAGE 2: GENERATOR ───────────────────────────────────────────────────

    // RAG: retrieve relevant knowledge
    let mapContext = [], principleContext = [], brainContext = [], exampleContext = [];
    try {
      const ragQueries = await Promise.all([
        queryVectorize(env, (plan.targetConcept || position) + " " + position, position, 3, "map"),
        queryVectorize(env, position + " defensive responsibilities positioning", position, 2, "principle"),
        queryVectorize(env, plan.dataToReference || plan.targetConcept || position, null, 2, "brain"),
        queryVectorize(env, plan.scenarioFocus || plan.targetConcept || position, position, 2, "scenario")
      ]);
      mapContext = ragQueries[0];
      principleContext = ragQueries[1];
      brainContext = ragQueries[2];
      exampleContext = ragQueries[3];
      ragHits += mapContext.length + principleContext.length + brainContext.length + exampleContext.length;
    } catch (e) { /* RAG failure is non-fatal */ }

    const ragSections = [];
    if (mapContext.length > 0) {
      ragSections.push("RELEVANT KNOWLEDGE MAPS:\n" + mapContext.map(m => m.text.slice(0, 1500)).join("\n\n---\n\n"));
    }
    if (principleContext.length > 0) {
      ragSections.push("POSITION PRINCIPLES:\n" + principleContext.map(p => p.text.slice(0, 1000)).join("\n\n"));
    }
    if (brainContext.length > 0) {
      ragSections.push("STATISTICAL REFERENCE:\n" + brainContext.map(b => b.text.slice(0, 800)).join("\n\n"));
    }
    if (exampleContext.length > 0) {
      ragSections.push("EXAMPLE SCENARIOS (match this quality):\n" + exampleContext.map(e => e.text.slice(0, 600)).join("\n\n---\n\n"));
    }
    const ragBlock = ragSections.length > 0 ? "\n\n" + ragSections.join("\n\n") : "";

    const generatorUserMsg = `Generate a complete scenario based on this plan:

PLAN:
- Teaching goal: ${plan.teachingGoal}
- Target concept: ${plan.targetConcept}
- Difficulty: ${plan.difficulty}
- Game state: ${JSON.stringify(plan.gameState)}
- Scenario focus: ${plan.scenarioFocus}
- Key distractors: ${JSON.stringify(plan.keyDistractors)}
- Data to reference: ${plan.dataToReference || "N/A"}

Position: ${position}
${ragBlock}

Generate the scenario as valid JSON.`;

    const genResult = await callClaude(GENERATOR_SYSTEM, generatorUserMsg, env, 1500, STAGE_TIMEOUT);
    totalInputTokens += genResult.usage.input_tokens || 0;
    totalOutputTokens += genResult.usage.output_tokens || 0;
    stages.push({ name: "generator", elapsed: genResult.elapsed, tokens: (genResult.usage.input_tokens || 0) + (genResult.usage.output_tokens || 0) });

    let scenario = extractJSON(genResult.text);
    if (!scenario || !scenario.options || !Array.isArray(scenario.options)) {
      return jsonResponse({ error: "Generator failed to produce valid scenario", raw: genResult.text.slice(0, 500) }, 500, cors);
    }

    // Validate structure
    if (scenario.options.length !== 4) return jsonResponse({ error: "Scenario must have exactly 4 options" }, 500, cors);
    if (typeof scenario.best !== "number" || scenario.best < 0 || scenario.best > 3) scenario.best = 0;
    if (!scenario.explanations || scenario.explanations.length !== 4) {
      return jsonResponse({ error: "Scenario must have exactly 4 explanations" }, 500, cors);
    }
    if (!scenario.rates || scenario.rates.length !== 4) scenario.rates = [80, 45, 30, 25];
    if (!scenario.situation) scenario.situation = plan.gameState;
    if (!scenario.diff) scenario.diff = plan.difficulty || 2;

    // ─── STAGE 3: CRITIC ──────────────────────────────────────────────────────

    async function runCritic(scenarioToGrade) {
      const criticUserMsg = `Evaluate this Baseball Strategy Master scenario for position "${position}":\n\n${JSON.stringify(scenarioToGrade, null, 2)}`;
      const criticResult = await callClaude(CRITIC_SYSTEM, criticUserMsg, env, 1000, STAGE_TIMEOUT);
      totalInputTokens += criticResult.usage.input_tokens || 0;
      totalOutputTokens += criticResult.usage.output_tokens || 0;
      stages.push({ name: "critic", elapsed: criticResult.elapsed, tokens: (criticResult.usage.input_tokens || 0) + (criticResult.usage.output_tokens || 0) });

      const critique = extractJSON(criticResult.text);
      if (!critique || typeof critique.overallScore !== "number") {
        return { overallScore: 0, pass: false, checklist: {}, checklistFailures: ["Failed to parse critic output"], rubric: {}, issues: ["Critic returned invalid JSON"], suggestions: [] };
      }
      // Recompute pass based on score + failures
      critique.pass = critique.overallScore >= 9.5 && (!critique.checklistFailures || critique.checklistFailures.length === 0);
      return critique;
    }

    let critique = await runCritic(scenario);
    let bestScenario = scenario;
    let bestCritique = critique;
    let bestScore = critique.overallScore;

    // ─── STAGE 4: REWRITER (if needed) ────────────────────────────────────────

    let rewriteCount = 0;
    while (!critique.pass && rewriteCount < maxRetries) {
      rewriteCount++;
      const rewriterUserMsg = `Fix this scenario based on the critic's feedback.

ORIGINAL SCENARIO:
${JSON.stringify(scenario, null, 2)}

CRITIC FEEDBACK:
- Overall score: ${critique.overallScore}/10
- Checklist failures: ${JSON.stringify(critique.checklistFailures || [])}
- Issues: ${JSON.stringify(critique.issues || [])}
- Suggestions: ${JSON.stringify(critique.suggestions || [])}
- Rubric: ${JSON.stringify(critique.rubric || {})}
${ragBlock}

Output the corrected scenario as valid JSON.`;

      const rewriteResult = await callClaude(REWRITER_SYSTEM, rewriterUserMsg, env, 1500, STAGE_TIMEOUT);
      totalInputTokens += rewriteResult.usage.input_tokens || 0;
      totalOutputTokens += rewriteResult.usage.output_tokens || 0;
      stages.push({ name: "rewriter", elapsed: rewriteResult.elapsed, tokens: (rewriteResult.usage.input_tokens || 0) + (rewriteResult.usage.output_tokens || 0) });

      const rewritten = extractJSON(rewriteResult.text);
      if (rewritten && rewritten.options && rewritten.options.length === 4) {
        scenario = rewritten;
        // Re-run critic on rewritten version
        critique = await runCritic(scenario);

        if (critique.overallScore > bestScore) {
          bestScenario = scenario;
          bestCritique = critique;
          bestScore = critique.overallScore;
        }
      } else {
        // Rewrite failed to produce valid JSON, stop trying
        break;
      }
    }

    // Use best version
    scenario = bestScenario;
    critique = bestCritique;

    // ─── METADATA STAMPING ──────────────────────────────────────────────────

    scenario.id = `ma_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    scenario.isAI = true;
    scenario.cat = "ai-generated";
    scenario.scenarioSource = "multi-agent-opus";
    scenario.agentGrade = Math.round(critique.overallScore * 10);
    scenario.agentPlan = {
      goal: plan.teachingGoal,
      concept: plan.targetConcept,
      difficulty: plan.difficulty
    };
    const totalElapsed = Date.now() - pipelineStart;
    scenario.pipelineStats = {
      totalElapsed,
      stages: stages.map(s => s.name),
      totalInputTokens,
      totalOutputTokens,
      critiquePass: critique.pass,
      critiqueScore: critique.overallScore,
      ragHits
    };

    // ─── RESPONSE ───────────────────────────────────────────────────────────

    const response = jsonResponse({
      scenario,
      critique: {
        score: critique.overallScore,
        pass: critique.pass,
        rubric: critique.rubric,
        checklistFailures: critique.checklistFailures,
        issues: critique.issues
      },
      pipeline: {
        model: ANTHROPIC_MODEL,
        totalElapsed,
        stages,
        totalInputTokens,
        totalOutputTokens,
        ragHits,
        rewriteCount
      }
    }, 200, cors);

    // Add pipeline headers
    response.headers.set("X-Pipeline-Elapsed", String(totalElapsed));
    response.headers.set("X-Pipeline-Stages", String(stages.length));
    response.headers.set("X-Pipeline-Model", ANTHROPIC_MODEL);
    response.headers.set("X-Pipeline-RAG-Hits", String(ragHits));

    return response;

  } catch (e) {
    const elapsed = Date.now() - pipelineStart;
    return jsonResponse({
      error: e.message || "Multi-agent pipeline error",
      elapsed,
      stages
    }, 500, cors);
  }
}

// --- Fine-tuned 70B model proxy (drop-in replacement for xAI/Claude) ---

async function handleLLM70B(request, env, cors) {
  // Requires LLM_70B_URL and LLM_70B_API_KEY secrets
  if (!env.LLM_70B_URL) {
    // 70B not deployed yet — fall back to current pipeline
    return null;
  }
  const body = await request.json();
  // Override model to use our fine-tuned 70B
  const llmBody = {
    ...body,
    model: env.LLM_70B_MODEL || "bsm-70b",
    max_tokens: body.max_tokens || LLM_70B_DEFAULT_MAX_TOKENS,
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_70B_TIMEOUT);
  try {
    const t0 = Date.now();
    const headers = { "Content-Type": "application/json" };
    if (env.LLM_70B_API_KEY) headers["Authorization"] = `Bearer ${env.LLM_70B_API_KEY}`;
    const res = await fetch(env.LLM_70B_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(llmBody),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const elapsed = Date.now() - t0;
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[BSM Worker] 70B error ${res.status} (${elapsed}ms):`, errBody.slice(0, 500));
      return jsonResponse({
        error: { message: `70B model error: ${res.status}`, type: "llm_70b_error", status: res.status, detail: errBody.slice(0, 300) },
        _fallback: true
      }, res.status, { ...cors, "X-LLM70B-Elapsed": String(elapsed) });
    }
    console.log(`[BSM Worker] 70B responded ${res.status} in ${elapsed}ms`);
    const data = await res.json();
    return jsonResponse({
      ...data,
      _model: "bsm-70b",
      _elapsed: elapsed,
    }, 200, { ...cors, "X-LLM70B-Elapsed": String(elapsed), "X-LLM70B-Model": env.LLM_70B_MODEL || "bsm-70b" });
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") {
      console.error("[BSM Worker] 70B timeout after", LLM_70B_TIMEOUT, "ms");
      return jsonResponse({ error: { message: "70B model timeout", type: "timeout" }, _fallback: true }, 504, cors);
    }
    console.error("[BSM Worker] 70B fetch error:", e.message);
    return jsonResponse({ error: { message: e.message, type: "fetch_error" }, _fallback: true }, 502, cors);
  }
}

// POST /api/llm-70b — fine-tuned model endpoint with automatic fallback
async function handleLLM70BRoute(request, env, cors) {
  // Try 70B first
  const result = await handleLLM70B(request.clone(), env, cors);
  if (result && !result.headers?.get?.("X-LLM70B-Elapsed")?.includes?.("error")) {
    // Check if response body indicates fallback needed
    const body = await result.clone().json().catch(() => ({}));
    if (!body._fallback) return result;
  }
  // Fallback to multi-agent pipeline (Claude Opus + RAG)
  console.log("[BSM Worker] 70B unavailable/failed, falling back to multi-agent pipeline");
  try {
    const fallbackRes = await handleMultiAgent(request.clone(), env, cors);
    return fallbackRes;
  } catch (e) {
    console.warn("[BSM Worker] Multi-agent fallback also failed:", e.message);
    // Last resort: xAI proxy
    return await handleAIProxy(request, env, cors);
  }
}

// POST /api/llm-70b/enrich — deeper RE24/situational reasoning from 70B
async function handleLLM70BEnrich(request, env, cors) {
  const body = await request.json();
  const { scenario, choiceIdx, situation, position, playerAge } = body;
  if (!scenario || !situation) {
    return jsonResponse({ error: "Missing scenario or situation" }, 400, cors);
  }
  // Build enrichment prompt — ask the 70B for deep RE24/situational analysis
  const enrichPrompt = {
    model: env.LLM_70B_MODEL || "bsm-70b",
    messages: [
      { role: "system", content: `You are an elite baseball strategy analyst. Given a game situation, provide deep RE24 run expectancy analysis, win probability context, and situational reasoning. Be specific with numbers. Keep it under 150 words. Age-appropriate for ${playerAge || 14} year old.` },
      { role: "user", content: `Situation: ${JSON.stringify(situation)}\nPosition: ${position}\nScenario: "${scenario.title}"\nPlayer chose option ${choiceIdx}: "${scenario.options?.[choiceIdx] || 'unknown'}"\nCorrect answer was option ${scenario.best}: "${scenario.options?.[scenario.best] || 'unknown'}"\nConcept: ${scenario.concept || 'general'}\n\nProvide deep situational analysis with RE24 values, scoring probabilities, and why the correct choice matters strategically.` }
    ],
    max_tokens: 300,
    temperature: 0.3,
  };
  // Try 70B first for domain-specific depth
  if (env.LLM_70B_URL) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const headers = { "Content-Type": "application/json" };
      if (env.LLM_70B_API_KEY) headers["Authorization"] = `Bearer ${env.LLM_70B_API_KEY}`;
      const res = await fetch(env.LLM_70B_URL, {
        method: "POST", headers, body: JSON.stringify(enrichPrompt), signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return jsonResponse({ ok: true, enrichment: content, model: "bsm-70b" }, 200, cors);
      }
    } catch (e) {
      clearTimeout(timeout);
      console.warn("[BSM Worker] 70B enrich failed:", e.message);
    }
  }
  // Fallback to xAI for enrichment
  if (env.XAI_API_KEY) {
    try {
      enrichPrompt.model = "grok-4";
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.XAI_API_KEY}` },
        body: JSON.stringify(enrichPrompt),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return jsonResponse({ ok: true, enrichment: content, model: "grok-4-fallback" }, 200, cors);
      }
    } catch {}
  }
  return jsonResponse({ ok: false, error: "Enrichment unavailable" }, 503, cors);
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
    if (path === "/scenario-pool/quality-audit" && request.method === "GET") {
      try {
        return await handlePoolQualityAudit(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }
    if (path === "/scenario-pool/promote" && request.method === "POST") {
      const adminKey = request.headers.get("X-Admin-Key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      try {
        const result = await handlePoolPromotion(env);
        return jsonResponse(result, result.error ? 500 : 200, cors);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500, cors);
      }
    }

    if (path === "/knowledge-base/coverage" && request.method === "GET") {
      try {
        return await handleKBCoverage(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }

    // Backfill concept_tag for existing pool scenarios with empty tags
    if (path === "/scenario-pool/backfill-tags" && request.method === "POST") {
      try {
        const rows = await env.DB.prepare('SELECT id, concept FROM scenario_pool WHERE concept_tag = "" OR concept_tag IS NULL').all()
        let updated = 0
        for (const row of (rows.results || [])) {
          const tag = extractConceptTag(row.concept)
          if (tag) {
            await env.DB.prepare('UPDATE scenario_pool SET concept_tag = ? WHERE id = ?').bind(tag, row.id).run()
            updated++
          }
        }
        return jsonResponse({ ok: true, scanned: (rows.results || []).length, updated }, 200, cors)
      } catch (e) {
        return jsonResponse({ error: e.message }, 500, cors)
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

    if (path === "/analytics/audit-insights" && request.method === "GET") {
      try {
        return await handleAuditInsights(request, env, cors);
      } catch {
        return jsonResponse({ error: "Server error" }, 500, cors);
      }
    }

    if (path === "/analytics/prompt-version" && request.method === "POST") {
      if (!checkRateLimit(`analytics:${ip}`, RATE_LIMIT_ANALYTICS)) {
        return jsonResponse({ ok: false, error: "Rate limited" }, 429, cors);
      }
      try {
        return await handlePromptVersion(request, env, cors);
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

    if (path === "/analytics/ab-results" && request.method === "GET") {
      try {
        return await handleABAnalysis(request, env, cors);
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

    // GET /admin/weekly-report — retrieve latest comprehensive report (admin)
    if (path === "/admin/weekly-report" && request.method === "GET") {
      const adminKey = request.headers.get("X-Admin-Key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      try {
        const limitParam = url.searchParams.get("limit")
        const limit = Math.min(Math.max(parseInt(limitParam) || 1, 1), 10)
        const reports = await env.DB.prepare(
          "SELECT id, period_start, period_end, report_json, created_at FROM weekly_ai_report ORDER BY created_at DESC LIMIT ?"
        ).bind(limit).all()
        const parsed = (reports.results || []).map(r => {
          const report = JSON.parse(r.report_json || "{}")
          return {
            id: r.id,
            period_start: r.period_start,
            period_end: r.period_end,
            period_start_iso: new Date(r.period_start).toISOString(),
            period_end_iso: new Date(r.period_end).toISOString(),
            created_at: r.created_at,
            ...report
          }
        })
        // Also fetch current active patches count
        let activePatchCount = 0
        try {
          const pc = await env.DB.prepare("SELECT COUNT(*) as count FROM prompt_patches WHERE active = 1").first()
          activePatchCount = pc?.count || 0
        } catch {}
        return jsonResponse({ ok: true, reports: parsed, active_patches: activePatchCount }, 200, cors);
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

    // ════════════════════════════════════════════════════════════════
    // AutoResearch: Claude Opus Generation Endpoint
    // Accepts a full prompt and routes to Claude Opus (not xAI).
    // Gives AutoResearch direct prompt control + Claude model quality.
    // ════════════════════════════════════════════════════════════════

    if (path === "/v1/autoresearch-generate" && request.method === "POST") {
      const adminKey = request.headers.get("X-Admin-Key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      if (!checkRateLimit(`ar:${ip}`, RATE_LIMIT_AI)) {
        return jsonResponse({ error: "Rate limited" }, 429, cors);
      }
      try {
        const body = await request.json();
        const { systemPrompt, userPrompt, temperature, maxTokens } = body;
        if (!userPrompt) return jsonResponse({ error: "Missing userPrompt" }, 400, cors);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const res = await fetch(ANTHROPIC_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: ANTHROPIC_MODEL,
            max_tokens: maxTokens || 2000,
            temperature: temperature || 0.4,
            system: systemPrompt || "You are the world's most experienced baseball coach. Respond with ONLY valid JSON.",
            messages: [{ role: "user", content: userPrompt }]
          }),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          return jsonResponse({ error: "Claude API error", status: res.status, detail: errBody.error?.message || "" }, res.status, cors);
        }

        const data = await res.json();
        const text = data.content?.[0]?.text || "";
        const usage = data.usage || {};

        return jsonResponse({
          ok: true,
          text,
          model: ANTHROPIC_MODEL,
          usage: { input_tokens: usage.input_tokens || 0, output_tokens: usage.output_tokens || 0 },
          stop_reason: data.stop_reason || "unknown"
        }, 200, cors);
      } catch (e) {
        if (e.name === "AbortError") return jsonResponse({ error: "Claude timeout (60s)" }, 504, cors);
        return jsonResponse({ error: e.message }, 500, cors);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // AutoResearch: Prompt Optimization Persistence
    // ════════════════════════════════════════════════════════════════

    if (path === "/autoresearch/save-cycle" && request.method === "POST") {
      const adminKey = request.headers.get("X-Admin-Key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      try {
        const body = await request.json();
        const { report } = body;
        if (!report || !report.cycle_id) return jsonResponse({ error: "Missing report.cycle_id" }, 400, cors);

        // Write to prompt_optimization_cycles
        await env.DB.prepare(`
          INSERT OR REPLACE INTO prompt_optimization_cycles
          (cycle_id, timestamp, control_avg_score, control_pass_rate, control_tier1_fails,
           variants_tested, variants_adopted, results_json, changelog_entry)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          report.cycle_id,
          report.timestamp || new Date().toISOString(),
          report.control?.avg_score || 0,
          report.control?.pass_rate || 0,
          Math.round((report.control?.tier1_fail_rate || 0) * (report.control?.n || 1) / 100),
          report.variants_tested || 0,
          report.variants_adopted || 0,
          JSON.stringify(report),
          JSON.stringify(report.changelog_entry || {})
        ).run();

        // Write each variant to prompt_variants_log
        const allVariants = [...(report.adopted || []), ...(report.reverted || [])];
        for (const v of allVariants) {
          await env.DB.prepare(`
            INSERT OR REPLACE INTO prompt_variants_log
            (variant_id, cycle_id, mutation_type, mutations_json, avg_score, pass_rate,
             delta_vs_control, adopted, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            v.variant_id,
            report.cycle_id,
            v.mutation_type,
            JSON.stringify(v),
            v.delta ? (report.control?.avg_score || 0) + v.delta : 0,
            v.pass_rate_delta ? (report.control?.pass_rate || 0) + v.pass_rate_delta : 0,
            v.delta || 0,
            v.reason === "improvement" ? 1 : 0,
            report.timestamp || new Date().toISOString()
          ).run();
        }

        return jsonResponse({ ok: true, cycle_id: report.cycle_id, variants_saved: allVariants.length }, 200, cors);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500, cors);
      }
    }

    if (path === "/autoresearch/history" && request.method === "GET") {
      const adminKey = request.headers.get("X-Admin-Key") || url.searchParams.get("key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      try {
        const cycles = await env.DB.prepare(`
          SELECT cycle_id, timestamp, control_avg_score, control_pass_rate, control_tier1_fails,
                 variants_tested, variants_adopted, changelog_entry
          FROM prompt_optimization_cycles
          ORDER BY timestamp DESC
          LIMIT 20
        `).all();

        const adopted = await env.DB.prepare(`
          SELECT variant_id, cycle_id, mutation_type, delta_vs_control, avg_score, pass_rate, created_at
          FROM prompt_variants_log
          WHERE adopted = 1
          ORDER BY created_at DESC
          LIMIT 50
        `).all();

        return jsonResponse({
          ok: true,
          cycles: cycles.results || [],
          adopted_mutations: adopted.results || [],
          total_cycles: (cycles.results || []).length,
          total_adopted: (adopted.results || []).length
        }, 200, cors);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500, cors);
      }
    }

    if (path === "/autoresearch/dashboard" && request.method === "GET") {
      const adminKey = url.searchParams.get("key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return new Response("Unauthorized. Pass ?key=YOUR_ADMIN_KEY", { status: 401, headers: cors });
      }
      try {
        const cycles = await env.DB.prepare(`
          SELECT cycle_id, timestamp, control_avg_score, control_pass_rate, control_tier1_fails,
                 variants_tested, variants_adopted, results_json
          FROM prompt_optimization_cycles
          ORDER BY timestamp DESC
          LIMIT 50
        `).all();

        const adopted = await env.DB.prepare(`
          SELECT variant_id, cycle_id, mutation_type, delta_vs_control, avg_score, pass_rate, created_at
          FROM prompt_variants_log
          WHERE adopted = 1
          ORDER BY created_at DESC
        `).all();

        const allVariants = await env.DB.prepare(`
          SELECT mutation_type, adopted, delta_vs_control, COUNT(*) as count
          FROM prompt_variants_log
          GROUP BY mutation_type, adopted
          ORDER BY mutation_type
        `).all();

        const cycleData = (cycles.results || []).reverse();
        const adoptedData = adopted.results || [];
        const variantStats = allVariants.results || [];

        // Build mutation effectiveness leaderboard
        const mutationMap = {};
        for (const v of variantStats) {
          if (!mutationMap[v.mutation_type]) mutationMap[v.mutation_type] = { tested: 0, adopted: 0, totalDelta: 0 };
          mutationMap[v.mutation_type].tested += v.count;
          if (v.adopted) { mutationMap[v.mutation_type].adopted += v.count; mutationMap[v.mutation_type].totalDelta += (v.delta_vs_control || 0) * v.count; }
        }

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BSM AutoResearch Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,system-ui,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;max-width:1200px;margin:0 auto}
h1{font-size:24px;margin-bottom:4px;color:#38bdf8}
.sub{color:#94a3b8;margin-bottom:24px;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:32px}
.card{background:#1e293b;border-radius:12px;padding:20px;border:1px solid #334155}
.card .val{font-size:32px;font-weight:700;color:#38bdf8}
.card .label{font-size:13px;color:#94a3b8;margin-top:4px}
h2{font-size:18px;margin-bottom:12px;color:#f1f5f9}
table{width:100%;border-collapse:collapse;margin-bottom:32px;font-size:14px}
th{text-align:left;padding:8px 12px;background:#1e293b;color:#94a3b8;border-bottom:2px solid #334155}
td{padding:8px 12px;border-bottom:1px solid #1e293b}
tr:hover td{background:#1e293b}
.adopted{color:#4ade80;font-weight:600}
.reverted{color:#f87171}
.marginal{color:#fbbf24}
.chart-container{background:#1e293b;border-radius:12px;padding:20px;border:1px solid #334155;margin-bottom:32px;height:300px;position:relative}
canvas{width:100%!important;height:100%!important}
.empty{color:#64748b;text-align:center;padding:40px;font-style:italic}
</style>
</head>
<body>
<h1>AutoResearch Dashboard</h1>
<p class="sub">Autonomous Prompt Optimization — BSM AI Pipeline</p>

<div class="grid">
  <div class="card"><div class="val">${cycleData.length}</div><div class="label">Total Cycles</div></div>
  <div class="card"><div class="val">${adoptedData.length}</div><div class="label">Mutations Adopted</div></div>
  <div class="card"><div class="val">${cycleData.length > 0 ? cycleData[cycleData.length - 1].control_avg_score?.toFixed(1) || '—' : '—'}</div><div class="label">Latest Avg Score</div></div>
  <div class="card"><div class="val">${cycleData.length > 0 ? (cycleData[cycleData.length - 1].control_pass_rate?.toFixed(0) || '—') + '%' : '—'}</div><div class="label">Latest Pass Rate</div></div>
</div>

<h2>Score Over Time</h2>
${cycleData.length > 0 ? `
<div class="chart-container">
  <canvas id="scoreChart"></canvas>
</div>
<script>
const ctx = document.getElementById('scoreChart').getContext('2d');
const data = ${JSON.stringify(cycleData.map(c => ({ t: c.timestamp?.split('T')[0] || '', s: c.control_avg_score || 0, p: c.control_pass_rate || 0 })))};
const W = ctx.canvas.width = ctx.canvas.parentElement.clientWidth - 40;
const H = ctx.canvas.height = 260;
const pad = {t:20,r:20,b:30,l:50};
const gw = W-pad.l-pad.r, gh = H-pad.t-pad.b;
const minS = Math.min(...data.map(d=>d.s))-5, maxS = Math.max(...data.map(d=>d.s))+5;
ctx.fillStyle='#94a3b8';ctx.font='12px sans-serif';
// Y axis
for(let i=0;i<=4;i++){
  const v=minS+(maxS-minS)*i/4; const y=pad.t+gh-gh*i/4;
  ctx.fillText(v.toFixed(0),pad.l-35,y+4);
  ctx.strokeStyle='#334155';ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+gw,y);ctx.stroke();
}
// Line
if(data.length>1){
  ctx.strokeStyle='#38bdf8';ctx.lineWidth=2.5;ctx.beginPath();
  data.forEach((d,i)=>{
    const x=pad.l+gw*i/(data.length-1); const y=pad.t+gh-(d.s-minS)/(maxS-minS)*gh;
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });ctx.stroke();
  // Dots
  data.forEach((d,i)=>{
    const x=pad.l+gw*i/(data.length-1); const y=pad.t+gh-(d.s-minS)/(maxS-minS)*gh;
    ctx.fillStyle='#38bdf8';ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();
  });
}
// X labels
ctx.fillStyle='#94a3b8';
data.forEach((d,i)=>{
  if(i%(Math.ceil(data.length/6))===0||i===data.length-1){
    const x=pad.l+gw*i/Math.max(1,data.length-1);
    ctx.fillText(d.t,x-20,H-5);
  }
});
</script>` : '<div class="empty">No cycles recorded yet. Run runAutoResearchDryRun() to generate data.</div>'}

<h2>Adopted Mutations</h2>
${adoptedData.length > 0 ? `<table>
<tr><th>Date</th><th>Cycle</th><th>Mutation Type</th><th>Delta</th><th>Score</th><th>Pass Rate</th></tr>
${adoptedData.map(a => `<tr>
  <td>${(a.created_at || '').split('T')[0]}</td>
  <td>${a.cycle_id}</td>
  <td class="adopted">${a.mutation_type}</td>
  <td class="adopted">+${(a.delta_vs_control || 0).toFixed(1)}</td>
  <td>${(a.avg_score || 0).toFixed(1)}</td>
  <td>${(a.pass_rate || 0).toFixed(0)}%</td>
</tr>`).join('')}
</table>` : '<div class="empty">No mutations adopted yet.</div>'}

<h2>Mutation Effectiveness</h2>
${Object.keys(mutationMap).length > 0 ? `<table>
<tr><th>Mutation Type</th><th>Times Tested</th><th>Times Adopted</th><th>Adopt Rate</th><th>Avg Delta When Adopted</th></tr>
${Object.entries(mutationMap).sort((a,b)=>b[1].adopted-a[1].adopted).map(([type, stats]) => `<tr>
  <td>${type}</td>
  <td>${stats.tested}</td>
  <td>${stats.adopted}</td>
  <td>${stats.tested > 0 ? Math.round(stats.adopted / stats.tested * 100) : 0}%</td>
  <td>${stats.adopted > 0 ? '+' + (stats.totalDelta / stats.adopted).toFixed(1) : '—'}</td>
</tr>`).join('')}
</table>` : '<div class="empty">No variant data yet.</div>'}

<h2>Recent Cycles</h2>
${cycleData.length > 0 ? `<table>
<tr><th>Date</th><th>Cycle ID</th><th>Avg Score</th><th>Pass Rate</th><th>T1 Fails</th><th>Tested</th><th>Adopted</th></tr>
${[...cycleData].reverse().map(c => `<tr>
  <td>${(c.timestamp || '').split('T')[0]}</td>
  <td>${c.cycle_id}</td>
  <td>${(c.control_avg_score || 0).toFixed(1)}</td>
  <td>${(c.control_pass_rate || 0).toFixed(0)}%</td>
  <td>${c.control_tier1_fails || 0}</td>
  <td>${c.variants_tested || 0}</td>
  <td class="${c.variants_adopted > 0 ? 'adopted' : ''}">${c.variants_adopted || 0}</td>
</tr>`).join('')}
</table>` : ''}

<p class="sub" style="margin-top:32px;text-align:center">AutoResearch v1.0.0 — BSM AI Pipeline</p>
</body></html>`;

        return new Response(html, { status: 200, headers: { ...cors, "Content-Type": "text/html;charset=utf-8" } });
      } catch (e) {
        return new Response("Error: " + e.message, { status: 500, headers: cors });
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
      // GET /vectorize/query — query the knowledge base via RAG
      if (path === "/vectorize/query") {
        try {
          const url = new URL(request.url);
          const query = url.searchParams.get("query");
          if (!query) return jsonResponse({ error: "Missing ?query= parameter" }, 400, cors);
          const topK = Math.min(parseInt(url.searchParams.get("topK") || "3"), 20);
          const position = url.searchParams.get("position") || null;
          const type = url.searchParams.get("type") || null;
          const filter = {};
          if (type) filter.type = type;
          if (position) filter.position = position;
          const results = await queryKnowledge(env, query, topK, filter);
          return jsonResponse({ query, topK, filter, results }, 200, cors);
        } catch (e) {
          return jsonResponse({ error: e.message }, 500, cors);
        }
      }
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    if (path === "/admin/batch-generate" && request.method === "POST") {
      const adminKey = request.headers.get("X-Admin-Key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      try {
        const body = await request.json().catch(() => ({}));
        const result = await handleBatchGenerate(env, {
          count: Math.min(body.count || 10, 25),
          position: body.position || null
        });
        return jsonResponse(result, result.error ? 500 : 200, cors);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500, cors);
      }
    }

    // POST /admin/embed-knowledge — run the full RAG embedding pipeline
    if (path === "/admin/embed-knowledge" && request.method === "POST") {
      const adminKey = request.headers.get("X-Admin-Key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      try {
        // Embed from pre-extracted knowledge.json (built by scripts/extract-scenarios.js)
        const result = await embedAllKnowledge(env);
        return jsonResponse(result, 200, cors);
      } catch (e) {
        return jsonResponse({ error: e.message, stack: e.stack }, 500, cors);
      }
    }

    if (path === "/admin/evolve-scenarios" && request.method === "POST") {
      const adminKey = request.headers.get("X-Admin-Key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      try {
        const body = await request.json().catch(() => ({}));
        const result = await handleEvolveScenarios(env, {
          limit: Math.min(body.limit || 5, 10)
        });
        return jsonResponse(result, result.error ? 500 : 200, cors);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500, cors);
      }
    }

    // Admin audit endpoint — routes scenario scoring through Claude via stored ANTHROPIC_API_KEY
    if (path === "/admin/audit-scenario" && request.method === "POST") {
      const adminKey = request.headers.get("X-Admin-Key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      try {
        const body = await request.json();
        const { scenario, systemPrompt, maxTokens } = body;
        if (!scenario || !systemPrompt) {
          return jsonResponse({ error: "Missing scenario or systemPrompt" }, 400, cors);
        }
        const { text, usage } = await callClaude(systemPrompt, JSON.stringify(scenario, null, 2), env, maxTokens || 1024, 50000);
        let parsed;
        try { parsed = JSON.parse(text); }
        catch { const m = text.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : { raw: text }; }
        return jsonResponse({ result: parsed, usage }, 200, cors);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500, cors);
      }
    }

    // Admin meta-analysis endpoint — for pattern mining and synthesis calls
    if (path === "/admin/audit-analyze" && request.method === "POST") {
      const adminKey = request.headers.get("X-Admin-Key");
      if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, cors);
      }
      try {
        const body = await request.json();
        const { systemPrompt, data, maxTokens } = body;
        if (!systemPrompt || !data) {
          return jsonResponse({ error: "Missing systemPrompt or data" }, 400, cors);
        }
        const { text, usage } = await callClaude(systemPrompt, JSON.stringify(data, null, 2), env, maxTokens || 4096, 120000);
        let parsed;
        try { parsed = JSON.parse(text); }
        catch { const m = text.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : { raw: text }; }
        return jsonResponse({ result: parsed, usage }, 200, cors);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500, cors);
      }
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
      // Fine-tuned 70B model routes (with automatic fallback)
      if (path === "/api/llm-70b" && request.method === "POST") return await handleLLM70BRoute(request, env, cors);
      if (path === "/api/llm-70b/enrich" && request.method === "POST") return await handleLLM70BEnrich(request, env, cors);
      if (path === "/v1/multi-agent" && request.method === "POST") return await handleMultiAgent(request, env, cors);
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
