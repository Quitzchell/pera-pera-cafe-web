import { createContext, useContext } from 'react';

import type { CEFRLevel, Language } from '@/lib/language';

export type OnboardingState = {
  nativeLanguage: Language | null;
  targetLanguage: Language | null;
  proficiencyLevels: CEFRLevel[];
  setNativeLanguage: (language: Language) => void;
  setTarget: (language: Language, levels: CEFRLevel[]) => void;
};

export const OnboardingContext = createContext<OnboardingState | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
