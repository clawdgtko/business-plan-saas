/**
 * Migration 006: Security - Users & RBAC
 * 
 * Adds tables for:
 * - User authentication
 * - Role-based access control
 * - Audit logging
 */

export async function up(db) {
  // Users table with authentication
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      roles TEXT DEFAULT '["user"]',
      is_active INTEGER DEFAULT 1,
      email_verified INTEGER DEFAULT 0,
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create index on email
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // Audit log for security events
  await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      resource TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Index for audit log queries
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
  `);

  // API keys table for service-to-service auth
  await db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      scopes TEXT DEFAULT '["read"]',
      created_by TEXT,
      expires_at TEXT,
      last_used_at TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  console.log('✅ Migration 006: Security tables created');
}

export async function down(db) {
  await db.exec('DROP TABLE IF EXISTS api_keys;');
  await db.exec('DROP TABLE IF EXISTS audit_log;');
  await db.exec('DROP TABLE IF EXISTS users;');
  
  console.log('⏪ Migration 006: Security tables dropped');
}