# API - Business Plan SaaS (MVP)

Base URL (local): `http://localhost:8787`

## Auth

### POST /api/auth/magic-link
Demande un lien magique.

Body JSON:
```json
{ "email": "user@example.com" }
```

Reponse 200:
```json
{ "success": true, "message": "Magic link envoye", "devToken": "...", "devLink": "..." }
```

### GET /api/auth/verify/:token
Verifie le token et retourne un JWT.

Reponse 200:
```json
{ "success": true, "token": "<jwt>", "user": { "id": "...", "email": "..." } }
```

### GET /api/auth/me
Auth requise (`Authorization: Bearer <token>`).

Reponse 200:
```json
{ "user": { "id": "...", "email": "..." } }
```

## Onboarding

### POST /api/onboarding
- Mode authentifie: sauvegarde le profil et cree un business plan.
- Mode guest: sauvegarde les donnees du funnel.

Headers:
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (optionnel)

Body JSON (auth):
```json
{ "name": "Alice", "company": "ACME", "goal": "Valider mon modele economique" }
```

Reponse 201 (auth):
```json
{ "success": true, "message": "Onboarding complete", "businessPlanId": "..." }
```

Body JSON (guest - flexible):
```json
{ "email": "guest@example.com", "funnel": { "businessName": "MyCo", "sector": "tech" }, "step": "review" }
```

Reponse 201 (guest):
```json
{ "success": true, "message": "Funnel guest sauvegarde", "guestId": "..." }
```

### GET /api/onboarding/status
Auth requise (`Authorization: Bearer <token>`).

Reponse 200:
```json
{ "completed": false, "profile": { "name": "...", "company": "...", "goal": "...", "onboarding_completed": 0 } }
```

## Business Plans

### GET /api/business-plans
Auth requise.

### POST /api/business-plans
Auth requise.

Body JSON:
```json
{ "name": "Mon Business Plan" }
```

### GET /api/business-plans/:id
Auth requise.

### PUT /api/business-plans/:id/:section
Auth requise.

Body JSON: contenu libre selon section.

### DELETE /api/business-plans/:id
Auth requise.

## Stripe

### POST /api/stripe/checkout
Auth requise.

Body JSON:
```json
{ "priceId": "price_...", "successUrl": "https://...", "cancelUrl": "https://..." }
```

### GET /api/stripe/subscription
Auth requise.

### POST /api/stripe/portal
Auth requise.

### POST /api/stripe/webhook
Webhook Stripe (sans auth).

## Export

### POST /api/export/pdf/:id
Genere un PDF (mock pour MVP).

### GET /api/export/download/:filename
Telecharge le PDF.

## Sante

### GET /
Health check.

### GET /health
Health check simple.
