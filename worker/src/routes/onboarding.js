// Onboarding Routes - Persists user profile
import { Hono } from 'hono'
import { auth, optionalAuth } from '../middleware/auth.js'
import { guestOnboardingSchema, onboardingSchema, validate } from '../validators/index.js'
import { trackEvent } from '../middleware/analytics.js'

const app = new Hono()

// Submit onboarding data
app.post('/', optionalAuth, async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  let payload

  try {
    payload = await c.req.json()
  } catch (e) {
    return c.json({ error: 'JSON invalide' }, 400)
  }

  if (user) {
    const result = validate(payload, onboardingSchema)
    if (!result.success) {
      return c.json({
        error: 'Validation failed',
        details: result.error
      }, 400)
    }
    const data = result.data
  
    // Update user profile with onboarding data
    await DB.prepare(`
      UPDATE users 
      SET name = ?, company = ?, goal = ?, onboarding_completed = TRUE, updated_at = datetime('now')
      WHERE id = ?
    `).bind(data.name, data.company, data.goal, user.userId).run()
    
    // Track onboarding completion
    await trackEvent(c, 'onboarding_complete', 'conversion', { company: data.company })
  
    // Create default business plan from template
    const bpId = crypto.randomUUID()
    const now = new Date().toISOString()
  
    await DB.prepare(`
      INSERT INTO business_plans (id, user_id, name, data, progress, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      bpId,
      user.userId,
      `Business Plan - ${data.company}`,
      JSON.stringify({
        onboarding: {
          name: data.name,
          company: data.company,
          goal: data.goal,
          completedAt: now
        },
        businessInfo: {},
        market: {},
        financial: {}
      }),
      0,
      now,
      now
    ).run()
    
    // Track BP creation from onboarding
    await trackEvent(c, 'bp_created', 'conversion', { source: 'onboarding' })
  
    return c.json({
      success: true,
      message: 'Onboarding complété',
      businessPlanId: bpId
    }, 201)
  }

  const guestResult = validate(payload, guestOnboardingSchema)
  if (!guestResult.success) {
    return c.json({
      error: 'Validation failed',
      details: guestResult.error
    }, 400)
  }

  const guestData = guestResult.data
  const guestId = crypto.randomUUID()
  const now = new Date().toISOString()
  const email = typeof guestData.email === 'string' ? guestData.email.toLowerCase() : null

  await DB.prepare(`
    INSERT INTO guest_funnel (id, email, data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    guestId,
    email,
    JSON.stringify(guestData),
    now,
    now
  ).run()

  return c.json({
    success: true,
    message: 'Funnel guest sauvegardé',
    guestId
  }, 201)
})

// Get onboarding status
app.get('/status', auth, async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  
  const profile = await DB.prepare(`
    SELECT name, company, goal, onboarding_completed 
    FROM users WHERE id = ?
  `).bind(user.userId).first()
  
  return c.json({
    completed: profile?.onboarding_completed === 1,
    profile: profile || null
  })
})

export default app
