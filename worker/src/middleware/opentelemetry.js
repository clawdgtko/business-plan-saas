// OpenTelemetry Middleware for Hono
// Tracing, métriques et logs structurés

// Generate correlation ID
function generateCorrelationId() {
  return crypto.randomUUID()
}

// OpenTelemetry middleware
export function opentelemetry() {
  return async (c, next) => {
    const startTime = Date.now()
    const correlationId = c.req.header('x-correlation-id') || generateCorrelationId()
    
    // Set correlation ID in response
    c.header('x-correlation-id', correlationId)
    
    // Create span context
    const spanContext = {
      traceId: generateCorrelationId().replace(/-/g, ''),
      spanId: generateCorrelationId().slice(0, 16),
      traceFlags: 1
    }
    
    // Store in context
    c.set('correlationId', correlationId)
    c.set('spanContext', spanContext)
    c.set('startTime', startTime)
    
    // Log request
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      correlationId,
      traceId: spanContext.traceId,
      type: 'request.start',
      method: c.req.method,
      path: c.req.path,
      userAgent: c.req.header('user-agent'),
      cfRay: c.req.header('cf-ray')
    }))
    
    try {
      await next()
      
      // Log success
      const duration = Date.now() - startTime
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        correlationId,
        traceId: spanContext.traceId,
        type: 'request.end',
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        duration,
        durationMs: duration
      }))
      
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        correlationId,
        traceId: spanContext.traceId,
        type: 'request.error',
        method: c.req.method,
        path: c.req.path,
        status: 500,
        duration,
        error: error.message,
        stack: error.stack
      }))
      
      throw error
    }
  }
}