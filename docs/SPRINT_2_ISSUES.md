# 🎯 Sprint #2 - Issues Restantes

**Deadline:** 73 minutes restantes  
**Objectif:** Polish & Scale

---

## Issue #72 - [Backend] Validation Zod sur routes existantes

**Assigné:** @BackendAgent  
**Priorité:** 🔴 Haute  
**Temps estimé:** 20 min

### Description
Intégrer les validateurs Zod existants sur les routes business-plan.js

### Tâches
- [ ] Ajouter `validateBody(createBusinessPlanSchema)` sur POST /
- [ ] Ajouter validation sur PUT /:id/:section
- [ ] Tester les erreurs de validation retournent 400

### Fichiers concernés
- `worker/src/routes/business-plan.js`
- `worker/src/validators/index.js`

### Exemple d'intégration
```javascript
import { validateBody } from '../middleware/validation.js'
import { createBusinessPlanSchema } from '../validators/index.js'

app.post('/', auth, validateBody(createBusinessPlanSchema), async (c) => {
  const data = c.get('validatedData')
  // ... suite
})
```

---

## Issue #73 - [Frontend] Connecter Onboarding à l'API

**Assigné:** @FrontendAgent  
**Priorité:** 🔴 Haute  
**Temps estimé:** 15 min

### Description
Le frontend onboarding doit appeler l'API POST /api/onboarding au lieu de stocker localement

### Tâches
- [ ] Ajouter méthode `completeOnboarding(data)` dans `stores/auth.js`
- [ ] Modifier `Onboarding.vue` pour appeler l'API
- [ ] Gérer les erreurs API

### Fichiers concernés
- `frontend/src/stores/auth.js`
- `frontend/src/views/Onboarding.vue`

### API Endpoint
```
POST /api/onboarding
Headers: Authorization: Bearer <token>
Body: { name, company, goal }
```

---

## Issue #74 - [Backend] Stripe Checkout Réel

**Assigné:** @BackendAgent  
**Priorité:** 🟡 Medium  
**Temps estimé:** 25 min

### Description
Remplacer le mock Stripe par l'implémentation réelle

### Tâches
- [ ] Initialiser Stripe avec `c.env.STRIPE_SECRET_KEY`
- [ ] Créer checkout session réelle
- [ ] Gérer les erreurs Stripe
- [ ] Webhook signature verification

### Fichiers concernés
- `worker/src/routes/stripe.js`

### Secrets requis
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

## Issue #75 - [QA] Tests Intégration Auth & BP

**Assigné:** @QAEngineer  
**Priorité:** 🟡 Medium  
**Temps estimé:** 20 min

### Description
Créer tests d'intégration pour auth et business plans

### Tâches
- [ ] Test flow magic link complet
- [ ] Test CRUD business plan
- [ ] Test validation Zod retourne 400

### Fichiers concernés
- `tests/integration/auth.test.js`
- `tests/integration/business-plan.test.js`

---

## Issue #76 - [DevOps] Déploiement Production

**Assigné:** @DevOpsAgent  
**Priorité:** 🟡 Medium  
**Temps estimé:** 10 min

### Description
Déployer sur Cloudflare Workers

### Tâches
- [ ] Vérifier secrets wrangler
- [ ] `wrangler deploy`
- [ ] Vérifier health check
- [ ] Mettre à jour URL production

### Commandes
```bash
cd worker
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put JWT_SECRET
wrangler deploy
```

---

## 📊 Répartition du temps (73 min)

| Issue | Agent | Temps | Début |
|-------|-------|-------|-------|
| #72 Validation Zod | @BackendAgent | 20 min | Now |
| #73 Onboarding API | @FrontendAgent | 15 min | Now |
| #74 Stripe Réel | @BackendAgent | 25 min | +20 min |
| #75 Tests | @QAEngineer | 20 min | +15 min |
| #76 Deploy | @DevOpsAgent | 10 min | +45 min |
| Buffer | - | 8 min | +55 min |

---

## ✅ Checklist Sprint #2 Completion

- [ ] Validation Zod sur toutes les routes
- [ ] Onboarding persisté en DB
- [ ] Stripe checkout réel
- [ ] Tests pass
- [ ] Déployé en prod

**GO Sprint #2** 🚀
