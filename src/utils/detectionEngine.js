// Core algorithmic detection utilities for BrandGuard AI
// Aligned with Kampus.VC Digital Risk Protection Evaluation Criteria

// ==========================================
// 1. OFFICIAL ASSET EXCLUSION LAYER (Mandatory Rubric Requirement)
// Ensures verified brand accounts and mobile apps are NEVER flagged as threats.
// ==========================================
export function isOfficialAsset(suspectIdentifier, brand) {
  if (!suspectIdentifier || !brand) return false;
  const cleanSuspect = suspectIdentifier.toLowerCase().trim().replace(/^@/, '');
  
  // 1. Check official primary handle
  const cleanOfficialHandle = (brand.officialHandle || '').toLowerCase().trim().replace(/^@/, '');
  if (cleanSuspect === cleanOfficialHandle) return true;

  // 2. Check official support handle
  const cleanSupportHandle = (brand.supportHandle || '').toLowerCase().trim().replace(/^@/, '');
  if (cleanSuspect === cleanSupportHandle) return true;

  // 3. Check official verified handles list
  if (brand.verifiedHandles && brand.verifiedHandles.some(h => h.toLowerCase().replace(/^@/, '') === cleanSuspect)) {
    return true;
  }

  // 4. Check official mobile app package IDs
  if (brand.officialApps && brand.officialApps.some(app => app.appId.toLowerCase() === cleanSuspect || app.appName.toLowerCase() === cleanSuspect)) {
    return true;
  }

  // 5. Check official authoritative domains
  const cleanDomain = (brand.officialDomain || '').toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  if (cleanSuspect === cleanDomain) return true;

  return false;
}

// ==========================================
// 2. BONUS CREDIT ENGINE: LOOK-ALIKE NAME DETECTION
// Detects: Character swaps (homoglyphs), Added words, Spacing/delimiter changes
// Avoids over-flagging normal or legitimate names.
// ==========================================
export function detectLookalikeVariations(suspectNameOrHandle, officialNameOrHandle) {
  const suspect = suspectNameOrHandle.toLowerCase().replace(/^@/, '').trim();
  const official = officialNameOrHandle.toLowerCase().replace(/^@/, '').trim();

  // Common homoglyphs and character swaps
  const charSwapMap = {
    '0': 'o', 'o': '0',
    '1': 'l', 'l': '1', 'i': 'l', 'l': 'i',
    '5': 's', 's': '5',
    '3': 'e', 'e': '3',
    '@': 'a', 'a': '@',
    'v': 'u', 'vv': 'w'
  };

  // Common squatting added words
  const commonAddedWords = [
    'official', 'support', 'help', 'helpdesk', 'care', 'service', 
    'verify', 'verified', 'secure', 'team', 'desk', 'refund', 
    'claim', 'portal', 'center', 'assist', 'emergency', 'bonus'
  ];

  const variations = {
    hasCharacterSwap: false,
    swappedCharacters: [],
    hasAddedWords: false,
    detectedAddedWords: [],
    hasDelimiterChanges: false,
    delimitersFound: [],
    isLookalike: false,
    confidenceScore: 0,
    explanation: []
  };

  if (!suspect || !official) return variations;

  // Check A: Delimiter / Spacing Changes (e.g. "quick_pay", "quick.pay", "quick-pay")
  const delimiters = ['_', '.', '-', ' '];
  delimiters.forEach(d => {
    if (suspect.includes(d) && !official.includes(d)) {
      variations.hasDelimiterChanges = true;
      variations.delimitersFound.push(d);
    }
  });

  const strippedSuspect = suspect.replace(/[_\.\-\s]/g, '');
  const strippedOfficial = official.replace(/[_\.\-\s]/g, '');

  // Check B: Character Swaps (homoglyphs)
  let normalizedSuspect = strippedSuspect;
  let swapsFound = [];
  for (let i = 0; i < strippedSuspect.length; i++) {
    const ch = strippedSuspect[i];
    if (charSwapMap[ch]) {
      const canonical = charSwapMap[ch];
      const testNormalized = normalizedSuspect.substring(0, i) + canonical + normalizedSuspect.substring(i + 1);
      // Check if replacing it aligns with official brand stem OR resolves a common squatting word
      if (strippedOfficial.includes(canonical) || commonAddedWords.some(w => testNormalized.includes(w) && !strippedSuspect.includes(w))) {
        swapsFound.push(`${ch} ➔ ${canonical}`);
        normalizedSuspect = testNormalized;
      }
    }
  }

  if (swapsFound.length > 0) {
    variations.hasCharacterSwap = true;
    variations.swappedCharacters = [...new Set(swapsFound)];
  }

  // Check C: Added Words Detection (Prefix/Suffix Squatting)
  commonAddedWords.forEach(word => {
    if (suspect.includes(word) && !official.includes(word)) {
      variations.hasAddedWords = true;
      variations.detectedAddedWords.push(word);
    }
  });

  // Calculate Look-alike Confidence (Dampened to avoid over-flagging normal names)
  let score = 0;
  if (normalizedSuspect.includes(strippedOfficial) || strippedOfficial.includes(normalizedSuspect)) {
    score += 40; // Core brand stem match
  }

  if (variations.hasCharacterSwap) score += 30;
  if (variations.hasAddedWords) score += 25;
  if (variations.hasDelimiterChanges) score += 15;

  // False-Positive Dampener: If suspect name is extremely long or completely unrelated
  if (!normalizedSuspect.includes(strippedOfficial) && score < 40) {
    score = Math.floor(score * 0.3); // dampen down
  }

  variations.confidenceScore = Math.min(100, score);
  variations.isLookalike = variations.confidenceScore >= 50;

  if (variations.hasCharacterSwap) {
    variations.explanation.push(`Character swap detected: [${variations.swappedCharacters.join(', ')}]`);
  }
  if (variations.hasAddedWords) {
    variations.explanation.push(`Added deceptive words: [${variations.detectedAddedWords.join(', ')}]`);
  }
  if (variations.hasDelimiterChanges) {
    variations.explanation.push(`Delimiter/spacing modification using '${variations.delimitersFound.join(', ')}'`);
  }

  return variations;
}

