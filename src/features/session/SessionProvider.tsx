import { useState, type ReactNode } from 'react'
import { SessionContext } from '@/features/session/useSession'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionTitle, setSessionTitle] = useState<string | null>(null)
  const [participantId, setParticipantId] = useState<string | null>(null)

  function setSession(newSessionId: string, newTitle: string, newParticipantId: string) {
    setSessionId(newSessionId)
    setSessionTitle(newTitle)
    setParticipantId(newParticipantId)
  }

  return (
    <SessionContext.Provider
      value={{ sessionId, sessionTitle, participantId, setSession }}
    >
      {children}
    </SessionContext.Provider>
  )
}
