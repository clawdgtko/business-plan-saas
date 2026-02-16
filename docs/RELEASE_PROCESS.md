# 🚀 Processus de Release

> **Version:** 1.0.0  
> **Dernière mise à jour:** 2025-02-16  
> **Responsable:** Release Manager (@release-manager)

---

## 📋 Vue d'Ensemble

Ce document définit le processus de release pour garantir **0 downtime** vers l'objectif de 1M€ MRR.

### Principes Fondamentaux

1. **🚫 Pas de commit sur `main`** — Toujours passer par des PR
2. **🔒 Feature freeze obligatoire** avant chaque release
3. **✅ QA validation requise** avant merge dans `main`
4. **📊 Blue/Green deployment** pour 0 downtime
5. **🚩 Feature flags** pour déploiement progressif

---

## 🌿 Workflow Git

```
main (production — PROTECTED 🔒)
  ↑
develop (staging — integration)
  ↑
feature/nom-feature
  ↑
hotfix/critical-bug
```

### Branches

| Branche | But | Protection |
|---------|-----|------------|
| `main` | Production stable | ✅ Force PR + 2 approbations |
| `develop` | Integration / Staging | ✅ Force PR + 1 approbation |
| `feature/*` | Nouvelles features | ❌ Push autorisé |
| `hotfix/*` | Corrections urgentes | ✅ PR express + QA |
| `release/*` | Release candidates | ✅ Freeze + QA complète |

---

## 🔄 Processus de Release (6 Étapes)

### Étape 1: Feature Freeze 📅

**Timing:** Jeudi à 18h00 (hebdomadaire)

```bash
# Créer la branche de release
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Bump version
npm run version: bump minor  # ou patch/major
git commit -am "chore(release): v1.2.0"
git push origin release/v1.2.0
```

**Checklist:**
- [ ] Date de freeze annoncée 48h à l'avance
- [ ] Toutes les features en cours sont mergées dans `develop`
- [ ] Aucune nouvelle feature n'entre après le freeze
- [ ] Bugfixes uniquement avec validation QA

---

### Étape 2: QA Validation 🔍

**Timing:** Vendredi

**Créer la Release Candidate:**
```bash
# Tag RC
npm run version:tag rc
# Crée: v1.2.0-rc.1
```

**Checklist QA:**
- [ ] Tests automatisés passent (100%)
- [ ] Tests d'intégration Stripe (sandbox) OK
- [ ] Tests manuels critiques validés
- [ ] Performance tests OK (latence < 200ms P95)
- [ ] Migration D1 testée

**Si KO:**
- Corriger les bugs
- Nouveau tag RC: `v1.2.0-rc.2`
- Re-validation QA

---

### Étape 3: Staging Deployment 🧪

**Timing:** Vendredi soir / Lundi matin

```bash
# Déploiement automatique via CI
git push origin release/v1.2.0
# → Déploie sur staging automatiquement
```

**Validation Staging:**
- [ ] Smoke tests passent
- [ ] Flow utilisateur complet testé
- [ ] Webhooks Stripe fonctionnent
- [ ] Données cohérentes

---

### Étape 4: Smoke Tests Final 🔥

**Timing:** Lundi matin

**Tests critiques:**
```bash
# Tests de smoke automatisés
npm run test:smoke

# Tests manuels:
# - Signup → Checkout → Subscription
# - Génération business plan
# - Export PDF
```

**Décision Go/No-Go:**
- 🟢 **GO:** Tous les tests passent → Passer à l'étape 5
- 🔴 **NO-GO:** Bugs critiques → Corriger, nouveau RC

---

### Étape 5: Production Deployment 🚀

**Timing:** Mardi matin (créneau faible trafic: 09h-10h CET)

**Déploiement Blue/Green:**
```bash
# 1. Déployer sur l'environnement "Green" (inactif)
wrangler deploy --env green

# 2. Health checks
npm run health:check

# 3. Switch DNS vers Green (blue/green)
# Via Cloudflare Workers routes

# 4. Monitor 30 minutes
npm run monitor:active

# 5. Si tout OK → promotion comme stable
# Si KO → rollback immédiat
```

**Feature Flags:**
```bash
# Déployer avec flags OFF
curl -X POST /api/admin/features/new-dashboard/disable

# Activer progressivement:
# 10% → 50% → 100% sur plusieurs heures
```

---

### Étape 6: Post-Release Monitoring 📊

**Timing:** 24-48h post-release

**Checklist:**
- [ ] Monitoring dashboards OK (Sentry, Cloudflare)
- [ ] Error rate < 0.1%
- [ ] Latence P95 < 200ms
- [ ] Revenue tracking OK (Stripe)
- [ ] Aucune alerte critique

**Communication:**
- [ ] Release notes publiées
- [ ] Slack #releases
- [ ] Email équipe (si changements majeurs)

---

## 🏷️ Versioning (SemVer)

### Format: `MAJOR.MINOR.PATCH`

