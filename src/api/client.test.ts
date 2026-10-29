import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, request, setCsrfToken } from '@/api/client';
import { apiError, json, mockFetch } from '@/test/mockFetch';

afterEach(() => {
  vi.unstubAllGlobals();
  setCsrfToken(null);
});

describe('request', () => {
  it('sends cookies and the CSRF header on state-changing requests', async () => {
    const fetchMock = mockFetch({ 'POST /drill/rounds': () => json({ id: 'r1' }, 201) });
    setCsrfToken('csrf-1');

    await request('/drill/rounds', { method: 'POST', body: { mode: 'STANDARD' } });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.credentials).toBe('include');
    expect(init.headers).toMatchObject({ 'X-CSRF-Token': 'csrf-1' });
  });

  it('refreshes the CSRF token once and retries', async () => {
    let attempts = 0;
    const fetchMock = mockFetch({
      'GET /auth/csrf': () => json({ csrfToken: 'fresh' }),
      'PATCH /me/settings': (_, init) => {
        attempts += 1;
        const headers = init.headers as Record<string, string>;
        return headers['X-CSRF-Token'] === 'fresh'
          ? json({ roundSize: 10 })
          : apiError(403, 'Missing or invalid CSRF token');
      },
    });
    setCsrfToken('stale');

    await expect(
      request('/me/settings', { method: 'PATCH', body: { roundSize: 10 } }),
    ).resolves.toEqual({ roundSize: 10 });
    expect(attempts).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('turns validation errors into a list of messages', async () => {
    mockFetch({
      'POST /admin/users': () =>
        json({ statusCode: 400, error: 'Bad Request', message: ['email must be an email'] }, 400),
    });

    const error = await request<never>('/admin/users', { method: 'POST', body: {} }).catch(
      (e: unknown) => e as ApiError,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error.messages).toEqual(['email must be an email']);
  });

  it('reports network failures as status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const error = await request<never>('/progress').catch((e: unknown) => e as ApiError);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.isNetwork).toBe(true);
  });
});
