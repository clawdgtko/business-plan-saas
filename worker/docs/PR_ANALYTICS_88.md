# Mission #88 - Analytics Tracking Implementation

## ✅ Checklist

- [x] POST `/analytics/event` endpoint
- [x] Track : page_views, button_clicks, funnel_steps
- [x] Store dans D1 (table analytics_events)
- [x] Batch insert pour performance
- [x] Tests complets
- [x] Documentation

---

## Changes Made

### 1. New Files

#### `src/routes/analytics-events.js`
Nouveau router pour les événements analytics avec :
- **POST `/event`** - Track un événement individuel
- **POST `/event/batch`** - Track jusqu'à 100 événements en une requête
- **GET `/event/types`** - Liste des types d'événements disponibles
- **GET `/event/stats`** - Statistiques des événements (admin)

#### `tests/analytics-events.test.js`
Tests unitaires complets (15 tests) couvrant :
- Tracking d'événements individuels
- Batch insert
- Validation des schémas
- Gestion des erreurs

#### `docs/ANALYTICS_EVENTS.md`
Documentation complète de l'API avec :
- Description des endpoints
- Exemples de requêtes/réponses
- Schéma de la base de données
- Exemples d'utilisation JavaScript

#### `vitest.config.js`
Configuration pour les tests Vitest

### 2. Modified Files

#### `src/index.js`
- Ajout de l'import du nouveau router
- Ajout de la route `/api/analytics` pour les événements

#### `package.json`
- Ajout des scripts de test
- Ajout de vitest comme dépendance de dev

---

## API Endpoints

### Track Single Event
```bash
POST /api/analytics/event
Content-Type: application/json

{
  "event_type": "page_view",
  "session_id": "sess-123",
  "user_id": "uuid-v4",
  "page_path": "/dashboard",
  "metadata": { "referrer": "google" }
}
```

### Track Batch Events
```bash
POST /api/analytics/event/batch
Content-Type: application/json

{
  "events": [
    { "event_type": "page_view", "session_id": "sess-1", "page_path": "/home" },
    { "event_type": "button_click", "session_id": "sess-1", "button_id": "cta" },
    { "event_type": "funnel_step", "session_id": "sess-1", "funnel_step": "checkout_started" }
  ]
}
```

---

## Schema

```sql
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,      -- page_view, button_click, funnel_step, etc.
  event_category TEXT NOT NULL,  -- page_view, interaction, conversion, funnel
  properties TEXT,               -- JSON
  pathname TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Event Types Supportés

| Type | Description |
|------|-------------|
| `page_view` | Vue de page |
| `button_click` | Clic sur bouton |
| `funnel_step` | Étape de funnel |
| `form_submit` | Soumission formulaire |
| `error` | Erreur |
| `custom` | Événement personnalisé |

## Funnel Steps Disponibles

- `landing_view`
- `guest_funnel_start`
- `guest_funnel_complete`
- `signup_start`
- `signup_complete`
- `onboarding_start`
- `onboarding_complete`
- `bp_created`
- `checkout_started`
- `subscription_complete`
- `subscription_cancelled`

---

## Testing

```bash
cd worker
npm test                    # Run all tests
npm run test:analytics      # Run analytics tests only
npm run test:watch          # Run tests in watch mode
```

---

## Deployment

```bash
# Apply migrations
wrangler d1 migrations apply business-plan-db

# Deploy
wrangler deploy
```

---

## Performance

- **Batch Size**: Max 100 événements par requête
- **Transactions**: Les batchs utilisent des transactions SQL
- **Indexes**: Tous les champs de requête courants sont indexés
- **IP Hashing**: Les IPs sont hashées pour la privacy

---

## Examples

### Frontend - Track Page View
```javascript
fetch('/api/analytics/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'page_view',
    session_id: getSessionId(),
    page_path: window.location.pathname
  })
})
```

### Frontend - Track Button Click
```javascript
button.addEventListener('click', () => {
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: 'button_click',
      session_id: getSessionId(),
      button_id: button.id,
      button_text: button.textContent
    })
  })
})
```

### Frontend - Track Funnel
```javascript
// Checkout started
fetch('/api/analytics/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'funnel_step',
    session_id: getSessionId(),
    user_id: currentUser?.id,
    funnel_step: 'checkout_started',
    funnel_name: 'purchase_flow'
  })
})
```

---

## Related

- Issue #88 - Analytics Tracking
- Issue #89 - Analytics: Track events conversion funnel
- Migration: `src/migrations/004_analytics.js`