| Type | Changement | Exemple |
|------|------------|---------|
| **MAJOR** | Breaking changes (API, DB incompatible) | `1.x.x` → `2.0.0` |
| **MINOR** | Nouvelles features (backward compatible) | `x.2.x` → `x.3.0` |
| **PATCH** | Bug fixes (backward compatible) | `x.x.3` → `x.x.4` |

### Release Candidates
```
v1.3.0-rc.1 → v1.3.0-rc.2 → v1.3.0
```

### Commandes
```bash
# Bump version
npm run version:bump patch   # 1.2.3 → 1.2.4
npm run version:bump minor   # 1.2.3 → 1.3.0
npm run version:bump major   # 1.2.3 → 2.0.0

# Tag RC
npm run version:tag rc       # 1.2.3 → 1.3.0-rc.1

# Release finale
npm run version:release      # 1.3.0-rc.2 → 1.3.0
```

---

## 🚩 Feature Flags

### Quand utiliser?
- Nouvelle feature risquée
- A/B testing
- Déploiement progressif
- Kill switch de sécurité

### Process
1. Développer avec flag OFF par défaut
2. Merge dans `develop` → staging
3. Déployer en prod avec flag OFF
4. Activer progressivement (10% → 50% → 100%)
5. Monitorer et valider

### Rollback instantané
```bash
# Si problème détecté
curl -X POST /api/admin/features/broken-feature/disable
# → Instantané, 0 déploiement
```

---

## 🔄 Rollback Strategy

### Niveau 1: Feature Flag (30 secondes)
```bash
# Désactiver la feature problématique
curl -X POST /api/admin/features/xxx/disable
```

### Niveau 2: Workers Rollback (2 minutes)
```bash
# Revenir à la version précédente
wrangler rollback --name business-plan-saas
```

### Niveau 3: Database Rollback (15 minutes)
```bash
# Restaurer backup D1 (si corruption)
wrangler d1 backup restore PROD_DB backup-id
```

**Voir:** [ROLLBACK_PLAYBOOK.md](./ROLLBACK_PLAYBOOK.md)

---

## 📅 Calendrier de Release

### Option recommandée: Release Hebdomadaire

| Jour | Activité | Owner |
|------|----------|-------|
| **Lundi** | Smoke tests finaux + Go/No-Go | Release Manager |
| **Mardi** | Production deployment | DevOps |
| **Mercredi** | Monitoring + Hotfixes si besoin | Team |
| **Jeudi** | Feature freeze + RC creation | Release Manager |
| **Vendredi** | QA validation | QA Engineer |

### Exceptions
- **No-Release:** Black Friday, fin d'année, lancement marketing
- **Hotfix:** Hors calendrier si bug critique

---

## 🚨 Hotfix Process (Urgence)

```bash
# 1. Créer branche hotfix depuis main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix minimal + tests
git commit -am "fix: description du bug"

# 3. PR vers main (review express: 1 reviewer OK)
gh pr create --title "HOTFIX: ..." --label hotfix

# 4. Après merge → cherry-pick dans develop
git checkout develop
git cherry-pick <commit-hotfix>

# 5. Post-mortem dans 24h
```

---

## 📊 KPIs de Release

| Métrique | Cible | Outil |
|----------|-------|-------|
| Lead time (commit → prod) | < 3 jours | GitHub |
| Deployment frequency | 1/semaine | GitHub |
| Change failure rate | < 5% | Sentry |
| MTTR (Mean Time To Recovery) | < 30 min | Cloudflare |
| Test coverage | > 80% | Jest |

---

## 📝 Templates & Checklists

### Template de PR
Voir: `.github/pull_request_template.md`

### Checklist Pre-Release
```markdown
- [ ] Version bumpée
- [ ] Changelog mis à jour
- [ ] Tests passent
- [ ] QA approval
- [ ] Feature flags configurés
- [ ] Rollback plan ready
```

---

## 👥 Rôles & Responsabilités

| Rôle | Responsabilités |
|------|-----------------|
| **Release Manager** | Coordonne les releases, décide Go/No-Go, communique |
| **Lead Dev** | Code review, architecture, validation technique |
| **QA Engineer** | Tests, validation qualité, sign-off release |
| **DevOps** | Déploiement, monitoring, infrastructure |
| **PM** | Priorisation, date de freeze, validation métier |

---

## 📚 Documents Liés

- [CHANGELOG.md](../CHANGELOG.md)
- [ROLLBACK_PLAYBOOK.md](./ROLLBACK_PLAYBOOK.md)
- [FEATURE_FLAGS.md](./FEATURE_FLAGS.md)
- [.github/pull_request_template.md](../.github/pull_request_template.md)

---

## 💬 Communication

- **#releases** — Annonces de releases
- **#incidents** — Problèmes en production
- **#dev-general** — Discussion générale

---

<p align="center">
  <strong>🎯 Objectif: 1M€ MRR avec 0 downtime</strong><br>
  <em>Qualité > Vélocité. Toujours.</em>
</p>
