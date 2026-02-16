# UX Advanced Features - Documentation
## Issues #58, #59, #60

Cette documentation couvre les 4 fonctionnalités UX avancées implémentées.

---

## 1. Système de Feedback In-App (Issue #59)

### Composants créés

#### `frontend/src/utils/feedback.js`
Module utilitaire pour la gestion du feedback :
- `submitFeedback()` - Soumettre un feedback avec contexte
- `submitNPS()` - Envoyer un score NPS (0-10)
- `trackActionSatisfaction()` - Satisfaction sur une action spécifique
- `shouldShowNPS()` - Déterminer si afficher le NPS
- `capturePageState()` - Capturer l'état de la page

#### `frontend/src/components/FeedbackWidget.vue`
Widget flottant de feedback avec :
- 4 types de feedback (Général, Bug, Idée, UX/UI)
- Système de notation par étoiles (1-5)
- Champ de message contextuel
- Option d'inclusion des infos de page
- Design glassmorphism cohérent

#### `frontend/src/components/NPSSurvey.vue`
Survey NPS automatique :
- Échelle 0-10 avec catégories (Détracteurs, Passifs, Promoteurs)
- Question de suivi optionnelle
- Affichage intelligent (max 2 réponses, intervalle 7 jours)
- Apparition après 30 secondes d'engagement

### Endpoints API

```
POST /api/feedback          # Soumettre un feedback
GET  /api/feedback          # Liste des feedbacks (admin)
GET  /api/feedback/stats    # Statistiques NPS et satisfaction
```

### Tables de base de données

```sql
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,           -- general, bug, feature, ux, nps
  rating INTEGER,               -- 1-5 ou 0-10 pour NPS
  message TEXT,
  pathname TEXT,
  user_agent TEXT,
  screen_size TEXT,
  session_duration INTEGER,
  page_context TEXT,            -- JSON
  created_at DATETIME
);
```

---

## 2. A/B Testing Setup (Issue #58)

### Tests configurés

```javascript
ABTests = {
  LANDING_HEADLINE:  // Test du titre landing
    - control: "Version actuelle"
    - variant_a: "Focus Rapide"
    - variant_b: "Focus IA"
  
  FUNNEL_CTA:        // Test du bouton CTA
    - control: "Débloquer mon plan"
    - variant_a: "Générer mon PDF"
    - variant_b: "Créer mon business plan"
  
  FUNNEL_STEPS:      // Test nombre d'étapes
    - control: "4 étapes"
    - variant_a: "3 étapes"
  
  PRICING_DISPLAY:   // Test position prix
    - control: "Révélation tardive"
    - variant_a: "Transparence immédiate"
  
  ONBOARDING_FLOW:   // Test onboarding
    - control: "Détaillé"
    - variant_a: "Simplifié"
}
```

### Composants créés

#### `frontend/src/utils/ab-testing.js`
Module A/B testing avec :
- `initABTesting()` - Initialisation automatique
- `useABTest(testId)` - Hook Vue pour les composants
- `trackImpression/Interaction/Conversion()` - Tracking événements
- Assignment aléatoire basé sur les poids

#### `frontend/src/components/ABTest.vue`
Composant wrapper pour faciliter les tests :
```vue
<ABTest testId="FUNNEL_CTA" :variants="ctaVariants">
  <template #default="{ variant, track }">
    <!-- Contenu variant -->
  </template>
</ABTest>
```

### Endpoints API

```
POST /api/ab-test/track              # Tracker un événement
GET  /api/ab-test/results/:testId    # Résultats d'un test
GET  /api/ab-test/tests              # Liste des tests
```

### Tables de base de données

```sql
CREATE TABLE ab_test_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_id TEXT NOT NULL,        -- Identifiant du test
  variant TEXT NOT NULL,        -- Variante assignée
  event_type TEXT NOT NULL,     -- impression, interaction, conversion
  session_id TEXT NOT NULL,
  pathname TEXT,
  metadata TEXT,                -- JSON additionnel
  created_at DATETIME
);
```

