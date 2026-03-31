-- AutoResearch Prompt Optimization Tables
-- Run via Cloudflare Dashboard > D1 > Console, or: npx wrangler d1 execute bsm-db --file=./migrations/autoresearch_tables.sql
--
-- IMPORTANT: D1 does not support CREATE TABLE at runtime from Workers.
-- Execute this migration ONCE before using the /autoresearch/* endpoints.

CREATE TABLE IF NOT EXISTS prompt_optimization_cycles (
  cycle_id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  control_avg_score REAL,
  control_pass_rate REAL,
  control_tier1_fails INTEGER,
  variants_tested INTEGER,
  variants_adopted INTEGER,
  results_json TEXT,
  changelog_entry TEXT
);

CREATE TABLE IF NOT EXISTS prompt_variants_log (
  variant_id TEXT PRIMARY KEY,
  cycle_id TEXT REFERENCES prompt_optimization_cycles(cycle_id),
  mutation_type TEXT NOT NULL,
  mutations_json TEXT NOT NULL,
  avg_score REAL,
  pass_rate REAL,
  delta_vs_control REAL,
  adopted BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_poc_timestamp ON prompt_optimization_cycles(timestamp);
CREATE INDEX IF NOT EXISTS idx_pvl_cycle ON prompt_variants_log(cycle_id);
CREATE INDEX IF NOT EXISTS idx_pvl_mutation ON prompt_variants_log(mutation_type);
CREATE INDEX IF NOT EXISTS idx_pvl_adopted ON prompt_variants_log(adopted);
