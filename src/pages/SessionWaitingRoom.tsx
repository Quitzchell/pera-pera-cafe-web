import { Crown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useSession } from '@/context/useSession';
import { useIsHost } from '@/hooks/useIsHost';
import { labelForLanguage } from '@/lib/language';

export function SessionWaitingRoom() {
  const {
    sessionId,
    participantId,
    sessionTitle,
    targetLanguage,
    languages,
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
  } = useSession();
  const result = useIsHost(sessionId, participantId);
  const [copied, setCopied] = useState(false);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (result.status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <p className="text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <p className="text-destructive text-center">Something went wrong: {result.error.message}</p>
      </div>
    );
  }

  if (result.status === 'not-host' && !participantId) {
    return <Navigate to={`/join/${sessionId}`} replace />;
  }

  const isHost = result.status === 'host';
  const joinUrl = `${window.location.origin}/join/${sessionId}`;

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: sessionTitle ?? 'Pera Pera Cafe',
          url: joinUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user cancelled share / clipboard blocked - silent
    }
  }

  async function handleStart() {
    setActionPending(true);
    setActionError(null);
    const result = await startSession();
    setActionPending(false);
    if (!result.ok) setActionError(result.error ?? 'Failed to start');
  }

  async function handleEnd() {
    setActionPending(true);
    setActionError(null);
    const result = await endSession();
    setActionPending(false);
    if (!result.ok) setActionError(result.error ?? 'Failed to end');
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h1 className="text-3xl font-bold">{sessionTitle ?? 'Loading session…'}</h1>
        <p className="text-muted-foreground mt-4">Connecting…</p>
      </div>
    );
  }

  // ───── Session ended ─────
  if (sessionStatus === 'ended') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-3xl font-bold">{sessionTitle}</h1>
        <p className="text-muted-foreground">This session has ended.</p>
      </div>
    );
  }

  // ───── Session active (placeholder for game) ─────
  if (sessionStatus === 'active') {
    const isDealer = participantId === currentDealerId;
    const isTarget = currentCard?.targetParticipantId === participantId;
    const dealer = participants.find((p) => p.id === currentDealerId);
    const target = currentCard
      ? participants.find((p) => p.id === currentCard.targetParticipantId)
      : null;
    const askableTargets = participants.filter((p) => p.id !== participantId);

    const practiceTranslation = currentCard?.translations.find(
      (t) => t.language === currentCard.practiceLanguage,
    );
    const nativeTranslation = currentCard?.translations.find(
      (t) => t.language !== currentCard.practiceLanguage,
    );

    async function handleDraw(targetId: string) {
      setActionPending(true);
      setActionError(null);
      const result = await drawCard(targetId);
      setActionPending(false);
      if (!result.ok) setActionError(result.error ?? 'Failed to draw');
    }

    async function handleSkip() {
      setActionPending(true);
      setActionError(null);
      const result = await skipCard();
      setActionPending(false);
      if (!result.ok) setActionError(result.error ?? 'Failed to skip');
    }

    async function handlePass() {
      setActionPending(true);
      setActionError(null);
      const result = await passTurn();
      setActionPending(false);
      if (!result.ok) setActionError(result.error ?? 'Failed to pass');
    }

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold">{sessionTitle}</h1>
          {languages && (
            <div className="text-muted-foreground flex items-center gap-2 text-base">
              <span className="text-muted-foreground flex items-center gap-2 text-base">
                {languages.map(labelForLanguage).join(' ↔ ')}
              </span>
            </div>
          )}
        </div>

        {/* Card display - dealer + observers only */}
        {currentCard && !isTarget && practiceTranslation && (
          <div className="border-input bg-background flex w-full max-w-lg flex-col gap-3 rounded-lg border p-6">
            <p className="text-2xl leading-snug font-medium">{practiceTranslation.translation}</p>
            {practiceTranslation.romanization && (
              <p className="text-muted-foreground text-sm italic">
                {practiceTranslation.romanization}
              </p>
            )}
            {nativeTranslation && (
              <p className="text-muted-foreground border-input border-t pt-3 text-sm">
                {nativeTranslation.translation}
              </p>
            )}
          </div>
        )}

        {/* Target view - listen prompt instead of card */}
        {currentCard && isTarget && dealer && (
          <p className="text-2xl leading-snug font-medium">
            {dealer.name} is asking you a question
          </p>
        )}

        {/* Status - who's being asked */}
        {currentCard && target && !isTarget && (
          <p className="text-muted-foreground text-sm">For {target.name}</p>
        )}
        {/* Dealer: target picker */}
        {isDealer && !currentCard && (
          <div className="flex w-full max-w-xs flex-col gap-3">
            <p className="text-muted-foreground text-center text-sm">Pick a participant</p>
            <div className="flex flex-col gap-2">
              {askableTargets.map((p) => (
                <Button
                  key={p.id}
                  size="lg"
                  variant="outline"
                  disabled={actionPending || !isConnected}
                  onClick={() => handleDraw(p.id)}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        {/* Dealer: skip + pass */}
        {isDealer && currentCard && (
          <div className="flex gap-3">
            <Button variant="outline" disabled={actionPending || !isConnected} onClick={handleSkip}>
              {actionPending ? '...' : 'Skip card'}
            </Button>
            <Button disabled={actionPending || !isConnected} onClick={handlePass}>
              {actionPending ? '...' : 'Pass turn'}
            </Button>
          </div>
        )}
        {/* Non-dealer waiting (no card yet) */}
        {!isDealer && !currentCard && dealer && (
          <p className="text-muted-foreground">Waiting for {dealer.name} to draw a card...</p>
        )}
        {/* Host: end session (subtle) */}
        {isHost && (
          <Button
            variant="ghost"
            size="sm"
            disabled={actionPending || !isConnected}
            onClick={handleEnd}
          >
            End session
          </Button>
        )}
        {actionError && <p className="text-destructive text-sm">{actionError}</p>}
      </div>
    );
  }

  // ───── Session pending (waiting room) ─────
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">{sessionTitle}</h1>
        {languages && (
          <p className="text-muted-foreground text-sm">
            {languages.map(labelForLanguage).join(' ↔ ')}
          </p>
        )}
        {targetLanguage && (
          <p className="text-muted-foreground text-xs">
            You're practicing {labelForLanguage(targetLanguage)}
          </p>
        )}
      </div>

      {isHost && (
        <>
          <div className="border-input rounded-md border bg-white p-4">
            <QRCodeSVG value={joinUrl} size={220} />
          </div>
          <Button variant="outline" onClick={handleShare}>
            {copied ? 'Copied!' : 'Share link'}
          </Button>
        </>
      )}

      {participants.length > 0 && (
        <div className="flex w-full max-w-md flex-col gap-3">
          <p className="text-muted-foreground text-sm">Participants {participants.length}</p>
          <ul className="flex flex-col gap-2">
            {participants.map((p) => (
              <li
                key={p.id}
                className="border-input bg-background flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  {p.isHost && <Crown className="text-muted-foreground size-3" />}
                  <span>
                    {p.name}
                    {p.id === participantId && ' (you)'}
                  </span>
                </span>
                <span className="text-muted-foreground text-xs">
                  Practicing {labelForLanguage(p.targetLanguage)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isConnected && <p className="text-muted-foreground text-xs">Reconnecting…</p>}

      {isHost ? (
        <div className="flex flex-col items-center gap-2">
          <Button size="lg" disabled={actionPending || !isConnected} onClick={handleStart}>
            {actionPending ? 'Starting…' : 'Start session'}
          </Button>
          {actionError && <p className="text-destructive text-sm">{actionError}</p>}
        </div>
      ) : (
        <p className="text-muted-foreground">Waiting for the host to start…</p>
      )}
    </div>
  );
}
