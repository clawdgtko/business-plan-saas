# Analytics Events API Documentation

## Mission #88 - Analytics Tracking

API pour le tracking des événements analytics avec support du batch insert pour la performance.

---

## Endpoints

### 1. Track Single Event

**POST** `/api/analytics/event`

Track un événement analytics individuel.

#### Request Body

```json
{
  "event_type": "page_view",
  "session_id": "sess-123456",
  "user_id": "user-789", // optionnel
  "page_path": "/dashboard",
  "page_url": "https://app.example.com/dashboard",
  "metadata": {
    "referrer": "google.com",
    "campaign": "summer2024"
  }
}
```

#### Event Types Supportés

| Type | Description | Champs spécifiques |
|------|-------------|-------------------|
| `page_view` | Vue de page | `page_path`, `page_url` |
| `button_click` | Clic sur bouton | `button_id`, `button_text` |
| `funnel_step` | Étape de funnel | `funnel_step`, `funnel_name` |
| `form_submit` | Soumission formulaire | - |
| `error` | Erreur | `error_code`, `error_message` |
| `custom` | Événement personnalisé | - |

#### Funnel Steps Disponibles

- `landing_view`
- `guest_funnel_start`
- `guest_funnel_complete`
- `signup_start`
- `signup_complete`
- `onboarding_start`
- `onboarding_complete`
- `bp_created`
- `bp_edited`
- `checkout_started`
- `checkout_completed`
- `subscription_complete`
- `subscription_cancelled`

#### Response

```json
{
  "success": true,
  "event_id": "uuid-v4",
  "tracked": true
}
```

---

### 2. Track Batch Events

**POST** `/api/analytics/event/batch`

Track plusieurs événements en une seule requête (max 100).

#### Request Body

```json
{
  "events": [
    {
      "event_type": "page_view",
      "session_id": "sess-123",
      "page_path": "/home"
    },
    {
      "event_type": "button_click",
      "session_id": "sess-123",
      "button_id": "cta-primary",
      "button_text": "Get Started"
    },
    {
      "event_type": "funnel_step",
      "session_id": "sess-123",
      "funnel_step": "signup_start",
      "funnel_name": "registration"
    }
  ],
  "batch_metadata": {
    "source": "web_app",
    "version": "2.1.0"
  }
}
```

#### Response

```json
{
  "success": true,
  "tracked_count": 3,
  "failed_count": 0,
  "event_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

En cas de succès partiel (code 207):

```json
{
  "success": false,
  "tracked_count": 2,
  "failed_count": 1,
  "event_ids": ["uuid-1", "uuid-2"],
  "errors": [
    {
      "event": "button_click",
      "error": "Invalid button_id"
    }
  ]
}
```

---

### 3. Get Event Types

**GET** `/api/analytics/event/types`

Retourne les types d'événements et steps de funnel disponibles.

#### Response

```json
{
  "event_types": ["page_view", "button_click", "funnel_step", "form_submit", "error", "custom"],
  "funnel_steps": ["landing_view", "signup_start", "checkout_started", ...],
  "categories": ["page_view", "interaction", "conversion", "funnel", "error", "custom"]
}
```

---

### 4. Get Event Stats

**GET** `/api/analytics/event/stats?hours=24`

Retourne les statistiques des événements (admin uniquement).

#### Query Parameters

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `hours` | number | 24 | Période en heures |

#### Response

```json
{
  "period": "24 hours",
  "summary": {
    "total_events": 1523,
    "by_type": [
      {
        "event_type": "page_view",
        "count": 1000,
        "unique_sessions": 500,
        "unique_users": 300
      },
      {
        "event_type": "button_click",
        "count": 300,
        "unique_sessions": 250,
        "unique_users": 200
      }
    ],
    "funnel_progression": [
      {
        "step": "landing_view",
        "count": 1000,
        "unique_sessions": 500
      },
      {
        "step": "checkout_started",
        "count": 100,
        "unique_sessions": 80
      }
    ],
    "top_pages": [
      {
        "pathname": "/pricing",
        "views": 300,
        "unique_sessions": 200
      }
    ],
    "top_buttons": [
      {
        "button_id": "cta-primary",
        "button_text": "Get Started",
        "clicks": 150,
        "unique_sessions": 100
      }
    ]
  }
}
```

---

## Schéma de la Table D1

```sql
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  properties TEXT, -- JSON
  pathname TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- Hash de l'IP pour la privacy
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes pour performance
CREATE INDEX idx_events_type ON analytics_events(event_type);
CREATE INDEX idx_events_category ON analytics_events(event_category);
CREATE INDEX idx_events_user ON analytics_events(user_id);
CREATE INDEX idx_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_events_funnel ON analytics_events(event_category, event_type, timestamp);
```

---

## Exemples d'Utilisation

### Tracking Page View

```javascript
await fetch('/api/analytics/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'page_view',
    session_id: getSessionId(),
    page_path: window.location.pathname,
    page_url: window.location.href,
    referrer: document.referrer
  })
})
```

### Tracking Button Click

```javascript
button.addEventListener('click', () => {
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: 'button_click',
      session_id: getSessionId(),
      button_id: button.id,
      button_text: button.textContent,
      page_path: window.location.pathname
    })
  })
})
```

### Tracking Funnel Step

```javascript
// Quand l'utilisateur commence le checkout
await fetch('/api/analytics/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'funnel_step',
    session_id: getSessionId(),
    user_id: currentUser.id,
    funnel_step: 'checkout_started',
    funnel_name: 'purchase_flow',
    metadata: { plan: 'pro', price: 99 }
  })
})
```

### Batch Tracking

```javascript
// Collecter plusieurs événements et envoyer en batch
const events = [
  { event_type: 'page_view', session_id, page_path: '/home' },
  { event_type: 'button_click', session_id, button_id: 'cta-1' },
  { event_type: 'funnel_step', session_id, funnel_step: 'signup_start' }
]

await fetch('/api/analytics/event/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ events })
})
```

---

## Performance

- **Batch Size**: Maximum 100 événements par requête batch
- **Transaction**: Les batchs utilisent des transactions SQL pour garantir l'intégrité
- **Index**: Tous les champs de requête courants sont indexés
- **Hash IP**: Les IPs sont hashées avant stockage (privacy)

---

## Tests

```bash
cd worker
npm test -- analytics-events.test.js
```

---

## Migration

La migration est automatique via le fichier `src/migrations/004_analytics.js`.

```bash
wrangler d1 migrations apply business-plan-db --local
```
