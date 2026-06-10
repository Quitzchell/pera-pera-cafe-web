import { createContext, useContext } from 'react';

import type { Language } from '@/lib/language';
import type { Participant } from '@/types/participant';

export type SessionStatus = 'pending' | 'active' | 'ended';

export type SessionActionResult = { ok: boolean; error?: string };

export type CardTranslation = {
  language: string;
  translation: string;
  romanization: string | null;
};

export type CurrentCard = {
  cardId: string;
  question: string;
  translations: CardTranslation[];
  targetParticipantId: string;
  practiceLanguage: string;
};

export type SessionState = {
  sessionId: string;
  participantId: string | null;
  sessionTitle: string | null;
  targetLanguage: Language | null;
  languages: [Language, Language] | null;
  participants: Participant[];
  isConnected: boolean;
  isHydrated: boolean;
  sessionStatus: SessionStatus;
  currentDealerId: string | null;
  currentCard: CurrentCard | null;
  startSession: () => Promise<SessionActionResult>;
  endSession: () => Promise<SessionActionResult>;
  drawCard: (targetId: string) => Promise<SessionActionResult>;
  skipCard: () => Promise<SessionActionResult>;
  passTurn: () => Promise<SessionActionResult>;
};

export const SessionContext = createContext<SessionState | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
