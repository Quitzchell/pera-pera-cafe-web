import { createContext, useContext } from 'react'
import type { CEFRLevel, Language } from '@/lib/language.ts'

export type SessionState = {
  nativeLanguage: Language | null
  setNativeLanguage: (language: Language) => void
  targetLanguage: Language | null
  setTarget: (language: Language, levels: CEFRLevel[]) => void
  proficiencyLevels: CEFRLevel[]
}

export const SessionContext = createContext<SessionState | undefined>(undefined)

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
