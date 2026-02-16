# 🎯 SPRINT #2 - Business Plan SaaS

**Sprint Actif:** #2  
**Date début:** 2026-02-16 09:45  
**Durée:** 2h max  
**Fin prévue:** 2026-02-16 11:45  
**Status:** 🟢 PRÊT À LANCER

---

## 🎯 Objectif Sprint #2

**Mission:** Compléter le MVP avec Dashboard utilisateur, Subscription, et dette technique Sprint #1.

### 🎉 Succès du Sprint #1
- ✅ Auth Magic Link fonctionnel
- ✅ CRUD Business Plan opérationnel  
- ✅ Stripe Checkout intégré
- ✅ CI/CD GitHub Actions
- ✅ App déployée
- ✅ Security & Rate limiting
- ✅ Onboarding flow
- ✅ Monitoring & Telemetry
- ✅ Feature Flags système

---

## 📋 Backlog Sprint #2

### 🔴 CRITIQUE - Dette Technique Sprint #1

| # | Issue | Description | Agent | Priorité |
|---|-------|-------------|-------|----------|
| #80 | Tests Coverage | Passer à 80%+ coverage | @QAEngineer | 🔴 P0 |
| #81 | Documentation API | OpenAPI/Swagger complet | @BackendAgent | 🔴 P0 |
| #82 | Persistence Onboarding | Sauvegarde étapes onboarding en DB | @BackendAgent | 🔴 P0 |

### 🟢 FEATURES - Sprint #2 Core

| # | Issue | Description | Agent | Priorité |
|---|-------|-------------|-------|----------|
| #83 | Dashboard Utilisateur | US-006: Liste BP, téléchargement, duplication | @FrontendAgent | 🟢 P1 |
| #84 | Subscription Flow | US-007: Conversion trial → abonnement 39,80€/mois | @BackendAgent | 🟢 P1 |
| #85 | Subscription UI | Page abonnement + CTA dashboard | @FrontendAgent | 🟢 P1 |
| #86 | Email Confirmation | Emails post-paiement et post-abonnement | @DevOpsAgent | 🟡 P2 |
| #87 | PDF Watermark | Watermark "PREVIEW" sur preview (US-004) | @BackendAgent | 🟡 P2 |

### 🟡 AMÉLIORATION - UX/Polish

| # | Issue | Description | Agent | Priorité |
|---|-------|-------------|-------|----------|
| #88 | Copywriting | Messages d'erreur et micro-copy | @UXDesigner | 🟡 P2 |
| #89 | Analytics | Track events conversion funnel | @DevOpsAgent | 🟡 P2 |

---

## 👥 Assignations Sprint #2

### @BackendAgent
**Issues:** #81, #82, #84, #87
- Documentation API OpenAPI
- Persistence onboarding (table + API)
- Subscription flow (Stripe subscription)
- PDF Watermark

### @FrontendAgent  
**Issues:** #83, #85
- Dashboard utilisateur complet
- Page abonnement avec CTA
- Intégration subscription flow

### @QAEngineer
**Issue:** #80
- Augmenter coverage à 80%+
- Tests subscription
- Tests dashboard

### @DevOpsAgent
**Issues:** #86, #89
- Setup email service (Resend/SendGrid)
- Templates emails
- Analytics events tracking

### @UXDesigner
**Issue:** #88
- Copywriting micro-interactions
- Messages d'erreur
- Review UX subscription flow

---

## 📊 Définition de Done Sprint #2

### MVP Complet ✅
- [ ] Dashboard avec liste des business plans
- [ ] Téléchargement PDF depuis dashboard
- [ ] Subscription 39,80€/mois fonctionnelle
- [ ] Conversion trial → subscription opérationnelle
- [ ] Tests coverage ≥ 80%
- [ ] Documentation API complète

### Qualité ✅
- [ ] Code review sur toutes les PRs
- [ ] CI/CD vert
- [ ] Pas de régression Sprint #1
- [ ] App déployée et testable

---

## 🎯 Livrables Attendus

1. **Dashboard Utilisateur** (/dashboard)
   - Liste des business plans générés
   - Actions: télécharger, dupliquer, supprimer
   - Statut abonnement visible

2. **Subscription System**
   - Stripe Subscription (39,80€/mois)
   - Webhooks subscription
   - Gestion downgrade/cancel

3. **Tests & Qualité**
   - Coverage ≥ 80%
   - Tests E2E criticaux
   - Documentation API publiable

4. **Polish MVP**
   - Emails transactionnels
   - Watermark preview
   - Analytics conversion

---

## 🚨 Règles Sprint #2

1. **P0 = Obligatoire** pour finir sprint
2. **P1 = Important** - Faire si P0 OK
3. **P2 = Nice to have** - Si temps restant
4. **Tests coverage = Non négociable**
5. **Daily check-in toutes les 30 min**

---

## 📈 Planning Détaillé (2h)

| Heure | Action | Owner |
|-------|--------|-------|
| 09:45 | Kickoff Sprint #2 | @ProductManager |
| 09:50 | Création branches | Tous agents |
| 10:00 | Premier check-in | Tous |
| 10:30 | Check-in + review P0 | @LeadDev |
| 11:00 | Check-in + tests coverage | @QAEngineer |
| 11:30 | Final review + merge | @LeadDev |
| 11:45 | Sprint Review & Démo | @ProductManager |

---

## 🎯 Métriques de Succès

| Métrique | Target | Sprint #1 |
|----------|--------|-----------|
| Coverage | ≥ 80% | ~30% |
| Issues P0 fermées | 3/3 | - |
| Issues P1 fermées | 3/3 | - |
| Temps moyen PR | < 30 min | - |
| Bugs critique | 0 | 0 |

---

## 📝 Notes

- **Dette Sprint #1:** Doit être traitée EN PREMIER
- **Subscription:** Feature critique pour monetisation
- **Dashboard:** Clé pour rétention utilisateurs
- **Analytics:** Important pour comprendre le funnel

---

*Créé par: @ProductManager*  
*Date: 2026-02-16 09:45*  
*Prochaine mise à jour: 10:00 (check-in)*
