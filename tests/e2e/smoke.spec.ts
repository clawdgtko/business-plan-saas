import { test, expect } from '@playwright/test';

/**
 * 🧪 Test de vérification Playwright
 * 
 * Ce test vérifie que Playwright est correctement configuré
 */

test.describe('Configuration Playwright', () => {
  test('la page d\'accueil charge correctement', async ({ page }) => {
    await page.goto('/');
    
    // Vérifie que la page a un titre ou du contenu
    const title = await page.title();
    console.log('Page title:', title);
    
    // Vérifie au moins que le body est présent
    await expect(page.locator('body')).toBeVisible();
  });

  test('la navigation fonctionne', async ({ page }) => {
    await page.goto('/');
    
    // Vérifie que des éléments interactifs existent
    const hasLinks = await page.locator('a').count() > 0;
    expect(hasLinks).toBeTruthy();
  });
});
