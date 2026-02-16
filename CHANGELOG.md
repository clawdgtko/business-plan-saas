# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added
- Setup initial du processus de release
- Documentation versioning SemVer
- Templates de pull requests
- Workflow Git avec protection des branches

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

---

## [1.0.0] - 2025-02-16

### Added
- 🚀 Lancement du projet Business Plan SaaS
- Architecture Cloudflare Workers + Hono + Vue.js
- Intégration Stripe pour paiements
- Base de données D1 (SQLite)
- Auth par magic link
- Générateur IA de business plans
- Système de templates
- CI/CD avec tests automatisés
- Documentation QA complète

### Security
- Protection routes API
- Validation webhooks Stripe
- Sanitization inputs

---

## Template de Release

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- 

### Changed
- 

### Deprecated
- 

### Removed
- 

### Fixed
- 

### Security
- 
```

---

## Guide de Contribution

### Comment ajouter une entrée?

1. Créer une PR avec vos changements
2. Ajouter une ligne sous `[Unreleased]` dans la section appropriée
3. Utiliser les verbes d'action:
   - **Added** pour nouvelles fonctionnalités
   - **Changed** pour changements comportement
   - **Deprecated** pour features obsolètes
   - **Removed** pour suppressions
   - **Fixed** pour corrections de bugs
   - **Security** pour vulnérabilités

### Quand bump la version?

| Changement | Action |
|------------|--------|
| Bug fix | Bump PATCH (1.0.0 → 1.0.1) |
| Nouvelle feature | Bump MINOR (1.0.0 → 1.1.0) |
| Breaking change | Bump MAJOR (1.0.0 → 2.0.0) |
