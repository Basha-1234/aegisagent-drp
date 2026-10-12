import { describe, it, expect } from 'vitest';
import {
  isOfficialAsset,
  detectLookalikeVariations,
  levenshteinDistance,
  analyzeAppStoreThreat,
  analyzeScamIntent,
  analyzeDomainRisk,
  calculateExplainableRisk
} from './detectionEngine';

const mockBrand = {
  id: 'quickpay',
  name: 'QuickPay Technologies',
  officialHandle: '@QuickPay',
  supportHandle: '@QuickPaySupport',
  officialDomain: 'quickpay.com',
  verifiedHandles: ['@QuickPay', '@QuickPaySupport'],
  officialApps: [
    {
      appName: 'QuickPay: UPI & Money Transfer',
      appId: 'com.quickpay.wallet',
      publisher: 'QuickPay Technologies Inc.'
    }
  ]
};

describe('1. Kampus.VC Official Asset Exclusion Layer', () => {
  it('correctly excludes official primary handle from threats', () => {
    expect(isOfficialAsset('@QuickPay', mockBrand)).toBe(true);
    expect(isOfficialAsset('quickpay', mockBrand)).toBe(true);
  });

  it('correctly excludes official support handle', () => {
    expect(isOfficialAsset('@QuickPaySupport', mockBrand)).toBe(true);
  });

  it('correctly excludes registered mobile app ID', () => {
    expect(isOfficialAsset('com.quickpay.wallet', mockBrand)).toBe(true);
  });

  it('does NOT exclude impersonating lookalike handles', () => {
    expect(isOfficialAsset('@QuickPay_Support_Help', mockBrand)).toBe(false);
    expect(isOfficialAsset('@QuickPay_HeIp', mockBrand)).toBe(false);
  });
});

describe('2. Bonus Engine: Look-alike Name Detection', () => {
  it('detects homoglyph character swaps (e.g. I for l or 0 for o)', () => {
    const result = detectLookalikeVariations('@QuickPay_HeIp', '@QuickPay');
    expect(result.hasCharacterSwap).toBe(true);
    expect(result.isLookalike).toBe(true);
  });

  it('detects common deceptive added words like "support" and "official"', () => {
    const result = detectLookalikeVariations('@QuickPay_Support_Desk', '@QuickPay');
    expect(result.hasAddedWords).toBe(true);
    expect(result.detectedAddedWords).toContain('support');
    expect(result.detectedAddedWords).toContain('desk');
  });

  it('detects delimiter/spacing variations', () => {
    const result = detectLookalikeVariations('quick_pay_app', 'quickpay');
    expect(result.hasDelimiterChanges).toBe(true);
    expect(result.delimitersFound).toContain('_');
  });

  it('dampens confidence for completely unrelated names to avoid over-flagging', () => {
    const result = detectLookalikeVariations('@TotallyUnrelatedAccount', '@QuickPay');
    expect(result.isLookalike).toBe(false);
    expect(result.confidenceScore).toBeLessThan(40);
  });
});

describe('3. Levenshtein Distance & Similarity', () => {
  it('calculates 100% similarity for identical handles', () => {
    const { similarity, distance } = levenshteinDistance('quickpay', 'quickpay');
    expect(similarity).toBe(100);
    expect(distance).toBe(0);
  });

  it('calculates accurate similarity for minor variations', () => {
    const { similarity } = levenshteinDistance('quickpay_help', 'quickpay');
    expect(similarity).toBeGreaterThan(60);
  });
});

describe('4. App Store Monitoring & Publisher Discrepancy', () => {
  it('flags unauthorized publisher mismatch as suspicious', () => {
    const result = analyzeAppStoreThreat({
      suspectAppName: 'QuickPay Wallet Loans',
      suspectPublisher: 'Rogue Devs LLC [UNAUTHORIZED]',
      suspectAppId: 'com.quickpay.wallet.fake',
      officialApps: mockBrand.officialApps,
      officialBrandName: mockBrand.name
    });

    expect(result.isSuspiciousApp).toBe(true);
    expect(result.flags.some(f => f.includes('Publisher mismatch'))).toBe(true);
  });

  it('verifies authorized publishers correctly', () => {
    const result = analyzeAppStoreThreat({
      suspectAppName: 'QuickPay: UPI & Money Transfer',
      suspectPublisher: 'QuickPay Technologies Inc.',
      suspectAppId: 'com.quickpay.wallet',
      officialApps: mockBrand.officialApps,
      officialBrandName: mockBrand.name
    });

    expect(result.flags.some(f => f.includes('Publisher mismatch'))).toBe(false);
  });
});

describe('5. Scam Intent & Domain Risk Analysis', () => {
  it('identifies financial fraud and credential theft patterns in bio text', () => {
    const { score, matchedPatterns, hasSevereThreat } = analyzeScamIntent(
      'Facing failed payment? DM for instant refund and send OTP to verify account'
    );
    expect(score).toBeGreaterThanOrEqual(60);
    expect(hasSevereThreat).toBe(true);
    expect(matchedPatterns.some(p => p.phrase === 'instant refund')).toBe(true);
  });

  it('flags low-cost suspicious TLDs like .xyz and lookalike brand prefixes', () => {
    const { score, flags } = analyzeDomainRisk('https://quickpay-refund-center.xyz/claim', 'quickpay.com');
    expect(score).toBeGreaterThan(50);
    expect(flags.some(f => f.includes('.xyz'))).toBe(true);
  });
});

describe('6. Composite Explainable Risk Engine', () => {
  it('guarantees 0 risk score for whitelisted official assets', () => {
    const risk = calculateExplainableRisk({
      suspectHandle: '@QuickPay',
      officialHandle: '@QuickPay',
      brand: mockBrand
    });

    expect(risk.compositeScore).toBe(0);
    expect(risk.isOfficialExcluded).toBe(true);
    expect(risk.severity).toBe('OFFICIAL_WHITELISTED');
  });

  it('assigns CRITICAL risk to high-severity impersonation attacks', () => {
    const risk = calculateExplainableRisk({
      suspectHandle: '@QuickPay_HeIp',
      officialHandle: '@QuickPay',
      suspectBio: 'Official helpline. DM for instant refund. Send OTP to claim voucher.',
      suspectUrl: 'https://quickpay-secure.xyz',
      officialDomain: 'quickpay.com',
      logoMatchPercent: 95,
      brand: mockBrand
    });

    expect(risk.compositeScore).toBeGreaterThanOrEqual(75);
    expect(risk.severity).toBe('CRITICAL');
    expect(risk.reasons.length).toBeGreaterThanOrEqual(2);
  });
});
