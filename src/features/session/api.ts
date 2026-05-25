import type { CEFRLevel, Language } from '@/shared/lib/language'

const API_URL = import.meta.env.VITE_API_URL

export type HostedSession = {
  session: { id: string; title: string }
  participant: { id: string }
}

type CreateSessionRequest = {
  title: string
  targetLanguage: Language
  sourceLanguage: Language
  host: {
    displayName: string
    nativeLanguage: Language
    proficiencyLevels: CEFRLevel[]
  }
}

export async function createSession(request: CreateSessionRequest): Promise<HostedSession> {
  const res = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    throw new Error(`createSession failed: ${res.status}`)
  }
  return res.json()
}
