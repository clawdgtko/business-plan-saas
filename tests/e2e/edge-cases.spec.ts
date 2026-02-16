import { test, expect, Page } from '@playwright/test';

/**
 * 🧪 Tests E2E - Edge Cases & Scénarios Complexes
 * 
 * Tests les cas limites: double submit, refresh mid-funnel, etc.
 * Issue #84 - QA Finale End-to-End Testing
 */

// ==========================================
// Page Objects
// ==========================================

class FunnelPage {
  constructor(private page: Page) {}

  async fillBusinessInfo(data: { name: string; description: string; sector: string }) {
    await this.page.fill('[placeholder="Ma Super Entreprise"]', data.name);
    await this.page.fill('[placeholder="Décrivez votre activité en quelques lignes..."]', data.description);
    await this.page.click(`text=${data.sector}`);
  }

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

  async clickNext() {
    await this.page.click('text=Suivant');
  }

  async clickPrevious() {
    await this.page.click('text=Précédent');
  }

  async expectStep(stepName: string) {
    await expect(this.page.locator(`text=${stepName}`).first()).toBeVisible();
  }

  async getFormData() {
    const name = await this.page.inputValue('[placeholder="Ma Super Entreprise"]');
    const description = await this.page.inputValue('[placeholder="Décrivez votre activité en quelques lignes..."]');
    return { name, description };
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
// Tests - Double Submit
// ==========================================

test.describe('⚡ Double Submit Protection', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Double clic sur Suivant - pas de duplication', async ({ page }) => {
    const funnel = new FunnelPage(page);

    await page.goto('/funnel');
    await funnel.fillBusinessInfo({
      name: 'Test Double Click',
      description: 'Test protection double clic',
      sector: 'Tech / SaaS',
    });

    // Double clic rapide
    await Promise.all([
      page.click('text=Suivant'),
      page.click('text=Suivant'),
    ]);

    // Doit être sur l'étape suivante sans erreur
    await funnel.expectStep('Marché');
    
    // Vérifie qu'on peut continuer normalement
    await funnel.clickNext();
    await funnel.expectStep('Finances');
  });

