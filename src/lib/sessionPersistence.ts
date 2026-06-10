import type { Language } from '@/lib/language';

export type SessionMembership = {
  sessionId: string;
  participantId: string;
  sessionTitle: string;
  targetLanguage: Language;
  languages: [Language, Language];
};

const KEY = 'pera.sessionMembership';

export function storeMembership(value: SessionMembership): void {
  sessionStorage.setItem(KEY, JSON.stringify(value));
}

export function loadMembership(): SessionMembership | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionMembership;
  } catch {
    return null;
  }
}

export function clearMembership(): void {
  sessionStorage.removeItem(KEY);
}
