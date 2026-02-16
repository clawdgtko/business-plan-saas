// Analytics Middleware - Track conversion funnel events
// Issue #89 - Analytics: Track events conversion funnel

import { getCookie, setCookie } from 'hono/cookie'

// Generate or get session ID
function getSessionId(c) {
  let sessionId = getCookie(c, 'bp_session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    setCookie(c, 'bp_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
  }
  return sessionId
}

// Hash IP for privacy (not storing raw IPs)
async function hashIp(ip) {
  if (!ip) return null
  const encoder = new TextEncoder()
  const data = encoder.encode(ip)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}

// Track event to database
export async function trackEvent(c, eventType, eventCategory, properties = {}) {
  try {
    const { DB } = c.env
    const user = c.get('user')
    const sessionId = getSessionId(c)
    const ipHash = await hashIp(c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'))
    
    await DB.prepare(`
      INSERT INTO analytics_events 
      (id, user_id, session_id, event_type, event_category, properties, pathname, user_agent, ip_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      user?.userId || null,
      sessionId,
      eventType,
      eventCategory,
      JSON.stringify(properties),
      c.req.path,
      c.req.header('user-agent')?.substring(0, 255) || null,
      ipHash
    ).run()
  } catch (err) {
    // Silently fail - don't break user experience for analytics
    console.error('Analytics track error:', err)
  }
}

// Middleware to track API calls automatically
export function analyticsMiddleware() {
  return async (c, next) => {
    const start = Date.now()
    
    // Track specific conversion events based on route
    const path = c.req.path
    const method = c.req.method
    
    // Process request first
    await next()
    
    // Then track (so we have response status)
    const duration = Date.now() - start
    const status = c.res.status
    
    // Track conversion funnel events
    if (status >= 200 && status < 400) {
      // Successful auth = signup/login
      if (path === '/api/auth/verify' && method === 'POST') {
        await trackEvent(c, 'user_signup', 'conversion', { method: 'magic_link', duration })
      }
      
      // Business plan created
      if (path === '/api/business-plans' && method === 'POST') {
        await trackEvent(c, 'bp_created', 'conversion', { duration })
      }
      
      // Stripe checkout initiated
      if (path === '/api/stripe/checkout' && method === 'POST') {
        await trackEvent(c, 'checkout_started', 'conversion', { duration })
      }
      
      // Subscription created (webhook will track this too)
      if (path === '/api/stripe/webhook' && method === 'POST') {
        // Webhook handles this separately
      }
    }
  }
}

// Predefined event types for consistency
export const AnalyticsEvents = {
  // Conversion funnel
  FUNNEL: {
    LANDING_VIEW: { type: 'landing_view', category: 'funnel' },
    GUEST_FUNNEL_START: { type: 'guest_funnel_start', category: 'funnel' },
    GUEST_FUNNEL_COMPLETE: { type: 'guest_funnel_complete', category: 'funnel' },
    SIGNUP_START: { type: 'signup_start', category: 'conversion' },
    SIGNUP_COMPLETE: { type: 'signup_complete', category: 'conversion' },
    ONBOARDING_START: { type: 'onboarding_start', category: 'conversion' },
    ONBOARDING_COMPLETE: { type: 'onboarding_complete', category: 'conversion' },
    BP_CREATE: { type: 'bp_created', category: 'conversion' },
    BP_EDIT: { type: 'bp_edit', category: 'engagement' },
    CHECKOUT_START: { type: 'checkout_started', category: 'conversion' },
    SUBSCRIPTION_COMPLETE: { type: 'subscription_complete', category: 'conversion' },
    PDF_DOWNLOAD: { type: 'pdf_download', category: 'engagement' },
  }
}

export default { trackEvent, analyticsMiddleware, AnalyticsEvents }
