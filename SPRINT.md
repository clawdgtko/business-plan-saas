# 🎯 SPRINT SYSTEM - Business Plan SaaS

**Sprint Actif:** #1  
**Date début:** 2026-02-16 08:45  
**Durée:** 2-3 jours (variable selon avancement)  
**Status:** 🟡 EN COURS

---

## 📋 Sprint #1 - Fondations

### Objectif
Avoir une app fonctionnelle avec auth, CRUD business plan, et paiement basique.

### Livrables attendus
- [x] Auth Magic Link fonctionnel
- [x] CRUD Business Plan opérationnel
- [x] Stripe Checkout intégré
- [x] CI/CD GitHub Actions
- [x] App déployée sur Cloudflare
- [ ] Tests coverage > 80%
- [ ] Documentation API
- [ ] Feature flags basiques

---

## 👥 Rôles & Responsabilités

### @ProductManager (PM)
**Rapport:** Tous les jours à 9h + fin de sprint  
**Responsabilités:**
- Définir les user stories
- Prioriser le backlog
- Valider les livrables
- Reporter à Grégoire

### @LeadDev (Lead)
**Rapport:** Tous les jours à 9h + fin de sprint  
**Responsabilités:**
- Architecture et revue de code
- Qualité et standards
- Validation des PRs
- Unblocking de l'équipe

---

## 🔄 Workflow Sprint

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PLAN      │ →  │   BUILD     │ →  │   REVIEW    │
│  (PM+Lead)  │    │  (Agents)   │    │  (PM+Lead)  │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                    ┌────────────────────────┘
                    ▼
           ┌─────────────┐
           │   FINISH    │
           │  (Livrable) │
           └──────┬──────┘
                  │
    ┌─────────────┴─────────────┐
    ▼                           ▼
┌──────────┐              ┌──────────┐
│  ✓ OK    │              │  ✗ KO    │
│ Nouveau  │              │ Continue │
│ Sprint   │              │ Sprint   │
└──────────┘              └──────────┘
```

---

## 📊 Tableau de Bord Sprint

| Agent | Tâche | Status | PR |
|-------|-------|--------|-----|
| @BackendAgent | Security & Secrets | 🟡 En cours | - |
| @FrontendAgent | Onboarding | 🟡 En cours | - |
| @DevOpsAgent | Monitoring | 🟡 En cours | - |
| @QAEngineer | Feature Flags | 🟡 En cours | - |
| @UXDesigner | User Journey | 🟡 En cours | - |

---

## ✅ Checklist Fin de Sprint

### PM doit valider :
- [ ] Toutes les user stories sont complètes
- [ ] Le produit est utilisable (end-to-end)
- [ ] Les critères d'acceptation sont OK
- [ ] Démo fonctionnelle possible

### Lead doit valider :
- [ ] Code review fait sur toutes les PRs
- [ ] Tests pass (coverage > 80%)
- [ ] CI/CD vert
- [ ] Pas de dette technique critique
- [ ] Documentation à jour

### Les deux doivent reporter à Grégoire :
- [ ] Ce qui a été livré
- [ ] Ce qui bloque (si applicable)
- [ ] Plan pour prochain sprint

---

## 🚨 Règles

1. **Pas de nouveau sprint** si l'actuel n'est pas terminé
2. **Pas de merge sur main** sans validation PM+Lead
3. **Daily report** obligatoire (même si court)
4. **Sprint review** avec démo avant cloture

---

## 📝 Template Rapport Quotidien (PM+Lead)

```
📅 Date: 2026-02-XX
👥 Équipe: X agents actifs
📊 Avancement: X%

✅ Fait hier:
- 

🎯 Objectif aujourd'hui:
- 

🚧 Bloqueurs:
- 

📦 Livrable sprint: [date prévue]
```

---

*Dernière mise à jour: 2026-02-16 08:50*  
*Prochain check: 2026-02-16 10:00*
