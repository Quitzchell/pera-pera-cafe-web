import { API_BASE, request } from '@/api/client';
import type {
  AnswerResult,
  CreatedUser,
  DrillMode,
  IssuedLink,
  Progress,
  Round,
  RoundSummary,
  Settings,
  User,
  Verb,
  VerbInput,
  VerbSaveResult,
} from '@/api/types';

export { ApiError } from '@/api/client';

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: User; csrfToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      isPublic: true,
    }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: () => request<User>('/auth/me'),
  acceptInvite: (token: string, password: string) =>
    request<void>('/auth/accept-invite', {
      method: 'POST',
      body: { token, password },
      isPublic: true,
    }),
  resetPassword: (token: string, password: string) =>
    request<void>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      isPublic: true,
    }),
};

export const settingsApi = {
  get: () => request<Settings>('/me/settings'),
  update: (changes: Partial<Settings>) =>
    request<Settings>('/me/settings', { method: 'PATCH', body: changes }),
};

export const drillApi = {
  startRound: (mode: DrillMode) =>
    request<Round>('/drill/rounds', { method: 'POST', body: { mode } }),
  answer: (roundId: string, itemId: string, answer: string) =>
    request<AnswerResult>(
      `/drill/rounds/${encodeURIComponent(roundId)}/items/${encodeURIComponent(itemId)}/answer`,
      { method: 'POST', body: { answer } },
    ),
  finish: (roundId: string) =>
    request<RoundSummary>(`/drill/rounds/${encodeURIComponent(roundId)}/finish`, {
      method: 'POST',
    }),
};

export type ExportFormat = 'csv' | 'json';

export const progressApi = {
  get: () => request<Progress>('/progress'),
  exportUrl: (format: ExportFormat) => `${API_BASE}/progress/export?format=${format}`,
};

export const adminApi = {
  users: () => request<User[]>('/admin/users'),
  createUser: (email: string, displayName: string) =>
    request<CreatedUser>('/admin/users', { method: 'POST', body: { email, displayName } }),
  updateUser: (id: string, changes: { displayName?: string; disabled?: boolean }) =>
    request<User>(`/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: changes }),
  deleteUser: (id: string) =>
    request<void>(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  resetLink: (id: string) =>
    request<IssuedLink>(`/admin/users/${encodeURIComponent(id)}/reset-link`, {
      method: 'POST',
    }),
  userProgress: (id: string) =>
    request<Progress>(`/admin/users/${encodeURIComponent(id)}/progress`),
  verbs: (q = '') => request<Verb[]>(`/admin/verbs${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  createVerb: (input: VerbInput) =>
    request<VerbSaveResult>('/admin/verbs', { method: 'POST', body: input }),
  updateVerb: (id: string, input: Partial<VerbInput>) =>
    request<VerbSaveResult>(`/admin/verbs/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: input,
    }),
};
