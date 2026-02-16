// Database schema migrations for D1

export async function up(db) {
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Business plans table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS business_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      data TEXT NOT NULL, -- JSON string
      progress INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // Subscriptions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      status TEXT DEFAULT 'inactive',
      plan TEXT DEFAULT 'free',
      current_period_start DATETIME,
      current_period_end DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // Magic links table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS magic_links (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Indexes
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_bp_user_id ON business_plans(user_id);`)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_sub_user_id ON subscriptions(user_id);`)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_magic_email ON magic_links(email);`)
}

export async function down(db) {
  await db.exec(`DROP TABLE IF EXISTS magic_links;`)
  await db.exec(`DROP TABLE IF EXISTS subscriptions;`)
  await db.exec(`DROP TABLE IF EXISTS business_plans;`)
  await db.exec(`DROP TABLE IF EXISTS users;`)
}