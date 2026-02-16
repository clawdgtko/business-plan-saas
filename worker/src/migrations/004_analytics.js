// Migration: Analytics events tracking for conversion funnel

export async function up(db) {
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
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);`)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_events_user ON analytics_events(user_id);`)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp);`)
}

export async function down(db) {
  await db.exec(`DROP TABLE IF EXISTS analytics_events;`)
}
