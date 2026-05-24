import { createContext, useContext } from 'react'
import type { CEFRLevel, Language } from '@/lib/language.ts'

export type SessionState = {
  nativeLanguage: Language | null
  targetLanguage: Language | null
  proficiencyLevels: CEFRLevel[]
  sessionId: string | null
  sessionTitle: string | null
  participantId: string | null
  setNativeLanguage: (language: Language) => void
  setTarget: (language: Language, levels: CEFRLevel[]) => void
  setSession: (sessionId: string, sessionTitle: string, participantId: string) => void
}

export const SessionContext = createContext<SessionState | undefined>(undefined)

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
