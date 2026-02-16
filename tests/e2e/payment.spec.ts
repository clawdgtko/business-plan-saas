import { test, expect } from '@playwright/test';

/**
 * 🎭 Tests E2E - Funnel de Paiement Complet
 * 
 * Ces tests simulent des utilisateurs réels avec Playwright.
 * Ils testent le flow complet du pricing à la confirmation.
 * 
 * Exécution: npm run test:e2e
 * Debug: npm run test:e2e -- --headed
 */

// ==========================================
// Page Objects
// ==========================================

class PricingPage {
  constructor(private page: any) {}

  async goto() {
    await this.page.goto('/pricing');
  }

  async selectPlan(planName: 'starter' | 'premium') {
    await this.page.click(`[data-testid="plan-${planName}"] [data-testid="cta-subscribe"]`);
  }

  async expectPlanVisible(planName: string) {
    await expect(this.page.locator(`[data-testid="plan-${planName}"]`)).toBeVisible();
  }
}

class CheckoutPage {
  constructor(private page: any) {}

  async fillEmail(email: string) {
    await this.page.fill('[data-testid="email-input"]', email);
  }

  async fillCard({ number, expiry, cvc }: { number: string; expiry: string; cvc: string }) {
    // Stripe Elements est dans un iframe
    const frame = this.page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    
    await frame.locator('[placeholder="Card number"]').fill(number);
    await frame.locator('[placeholder="MM / YY"]').fill(expiry);
    await frame.locator('[placeholder="CVC"]').fill(cvc);
  }

  async submit() {
    await this.page.click('[data-testid="submit-payment"]');
  }

  async expectError(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }
}

class SuccessPage {
  constructor(private page: any) {}

  async expectSuccess() {
    await expect(this.page).toHaveURL(/\/success/);
    await expect(this.page.locator('[data-testid="subscription-active"]')).toBeVisible();
  }

  async getSubscriptionId() {
    return this.page.getAttribute('[data-testid="subscription-id"]', 'data-id');
  }
}

// ==========================================
// Tests
// ==========================================

