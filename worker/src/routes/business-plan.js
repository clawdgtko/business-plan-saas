// Business Plan Routes - CRUD + Funnel
import { Hono } from 'hono'
import { auth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validation.js'
import { createBusinessPlanSchema } from '../validators/index.js'

const app = new Hono()

// All routes require auth
app.use('*', auth)

// List all business plans for user
app.get('/', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  
  const plans = await DB.prepare(
    'SELECT * FROM business_plans WHERE user_id = ? ORDER BY updated_at DESC'
  ).bind(user.userId).all()
  
  return c.json({
    businessPlans: plans.results || []
  })
})

// Create new business plan
app.post('/', validateBody(createBusinessPlanSchema), async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const data = c.get('validatedData')
  
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  await DB.prepare(
    'INSERT INTO business_plans (id, user_id, name, data, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id,
    user.userId,
    data.name || 'Mon Business Plan',
    JSON.stringify({}),
    0,
    now,
    now
  ).run()
  
  return c.json({
    id,
    name: data.name || 'Mon Business Plan',
    status: 'created',
    createdAt: now
  }, 201)
})

// Get single business plan
app.get('/:id', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const id = c.req.param('id')
  
  const plan = await DB.prepare(
    'SELECT * FROM business_plans WHERE id = ? AND user_id = ?'
  ).bind(id, user.userId).first()
  
  if (!plan) {
    return c.json({ error: 'Business plan non trouvé' }, 404)
  }
  
  return c.json({
    id: plan.id,
    name: plan.name,
    status: plan.status,
    progress: plan.progress,
    data: JSON.parse(plan.data || '{}'),
    createdAt: plan.created_at,
    updatedAt: plan.updated_at
  })
})

// Update business plan section
app.put('/:id/:section', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const { id, section } = c.req.params
  const data = await c.req.json()
  
  // Get existing plan
  const plan = await DB.prepare(
    'SELECT * FROM business_plans WHERE id = ? AND user_id = ?'
  ).bind(id, user.userId).first()
  
  if (!plan) {
    return c.json({ error: 'Business plan non trouvé' }, 404)
  }
  
  // Merge data
  const existingData = JSON.parse(plan.data || '{}')
  existingData[section] = data
  
  // Calculate progress (simplified)
  const sections = ['businessInfo', 'market', 'financial']
  const completedSections = sections.filter(s => existingData[s] && Object.keys(existingData[s]).length > 0).length
  const progress = Math.round((completedSections / sections.length) * 100)
  
  const now = new Date().toISOString()
  
  await DB.prepare(
    'UPDATE business_plans SET data = ?, progress = ?, updated_at = ? WHERE id = ?'
  ).bind(JSON.stringify(existingData), progress, now, id).run()
  
  return c.json({
    id,
    section,
    progress,
    updated: true
  })
})

// Delete business plan
app.delete('/:id', async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  const id = c.req.param('id')
  
  const result = await DB.prepare(
    'DELETE FROM business_plans WHERE id = ? AND user_id = ?'
  ).bind(id, user.userId).run()
  
  if (result.changes === 0) {
    return c.json({ error: 'Business plan non trouvé' }, 404)
  }
  
  return c.json({ deleted: true, id })
})

export default app