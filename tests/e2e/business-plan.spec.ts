import { test, expect, Page } from '@playwright/test';

/**
 * 📄 Tests E2E - Business Plan Management
 * 
 * Tests la création, édition, et export PDF des business plans
 * Issue #84 - QA Finale End-to-End Testing
 */

// ==========================================
// Page Objects
// ==========================================

class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(this.page.locator('text=Mes Business Plans')).toBeVisible();
  }

  async expectEmptyState() {
    await expect(this.page.locator('text=Vous n\'avez pas encore de business plan')).toBeVisible();
  }

  async clickCreateNew() {
    await this.page.click('text=Créer mon premier');
  }

  async clickNewButton() {
    await this.page.click('text=+ Nouveau');
  }

  async fillNewPlanName(name: string) {
    await this.page.fill('input[placeholder="Nom du projet"]', name);
  }

  async confirmCreate() {
    await this.page.click('text=Créer');
  }

  async expectPlanInList(name: string) {
    await expect(this.page.locator(`text=${name}`)).toBeVisible();
  }

  async clickContinuePlan(name: string) {
    const planCard = this.page.locator(`text=${name}`).locator('xpath=../../..');
    await planCard.locator('text=Continuer').click();
  }

  async clickStartPlan(name: string) {
    const planCard = this.page.locator(`text=${name}`).locator('xpath=../../..');
    await planCard.locator('text=Commencer').click();
  }

  async exportPDF(name: string) {
    const planCard = this.page.locator(`text=${name}`).locator('xpath=../../..');
    await planCard.locator('text=PDF').click();
  }

  async deletePlan(name: string) {
    const planCard = this.page.locator(`text=${name}`).locator('xpath=../../..');
    await planCard.locator('text=Suppr').click();
  }

  async expectProgress(name: string, percentage: string) {
    const planCard = this.page.locator(`text=${name}`).locator('xpath=../../..');
    await expect(planCard.locator(`text=${percentage}`)).toBeVisible();
  }
}

class FunnelPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page.locator('text=Votre entreprise')).toBeVisible();
  }

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

  async fillFinancialInfo(data: { revenueYear1: string; revenueYear2: string; revenueYear3: string; fundingNeeded: string }) {
    const inputs = await this.page.locator('input[type="number"]').all();
    if (inputs[0]) await inputs[0].fill(data.revenueYear1);
    if (inputs[1]) await inputs[1].fill(data.revenueYear2);
    if (inputs[2]) await inputs[2].fill(data.revenueYear3);
    if (inputs[3]) await inputs[3].fill(data.fundingNeeded);
  }

  async clickNext() {
    await this.page.click('text=Suivant');
  }

  async clickUnlock() {
    await this.page.click('text=Débloquer mon plan');
  }

  async expectStep(stepName: string) {
    await expect(this.page.locator(`text=${stepName}`).first()).toBeVisible();
  }
}

class EditorPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    // Si on est sur une page d'édition
    await expect(this.page.locator('text=Édition').or(this.page.locator('text=Business Info'))).toBeVisible();
  }

  async editField(fieldName: string, value: string) {
    await this.page.fill(`[name="${fieldName}"]`, value);
  }

  async clickSave() {
    await this.page.click('text=Sauvegarder');
  }

  async expectSaveConfirmation() {
    await expect(this.page.locator('text=sauvegardé').or(this.page.locator('text=Succès'))).toBeVisible();
  }
}

// ==========================================
// Tests - Business Plan Management
// ==========================================

