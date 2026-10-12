// Core algorithmic detection utilities for BrandGuard AI

// 1. Levenshtein Distance & Normalized Similarity
export function levenshteinDistance(s1, s2) {
  const a = s1.toLowerCase().trim();
  const b = s2.toLowerCase().trim();
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const dist = dp[m][n];
  const maxLen = Math.max(m, n) || 1;
  const similarity = Math.max(0, Math.round((1 - dist / maxLen) * 100));
  return { distance: dist, similarity };
}

// 2. Homoglyph and Character Substitution Detection
// Checks if suspect handle replaces characters (e.g. '0' for 'o', '1' or 'l' for 'i', 'vv' for 'w')
export function detectHomoglyphs(suspectHandle, officialHandle) {
  const map = {
    '0': 'o',
    '1': 'i',
    'l': 'i',
    'i': 'l',
    '5': 's',
    '@': 'a',
    '3': 'e',
    '_': '',
    '-': '',
    '.': ''
  };

  const cleanOfficial = officialHandle.replace(/^@/, '').toLowerCase();
  let normalizedSuspect = suspectHandle.replace(/^@/, '').toLowerCase();

  let substitutions = [];
  for (let char of normalizedSuspect) {
    if (map[char] !== undefined) {
      substitutions.push({ char, replaced: map[char] });
    }
  }

  // Normalize and compare
  let canonSuspect = normalizedSuspect;
  for (let [k, v] of Object.entries(map)) {
    canonSuspect = canonSuspect.split(k).join(v);
  }

  const isSquatting = canonSuspect.includes(cleanOfficial) || cleanOfficial.includes(canonSuspect);
  return {
    isSquatting,
    substitutionsCount: substitutions.length,
    hasHomoglyphs: substitutions.length > 0 && isSquatting
  };
}

// 3. Scam Intent & Phishing Keyword Classifier
export const SCAM_KEYWORDS = [
  { phrase: 'instant refund', weight: 35, category: 'Financial Scam' },
  { phrase: 'dm for refund', weight: 40, category: 'Financial Scam' },
  { phrase: 'support desk', weight: 20, category: 'Impersonation' },
  { phrase: 'official help', weight: 20, category: 'Impersonation' },
  { phrase: 'urgent kyc', weight: 35, category: 'Credential Harvesting' },
  { phrase: 'kyc verification', weight: 30, category: 'Credential Harvesting' },
  { phrase: 'giveaway claim', weight: 35, category: 'Fraudulent Promotion' },
  { phrase: 'crypto bonus', weight: 35, category: 'Crypto Scam' },
  { phrase: 'verify account', weight: 25, category: 'Credential Harvesting' },
  { phrase: 'customer care', weight: 20, category: 'Impersonation' },
  { phrase: 'helpline 24x7', weight: 20, category: 'Impersonation' },
  { phrase: 'send otp', weight: 45, category: 'Credential Theft' },
  { phrase: 'claim reward', weight: 30, category: 'Fraudulent Promotion' }
];

export function analyzeScamIntent(bioText = '', postCaptions = []) {
  const fullText = (bioText + ' ' + postCaptions.join(' ')).toLowerCase();
  let matchedPatterns = [];
  let totalScore = 0;

  for (let item of SCAM_KEYWORDS) {
    if (fullText.includes(item.phrase)) {
      matchedPatterns.push(item);
      totalScore += item.weight;
    }
  }

  const cappedScore = Math.min(100, totalScore);
  return {
    score: cappedScore,
    matchedPatterns,
    hasSevereThreat: cappedScore >= 60
  };
}

// 4. Lookalike Domain / URL Risk Analyzer
export function analyzeDomainRisk(url = '', officialDomain = '') {
  if (!url) return { score: 0, flags: [] };

  const suspiciousTLDs = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.work', '.click', '.buzz'];
  const flags = [];
  let score = 0;

  const lowerUrl = url.toLowerCase();
  const official = officialDomain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');

  for (let tld of suspiciousTLDs) {
    if (lowerUrl.includes(tld)) {
      flags.push(`Suspicious low-reputation TLD (${tld})`);
      score += 40;
      break;
    }
  }

  if (lowerUrl.includes('-') || lowerUrl.includes('_')) {
    flags.push('Hyphenated lookalike domain structure');
    score += 20;
  }

  const cleanBrandName = official.split('.')[0];
  if (lowerUrl.includes(cleanBrandName) && !lowerUrl.includes(official)) {
    flags.push(`Brand name hijacking on unauthorized domain (${cleanBrandName})`);
    score += 45;
  }

  return {
    score: Math.min(100, score),
    flags
  };
}

// 5. Composite Explainable Risk Engine
export function calculateExplainableRisk({
  suspectHandle,
  officialHandle,
  suspectBio = '',
  postCaptions = [],
  suspectUrl = '',
  officialDomain = '',
  logoMatchPercent = 50
}) {
  const { similarity: handleSim } = levenshteinDistance(suspectHandle, officialHandle);
  const { hasHomoglyphs } = detectHomoglyphs(suspectHandle, officialHandle);
  const { score: scamScore, matchedPatterns } = analyzeScamIntent(suspectBio, postCaptions);
  const { score: domainScore, flags: domainFlags } = analyzeDomainRisk(suspectUrl, officialDomain);

  // Weights: Handle (30%), Logo (30%), Scam Intent (25%), Domain (15%)
  const handleScoreEffective = Math.min(100, handleSim + (hasHomoglyphs ? 20 : 0));
  const composite = Math.round(
    handleScoreEffective * 0.30 +
    logoMatchPercent * 0.30 +
    scamScore * 0.25 +
    domainScore * 0.15
  );

  let severity = 'LOW';
  if (composite >= 75) severity = 'CRITICAL';
  else if (composite >= 50) severity = 'HIGH';
  else if (composite >= 30) severity = 'MEDIUM';

  const reasons = [];
  if (handleSim >= 70) reasons.push(`${handleSim}% username similarity to official handle`);
  if (hasHomoglyphs) reasons.push('Homoglyph or character substitution detected in username');
  if (logoMatchPercent >= 75) reasons.push(`${logoMatchPercent}% visual logo imitation`);
  if (matchedPatterns.length > 0) {
    reasons.push(`Detected scam phrases: ${matchedPatterns.map(p => `"${p.phrase}"`).join(', ')}`);
  }
  if (domainFlags.length > 0) {
    reasons.push(domainFlags.join('; '));
  }

  return {
    compositeScore: composite,
    severity,
    breakdown: {
      handleScore: handleScoreEffective,
      logoScore: logoMatchPercent,
      scamScore,
      domainScore
    },
    reasons
  };
}
