# 🎭 Tests E2E - Business Plan SaaS

Tests End-to-End avec Playwright pour valider le parcours utilisateur complet.

## 📁 Structure

```
tests/e2e/
├── funnel-complete.spec.ts    # Parcours Landing → Funnel → Checkout → Dashboard
├── business-plan.spec.ts      # Création, édition, export PDF
├── errors.spec.ts             # Gestion des erreurs 404, 500, validation
├── edge-cases.spec.ts         # Double submit, refresh mid-funnel
├── performance.spec.ts        # Lighthouse, Core Web Vitals
├── global.d.ts               # Types globaux
└── README.md                 # Ce fichier
```

## 🚀 Démarrage Rapide

### Installation

```bash
# Installe Playwright
npm install

# Installe les navigateurs Playwright
npx playwright install

# Optionnel: Pour les tests Lighthouse
npm install --save-dev playwright-lighthouse
```

### Exécution des Tests

```bash
# Tous les tests E2E
npm run test:e2e

# Mode interactif (headed)
npm run test:e2e:headed

# Debug
npm run test:e2e:debug

# Un fichier spécifique
npx playwright test tests/e2e/funnel-complete.spec.ts

# Un test spécifique
npx playwright test -g "Parcours complet"

# Sur un navigateur spécifique
npx playwright test --project=chromium
```

## 📊 Rapports

```bash
# Génère un rapport HTML
npx playwright show-report

# Les rapports sont dans:
# - playwright-report/ (HTML)
# - test-results/ (screenshots, videos, traces)
# - lighthouse-reports/ (audits Lighthouse)
```

## 🎯 Couverture des Tests

### funnel-complete.spec.ts
- ✅ Landing Page → Funnel → Checkout → Payment → Dashboard
- ✅ Navigation forward/backward dans le funnel
- ✅ Auto-save des données
- ✅ Scénarios de paiement (succès, échec, 3DS)
- ✅ Authentification magic link

### business-plan.spec.ts
- ✅ Création depuis le dashboard
- ✅ Liste avec progression
- ✅ Continuer un plan existant
- ✅ Export PDF
- ✅ Suppression
- ✅ Validation des champs

### errors.spec.ts
- ✅ Page 404
- ✅ Erreurs de validation
- ✅ Erreurs API (500)
- ✅ Gestion offline
- ✅ Erreurs de paiement

### edge-cases.spec.ts
- ✅ Double submit protection
- ✅ Refresh mid-funnel
- ✅ Fermeture/réouverture navigateur
- ✅ Caractères spéciaux/XSS
- ✅ Champs très longs

### performance.spec.ts
- ✅ Core Web Vitals (LCP, CLS, FID)
- ✅ Load Performance
- ✅ Resource Budget
- ✅ Mobile Performance
- ✅ Interaction Performance

## 🔧 Configuration

### Variables d'environnement

```bash
# URL de base (défaut: http://localhost:5173)
BASE_URL=https://staging.example.com

# Pour CI
CI=true
```

### Browsers

Tests exécutés sur:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit/Safari (Desktop)
- Mobile Chrome
- Mobile Safari

## 🐛 Debug

```bash
# Mode UI interactif
npx playwright test --ui

# Avec traces
npx playwright test --trace on

# Debug pas à pas
npx playwright test --debug

# Screenshot sur échec (défaut)
# Voir test-results/
```

## 📝 Bonnes Pratiques

### Page Objects

Utilise les Page Objects pour une maintenance facile:

```typescript
class FunnelPage {
  constructor(private page: Page) {}
  
  async fillBusinessInfo(data: { name: string; description: string }) {
    await this.page.fill('[name="businessName"]', data.name);
    await this.page.fill('[name="description"]', data.description);
  }
}
```

### Data Test IDs

Utilise des attributs `data-testid` pour des sélecteurs stables:

```html
<button data-testid="cta-subscribe">S'abonner</button>
```

### Tests Indépendants

Chaque test doit être indépendant:

```typescript
test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
});
```

## 🔄 CI/CD

Les tests sont exécutés automatiquement dans GitHub Actions sur:
- Push sur `main`
- Pull Requests

Voir `.github/workflows/test.yml`

## 📈 Métriques

### Performance Budget
- JavaScript: < 500KB
- CSS: < 100KB
- Total: < 2MB
- Requêtes: < 50
- LCP: < 2.5s
- CLS: < 0.1

## 🆘 Troubleshooting

### Tests échouent localement

```bash
# Met à jour les navigateurs
npx playwright install --with-deps

# Nettoie le cache
rm -rf test-results playwright-report

# Relance
npm run test:e2e
```

### Timeout erreurs

Augmente le timeout dans `playwright.config.ts`:

```typescript
timeout: 60000, // 60s
```

### Stripe iframe non trouvé

Vérifie que Stripe Elements est chargé:

```typescript
await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 10000 });
```

## 📚 Ressources

- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-page)
