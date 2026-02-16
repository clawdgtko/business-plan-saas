## 📋 PR Checklist - QA Validation

### 🎯 Contexte
<!-- Décrivez brièvement ce que fait cette PR -->

### 🔗 Issue liée
Closes #

---

### ✅ Code Quality
- [ ] Tests unitaires passent (`npm run test:unit`)
- [ ] Tests intégration passent (`npm run test:integration`)
- [ ] Couverture >80% sur fichiers modifiés
- [ ] Lint (`npm run lint`) passe
- [ ] Prettier (`npm run format:check`) passe
- [ ] TypeScript (`npm run typecheck`) passe
- [ ] Pas de `console.log` ou `debugger` en production

### 💳 Paiement (⚠️ SI MODIFIÉ)
<!-- Cocher uniquement si du code billing/stripe est modifié -->
- [ ] Tests Stripe passent (`npm run test:stripe`)
- [ ] Webhooks testés avec Stripe CLI
- [ ] Scénarios cartes déclinées testés
- [ ] SCA/3D Secure testé
- [ ] Trial flow testé
- [ ] Upgrade/downgrade testé
- [ ] Idempotency webhooks vérifiée
- [ ] **QA Engineer a approuvé**

### 🧪 E2E
- [ ] Tests E2E passent (`npm run test:e2e`)
- [ ] Screenshots visuels comparés (si UI modifiée)
- [ ] Funnel de conversion testé

### 🌍 International (si applicable)
- [ ] Multi-juridiction testé
- [ ] TVA calculée correctement
- [ ] Traductions à jour

### 📝 Documentation
- [ ] README mis à jour
- [ ] API docs mises à jour
- [ ] CHANGELOG.md mis à jour
- [ ] Commentaires de code pertinents

### 🚀 Déploiement
- [ ] Variables d'environnement documentées
- [ ] Migration DB si nécessaire
- [ ] Feature flag si nécessaire

---

### 👥 Reviewers Requis
- [ ] 1+ Dev review
- [ ] QA Engineer review (si billing touché)

### 🚨 Breaking Changes?
- [ ] Non
- [ ] Oui (décrire ci-dessous)

<!-- Si breaking changes, décrivez la migration nécessaire -->

---

**Rappel:**  
🎯 Objectif 1M€ MRR = 0 bug de paiement  
⚡ Tout bug de paiement = rollback immédiat
