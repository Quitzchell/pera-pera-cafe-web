import { vi } from 'vitest';

type Handler = (body: unknown, init: RequestInit) => Response | Promise<Response>;

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function apiError(status: number, message: string) {
  return json({ statusCode: status, error: 'Error', message }, status);
}

/** Routes fetch calls by "METHOD /path" (path without the /api prefix and query string). */
export function mockFetch(handlers: Record<string, Handler>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input), 'http://localhost');
    const key = `${init.method ?? 'GET'} ${url.pathname.replace(/^\/api/, '')}`;
    const handler = handlers[key];
    if (!handler) throw new Error(`Unexpected request: ${key}`);
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
    return handler(body, init);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