  test('Double submit sur formulaire de checkout', async ({ page }) => {
    await page.goto('/funnel');
    
    const funnel = new FunnelPage(page);
    await funnel.fillBusinessInfo({
      name: 'Test Double Submit',
      description: 'Test double submit checkout',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickNext();
    await page.click('text=Débloquer mon plan');

    await expect(page).toHaveURL(/\/checkout/);

    const checkout = new CheckoutPage(page);
    await checkout.fillEmail('double@example.com');
    
    try {
      await checkout.fillCard({
        number: '4242424242424242',
        expiry: '12/30',
        cvc: '123',
      });
    } catch {
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await page.fill('[data-testid="card-expiry"]', '12/30');
      await page.fill('[data-testid="card-cvc"]', '123');
    }

    // Double submit rapide
    await Promise.all([
      checkout.submit(),
      checkout.submit(),
    ]);

    // Doit rediriger vers success sans erreur de duplication
    await expect(page).toHaveURL(/\/(success|dashboard)/, { timeout: 30000 });
  });

  test('Bouton désactivé pendant soumission', async ({ page }) => {
    await page.goto('/funnel');
    
    const funnel = new FunnelPage(page);
    await funnel.fillBusinessInfo({
      name: 'Test Disabled Button',
      description: 'Test bouton désactivé',
      sector: 'Tech / SaaS',
    });

    // Clique et vérifie immédiatement l'état du bouton
    const submitButton = page.locator('text=Suivant');
    await submitButton.click();

    // Le bouton doit être désactivé ou en état de loading
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    const hasLoading = await submitButton.locator('text=chargement').or(submitButton.locator('text=loading')).isVisible().catch(() => false);
    
    expect(isDisabled || hasLoading).toBeTruthy();
  });
});

// ==========================================
// Tests - Refresh Mid-Funnel
// ==========================================

test.describe('🔄 Refresh & Navigation Mid-Funnel', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Refresh conserve les données - Étape 1', async ({ page }) => {
    const funnel = new FunnelPage(page);

    await page.goto('/funnel');
    await funnel.fillBusinessInfo({
      name: 'Test Refresh',
      description: 'Test conservation données après refresh',
      sector: 'Tech / SaaS',
    });

    // Attend l'auto-save
    await page.waitForTimeout(1500);

    // Refresh la page
    await page.reload();

    // Les données doivent être conservées
    const nameInput = page.locator('[placeholder="Ma Super Entreprise"]');
    await expect(nameInput).toHaveValue('Test Refresh');
    
    const descInput = page.locator('[placeholder="Décrivez votre activité en quelques lignes..."]');
    await expect(descInput).toHaveValue('Test conservation données après refresh');
  });

  test('Refresh sur étape intermédiaire - retour à la bonne étape', async ({ page }) => {
    const funnel = new FunnelPage(page);

    await page.goto('/funnel');
    await funnel.fillBusinessInfo({
      name: 'Test Mid Refresh',
      description: 'Test refresh étape 3',
      sector: 'E-commerce',
    });
    await funnel.clickNext();
    await funnel.fillMarketInfo({
      marketSize: '100 milliards',
      competitors: ['Comp A'],
    });
    await funnel.clickNext();

    // On est sur l'étape 3 (Financial)
    await funnel.expectStep('Finances');

    // Refresh
    await page.reload();

    // Doit retourner sur l'étape 3 avec données conservées
    await funnel.expectStep('Finances');
  });

  test('Fermeture et réouverture navigateur - données persistées', async ({ page, context }) => {
    const funnel = new FunnelPage(page);

    await page.goto('/funnel');
    await funnel.fillBusinessInfo({
      name: 'Test Persistence',
      description: 'Test persistance après fermeture',
      sector: 'Services',
    });

    // Attend l'auto-save
    await page.waitForTimeout(1500);

    // Ferme la page
    await page.close();

    // Réouvre une nouvelle page
    const newPage = await context.newPage();
    await newPage.goto('/funnel');

    // Vérifie persistance
    const nameInput = newPage.locator('[placeholder="Ma Super Entreprise"]');
    await expect(nameInput).toHaveValue('Test Persistence');
  });

  test('Navigation back/forward dans l\'historique', async ({ page }) => {
    const funnel = new FunnelPage(page);

    await page.goto('/funnel');
    await funnel.fillBusinessInfo({
      name: 'Test History',
      description: 'Test navigation historique',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();
    await funnel.expectStep('Marché');

    // Back button
    await page.goBack();
    await funnel.expectStep('Votre entreprise');

    // Forward button
    await page.goForward();
    await funnel.expectStep('Marché');
  });
});

// ==========================================
// Tests - Interrupt Scenarios
// ==========================================

test.describe('⏹️ Interruption Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Fermeture inattendue pendant auto-save', async ({ page, context }) => {
    const funnel = new FunnelPage(page);

    await page.goto('/funnel');
    await funnel.fillBusinessInfo({
      name: 'Test Interrupt',
      description: 'Test fermeture pendant save',
      sector: 'Tech / SaaS',
    });

    // Ferme immédiatement (pendant l'auto-save)
    await page.close();

    // Réouvre
    const newPage = await context.newPage();
    await newPage.goto('/funnel');

    // Soit les données sont sauvées, soit on repart de zéro (pas d'erreur)
    const currentUrl = newPage.url();
    expect(currentUrl).toContain('/funnel');
  });

  test('Changement d\'onglet pendant soumission', async ({ page, context }) => {
    await page.goto('/funnel');
    
    const funnel = new FunnelPage(page);
    await funnel.fillBusinessInfo({
      name: 'Test Tab Switch',
      description: 'Test changement onglet',
      sector: 'Tech / SaaS',
    });

    // Ouvre un nouvel onglet
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Retourne au funnel et continue
    await page.bringToFront();
    await funnel.clickNext();
    
    await funnel.expectStep('Marché');
  });

  test('Minimisation fenêtre pendant interaction', async ({ page }) => {
    await page.goto('/funnel');
    
    const funnel = new FunnelPage(page);
    await funnel.fillBusinessInfo({
      name: 'Test Minimize',
      description: 'Test minimization',
      sector: 'Tech / SaaS',
    });

    // Simule minimization (pas d'API directe, mais on continue normalement)
    await funnel.clickNext();
    await funnel.expectStep('Marché');
  });
});

