# 🔒 Configuration GitHub - Protection des Branches

Ce document explique comment configurer les protections de branche dans GitHub.

## ⚙️ Configuration Requise

### Branche `main` (Production)

Aller dans **Settings > Branches > Add rule**

```
Branch name pattern: main

✅ Restrict deletions
✅ Require linear history
✅ Require deployments to succeed (si configuré)

✅ Require a pull request before merging
   ✅ Require approvals: 2
   ✅ Dismiss stale PR approvals when new commits are pushed
   ✅ Require review from Code Owners
   ✅ Require approval of the most recent reviewable push

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Status checks:
   - test:unit
   - test:integration
   - test:stripe
   - lint
   - typecheck

✅ Require conversation resolution before merging
✅ Require signed commits (optionnel)
✅ Include administrators (même les admins doivent suivre les règles)

❌ Allow force pushes
❌ Allow deletions
```

### Branche `develop` (Staging)

```
Branch name pattern: develop

✅ Restrict deletions

✅ Require a pull request before merging
   ✅ Require approvals: 1
   ✅ Dismiss stale PR approvals when new commits are pushed
   ✅ Require review from Code Owners

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Status checks:
   - test:unit
   - test:integration
   - lint
   - typecheck

❌ Allow force pushes
❌ Allow deletions
```

### Branches `release/*` (Release Candidates)

```
Branch name pattern: release/*

✅ Require a pull request before merging
   ✅ Require approvals: 2
   ✅ Require review from Code Owners (QA + Lead)

✅ Require status checks to pass before merging
   Status checks: ALL (même que main)

❌ Allow force pushes
```

---

## 🔑 Permissions Requises

### Rôles GitHub Recommandés

| Rôle | Permissions | Utilisateurs |
|------|-------------|--------------|
| **Admin** | Full access | @clawdgtko (PM) |
| **Maintain** | Push to protected branches | @lead-dev |
| **Write** | Push to non-protected, create PRs | @devops, @qa-engineer |
| **Triage** | Manage issues/PRs | @frontend-dev |

### Team Structure

Créer ces teams dans **Settings > Teams**:

```
@business-plan-saas/release-managers
  - @release-manager (you)
  - @lead-dev

@business-plan-saas/qa
  - @qa-engineer
  - @clawdgtko

@business-plan-saas/devops
  - @devops
  - @lead-dev
```

---

## 🚫 Règles Importantes

### Interdictions Strictes

1. **PAS de push direct sur `main`**
   - Tout changement passe par une PR
   - 2 approbations obligatoires
   - Tests passants requis

2. **PAS de force push**
   - Jamais sur les branches protégées
   - Même pas pour les admins

3. **PAS de merge si checks KO**
   - Rouge = pas de merge
   - Fixer puis recommencer

### Exceptions (Hotfix)

```
Cas d'urgence (P0 - paiement cassé):
1. Créer branche hotfix/critical depuis main
2. Fix minimal + tests
3. PR avec review express (1 reviewer OK)
4. Bypass possible avec justification
5. Post-mortem obligatoire sous 24h
```

---

## 📝 Checklist de Configuration

- [ ] Protection `main` configurée (2 approbations)
- [ ] Protection `develop` configurée (1 approbation)
- [ ] CODEOWNERS à jour
- [ ] Status checks configurés
- [ ] Teams créées
- [ ] Notifications Slack configurées
- [ ] Documentation partagée à l'équipe

---

## 🔗 Liens Utiles

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CODEOWNERS syntax](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Required status checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
