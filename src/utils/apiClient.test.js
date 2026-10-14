import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './apiClient';

describe('AegisAgent DRP API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

  it('updates finding review status', async () => {
    const mockUpdated = { id: 'FND-01', review_status: 'INVESTIGATING' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUpdated,
    });

    const result = await api.updateFindingStatus('FND-01', 'INVESTIGATING');
    expect(result.review_status).toBe('INVESTIGATING');
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
