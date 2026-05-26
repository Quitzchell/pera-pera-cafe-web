import type { Language } from '@/shared/lib/language'

export type HostSession = {
  sessionId: string
  sessionTitle: string
  participantId: string
  targetLanguage: Language
}

const KEY = 'pera.hostSession'

export function storeHostSession(value: HostSession): void {
  sessionStorage.setItem(KEY, JSON.stringify(value))
}

export function loadHostSession(): HostSession | null {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as HostSession
  } catch {
    return null
  }
}

export function clearHostSession(): void {
  sessionStorage.removeItem(KEY)
}
