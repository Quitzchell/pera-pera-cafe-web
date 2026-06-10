import { useEffect, useState } from 'react';

import { fetchParticipant } from '@/api/session';
import { httpError } from '@/lib/httpError';

type Result =
  | { status: 'loading' }
  | { status: 'host' }
  | { status: 'not-host' }
  | { status: 'error'; error: Error };

export function useIsHost(sessionId: string, participantId: string | null): Result {
  const [result, setResult] = useState<Result>({ status: 'loading' });

  useEffect(() => {
    if (!participantId) {
      setResult({ status: 'not-host' });
      return;
    }

    let cancelled = false;

    fetchParticipant(sessionId, participantId)
      .then((p) => {
        if (cancelled) return;
        setResult({ status: p.isHost ? 'host' : 'not-host' });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof httpError && err.status === 404) {
          setResult({ status: 'not-host' });
        } else {
          setResult({
            status: 'error',
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, participantId]);

  return result;
}