test.describe('🛒 Funnel de Conversion', () => {
  test.beforeEach(async ({ page }) => {
    // Reset state
    await page.context().clearCookies();
  });

  test('Plan Starter - Achat immédiat sans trial', async ({ page }) => {
    const pricing = new PricingPage(page);
    const checkout = new CheckoutPage(page);
    const success = new SuccessPage(page);

    // 1. Page Pricing
    await pricing.goto();
    await pricing.expectPlanVisible('starter');
    
    // 2. Sélection plan
    await pricing.selectPlan('starter');
    
    // 3. Checkout
    await checkout.fillEmail('test-starter@example.com');
    await checkout.fillCard({
      number: '4242424242424242',
      expiry: '12/30',
      cvc: '123',
    });
    await checkout.submit();
    
    // 4. Confirmation
    await success.expectSuccess();
  });

  test('Plan Premium - Trial 14 jours puis paiement', async ({ page }) => {
    const pricing = new PricingPage(page);
    const checkout = new CheckoutPage(page);
    
    await pricing.goto();
    await pricing.selectPlan('premium');
    
    await checkout.fillEmail('test-premium@example.com');
    await checkout.fillCard({
      number: '4242424242424242',
      expiry: '12/30',
      cvc: '123',
    });
    await checkout.submit();
    
    // Vérifie message trial
    await expect(page.locator('text=14 jours gratuits')).toBeVisible();
  });

  test('SCA/3D Secure - Challenge réussi', async ({ page }) => {
    const pricing = new PricingPage(page);
    const checkout = new CheckoutPage(page);
    
    await pricing.goto();
    await pricing.selectPlan('premium');
    
    await checkout.fillEmail('test-3ds@example.com');
    await checkout.fillCard({
      number: '4000002500003155', // Force 3DS
      expiry: '12/30',
      cvc: '123',
    });
    await checkout.submit();
    
    // Attend le modal 3D Secure
    const frame = page.frameLocator('iframe[src*="3dsecure"]').first();
    await frame.click('text=Complete'); // Simule succès 3DS
    
    await expect(page).toHaveURL(/\/success/);
  });

  test('Carte déclinée - Message erreur clair', async ({ page }) => {
    const pricing = new PricingPage(page);
    const checkout = new CheckoutPage(page);
    
    await pricing.goto();
    await pricing.selectPlan('starter');
    
    await checkout.fillEmail('test-fail@example.com');
    await checkout.fillCard({
      number: '4000000000009995', // Fonds insuffisants
      expiry: '12/30',
      cvc: '123',
    });
    await checkout.submit();
    
    await checkout.expectError('Votre carte a été refusée');
    // Reste sur la page checkout
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('Validation email requise', async ({ page }) => {
    const pricing = new PricingPage(page);
    const checkout = new CheckoutPage(page);
    
    await pricing.goto();
    await pricing.selectPlan('starter');
    
    // Pas d'email
    await checkout.fillCard({
      number: '4242424242424242',
      expiry: '12/30',
      cvc: '123',
    });
    await checkout.submit();
    
    await checkout.expectError('Email requis');
  });
});

test.describe('🔄 Upgrade / Downgrade', () => {
  test('Upgrade Starter → Premium avec prorata', async ({ page }) => {
    // Login avec compte Starter existant
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'starter-user@example.com');
    await page.click('[data-testid="magic-link"]');
    // Simule click magic link
    await page.goto('/dashboard?token=test');
    
    // Go to billing
    await page.click('[data-testid="nav-billing"]');
    await page.click('[data-testid="upgrade-plan"]');
    
    // Sélectionne Premium
    await page.click('[data-testid="plan-premium"]');
    
    // Vérifie prorata affiché
    await expect(page.locator('[data-testid="prorata-amount"]')).toBeVisible();
    
    // Confirme upgrade
    await page.click('[data-testid="confirm-upgrade"]');
    
    await expect(page.locator('[data-testid="plan-premium-active"]')).toBeVisible();
  });

  test('Cancel subscription', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="nav-billing"]');
    await page.click('[data-testid="cancel-subscription"]');
    
    // Modal de confirmation
    await page.click('[data-testid="confirm-cancel"]');
    
    await expect(page.locator('[data-testid="subscription-canceled"]')).toBeVisible();
    await expect(page.locator('text=Accès jusqu\'au')).toBeVisible();
  });
});

test.describe('🌍 Multi-juridiction', () => {
  test('France - TVA 20% affichée', async ({ page, context }) => {
    // Mock géolocalisation France
    await context.setGeolocation({ latitude: 48.8566, longitude: 2.3522 });
    
    const pricing = new PricingPage(page);
    await pricing.goto();
    
    // Vérifie prix TTC
    await expect(page.locator('[data-testid="plan-starter-price"]')).toContainText('34,80 €');
    await expect(page.locator('text=TTC')).toBeVisible();
  });

  test('USA - Pas de TVA', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 });
    
    const pricing = new PricingPage(page);
    await pricing.goto();
    
    await expect(page.locator('[data-testid="plan-starter-price"]')).toContainText('$29');
    await expect(page.locator('text=Tax included')).not.toBeVisible();
  });
});

test.describe('⚡ Performance', () => {
  test('Page pricing charge en moins de 2s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    
    expect(loadTime).toBeLessThan(2000);
  });

  test('LCP (Largest Contentful Paint) < 2.5s', async ({ page }) => {
    await page.goto('/pricing');
    
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(lcp).toBeLessThan(2500);
  });
});

test.describe('♿ Accessibilité', () => {
  test('Pricing page est accessible', async ({ page }) => {
    await page.goto('/pricing');
    
    // Utilise axe-core via injectée
    const violations = await page.evaluate(async () => {
      // @ts-ignore
      const axe = await import('axe-core');
      const results = await axe.run();
      return results.violations;
    });
    
    expect(violations).toHaveLength(0);
  });
});
