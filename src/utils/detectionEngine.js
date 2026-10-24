// Core algorithmic detection utilities for BrandGuard AI / AegisAgent DRP
// Aligned with Kampus.VC Digital Risk Protection Evaluation Criteria & Explainable Risk Scoring

// ==========================================
// 1. OFFICIAL ASSET EXCLUSION LAYER (Mandatory Rubric Requirement)
// Ensures verified brand accounts and mobile apps are NEVER flagged as threats.
// ==========================================
export function isOfficialAsset(suspectIdentifier, brand) {
  if (!suspectIdentifier || !brand) return false;
  const cleanSuspect = suspectIdentifier.toLowerCase().trim().replace(/^@/, '');
  
  // 1. Check official primary handle
  const cleanOfficialHandle = (brand.officialHandle || brand.official_handle || '').toLowerCase().trim().replace(/^@/, '');
  if (cleanSuspect === cleanOfficialHandle) return true;

  // 2. Check official support handle
  const cleanSupportHandle = (brand.supportHandle || brand.support_handle || '').toLowerCase().trim().replace(/^@/, '');
  if (cleanSuspect === cleanSupportHandle) return true;

  // 3. Check official verified handles list
  const verified = brand.verifiedHandles || brand.verified_handles || [];
  if (verified.some(h => h.toLowerCase().replace(/^@/, '').trim() === cleanSuspect)) {
    return true;
  }

  // 4. Check official mobile app package IDs
  const apps = brand.officialApps || brand.official_apps || [];
  if (apps.some(app => {
    const appId = (app.appId || app.app_id || '').toLowerCase().trim();
    const appName = (app.appName || app.app_name || '').toLowerCase().trim();
    return cleanSuspect === appId || cleanSuspect === appName;
  })) {
    return true;
  }

  // 5. Check official authoritative domains
  const rawDomain = brand.officialDomain || brand.official_domain || '';
  const cleanDomain = rawDomain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
  const cleanSuspectDomain = cleanSuspect.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
  if (cleanSuspectDomain === cleanDomain) return true;

  return false;
}

// ==========================================
// 2. BONUS CREDIT ENGINE: LOOK-ALIKE NAME DETECTION
// Detects: Character swaps (homoglyphs), Added words, Spacing/delimiter changes
// ==========================================
export function detectLookalikeVariations(suspectNameOrHandle, officialNameOrHandle) {
  const suspect = (suspectNameOrHandle || '').toLowerCase().replace(/^@/, '').trim();
  const official = (officialNameOrHandle || '').toLowerCase().replace(/^@/, '').trim();

  const charSwapMap = {
    '0': 'o', 'o': '0',
    '1': 'l', 'l': '1', 'i': 'l', 'l': 'i',
    '5': 's', 's': '5',
    '3': 'e', 'e': '3',
    '@': 'a', 'a': '@',
    'v': 'u', 'vv': 'w',
    'ø': 'o', 'ı': 'i'
  };

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

  // Check A: Delimiter / Spacing Changes
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
      if (strippedOfficial.includes(canonical) || commonAddedWords.some(w => testNormalized.includes(w) && !strippedSuspect.includes(w))) {
        swapsFound.push(`${ch} ➔ ${canonical}`);
        normalizedSuspect = testNormalized;
      }
    }
  }

  if (swapsFound.length > 0) {
    variations.hasCharacterSwap = true;
    variations.swappedCharacters = Array.from(new Set(swapsFound));
  }

  // Check C: Squatting Words
  commonAddedWords.forEach(word => {
    if (suspect.includes(word) && !official.includes(word)) {
      variations.hasAddedWords = true;
      variations.detectedAddedWords.push(word);
    }
  });

  // Calculate Confidence
  let score = 0;
  if (strippedOfficial.includes(normalizedSuspect) || normalizedSuspect.includes(strippedOfficial)) {
    score += 40;
  }
  if (variations.hasCharacterSwap) score += 30;
  if (variations.hasAddedWords) score += 25;
  if (variations.hasDelimiterChanges) score += 15;

  // Dampener for completely unrelated names
  if (!normalizedSuspect.includes(strippedOfficial) && score < 40) {
    score = Math.floor(score * 0.3);
  }

  variations.confidenceScore = Math.min(100, score);
  variations.isLookalike = variations.confidenceScore >= 50;

  if (variations.hasCharacterSwap) {
    variations.explanation.push(`Character swap detected: [${variations.swappedCharacters.join(', ')}]`);
  }
  if (variations.hasAddedWords) {
    variations.explanation.push(`Added deceptive squatting words: [${variations.detectedAddedWords.join(', ')}]`);
  }
  if (variations.hasDelimiterChanges) {
    variations.explanation.push(`Delimiter modification using '${variations.delimitersFound.join(', ')}'`);
  }

  return variations;
}

