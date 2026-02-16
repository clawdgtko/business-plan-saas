import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour Business Plan SaaS
 * 
 * Tests E2E complets couvrant:
 * - Parcours utilisateur: Landing → Funnel → Checkout → Paiement → Dashboard
 * - Business Plan: Création, édition, export PDF
 * - Gestion des erreurs: 404, 500, validation
 * - Edge cases: Double submit, refresh mid-funnel
 * - Performance: Lighthouse CI
 * 
 * @see https://playwright.dev/docs/test-configuration
 */

const PORT = process.env.PORT || 5173;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  
  /* Exécute les tests en parallèle */
  fullyParallel: true,
  
  /* Échec sur la première erreur en CI */
  failOnFlakyTests: !!process.env.CI,
  
  /* Nombre de workers */
  workers: process.env.CI ? 1 : undefined,
  
  /* Répertoire des rapports */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    process.env.CI ? ['github'] : ['null'],
  ],
  
  /* Configuration partagée pour tous les projets */
  use: {
    /* URL de base */
    baseURL: BASE_URL,
    
    /* Collecte des traces en cas d'échec */
    trace: 'on-first-retry',
    
    /* Screenshots en cas d'échec */
    screenshot: 'only-on-failure',
    
    /* Vidéos pour debug */
    video: process.env.CI ? 'off' : 'on-first-retry',
    
    /* Viewport par défaut */
    viewport: { width: 1280, height: 720 },
    
    /* Temps d'attente */
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  /* Projets de test pour différents navigateurs */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Test sur mobile */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Serveur de développement local */
  webServer: {
    command: 'cd frontend && npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Timeout global */
  timeout: 60000,
  
  /* Expectations */
  expect: {
    timeout: 10000,
  },
});
