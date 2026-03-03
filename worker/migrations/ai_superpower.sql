-- AI Superpower Roadmap — D1 Migrations
-- Run with: npx wrangler d1 execute bsm-accounts --remote --file=worker/migrations/ai_superpower.sql

-- Sprint 4.4: Error monitoring
CREATE TABLE IF NOT EXISTS error_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_type TEXT NOT NULL,
  error_message TEXT,
  context TEXT,
  ip TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_errors_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_created ON error_logs(created_at);

-- Sprint 4.4: Flagged scenarios (for AI prompt injection — Level 1.5)
CREATE TABLE IF NOT EXISTS flagged_scenarios (
  scenario_id TEXT PRIMARY KEY,
  flag_count INTEGER DEFAULT 1,
  position TEXT,
  flagged_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_flagged_position ON flagged_scenarios(position);

-- Level 2.2: Scenario quality grades
CREATE TABLE IF NOT EXISTS scenario_grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_id TEXT NOT NULL,
  position TEXT,
  source TEXT DEFAULT 'ai',
  quality_score REAL DEFAULT 0,
  correct_rate REAL DEFAULT 0,
  flag_rate REAL DEFAULT 0,
  grader_details TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_grades_scenario ON scenario_grades(scenario_id);
CREATE INDEX IF NOT EXISTS idx_grades_position ON scenario_grades(position);

-- Level 2.4: Population difficulty tracking (cross-player learning)
CREATE TABLE IF NOT EXISTS scenario_difficulty (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_id TEXT NOT NULL,
  position TEXT,
  concept TEXT,
  difficulty INTEGER DEFAULT 1,
  is_correct INTEGER DEFAULT 0,
  is_ai INTEGER DEFAULT 0,
  session_hash TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_diff_concept ON scenario_difficulty(concept);
CREATE INDEX IF NOT EXISTS idx_diff_position ON scenario_difficulty(position);

-- Level 2.1: Weekly AI quality reports (auto-created by Cron, but included for completeness)
CREATE TABLE IF NOT EXISTS weekly_ai_report (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_start INTEGER NOT NULL,
  period_end INTEGER NOT NULL,
  report_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
