// Business Plan Routes - CRUD + Funnel avec OpenTelemetry
import { Hono } from 'hono'

const app = new Hono()

// List all business plans for user
app.get('/', async (c) => {
  const { DB } = c.env
  const logger = c.get('logger')
  const userId = 'demo-user' // TODO: Get from auth
  
  logger.debug('Listing business plans', { userId });
  
  const plans = await DB.prepare(
    'SELECT * FROM business_plans WHERE user_id = ? ORDER BY updated_at DESC'
  ).bind(userId).all()
  
  logger.info('Business plans retrieved', { 
    userId, 
    count: plans.results?.length || 0 
  });
  
  return c.json({
    businessPlans: plans.results || []
  })
})

// Create new business plan
app.post('/', async (c) => {
  const data = await c.req.json()
  const { DB } = c.env
  const logger = c.get('logger')
  const userId = 'demo-user' // TODO: Get from auth
  
  logger.info('Creating business plan', { 
    userId, 
    name: data.name 
  });
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await DB.prepare(`
    INSERT INTO business_plans (id, user_id, name, status, progress, created_at, updated_at)
    VALUES (?, ?, ?, 'draft', 0, ?, ?)
  `).bind(id, userId, data.name, now, now).run();
  
  logger.info('Business plan created', { 
    userId, 
    planId: id,
    name: data.name
  });
  
  return c.json({
    id,
    name: data.name,
    status: 'draft',
    progress: 0,
    createdAt: now
  }, 201)
})

// Get single business plan
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const { DB } = c.env
  const logger = c.get('logger')
  
  logger.debug('Fetching business plan', { planId: id });
  
  const plan = await DB.prepare(
    'SELECT * FROM business_plans WHERE id = ?'
  ).bind(id).first();
  
  if (!plan) {
    logger.warn('Business plan not found', { planId: id });
    return c.json({ error: 'Business plan not found' }, 404);
  }
  
  // Récupérer les sections
  const sections = await DB.prepare(
    'SELECT * FROM sections WHERE business_plan_id = ?'
  ).bind(id).all();
  
  logger.info('Business plan retrieved', { 
    planId: id,
    name: plan.name
  });
  
  return c.json({
    id: plan.id,
    name: plan.name,
    status: plan.status,
    progress: plan.progress,
    sections: sections.results || []
  })
})

// Update business plan section
app.put('/:id/:section', async (c) => {
  const { id, section } = c.req.params
  const data = await c.req.json()
  const { DB } = c.env
  const logger = c.get('logger')
  
  logger.info('Updating section', { 
    planId: id, 
    section,
    completed: data.completed 
  });
  
  const now = new Date().toISOString();
  
  await DB.prepare(`
    INSERT INTO sections (id, business_plan_id, name, data, completed, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      data = excluded.data,
      completed = excluded.completed,
      updated_at = excluded.updated_at
  `).bind(
    `${id}-${section}`,
    id,
    section,
    JSON.stringify(data),
    data.completed ? 1 : 0,
    now
  ).run();
  
  // Mettre à jour le progrès global
  const totalSections = 6; // Nombre total de sections
  const completedResult = await DB.prepare(`
    SELECT COUNT(*) as count FROM sections 
    WHERE business_plan_id = ? AND completed = 1
  `).bind(id).first();
  
  const completed = completedResult?.count || 0;
  const progress = Math.round((completed / totalSections) * 100);
  
  await DB.prepare(`
    UPDATE business_plans 
    SET progress = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    progress,
    progress === 100 ? 'completed' : 'draft',
    now,
    id
  ).run();
  
  logger.info('Section updated', { 
    planId: id, 
    section,
    progress
  });
  
  return c.json({
    id,
    section,
    updated: true,
    progress,
    data
  })
})

// Delete business plan
app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const { DB } = c.env
  const logger = c.get('logger')
  
  logger.info('Deleting business plan', { planId: id });
  
  await DB.prepare('DELETE FROM sections WHERE business_plan_id = ?').bind(id).run();
  await DB.prepare('DELETE FROM business_plans WHERE id = ?').bind(id).run();
  
  logger.info('Business plan deleted', { planId: id });
  
  return c.json({ deleted: true, id })
})

export default app
