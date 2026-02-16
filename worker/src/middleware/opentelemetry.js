// OpenTelemetry Middleware for Hono - Enhanced
// Business Plan SaaS - DevOps Team

import { 
  TraceContext, 
  Metrics, 
  StructuredLogger, 
  D1Instrumenter, 
  StripeInstrumenter,
  generateCorrelationId 
} from '../lib/telemetry.js';

/**
 * Middleware OpenTelemetry complet
 * - Tracing distribué
 * - Métriques (latency, throughput, error rate)
 * - Logs structurés JSON
 * - Instrumentation D1 automatique
 */
export function opentelemetry() {
  return async (c, next) => {
    const startTime = Date.now();
    
    // Récupérer ou générer le correlation ID
    const correlationId = c.req.header('x-correlation-id') || generateCorrelationId();
    c.header('x-correlation-id', correlationId);
    
    // Récupérer le trace parent (W3C Trace Context)
    const traceParent = c.req.header('traceparent');
    let traceContext;
    
    if (traceParent) {
      // Parser le header W3C: 00-<traceId>-<spanId>-<flags>
      const parts = traceParent.split('-');
      if (parts.length === 4) {
        traceContext = new TraceContext(parts[1], parts[2]);
      } else {
        traceContext = new TraceContext();
      }
    } else {
      traceContext = new TraceContext();
    }
    
    // Initialiser les métriques et logger
    const metrics = new Metrics();
    const logger = new StructuredLogger(correlationId, traceContext);
    
    // Stocker dans le contexte Hono
    c.set('correlationId', correlationId);
    c.set('traceContext', traceContext);
    c.set('logger', logger);
    c.set('metrics', metrics);
    c.set('startTime', startTime);
    
    // Créer le span principal pour la requête
    const requestSpan = traceContext.createChildSpan('http.request', {
      'http.method': c.req.method,
      'http.route': c.req.path,
      'http.target': c.req.url,
      'http.host': c.req.header('host'),
      'http.user_agent': c.req.header('user-agent'),
      'http.scheme': c.req.url.startsWith('https') ? 'https' : 'http',
      'cf.ray': c.req.header('cf-ray'),
      'cf.colo': c.req.cf?.colo,
      'cf.country': c.req.cf?.country
    });
    
    // Instrumenter D1 si présent
    if (c.env.DB) {
      const d1Instrumenter = new D1Instrumenter(logger, metrics, traceContext);
      c.env.DB = d1Instrumenter.instrument(c.env.DB);
      c.set('originalDB', c.env.DB); // Garder référence si besoin
    }
    
    // Logger le début de la requête
    logger.info('Request started', {
      type: 'request.start',
      method: c.req.method,
      path: c.req.path,
      traceId: traceContext.traceId,
      spanId: traceContext.spanId
    });
    
    // Ajouter le traceparent dans la réponse pour tracing distribué
    c.header('traceparent', traceContext.toW3CTraceParent());
    c.header('tracestate', `saas=correlation-${correlationId.slice(0, 16)}`);
    
    try {
      await next();
      
      // Succès - calculer les métriques
      const duration = Date.now() - startTime;
      const status = c.res.status;
      
      // Déterminer si erreur
      const isError = status >= 400;
      
      // Mettre à jour le span
      requestSpan.setStatus(isError ? 'error' : 'ok');
      requestSpan.attributes['http.status_code'] = status;
      requestSpan.end();
      
      // Enregistrer les métriques
      metrics.histogram('http.request.duration', duration, {
        method: c.req.method,
        route: c.req.routePath || c.req.path,
        status: status.toString()
      });
      
      metrics.counter('http.request.total', 1, {
        method: c.req.method,
        route: c.req.routePath || c.req.path,
        status: status.toString()
      });
      
      if (isError) {
        metrics.counter('http.request.errors', 1, {
          method: c.req.method,
          route: c.req.routePath || c.req.path,
          status: status.toString()
        });
      }
      
      // Logger la fin
      logger.info('Request completed', {
        type: 'request.end',
        method: c.req.method,
        path: c.req.path,
        status,
        duration,
        durationMs: duration
      });
      
    } catch (error) {
      // Erreur - capturer tout
      const duration = Date.now() - startTime;
      
      requestSpan.setStatus('error', error.message);
      requestSpan.attributes['error.type'] = error.name;
      requestSpan.attributes['error.message'] = error.message;
      requestSpan.end();
      
      metrics.histogram('http.request.duration', duration, {
        method: c.req.method,
        route: c.req.routePath || c.req.path,
        status: '500',
        error: 'true'
      });
      
      metrics.counter('http.request.errors', 1, {
        method: c.req.method,
        route: c.req.routePath || c.req.path,
        status: '500',
        error: error.name
      });
      
      logger.error('Request failed', {
        type: 'request.error',
        method: c.req.method,
        path: c.req.path,
        status: 500,
        duration,
        error: error.message,
        errorType: error.name,
        stack: error.stack
      });
      
      throw error;
    }
  };
}

