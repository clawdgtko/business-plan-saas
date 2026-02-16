import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PricingCalculator } from '../../src/lib/pricing';
import { calculateTax } from '../../src/lib/tax';

/**
 * 🧪 Tests Unitaires - Pricing & Tax
 * 
 * Objectif: Valider la logique métier pure
 * Pas d'appels externes, pas de DB
 */

describe('PricingCalculator', () => {
  describe('calculateSubscriptionPrice', () => {
    it.each([
      // Plan Starter
      { plan: 'starter', billing: 'monthly', country: 'FR', expected: { net: 29, tax: 5.8, total: 34.8 } },
      { plan: 'starter', billing: 'yearly', country: 'FR', expected: { net: 290, tax: 58, total: 348 } },
      
      // Plan Premium
      { plan: 'premium', billing: 'monthly', country: 'FR', expected: { net: 79, tax: 15.8, total: 94.8 } },
      { plan: 'premium', billing: 'yearly', country: 'FR', expected: { net: 790, tax: 158, total: 948 } },
      
      // Sans TVA (hors EU)
      { plan: 'starter', billing: 'monthly', country: 'US', expected: { net: 29, tax: 0, total: 29 } },
      { plan: 'premium', billing: 'monthly', country: 'CH', expected: { net: 79, tax: 6.08, total: 85.08 } }, // 7.7%
    ])('calcule le prix pour $plan/$billing en $country', ({ plan, billing, country, expected }) => {
      const result = PricingCalculator.calculate(plan, billing, country);
      
      expect(result.net).toBe(expected.net);
      expect(result.tax).toBeCloseTo(expected.tax, 2);
      expect(result.total).toBeCloseTo(expected.total, 2);
    });
  });

  describe('prorata calculation', () => {
    it('calcule le prorata lors d\'un upgrade', () => {
      const now = new Date('2026-02-15');
      const periodEnd = new Date('2026-03-15'); // 28 jours restants
      
      const prorata = PricingCalculator.calculateUpgradeProrata({
        currentPlan: 'starter',
        newPlan: 'premium',
        currentPeriodEnd: periodEnd,
        now,
      });
      
      // Starter mensuel: 29€, Premium mensuel: 79€
      // Différence: 50€, prorata sur 28/28 jours = 50€
      expect(prorata.amount).toBe(50);
      expect(prorata.immediateCharge).toBe(true);
    });

    it('crédite le montant restant lors du calcul', () => {
      const now = new Date('2026-02-15');
      const periodStart = new Date('2026-01-15');
      const periodEnd = new Date('2026-02-15'); // Période terminée
      
      const credit = PricingCalculator.calculateRemainingCredit({
        plan: 'starter',
        periodStart,
        periodEnd,
        now,
      });
      
      expect(credit).toBe(0); // Période terminée = pas de crédit
    });
  });

  describe('trial calculation', () => {
    it('retourne 14 jours de trial pour premium', () => {
      const trial = PricingCalculator.getTrialDays('premium');
      expect(trial).toBe(14);
    });

    it('retourne 0 jours de trial pour starter', () => {
      const trial = PricingCalculator.getTrialDays('starter');
      expect(trial).toBe(0);
    });

    it('calcule la date de fin de trial', () => {
      const now = new Date('2026-02-16');
      const endDate = PricingCalculator.calculateTrialEnd('premium', now);
      
      // 14 jours après le 16 février = 2 mars
      expect(endDate).toEqual(new Date('2026-03-02'));
    });
  });
});

describe('Tax Calculator', () => {
  describe('EU VAT', () => {
    it.each([
      { country: 'FR', rate: 0.20 },
      { country: 'DE', rate: 0.19 },
      { country: 'IT', rate: 0.22 },
      { country: 'ES', rate: 0.21 },
      { country: 'BE', rate: 0.21 },
    ])('applique le bon taux de TVA pour $country', ({ country, rate }) => {
      const tax = calculateTax(100, country, 'B2C');
      expect(tax.rate).toBe(rate);
      expect(tax.amount).toBeCloseTo(100 * rate, 2);
    });

    it('applique la TVA du pays du client pour B2C', () => {
      // Règle: B2C = TVA du pays du client
      const tax = calculateTax(100, 'DE', 'B2C');
      expect(tax.country).toBe('DE');
      expect(tax.rate).toBe(0.19);
    });

    it('applique la TVA du pays du vendeur pour B2B avec TVA valide', () => {
      // Règle: B2B avec VAT ID valide = reverse charge
      const tax = calculateTax(100, 'DE', 'B2B', { vatId: 'DE123456789' });
      expect(tax.reverseCharge).toBe(true);
      expect(tax.amount).toBe(0);
    });
  });

  describe('Outside EU', () => {
    it('ne calcule pas de TVA pour US', () => {
      const tax = calculateTax(100, 'US', 'B2C');
      expect(tax.amount).toBe(0);
      expect(tax.rate).toBe(0);
    });

    it('applique la TVA suisse pour CH', () => {
      const tax = calculateTax(100, 'CH', 'B2C');
      expect(tax.rate).toBe(0.077);
      expect(tax.amount).toBe(7.7);
    });

    it('applique le GST pour AU', () => {
      const tax = calculateTax(100, 'AU', 'B2C');
      expect(tax.rate).toBe(0.10);
      expect(tax.amount).toBe(10);
    });
  });

  describe('Validation', () => {
    it('lève une erreur pour un pays inconnu', () => {
      expect(() => calculateTax(100, 'XX', 'B2C')).toThrow('Unknown country: XX');
    });

    it('arrondit à 2 décimales', () => {
      const tax = calculateTax(99.99, 'FR', 'B2C');
      expect(tax.amount).toBe(20.00); // 19.998 arrondi
    });
  });
});
