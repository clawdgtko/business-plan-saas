# 🚀 CI/CD Pipeline - Documentation

## Workflows GitHub Actions

### 1. CI - Build & Test (`ci.yml`)

**Déclencheur:** Push sur toutes les branches, PR vers main/develop

**Jobs:**
- `lint` - ESLint + TypeScript check
- `test-unit` - Tests unitaires + coverage
- `test-integration` - Tests d'intégration
- `security-scan` - npm audit + Semgrep
- `build` - Build et upload artifacts

**Parallélisme:** Les jobs lint, test-unit et security-scan tournent en parallèle.

---

### 2. Deploy - Staging (`deploy-staging.yml`)

**Déclencheur:** Push sur `develop`, ou manuel

**Étapes:**
1. Install dependencies
2. Deploy to Cloudflare Workers (staging)
3. Apply D1 migrations
4. Smoke tests (health checks)
5. Notify Slack

**URL:** https://staging.business-plan.app

---

### 3. Deploy - Production (`deploy-production.yml`)

**Déclencheur:** Release publiée, ou manuel avec confirmation

**Protection:**
- Review required par Lead Dev
- Confirmation manuelle si workflow_dispatch
- Tag format: `vX.Y.Z`

**Étapes:**
1. Pre-deploy checks
2. Deploy to Cloudflare Workers (production)
3. Apply D1 migrations
4. Smoke tests + extended health checks
5. Notify Slack (success/failure)
6. Rollback on failure (alert)

**URL:** https://business-plan.app

---

## 🔄 Git Flow

```
feature/xxx ──┐
              ├──► develop ──► main
hotfix/xxx ───┘     │           │
                (staging)   (production)
```

### Branches protégées:
- `main`:
  - Require PR
  - Require 1 review (Lead Dev)
  - CI must pass
  - No direct push

- `develop`:
  - Require PR
  - CI must pass

---

## 📝 Checklist MEP

### Avant MEP:
- [ ] Tests passent en staging
- [ ] Changelog mis à jour
- [ ] Version bumpée
- [ ] Review Lead Dev approuvée
- [ ] Release notes prêtes

### Pendant MEP:
- [ ] Deploy production lancé
- [ ] Smoke tests OK
- [ ] Monitor 30min post-deploy

### Après MEP:
- [ ] Annoncer dans #releases
- [ ] Mettre à jour la status page
- [ ] Vérifier dashboards (erreurs, latence)

---

## 🚨 Rollback

### Procédure rapide:

```bash
# Identifier la dernière version stable
git log --oneline --tags | head -5

# Redeploy la version précédente
git checkout v1.0.0  # version stable
wrangler deploy --env production
```

### Via GitHub Actions:
1. Aller sur Actions → Deploy - Production
2. Run workflow → Sélectionner le commit précédent
3. Confirmer avec "DEPLOY"

---

## 📊 Monitoring Post-Deploy

Vérifier après chaque MEP:
- [ ] https://business-plan.app/health
- [ ] Error rate < 0.1%
- [ ] p95 latency < 200ms
- [ ] No 5xx errors spike

Dashboards:
- [Grafana/Baselime](https://...)
- [Cloudflare Analytics](https://dash.cloudflare.com)

---

## 🔧 Configuration locale

```bash
# Simuler le CI localement
cd worker
npm ci
npm run lint
npm run test

# Deploy staging
wrangler deploy --env staging

# Deploy production (attention!)
wrangler deploy --env production
```

---

## 🐛 Debugging

### Voir les logs Workers:
```bash
wrangler tail --env staging
wrangler tail --env production
```

### Vérifier les secrets:
```bash
wrangler secret list --env staging
wrangler secret list --env production
```

---

*Dernière mise à jour: 2025-02-16*
*Par: @clawdgtko (DevOps)*
