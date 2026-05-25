import { useState, type ReactNode } from 'react'
import type { CEFRLevel, Language } from '@/shared/lib/language'
import { OnboardingContext } from '@/features/onboarding/host/useOnboarding'

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [nativeLanguage, setNativeLanguage] = useState<Language | null>(null)
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null)
  const [proficiencyLevels, setProficiencyLevels] = useState<CEFRLevel[]>([])

  function setTarget(language: Language, levels: CEFRLevel[]) {
    setTargetLanguage(language)
    setProficiencyLevels(levels)
  }

  return (
    <OnboardingContext.Provider
      value={{
        nativeLanguage,
        targetLanguage,
        proficiencyLevels,
        setNativeLanguage,
        setTarget,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}
