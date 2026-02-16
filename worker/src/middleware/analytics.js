// Analytics Middleware - Track conversion funnel events
import { getCookie, setCookie } from 'hono/cookie'

function getSessionId(c) {
  let sessionId = getCookie(c, 'bp_session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    setCookie(c, 'bp_session', sessionId, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 60 * 60 * 24 * 30 })
  }
  return sessionId
}

export async function trackEvent(c, eventType, eventCategory, properties = {}) {
  try {
    const { DB } = c.env
    const user = c.get('user')
    const sessionId = getSessionId(c)
    
    await DB.prepare(`INSERT INTO analytics_events (id, user_id, session_id, event_type, event_category, properties, pathname, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), user?.userId || null, sessionId, eventType, eventCategory, JSON.stringify(properties), c.req.path, c.req.header('user-agent')?.substring(0, 255) || null)
      .run()
  } catch (err) {
    console.error('Analytics error:', err)
  }
}

export function analyticsMiddleware() {
  return async (c, next) => {
    const start = Date.now()
    await next()
    const duration = Date.now() - start
    
    if (c.res.status >= 200 && c.res.status < 400) {
      const path = c.req.path
      const method = c.req.method
      
      if (path === '/api/auth/verify' && method === 'POST') {
        await trackEvent(c, 'user_signup', 'conversion', { method: 'magic_link', duration })
      }
      if (path === '/api/business-plans' && method === 'POST') {
        await trackEvent(c, 'bp_created', 'conversion', { duration })
      }
      if (path === '/api/stripe/checkout' && method === 'POST') {
        await trackEvent(c, 'checkout_started', 'conversion', { duration })
      }
    }
  }
}