// ==========================================
// 3. LEVENSHTEIN DISTANCE METRIC
// ==========================================
export function levenshteinDistance(s1 = '', s2 = '') {
  const a = (s1 || '').toLowerCase().trim();
  const b = (s2 || '').toLowerCase().trim();
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

  const distance = dp[m][n];
  const maxLen = Math.max(m, n) || 1;
  const similarity = Math.max(0, Math.round((1 - distance / maxLen) * 100));

  return { distance, similarity };
}

// ==========================================
// 4. APP STORE & PERMISSION AUDITOR
// ==========================================
export function analyzeAppStoreThreat({
  suspectAppName,
  suspectPublisher,
  suspectAppId,
  officialApps = [],
  officialBrandName = '',
  suspectBio = '',
  postCaptions = [],
  permissions = []
}) {
  const flags = [];
  let riskScore = 0;
  const missingEvidence = [];
  const detectedPermissions = [];

  // Check 1: Publisher Discrepancy
  if (!suspectPublisher) {
    missingEvidence.push('Publisher metadata unavailable from store listing');
  } else {
    const isAuthorized = officialApps.some(app => 
      (app.publisher || '').toLowerCase().trim() === suspectPublisher.toLowerCase().trim()
    );

    if (!isAuthorized) {
      flags.push(`Publisher mismatch: "${suspectPublisher}" is not an authorized enterprise developer`);
      riskScore += 45;
    }
  }

  // Check 2: App Name Similarity
  const primaryOfficialAppName = officialApps[0]?.appName || officialBrandName;
  const { similarity: nameSimilarity } = levenshteinDistance(suspectAppName, primaryOfficialAppName);
  
  if (nameSimilarity >= 65) {
    flags.push(`${nameSimilarity}% App name imitation targeting "${primaryOfficialAppName}"`);
    riskScore += 35;
  }

  // Check 3: Suspicious App ID / Package Name
  const cleanBrand = officialBrandName.toLowerCase().replace(/\s+/g, '');
  const officialPackage = officialApps[0]?.appId || `com.${cleanBrand}`;
  if (suspectAppId) {
    if (suspectAppId.toLowerCase().includes(cleanBrand) && suspectAppId.toLowerCase() !== officialPackage.toLowerCase()) {
      flags.push(`Unauthorized Android package namespace: "${suspectAppId}"`);
      riskScore += 20;
    }
  } else {
    missingEvidence.push('App package identifier unavailable');
  }

  // Check 4: High-Risk Android Permission Audit
  const HIGH_RISK_PERMISSIONS = {
    READ_SMS: {
      weight: 30,
      severity: 'CRITICAL',
      desc: 'Intercepts incoming 2FA SMS tokens and banking OTPs'
    },
    SYSTEM_ALERT_WINDOW: {
      weight: 25,
      severity: 'CRITICAL',
      desc: 'Draws deceptive overlay injection screens over authentic banking apps'
    },
    BIND_ACCESSIBILITY_SERVICE: {
      weight: 30,
      severity: 'CRITICAL',
      desc: 'Abuses accessibility service to hijack user screen and keystrokes'
    },
    REQUEST_INSTALL_PACKAGES: {
      weight: 20,
      severity: 'HIGH',
      desc: 'Silently downloads and installs secondary rogue APK droppers'
    },
    RECEIVE_BOOT_COMPLETED: {
      weight: 15,
      severity: 'HIGH',
      desc: 'Auto-starts persistent background trojan listener upon device reboot'
    }
  };

  const textToSearch = `${suspectBio || ''} ${(postCaptions || []).join(' ')}`.toUpperCase();
  const allPerms = (permissions || []).map(p => p.toUpperCase());

  Object.entries(HIGH_RISK_PERMISSIONS).forEach(([permKey, permMeta]) => {
    if (allPerms.some(p => p.includes(permKey)) || textToSearch.includes(permKey)) {
      detectedPermissions.push({
        permission: permKey,
        severity: permMeta.severity,
        description: permMeta.desc,
        weight: permMeta.weight
      });
      flags.push(`Dangerous Android permission declared: ${permKey} (${permMeta.desc})`);
      riskScore += permMeta.weight;
    }
  });

  return {
    score: Math.min(100, riskScore),
    flags,
    missingEvidence,
    detectedPermissions,
    isSuspiciousApp: riskScore >= 45
  };
}

