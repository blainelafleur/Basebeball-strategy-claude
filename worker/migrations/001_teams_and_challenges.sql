-- Sprint C1: Team Code System tables
CREATE TABLE IF NOT EXISTS teams (
  code TEXT PRIMARY KEY,
  team_name TEXT NOT NULL,
  coach_name TEXT NOT NULL,
  coach_pin TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_code TEXT NOT NULL,
  player_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Player',
  games_played INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  correct INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  pos_played TEXT DEFAULT '{}',
  age_group TEXT DEFAULT '11-12',
  concept_data TEXT DEFAULT '{}',
  last_sync INTEGER DEFAULT 0,
  FOREIGN KEY (team_code) REFERENCES teams(code),
  UNIQUE(team_code, player_hash)
);

-- Sprint D3: Challenge a Friend table
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  creator_name TEXT NOT NULL DEFAULT 'Player',
  creator_score INTEGER DEFAULT 0,
  challenger_name TEXT,
  challenger_score INTEGER,
  scenario_ids TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
