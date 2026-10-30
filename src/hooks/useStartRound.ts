import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { drillApi } from '@/api';
import type { DrillMode } from '@/api/types';

// Rounds started in this page load. After a reload a round can't be resumed.
const liveRounds = new Set<string>();

export function isRoundLive(roundId: string) {
  return liveRounds.has(roundId);
}

export function endRound(roundId: string) {
  liveRounds.delete(roundId);
}

export function useStartRound() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<DrillMode | null>(null);
  const [error, setError] = useState<unknown>(null);

  async function start(mode: DrillMode) {
    setPending(mode);
    setError(null);
    try {
      const round = await drillApi.startRound(mode);
      liveRounds.add(round.id);
      navigate(`/drill/${round.id}`, { state: { round } });
    } catch (caught) {
      setError(caught);
      setPending(null);
    }
  }

  return { start, pending, error };
}