// ==========================================
// 5. SCAM INTENT & PHISHING KEYWORDS
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
// 7. EXPLANATION SYNTHESIS & RECOMMENDED ACTIONS
// ==========================================
export function deriveRecommendedAction(severity, channel, signals = []) {
  if (severity === 'OFFICIAL_WHITELISTED') {
    return 'No action required: Authenticated enterprise brand touchpoint whitelisted by zero-trust policy.';
  }

  if (channel === 'Rogue Mobile App') {
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      return 'Immediate Store Escalation: Dispatch Google Play / APK mirror abuse notice citing unauthorized developer identity and high-risk permission declarations. Blocklist package identifier in enterprise EDR.';
    } else if (severity === 'MEDIUM') {
      return 'App Store Monitoring: Request full APK package sample for automated dynamic sandbox analysis; verify developer signing certificate.';
    } else {
      return 'Routine Registry Logging: Log package in observation ledger; flag for re-audit if store download counts surge.';
    }
  }

  if (channel === 'Phishing Website' || channel === 'Phishing Domain') {
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      return 'Emergency Registrar Takedown: Issue statutory DMCA § 512 / Rule 3(2)(b) notice to hosting provider and domain registrar. Submit URL to Google Safe Browsing and Microsoft SmartScreen.';
    } else {
      return 'DNS Surveillance: Monitor DNS A-records and SSL certificate transparency logs for active credential harvester deployment.';
    }
  }

  // Social Profile
  if (severity === 'CRITICAL') {
    return 'Platform Abuse Dispatch: File expedited statutory impersonation complaint to platform abuse desk. Issue immediate customer safety alert regarding active credential/OTP interception.';
  } else if (severity === 'HIGH') {
    return 'Legal Enforcement Notice: Dispatch trademark infringement complaint citing brand imitation and deceptive profile bio. Monitor direct messaging activity.';
  } else if (severity === 'MEDIUM') {
    return 'Secondary SOC Review: Assign to frontline analyst for 24h activity surveillance. Check for fraudulent giveaway links or customer interaction.';
  } else {
    return 'Passive Logging: Entity displays minimal threat indicators. Retain in low-priority observation pool without takedown escalation.';
  }
}

export function synthesizeExplanationSummary(suspectHandle, channel, composite, severity, isCapped, signals = []) {
  if (severity === 'OFFICIAL_WHITELISTED') {
    return `${suspectHandle} is an authenticated official touchpoint. Zero threat risk attributed.`;
  }

  const activeSignals = signals.filter(s => s.weightedPoints > 0 && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(s.severity));
  if (activeSignals.length === 0) {
    if (isCapped) {
      return `${suspectHandle} exhibits surface name similarity but zero corroborating threat signals. Risk is strictly capped at ${composite}/100 (${severity}).`;
    }
    return `Routine scan for ${suspectHandle}: No actionable malicious threat indicators detected.`;
  }

  const topNames = activeSignals.slice(0, 2).map(s => s.name).join(', ');
  const capText = isCapped ? ' (capped by anti-false-positive safety policy)' : '';
  return `Flagged as ${severity} risk (${composite}/100)${capText} driven primarily by ${topNames}.`;
}

