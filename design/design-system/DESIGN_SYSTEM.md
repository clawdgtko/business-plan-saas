# 🎨 BUSINESS PLAN SAAS - DESIGN SYSTEM

## Objectif: 1M€ MRR → Chaque pixel doit convertir

---

## 📐 FONDATIONS VISUELLES

### Palette de Couleurs

```css
/* === PRIMARY GRADIENTS === */
--gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
--gradient-cta: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
--gradient-success: linear-gradient(135deg, #10b981 0%, #34d399 100%);

/* === DARK THEME === */
--bg-primary: #0f0f1a;        /* Fond principal */
--bg-secondary: #1a1a2e;      /* Cards/containers */
--bg-tertiary: #252542;       /* Inputs/éléments interactifs */
--bg-glass: rgba(26, 26, 46, 0.7);  /* Glassmorphism */

/* === TEXT COLORS === */
--text-primary: #ffffff;
--text-secondary: rgba(255, 255, 255, 0.7);
--text-muted: rgba(255, 255, 255, 0.5);

/* === ACCENT COLORS === */
--accent-purple: #8b5cf6;
--accent-pink: #d946ef;
--accent-blue: #6366f1;
--accent-amber: #f59e0b;
--accent-green: #10b981;
--accent-red: #ef4444;
```

### Typography

```css
/* === FONT FAMILY === */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* === SCALE (1.25 ratio) === */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */

/* === WEIGHTS === */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Espacement & Layout

```css
/* === SPACING SCALE === */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */

/* === BORDER RADIUS === */
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

---

## 🪟 COMPOSANTS UI

### 1. Glass Cards (Signature)

```css
.glass-card {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 2px 4px -1px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}

.glass-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.4),
    0 10px 10px -5px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
}
```

### 2. Boutons CTA

```css
/* === PRIMARY CTA === */
.btn-primary {
  background: var(--gradient-cta);
  color: white;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.4);
}

/* === SECONDARY === */
.btn-secondary {
  background: var(--bg-tertiary);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: rgba(255, 255, 255, 0.2);
}

/* === GHOST === */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}
```

### 3. Input Fields

```css
.input-field {
  background: var(--bg-tertiary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 0.875rem 1rem;
  color: white;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.input-field::placeholder {
  color: var(--text-muted);
}
```

### 4. Progress Steps (Funnel)

```css
.step-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.step-dot.active {
  background: var(--accent-purple);
  border-color: var(--accent-purple);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.5);
}

.step-dot.completed {
  background: var(--accent-green);
  border-color: var(--accent-green);
}

.step-line {
  width: 40px;
  height: 2px;
  background: var(--bg-tertiary);
}

.step-line.completed {
  background: var(--accent-green);
}
```

### 5. Pricing Cards

```css
.pricing-card {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  position: relative;
  overflow: hidden;
}

.pricing-card.popular {
  border-color: var(--accent-purple);
  box-shadow: 0 0 60px rgba(139, 92, 246, 0.2);
}

.pricing-card.popular::before {
  content: 'POPULAIRE';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gradient-primary);
  color: white;
  font-size: var(--text-xs);
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.price-tag {
  font-size: var(--text-4xl);
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 6. Trust Badges

```css
.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: var(--accent-green);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
}

.trust-badge svg {
  width: 16px;
  height: 16px;
}
```

---

## 🎬 ANIMATIONS & MICRO-INTERACTIONS

### Page Transitions

```css
.page-enter {
  animation: pageEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Step Transitions (Funnel)

```css
.step-enter {
  animation: stepEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-exit {
  animation: stepExit 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes stepEnter {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes stepExit {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
}
```

### Glow Effects

```css
.glow-purple {
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
}

.glow-amber {
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.3);
}

.pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.5); }
}
```

### Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    var(--bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* === MOBILE FIRST === */
/* Base: 0-639px */

/* sm: 640px+ */
@media (min-width: 640px) { }

/* md: 768px+ */
@media (min-width: 768px) { }

/* lg: 1024px+ */
@media (min-width: 1024px) { }

/* xl: 1280px+ */
@media (min-width: 1280px) { }

/* 2xl: 1536px+ */
@media (min-width: 1536px) { }
```

### Mobile-Specific Adaptations

- **Touch targets**: Minimum 44x44px
- **Font sizes**: Minimum 16px for inputs (prevents zoom iOS)
- **Spacing**: Increase padding on mobile for breathing room
- **Navigation**: Bottom sheet or hamburger menu
- **Funnel steps**: Full-width cards, larger touch targets

---

## 🎯 ICONOGRAPHY

### Library: Lucide Icons

```javascript
// Installation
npm install lucide-vue-next

// Usage
import { 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Lock,
  ArrowRight,
  ChevronRight,
  Star,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Building2,
  Target,
  BarChart3,
  Download,
  CreditCard,
  Timer,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-vue-next'
```

### Icon Sizes

- **xs**: 14px (inline text)
- **sm**: 16px (buttons, badges)
- **md**: 20px (form fields)
- **lg**: 24px (navigation)
- **xl**: 32px (features)
- **2xl**: 48px (hero icons)

---

## 🖼️ ASSETS REQUIS

### Illustrations (à générer ou sourcer)

1. **Hero**: Entrepreneur avec business plan holographique
2. **Features**: 
   - AI générant du contenu
   - Graphiques financiers
   - Équipe collaborant
3. **Empty States**: Personnages stylisés pour états vides
4. **Success**: Checkmark animé, confetti

### Recommendations

- Style: 3D illustrations légères, glassmorphism
- Palette cohérente avec le design system
- Format: SVG pour les icônes, WebP pour les illustrations
- Lazy loading obligatoire pour les images

---

## 🧪 ACCESSIBILITÉ (A11Y)

### Checklist

- [ ] Contraste minimum 4.5:1 pour le texte
- [ ] Focus indicators visibles
- [ ] Labels associés aux inputs
- [ ] ARIA labels pour les icônes
- [ ] Skip links pour navigation
- [ ] Reduced motion respectée
- [ ] Color-blind friendly indicators

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📦 IMPLEMENTATION VUE.JS

### Structure des Composants

```
components/
├── ui/                    # Composants réutilisables
│   ├── Button.vue
│   ├── Card.vue
│   ├── Input.vue
│   ├── ProgressSteps.vue
│   ├── PricingCard.vue
│   └── Badge.vue
├── layout/
│   ├── Navbar.vue
│   ├── Footer.vue
│   └── Container.vue
├── funnel/                # Spécifique au funnel
│   ├── StepHeader.vue
│   ├── StepContent.vue
│   ├── StepNavigation.vue
│   └── PreviewCard.vue
└── marketing/
    ├── HeroSection.vue
    ├── FeatureGrid.vue
    ├── SocialProof.vue
    └── PricingSection.vue
```

---

## 🔗 LIENS & RESSOURCES

- [Figma - Design System](à créer)
- [Storybook - Components](à configurer)
- [Tailwind Config](./tailwind.config.js)

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2026-02-16  
**Designer**: AI Design Team
