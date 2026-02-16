// Analytics Routes - Reporting & Funnel Analysis
import { Hono } from 'hono'
import { auth } from '../middleware/auth.js'

const app = new Hono()

async function adminOnly(c, next) {
  const user = c.get('user')
  if (!user?.isAdmin && user?.email !== 'admin@example.com') {
    return c.json({ error: 'Forbidden' }, 403)
  }
  await next()
}

app.post('/track', async (c) => {
  const { eventType, eventCategory, properties = {} } = await c.req.json()
  const { DB } = c.env
  const sessionId = crypto.randomUUID()
  
  try {
    await DB.prepare(`INSERT INTO analytics_events (id, session_id, event_type, event_category, properties, pathname) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), sessionId, eventType, eventCategory, JSON.stringify(properties), properties.pathname || null)
      .run()
    return c.json({ tracked: true })
  } catch (err) {
    return c.json({ tracked: false }, 500)
  }
})

app.get('/funnel', auth, adminOnly, async (c) => {
  const { DB } = c.env
  const days = parseInt(c.req.query('days')) || 30
  
  const steps = ['user_signup', 'bp_created', 'checkout_started', 'subscription_complete']
  const results = []
  
  for (const step of steps) {
    const result = await DB.prepare(`SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE event_type = ? AND timestamp >= datetime('now', '-${days} days')`).bind(step).first()
    results.push({ step, count: result?.count || 0 })
  }
  
  return c.json({ period: `${days} days`, funnel: results })
})

app.get('/dashboard', auth, adminOnly, async (c) => {
  const { DB } = c.env
  
  const today = await DB.prepare(`
    SELECT 
      COUNT(DISTINCT CASE WHEN event_type = 'user_signup' THEN user_id END) as signups,
      COUNT(DISTINCT CASE WHEN event_type = 'bp_created' THEN user_id END) as bp_created,
      COUNT(DISTINCT CASE WHEN event_type = 'subscription_complete' THEN user_id END) as subscriptions
    FROM analytics_events WHERE DATE(timestamp) = DATE('now')
  `).first()
  
  return c.json({ today: { signups: today?.signups || 0, bpCreated: today?.bp_created || 0, subscriptions: today?.subscriptions || 0 } })
})

export default app
