# 🎨 Business Plan SaaS - Design Package

> **Mission**: Atteindre 1M€ MRR avec un design qui convertit

---

## 📁 Structure du Design

```
design/
├── design-system/
│   └── DESIGN_SYSTEM.md      # Tokens, composants, styles
├── cro-strategy/
│   └── CRO_STRATEGY.md       # Optimisation conversion
└── wireframes/
    └── WIREFRAMES.md         # Parcours utilisateur complet
```

---

## 🚀 Livrables

### 1. Design System (`design-system/DESIGN_SYSTEM.md`)
Fondations visuelles complètes :
- 🎨 Palette dark mode avec gradients
- 🔤 Typography Inter
- 🪟 Glassmorphism cards (signature)
- 🎯 Composants réutilisables
- ✨ Animations & micro-interactions
- 📱 Responsive breakpoints
- ♿ Accessibilité (A11Y)

### 2. CRO Strategy (`cro-strategy/CRO_STRATEGY.md`)
Stratégie de conversion data-driven :
- 📊 Funnel de conversion cible
- 🎯 Landing page optimisée
- 🔄 Multi-step funnel pattern
- 💳 Paywall psychologie
- 📧 Emails de récupération
- 📱 Mobile-first optimisations
- 🧪 Plan de tests A/B

### 3. Wireframes (`wireframes/WIREFRAMES.md`)
Parcours utilisateur complet en ASCII :
- Landing → Signup → Funnel → Paywall → Export
- 5 étapes du funnel détaillées
- Desktop & Mobile layouts
- Annotations interactives

---

## 🎯 Parcours Utilisateur

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────────────────────┐
│   Landing    │────→│   Signup     │────→│           Funnel (5 steps)           │
│   Page       │     │   (Auth)     │     │  1.Vision → 2.Market → 3.Strategy    │
└──────────────┘     └──────────────┘     │  4.Finance → 5.Team                  │
                                          └──────────────────┬───────────────────┘
                                                             │
                                                             ↓
                                          ┌──────────────────────────────────────┐
                                          │            Preview Page              │
                                          │     (PDF avec watermark + paywall)   │
                                          └──────────────────┬───────────────────┘
                                                             │
                                                             ↓
                                          ┌──────────────────────────────────────┐
                                          │            Checkout                  │
                                          │     (Stripe Express Checkout)        │
                                          └──────────────────┬───────────────────┘
                                                             │
                                                             ↓
                                          ┌──────────────────────────────────────┐
                                          │         Success / Export             │
                                          │     (PDF + Excel + Dashboard)        │
                                          └──────────────────────────────────────┘
```

---

## 💰 Modèle de Pricing

| Plan | Prix | Features |
|------|------|----------|
| **Trial** | €2.90 (24h) | Accès complet temporaire |
| **Monthly** | €39.80/mo | PDF, Excel, éditions illimitées |
| **Annual** | €23.90/mo (€286.80/an) | -40% + 2 mois offerts |

---

## 🎨 Design Highlights

### Signature Glassmorphism
```css
.glass-card {
  background: rgba(26, 26, 46, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

### Gradients Principaux
- **Primary**: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)`
- **CTA**: `linear-gradient(135deg, #f59e0b 0%, #f97316 100%)`
- **Success**: `linear-gradient(135deg, #10b981 0%, #34d399 100%)`

---

## 📱 Mobile-First

- Touch targets minimum 44x44px
- Sticky CTA sur toutes les pages
- Stepper swipeable
- Font-size 16px+ (pas de zoom iOS)

---

## 🔧 Prochaines Étapes

### Pour le Dev Team
1. [ ] Configurer Tailwind avec les tokens du design system
2. [ ] Créer les composants Vue.js de base (Button, Card, Input)
3. [ ] Implémenter les transitions de page
4. [ ] Intégrer le funnel multi-steps
5. [ ] Connecter Stripe Express Checkout

### Pour le Product Manager
1. [ ] Review & challenger les wireframes
2. [ ] Définir le copy exact pour chaque étape
3. [ ] Valider le modèle de pricing
4. [ ] Planifier les tests utilisateurs

---

## 📊 KPIs Cibles

| Métrique | Target |
|----------|--------|
| Landing → Signup | >35% |
| Funnel Completion | >75% par étape |
| Preview → Paywall | >60% |
| Paywall Conversion | >12% |
| Global CR | 3-5% |

---

**Design Package v1.0**  
**Créé par**: AI Design Team  
**Date**: 2026-02-16
