# 🎯 Stratégie QA - Business Plan SaaS
## Objectif : 1M€ MRR | Zéro Bug sur le Paiement

> **QA Engineer:** clawdgtko  
> **Motto:** "1 bug de paiement = 1 client perdu = 1000€ MRR en moins"

---

## 📊 Vue d'Ensemble

| Métrique | Objectif | Outil |
|----------|----------|-------|
| Couverture code | >80% | Vitest + Istanbul |
| Couverture funnel paiement | 100% | Tests E2E Playwright |
| Bugs de paiement en prod | 0 | Checklist + Review obligatoire |
| Temps moyen de détection | <5min | CI + Tests auto |
| Temps de régression | <2min | Tests unitaires rapides |

---

## 🏗️ Architecture de Test

```
┌─────────────────────────────────────────────────────────────┐
│                    PYRAMIDE DE TESTS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────┐                          │
│                    │   E2E       │  ← Funnel complet        │
│                    │  (Playwright)│    ~20 tests critiques   │
│                    └──────┬──────┘                          │
│                   ┌───────┴───────┐                         │
│                   │  Integration  │  ← API + DB + Stripe    │
│                   │   (Vitest)    │    ~50 tests            │
│                   └───────┬───────┘                         │
│              ┌────────────┴────────────┐                    │
│              │        Unit             │  ← Business logic   │
│              │      (Vitest)           │    ~200 tests       │
│              └─────────────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Types de Tests

### 1. Tests Unitaires (Vitest)

**Responsabilité:** Business logic pure, validation, calculs

```typescript
// ✅ EXEMPLE: Calcul du prix avec TVA
describe('PricingCalculator', () => {
  it.each([
    { country: 'FR', amount: 100, expected: 120 }, // 20% TVA
    { country: 'DE', amount: 100, expected: 119 }, // 19% TVA
    { country: 'US', amount: 100, expected: 100 }, // No VAT
    { country: 'CH', amount: 100, expected: 107.7 }, // 7.7% TVA
  ])('calcule le prix TTC pour $country', ({ country, amount, expected }) => {
    expect(PricingCalculator.withTax(amount, country)).toBe(expected);
  });
});
```

**Couverture requise:**
- [ ] Services métier : 90%
- [ ] Utils/helpers : 80%
- [ ] Validation de données : 100%

### 2. Tests d'Intégration (Vitest + Miniflare)

**Responsabilité:** API endpoints, DB queries, Stripe API mock

```typescript
// ✅ EXEMPLE: Création de subscription
describe('POST /api/subscriptions', () => {
  it('crée une subscription avec trial', async () => {
    const response = await app.request('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        priceId: 'price_premium',
        trialDays: 14,
        country: 'FR'
      })
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'trialing',
      trialEnd: expect.any(Number)
    });
  });
});
```

**Couverture requise:**
- [ ] Tous les endpoints API : 100%
- [ ] Requêtes D1 : 100%
- [ ] Webhooks Stripe : 100%

### 3. Tests E2E (Playwright)

**Responsabilité:** Parcours utilisateur complet, paiement réel en mode test

```typescript
// ✅ EXEMPLE: Funnel de paiement complet
test('user can complete purchase flow', async ({ page }) => {
  await page.goto('/pricing');
  await page.click('[data-testid="plan-premium"]');
  await page.click('[data-testid="cta-subscribe"]');
  
  // Stripe Express Checkout
  await page.fill('[data-testid="card-number"]', '4242424242424242');
  await page.fill('[data-testid="card-expiry"]', '12/30');
  await page.fill('[data-testid="card-cvc"]', '123');
  await page.click('[data-testid="submit-payment"]');
  
  await expect(page).toHaveURL('/success');
  await expect(page.locator('[data-testid="subscription-active"]')).toBeVisible();
});
```

**Scénarios critiques (à implémenter):**
- [ ] Achat plan Starter (sans trial)
- [ ] Achat plan Premium (avec trial 14j)
- [ ] Upgrade Starter → Premium
- [ ] Downgrade Premium → Starter
- [ ] Annulation subscription
- [ ] Échec paiement (carte déclinée)
- [ ] Retry paiement après échec
- [ ] SCA/3D Secure (carte `4000002500003155`)

---

## 💳 Tests Stripe (CRITIQUE - PRIORITÉ MAXIMALE)

### Cartes de Test OBLIGATOIRES

| Scénario | Carte | Expected |
|----------|-------|----------|
| Paiement OK | `4242424242424242` | Success |
| SCA Required | `4000002500003155` | 3D Secure challenge |
| Insufficient funds | `4000000000009995` | Décliné + retry |
| Expired card | `4000000000000069` | Décliné |
| Incorrect CVC | `4000000000000127` | Décliné |
| Processing error | `4000000000000119` | Error handling |
| Disputed payment | `4000000000000259` | Webhook `charge.disputed` |

### Webhooks à Tester

```typescript
// ✅ Liste exhaustive des webhooks Stripe à tester
describe('Stripe Webhooks', () => {
  it.each([
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.subscription.trial_will_end',
    'charge.dispute.created',
    'charge.refunded',
  ])('handles %s', async (eventType) => {
    // Test webhook signature + idempotency
  });
});
```

**Checklist Webhook:**
- [ ] Vérification signature Stripe
- [ ] Idempotency (même event_id = pas de double traitement)
- [ ] Gestion erreurs (retry avec backoff)
- [ ] Logging détaillé pour debug

### Scénarios de Subscription

```typescript
describe('Subscription Lifecycle', () => {
  // Trial
  it('trial se convertit en paid après 14j', async () => {});
  it('reminder email 3j avant fin trial', async () => {});
  it('cancel during trial = no charge', async () => {});
  
  // Upgrade/Downgrade
  it('upgrade immédiat avec prorata', async () => {});
  it('downgrade à la fin de période', async () => {});
  
  // Cancel
  it('cancel immédiat = fin accès', async () => {});
  it('cancel end of period = accès jusqu\'à fin', async () => {});
  
  // Failed payments
  it('retry auto jour 1, 3, 5 après échec', async () => {});
  it('dunning emails aux mêmes jours', async () => {});
  it('cancellation après 3 échecs', async () => {});
});
```

---

## 🌍 Tests Multi-Juridictions

### Pays à Tester (priorité revenue)

| Pays | TVA | Spécificité | Test Carte |
|------|-----|-------------|------------|
| 🇫🇷 France | 20% | SCA obligatoire | `4000002500003155` |
| 🇩🇪 Allemagne | 19% | SCA obligatoire | `4000002500003155` |
| 🇬🇧 UK | 20% | Post-Brexit rules | `4000008260003178` |
| 🇺🇸 USA | Variable | No VAT, state tax | `4242424242424242` |
| 🇨🇭 Suisse | 7.7% | Non-EU, CHF | `4242424242424242` |
| 🇨🇦 Canada | GST/PST | Multi-province | `4242424242424242` |
| 🇦🇺 Australie | 10% | GST | `4242424242424242` |

### Scénarios par Juridiction

```typescript
describe('Multi-jurisdiction', () => {
  it.each([
    { country: 'FR', ip: '185.21.1.1', vat: 20 },
    { country: 'DE', ip: '88.99.11.22', vat: 19 },
    { country: 'CH', ip: '185.12.34.56', vat: 7.7 },
    { country: 'US', ip: '8.8.8.8', vat: 0 },
  ])('applique bonne TVA pour $country', async ({ country, ip, vat }) => {
    // Détection IP → pays
    // Calcul prix avec TVA correcte
    // Vérification affichage dans Stripe Checkout
  });
});
```

### Compliance
- [ ] **GDPR**: Consentement stocké, droit à l'effacement testé
- [ ] **CGV**: Acceptation tracée avant paiement
- [ ] **Facturation**: Numérotation séquentielle, mentions légales
- [ ] **SCA**: Challenge 3D Secure pour EU/UK

---

## 📈 Tests de Conversion (Anti-Régression)

### Métriques à Protéger

| Métrique | Baseline | Seuil d'alerte |
|----------|----------|----------------|
| Conversion pricing → checkout | 15% | <12% |
| Conversion checkout → success | 70% | <60% |
| Trial → Paid conversion | 40% | <35% |
| Page load (LCP) | <2s | >3s |
| TTI (Time to Interactive) | <3.5s | >5s |

### Tests de Performance

```typescript
// ✅ Budget de performance
test('pricing page meets performance budget', async ({ page }) => {
  await page.goto('/pricing');
  
  const metrics = await page.evaluate(() =>
    JSON.parse(JSON.stringify(performance.timing))
  );
  
  const loadTime = metrics.loadEventEnd - metrics.navigationStart;
  expect(loadTime).toBeLessThan(2000); // 2s max
});
```

### A/B Testing Safety
- [ ] Feature flags testés avant activation
- [ ] Rollback plan en cas de baisse conversion
- [ ] Monitoring temps réel des funnels

---

## ✅ Checklist de Validation PR

### Avant tout merge sur `main`:

```markdown
## PR Checklist - QA Validation