// ==========================================
// 3. LEVENSHTEIN DISTANCE & NORMALIZED SIMILARITY
// ==========================================
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

// ==========================================
// 4. APP STORE PUBLISHER & METADATA AUDITOR (App Store Rubric 30%)
// ==========================================
export function analyzeAppStoreThreat({
  suspectAppName,
  suspectPublisher,
  suspectAppId,
  officialApps = [],
  officialBrandName
}) {
  const flags = [];
  let riskScore = 0;

  // Check 1: Publisher Discrepancy
  const isAuthorizedPublisher = officialApps.some(app => 
    app.publisher.toLowerCase().trim() === (suspectPublisher || '').toLowerCase().trim()
  );

  if (!isAuthorizedPublisher && suspectPublisher) {
    flags.push(`Publisher mismatch: "${suspectPublisher}" is not an authorized developer`);
    riskScore += 45;
  }

  // Check 2: App Name Similarity
  const primaryOfficialAppName = officialApps[0]?.appName || officialBrandName;
  const { similarity: nameSimilarity } = levenshteinDistance(suspectAppName, primaryOfficialAppName);
  
  if (nameSimilarity >= 65) {
    flags.push(`${nameSimilarity}% App name imitation targeting "${primaryOfficialAppName}"`);
    riskScore += 35;
  }

  // Check 3: Suspicious App ID / Package Name (Typosquatting in bundle ID)
  const officialPackage = officialApps[0]?.appId || `com.${officialBrandName.toLowerCase().replace(/\s+/g, '')}`;
  if (suspectAppId && suspectAppId.includes(officialBrandName.toLowerCase().replace(/\s+/g, '')) && suspectAppId !== officialPackage) {
    flags.push(`Unauthorized Android package namespace: "${suspectAppId}"`);
    riskScore += 20;
  }

  return {
    score: Math.min(100, riskScore),
    flags,
    isSuspiciousApp: riskScore >= 45
  };
}

// ==========================================
// 5. SCAM INTENT & PHISHING KEYWORDS (Social Rubric 30%)
// ==========================================
export const SCAM_KEYWORDS = [
  { phrase: 'instant refund', weight: 40, category: 'Financial Scam' },
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

  return {
    score: Math.min(100, totalScore),
    matchedPatterns,
    hasSevereThreat: totalScore >= 50
  };
}

