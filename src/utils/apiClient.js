// AegisAgent DRP Reusable Backend API Client
// Connects to FastAPI backend configured via VITE_API_BASE_URL

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

let currentAuthToken = typeof localStorage !== 'undefined' ? localStorage.getItem('aegis_auth_token') : null;

export function setAuthToken(token) {
  currentAuthToken = token;
  if (typeof localStorage !== 'undefined') {
    if (token) {
      localStorage.setItem('aegis_auth_token', token);
    } else {
      localStorage.removeItem('aegis_auth_token');
    }
  }
}

export function getAuthToken() {
  if (!currentAuthToken && typeof localStorage !== 'undefined') {
    currentAuthToken = localStorage.getItem('aegis_auth_token');
  }
  return currentAuthToken;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
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

      // If 401 Unauthorized, automatically clear token and notify application
      if (res.status === 401) {
        setAuthToken(null);
        const eventTarget = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
        if (eventTarget && typeof eventTarget.dispatchEvent === 'function') {
          eventTarget.dispatchEvent(new CustomEvent('aegis:auth_expired', { detail: { endpoint, errorDetail } }));
        }
      }

      const error = new Error(errorDetail);
      error.status = res.status;
      throw error;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API Client] Error calling ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Authentication & Identity
  setAuthToken,
  getAuthToken,
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  getMe: () => request('/api/auth/me'),

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

  updateFindingStatus: (findingId, reviewStatus, rationale = null) => request(`/api/findings/${findingId}`, {
    method: 'PATCH',
    body: JSON.stringify({ review_status: reviewStatus, rationale }),
  }),

  getFindingHistory: (findingId) => request(`/api/findings/${findingId}/history`),

  // Evidentiary Reports
  getEvidentiaryReport: (findingId) => request(`/api/reports/${findingId}/json`),

  // Persistent Takedown Report Drafts
  getTakedownReports: (findingId) => request(`/api/reports/takedown/${findingId}`),
  getTakedownReportDetail: (reportId) => request(`/api/reports/takedown/detail/${reportId}`),
  createTakedownReport: (reportData) => request('/api/reports/takedown', {
    method: 'POST',
    body: JSON.stringify(reportData),
  }),
  updateTakedownReport: (reportId, reportData) => request(`/api/reports/takedown/${reportId}`, {
    method: 'PUT',
    body: JSON.stringify(reportData),
  }),

  // Deterministic URL Comparison Engine
  compareUrl: (comparisonData) => request('/api/findings/compare-url', {
    method: 'POST',
    body: JSON.stringify(comparisonData),
  }),
};

export default api;
