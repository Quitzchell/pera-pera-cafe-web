import type { CEFRLevel, Language } from '@/shared/lib/language.ts'
import type { HostedSession } from '@/types/session.ts'

const API_URL = import.meta.env.VITE_API_URL

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
