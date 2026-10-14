// AegisAgent DRP Reusable Backend API Client
// Connects to FastAPI backend configured via VITE_API_BASE_URL

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.detail) {
          errorDetail = errJson.detail;
        }
      } catch {
        // ignore json parse error
      }
      throw new Error(errorDetail);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API Client] Error calling ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/api/health'),

  // Brands
  getBrands: () => request('/api/brands'),
  getBrand: (brandId) => request(`/api/brands/${brandId}`),
  createBrand: (brandData) => request('/api/brands', {
    method: 'POST',
    body: JSON.stringify(brandData),
  }),

  // Autonomous Monitoring Execution
  runSocialMonitoring: (brandId, useDemoFixtures = true) => request('/api/monitoring/social/run', {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, use_demo_fixtures: useDemoFixtures }),
  }),

  runAppsMonitoring: (brandId, useDemoFixtures = true) => request('/api/monitoring/apps/run', {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, use_demo_fixtures: useDemoFixtures }),
  }),
  runAppMonitoring: (brandId, useDemoFixtures = true) => request('/api/monitoring/apps/run', {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, use_demo_fixtures: useDemoFixtures }),
  }),

  // Findings
  getFindings: (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.brandId) query.set('brand_id', filters.brandId);
    if (filters.channel) query.set('channel', filters.channel);
    if (filters.severity) query.set('severity', filters.severity);
    if (filters.reviewStatus) query.set('review_status', filters.reviewStatus);
    if (filters.includeExcluded) query.set('include_excluded', 'true');
    const qs = query.toString();
    return request(`/api/findings${qs ? `?${qs}` : ''}`);
  },

  getFinding: (findingId) => request(`/api/findings/${findingId}`),

  updateFindingStatus: (findingId, reviewStatus) => request(`/api/findings/${findingId}`, {
    method: 'PATCH',
    body: JSON.stringify({ review_status: reviewStatus }),
  }),

  // Evidentiary Reports
  getEvidentiaryReport: (findingId) => request(`/api/reports/${findingId}/json`),
};

export default api;
