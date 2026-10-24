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

describe('7. Explainable Risk Attribution & Mathematical Decomposition', () => {
  it('returns structured explanation with exact point attribution', () => {
    const risk = calculateExplainableRisk({
      suspectHandle: '@QuickPay_Helpdesk',
      officialHandle: '@QuickPay',
      suspectBio: 'Official customer support for refunds and urgent KYC.',
      postCaptions: ['Click to resolve payment'],
      suspectUrl: 'https://quickpay-help.top/login',
      officialDomain: 'quickpay.com',
      logoMatchPercent: 88,
      channel: 'Social Profile',
      brand: mockBrand
    });

    const exp = risk.explanation;
    expect(exp).toBeDefined();
    expect(exp.finalScore).toBeGreaterThanOrEqual(50);
    expect(exp.severity).toMatch(/^(HIGH|CRITICAL)$/);
    expect(exp.signals.length).toBeGreaterThanOrEqual(3);

    // Total weight must equal 100%
    const totalWeight = exp.signals.reduce((acc, s) => acc + s.weightPercent, 0);
    expect(totalWeight).toBe(100);

    // Each signal has valid points and evidence
    exp.signals.forEach(s => {
      expect(s.pointsContributed ?? s.weightedPoints).toBeDefined();
      expect(s.rawScore).toBeGreaterThanOrEqual(0);
      expect(s.rawScore).toBeLessThanOrEqual(100);
      expect(s.evidence.length).toBeGreaterThan(0);
      expect(s.explanation.length).toBeGreaterThan(0);
    });

    expect(exp.recommendedAction.length).toBeGreaterThan(15);
    expect(exp.summary.length).toBeGreaterThan(15);
  });

  it('strictly caps uncorroborated name similarity at 28/100 (Anti-False-Positive Policy)', () => {
    const risk = calculateExplainableRisk({
      suspectHandle: '@QuickPayApp',
      officialHandle: '@QuickPay',
      suspectBio: 'General fan community page.',
      postCaptions: ['Fintech news updates'],
      suspectUrl: 'https://normalblog.com',
      officialDomain: 'quickpay.com',
      logoMatchPercent: 40, // < 70% threshold
      channel: 'Social Profile',
      brand: mockBrand
    });

    expect(risk.compositeScore).toBe(28);
    expect(risk.severity).toBe('LOW');
    expect(risk.explanation.isCapped).toBe(true);
    expect(risk.explanation.capReason).toContain('Anti-False-Positive Policy');
    expect(risk.explanation.capReason).toContain('Name similarity alone');
  });

  it('flags dangerous Android permissions in rogue mobile app audits', () => {
    const result = analyzeAppStoreThreat({
      suspectAppName: 'QuickPay Quick Cash',
      suspectPublisher: 'Shady Underground Corp',
      suspectAppId: 'com.quickpay.cash.fake',
      officialApps: mockBrand.officialApps,
      officialBrandName: mockBrand.name,
      permissions: ['android.permission.READ_SMS', 'android.permission.SYSTEM_ALERT_WINDOW']
    });

    expect(result.isSuspiciousApp).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.flags.some(f => f.includes('READ_SMS'))).toBe(true);
    expect(result.flags.some(f => f.includes('SYSTEM_ALERT_WINDOW'))).toBe(true);
  });

  it('produces 100% deterministic identical outputs for repeated inputs', () => {
    const input = {
      suspectHandle: '@QuickPay_Direct_Support',
      officialHandle: '@QuickPay',
      suspectBio: 'Direct refund dispatch.',
      postCaptions: ['DM for immediate reversal'],
      suspectUrl: 'https://quickpay-refund.xyz',
      officialDomain: 'quickpay.com',
      logoMatchPercent: 91,
      channel: 'Social Profile',
      brand: mockBrand
    };

    const res1 = calculateExplainableRisk(input);
    const res2 = calculateExplainableRisk(input);

    expect(res1.compositeScore).toBe(res2.compositeScore);
    expect(res1.severity).toBe(res2.severity);
    expect(res1.explanation.signals).toEqual(res2.explanation.signals);
    expect(res1.explanation.recommendedAction).toBe(res2.explanation.recommendedAction);
    expect(res1.explanation.summary).toBe(res2.explanation.summary);
  });
});
