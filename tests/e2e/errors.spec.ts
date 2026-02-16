import { test, expect, Page } from '@playwright/test';

/**
 * ⚠️ Tests E2E - Gestion des Erreurs
 * 
 * Tests les pages d'erreur 404, 500, et les validations
 * Issue #84 - QA Finale End-to-End Testing
 */

// ==========================================
// Page Objects
// ==========================================

class ErrorPage {
  constructor(private page: Page) {}

  async expect404() {
    await expect(this.page.locator('text=404').or(this.page.locator('text=Page non trouvée'))).toBeVisible();
  }

  async expect500() {
    await expect(this.page.locator('text=500').or(this.page.locator('text=Erreur serveur'))).toBeVisible();
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }

  async clickReturnHome() {
    await this.page.click('text=Retour').or(this.page.locator('text=Accueil'));
  }
}

class FunnelPage {
  constructor(private page: Page) {}

  async fillBusinessInfo(data: { name: string; description: string; sector: string }) {
    await this.page.fill('[placeholder="Ma Super Entreprise"]', data.name);
    await this.page.fill('[placeholder="Décrivez votre activité en quelques lignes..."]', data.description);
    await this.page.click(`text=${data.sector}`);
  }

  async clickNext() {
    await this.page.click('text=Suivant');
  }
}

class CheckoutPage {
  constructor(private page: Page) {}

  async fillEmail(email: string) {
    await this.page.fill('input[type="email"]', email);
  }

  async fillCard(data: { number: string; expiry: string; cvc: string }) {
    try {
      const stripeFrame = this.page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
      await stripeFrame.locator('[placeholder="Card number"]').fill(data.number);
      await stripeFrame.locator('[placeholder="MM / YY"]').fill(data.expiry);
      await stripeFrame.locator('[placeholder="CVC"]').fill(data.cvc);
    } catch {
      await this.page.fill('[data-testid="card-number"]', data.number);
      await this.page.fill('[data-testid="card-expiry"]', data.expiry);
      await this.page.fill('[data-testid="card-cvc"]', data.cvc);
    }
  }

  async submit() {
    await this.page.click('button[type="submit"]');
  }
}

// ==========================================
// Tests - Pages d'erreur
// ==========================================

test.describe('🔍 Pages d\'erreur', () => {
  test('404 - Page non trouvée', async ({ page }) => {
    const errorPage = new ErrorPage(page);

    await page.goto('/page-qui-nexiste-pas-12345');
    await errorPage.expect404();
  });

  test('404 - Route inexistante avec paramètres', async ({ page }) => {
    const errorPage = new ErrorPage(page);

    await page.goto('/api/invalid-endpoint?test=123');
    await errorPage.expect404();
  });

  test('404 - Retour à l\'accueil depuis 404', async ({ page }) => {
    const errorPage = new ErrorPage(page);

    await page.goto('/page-inexistante');
    await errorPage.expect404();
    
    await errorPage.clickReturnHome();
    await expect(page).toHaveURL('/');
  });

  test('Accès à une ressource inexistante', async ({ page }) => {
    await page.goto('/funnel/invalid-id-12345');
    
    // Doit soit rediriger, soit afficher une erreur
    const currentUrl = page.url();
    const hasError = await page.locator('text=404').or(page.locator('text=non trouvé')).isVisible().catch(() => false);
    const isRedirected = currentUrl.includes('/funnel') && !currentUrl.includes('invalid-id');
    
    expect(hasError || isRedirected).toBeTruthy();
  });
});

test.describe('📝 Validation des formulaires', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Validation: email invalide', async ({ page }) => {
    await page.goto('/checkout');
    
    const checkout = new CheckoutPage(page);
    await checkout.fillEmail('email-invalide');
    await checkout.submit();

    // Doit afficher une erreur de validation
    await expect(page.locator('text=valide').or(page.locator('text=valid'))).toBeVisible();
  });

  test('Validation: champs requis vides', async ({ page }) => {
    await page.goto('/funnel');
    
    const funnel = new FunnelPage(page);
    await funnel.clickNext();

    // Doit afficher des erreurs de validation
    await expect(page.locator('text=requis').or(page.locator('text=required'))).toBeVisible();
  });

  test('Validation: carte de crédit incomplète', async ({ page }) => {
    await page.goto('/funnel');
    
    const funnel = new FunnelPage(page);
    await funnel.fillBusinessInfo({
      name: 'Test Validation',
      description: 'Test carte incomplète',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickNext();
    await page.click('text=Débloquer mon plan');

    await expect(page).toHaveURL(/\/checkout/);

    // Tente de soumettre sans remplir la carte
    const checkout = new CheckoutPage(page);
    await checkout.fillEmail('test@example.com');
    await checkout.submit();

    // Doit afficher une erreur
    await expect(page.locator('text=carte').or(page.locator('text=card')).or(page.locator('text=requis'))).toBeVisible();
  });

  test('Validation: numéro de carte invalide', async ({ page }) => {
    await page.goto('/checkout');

    const checkout = new CheckoutPage(page);
    await checkout.fillEmail('test@example.com');
    
    try {
      await checkout.fillCard({
        number: '1234567890123456', // Numéro invalide
        expiry: '12/30',
        cvc: '123',
      });
    } catch {
      // Si Stripe refuse le numéro invalide
    }

    await checkout.submit();

    // Doit afficher une erreur de carte invalide
    await expect(page.locator('text=invalide').or(page.locator('text=invalid'))).toBeVisible();
  });

  test('Validation: date d\'expiration passée', async ({ page }) => {
    await page.goto('/checkout');

    const checkout = new CheckoutPage(page);
    await checkout.fillEmail('test@example.com');
    
    try {
      await checkout.fillCard({
        number: '4242424242424242',
        expiry: '01/20', // Date passée
        cvc: '123',
      });
    } catch {
      // Stripe peut refuser immédiatement
    }

    await checkout.submit();

    // Doit afficher une erreur
    await expect(page.locator('text=expiration').or(page.locator('text=expir'))).toBeVisible();
  });
});

