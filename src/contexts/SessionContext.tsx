import { useState, type ReactNode } from 'react'
import type { CEFRLevel, Language } from '@/lib/language.ts'
import { SessionContext } from '@/contexts/useSession.ts'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [nativeLanguage, setNativeLanguage] = useState<Language | null>(null)
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null)
  const [proficiencyLevels, setProficiencyLevels] = useState<CEFRLevel[]>(null)

  function setTarget(language: Language, levels: CEFRLevel[]) {
    setTargetLanguage(language)
    setProficiencyLevels(levels)
  }

  return (
    <SessionContext.Provider
      value={{
        nativeLanguage,
        targetLanguage,
        proficiencyLevels,
        setNativeLanguage,
        setTarget,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}
