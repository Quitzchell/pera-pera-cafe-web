import { httpError } from '@/lib/httpError';
import type { CEFRLevel, Language } from '@/lib/language';
import type { Participant } from '@/types/participant';
import type { HostedSession, Session } from '@/types/session';

const API_URL = import.meta.env.VITE_API_URL;

type CreateSessionRequest = {
  title: string;
  targetLanguage: string;
  host: {
    displayName: string;
    nativeLanguage: Language;
    proficiencyLevels: CEFRLevel[];
  };
};

export async function createSession(request: CreateSessionRequest): Promise<HostedSession> {
  const res = await fetch(`${API_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    throw new httpError(res.status);
  }
  return res.json();
}

export async function fetchParticipant(
  sessionId: string,
  participantId: string,
): Promise<Participant> {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/participants/${participantId}`);
  if (!res.ok) {
    throw new httpError(res.status);
  }
  return res.json();
}

export async function fetchSession(sessionId: string): Promise<Session> {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}`);
  if (!res.ok) {
    throw new httpError(res.status);
  }
  return res.json();
}

type JoinSessionRequest = {
  displayName: string;
  nativeLanguage: Language;
  proficiencyLevels: CEFRLevel[];
};

export async function joinSession(
  sessionId: string,
  request: JoinSessionRequest,
): Promise<Participant> {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/participants`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    throw new httpError(res.status);
  }
  return res.json();
}
