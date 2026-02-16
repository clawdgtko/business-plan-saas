// Analytics Event Tracking API
// Mission #88 - Analytics Tracking
// Supports: page_views, button_clicks, funnel_steps
// Features: Batch insert for performance

import { Hono } from 'hono'
import { z } from 'zod'
import { validateBody } from '../validators/index.js'

const app = new Hono()

// Validation schemas
const EventTypeEnum = z.enum([
  'page_view',
  'button_click', 
  'funnel_step',
  'form_submit',
  'error',
  'custom'
])

const FunnelStepEnum = z.enum([
  'landing_view',
  'guest_funnel_start',
  'guest_funnel_complete',
  'signup_start',
  'signup_complete',
  'onboarding_start',
  'onboarding_complete',
  'bp_created',
  'bp_edited',
  'checkout_started',
  'checkout_completed',
  'subscription_complete',
  'subscription_cancelled'
])

const singleEventSchema = z.object({
  event_type: EventTypeEnum,
  user_id: z.string().uuid().optional().nullable(),
  session_id: z.string().min(1).max(255),
  metadata: z.record(z.any()).optional().default({}),
  timestamp: z.string().datetime().optional(),
  // Event-specific fields
  page_url: z.string().url().optional().nullable(),
  page_path: z.string().max(500).optional().nullable(),
  button_id: z.string().max(255).optional().nullable(),
  button_text: z.string().max(255).optional().nullable(),
  funnel_step: FunnelStepEnum.optional().nullable(),
  funnel_name: z.string().max(255).optional().nullable(),
  // Context
  user_agent: z.string().max(500).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  ip_hash: z.string().max(64).optional().nullable()
})

const batchEventSchema = z.object({
  events: z.array(singleEventSchema).min(1).max(100), // Max 100 events per batch
  batch_metadata: z.record(z.any()).optional()
})

/**
 * POST /analytics/event
 * Track a single analytics event
 * Body: { event_type, session_id, user_id?, metadata?, ... }
 */
app.post('/event', validateBody(singleEventSchema), async (c) => {
  const { DB } = c.env
  const eventData = c.get('validatedBody')
  
  try {
    const eventId = crypto.randomUUID()
    const timestamp = eventData.timestamp || new Date().toISOString()
    
    // Enrich metadata with context
    const enrichedMetadata = {
      ...eventData.metadata,
      ...(eventData.page_url && { page_url: eventData.page_url }),
      ...(eventData.page_path && { page_path: eventData.page_path }),
      ...(eventData.button_id && { button_id: eventData.button_id }),
      ...(eventData.button_text && { button_text: eventData.button_text }),
      ...(eventData.funnel_step && { funnel_step: eventData.funnel_step }),
      ...(eventData.funnel_name && { funnel_name: eventData.funnel_name }),
      ...(eventData.referrer && { referrer: eventData.referrer })
    }
    
    await DB.prepare(`
      INSERT INTO analytics_events 
      (id, user_id, session_id, event_type, event_category, properties, pathname, user_agent, ip_hash, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      eventId,
      eventData.user_id || null,
      eventData.session_id,
      eventData.event_type,
      getEventCategory(eventData.event_type),
      JSON.stringify(enrichedMetadata),
      eventData.page_path || eventData.page_url || null,
      eventData.user_agent?.substring(0, 255) || c.req.header('user-agent')?.substring(0, 255) || null,
      eventData.ip_hash || await hashIp(c.req.header('cf-connecting-ip') || 'unknown'),
      timestamp
    ).run()
    
    return c.json({
      success: true,
      event_id: eventId,
      tracked: true
    }, 201)
    
  } catch (err) {
    console.error('Analytics track error:', err)
    return c.json({
      success: false,
      error: 'Failed to track event',
      tracked: false
    }, 500)
  }
})

/**
 * POST /analytics/event/batch
 * Track multiple events in a single request (performance optimization)
 * Body: { events: [...], batch_metadata? }
 */
app.post('/event/batch', validateBody(batchEventSchema), async (c) => {
  const { DB } = c.env
  const { events, batch_metadata } = c.get('validatedBody')
  
  try {
    const results = []
    const errors = []
    
    // Use transaction for batch insert
    await DB.exec('BEGIN TRANSACTION')
    
    try {
      for (const eventData of events) {
        try {
          const eventId = crypto.randomUUID()
          const timestamp = eventData.timestamp || new Date().toISOString()
          
          // Enrich metadata
          const enrichedMetadata = {
            ...eventData.metadata,
            ...(eventData.page_url && { page_url: eventData.page_url }),
            ...(eventData.page_path && { page_path: eventData.page_path }),
            ...(eventData.button_id && { button_id: eventData.button_id }),
            ...(eventData.button_text && { button_text: eventData.button_text }),
            ...(eventData.funnel_step && { funnel_step: eventData.funnel_step }),
            ...(eventData.funnel_name && { funnel_name: eventData.funnel_name }),
            ...(eventData.referrer && { referrer: eventData.referrer }),
            ...(batch_metadata && { batch_context: batch_metadata })
          }
          
          await DB.prepare(`
            INSERT INTO analytics_events 
            (id, user_id, session_id, event_type, event_category, properties, pathname, user_agent, ip_hash, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            eventId,
            eventData.user_id || null,
            eventData.session_id,
            eventData.event_type,
            getEventCategory(eventData.event_type),
            JSON.stringify(enrichedMetadata),
            eventData.page_path || eventData.page_url || null,
            eventData.user_agent?.substring(0, 255) || c.req.header('user-agent')?.substring(0, 255) || null,
            eventData.ip_hash || await hashIp(c.req.header('cf-connecting-ip') || 'unknown'),
            timestamp
          ).run()
          
          results.push({ event_id: eventId, status: 'success' })
          
        } catch (eventErr) {
          errors.push({
            event: eventData.event_type,
            error: eventErr.message
          })
        }
      }
      
      await DB.exec('COMMIT')
      
    } catch (txErr) {
      await DB.exec('ROLLBACK')
      throw txErr
    }
    
    return c.json({
      success: errors.length === 0,
      tracked_count: results.length,
      failed_count: errors.length,
      event_ids: results.map(r => r.event_id),
      errors: errors.length > 0 ? errors : undefined
    }, errors.length > 0 ? 207 : 201) // 207 Multi-Status if partial success
    
  } catch (err) {
    console.error('Batch analytics error:', err)
    return c.json({
      success: false,
      error: 'Failed to track batch events',
      tracked_count: 0
    }, 500)
  }
})

