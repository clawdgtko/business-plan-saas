// Migration: Analytics events tracking for conversion funnel

export async function up(db) {
  // Create events table for tracking user actions
  await db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      session_id TEXT,
      event_type TEXT NOT NULL,
      event_category TEXT NOT NULL,
      properties TEXT,
      pathname TEXT,
      user_agent TEXT,
      ip_hash TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)

  // Create indexes for common queries
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
  `)
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_category ON analytics_events(event_category);
  `)
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_user ON analytics_events(user_id);
  `)
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp);
  `)
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_funnel ON analytics_events(event_category, event_type, timestamp);
  `)

  // Create funnel summary table (aggregated data for fast queries)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS funnel_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      step TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      unique_users INTEGER DEFAULT 0,
      conversion_rate REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, step)
    );
  `)

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_funnel_date ON funnel_summary(date);
  `)
}

export async function down(db) {
  await db.exec(`DROP TABLE IF EXISTS analytics_events;`)
  await db.exec(`DROP TABLE IF EXISTS funnel_summary;`)
}
