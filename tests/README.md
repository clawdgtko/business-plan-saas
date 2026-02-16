# 🧪 Tests - Business Plan SaaS

## Structure

```
tests/
├── unit/           # Tests unitaires (Vitest)
├── integration/    # Tests d'intégration (Vitest + Miniflare)
├── stripe/         # Tests Stripe critiques (Vitest + API Stripe Test)
└── e2e/            # Tests end-to-end (Playwright)
```

## Installation

```bash
npm install
npx playwright install
```

## Exécution

### Tous les tests
```bash
npm run test:all
```

### Par type
```bash
# Unit (rapide, watch mode)
npm run test:unit
npm run test:unit -- --watch

# Integration (DB locale)
npm run test:integration

# Stripe (⚠️ Nécessite clés Stripe Test)
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
npm run test:stripe

# E2E (Playwright)
npm run test:e2e
npm run test:e2e -- --headed  # Avec browser visible
npm run test:e2e -- --debug   # Mode debug
```

## Cartes de Test Stripe

| Scénario | Carte | Usage |
|----------|-------|-------|
| Paiement OK | `4242424242424242` | Cas nominal |
| SCA Required | `4000002500003155` | Test 3D Secure |
| Fonds insuffisants | `4000000000009995` | Test échec |
| Carte expirée | `4000000000000069` | Test erreur |
| CVC incorrect | `4000000000000127` | Test validation |

## Checklist Avant PR

```bash
# Lancer tous les tests
npm run test:all

# Vérifier coverage
npm run test:unit -- --coverage

# Vérifier types
npm run typecheck

# Vérifier lint
npm run lint
```

## Debugging

### Tests Stripe
```bash
# Forward webhooks localement
stripe listen --forward-to localhost:8787/api/webhooks/stripe

# Déclencher un event de test
stripe trigger checkout.session.completed
```

### Tests E2E
```bash
# Mode UI
npx playwright test --ui

# Debug spécifique test
npx playwright test payment.spec.ts --debug

# Voir rapport
npx playwright show-report
```

## Couverture Requise

| Type | Minimum | Objectif |
|------|---------|----------|
| Unit | 80% | 90% |
| Integration | 70% | 80% |
| Stripe | 100% | 100% |
| E2E | Scénarios critiques | 20+ flows |

## 🚨 Règles Critiques

1. **Jamais skip les tests Stripe**
2. **Tout bug de paiement = test de régression**
3. **Coverage ne doit pas baisser**
4. **E2E doit passer avant chaque release**