### Code Quality
- [ ] Tests unitaires passent (`npm run test:unit`)
- [ ] Tests integration passent (`npm run test:integration`)
- [ ] Couverture >80% (fichiers modifiés)
- [ ] Lint + Prettier OK
- [ ] Pas de `console.log` ou `debugger`

### Paiement (si modifié)
- [ ] Tests Stripe passent (`npm run test:stripe`)
- [ ] Webhooks testés localement avec Stripe CLI
- [ ] Scénarios cartes déclinées testés
- [ ] SCA/3D Secure testé
- [ ] Trial flow testé
- [ ] Upgrade/downgrade testé

### E2E
- [ ] Tests E2E passent (`npm run test:e2e`)
- [ ] Screenshots visuels comparés (si UI modifiée)

### Documentation
- [ ] README mis à jour si nécessaire
- [ ] API docs mises à jour
- [ ] Changelog mis à jour

### Review
- [ ] 2 approbations minimum
- [ ] QA Engineer a approuvé (si paiement touché)
```

---

## 🖥️ Environnements de Test

### 1. Local (Développeur)

```bash
# Setup
npm install
npm run db:seed

# Tests
npm run test:unit        # Rapide, watch mode
npm run test:integration # Avec DB locale
npm run test:e2e         # Playwright headed

