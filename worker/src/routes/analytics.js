// Analytics Routes - Reporting & Funnel Analysis
// Issue #89 - Analytics: Track events conversion funnel

import { Hono } from 'hono'
import { auth } from '../middleware/auth.js'

const app = new Hono()

// Admin middleware - check if user is admin
async function adminOnly(c, next) {
  const user = c.get('user')
  // Simple admin check - in production, use roles
  if (!user?.isAdmin && user?.email !== 'admin@example.com') {
    return c.json({ error: 'Forbidden - Admin only' }, 403)
  }
  await next()
}

// Track client-side events (from frontend)
app.post('/track', async (c) => {
  const { eventType, eventCategory, properties = {} } = await c.req.json()
  const { DB } = c.env
  
  // Get session from cookie
  const cookieHeader = c.req.header('cookie') || ''
  const sessionMatch = cookieHeader.match(/bp_session=([^;]+)/)
  const sessionId = sessionMatch ? sessionMatch[1] : crypto.randomUUID()
  
  try {
    await DB.prepare(`
      INSERT INTO analytics_events 
      (id, user_id, session_id, event_type, event_category, properties, pathname, user_agent, ip_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      null, // Anonymous for client-side tracking
      sessionId,
      eventType,
      eventCategory,
      JSON.stringify(properties),
      properties.pathname || c.req.header('referer') || null,
      c.req.header('user-agent')?.substring(0, 255) || null,
      null
    ).run()
    
    return c.json({ tracked: true })
  } catch (err) {
    console.error('Track error:', err)
    return c.json({ tracked: false, error: 'Failed to track' }, 500)
  }
})

// Get conversion funnel data
app.get('/funnel', auth, adminOnly, async (c) => {
  const { DB } = c.env
  const days = parseInt(c.req.query('days')) || 30
  
  try {
    // Get funnel steps with unique users
    const funnel = await DB.prepare(`
      SELECT 
        event_type,
        event_category,
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT session_id) as unique_sessions,
        DATE(timestamp) as date
      FROM analytics_events
      WHERE timestamp >= datetime('now', '-${days} days')
        AND event_category IN ('conversion', 'funnel')
      GROUP BY event_type, DATE(timestamp)
      ORDER BY date DESC, total_events DESC
    `).all()
    
    // Calculate conversion rates between steps
    const steps = [
      'landing_view',
      'guest_funnel_start',
      'guest_funnel_complete',
      'signup_complete',
      'onboarding_complete',
      'bp_created',
      'checkout_started',
      'subscription_complete'
    ]
    
    // Aggregate totals
    const totals = await DB.prepare(`
      SELECT 
        event_type,
        COUNT(DISTINCT user_id) as unique_users
      FROM analytics_events
      WHERE timestamp >= datetime('now', '-${days} days')
        AND event_category IN ('conversion', 'funnel')
      GROUP BY event_type
    `).all()
    
    const totalsMap = {}
    for (const row of totals.results || []) {
      totalsMap[row.event_type] = row.unique_users
    }
    
    // Calculate conversion rates
    const conversionRates = []
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const current = totalsMap[step] || 0
      const previous = i > 0 ? (totalsMap[steps[i-1]] || 0) : current
      
      conversionRates.push({
        step,
        unique_users: current,
        previous_step: i > 0 ? steps[i-1] : null,
        previous_users: previous,
        conversion_rate: previous > 0 ? ((current / previous) * 100).toFixed(2) : 100,
        overall_rate: totalsMap[steps[0]] > 0 
          ? ((current / totalsMap[steps[0]]) * 100).toFixed(2) 
          : 0
      })
    }
    
    return c.json({
      period: `${days} days`,
      funnel_steps: conversionRates,
      daily_breakdown: funnel.results || [],
      totals: totalsMap
    })
  } catch (err) {
    console.error('Funnel error:', err)
    return c.json({ error: 'Failed to fetch funnel data' }, 500)
  }
})

// Get dashboard metrics
app.get('/dashboard', auth, adminOnly, async (c) => {
  const { DB } = c.env
  
  try {
    // Today's stats
    const today = await DB.prepare(`
      SELECT 
        COUNT(DISTINCT CASE WHEN event_type = 'user_signup' THEN user_id END) as signups_today,
        COUNT(DISTINCT CASE WHEN event_type = 'bp_created' THEN user_id END) as bp_created_today,
        COUNT(DISTINCT CASE WHEN event_type = 'checkout_started' THEN user_id END) as checkouts_today,
        COUNT(DISTINCT CASE WHEN event_type = 'subscription_complete' THEN user_id END) as subscriptions_today,
        COUNT(DISTINCT session_id) as unique_sessions_today
      FROM analytics_events
      WHERE DATE(timestamp) = DATE('now')
    `).first()
    
    // Last 7 days
    const last7Days = await DB.prepare(`
      SELECT 
        COUNT(DISTINCT CASE WHEN event_type = 'user_signup' THEN user_id END) as signups_7d,
        COUNT(DISTINCT CASE WHEN event_type = 'bp_created' THEN user_id END) as bp_created_7d,
        COUNT(DISTINCT CASE WHEN event_type = 'subscription_complete' THEN user_id END) as subscriptions_7d
      FROM analytics_events
      WHERE timestamp >= datetime('now', '-7 days')
    `).first()
    
    // Top events
    const topEvents = await DB.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM analytics_events
      WHERE timestamp >= datetime('now', '-7 days')
      GROUP BY event_type
      ORDER BY count DESC
      LIMIT 10
    `).all()
    
    return c.json({
      today: {
        signups: today?.signups_today || 0,
        businessPlansCreated: today?.bp_created_today || 0,
        checkoutsStarted: today?.checkouts_today || 0,
        subscriptions: today?.subscriptions_today || 0,
        uniqueSessions: today?.unique_sessions_today || 0
      },
      last7Days: {
        signups: last7Days?.signups_7d || 0,
        businessPlansCreated: last7Days?.bp_created_7d || 0,
        subscriptions: last7Days?.subscriptions_7d || 0
      },
      topEvents: topEvents.results || []
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    return c.json({ error: 'Failed to fetch dashboard data' }, 500)
  }
})

// Get recent events (for debugging)
app.get('/events', auth, adminOnly, async (c) => {
  const { DB } = c.env
  const limit = parseInt(c.req.query('limit')) || 50
  const offset = parseInt(c.req.query('offset')) || 0
  const eventType = c.req.query('type')
  
  try {
    let query = `
      SELECT 
        id,
        user_id,
        event_type,
        event_category,
        properties,
        pathname,
        timestamp
      FROM analytics_events
      WHERE 1=1
    `
    const params = []
    
    if (eventType) {
      query += ` AND event_type = ?`
      params.push(eventType)
    }
    
    query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)
    
    const events = await DB.prepare(query).bind(...params).all()
    
    return c.json({
      events: (events.results || []).map(e => ({
        ...e,
        properties: JSON.parse(e.properties || '{}')
      })),
      limit,
      offset
    })
  } catch (err) {
    console.error('Events error:', err)
    return c.json({ error: 'Failed to fetch events' }, 500)
  }
})

export default app
