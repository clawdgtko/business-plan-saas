// Business Plan Routes - CRUD + Funnel
import { Hono } from 'hono'

const app = new Hono()

// List all business plans for user
app.get('/', async (c) => {
  const { DB } = c.env
  
  // TODO: Get userId from auth
  const userId = 'demo-user'
  
  // const plans = await DB.prepare(
  //   'SELECT * FROM business_plans WHERE user_id = ? ORDER BY updated_at DESC'
  // ).bind(userId).all()
  
  return c.json({
    businessPlans: [
      { id: 'bp-1', name: 'Mon Startup', progress: 45, status: 'draft' }
    ]
  })
})

// Create new business plan
app.post('/', async (c) => {
  const data = await c.req.json()
  
  return c.json({
    id: 'bp-new',
    name: data.name,
    status: 'created',
    createdAt: new Date().toISOString()
  }, 201)
})

// Get single business plan
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  return c.json({
    id,
    name: 'Mon Startup',
    sections: {
      businessInfo: { completed: true },
      market: { completed: false },
      financial: { completed: false }
    }
  })
})

// Update business plan section
app.put('/:id/:section', async (c) => {
  const { id, section } = c.req.params
  const data = await c.req.json()
  
  return c.json({
    id,
    section,
    updated: true,
    data
  })
})

// Delete business plan
app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  
  return c.json({ deleted: true, id })
})

export default app