# Stripe CLI
stripe listen --forward-to localhost:8787/api/webhooks/stripe
```

### 2. CI (GitHub Actions)

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      
      - name: Unit Tests
        run: npm run test:unit -- --coverage
        
      - name: Integration Tests  
        run: npm run test:integration
        
      - name: E2E Tests
        run: npm run test:e2e
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
          
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

### 3. Staging (Pré-prod)

- [ ] Déploiement auto sur chaque PR
- [ ] Stripe en mode TEST
- [ ] Base de données isolée
- [ ] URL: `https://staging.business-plan-saas.workers.dev`

### 4. Production (Monitoring)

- [ ] Stripe en mode LIVE
- [ ] Alertes Sentry sur erreurs
- [ ] Dashboard temps réel des conversions
- [ ] Runbook pour incidents paiement

---

## 🚨 Alertes & Monitoring

### Seuils d'Alerte Critiques

```typescript
// À implémenter dans Sentry/Datadog
const ALERTS = {
  // Paiement
  'payment.failure.rate': { threshold: 5, window: '5m' },
  'webhook.error.rate': { threshold: 1, window: '1m' },
  'checkout.abandon.rate': { threshold: 40, window: '1h' },
  
  // Performance
  'api.response.p95': { threshold: 500, window: '5m' }, // ms
  'page.load.p95': { threshold: 3000, window: '5m' }, // ms
  
  // Business
  'conversion.drop': { threshold: -20, window: '1h' }, // % vs baseline
};
```

### Runbook - Incident Paiement

```markdown
# 🚨 INCIDENT PAIEMENT - Runbook

## Phase 1: Détection (< 2 min)
1. Vérifier Stripe Status: https://status.stripe.com
2. Vérifier Cloudflare Status
3. Vérifier logs Sentry

## Phase 2: Containment (< 5 min)
1. Activer maintenance mode si nécessaire
2. Stopper les nouveaux paiements si risque de double-charge
3. Notifier équipe Slack #incidents

## Phase 3: Investigation
1. Check webhooks Stripe (Dashboard → Developers → Webhooks)
2. Check D1 errors (Wrangler logs)
3. Check Worker errors (Cloudflare dashboard)

## Phase 4: Resolution
1. Fix root cause
2. Replay webhooks manquants si nécessaire
3. Vérifier tous les paiements période incident

## Phase 5: Post-mortem
- Timeline complète
- Root cause analysis
- Actions préventives
```

---

## 📋 Issues GitHub à Créer

