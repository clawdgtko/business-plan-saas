// Routes pour le Heatmap Tracking
import { Hono } from 'hono'

const app = new Hono()

// Recevoir les événements de heatmap (batch)
app.post('/events', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { events } = body

  if (!events || !Array.isArray(events) || events.length === 0) {
    return c.json({ error: 'No events provided' }, 400)
  }

  try {
    // Insérer les événements en batch
    const stmt = db.prepare(`
      INSERT INTO heatmap_events (
        session_id,
        event_type,
        x,
        y,
        page_x,
        page_y,
        element,
        element_text,
        element_type,
        scroll_x,
        scroll_y,
        viewport_width,
        viewport_height,
        duration,
        pathname,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)

    // Utiliser batch pour de meilleures performances
    const batch = events.map(event => {
      return stmt.bind(
        event.sessionId,
        event.type,
        event.x || null,
        event.y || null,
        event.pageX || null,
        event.pageY || null,
        event.element || null,
        event.elementText?.substring(0, 100) || null,
        event.elementType || null,
        event.scrollX || null,
        event.scrollY || null,
        event.viewport?.width || null,
        event.viewport?.height || null,
        event.duration || null,
        event.pathname || ''
      )
    })

    await db.batch(batch)

    return c.json({ success: true, count: events.length })
  } catch (error) {
    console.error('Heatmap events error:', error)
    return c.json({ error: 'Failed to save events' }, 500)
  }
})

// Enregistrer les infos de page
app.post('/page', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()

  try {
    await db.prepare(`
      INSERT INTO heatmap_pages (
        session_id,
        url,
        pathname,
        title,
        referrer,
        viewport_width,
        viewport_height,
        screen_width,
        screen_height,
        device_pixel_ratio,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      body.sessionId,
      body.url,
      body.pathname,
      body.title,
      body.referrer,
      body.viewport?.width,
      body.viewport?.height,
      body.screen?.width,
      body.screen?.height,
      body.devicePixelRatio
    ).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Heatmap page error:', error)
    return c.json({ error: 'Failed to save page info' }, 500)
  }
})

// Récupérer les données pour une heatmap
app.get('/data', async (c) => {
  const db = c.env.DB
  const { pathname, limit = '1000' } = c.req.query()

  if (!pathname) {
    return c.json({ error: 'pathname required' }, 400)
  }

  try {
    const { results } = await db.prepare(`
      SELECT 
        session_id,
        event_type,
        x,
        y,
        page_x,
        page_y,
        element,
        element_text,
        scroll_x,
        scroll_y,
        duration,
        viewport_width,
        viewport_height,
        created_at
      FROM heatmap_events
      WHERE pathname = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(pathname, parseInt(limit)).all()

    return c.json({
      pathname,
      events: results,
      count: results.length
    })
  } catch (error) {
    console.error('Heatmap data error:', error)
    return c.json({ error: 'Failed to fetch data' }, 500)
  }
})

// Statistiques de scroll depth
app.get('/scroll-depth', async (c) => {
  const db = c.env.DB
  const { pathname } = c.req.query()

  try {
    let query = `
      SELECT 
        scroll_y,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM heatmap_events
      WHERE event_type = 'scroll'
    `
    const params = []

    if (pathname) {
      query += ' AND pathname = ?'
      params.push(pathname)
    }

    query += ' GROUP BY scroll_y ORDER BY scroll_y'

    const { results } = await db.prepare(query).bind(...params).all()

    // Calculer les pourcentages
    const totalSessions = results.reduce((max, r) => Math.max(max, r.unique_sessions), 0)
    const depthPercentages = results.map(r => ({
      depth: r.scroll_y,
      percentage: Math.round((r.unique_sessions / totalSessions) * 100),
      views: r.views
    }))

    return c.json({
      pathname: pathname || 'all',
      scrollDepth: depthPercentages,
      totalSessions
    })
  } catch (error) {
    console.error('Scroll depth error:', error)
    return c.json({ error: 'Failed to fetch scroll depth' }, 500)
  }
})

// Rapport des clics
app.get('/clicks', async (c) => {
  const db = c.env.DB
  const { pathname } = c.req.query()

  try {
    let query = `
      SELECT 
        element,
        element_text,
        element_type,
        COUNT(*) as clicks,
        AVG(x) as avg_x,
        AVG(y) as avg_y
      FROM heatmap_events
      WHERE event_type = 'click'
    `
    const params = []

    if (pathname) {
      query += ' AND pathname = ?'
      params.push(pathname)
    }

    query += ` 
      GROUP BY element, element_text, element_type
      HAVING clicks > 1
      ORDER BY clicks DESC
      LIMIT 50
    `

    const { results } = await db.prepare(query).bind(...params).all()

    return c.json({
      pathname: pathname || 'all',
      clicks: results
    })
  } catch (error) {
    console.error('Click report error:', error)
    return c.json({ error: 'Failed to fetch click report' }, 500)
  }
})

// Statistiques globales
app.get('/stats', async (c) => {
  const db = c.env.DB

  try {
    // Total des événements
    const { results: eventResults } = await db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM heatmap_events
      GROUP BY event_type
    `).all()

    // Sessions uniques
    const { results: sessionResults } = await db.prepare(`
      SELECT COUNT(DISTINCT session_id) as total_sessions
      FROM heatmap_events
    `).all()

    // Pages les plus trackées
    const { results: pageResults } = await db.prepare(`
      SELECT pathname, COUNT(*) as events
      FROM heatmap_events
      GROUP BY pathname
      ORDER BY events DESC
      LIMIT 10
    `).all()

    // Éléments les plus cliqués
    const { results: clickResults } = await db.prepare(`
      SELECT element, element_type, COUNT(*) as clicks
      FROM heatmap_events
      WHERE event_type = 'click' AND element IS NOT NULL
      GROUP BY element, element_type
      ORDER BY clicks DESC
      LIMIT 10
    `).all()

    return c.json({
      events: eventResults,
      totalSessions: sessionResults[0]?.total_sessions || 0,
      topPages: pageResults,
      topClicks: clickResults
    })
  } catch (error) {
    console.error('Heatmap stats error:', error)
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
})

export default app
