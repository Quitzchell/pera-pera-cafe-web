import { createContext, useContext } from 'react'

export type SessionState = {
  sessionId: string | null
  sessionTitle: string | null
  participantId: string | null
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
