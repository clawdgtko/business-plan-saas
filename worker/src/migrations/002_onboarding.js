// Migration: Add onboarding fields to users table

export async function up(db) {
  // Add columns to users table
  await db.exec(`
    ALTER TABLE users ADD COLUMN name TEXT;
  `)
  await db.exec(`
    ALTER TABLE users ADD COLUMN company TEXT;
  `)
  await db.exec(`
    ALTER TABLE users ADD COLUMN goal TEXT;
  `)
  await db.exec(`
    ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  `)
  
  // Create index for onboarding queries
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);
  `)
}

export async function down(db) {
  // SQLite doesn't support DROP COLUMN, would need table recreation
  // For now, just leave columns (no data loss)
  console.log('Migration 002: Down not supported for SQLite ALTER TABLE')
}
