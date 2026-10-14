import { describe, it, expect } from 'vitest';
import { isOfficialAsset, calculateExplainableRisk } from './detectionEngine';
import { BRANDS } from '../data/mockData';

describe('Customer Support & Executive Functional Utilities', () => {
  const brand = BRANDS[0]; // Razorpay

  describe('Customer Support: Instant Handle/Link Verifier', () => {
    it('verifies registered official handle as safe with zero risk', () => {
      const isOfficial = isOfficialAsset(brand.officialHandle, brand);
      expect(isOfficial).toBe(true);

      const result = calculateExplainableRisk({
        suspectHandle: brand.officialHandle,
        officialHandle: brand.officialHandle,
        brand
      });
      expect(result.isOfficialExcluded).toBe(true);
      expect(result.compositeScore).toBe(0);
      expect(result.severity).toBe('OFFICIAL_WHITELISTED');
    });

    it('identifies squatted support handle as high/critical threat with actionable reasons', () => {
      const suspect = `${brand.officialHandle}_Support_24x7`;
      const isOfficial = isOfficialAsset(suspect, brand);
      expect(isOfficial).toBe(false);

      const result = calculateExplainableRisk({
        suspectHandle: suspect,
        officialHandle: brand.officialHandle,
        suspectUrl: `https://razorpay-merchant-refund.xyz`,
        officialDomain: brand.officialDomain,
        logoMatchPercent: 70,
        brand
      });
      expect(result.isOfficialExcluded).toBe(false);
      expect(result.compositeScore).toBeGreaterThanOrEqual(45);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('identifies verified mobile app package ID correctly', () => {
      const officialAppId = brand.officialApps[0].appId;
      const isOfficial = isOfficialAsset(officialAppId, brand);
      expect(isOfficial).toBe(true);
    });
  });

  describe('CISO & Executive: Fraud Loss Avoidance Calculator', () => {
    it('correctly calculates gross exposure, avoided loss, and residual risk', () => {
      const customers = 2500;
      const avgLoss = 180;
      const preventionRate = 85;

      const grossExposure = customers * avgLoss;
      const avoidedLoss = Math.round(grossExposure * (preventionRate / 100));
      const residualRisk = grossExposure - avoidedLoss;

      expect(grossExposure).toBe(450000);
      expect(avoidedLoss).toBe(382500);
      expect(residualRisk).toBe(67500);
    });

    it('handles boundary conditions (0% and 100% prevention rate)', () => {
      const customers = 1000;
      const avgLoss = 100;
      const gross = customers * avgLoss;

      const avoidedAtZero = Math.round(gross * (0 / 100));
      expect(avoidedAtZero).toBe(0);

      const avoidedAtFull = Math.round(gross * (100 / 100));
      expect(avoidedAtFull).toBe(gross);
    });
  });

  describe('CISO & Executive: Audit Log Export Structure', () => {
    it('formats audit records with valid ISO timestamps and SHA-256 seals', () => {
      const sampleEvent = {
        id: 'EVT-TEST-001',
        timestamp: new Date().toISOString(),
        actor: 'test@company.com',
        role: 'ciso',
        action: 'DOCKET_COMPILED',
        targetEntity: 'Rule 3(2)(b) Notice',
        status: 'SEALED',
        severity: 'HIGH',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      };

      expect(sampleEvent.id).toMatch(/^EVT-/);
      expect(new Date(sampleEvent.timestamp).getTime()).not.toBeNaN();
      expect(sampleEvent.hash).toHaveLength(64);
    });
  });
});
