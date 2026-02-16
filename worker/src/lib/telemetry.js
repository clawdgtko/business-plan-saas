// OpenTelemetry Observability Module for Cloudflare Workers
// Business Plan SaaS - DevOps Team

/**
 * OpenTelemetry context pour tracing distribué
 */
export class TraceContext {
  constructor(traceId = null, parentSpanId = null) {
    this.traceId = traceId || this.generateTraceId();
    this.spanId = this.generateSpanId();
    this.parentSpanId = parentSpanId;
    this.traceFlags = 1;
    this.startTime = Date.now();
    this.spans = [];
  }

  generateTraceId() {
    return crypto.randomUUID().replace(/-/g, '');
  }

  generateSpanId() {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  }

  createChildSpan(name, attributes = {}) {
    const childSpan = new Span(name, this.traceId, this.spanId, attributes);
    this.spans.push(childSpan);
    return childSpan;
  }

  toW3CTraceParent() {
    return `00-${this.traceId}-${this.spanId}-0${this.traceFlags}`;
  }
}

/**
 * Span individuel pour tracing
 */
export class Span {
  constructor(name, traceId, parentSpanId = null, attributes = {}) {
    this.name = name;
    this.traceId = traceId;
    this.spanId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    this.parentSpanId = parentSpanId;
    this.attributes = attributes;
    this.startTime = Date.now();
    this.endTime = null;
    this.status = 'ok';
    this.events = [];
  }

  addEvent(name, attributes = {}) {
    this.events.push({
      timestamp: Date.now(),
      name,
      attributes
    });
  }

  setStatus(status, message = null) {
    this.status = status;
    if (message) {
      this.statusMessage = message;
    }
  }

  end() {
    this.endTime = Date.now();
    return this;
  }

  duration() {
    return (this.endTime || Date.now()) - this.startTime;
  }

  toJSON() {
    return {
      name: this.name,
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration(),
      attributes: this.attributes,
      status: this.status,
      statusMessage: this.statusMessage,
      events: this.events
    };
  }
}

/**
 * Métriques pour monitoring
 */
export class Metrics {
  constructor() {
    this.counters = new Map();
    this.histograms = new Map();
    this.gauges = new Map();
  }

  counter(name, value = 1, labels = {}) {
    const key = this.makeKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  histogram(name, value, labels = {}) {
    const key = this.makeKey(name, labels);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    this.histograms.get(key).push({
      value,
      timestamp: Date.now()
    });
  }

  gauge(name, value, labels = {}) {
    const key = this.makeKey(name, labels);
    this.gauges.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  makeKey(name, labels) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  getSnapshot() {
    return {
      counters: Object.fromEntries(this.counters),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([k, v]) => [
          k,
          {
            count: v.length,
            sum: v.reduce((a, b) => a + b.value, 0),
            min: Math.min(...v.map(x => x.value)),
            max: Math.max(...v.map(x => x.value)),
            avg: v.reduce((a, b) => a + b.value, 0) / v.length
          }
        ])
      ),
      gauges: Object.fromEntries(
        Array.from(this.gauges.entries()).map(([k, v]) => [k, v.value])
      )
    };
  }
}

/**
 * Logger structuré JSON
 */
export class StructuredLogger {
  constructor(correlationId, traceContext) {
    this.correlationId = correlationId;
    this.traceContext = traceContext;
  }

  log(level, message, extra = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: this.correlationId,
      traceId: this.traceContext?.traceId,
      spanId: this.traceContext?.spanId,
      ...extra
    };
    console.log(JSON.stringify(logEntry));
  }

  debug(message, extra) { this.log('debug', message, extra); }
  info(message, extra) { this.log('info', message, extra); }
  warn(message, extra) { this.log('warn', message, extra); }
  error(message, extra) { this.log('error', message, extra); }
}

/**
 * Instrumentation D1 - Tracing des requêtes DB
 */
export class D1Instrumenter {
  constructor(logger, metrics, traceContext) {
    this.logger = logger;
    this.metrics = metrics;
    this.traceContext = traceContext;
  }

