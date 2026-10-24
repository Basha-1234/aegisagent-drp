// AegisAgent DRP - Shared Finding Normalizer
// Normalizes both backend API finding records and local fallback/fixture objects into a consistent shape.

export function normalizeFinding(f, brand) {
  if (!f) return null;

  const isApp = f.channel === 'Rogue Mobile App' || Boolean(f.suspect_publisher) || Boolean(f.suspectPublisher);
  const isDomain = f.channel === 'Phishing Website' || f.channel === 'Phishing Domain';
  const platform = f.platform || (isApp ? 'Google Play Store' : isDomain ? 'Web Domain' : 'Social Platform');

  // Handle reasons array whether JSON string or array
  let reasons = f.reasons || [];
  if (typeof reasons === 'string') {
    try {
      reasons = JSON.parse(reasons);
    } catch {
      reasons = [reasons];
    }
  }

  // Handle breakdown object whether JSON string or object
  let breakdown = f.breakdown || {};
  if (typeof breakdown === 'string') {
    try {
      breakdown = JSON.parse(breakdown);
    } catch {
      breakdown = {};
    }
  }

  const compositeScore = f.composite_score !== undefined 
    ? f.composite_score 
    : (f.compositeScore !== undefined ? f.compositeScore : (f.riskScore || f.logoMatchPercent || 75));

  const severity = f.severity || (compositeScore >= 80 ? 'CRITICAL' : compositeScore >= 60 ? 'HIGH' : compositeScore >= 30 ? 'MEDIUM' : 'LOW');

  return {
    id: f.id,
    brandId: f.brand_id || f.brandId || brand?.id || 'razorpay',
    platform: platform,
    channel: f.channel || (isApp ? 'Rogue Mobile App' : isDomain ? 'Phishing Website' : 'Social Profile'),
    suspectName: f.suspect_name || f.suspectName || 'Unknown Entity',
    suspectHandle: f.suspect_handle || f.suspectHandle || f.suspect_name || f.suspectName || '@unknown',
    suspectPublisher: f.suspect_publisher || f.suspectPublisher || null,
    avatarUrl: f.avatar_url || f.avatarUrl || brand?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: f.suspect_bio || f.suspectBio || '',
    suspectUrl: f.suspect_url || f.suspectUrl || '',
    postCaptions: f.post_captions || f.postCaptions || [],
    followersCount: f.followers_count || f.followersCount || 0,
    accountAgeDays: f.account_age_days || f.accountAgeDays || 0,
    status: f.review_status || f.status || 'NEW',
    logoMatchPercent: f.logo_match_percent !== undefined ? f.logo_match_percent : (f.logoMatchPercent || 0),
    compositeScore: compositeScore,
    severity: severity,
    reasons: reasons,
    explanation: f.explanation || breakdown?.explanation || null,
    breakdown: breakdown,
    provenance: f.provenance || 'demo_fixture',
    isLive: f.provenance === 'live_connector',
    detectionDate: f.created_at || f.detectionDate || new Date().toISOString()
  };
}

export default normalizeFinding;
