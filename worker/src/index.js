// Business Plan SaaS - Worker API
// CFW + Hono + D1 + OpenTelemetry

import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Import routes
import authRoutes from './routes/auth.js'
import businessPlanRoutes from './routes/business-plan.js'
import stripeRoutes from './routes/stripe.js'
import exportRoutes from './routes/export.js'

// Import middleware
import { opentelemetry, prometheusMetrics, healthCheck } from './middleware/opentelemetry.js'

const app = new Hono()

// OpenTelemetry FIRST - capture tout
app.use('*', opentelemetry())

// CORS
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://business-plan-saas.pages.dev', 'https://business-plan.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-correlation-id', 'traceparent'],
  exposeHeaders: ['x-correlation-id', 'traceparent', 'tracestate'],
  credentials: true
}))

// Health check enrichi avec OpenTelemetry
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'business-plan-api',
    version: '1.0.0',
    env: c.env.ENVIRONMENT || 'unknown',
    traceId: c.get('traceContext')?.traceId
  })
})

app.get('/health', healthCheck())

// Métriques Prometheus
app.get('/metrics', prometheusMetrics())

// Debug endpoint pour voir les traces (dev uniquement)
app.get('/debug/trace', async (c) => {
  if (c.env.ENVIRONMENT === 'production') {
    return c.json({ error: 'Not available in production' }, 403);
  }
  
  const traceContext = c.get('traceContext');
  const metrics = c.get('metrics');
  
  return c.json({
    correlationId: c.get('correlationId'),
    traceId: traceContext?.traceId,
    spanId: traceContext?.spanId,
    spans: traceContext?.spans?.map(s => s.toJSON()) || [],
    metrics: metrics?.getSnapshot() || {}
  });
});

// Routes
app.route('/api/auth', authRoutes)
app.route('/api/business-plans', businessPlanRoutes)
app.route('/api/stripe', stripeRoutes)
app.route('/api/export', exportRoutes)

// 404 handler avec logging
app.notFound((c) => {
  const logger = c.get('logger');
  logger?.warn('Route not found', {
    type: 'request.notfound',
    method: c.req.method,
    path: c.req.path
  });
  
  return c.json({ 
    error: 'Not Found',
    correlationId: c.get('correlationId')
  }, 404);
})

// Error handler avec tracing complet
app.onError((err, c) => {
  const logger = c.get('logger');
  const traceContext = c.get('traceContext');
  const correlationId = c.get('correlationId');
  
  // Log structuré de l'erreur
  logger?.error('Unhandled exception', {
    type: 'request.exception',
    method: c.req.method,
    path: c.req.path,
    error: err.message,
    errorType: err.name,
    stack: err.stack,
    traceId: traceContext?.traceId
  });
  
  // Réponse avec correlation ID pour debugging
  const isDev = c.env.ENVIRONMENT === 'development';
  
  return c.json({ 
    error: 'Internal Server Error',
    correlationId,
    traceId: traceContext?.traceId,
    ...(isDev && { 
      message: err.message,
      stack: err.stack 
    })
  }, 500);
})

export default app
