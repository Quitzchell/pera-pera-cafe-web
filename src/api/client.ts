import type { ApiErrorBody } from '@/api/types';

export const API_BASE = `${(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')}/api`;

const CSRF_ERROR = 'Missing or invalid CSRF token';

/** Status 0: no HTTP response (offline, DNS, CORS). */
export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages.join('\n'));
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
  }

  get isNetwork() {
    return this.status === 0 || this.status >= 500;
  }
}

let csrfToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: Method;
  body?: unknown;
  /** No CSRF header, and a 401 is an answer rather than a signed-out session. */
  isPublic?: boolean;
  signal?: AbortSignal;
}

async function send(path: string, { method = 'GET', body, isPublic, signal }: RequestOptions) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && !isPublic && csrfToken) headers['X-CSRF-Token'] = csrfToken;

  try {
    return await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, ['Could not reach the server. Check your connection and try again.']);
  }
}

async function toApiError(response: Response) {
  let messages = [response.statusText || `Request failed (${response.status})`];
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    if (Array.isArray(body.message)) messages = body.message;
    else if (typeof body.message === 'string') messages = [body.message];
  } catch {
    // Not JSON: keep the status text.
  }
  if (response.status === 429) messages = ['Too many attempts, try again in a minute.'];
  if (response.status >= 500) messages = ['Something went wrong on our side. Please try again.'];
  return new ApiError(response.status, messages);
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await send(path, options);

  if (response.status === 403 && options.method && options.method !== 'GET') {
    const error = await toApiError(response.clone());
    if (error.messages[0] === CSRF_ERROR) {
      await refreshCsrfToken();
      response = await send(path, options);
    }
  }

  if (!response.ok) {
    const error = await toApiError(response);
    if (error.status === 401 && !options.isPublic) unauthorizedHandler?.();
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function refreshCsrfToken() {
  const { csrfToken: token } = await request<{ csrfToken: string }>('/auth/csrf');
  setCsrfToken(token);
  return token;
}