### Utilisation dans Funnel.vue

```javascript
import { useABTest, ABTests } from '../utils/ab-testing.js'

const funnelABTest = useABTest(ABTests.FUNNEL_CTA.id)
// Retourne: { variant, isControl, is, trackInteraction, trackConversion }

// Tracking automatique des conversions
funnelABTest.trackConversion('funnel_complete', { stepsCompleted: 4 })
```

---

## 3. Analytics Onboarding Détaillés (Issue #60)

### Tracking implémenté

#### Étapes principales
```javascript
OnboardingSteps = {
  LANDING_VIEW,
  SIGNUP_START, SIGNUP_COMPLETE,
  EMAIL_VERIFICATION,
  ONBOARDING_FORM_START, ONBOARDING_FORM_COMPLETE,
  FUNNEL_START,
  FUNNEL_STEP_BUSINESS, FUNNEL_STEP_MARKET,
  FUNNEL_STEP_FINANCIAL, FUNNEL_STEP_REVIEW,
  FUNNEL_COMPLETE,
  CHECKOUT_START, CHECKOUT_COMPLETE,
  FIRST_BP_GENERATED, FIRST_PDF_DOWNLOAD,
  DASHBOARD_FIRST_VISIT
}
```

#### Micro-événements
```javascript
MicroEvents = {
  FORM_FIELD_FOCUS,      // Focus sur un champ
  FORM_FIELD_COMPLETE,   // Champ complété
  FORM_ERROR,           // Erreur de validation
  TOOLTIP_VIEW,         // Infobulle vue
  HELP_CLICKED,         // Aide cliquée
  EXAMPLE_VIEWED,       // Exemple consulté
  STEP_BACK,           // Retour arrière
  STEP_SKIP_ATTEMPT    // Tentative de skip
}
```

### Composants créés

#### `frontend/src/utils/onboarding-analytics.js`
Module complet avec :
- `trackOnboardingStep()` - Tracker une étape majeure
- `trackMicroEvent()` - Micro-conversions
- `trackFieldEngagement()` - Temps sur les champs
- `trackFormError()` - Erreurs de formulaire
- `trackDropoff()` - Abandons
- `useStepTimer()` - Hook pour mesurer le temps par étape
- `useFieldTracker()` - Hook pour tracker les champs

### Utilisation dans Funnel.vue

```javascript
import { 
  trackOnboardingStep, 
  OnboardingSteps,
  useStepTimer,
  trackStepBack 
} from '../utils/onboarding-analytics.js'

// Au montage
trackOnboardingStep(OnboardingSteps.FUNNEL_START)

// Timer pour chaque étape
const stepTimer = useStepTimer('funnel_business_info')
// ... navigation ...
stepTimer.stop() // Envoie automatiquement le temps

// Track retour arrière
trackStepBack(fromStep, toStep)
```

### Tables de base de données

```sql
CREATE TABLE onboarding_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE,
  user_id INTEGER,
  started_at DATETIME,
  completed_at DATETIME,
  total_time_spent INTEGER,
  steps_completed INTEGER,
  dropoff_step TEXT,
  report_data TEXT  -- JSON complet
);
```

---

## 4. Heatmap Tracking (Issue #60)

### Événements trackés

```javascript
HeatmapEventType = {
  CLICK,        // Clicks utilisateur
  MOUSE_MOVE,   // Mouvements souris (throttled)
  SCROLL,       // Positions de scroll
  HOVER,        // Survols prolongés
  ATTENTION     // Temps passé sur éléments
}
```

### Composants créés

#### `frontend/src/utils/heatmap.js`
Module de tracking avec :
- `initHeatmapTracking()` - Démarrage auto avec sampling
- Tracking des clics avec sélecteur CSS
- Tracking souris (throttle 100ms)
- Tracking scroll (throttle 250ms)
- Tracking attention via IntersectionObserver
- Envoi batch pour performance

