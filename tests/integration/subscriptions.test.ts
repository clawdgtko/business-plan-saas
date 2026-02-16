import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupDb, resetDb, teardownDb } from '../helpers/database';
import { createTestApp } from '../helpers/app';
import type { D1Database } from '@cloudflare/workers-types';

/**
 * 🔗 Tests d'Intégration - API Subscriptions
 * 
 * Objectif: Tester les endpoints API avec vraie DB (Miniflare)
 * Mock Stripe API pour isolation
 */

describe('POST /api/subscriptions', () => {
  let app: ReturnType<typeof createTestApp>;
  let db: D1Database;

  beforeAll(async () => {
    db = await setupDb();
    app = createTestApp({ db, stripe: createMockStripe() });
  });

  afterAll(async () => {
    await teardownDb();
  });

  beforeEach(async () => {
    await resetDb();
  });

  describe('Création de subscription', () => {
    it('crée une subscription avec trial', async () => {
      const response = await app.request('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_premium_monthly',
          trialDays: 14,
          country: 'FR',
          customerEmail: 'test@example.com',
        }),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data).toMatchObject({
        id: expect.any(String),
        status: 'trialing',
        trialStart: expect.any(Number),
        trialEnd: expect.any(Number),
        currentPeriodStart: expect.any(Number),
        currentPeriodEnd: expect.any(Number),
        customerId: expect.any(String),
        priceId: 'price_premium_monthly',
      });

      // Vérifier en base
      const subscription = await db
        .prepare('SELECT * FROM subscriptions WHERE id = ?')
        .bind(data.id)
        .first();
      
      expect(subscription).toBeTruthy();
      expect(subscription?.status).toBe('trialing');
    });

    it('crée une subscription sans trial', async () => {
      const response = await app.request('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_starter_monthly',
          trialDays: 0,
          country: 'FR',
          paymentMethodId: 'pm_test_valid',
        }),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.status).toBe('active');
      expect(data.trialStart).toBeNull();
      expect(data.trialEnd).toBeNull();
    });

    it('retourne 400 si priceId invalide', async () => {
      const response = await app.request('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'invalid_price',
          country: 'FR',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid priceId');
    });

    it('applique la TVA correcte selon le pays', async () => {
      const testCases = [
        { country: 'FR', expectedTaxRate: 0.20 },
        { country: 'DE', expectedTaxRate: 0.19 },
        { country: 'US', expectedTaxRate: 0 },
        { country: 'CH', expectedTaxRate: 0.077 },
      ];

      for (const { country, expectedTaxRate } of testCases) {
        await resetDb();
        
        const response = await app.request('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: 'price_starter_monthly',
            country,
          }),
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.taxRate).toBe(expectedTaxRate);
      }
    });
  });

  describe('Upgrade de subscription', () => {
    it('upgrade immédiat avec prorata', async () => {
      // Créer une subscription starter d'abord
      const createResponse = await app.request('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_starter_monthly',
          country: 'FR',
        }),
      });
      
      const { id: subscriptionId } = await createResponse.json();
      
      // Upgrade vers premium
      const upgradeResponse = await app.request(`/api/subscriptions/${subscriptionId}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPriceId: 'price_premium_monthly',
          prorata: true,
        }),
      });

      expect(upgradeResponse.status).toBe(200);
      
      const data = await upgradeResponse.json();
      expect(data.status).toBe('active');
      expect(data.priceId).toBe('price_premium_monthly');
      expect(data.prorataCharge).toBeGreaterThan(0); // Charge immédiate
    });
  });

  describe('Cancel subscription', () => {
    it('cancel immédiat', async () => {
      const createResponse = await app.request('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_starter_monthly',
          country: 'FR',
        }),
      });
      
      const { id: subscriptionId } = await createResponse.json();
      
      const cancelResponse = await app.request(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          immediate: true,
        }),
      });

      expect(cancelResponse.status).toBe(200);
      
      const data = await cancelResponse.json();
      expect(data.status).toBe('canceled');
      expect(data.canceledAt).toBeTruthy();
      expect(data.currentPeriodEnd).toBe(data.canceledAt); // Accès coupé immédiatement
    });

    it('cancel en fin de période', async () => {
      const createResponse = await app.request('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_starter_monthly',
          country: 'FR',
        }),
      });
      
      const { id: subscriptionId, currentPeriodEnd } = await createResponse.json();
      
      const cancelResponse = await app.request(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          immediate: false, // End of period
        }),
      });

      expect(cancelResponse.status).toBe(200);
      
      const data = await cancelResponse.json();
      expect(data.status).toBe('active'); // Toujours active jusqu'à la fin
      expect(data.cancelAtPeriodEnd).toBe(true);
      expect(data.currentPeriodEnd).toBe(currentPeriodEnd); // Garde l'accès
    });
  });
});

// Helper pour mock Stripe
function createMockStripe() {
  return {
    customers: {
      create: vi.fn().mockResolvedValue({ id: 'cus_test_' + Date.now() }),
    },
    subscriptions: {
      create: vi.fn().mockResolvedValue({
        id: 'sub_test_' + Date.now(),
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      }),
      update: vi.fn().mockResolvedValue({ status: 'active' }),
      cancel: vi.fn().mockResolvedValue({ status: 'canceled' }),
    },
    paymentMethods: {
      attach: vi.fn().mockResolvedValue({ id: 'pm_test' }),
    },
  };
}
