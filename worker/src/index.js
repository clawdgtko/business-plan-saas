// Business Plan SaaS - Worker API
// CFW + Hono + D1

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// Import routes
import authRoutes from './routes/auth.js'
import businessPlanRoutes from './routes/business-plan.js'
import stripeRoutes from './routes/stripe.js'
import exportRoutes from './routes/export.js'

// Import middleware
import { opentelemetry } from './middleware/opentelemetry.js'

const app = new Hono()

// Middleware
app.use('*', opentelemetry())
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://business-plan-saas.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'business-plan-api',
    version: '1.0.0',
    env: c.env.ENVIRONMENT || 'unknown'
  })
})

app.get('/health', (c) => c.json({ status: 'healthy' }))

// Routes
app.route('/api/auth', authRoutes)
app.route('/api/business-plans', businessPlanRoutes)
app.route('/api/stripe', stripeRoutes)
app.route('/api/export', exportRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
  const correlationId = c.get('correlationId')
  const spanContext = c.get('spanContext')
  
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    correlationId,
    traceId: spanContext?.traceId,
    type: 'request.exception',
    method: c.req.method,
    path: c.req.path,
    error: err.message,
    stack: err.stack
  }))
  
  return c.json({ 
    error: 'Internal Server Error',
    correlationId,
    message: c.env.ENVIRONMENT === 'development' ? err.message : undefined
  }, 500)
})

export default app