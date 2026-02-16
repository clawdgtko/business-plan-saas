// Migration: Store guest funnel submissions

export async function up(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS guest_funnel (
      id TEXT PRIMARY KEY,
      email TEXT,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_guest_funnel_email ON guest_funnel(email);
  `)
}

export async function down(db) {
  await db.exec(`DROP TABLE IF EXISTS guest_funnel;`)
}