  instrument(db) {
    const instrumenter = this;
    
    return new Proxy(db, {
      get(target, prop) {
        if (prop === 'prepare') {
          return (sql) => {
            const span = instrumenter.traceContext.createChildSpan('db.query', {
              'db.system': 'd1',
              'db.statement': sql.substring(0, 200) // Truncate long queries
            });
            
            const stmt = target.prepare(sql);
            
            return new Proxy(stmt, {
              get(stmtTarget, stmtProp) {
                if (['first', 'all', 'run'].includes(stmtProp)) {
                  return async (...args) => {
                    const startTime = Date.now();
                    try {
                      const result = await stmtTarget[stmtProp](...args);
                      const duration = Date.now() - startTime;
                      
                      span.setStatus('ok');
                      span.addEvent('query.complete', { duration });
                      span.end();
                      
                      instrumenter.metrics.histogram('db.query.duration', duration, {
                        operation: stmtProp,
                        table: instrumenter.extractTable(sql)
                      });
                      
                      instrumenter.logger.debug('DB query completed', {
                        operation: stmtProp,
                        duration,
                        sql: sql.substring(0, 100)
                      });
                      
                      return result;
                    } catch (error) {
                      span.setStatus('error', error.message);
                      span.end();
                      
                      instrumenter.metrics.counter('db.query.errors', 1, {
                        operation: stmtProp,
                        error: error.name
                      });
                      
                      instrumenter.logger.error('DB query failed', {
                        operation: stmtProp,
                        error: error.message,
                        sql: sql.substring(0, 100)
                      });
                      
                      throw error;
                    }
                  };
                }
                return stmtTarget[stmtProp];
              }
            });
          };
        }
        return target[prop];
      }
    });
  }

  extractTable(sql) {
    const match = sql.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
    return match ? match[1] : 'unknown';
  }
}

/**
 * Instrumentation Stripe - Tracing des appels API
 */
export class StripeInstrumenter {
  constructor(logger, metrics, traceContext) {
    this.logger = logger;
    this.metrics = metrics;
    this.traceContext = traceContext;
  }

  instrumentStripeCall(operation, resource, fn) {
    const span = this.traceContext.createChildSpan('stripe.api', {
      'stripe.operation': operation,
      'stripe.resource': resource
    });
    
    const startTime = Date.now();
    
    return Promise.resolve()
      .then(() => fn())
      .then(result => {
        const duration = Date.now() - startTime;
        
        span.setStatus('ok');
        span.end();
        
        this.metrics.histogram('stripe.api.duration', duration, {
          operation,
          resource
        });
        
        this.logger.debug('Stripe API call completed', {
          operation,
          resource,
          duration
        });
        
        return result;
      })
      .catch(error => {
        span.setStatus('error', error.message);
        span.end();
        
        this.metrics.counter('stripe.api.errors', 1, {
          operation,
          resource,
          error: error.type || error.code
        });
        
        this.logger.error('Stripe API call failed', {
          operation,
          resource,
          error: error.message,
          stripeCode: error.code
        });
        
        throw error;
      });
  }
}

/**
 * Export collector pour envoyer les données
 */
export class TelemetryCollector {
  constructor(config = {}) {
    this.endpoint = config.endpoint || null;
    this.apiKey = config.apiKey || null;
    this.batch = [];
    this.maxBatchSize = config.maxBatchSize || 100;
  }

  addSpan(span) {
    this.batch.push({ type: 'span', data: span.toJSON() });
    this.maybeFlush();
  }

  addMetric(name, value, labels = {}) {
    this.batch.push({
      type: 'metric',
      data: { name, value, labels, timestamp: Date.now() }
    });
    this.maybeFlush();
  }

  addLog(logEntry) {
    this.batch.push({ type: 'log', data: logEntry });
    this.maybeFlush();
  }

  maybeFlush() {
    if (this.batch.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.batch.length === 0 || !this.endpoint) return;
    
    const payload = this.batch.splice(0, this.batch.length);
    
    try {
      // Fire and forget - don't block the request
      fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          source: 'business-plan-saas',
          timestamp: Date.now(),
          items: payload
        })
      }).catch(() => {
        // Silently fail - don't impact the request
      });
    } catch (e) {
      // Ignore errors
    }
  }
}

// Helper pour générer correlation ID
export function generateCorrelationId() {
  return crypto.randomUUID();
}

// Export version
export const VERSION = '1.0.0';
