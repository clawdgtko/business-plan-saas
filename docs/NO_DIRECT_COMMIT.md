## 🚫 COMMIT DIRECT SUR MAIN INTERDIT

Ce repo utilise un workflow strict avec **Pull Requests obligatoires**.

### ❌ Ne FAITES PAS

```bash
# INTERDIT - Push direct sur main
git checkout main
git push origin main  # ❌ REJETÉ

# INTERDIT - Merge local vers main
git checkout main
git merge feature/xxx  # ❌ REJETÉ
git push origin main
```

### ✅ Workflow Correct

```bash
# 1. Créer une branche feature
git checkout develop
git pull origin develop
git checkout -b feature/ma-super-feature

# 2. Développer et commiter
git add .
git commit -m "feat: ajoute la super feature"
git push origin feature/ma-super-feature

# 3. Créer une Pull Request
git pr create --title "feat: ma super feature" --body "..."

# 4. Attendre les reviews
# - 1 approbation pour develop
# - 2 approbations + QA pour main

# 5. Merge via GitHub UI uniquement
```

### 🔒 Protections en Place

| Branche | Approbations Requises | Reviews |
|---------|----------------------|---------|
| `main` | 2 | Lead + QA obligatoires |
| `develop` | 1 | Lead ou dev |
| `feature/*` | 0 | Push libre |

### 🆘 En Cas de Problème

**Je ne peux pas push:**
→ C'est normal ! Créez une PR.

**J'ai besoin d'urgence (hotfix):**
→ Branche `hotfix/xxx` depuis `main` + PR express.

**J'ai un conflit:**
```bash
git checkout feature/ma-branche
git pull origin develop
git rebase develop
# Résoudre les conflits
git push origin feature/ma-branche --force-with-lease
```

### 📖 Documentation

- [Process Release](./RELEASE_PROCESS.md)
- [Protection Branches](./GITHUB_PROTECTIONS.md)
- [Template PR](../.github/pull_request_template.md)

---

**Questions?** → Ping @release-manager sur Slack
