# Business Plan SaaS - Documentation Produit

> **Mission**: Devenir le générateur de business plan #1 en Europe  
> **Objectif**: 1M€ MRR d'ici 24 mois  
> **Pricing**: Trial 2,90€/24h → Subscription 39,80€/mois

---

## 📋 Table des Matières

1. [Vision Produit](#vision-produit)
2. [Roadmap](#roadmap)
3. [User Stories](#user-stories)
4. [Architecture Technique](#architecture-technique)
5. [Funnel Conversion](#funnel-conversion)

---

## Vision Produit

### Positionnement
- **Prix accessible**: 39,80€/mois vs 200-500€ pour un consultant
- **Multi-juridictions**: EU + monde
- **Temps réel**: Génération en < 30 secondes
- **Qualité pro**: Templates validés par experts-comptables

### Marché cible
1. **Primary**: Entrepreneurs FR/DE/ES/IT (premiers 6 mois)
2. **Secondary**: PME européennes en croissance
3. **Tertiary**: Freelances, consultants, investisseurs

### North Star Metric
Nombre de business plans générés avec paiement complet

---

## Roadmap

### Q1 2025 - Foundation (50K€ ARR)
- MVP: Formulaire 3 étapes + PDF + Stripe
- Support FR/DE
- Landing page + SEO basique

### Q2 2025 - Growth (200K€ ARR)
- Multi-juridictions (ES, IT, UK)
- Templates sectoriels
- Programme affiliation

### Q3 2025 - Scale (500K€ ARR)
- AI avancée (prédictions)
- API publique
- Version Enterprise

### Q4 2025 - Expansion (1M€ ARR)
- Marché US
- Marketplace templates
- Levée Série A

---

## User Stories

### Epic: Formulaire Multi-Étapes

| ID | Story | Priorité |
|----|-------|----------|
| US-001 | Étape 1: Informations entreprise | P0 |
| US-002 | Étape 2: Modèle économique | P0 |
| US-003 | Étape 3: Projections financières | P0 |
| US-004 | Preview live avec watermark | P0 |
| US-005 | Paiement Trial 2,90€ | P0 |

---

## Architecture Technique

### Stack
- **Backend**: Cloudflare Workers + Hono
- **Frontend**: Vue.js 3 + Tailwind
- **Database**: Cloudflare D1
- **Payment**: Stripe Express Checkout
- **PDF**: Puppeteer + PDF-lib

### Juridictions
| Pays | Langue | ID entreprise | Status |
|------|--------|---------------|--------|
| FR | FR | SIRET | P0 |
| DE | DE | HRA/HRB | P1 |
| ES | ES | NIF | P2 |
| IT | IT | P.IVA | P2 |

---

## Funnel Conversion

### Targets
```
Landing → Étape 1: 40%
Étape 1 → Étape 2: 70%
Étape 2 → Étape 3: 78%
Étape 3 → Preview: 81%
Preview → Trial: 66%
Trial → Subscription: 33%
```
**Conversion globale target: 4%**

### Tactics
- Urgence: Prix trial augmente dans 24h
- Social proof: Compteur temps réel
- Progress bar + auto-save
- Exit-intent popup
- Email sequence 5 jours

---

## 📁 Liens GitHub

- Issue #1: [Vision Produit](https://github.com/clawdgtko/business-plan-saas/issues/1)
- Issue #2: [MVP Core](https://github.com/clawdgtko/business-plan-saas/issues/2)
- Issue #3: [Roadmap 2025](https://github.com/clawdgtko/business-plan-saas/issues/3)
- Issue #4: [User Stories](https://github.com/clawdgtko/business-plan-saas/issues/4)
- Issue #6: [Funnel Conversion](https://github.com/clawdgtko/business-plan-saas/issues/6)
- Issue #7: [Multi-Juridictions](https://github.com/clawdgtko/business-plan-saas/issues/7)

---

*Document maintenu par le Product Manager*