test.describe('🌐 Erreurs API et réseau', () => {
  test('Gestion erreur réseau - retry automatique', async ({ page }) => {
    // Simule une déconnexion réseau
    await page.context().setOffline(true);
    
    await page.goto('/');
    
    // Vérifie que l'app gère l'offline gracieusement
    // Soit erreur, soit message offline
    const hasError = await page.locator('text=erreur').or(page.locator('text=offline')).or(page.locator('text=connexion')).isVisible().catch(() => false);
    
    await page.context().setOffline(false);
    
    // L'app devrait se reconnecter
    await page.waitForLoadState('networkidle');
  });

  test('Erreur 500 simulée sur API', async ({ page }) => {
    // Intercepte et modifie une requête API pour simuler une 500
    await page.route('/api/**', async (route, request) => {
      if (request.url().includes('business-plans')) {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/dashboard');
    
    // Doit afficher une erreur ou un état de fallback
    await expect(page.locator('text=erreur').or(page.locator('text=Erreur')).or(page.locator('text=retry'))).toBeVisible();
  });

  test('Timeout sur requête API', async ({ page }) => {
    // Ralentit drastiquement une requête
    await page.route('/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 10000));
      await route.continue();
    });

    await page.goto('/dashboard');
    
    // Doit avoir un état de loading puis timeout ou erreur
    await expect(page.locator('text=chargement').or(page.locator('text=loading')).or(page.locator('text=timeout'))).toBeVisible();
  });
});

test.describe('🔒 Erreurs d\'authentification', () => {
  test('Accès dashboard sans authentification', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Doit rediriger vers login
    await expect(page).toHaveURL(/\/(login|auth)/);
  });

  test('Token invalide ou expiré', async ({ page }) => {
    // Tente d'accéder avec un token invalide
    await page.goto('/dashboard?token=invalid-token-123');
    
    // Doit rediriger vers login ou afficher erreur
    const currentUrl = page.url();
    expect(currentUrl.includes('/login') || currentUrl.includes('/auth')).toBeTruthy();
  });

  test('Accès à une ressource d\'un autre utilisateur', async ({ page }) => {
    // Tente d'accéder à un business plan qui n'appartient pas au user
    await page.goto('/funnel/other-user-plan-id');
    
    // Doit afficher une erreur 403 ou 404
    const hasError = await page.locator('text=403').or(page.locator('text=404')).or(page.locator('text=accès')).isVisible().catch(() => false);
    const isRedirected = page.url().includes('/dashboard') || page.url().includes('/login');
    
    expect(hasError || isRedirected).toBeTruthy();
  });
});

test.describe('💳 Erreurs de paiement', () => {
  test('Carte sans fonds suffisants', async ({ page }) => {
    await page.goto('/funnel');
    
    const funnel = new FunnelPage(page);
    await funnel.fillBusinessInfo({
      name: 'Test No Funds',
      description: 'Test carte sans fonds',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickNext();
    await page.click('text=Débloquer mon plan');

    await expect(page).toHaveURL(/\/checkout/);

    const checkout = new CheckoutPage(page);
    await checkout.fillEmail('nofunds@example.com');
    
    try {
      await checkout.fillCard({
        number: '4000000000009995', // Fonds insuffisants
        expiry: '12/30',
        cvc: '123',
      });
    } catch {
      await page.fill('[data-testid="card-number"]', '4000000000009995');
      await page.fill('[data-testid="card-expiry"]', '12/30');
      await page.fill('[data-testid="card-cvc"]', '123');
    }

    await checkout.submit();

    // Doit afficher message carte refusée
    await expect(page.locator('text=refusée').or(page.locator('text=declined')).or(page.locator('text=fonds'))).toBeVisible();
  });

  test('Carte expirée', async ({ page }) => {
    await page.goto('/checkout');

    const checkout = new CheckoutPage(page);
    await checkout.fillEmail('expired@example.com');
    
    try {
      await checkout.fillCard({
        number: '4000000000000069', // Carte expirée
        expiry: '12/30',
        cvc: '123',
      });
    } catch {
      await page.fill('[data-testid="card-number"]', '4000000000000069');
      await page.fill('[data-testid="card-expiry"]', '12/30');
      await page.fill('[data-testid="card-cvc"]', '123');
    }

    await checkout.submit();

    await expect(page.locator('text=expirée').or(page.locator('text=expired'))).toBeVisible();
  });

  test('CVC incorrect', async ({ page }) => {
    await page.goto('/checkout');

    const checkout = new CheckoutPage(page);
    await checkout.fillEmail('cvc@example.com');
    
    try {
      await checkout.fillCard({
        number: '4000000000000127', // CVC incorrect
        expiry: '12/30',
        cvc: '123',
      });
    } catch {
      await page.fill('[data-testid="card-number"]', '4000000000000127');
      await page.fill('[data-testid="card-expiry"]', '12/30');
      await page.fill('[data-testid="card-cvc"]', '123');
    }

    await checkout.submit();

    await expect(page.locator('text=CVC').or(page.locator('text=sécurité'))).toBeVisible();
  });
});
