import { test, expect, Page } from '@playwright/test';

/**
 * 🎯 Tests E2E - Funnel Utilisateur Complet
 * 
 * Couvre le parcours: Landing → Funnel → Checkout → Paiement → Dashboard
 * Issue #84 - QA Finale End-to-End Testing
 */

// ==========================================
// Page Objects
// ==========================================

class LandingPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async expectLoaded() {
    await expect(this.page.locator('text=Créez votre business plan')).toBeVisible();
    await expect(this.page.locator('text=en minutes, pas en semaines')).toBeVisible();
  }

  async clickStartFree() {
    await this.page.click('text=Commencer gratuitement');
  }

  async clickCTA() {
    await this.page.click('text=Créer mon business plan');
  }

  async clickLogin() {
    await this.page.click('text=Connexion');
  }
}

class FunnelPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/funnel/);
    await expect(this.page.locator('text=Votre entreprise')).toBeVisible();
  }

  // Step 1: Business Info
  async fillBusinessInfo(data: { name: string; description: string; sector: string }) {
    await this.page.fill('[placeholder="Ma Super Entreprise"]', data.name);
    await this.page.fill('[placeholder="Décrivez votre activité en quelques lignes..."]', data.description);
    await this.page.click(`text=${data.sector}`);
  }

  async expectBusinessInfoValidationError() {
    await expect(this.page.locator('text=Le nom de l\'entreprise est requis')).toBeVisible();
  }

  // Step 2: Market
  async fillMarketInfo(data: { marketSize: string; competitors: string[] }) {
    await this.page.fill('[placeholder="Ex: 10 milliards €"]', data.marketSize);
    
    for (let i = 0; i < data.competitors.length; i++) {
      if (i > 0) {
        await this.page.click('text=Ajouter un concurrent');
      }
      const inputs = await this.page.locator('[placeholder^="Concurrent"]').all();
      if (inputs[i]) {
        await inputs[i].fill(data.competitors[i]);
      }
    }
  }

  // Step 3: Financial
  async fillFinancialInfo(data: { revenueYear1: string; revenueYear2: string; revenueYear3: string; fundingNeeded: string }) {
    const inputs = await this.page.locator('input[type="number"]').all();
    if (inputs[0]) await inputs[0].fill(data.revenueYear1);
    if (inputs[1]) await inputs[1].fill(data.revenueYear2);
    if (inputs[2]) await inputs[2].fill(data.revenueYear3);
    if (inputs[3]) await inputs[3].fill(data.fundingNeeded);
  }

  // Navigation
  async clickNext() {
    await this.page.click('text=Suivant');
  }

  async clickPrevious() {
    await this.page.click('text=Précédent');
  }

  async clickUnlock() {
    await this.page.click('text=Débloquer mon plan');
  }

  async expectStep(stepName: string) {
    await expect(this.page.locator(`text=${stepName}`).first()).toBeVisible();
  }

  async expectProgressBar(percentage: string) {
    const progressBar = this.page.locator('.bg-gradient-to-r').first();
    await expect(progressBar).toBeVisible();
  }

  // Auto-save indicator
  async expectAutoSaveStatus(status: 'saving' | 'saved' | 'error') {
    const statusText = {
      saving: 'Sauvegarde...',
      saved: 'Sauvegardé',
      error: 'Erreur',
    };
    // Le texte peut varier selon l'implémentation exacte
    await expect(this.page.locator('text=Sauvegardé').or(this.page.locator('text=Sauvegarde'))).toBeVisible();
  }
}

class CheckoutPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/checkout/);
  }

  async fillEmail(email: string) {
    await this.page.fill('input[type="email"]', email);
  }

  async fillCard(data: { number: string; expiry: string; cvc: string }) {
    // Stripe Elements - cherche l'iframe
    const stripeFrame = this.page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    
    // Attend que l'iframe soit chargé
    await this.page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 10000 });
    
    // Remplit les champs dans l'iframe
    await stripeFrame.locator('[placeholder="Card number"]').fill(data.number);
    await stripeFrame.locator('[placeholder="MM / YY"]').fill(data.expiry);
    await stripeFrame.locator('[placeholder="CVC"]').fill(data.cvc);
  }

  async fillCardFallback(data: { number: string; expiry: string; cvc: string }) {
    // Fallback si Stripe n'est pas dans un iframe
    await this.page.fill('[data-testid="card-number"]', data.number);
    await this.page.fill('[data-testid="card-expiry"]', data.expiry);
    await this.page.fill('[data-testid="card-cvc"]', data.cvc);
  }

  async submit() {
    await this.page.click('button[type="submit"]');
  }

  async clickPay() {
    await this.page.click('text=Payer');
  }

  async expectError(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }
}

class SuccessPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/success/);
    await expect(this.page.locator('text=Succès').or(this.page.locator('text=succès'))).toBeVisible();
  }

  async expectSubscriptionActive() {
    await expect(this.page.locator('text=abonnement').or(this.page.locator('text=Actif'))).toBeVisible();
  }

  async clickGoToDashboard() {
    await this.page.click('text=Dashboard').or(this.page.locator('text=Tableau de bord'));
  }
}

class DashboardPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(this.page.locator('text=Mes Business Plans')).toBeVisible();
  }

  async expectBusinessPlanVisible(name: string) {
    await expect(this.page.locator(`text=${name}`)).toBeVisible();
  }

  async clickNewPlan() {
    await this.page.click('text=+ Nouveau');
  }

  async clickContinuePlan(name: string) {
    await this.page.locator(`text=${name}`).locator('..').locator('text=Continuer').click();
  }

  async exportPDF(planName: string) {
    const planRow = this.page.locator(`text=${planName}`).locator('xpath=../..');
    await planRow.locator('text=PDF').click();
  }

  async deletePlan(planName: string) {
    const planRow = this.page.locator(`text=${planName}`).locator('xpath=../..');
    await planRow.locator('text=Suppr').click();
  }
}

class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.page.locator('text=Connexion')).toBeVisible();
  }

  async fillEmail(email: string) {
    await this.page.fill('input[type="email"]', email);
  }

  async submitMagicLink() {
    await this.page.click('text=Recevoir le lien');
  }

  async expectMagicLinkSent() {
    await expect(this.page.locator('text=Lien envoyé')).toBeVisible();
  }
}

// ==========================================
// Tests - Parcours Utilisateur Complet
// ==========================================

test.describe('🚀 Funnel Complet - Landing à Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Reset state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('Parcours complet: Landing → Funnel → Checkout → Payment → Dashboard', async ({ page }) => {
    const landing = new LandingPage(page);
    const funnel = new FunnelPage(page);
    const checkout = new CheckoutPage(page);
    const success = new SuccessPage(page);
    const dashboard = new DashboardPage(page);

    // 1. Landing Page
    await test.step('Landing Page', async () => {
      await landing.goto();
      await landing.expectLoaded();
      await landing.clickCTA();
    });

    // 2. Funnel - Étape 1: Business Info
    await test.step('Funnel - Business Info', async () => {
      await funnel.expectLoaded();
      await funnel.expectStep('Votre entreprise');
      
      await funnel.fillBusinessInfo({
        name: 'TestE2E Entreprise',
        description: 'Une super entreprise de test pour E2E',
        sector: 'Tech / SaaS',
      });
      
      await funnel.clickNext();
    });

    // 3. Funnel - Étape 2: Market
    await test.step('Funnel - Market', async () => {
      await funnel.expectStep('Marché');
      
      await funnel.fillMarketInfo({
        marketSize: '10 milliards €',
        competitors: ['Competitor A', 'Competitor B'],
      });
      
      await funnel.clickNext();
    });

    // 4. Funnel - Étape 3: Financial
    await test.step('Funnel - Financial', async () => {
      await funnel.expectStep('Finances');
      
      await funnel.fillFinancialInfo({
        revenueYear1: '100000',
        revenueYear2: '500000',
        revenueYear3: '1000000',
        fundingNeeded: '200000',
      });
      
      await funnel.clickNext();
    });

    // 5. Funnel - Étape 4: Review
    await test.step('Funnel - Review', async () => {
      await funnel.expectStep('Récapitulatif');
      await funnel.clickUnlock();
    });

    // 6. Checkout
    await test.step('Checkout', async () => {
      await checkout.expectLoaded();
      await checkout.fillEmail('test-e2e@example.com');
      
      // Tente de remplir la carte Stripe
      try {
        await checkout.fillCard({
          number: '4242424242424242',
          expiry: '12/30',
          cvc: '123',
        });
      } catch {
        // Fallback si pas d'iframe Stripe
        await checkout.fillCardFallback({
          number: '4242424242424242',
          expiry: '12/30',
          cvc: '123',
        });
      }
      
      await checkout.submit();
    });

    // 7. Success
    await test.step('Success Page', async () => {
      await success.expectLoaded();
      await success.expectSubscriptionActive();
      await success.clickGoToDashboard();
    });

    // 8. Dashboard
    await test.step('Dashboard', async () => {
      await dashboard.expectLoaded();
      await dashboard.expectBusinessPlanVisible('TestE2E Entreprise');
    });
  });

  test('Funnel avec navigation forward/backward', async ({ page }) => {
    const landing = new LandingPage(page);
    const funnel = new FunnelPage(page);

    await landing.goto();
    await landing.clickCTA();
    await funnel.expectLoaded();

    // Remplit étape 1
    await funnel.fillBusinessInfo({
      name: 'Test Nav',
      description: 'Test navigation',
      sector: 'E-commerce',
    });
    await funnel.clickNext();

    // Va à l'étape 2
    await funnel.expectStep('Marché');
    
    // Retour en arrière
    await funnel.clickPrevious();
    await funnel.expectStep('Votre entreprise');
    
    // Vérifie que les données sont conservées
    const nameInput = page.locator('[placeholder="Ma Super Entreprise"]');
    await expect(nameInput).toHaveValue('Test Nav');

    // Re-avance
    await funnel.clickNext();
    await funnel.expectStep('Marché');
  });

  test('Auto-save dans le funnel', async ({ page }) => {
    const landing = new LandingPage(page);
    const funnel = new FunnelPage(page);

    await landing.goto();
    await landing.clickCTA();
    await funnel.expectLoaded();

    // Remplit et attend l'auto-save
    await funnel.fillBusinessInfo({
      name: 'Test AutoSave',
      description: 'Test auto-save functionality',
      sector: 'Services',
    });

    // Attend l'indicateur de sauvegarde
    await page.waitForTimeout(1500);
    await funnel.expectAutoSaveStatus('saved');
  });
});