#### `frontend/src/components/HeatmapOverlay.vue`
Visualiseur de heatmap (admin) :
- 4 modes: clicks, mouse moves, scroll, attention
- Slider d'opacité
- Légende de couleurs
- Statistiques en temps réel
- Raccourci clavier: Ctrl+Shift+H

### Endpoints API

```
POST /api/heatmap/events       # Batch d'événements
POST /api/heatmap/page         # Infos de page
GET  /api/heatmap/data         # Données pour une page
GET  /api/heatmap/scroll-depth # Profondeur de scroll
GET  /api/heatmap/clicks       # Rapport des clics
GET  /api/heatmap/stats        # Statistiques globales
```

### Tables de base de données

```sql
CREATE TABLE heatmap_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  event_type TEXT,        -- click, mouse_move, scroll, attention
  x, y INTEGER,          -- Coordonnées viewport
  page_x, page_y INTEGER, -- Coordonnées page
  element TEXT,          -- Sélecteur CSS
  element_text TEXT,
  element_type TEXT,
  scroll_x, scroll_y INTEGER,
  viewport_width, viewport_height INTEGER,
  duration INTEGER,      -- Pour attention
  pathname TEXT,
  created_at DATETIME
);

CREATE TABLE heatmap_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  url, pathname TEXT,
  title, referrer TEXT,
  viewport_width, viewport_height INTEGER,
  screen_width, screen_height INTEGER,
  device_pixel_ratio REAL
);
```

### Configuration

```javascript
CONFIG = {
  samplingRate: 0.1,    // 10% des utilisateurs en prod
  batchSize: 50,        // Envoi par batch
  flushInterval: 5000,  // Toutes les 5s
  maxEvents: 500        // Max en mémoire
}
```

---

## Intégration dans App.vue

Tous les systèmes sont initialisés automatiquement :

```vue
<template>
  <router-view />
  <FeedbackWidget />
  <NPSSurvey />
  <HeatmapOverlay v-if="showHeatmap" />
</template>

<script setup>
import { initAnalytics } from './utils/analytics.js'
import { initABTesting } from './utils/ab-testing.js'
import { initOnboardingAnalytics } from './utils/onboarding-analytics.js'
import { initHeatmapTracking } from './utils/heatmap.js'

onMounted(() => {
  initAnalytics()
  initABTesting()
  initOnboardingAnalytics()
  initHeatmapTracking()
})
</script>
```

---

## Migration de base de données

Appliquer la migration :

```bash
cd /home/gtko/.openclaw/workspace/business-plan-saas/worker
wrangler d1 migrations apply DB
```

Ou exécuter manuellement le fichier `005_ux_analytics.js`.

---

## Dashboard Admin

Les routes admin permettent d'accéder aux données :

```
GET /api/feedback/stats       # NPS et satisfaction
GET /api/ab-test/tests        # Résultats A/B
GET /api/heatmap/stats        # Stats heatmap
GET /api/analytics/...        # Analytics existants
```

Pour voir la heatmap en overlay :
- Ajouter `?heatmap=admin` à l'URL
- Ou appuyer sur `Ctrl+Shift+H`

---

## KPIs Trackés

### Conversion Funnel
- Taux de complétion par étape
- Temps moyen par étape
- Points d'abandon
- Taux de retour arrière

### Engagement
- Temps passé sur chaque champ
- Erreurs de validation
- Utilisation de l'aide
- Micro-conversions

### Satisfaction
- NPS Score
- Satisfaction par page
- Feedback par catégorie
- Suggestions de fonctionnalités

### A/B Testing
- Taux de conversion par variante
- Impressions et interactions
- Significativité statistique
- Recommandations gagnantes

---

## Prochaines étapes recommandées

1. **Créer un dashboard admin** pour visualiser tous ces KPIs
2. **Configurer des alertes** sur les baisses de conversion
3. **Automatiser les rapports** hebdomadaires
4. **Intégrer avec un outil BI** (Metabase, Superset)
5. **Ajouter des sessions recordings** (optionnel)