// ==========================================
// 6. LOOKALIKE DOMAIN ANALYZER
// ==========================================
export function analyzeDomainRisk(url = '', officialDomain = '') {
  if (!url) return { score: 0, flags: [] };

  const suspiciousTLDs = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.work', '.click', '.buzz'];
  const flags = [];
  let score = 0;

  const lowerUrl = url.toLowerCase();
  const official = officialDomain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');

  for (let tld of suspiciousTLDs) {
    if (lowerUrl.includes(tld)) {
      flags.push(`Low-reputation scam TLD (${tld})`);
      score += 40;
      break;
    }
  }

  if (lowerUrl.includes('-') || lowerUrl.includes('_')) {
    flags.push('Deceptive hyphenated domain');
    score += 20;
  }

  const cleanBrandName = official.split('.')[0];
  if (lowerUrl.includes(cleanBrandName) && !lowerUrl.includes(official)) {
    flags.push(`Brand name squatting on foreign host`);
    score += 40;
  }

  return {
    score: Math.min(100, score),
    flags
  };
}

// ==========================================
// 7. COMPOSITE EXPLAINABLE RISK ENGINE (Main Evaluator)
// ==========================================
export function calculateExplainableRisk({
  suspectHandle,
  officialHandle,
  suspectBio = '',
  postCaptions = [],
  suspectUrl = '',
  officialDomain = '',
  logoMatchPercent = 50,
  channel = 'Social Profile',
  suspectPublisher = '',
  officialApps = [],
  brand = null
}) {
  // 1. Mandatory Check: If this is an official brand asset, IMMEDIATELY return 0 Risk (EXCLUDED)
  if (brand && isOfficialAsset(suspectHandle, brand)) {
    return {
      compositeScore: 0,
      severity: 'OFFICIAL_WHITELISTED',
      isOfficialExcluded: true,
      breakdown: { handleScore: 0, logoScore: 0, scamScore: 0, domainScore: 0 },
      reasons: ['Verified Official Brand Asset (Excluded from threat feed by safety policy)'],
      lookalike: null
    };
  }

  // 2. Bonus Look-alike Analysis
  const lookalike = detectLookalikeVariations(suspectHandle, officialHandle);
  
  // 3. String & Logo Matching
  const { similarity: handleSim } = levenshteinDistance(suspectHandle, officialHandle);
  const { score: scamScore, matchedPatterns } = analyzeScamIntent(suspectBio, postCaptions);
  const { score: domainScore, flags: domainFlags } = analyzeDomainRisk(suspectUrl, officialDomain);

  // 4. App Store specific checks if applicable
  let appScore = 0;
  let appFlags = [];
  if (channel === 'Rogue Mobile App') {
    const appAudit = analyzeAppStoreThreat({
      suspectAppName: suspectHandle,
      suspectPublisher,
      suspectAppId: suspectUrl,
      officialApps,
      officialBrandName: brand?.name || 'Brand'
    });
    appScore = appAudit.score;
    appFlags = appAudit.flags;
  }

  // Weighted Risk Composition
  const effectiveHandleScore = Math.min(100, handleSim + (lookalike.isLookalike ? 20 : 0));
  
  let composite = 0;
  if (channel === 'Rogue Mobile App') {
    // 35% Publisher/App audit, 30% Logo, 20% Name, 15% Description
    composite = Math.round(appScore * 0.35 + logoMatchPercent * 0.30 + effectiveHandleScore * 0.20 + scamScore * 0.15);
  } else {
    // Social / Web: 30% Handle, 30% Logo, 25% Scam NLP, 15% Domain
    composite = Math.round(effectiveHandleScore * 0.30 + logoMatchPercent * 0.30 + scamScore * 0.25 + domainScore * 0.15);
  }

  let severity = 'LOW';
  if (composite >= 75) severity = 'CRITICAL';
  else if (composite >= 50) severity = 'HIGH';
  else if (composite >= 30) severity = 'MEDIUM';

  const reasons = [];
  if (lookalike.explanation.length > 0) {
    reasons.push(...lookalike.explanation);
  } else if (handleSim >= 70) {
    reasons.push(`${handleSim}% username similarity to official handle`);
  }

  if (logoMatchPercent >= 75) reasons.push(`${logoMatchPercent}% visual logo imitation`);
  if (matchedPatterns.length > 0) {
    reasons.push(`Detected scam phrases: ${matchedPatterns.map(p => `"${p.phrase}"`).join(', ')}`);
  }
  if (appFlags.length > 0) {
    reasons.push(...appFlags);
  }
  if (domainFlags.length > 0) {
    reasons.push(...domainFlags);
  }

  return {
    compositeScore: composite,
    severity,
    isOfficialExcluded: false,
    breakdown: {
      handleScore: effectiveHandleScore,
      logoScore: logoMatchPercent,
      scamScore,
      domainScore,
      appScore
    },
    lookalike,
    reasons
  };
}
