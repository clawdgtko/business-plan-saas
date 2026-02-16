// Routes pour le système A/B Testing - Issue #58
import { Hono } from 'hono'

const app = new Hono()

// Tracker un événement de test
app.post('/track', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  
  const {
    testId,
    variant,
    event,
    sessionId,
    pathname,
    metadata
  } = body

  try {
    await db.prepare(`
      INSERT INTO ab_test_events (
        test_id,
        variant,
        event_type,
        session_id,
        pathname,
        metadata,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      testId,
      variant,
      event,
      sessionId || '',
      pathname || '',
      metadata ? JSON.stringify(metadata) : null
    ).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('A/B test track error:', error)
    return c.json({ error: 'Failed to track event' }, 500)
  }
})

// Récupérer les résultats d'un test
app.get('/results/:testId', async (c) => {
  const db = c.env.DB
  const testId = c.req.param('testId')

  try {
    // Événements par variante
    const { results: variantResults } = await db.prepare(`
      SELECT 
        variant,
        event_type,
        COUNT(*) as count
      FROM ab_test_events
      WHERE test_id = ?
      GROUP BY variant, event_type
    `).bind(testId).all()

    // Sessions uniques par variante
    const { results: sessionResults } = await db.prepare(`
      SELECT 
        variant,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM ab_test_events
      WHERE test_id = ?
      GROUP BY variant
    `).bind(testId).all()

    // Conversions par variante
    const { results: conversionResults } = await db.prepare(`
      SELECT 
        variant,
        COUNT(*) as conversions,
        AVG(json_extract(metadata, '$.value')) as avg_value
      FROM ab_test_events
      WHERE test_id = ? AND event_type = 'conversion'
      GROUP BY variant
    `).bind(testId).all()

    // Calculer les taux de conversion
    const results = {}
    
    sessionResults.forEach(session => {
      if (!results[session.variant]) {
        results[session.variant] = {
          variant: session.variant,
          sessions: session.unique_sessions,
          impressions: 0,
          interactions: 0,
          conversions: 0,
          conversionRate: 0
        }
      }
    })

    variantResults.forEach(event => {
      if (results[event.variant]) {
        if (event.event_type === 'impression') {
          results[event.variant].impressions = event.count
        } else if (event.event_type === 'interaction') {
          results[event.variant].interactions = event.count
        }
      }
    })

    conversionResults.forEach(conv => {
      if (results[conv.variant]) {
        results[conv.variant].conversions = conv.conversions
        results[conv.variant].conversionRate = 
          (conv.conversions / results[conv.variant].sessions * 100).toFixed(2)
      }
    })

    return c.json({
      testId,
      results: Object.values(results),
      summary: {
        totalSessions: sessionResults.reduce((sum, s) => sum + s.unique_sessions, 0),
        totalConversions: conversionResults.reduce((sum, c) => sum + c.conversions, 0)
      }
    })
  } catch (error) {
    console.error('A/B test results error:', error)
    return c.json({ error: 'Failed to fetch results' }, 500)
  }
})

// Liste des tests actifs
app.get('/tests', async (c) => {
  const db = c.env.DB

  try {
    const { results } = await db.prepare(`
      SELECT 
        test_id,
        COUNT(DISTINCT variant) as variants,
        COUNT(*) as total_events,
        MIN(created_at) as started_at,
        MAX(created_at) as last_event
      FROM ab_test_events
      GROUP BY test_id
      ORDER BY last_event DESC
    `).all()

    return c.json({ tests: results })
  } catch (error) {
    console.error('A/B tests list error:', error)
    return c.json({ error: 'Failed to fetch tests' }, 500)
  }
})

export default app
