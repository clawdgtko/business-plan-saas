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
import onboardingRoutes from './routes/onboarding.js'
import analyticsRoutes from './routes/analytics.js'
import analyticsEventsRoutes from './routes/analytics-events.js'
import adminRoutes from './routes/admin.js'

// Import middleware
import { auth } from './middleware/auth.js'
import { featureFlags } from './middleware/features.js'
import { analyticsMiddleware } from './middleware/analytics.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://business-plan-saas.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use('*', featureFlags)
app.use('*', analyticsMiddleware())

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
app.route('/api/onboarding', onboardingRoutes)
app.route('/api/analytics', analyticsRoutes)
app.route('/api/analytics', analyticsEventsRoutes)
app.route('/api/admin', adminRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ 
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : undefined
  }, 500)
})

export default app