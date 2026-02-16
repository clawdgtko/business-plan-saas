// Routes pour le système de feedback - Issue #59
import { Hono } from 'hono'

const app = new Hono()

// Soumettre un feedback
app.post('/', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  
  const {
    type = 'general',
    rating,
    message,
    pageContext,
    pathname,
    userAgent,
    screenSize,
    sessionDuration
  } = body

  try {
    // Insérer dans la base de données
    await db.prepare(`
      INSERT INTO feedback (
        type,
        rating,
        message,
        pathname,
        user_agent,
        screen_size,
        session_duration,
        page_context,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      type,
      rating || null,
      message || null,
      pathname || '',
      userAgent || '',
      screenSize || '',
      sessionDuration || 0,
      pageContext ? JSON.stringify(pageContext) : null
    ).run()

    return c.json({ success: true, message: 'Feedback enregistré' })
  } catch (error) {
    console.error('Feedback error:', error)
    return c.json({ error: 'Failed to save feedback' }, 500)
  }
})

// Récupérer les feedbacks (admin uniquement)
app.get('/', async (c) => {
  const db = c.env.DB
  const { type, limit = '50', offset = '0' } = c.req.query()

  try {
    let query = 'SELECT * FROM feedback'
    const params = []
    
    if (type) {
      query += ' WHERE type = ?'
      params.push(type)
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), parseInt(offset))

    const { results } = await db.prepare(query).bind(...params).all()
    
    return c.json({
      feedbacks: results,
      pagination: { limit, offset }
    })
  } catch (error) {
    console.error('Get feedbacks error:', error)
    return c.json({ error: 'Failed to fetch feedbacks' }, 500)
  }
})

// Récupérer les statistiques de feedback
app.get('/stats', async (c) => {
  const db = c.env.DB

  try {
    // NPS Score
    const { results: npsResults } = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating <= 6 THEN 1 ELSE 0 END) as detractors,
        SUM(CASE WHEN rating BETWEEN 7 AND 8 THEN 1 ELSE 0 END) as passives,
        SUM(CASE WHEN rating >= 9 THEN 1 ELSE 0 END) as promoters
      FROM feedback 
      WHERE type = 'nps' AND rating IS NOT NULL
    `).all()

    // Feedback par type
    const { results: typeResults } = await db.prepare(`
      SELECT type, COUNT(*) as count
      FROM feedback
      GROUP BY type
      ORDER BY count DESC
    `).all()

    // Satisfaction moyenne par page
    const { results: pageResults } = await db.prepare(`
      SELECT pathname, AVG(rating) as avg_rating, COUNT(*) as count
      FROM feedback
      WHERE rating IS NOT NULL
      GROUP BY pathname
      ORDER BY count DESC
      LIMIT 10
    `).all()

    const nps = npsResults[0] || {}
    const npsScore = nps.total > 0 
      ? Math.round(((nps.promoters / nps.total) - (nps.detractors / nps.total)) * 100)
      : 0

    return c.json({
      nps: {
        score: npsScore,
        total: nps.total || 0,
        detractors: nps.detractors || 0,
        passives: nps.passives || 0,
        promoters: nps.promoters || 0
      },
      byType: typeResults,
      byPage: pageResults
    })
  } catch (error) {
    console.error('Feedback stats error:', error)
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
})

export default app