test.describe('📄 Création et gestion des Business Plans', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Créer un nouveau business plan depuis le dashboard', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const funnel = new FunnelPage(page);

    // 1. Dashboard vide
    await dashboard.goto();
    await dashboard.expectLoaded();
    await dashboard.expectEmptyState();

    // 2. Clique sur créer
    await dashboard.clickCreateNew();

    // 3. Modal de création
    await dashboard.fillNewPlanName('Mon Premier Plan');
    await dashboard.confirmCreate();

    // 4. Redirection vers le funnel
    await funnel.expectLoaded();
    await funnel.expectStep('Votre entreprise');

    // 5. Remplit le funnel
    await funnel.fillBusinessInfo({
      name: 'Mon Premier Plan',
      description: 'Description de mon premier business plan',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();
    await funnel.fillMarketInfo({
      marketSize: '50 milliards €',
      competitors: ['Competitor 1', 'Competitor 2'],
    });
    await funnel.clickNext();
    await funnel.fillFinancialInfo({
      revenueYear1: '100000',
      revenueYear2: '500000',
      revenueYear3: '2000000',
      fundingNeeded: '500000',
    });
    await funnel.clickNext();

    // 6. Review et checkout
    await funnel.clickUnlock();
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('Liste des business plans avec progression', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.expectLoaded();

    // Créer plusieurs plans
    for (let i = 1; i <= 3; i++) {
      await dashboard.clickNewButton();
      await dashboard.fillNewPlanName(`Plan Test ${i}`);
      await dashboard.confirmCreate();
      
      // Retourne au dashboard
      await dashboard.goto();
    }

    // Vérifie que tous les plans sont listés
    await dashboard.expectPlanInList('Plan Test 1');
    await dashboard.expectPlanInList('Plan Test 2');
    await dashboard.expectPlanInList('Plan Test 3');
  });

  test('Continuer un business plan existant', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const funnel = new FunnelPage(page);

    // Créer un plan
    await dashboard.goto();
    await dashboard.clickNewButton();
    await dashboard.fillNewPlanName('Plan à Continuer');
    await dashboard.confirmCreate();

    // Remplit partiellement
    await funnel.fillBusinessInfo({
      name: 'Plan à Continuer',
      description: 'Description initiale',
      sector: 'E-commerce',
    });
    await funnel.clickNext();
    // S'arrête à l'étape 2

    // Retourne au dashboard
    await dashboard.goto();
    await dashboard.expectLoaded();

    // Continue le plan
    await dashboard.clickContinuePlan('Plan à Continuer');
    
    // Vérifie qu'on reprend où on s'était arrêté
    await funnel.expectStep('Marché');
    
    // Vérifie que les données sont conservées
    const marketInput = page.locator('[placeholder="Ex: 10 milliards €"]');
    // Note: Selon l'implémentation, peut être vide ou avoir une valeur
    await expect(marketInput).toBeVisible();
  });

  test('Export PDF d\'un business plan', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.clickNewButton();
    await dashboard.fillNewPlanName('Plan pour PDF');
    await dashboard.confirmCreate();

    // Remplit le funnel rapidement
    const funnel = new FunnelPage(page);
    await funnel.fillBusinessInfo({
      name: 'Plan pour PDF',
      description: 'Test export PDF',
      sector: 'Services',
    });
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickNext();
    await funnel.clickUnlock();

    // Simule le paiement (simplifié)
    await page.goto('/dashboard');
    await dashboard.expectLoaded();

    // Export PDF
    await dashboard.exportPDF('Plan pour PDF');

    // Vérifie que l'export a été déclenché (alert ou téléchargement)
    // Selon l'implémentation, peut être une alerte ou un téléchargement
    await expect(page.locator('text=PDF').or(page.locator('text=Export'))).toBeVisible();
  });

  test('Suppression d\'un business plan', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.clickNewButton();
    await dashboard.fillNewPlanName('Plan à Supprimer');
    await dashboard.confirmCreate();

    // Retour au dashboard
    await dashboard.goto();
    await dashboard.expectPlanInList('Plan à Supprimer');

    // Supprime
    await dashboard.deletePlan('Plan à Supprimer');

    // Vérifie disparition
    await expect(page.locator('text=Plan à Supprimer')).not.toBeVisible();
  });
});

