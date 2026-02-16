// Migration runner pour D1
import initial from './001_initial.js'
import onboarding from './002_onboarding.js'
import guestFunnel from './003_guest_funnel.js'
import analytics from './004_analytics.js'
import uxAnalytics from './005_ux_analytics.js'
import securityRbac from './006_security_rbac.js'

const migrations = [
  { name: '001_initial', ...initial },
  { name: '002_onboarding', ...onboarding },
  { name: '003_guest_funnel', ...guestFunnel },
  { name: '004_analytics', ...analytics },
  { name: '005_ux_analytics', ...uxAnalytics },
  { name: '006_security_rbac', ...securityRbac }
]

export async function runMigrations(db) {
  // Créer la table de migrations si elle n'existe pas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Récupérer les migrations déjà appliquées
  const { results } = await db.prepare('SELECT name FROM migrations').all()
  const appliedMigrations = new Set(results?.map(r => r.name) || [])

  // Appliquer les migrations manquantes
  for (const migration of migrations) {
    if (!appliedMigrations.has(migration.name)) {
      console.log(`Applying migration: ${migration.name}`)
      await migration.up(db)
      await db.prepare('INSERT INTO migrations (name) VALUES (?)').bind(migration.name).run()
      console.log(`Migration ${migration.name} applied successfully`)
    }
  }
}

export { migrations }
export default { runMigrations, migrations }
