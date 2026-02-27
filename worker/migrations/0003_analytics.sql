-- Sprint 4.2: Real-time analytics pipeline
-- Run: npx wrangler d1 execute bsm-db --file=./migrations/0003_analytics.sql

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_hash TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT,
  age_group TEXT,
  is_pro INTEGER DEFAULT 0,
  platform TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_hash);
