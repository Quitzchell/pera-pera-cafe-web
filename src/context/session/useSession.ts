import { createContext, useContext } from 'react'
import type { Language } from '@/shared/lib/language'

export type SessionState = {
  sessionId: string
  sessionTitle: string | null
  participantId: string | null
  targetLanguage: Language | null
}

export const SessionContext = createContext<SessionState | undefined>(undefined)

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
