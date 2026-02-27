-- Sprint 4.4: Error monitoring
-- Run: npx wrangler d1 execute bsm-db --file=./migrations/0004_error_logs.sql

CREATE TABLE IF NOT EXISTS error_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_type TEXT NOT NULL,
  error_message TEXT,
  error_context TEXT,
  session_hash TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_errors_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_date ON error_logs(created_at);
