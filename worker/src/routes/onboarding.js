// Onboarding Routes - Persists user profile
import { Hono } from 'hono'
import { auth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validation.js'
import { onboardingSchema } from '../validators/index.js'

const app = new Hono()

// Submit onboarding data
app.post('/', auth, validateBody(onboardingSchema), async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const data = c.get('validatedData')
  
  // Update user profile with onboarding data
  await DB.prepare(`
    UPDATE users 
    SET name = ?, company = ?, goal = ?, onboarding_completed = TRUE, updated_at = datetime('now')
    WHERE id = ?
  `).bind(data.name, data.company, data.goal, user.userId).run()
  
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
  
  return c.json({
    success: true,
    message: 'Onboarding complété',
    businessPlanId: bpId
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
