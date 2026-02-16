# OpenTelemetry - Observabilité Business Plan SaaS

## 🎯 Mission
Instrumentation complète pour monitoring temps réel à 1M€ MRR.

## 📊 Ce qui est instrumenté

### 1. Tracing Distribué (W3C Trace Context)
- **HTTP Requests**: Chaque requête a un traceId unique
- **D1 Queries**: Temps d'exécution des requêtes DB
- **Stripe API**: Latence des appels Stripe
- **Propagation**: Headers `traceparent` et `tracestate`

### 2. Métriques Collectées
| Métrique | Type | Labels |
|----------|------|--------|
| `http.request.duration` | Histogram | method, route, status |
| `http.request.total` | Counter | method, route, status |
| `http.request.errors` | Counter | method, route, status, error |
| `db.query.duration` | Histogram | operation, table |
| `db.query.errors` | Counter | operation, error |
| `stripe.api.duration` | Histogram | operation, resource |
| `stripe.api.errors` | Counter | operation, resource, error |

### 3. Logs Structurés (JSON)
```json
{
  "timestamp": "2025-02-16T10:30:00.000Z",
  "level": "info",
  "message": "Request completed",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "traceId": "abc123def456",
  "spanId": "xyz789",
  "type": "request.end",
  "method": "POST",
  "path": "/api/business-plans",
  "status": 201,
  "duration": 45
}
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ traceparent
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Worker + Hono                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  opentelemetry() middleware                           │  │
│  │  ├─ Create TraceContext                               │  │
│  │  ├─ Generate correlationId                            │  │
│  │  ├─ Create request span                               │  │
│  │  ├─ Instrument D1 (Proxy)                             │  │
│  │  └─ Setup StructuredLogger                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────┼─────────────────────────────┐   │
│  │                        ▼                             │   │
│  │  Routes: auth / business-plans / stripe / export    │   │
│  │  ├─ c.get('logger') → logs structurés             │   │
│  │  ├─ c.get('traceContext') → tracing               │   │
│  │  └─ c.get('metrics') → métriques                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   D1 Database  │
              └────────────────┘
```

## 📁 Fichiers

```
worker/src/
├── index.js                      # Entry point avec middleware OTel
├── middleware/
│   ├── opentelemetry.js          # Middleware principal
│   └── auth.js                   # Auth avec logging
├── lib/
│   └── telemetry.js              # Module OTel complet
└── routes/
    ├── stripe.js                 # Routes Stripe instrumentées
    └── business-plan.js          # Routes BP avec logs
```

## 🔌 Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check basique |
| `GET /health` | Health check enrichi avec check DB |
| `GET /metrics` | Métriques Prometheus |
| `GET /debug/trace` | Debug traces (dev uniquement) |

## 🧪 Exemple d'utilisation

### Dans une route
```javascript
app.get('/api/business-plans', async (c) => {
  const logger = c.get('logger');
  const { DB } = c.env;
  
  // Log automatique avec correlationId et traceId
  logger.info('Listing business plans');
  
  // DB déjà instrumentée - les queries sont tracées automatiquement
  const plans = await DB.prepare('SELECT * FROM plans').all();
  
  logger.info('Plans retrieved', { count: plans.length });
  
  return c.json({ plans });
});
```

### Instrumenter Stripe manuellement
```javascript
import { createStripeInstrumenter } from '../middleware/opentelemetry.js';

app.post('/checkout', async (c) => {
  const stripeInst = createStripeInstrumenter(c);
  
  const session = await stripeInst.instrument(
    'create',
    'checkout.session',
    () => stripe.checkout.sessions.create({...})
  );
  
  return c.json({ sessionId: session.id });
});
```

## 📈 Dashboard Grafana (à configurer)

### Panels recommandés
1. **RPS (Requests Per Second)**
   ```promql
   rate(http_request_total[1m])
   ```

2. **Latence p95**
   ```promql
   histogram_quantile(0.95, rate(http_request_duration_bucket[5m]))
   ```

3. **Error Rate**
   ```promql
   rate(http_request_errors[5m]) / rate(http_request_total[5m])
   ```

4. **DB Query Duration**
   ```promql
   histogram_quantile(0.99, rate(db_query_duration_bucket[5m]))
   ```

## 🚨 Alertes (à configurer)

```yaml
# Exemple de règles d'alerte
alerts:
  - name: HighErrorRate
    condition: rate(http_request_errors[5m]) > 0.01
    severity: critical
    
  - name: HighLatency
    condition: histogram_quantile(0.95, http_request_duration) > 500
    severity: warning
    
  - name: DBErrors
    condition: rate(db_query_errors[5m]) > 1
    severity: critical
```

## 🔧 Configuration Wrangler

```toml
[vars]
ENVIRONMENT = "production"

# Variables optionnelles pour export OTel
OTEL_EXPORTER_ENDPOINT = "https://otel.baselime.io/v1/logs"
OTEL_SERVICE_NAME = "business-plan-api"
```

## 📝 Changelog

### v1.0.0 - 2025-02-16
- ✅ Tracing distribué (W3C Trace Context)
- ✅ Métriques HTTP (latency, throughput, errors)
- ✅ Instrumentation D1 automatique
- ✅ Logs structurés JSON
- ✅ Endpoint /metrics Prometheus
- ✅ Health check avec DB verification

## 👥 Équipe
- **DevOps**: Implémentation OTel
- **@lead-dev**: Review et intégration
- **@fullstack-dev**: Utilisation dans les routes

---
*Documentation créée par l'équipe DevOps*