// ==========================================
// 8. COMPOSITE EXPLAINABLE RISK ENGINE (Main Evaluator)
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
    const brandName = brand.name || 'Brand';
    const recAction = deriveRecommendedAction('OFFICIAL_WHITELISTED', channel, []);
    const summary = synthesizeExplanationSummary(suspectHandle, channel, 0, 'OFFICIAL_WHITELISTED', false, []);

    const emptySignals = [
      {
        id: 'asset_exclusion',
        name: 'Official Brand Whitelist',
        weightPercent: 100,
        rawScore: 0,
        weightedPoints: 0.0,
      pointsContributed: 0.0,
        evidence: `Matches verified enterprise assets registered for ${brandName}`,
        severity: 'SAFE',
        direction: 'neutral',
        explanation: 'Verified official brand asset; protected by zero-trust exclusion policy.'
      }
    ];

    const explanationPayload = {
      finalScore: 0,
      severity: 'OFFICIAL_WHITELISTED',
      isOfficialExcluded: true,
      isCapped: false,
      capReason: null,
      signals: emptySignals,
      recommendedAction: recAction,
      summary
    };

    return {
      compositeScore: 0,
      severity: 'OFFICIAL_WHITELISTED',
      isOfficialExcluded: true,
      isCapped: false,
      capReason: null,
      breakdown: {
        handleScore: 0,
        logoScore: 0,
        scamScore: 0,
        domainScore: 0,
        appScore: 0,
        signals: emptySignals,
        isCapped: false,
        capReason: null,
        recommendedAction: recAction,
        summary,
        explanation: explanationPayload
      },
      explanation: explanationPayload,
      reasons: [`Verified Official Brand Asset for ${brandName} (Excluded from threat feed by safety policy)`],
      lookalike: null
    };
  }

  // 2. Look-alike Analysis
  const lookalike = detectLookalikeVariations(suspectHandle, officialHandle);
  
  // 3. String & Logo Matching
  const { similarity: handleSim } = levenshteinDistance(suspectHandle, officialHandle);
  const { score: scamScore, matchedPatterns } = analyzeScamIntent(suspectBio, postCaptions);
  const { score: domainScore, flags: domainFlags } = analyzeDomainRisk(suspectUrl, officialDomain);

  // 4. App Store specific checks if applicable
  let appScore = 0;
  let appFlags = [];
  let appAudit = {};
  if (channel === 'Rogue Mobile App') {
    appAudit = analyzeAppStoreThreat({
      suspectAppName: suspectHandle,
      suspectPublisher,
      suspectAppId: suspectUrl,
      officialApps,
      officialBrandName: brand?.name || 'Brand',
      suspectBio,
      postCaptions
    });
    appScore = appAudit.score;
    appFlags = appAudit.flags;
  }

  // Effective handle score with lookalike boost
  const effectiveHandleScore = Math.min(100, handleSim + (lookalike.isLookalike ? 20 : 0));
  
  const signals = [];
  let rawComposite = 0;

  if (channel === 'Rogue Mobile App') {
    // 1. App Store Publisher & Permissions (35%)
    const appPts = Math.round(appScore * 0.35 * 10) / 10;
    const appEvidence = appFlags.length > 0 ? appFlags.join('; ') : (
      appAudit.missingEvidence?.length > 0 ? appAudit.missingEvidence.join('; ') : 'Publisher and package namespace match registered developer'
    );
    const appSev = appScore >= 70 ? 'CRITICAL' : (appScore >= 45 ? 'HIGH' : (appScore >= 20 ? 'MEDIUM' : 'SAFE'));
    signals.push({
      id: 'app_store',
      name: 'App Store Publisher & Permissions',
      weightPercent: 35,
      rawScore: appScore,
      weightedPoints: appPts,
      pointsContributed: appPts,
      evidence: appEvidence,
      severity: appSev,
      direction: appScore > 0 ? 'increases_risk' : 'neutral',
      explanation: 'Evaluates developer certificate authenticity, namespace squatting, and dangerous permissions (READ_SMS, SYSTEM_ALERT_WINDOW).'
    });

    // 2. App Icon & Visual Trademark (30%)
    const logoPts = Math.round(logoMatchPercent * 0.30 * 10) / 10;
    const logoSev = logoMatchPercent >= 85 ? 'CRITICAL' : (logoMatchPercent >= 70 ? 'HIGH' : (logoMatchPercent >= 50 ? 'MEDIUM' : 'LOW'));
    signals.push({
      id: 'visual_logo',
      name: 'App Icon & Visual Trademark',
      weightPercent: 30,
      rawScore: logoMatchPercent,
      weightedPoints: logoPts,
      pointsContributed: logoPts,
      evidence: `${logoMatchPercent}% visual app icon similarity against official trademark`,
      severity: logoSev,
      direction: logoMatchPercent >= 50 ? 'increases_risk' : 'neutral',
      explanation: 'Unauthorized trademark icon reproduction intended to deceive mobile app store users.'
    });

    // 3. Package & App Name Similarity (20%)
    const handlePts = Math.round(effectiveHandleScore * 0.20 * 10) / 10;
    const handleEvidence = lookalike.explanation?.length > 0 ? lookalike.explanation.join('; ') : `${handleSim}% title string similarity to official application name`;
    const handleSev = effectiveHandleScore >= 70 ? 'HIGH' : (effectiveHandleScore >= 40 ? 'MEDIUM' : 'LOW');
    signals.push({
      id: 'app_naming',
      name: 'Package & App Name Similarity',
      weightPercent: 20,
      rawScore: effectiveHandleScore,
      weightedPoints: handlePts,
      pointsContributed: handlePts,
      evidence: handleEvidence,
      severity: handleSev,
      direction: effectiveHandleScore >= 40 ? 'increases_risk' : 'neutral',
      explanation: 'Character squatting and typosquatting targeting official mobile app search queries.'
    });

    // 4. Manifest Intent & Store Description (15%)
    const scamPts = Math.round(scamScore * 0.15 * 10) / 10;
    const scamEvidence = matchedPatterns.length > 0 
      ? `Matched predatory phrases: ${matchedPatterns.map(p => p.phrase).join(', ')}`
      : 'No predatory scam keywords matched in listing description';
    const scamSev = scamScore >= 60 ? 'CRITICAL' : (scamScore >= 30 ? 'HIGH' : 'SAFE');
    signals.push({
      id: 'permissions_scam',
      name: 'Manifest Intent & Store Description',
      weightPercent: 15,
      rawScore: scamScore,
      weightedPoints: scamPts,
      pointsContributed: scamPts,
      evidence: scamEvidence,
      severity: scamSev,
      direction: scamScore > 0 ? 'increases_risk' : 'neutral',
      explanation: 'Social engineering and fraudulent promotion copy detected in public app store listing.'
    });

    rawComposite = Math.round(appScore * 0.35 + logoMatchPercent * 0.30 + effectiveHandleScore * 0.20 + scamScore * 0.15);
  } else {
    // 1. Handle & Homoglyph Lookalike (30%)
    const handlePts = Math.round(effectiveHandleScore * 0.30 * 10) / 10;
    const handleEvidence = lookalike.explanation?.length > 0 ? lookalike.explanation.join('; ') : `${handleSim}% username similarity to official handle ${officialHandle || ''}`;
    const handleSev = effectiveHandleScore >= 80 ? 'CRITICAL' : (effectiveHandleScore >= 60 ? 'HIGH' : (effectiveHandleScore >= 40 ? 'MEDIUM' : 'LOW'));
    signals.push({
      id: 'handle_lookalike',
      name: 'Handle & Homoglyph Lookalike',
      weightPercent: 30,
      rawScore: effectiveHandleScore,
      weightedPoints: handlePts,
      pointsContributed: handlePts,
      evidence: handleEvidence,
      severity: handleSev,
      direction: effectiveHandleScore >= 40 ? 'increases_risk' : 'neutral',
      explanation: 'Evaluates deceptive character swaps, squatting keywords, and edit distance.'
    });

    // 2. Visual Trademark & Logo Diff (30%)
    const logoPts = Math.round(logoMatchPercent * 0.30 * 10) / 10;
    const logoSev = logoMatchPercent >= 85 ? 'CRITICAL' : (logoMatchPercent >= 70 ? 'HIGH' : (logoMatchPercent >= 50 ? 'MEDIUM' : 'LOW'));
    signals.push({
      id: 'visual_logo',
      name: 'Visual Trademark & Logo Diff',
      weightPercent: 30,
      rawScore: logoMatchPercent,
      weightedPoints: logoPts,
      pointsContributed: logoPts,
      evidence: `${logoMatchPercent}% visual logo similarity against authentic brand trademark`,
      severity: logoSev,
      direction: logoMatchPercent >= 50 ? 'increases_risk' : 'neutral',
      explanation: 'Unauthorized reproduction of registered visual brand assets across unauthorized profiles.'
    });

    // 3. Scam Intent & Phishing Keywords (25%)
    const scamPts = Math.round(scamScore * 0.25 * 10) / 10;
    const scamEvidence = matchedPatterns.length > 0
      ? `Matched predatory phrases: ${matchedPatterns.map(p => `"${p.phrase}"`).join(', ')}`
      : 'No predatory fraud keywords matched in public profile text';
    const scamSev = scamScore >= 60 ? 'CRITICAL' : (scamScore >= 40 ? 'HIGH' : (scamScore >= 20 ? 'MEDIUM' : 'SAFE'));
    signals.push({
      id: 'scam_intent',
      name: 'Scam Intent & Phishing Keywords',
      weightPercent: 25,
      rawScore: scamScore,
      weightedPoints: scamPts,
      pointsContributed: scamPts,
      evidence: scamEvidence,
      severity: scamSev,
      direction: scamScore > 0 ? 'increases_risk' : 'neutral',
      explanation: 'NLP detection of social engineering phrases (instant refund, send OTP, urgent KYC).'
    });

    // 4. Domain Infrastructure & Link Structure (15%)
    const domainPts = Math.round(domainScore * 0.15 * 10) / 10;
    const domainEvidence = domainFlags.length > 0 ? domainFlags.join('; ') : (
      !suspectUrl ? 'No external landing domain linked' : 'Registered domain structure within normal baseline'
    );
    const domainSev = domainScore >= 60 ? 'CRITICAL' : (domainScore >= 40 ? 'HIGH' : (domainScore >= 20 ? 'MEDIUM' : 'SAFE'));
    signals.push({
      id: 'domain_risk',
      name: 'Domain Infrastructure & Link Structure',
      weightPercent: 15,
      rawScore: domainScore,
      weightedPoints: domainPts,
      pointsContributed: domainPts,
      evidence: domainEvidence,
      severity: domainSev,
      direction: domainScore > 0 ? 'increases_risk' : 'neutral',
      explanation: 'Inspects low-reputation scam TLDs (.xyz, .top), typosquatting, and deceptive link structures.'
    });

    rawComposite = Math.round(effectiveHandleScore * 0.30 + logoMatchPercent * 0.30 + scamScore * 0.25 + domainScore * 0.15);
  }

  // RULE: Name similarity alone NEVER classifies a candidate as malicious.
  const otherEvidencePresent = (
    logoMatchPercent >= 70 ||
    scamScore >= 30 ||
    domainScore >= 40 ||
    appScore >= 40 ||
    lookalike.hasCharacterSwap
  );

  let isCapped = false;
  let capReason = null;
  let composite = rawComposite;

  if (!otherEvidencePresent && rawComposite > 28) {
    composite = 28;
    isCapped = true;
    capReason = `Score capped from ${rawComposite} to 28 by Anti-False-Positive Policy: Name similarity alone without corroborating rogue signals (scam keywords, malicious permissions, or trademark infringement) cannot exceed LOW severity tier.`;
  } else {
    composite = Math.min(100, Math.max(0, rawComposite));
  }

  let severity = 'LOW';
  if (composite >= 75) severity = 'CRITICAL';
  else if (composite >= 50) severity = 'HIGH';
  else if (composite >= 30) severity = 'MEDIUM';

  const reasons = [];
  if (lookalike.explanation?.length > 0) {
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

  if (reasons.length === 0) {
    reasons.push('Routine scan: No high-risk indicators detected on candidate');
  }

  const recAction = deriveRecommendedAction(severity, channel, signals);
  const summary = synthesizeExplanationSummary(suspectHandle, channel, composite, severity, isCapped, signals);

  const explanationPayload = {
    finalScore: composite,
    severity,
    isOfficialExcluded: false,
    isCapped,
    capReason,
    signals,
    recommendedAction: recAction,
    summary
  };

  return {
    compositeScore: composite,
    severity,
    isOfficialExcluded: false,
    isCapped,
    capReason,
    breakdown: {
      handleScore: effectiveHandleScore,
      logoScore: logoMatchPercent,
      scamScore,
      domainScore,
      appScore,
      signals,
      isCapped,
      capReason,
      recommendedAction: recAction,
      summary,
      explanation: explanationPayload
    },
    explanation: explanationPayload,
    lookalike,
    reasons
  };
}
