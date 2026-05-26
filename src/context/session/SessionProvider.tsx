import { useMemo, useState, type ReactNode } from 'react'
import { SessionContext, type SessionState } from '@/context/session/useSession.ts'
import { loadHostSession } from '@/shared/lib/sessionPersistence'

type SessionProviderProps = {
  sessionId: string
  children: ReactNode
}

export function SessionProvider({ sessionId, children }: SessionProviderProps) {
  const [hostInfo] = useState(() => {
    const stored = loadHostSession()
    return stored?.sessionId === sessionId ? stored : null
  })

  const value = useMemo<SessionState>(
    () => ({
      sessionId,
      sessionTitle: hostInfo?.sessionTitle ?? null,
      participantId: hostInfo?.participantId ?? null,
      targetLanguage: hostInfo?.targetLanguage ?? null,
    }),
    [sessionId, hostInfo],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
