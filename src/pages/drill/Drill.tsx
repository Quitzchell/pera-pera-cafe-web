import { useEffect, useRef, useState } from 'react';
import { Link, useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom';

import { drillApi } from '@/api';
import type { Round } from '@/api/types';
import { useSignedIn } from '@/auth/useAuth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DrillSession } from '@/components/drill/DrillSession';
import { ErrorMessage } from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { endRound, isRoundLive } from '@/hooks/useStartRound';
import { MODE_LABELS } from '@/lib/labels';

function useFinishRound(roundId: string) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function finish(beforeNavigate?: () => void) {
    setPending(true);
    setError(null);
    try {
      const summary = await drillApi.finish(roundId);
      endRound(roundId);
      beforeNavigate?.();
      navigate(`/rounds/${roundId}/summary`, { replace: true, state: { summary } });
    } catch (caught) {
      setError(caught);
      setPending(false);
    }
  }

  return { finish, pending, error };
}

function RoundUnavailable({ roundId }: { roundId: string }) {
  const { finish, pending, error } = useFinishRound(roundId);

  return (
    <div className="grid gap-4 py-10 text-center">
      <h1 className="text-2xl font-semibold">This round can't be resumed</h1>
      <p className="text-muted-foreground">
        Rounds can't continue after the page reloads. Your answers so far are saved.
      </p>
      <ErrorMessage error={error} />
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <Button onClick={() => void finish()} disabled={pending}>
          Finish and see results
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}

function ActiveRound({ round }: { round: Round }) {
  const { settings } = useSignedIn();
  const { finish, pending, error } = useFinishRound(round.id);
  const leaving = useRef(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !leaving.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (!leaving.current) event.preventDefault();
    }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-medium">{MODE_LABELS[round.mode]} round</p>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">Quit</Link>
        </Button>
      </div>
      <DrillSession
        round={round}
        showFurigana={settings.showFurigana}
        romajiInput={settings.romajiInput}
        completing={pending}
        onComplete={() => void finish(() => (leaving.current = true))}
      />
      <div className="mt-4">
        <ErrorMessage error={error} />
      </div>
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave this round?"
        confirmLabel="Leave round"
        cancelLabel="Keep practising"
        onConfirm={() => {
          endRound(round.id);
          blocker.proceed?.();
        }}
        onCancel={() => blocker.reset?.()}
      >
        Your answers so far are saved, but the round can't be continued later.
      </ConfirmDialog>
    </>
  );
}

export function Drill() {
  const { roundId = '' } = useParams();
  const location = useLocation();
  const round = (location.state as { round?: Round } | null)?.round;

  if (!round || round.id !== roundId || !isRoundLive(roundId)) {
    return <RoundUnavailable roundId={roundId} />;
  }
  return <ActiveRound round={round} />;
}