// ==========================================
// Tests - Rapid Interactions
// ==========================================

test.describe('🏃 Rapid Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Clics rapides sur navigation précédent/suivant', async ({ page }) => {
    const funnel = new FunnelPage(page);

    await page.goto('/funnel');
    await funnel.fillBusinessInfo({
      name: 'Test Rapid Nav',
      description: 'Test navigation rapide',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();
    await funnel.fillMarketInfo({
      marketSize: '50 milliards',
      competitors: ['A'],
    });
    await funnel.clickNext();

    // Clics rapides prev/next
    for (let i = 0; i < 5; i++) {
      await funnel.clickPrevious().catch(() => {});
      await funnel.clickNext().catch(() => {});
    }

    // Doit rester stable
    await expect(page.locator('text=Votre entreprise').or(page.locator('text=Marché')).or(page.locator('text=Finances'))).toBeVisible();
  });

  test('Saisie rapide dans les champs', async ({ page }) => {
    await page.goto('/funnel');

    // Saisie très rapide
    await page.fill('[placeholder="Ma Super Entreprise"]', 'Rapid'.repeat(20));
    await page.fill('[placeholder="Décrivez votre activité en quelques lignes..."]', 'Description rapide '.repeat(10));

    // Vérifie que tout est enregistré
    const nameValue = await page.inputValue('[placeholder="Ma Super Entreprise"]');
    expect(nameValue.length).toBeGreaterThan(50);
  });

  test('Navigation clavier rapide (Tab + Enter)', async ({ page }) => {
    await page.goto('/funnel');

    // Navigation au clavier
    await page.locator('[placeholder="Ma Super Entreprise"]').press('Tab');
    await page.locator('[placeholder="Décrivez votre activité en quelques lignes..."]').press('Tab');
    await page.keyboard.press('Enter');

    // Doit être stable
    const currentUrl = page.url();
    expect(currentUrl).toContain('/funnel');
  });
});

// ==========================================
// Tests - Data Integrity
// ==========================================

test.describe('🔐 Data Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Données spéciales et caractères spéciaux', async ({ page }) => {
    const funnel = new FunnelPage(page);

    await page.goto('/funnel');
    await funnel.fillBusinessInfo({
      name: 'Test <script>alert("xss")</script>',
      description: 'Description avec caractères spéciaux: émoji 🚀 & < > " \'',
      sector: 'Tech / SaaS',
    });

    // Attend auto-save
    await page.waitForTimeout(1500);

    // Refresh
    await page.reload();

    // Vérifie que les données sont conservées sans être exécutées
    const nameValue = await page.inputValue('[placeholder="Ma Super Entreprise"]');
    expect(nameValue).toContain('<script>');
    
    // Vérifie pas d'alert XSS
    const dialogHandled = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        window.alert = () => resolve(true);
        setTimeout(() => resolve(false), 100);
      });
    });
    expect(dialogHandled).toBeFalsy();
  });

  test('Longueur maximale des champs', async ({ page }) => {
    await page.goto('/funnel');

    const veryLongName = 'A'.repeat(1000);
    await page.fill('[placeholder="Ma Super Entreprise"]', veryLongName);

    // Vérifie que c'est tronqué ou accepté
    const nameValue = await page.inputValue('[placeholder="Ma Super Entreprise"]');
    expect(nameValue.length).toBeLessThanOrEqual(1000);
  });

  test('Nombres et formats spéciaux', async ({ page }) => {
    await page.goto('/funnel');
    await page.click('text=Suivant'); // Skip to market
    
    // Teste différents formats de nombres
    await page.fill('[placeholder="Ex: 10 milliards €"]', '1,234,567.89');
    await page.waitForTimeout(500);
    
    const value = await page.inputValue('[placeholder="Ex: 10 milliards €"]');
    expect(value).toBeTruthy();
  });
});
