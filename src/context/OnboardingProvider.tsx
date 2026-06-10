import { useState, type ReactNode, useEffect } from 'react';

import { OnboardingContext } from '@/context/useOnboarding';
import type { CEFRLevel, Language } from '@/lib/language';

const STORAGE_KEY = 'pera.onboarding';

type StoredOnboarding = {
  nativeLanguage: Language | null;
  targetLanguage: Language | null;
  proficiencyLevels: CEFRLevel[];
};

function loadOnboarding(): StoredOnboarding | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredOnboarding;
  } catch {
    return null;
  }
}

function saveOnboarding(state: StoredOnboarding): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [nativeLanguage, setNativeLanguage] = useState<Language | null>(
    () => loadOnboarding()?.nativeLanguage ?? null,
  );
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(
    () => loadOnboarding()?.targetLanguage ?? null,
  );
  const [proficiencyLevels, setProficiencyLevels] = useState<CEFRLevel[]>(
    () => loadOnboarding()?.proficiencyLevels ?? [],
  );

  useEffect(() => {
    saveOnboarding({ nativeLanguage, targetLanguage, proficiencyLevels });
  }, [nativeLanguage, targetLanguage, proficiencyLevels]);

  function setTarget(language: Language, levels: CEFRLevel[]) {
    setTargetLanguage(language);
    setProficiencyLevels(levels);
  }

  return (
    <OnboardingContext.Provider
      value={{ nativeLanguage, targetLanguage, proficiencyLevels, setNativeLanguage, setTarget }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
