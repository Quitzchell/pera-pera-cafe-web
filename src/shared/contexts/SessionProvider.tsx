import { useState, type ReactNode } from 'react'
import type { CEFRLevel, Language } from '@/lib/language.ts'
import { SessionContext } from '@/contexts/useSession.ts'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [nativeLanguage, setNativeLanguage] = useState<Language | null>(null)
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null)
  const [proficiencyLevels, setProficiencyLevels] = useState<CEFRLevel[]>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionTitle, setSessionTitle] = useState<string | null>(null)
  const [participantId, setParticipantId] = useState<string | null>(null)

  function setTarget(language: Language, levels: CEFRLevel[]) {
    setTargetLanguage(language)
    setProficiencyLevels(levels)
  }

  function setSession(newSessionId: string, newTitle: string, newParticipantId: string) {
    setSessionId(newSessionId)
    setSessionTitle(newTitle)
    setParticipantId(newParticipantId)
  }

  return (
    <SessionContext.Provider
      value={{
        nativeLanguage,
        targetLanguage,
        proficiencyLevels,
        sessionId,
        sessionTitle,
        participantId,
        setNativeLanguage,
        setTarget,
        setSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}