### Issue #1: Setup Environnement de Test
```markdown
**Objectif:** Mettre en place l'infrastructure de test complète

**Tasks:**
- [ ] Configurer Vitest pour Cloudflare Workers
- [ ] Setup Miniflare pour tests d'intégration
- [ ] Configurer Playwright pour E2E
- [ ] Setup Stripe CLI pour webhooks locaux
- [ ] Créer fixtures de test (users, subscriptions)
- [ ] Configurer CI GitHub Actions
- [ ] Setup base de données de test (D1)

**Acceptance:**
- `npm run test:all` passe en local
- CI verte sur main
- Coverage report généré
```

### Issue #2: Stratégie de Test - Critères d'Acceptance
```markdown
**Objectif:** Définir les critères d'acceptance par feature

**Tasks:**
- [ ] Documenter critères pour chaque endpoint API
- [ ] Définir scenarios E2E critiques
- [ ] Créer matrice de couverture
- [ ] Valider avec équipe produit

**Features à couvrir:**
- [ ] Authentification (magic link)
- [ ] Génération business plan (AI)
- [ ] Système de templates
- [ ] Export PDF/Word
- [ ] Subscription & Billing
- [ ] Admin dashboard
```

### Issue #3: Tests Stripe Complets
```markdown
**Objectif:** 100% de couverture sur le funnel de paiement

**PRIORITÉ: CRITIQUE - Bloquant pour production**

**Tests Webhooks:**
- [ ] checkout.session.completed
- [ ] invoice.payment_succeeded/failed
- [ ] customer.subscription.updated/deleted
- [ ] customer.subscription.trial_will_end
- [ ] charge.dispute.created

**Tests Scénarios:**
- [ ] Paiement carte valide
- [ ] Paiement SCA/3D Secure
- [ ] Carte déclinée → retry
- [ ] Trial 14j → conversion
- [ ] Trial 14j → cancel
- [ ] Upgrade avec prorata
- [ ] Downgrade end-of-period
- [ ] Cancel immédiat vs end-of-period
- [ ] Webhook duplicate (idempotency)
- [ ] Webhook signature invalide (sécurité)

**Acceptance:**
- Tous les tests passent en CI
- Tests exécutés sur chaque PR touchant billing/
```

### Issue #4: Checklist Validation PR + Review QA
```markdown
**Objectif:** Garantir la qualité via process de review

**Tasks:**
- [ ] Créer PR template avec checklist QA
- [ ] Setup branch protection rules
- [ ] Configurer required checks CI
- [ ] Créer guide de review pour devs
- [ ] Setup CODEOWNERS (QA obligatoire sur billing)

**Rules:**
- 2 approbations minimum
- CI verte obligatoire
- QA Engineer approval si `billing/` modifié
- Coverage non-régressif
```

### Issue #5: Tests Multi-Juridictions
```markdown
**Objectif:** Garantir compliance internationale

**Tests par pays:**
- [ ] Détection pays par IP
- [ ] Calcul TVA correct
- [ ] Affichage prix TTC
- [ ] Facturation conforme
- [ ] SCA si applicable

**Pays:** FR, DE, UK, US, CH, CA, AU

**Compliance:**
- [ ] GDPR consent
- [ ] CGV acceptance tracée
- [ ] Facturation séquentielle
```

### Issue #6: Tests Conversion & Performance
```markdown
**Objectif:** Prévenir les régressions de conversion

**Tasks:**
- [ ] Setup Lighthouse CI
- [ ] Budgets de performance
- [ ] Tests de load time
- [ ] Monitoring funnel analytics
- [ ] Alertes conversion drop

**Métriques:**
- LCP < 2s
- Conversion pricing→checkout > 12%
- Conversion checkout→success > 60%
```

---

## 🎯 Métriques de Succès QA

| Sprint | Objectif | Métrique |
|--------|----------|----------|
| 1 | Setup test env | CI + tests auto passent |
| 2 | Couverture core | 80% unit, 50% integration |
| 3 | Paiement 100% | Tests Stripe complets |
| 4 | Multi-juridiction | 7 pays testés |
| 5 | E2E complet | 20 scénarios critiques |
| 6 | Monitoring | Alertes temps réel actives |

---

## 🔥 Principe Fondamental

> **"Si le paiement ne marche pas, rien ne marche."**

**Règles d'or:**
1. Aucun code billing mergé sans tests
2. Aucun hotfix sans test de régression
3. Aucun déploiement vendredi (paiement critique)
4. Toute erreur de paiement = P0 = réveil de nuit autorisé

---

*Document créé par le QA Engineer*  
*Dernière mise à jour: 2026-02-16*
