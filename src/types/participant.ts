import type { CEFRLevel, Language } from '@/lib/language';

export type Participant = {
  id: string;
  sessionId: string;
  name: string;
  nativeLanguage: Language;
  targetLanguage: Language;
  proficiencyLevels: CEFRLevel[];
  isHost: boolean;
  joinedAt: string;
  leftAt: string | null;
};
