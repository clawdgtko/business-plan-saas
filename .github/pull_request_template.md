## 📝 Description

<!-- Décrivez brièvement ce que fait cette PR -->

## 🎯 Type de Changement

<!-- Cochez ce qui s'applique -->

- [ ] 🐛 Bug fix (correction non-breaking)
- [ ] ✨ Nouvelle feature (ajout non-breaking)
- [ ] 💥 Breaking change (modif incompatible API/DB)
- [ ] 📚 Documentation
- [ ] 🏗️ Refactoring
- [ ] ⚡ Performance
- [ ] 🔒 Sécurité

## 🧪 Tests

<!-- IMPORTANT: Cocher et remplir -->

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration passent
- [ ] **Tests Stripe passent** (si billing touché)
- [ ] Coverage maintenue > 80%

```bash
# Commandes de test exécutées
npm run test:unit
npm run test:integration
npm run test:stripe  # si applicable
```

## 📋 Checklist

### Code Quality
- [ ] Code suit les conventions du projet
- [ ] Linting passe (`npm run lint`)
- [ ] TypeScript compile sans erreurs (`npm run typecheck`)
- [ ] Pas de `console.log` oubliés
- [ ] Pas de code commenté inutile

### Documentation
- [ ] Changelog mis à jour (si user-facing)
- [ ] README/API docs mis à jour (si nécessaire)
- [ ] Commentaires complexes expliqués

### Review
- [ ] Self-review effectuée
- [ ] PR de taille raisonnable (< 500 lignes idéalement)
- [ ] Commits propres et atomiques

## 🔗 Issues Liées

<!-- Link les issues résolues -->
Fixes #
Relates to #

## 🖼️ Screenshots (si UI)

<!-- Ajoutez des screenshots pour les changements visuels -->

## 🚩 Feature Flag

<!-- Si applicable -->
- [ ] Feature protégée par flag: `flag_name`
- [ ] Flag OFF par défaut
- [ ] Migration pour créer le flag (si nouveau)

## 💳 Paiement / Billing

<!-- À remplir si changements sur Stripe/billing -->
- [ ] Webhooks testés en local (`stripe trigger`)
- [ ] Scénarios de paiement testés:
  - [ ] Checkout succès
  - [ ] Paiement échoué
  - [ ] Subscription upgrade/downgrade
  - [ ] Cancellation
- [ ] **QA Engineer approval requise**

## 🚀 Déploiement

- [ ] Migration DB incluse (si schema changé)
- [ ] Feature flag configuré (si applicable)
- [ ] Rollback plan identifié

## 📝 Notes pour le Reviewer

<!-- Informations utiles pour la review -->

---

## 👥 Reviewers

<!-- Laisser vide — assigné automatiquement via CODEOWNERS -->
