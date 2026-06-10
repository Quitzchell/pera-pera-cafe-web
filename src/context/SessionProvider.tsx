import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import {
  type CurrentCard,
  type SessionActionResult,
  SessionContext,
  type SessionState,
  type SessionStatus,
} from '@/context/useSession';
import { loadMembership } from '@/lib/sessionPersistence';
import type { Participant } from '@/types/participant';

const API_URL = import.meta.env.VITE_API_URL;

type SessionProviderProps = {
  sessionId: string;
  children: ReactNode;
};

export function SessionProvider({ sessionId, children }: SessionProviderProps) {
  const [membership] = useState(() => {
    const stored = loadMembership();
    return stored?.sessionId === sessionId ? stored : null;
  });

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('pending');
  const [currentDealerId, setCurrentDealerId] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState<CurrentCard | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!membership) return;

    const socket = io(API_URL, {
      auth: { sessionId, participantId: membership.participantId },
      path: '/api/socket.io/',
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('presence:list', (list: Participant[]) => {
      setParticipants(list);
    });

    socket.on('participant:joined', (participant: Participant) => {
      setParticipants((prev) =>
        prev.some((p) => p.id === participant.id) ? prev : [...prev, participant],
      );
    });

    socket.on('participant:left', ({ participantId }: { participantId: string }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    });

    socket.on('session:status', ({ status }: { status: SessionStatus }) => {
      setSessionStatus(status);
      if (status !== 'active') {
        setIsHydrated(true);
      }
    });

    socket.on('session:started', ({ dealerId }: { dealerId: string }) => {
      setSessionStatus('active');
      setCurrentDealerId(dealerId);
    });
    socket.on('session:ended', () => {
      setSessionStatus('ended');
      setCurrentDealerId(null);
      setCurrentCard(null);
    });

    socket.on(
      'game:state',
      ({ dealerId, currentCard }: { dealerId: string; currentCard: CurrentCard | null }) => {
        setCurrentDealerId(dealerId);
        setCurrentCard(currentCard);
        setIsHydrated(true);
      },
    );

    socket.on('card:drawn', (card: CurrentCard) => setCurrentCard(card));

    socket.on('turn:passed', ({ nextDealerId }: { nextDealerId: string }) => {
      setCurrentDealerId(nextDealerId);
      setCurrentCard(null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, membership]);

  // ─── Action helpers ───

  const emitAck = useCallback(<T,>(event: string, data?: T): Promise<SessionActionResult> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket) return resolve({ ok: false, error: 'Not connected' });
      if (data === undefined) {
        socket.emit(event, (response: SessionActionResult) => resolve(response));
      } else {
        socket.emit(event, data, (response: SessionActionResult) => resolve(response));
      }
    });
  }, []);

  const startSession = useCallback(() => emitAck('session:start'), [emitAck]);
  const endSession = useCallback(() => emitAck('session:end'), [emitAck]);
  const drawCard = useCallback((targetId: string) => emitAck('card:draw', { targetId }), [emitAck]);
  const skipCard = useCallback(() => emitAck('card:skip'), [emitAck]);
  const passTurn = useCallback(() => emitAck('turn:pass'), [emitAck]);

  const value = useMemo<SessionState>(
    () => ({
      sessionId,
      participantId: membership?.participantId ?? null,
      sessionTitle: membership?.sessionTitle ?? null,
      targetLanguage: membership?.targetLanguage ?? null,
      languages: membership?.languages ?? null,
      participants,
      isConnected,
      isHydrated,
      sessionStatus,
      currentDealerId,
      currentCard,
      startSession,
      endSession,
      drawCard,
      skipCard,
      passTurn,
    }),
    [
      sessionId,
      membership,
      participants,
      isConnected,
      isHydrated,
      sessionStatus,
      currentDealerId,
      currentCard,
      startSession,
      endSession,
      drawCard,
      skipCard,
      passTurn,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