/**
 * Helper pour instrumenter les appels Stripe manuellement
 * Usage: c.instrumentStripe('create', 'customer', () => stripe.customers.create(...))
 */
export function createStripeInstrumenter(c) {
  const logger = c.get('logger');
  const metrics = c.get('metrics');
  const traceContext = c.get('traceContext');
  
  return {
    instrument: (operation, resource, fn) => {
      const stripeInstrumenter = new StripeInstrumenter(logger, metrics, traceContext);
      return stripeInstrumenter.instrumentStripeCall(operation, resource, fn);
    }
  };
}

/**
 * Middleware pour exposer les métriques Prometheus
 * Usage: app.get('/metrics', prometheusMetrics())
 */
export function prometheusMetrics() {
  return async (c) => {
    const metrics = c.get('metrics');
    
    if (!metrics) {
      return c.text('# No metrics available', 200);
    }
    
    const snapshot = metrics.getSnapshot();
    let output = [];
    
    // Counters
    for (const [key, value] of Object.entries(snapshot.counters)) {
      const metricName = key.replace(/[{}=,]/g, '_').replace(/__/g, '_');
      output.push(`# TYPE ${metricName} counter`);
      output.push(`${metricName} ${value}`);
    }
    
    // Histograms
    for (const [key, stats] of Object.entries(snapshot.histograms)) {
      const baseName = key.replace(/[{}=,]/g, '_').replace(/__/g, '_');
      output.push(`# TYPE ${baseName} summary`);
      output.push(`${baseName}_count ${stats.count}`);
      output.push(`${baseName}_sum ${stats.sum}`);
    }
    
    // Gauges
    for (const [key, value] of Object.entries(snapshot.gauges)) {
      const metricName = key.replace(/[{}=,]/g, '_').replace(/__/g, '_');
      output.push(`# TYPE ${metricName} gauge`);
      output.push(`${metricName} ${value}`);
    }
    
    return c.text(output.join('\n'), 200, {
      'Content-Type': 'text/plain; version=0.0.4'
    });
  };
}

/**
 * Middleware pour health check enrichi avec métriques
 */
export function healthCheck() {
  return async (c) => {
    const traceContext = c.get('traceContext');
    const logger = c.get('logger');
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Date.now() - c.get('startTime'),
      checks: {
        api: 'ok'
      }
    };
    
    // Vérifier D1 si disponible
    if (c.env.DB) {
      try {
        const startCheck = Date.now();
        await c.env.DB.prepare('SELECT 1').first();
        healthData.checks.database = {
          status: 'ok',
          latency: Date.now() - startCheck
        };
      } catch (error) {
        healthData.checks.database = {
          status: 'error',
          error: error.message
        };
        healthData.status = 'degraded';
      }
    }
    
    logger.debug('Health check performed', healthData);
    
    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    return c.json(healthData, statusCode);
  };
}
