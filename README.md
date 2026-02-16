# 🚀 Business Plan SaaS

> Générateur IA de business plans professionnels  
> Objectif: **1M€ MRR** | Stack: Cloudflare Workers + Hono + Vue.js + Stripe + D1

---

## 🎯 Vue d'Ensemble

```
┌─────────────────┐     ┌─────────────┐     ┌──────────────┐
│   Vue.js SPA    │────▶│  Hono API   │────▶│  D1 Database │
│   (Frontend)    │◄────│ (Cloudflare)│◄────│   (SQLite)   │
└─────────────────┘     └──────┬──────┘     └──────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │    Stripe   │
                        │  (Paiement) │
                        └─────────────┘
```

---

## 🏁 Démarrage Rapide

```bash
# 1. Cloner et installer
git clone https://github.com/clawdgtko/business-plan-saas.git
cd business-plan-saas
npm install

# 2. Configurer environnement
cp .env.example .env
# Éditer .env avec vos clés

# 3. Démarrer DB locale
npm run db:migrate
npm run db:seed

# 4. Lancer dev server
npm run dev
```

---

## 🧪 Tests (CRITIQUE - Voir `docs/qa-strategy.md`)

### Commandes essentielles

```bash
# ⚡ Rapide - pendant le dev
npm run test:unit:watch

# 🔗 Avant de commit
npm run test:all

# 💳 Avant merge (si paiement touché)
npm run test:stripe
```

### Structure des tests

```
tests/
├── unit/           # Logique métier
├── integration/    # API + DB  
├── stripe/         # 💳 Paiement (CRITIQUE)
└── e2e/            # Flows utilisateur
```

> **⚠️ RÈGLE D'OR:** Aucun code billing mergé sans tests Stripe passants.

---

## 📁 Structure du Projet

```
.
├── src/
│   ├── api/           # Routes Hono
│   ├── billing/       # 💳 Logique paiement
│   ├── components/    # Composants Vue
│   ├── db/            # Schémas et migrations D1
│   ├── lib/           # Utilitaires
│   ├── stripe/        # 💳 Intégration Stripe
│   └── webhooks/      # 💳 Handlers webhooks
├── tests/             # Tests (voir ci-dessus)
├── docs/
│   └── qa-strategy.md # 📋 Stratégie QA complète
├── .github/
│   ├── workflows/     # CI/CD QA
│   └── pull_request_template.md
├── CODEOWNERS         # Reviewers requis
└── wrangler.toml      # Config Cloudflare
```

---

## 💳 Développement Stripe

```bash
# Forward webhooks en local
npm run stripe:listen

# Déclencher un event de test
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```

### Cartes de test

| Scénario | Carte |
|----------|-------|
| ✅ Paiement OK | `4242424242424242` |
| 🔒 SCA/3D Secure | `4000002500003155` |
| ❌ Fonds insuffisants | `4000000000009995` |
| ❌ Carte expirée | `4000000000000069` |

---

## 🚀 Déploiement

### Staging (auto)
```bash
git push origin develop
# Déploie automatiquement sur staging
```

### Production
```bash
git checkout main
git merge develop --no-ff
npm run test:all  # Doit passer
npm run deploy
```

---

## 👥 Équipe & Rôles

| Rôle | Responsable | Focus |
|------|-------------|-------|
| **PM** | @clawdgtko | Vision produit, priorisation |
| **Fullstack Dev** | TBD | Features, architecture |
| **QA Engineer** | @clawdgtko | Qualité, tests paiement |
| **DevOps** | TBD | CI/CD, monitoring |

---

## 📋 Processus de Développement

### Workflow Git

```
main (production)
  ↑
develop (staging) ← feature/payment-flow
  ↑
feature/nom-feature
```

### Checklist PR

- [ ] Tests passent (`npm run test:all`)
- [ ] Couverture >80%
- [ ] Lint & TypeScript OK
- [ ] **QA Engineer approval** (si billing)
- [ ] 2+ approbations

---

## 📚 Documentation

- [Stratégie QA Complète](./docs/qa-strategy.md)
- [Guide Tests](./tests/README.md)
- [API Documentation](./docs/api.md) (à venir)

---

## 🎯 Roadmap

### Sprint 1 - Fondations
- [ ] Setup architecture
- [ ] Auth (magic link)
- [ ] CI/CD tests

### Sprint 2 - Paiement V1
- [ ] Intégration Stripe Checkout
- [ ] Webhooks de base
- [ ] **Tests Stripe 100%**

### Sprint 3 - AI Core
- [ ] Génération business plan
- [ ] Système de templates

### Sprint 4 - Scale
- [ ] Multi-juridiction
- [ ] Analytics
- [ ] Performance

---

## 🚨 Alertes & Monitoring

- **Stripe:** https://dashboard.stripe.com
- **Errors:** Sentry (à configurer)
- **Analytics:** Plausible/PostHog (à configurer)

---

## 📞 Support

- **Slack:** #business-plan-saas
- **Issues:** GitHub Issues
- **Incidents:** P0 = réveil de nuit autorisé (paiement cassé)

---

<p align="center">
  <strong>🎯 Objectif: 1M€ MRR</strong><br>
  <em>Zéro bug de paiement. Qualité avant vélocité.</em>
</p>
