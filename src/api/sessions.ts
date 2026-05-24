import type { Language, CEFRLevel } from '@/lib/language.ts'

const API_URL = import.meta.env.VITE_API_URL

export type HostedSession = {
  session: { id: string; title: string }
  participant: { id: string }
}

type CreateSessionRequest = {
  title: string
  hostDisplayName: string
  targetLanguage: Language
  hostNativeLanguage: Language
  hostProficiencyLevels: CEFRLevel[]
}

type CreateSessionResponse = {
  session: { id: string; title: string }
  participant: { id: string }
}

export async function createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
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