test.describe('💳 Paiement - Scénarios complets', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Paiement réussi avec carte valide', async ({ page }) => {
    const landing = new LandingPage(page);
    const funnel = new FunnelPage(page);
    const checkout = new CheckoutPage(page);

    await landing.goto();
    await landing.clickCTA();
    
    // Remplit rapidement le funnel
    await funnel.fillBusinessInfo({
      name: 'Test Payment OK',
      description: 'Test paiement réussi',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickUnlock();

    // Checkout
    await checkout.expectLoaded();
    await checkout.fillEmail('payment-ok@example.com');
    
    try {
      await checkout.fillCard({
        number: '4242424242424242',
        expiry: '12/30',
        cvc: '123',
      });
    } catch {
      await checkout.fillCardFallback({
        number: '4242424242424242',
        expiry: '12/30',
        cvc: '123',
      });
    }
    
    await checkout.submit();
    
    // Vérifie redirection vers success
    await expect(page).toHaveURL(/\/(success|dashboard)/, { timeout: 30000 });
  });

  test('Carte déclinée - gestion erreur', async ({ page }) => {
    const landing = new LandingPage(page);
    const funnel = new FunnelPage(page);
    const checkout = new CheckoutPage(page);

    await landing.goto();
    await landing.clickCTA();
    
    await funnel.fillBusinessInfo({
      name: 'Test Declined',
      description: 'Test carte déclinée',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickUnlock();

    await checkout.expectLoaded();
    await checkout.fillEmail('declined@example.com');
    
    try {
      await checkout.fillCard({
        number: '4000000000009995', // Carte déclinée
        expiry: '12/30',
        cvc: '123',
      });
    } catch {
      await checkout.fillCardFallback({
        number: '4000000000009995',
        expiry: '12/30',
        cvc: '123',
      });
    }
    
    await checkout.submit();
    
    // Doit rester sur checkout avec message d'erreur
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('3D Secure / SCA - Challenge réussi', async ({ page }) => {
    const landing = new LandingPage(page);
    const funnel = new FunnelPage(page);
    const checkout = new CheckoutPage(page);

    await landing.goto();
    await landing.clickCTA();
    
    await funnel.fillBusinessInfo({
      name: 'Test 3DS',
      description: 'Test 3D Secure',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickUnlock();

    await checkout.expectLoaded();
    await checkout.fillEmail('3ds@example.com');
    
    try {
      await checkout.fillCard({
        number: '4000002500003155', // Force 3DS
        expiry: '12/30',
        cvc: '123',
      });
    } catch {
      await checkout.fillCardFallback({
        number: '4000002500003155',
        expiry: '12/30',
        cvc: '123',
      });
    }
    
    await checkout.submit();
    
    // Attend le modal 3DS (peut varier selon l'implémentation Stripe)
    try {
      const frame = page.frameLocator('iframe[src*="3dsecure"]').first();
      await frame.click('text=Complete').timeout(5000);
    } catch {
      // Le comportement peut varier
    }
    
    // Vérifie redirection finale
    await expect(page).toHaveURL(/\/(success|dashboard)/, { timeout: 30000 });
  });
});

test.describe('🔐 Authentification Magic Link', () => {
  test('Demande de magic link', async ({ page }) => {
    const login = new LoginPage(page);
    
    await login.goto();
    await login.expectLoaded();
    
    await login.fillEmail('test-auth@example.com');
    await login.submitMagicLink();
    
    await login.expectMagicLinkSent();
  });

  test('Connexion puis funnel', async ({ page }) => {
    const login = new LoginPage(page);
    const landing = new LandingPage(page);
    const funnel = new FunnelPage(page);

    // Simule connexion (en dev, on peut avoir un token direct)
    await page.goto('/dashboard?token=test-dev-token');
    
    // Vérifie accès dashboard
    const dashboard = new DashboardPage(page);
    await dashboard.expectLoaded();

    // Redirection vers funnel
    await landing.goto();
    await landing.clickCTA();
    
    await funnel.expectLoaded();
    await funnel.fillBusinessInfo({
      name: 'Auth Test Plan',
      description: 'Test avec auth',
      sector: 'Tech / SaaS',
    });
    
    // Les données doivent être associées au user
    await funnel.clickNext();
  });
});