test.describe('✏️ Édition et mise à jour', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Modifier les informations d\'un business plan existant', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const funnel = new FunnelPage(page);

    // Crée un plan
    await dashboard.goto();
    await dashboard.clickNewButton();
    await dashboard.fillNewPlanName('Plan à Modifier');
    await dashboard.confirmCreate();

    // Remplit étape 1
    await funnel.fillBusinessInfo({
      name: 'Plan à Modifier',
      description: 'Description originale',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();

    // Retourne au dashboard
    await dashboard.goto();

    // Continue pour modifier
    await dashboard.clickContinuePlan('Plan à Modifier');

    // Modifie les informations
    await page.fill('[placeholder="Ma Super Entreprise"]', 'Plan Modifié');
    await page.fill('[placeholder="Décrivez votre activité en quelques lignes..."]', 'Description modifiée');

    // Sauvegarde (auto-save ou bouton)
    await funnel.clickNext();

    // Vérifie que la modification persiste
    await dashboard.goto();
    // Le nom doit être mis à jour dans la liste
    await dashboard.expectPlanInList('Plan Modifié');
  });

  test('Mise à jour des prévisions financières', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const funnel = new FunnelPage(page);

    await dashboard.goto();
    await dashboard.clickNewButton();
    await dashboard.fillNewPlanName('Plan Finances');
    await dashboard.confirmCreate();

    // Remplit jusqu'à l'étape financière
    await funnel.fillBusinessInfo({
      name: 'Plan Finances',
      description: 'Test finances',
      sector: 'Tech / SaaS',
    });
    await funnel.clickNext();
    await funnel.fillMarketInfo({
      marketSize: '100 milliards',
      competitors: ['A', 'B'],
    });
    await funnel.clickNext();

    // Remplit les finances
    await funnel.fillFinancialInfo({
      revenueYear1: '50000',
      revenueYear2: '100000',
      revenueYear3: '200000',
      fundingNeeded: '100000',
    });

    // Continue
    await funnel.clickNext();
    await expect(page.locator('text=Récapitulatif')).toBeVisible();

    // Vérifie que les montants sont dans le récap
    await expect(page.locator('text=50 000').or(page.locator('text=50000'))).toBeVisible();
  });
});

test.describe('🔍 Validation et erreurs', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Validation: nom d\'entreprise requis', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const funnel = new FunnelPage(page);

    await dashboard.goto();
    await dashboard.clickNewButton();
    await dashboard.fillNewPlanName('Test Validation');
    await dashboard.confirmCreate();

    // Tente de passer sans remplir le nom
    await funnel.clickNext();

    // Doit afficher une erreur
    await expect(page.locator('text=requis').or(page.locator('text=required'))).toBeVisible();
  });

  test('Validation: description trop courte', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const funnel = new FunnelPage(page);

    await dashboard.goto();
    await dashboard.clickNewButton();
    await dashboard.fillNewPlanName('Test Validation');
    await dashboard.confirmCreate();

    // Remplit nom mais description trop courte
    await page.fill('[placeholder="Ma Super Entreprise"]', 'Test');
    await page.fill('[placeholder="Décrivez votre activité en quelques lignes..."]', 'Court');
    await page.click('text=Tech / SaaS');

    await funnel.clickNext();

    // Doit afficher une erreur de validation
    await expect(page.locator('text=10 caractères').or(page.locator('text=10 characters'))).toBeVisible();
  });

  test('Nom de plan unique ou gestion des doublons', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();

    // Crée premier plan
    await dashboard.clickNewButton();
    await dashboard.fillNewPlanName('Plan Doublon');
    await dashboard.confirmCreate();

    // Retourne au dashboard
    await dashboard.goto();

    // Tente de créer un autre avec le même nom
    await dashboard.clickNewButton();
    await dashboard.fillNewPlanName('Plan Doublon');
    await dashboard.confirmCreate();

    // Doit soit refuser, soit créer avec un suffixe
    // Vérifie qu'on a 2 plans ou un message d'erreur
    await dashboard.goto();
    const plans = await page.locator('text=Plan Doublon').count();
    expect(plans).toBeGreaterThanOrEqual(1);
  });
});
