// Migration: Feedback, A/B Testing, and Heatmap tables
// Issue #58, #59, #60

export async function up(db) {
  // Table pour le feedback utilisateur
  await db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'general',
      rating INTEGER,
      message TEXT,
      pathname TEXT NOT NULL,
      user_agent TEXT,
      screen_size TEXT,
      session_duration INTEGER DEFAULT 0,
      page_context TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Index pour les requêtes courantes sur feedback
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
    CREATE INDEX IF NOT EXISTS idx_feedback_pathname ON feedback(pathname);
    CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
  `)

  // Table pour les événements A/B testing
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ab_test_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id TEXT NOT NULL,
      variant TEXT NOT NULL,
      event_type TEXT NOT NULL,
      session_id TEXT NOT NULL,
      pathname TEXT,
      metadata TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Index pour A/B testing
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_ab_test_test_id ON ab_test_events(test_id);
    CREATE INDEX IF NOT EXISTS idx_ab_test_session ON ab_test_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_ab_test_variant ON ab_test_events(variant);
    CREATE INDEX IF NOT EXISTS idx_ab_test_event_type ON ab_test_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_ab_test_created_at ON ab_test_events(created_at);
  `)

  // Table pour les événements heatmap
  await db.exec(`
    CREATE TABLE IF NOT EXISTS heatmap_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      x INTEGER,
      y INTEGER,
      page_x INTEGER,
      page_y INTEGER,
      element TEXT,
      element_text TEXT,
      element_type TEXT,
      scroll_x INTEGER,
      scroll_y INTEGER,
      viewport_width INTEGER,
      viewport_height INTEGER,
      duration INTEGER,
      pathname TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Index pour heatmap
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_heatmap_session ON heatmap_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_heatmap_pathname ON heatmap_events(pathname);
    CREATE INDEX IF NOT EXISTS idx_heatmap_event_type ON heatmap_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_heatmap_element ON heatmap_events(element);
    CREATE INDEX IF NOT EXISTS idx_heatmap_created_at ON heatmap_events(created_at);
  `)

  // Table pour les infos de page heatmap
  await db.exec(`
    CREATE TABLE IF NOT EXISTS heatmap_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      url TEXT NOT NULL,
      pathname TEXT NOT NULL,
      title TEXT,
      referrer TEXT,
      viewport_width INTEGER,
      viewport_height INTEGER,
      screen_width INTEGER,
      screen_height INTEGER,
      device_pixel_ratio REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_heatmap_pages_session ON heatmap_pages(session_id);
    CREATE INDEX IF NOT EXISTS idx_heatmap_pages_pathname ON heatmap_pages(pathname);
  `)

  // Table pour les rapports d'onboarding
  await db.exec(`
    CREATE TABLE IF NOT EXISTS onboarding_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL UNIQUE,
      user_id INTEGER,
      started_at DATETIME,
      completed_at DATETIME,
      total_time_spent INTEGER,
      steps_completed INTEGER DEFAULT 0,
      dropoff_step TEXT,
      report_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_onboarding_session ON onboarding_reports(session_id);
    CREATE INDEX IF NOT EXISTS idx_onboarding_user ON onboarding_reports(user_id);
  `)
}

export async function down(db) {
  await db.exec(`
    DROP TABLE IF EXISTS feedback;
    DROP TABLE IF EXISTS ab_test_events;
    DROP TABLE IF EXISTS heatmap_events;
    DROP TABLE IF EXISTS heatmap_pages;
    DROP TABLE IF EXISTS onboarding_reports;
  `)
}

export default { up, down }
