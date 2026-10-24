import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { setAuthToken, getAuthToken } from './apiClient';

describe('AegisAgent DRP API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setAuthToken(null);
  });

  it('fetches system health', async () => {
    const mockHealth = { status: 'ok', app: 'AegisAgent DRP API', version: '1.0.0', database: 'connected' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHealth,
    });

    const result = await api.getHealth();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8000/api/health', expect.any(Object));
  });

  it('handles authentication login and sets token', async () => {
    const mockAuthResponse = {
      access_token: 'test-jwt-token-xyz',
      token_type: 'bearer',
      expires_in_minutes: 60,
      user: { id: 'usr-1', email: 'admin@aegis.local', role: 'admin' },
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    });

    const result = await api.login('admin@aegis.local', 'Password123!');
    expect(result.access_token).toBe('test-jwt-token-xyz');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'admin@aegis.local', password: 'Password123!' }),
      })
    );
  });

  it('injects authorization bearer header when token is set', async () => {
    setAuthToken('my-secret-access-token');
    expect(getAuthToken()).toBe('my-secret-access-token');

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'usr-1', email: 'analyst@aegis.local' }),
    });

    await api.getMe();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-secret-access-token',
        }),
      })
    );
  });

  it('handles 401 responses by clearing token and dispatching auth_expired event', async () => {
    setAuthToken('expired-token');
    const expiredListener = vi.fn();
    const eventTarget = new EventTarget();
    globalThis.window = eventTarget;
    eventTarget.addEventListener('aegis:auth_expired', expiredListener);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ detail: 'Authentication token has expired' }),
    });

    await expect(api.getBrands()).rejects.toThrow('Authentication token has expired');
    expect(getAuthToken()).toBeNull();
    expect(expiredListener).toHaveBeenCalledTimes(1);

    delete globalThis.window;
  });

  it('fetches brand list', async () => {
    const mockBrands = [{ id: 'razorpay', name: 'Razorpay Technologies' }];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBrands,
    });

    const result = await api.getBrands();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('razorpay');
  });

  it('triggers social monitoring run', async () => {
    const mockRun = { id: 'RUN-SOC-1234', brand_id: 'razorpay', status: 'COMPLETED', threats_detected: 2 };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRun,
    });

    const result = await api.runSocialMonitoring('razorpay');
    expect(result.id).toBe('RUN-SOC-1234');
    expect(result.status).toBe('COMPLETED');
  });

  it('updates finding review status and fetches history', async () => {
    const mockUpdated = { id: 'FND-01', review_status: 'INVESTIGATING' };
    const mockHistory = [
      { id: 'LOG-01', finding_id: 'FND-01', action: 'STATUS_CHANGE', actor_email: 'analyst@aegis.local' }
    ];

    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdated,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistory,
      });

    const result = await api.updateFindingStatus('FND-01', 'INVESTIGATING', 'Triage completed');
    expect(result.review_status).toBe('INVESTIGATING');

    const history = await api.getFindingHistory('FND-01');
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe('LOG-01');
  });

  it('fetches takedown reports and creates drafts', async () => {
    const mockReports = [
      { id: 'RPT-123', finding_id: 'FND-01', document_status: 'Demonstration Draft — Not Sent' }
    ];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReports,
    });

    const result = await api.getTakedownReports('FND-01');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('RPT-123');
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8000/api/reports/takedown/FND-01', expect.any(Object));
  });

  it('handles HTTP error responses gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ detail: 'Finding not found' }),
    });

    await expect(api.getFinding('invalid_id')).rejects.toThrow('Finding not found');
  });
});