/**
 * GET /analytics/event/types
 * Get available event types and funnel steps
 */
app.get('/event/types', async (c) => {
  return c.json({
    event_types: EventTypeEnum.options,
    funnel_steps: FunnelStepEnum.options,
    categories: ['page_view', 'interaction', 'conversion', 'funnel', 'error', 'custom']
  })
})

/**
 * GET /analytics/event/stats
 * Quick stats for events (admin only)
 */
app.get('/event/stats', async (c) => {
  const { DB } = c.env
  const hours = parseInt(c.req.query('hours')) || 24
  
  try {
    // Event counts by type
    const byType = await DB.prepare(`
      SELECT 
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(DISTINCT user_id) as unique_users
      FROM analytics_events
      WHERE timestamp >= datetime('now', '-${hours} hours')
      GROUP BY event_type
      ORDER BY count DESC
    `).all()
    
    // Funnel step progression
    const funnelSteps = await DB.prepare(`
      SELECT 
        json_extract(properties, '$.funnel_step') as step,
        COUNT(*) as count,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM analytics_events
      WHERE event_type = 'funnel_step'
        AND timestamp >= datetime('now', '-${hours} hours')
      GROUP BY step
      ORDER BY count DESC
    `).all()
    
    // Page views by path
    const pageViews = await DB.prepare(`
      SELECT 
        pathname,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND timestamp >= datetime('now', '-${hours} hours')
      GROUP BY pathname
      ORDER BY views DESC
      LIMIT 20
    `).all()
    
    // Button clicks
    const buttonClicks = await DB.prepare(`
      SELECT 
        json_extract(properties, '$.button_id') as button_id,
        json_extract(properties, '$.button_text') as button_text,
        COUNT(*) as clicks,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM analytics_events
      WHERE event_type = 'button_click'
        AND timestamp >= datetime('now', '-${hours} hours')
      GROUP BY button_id
      ORDER BY clicks DESC
      LIMIT 20
    `).all()
    
    return c.json({
      period: `${hours} hours`,
      summary: {
        total_events: byType.results?.reduce((sum, r) => sum + r.count, 0) || 0,
        by_type: byType.results || [],
        funnel_progression: funnelSteps.results || [],
        top_pages: pageViews.results || [],
        top_buttons: buttonClicks.results || []
      }
    })
    
  } catch (err) {
    console.error('Stats error:', err)
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
})

// Helper functions
function getEventCategory(eventType) {
  const categoryMap = {
    'page_view': 'page_view',
    'button_click': 'interaction',
    'funnel_step': 'funnel',
    'form_submit': 'conversion',
    'error': 'error',
    'custom': 'custom'
  }
  return categoryMap[eventType] || 'custom'
}

async function hashIp(ip) {
  // Simple hash for privacy - in production use a proper hash
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + 'salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}

export default app
