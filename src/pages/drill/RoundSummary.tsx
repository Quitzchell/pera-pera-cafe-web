import { Link, useLocation, useParams } from 'react-router-dom';

import { drillApi } from '@/api';
import type { RoundSummary as Summary } from '@/api/types';
import { ErrorMessage, ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStartRound } from '@/hooks/useStartRound';
import { FORM_LABELS, MODE_LABELS } from '@/lib/labels';

export function RoundSummary() {
  const { roundId = '' } = useParams();
  const location = useLocation();
  const fromState = (location.state as { summary?: Summary } | null)?.summary;
  // Finishing is idempotent, so after a reload it returns the same summary.
  const query = useApiQuery(
    () => drillApi.finish(roundId),
    roundId,
    fromState?.id === roundId ? fromState : undefined,
  );
  const startRound = useStartRound();

  if (query.status === 'loading') return <Loading />;
  if (query.status === 'error') return <ErrorState error={query.error} onRetry={query.reload} />;

  const summary = query.data;
  const unanswered = summary.total - summary.answered;

  return (
    <div className="grid gap-6">
      <div className="grid gap-1 text-center">
        <p className="text-muted-foreground text-sm">{MODE_LABELS[summary.mode]} round</p>
        <h1 className="text-4xl font-semibold tabular-nums">
          {summary.correct} / {summary.total}
        </h1>
        <p className="text-muted-foreground">
          {summary.mistakes.length === 0 && unanswered === 0
            ? 'No mistakes. よくできました！'
            : `${summary.mistakes.length} ${summary.mistakes.length === 1 ? 'mistake' : 'mistakes'}`}
          {unanswered > 0 && `, ${unanswered} unanswered`}
        </p>
      </div>

      {summary.mistakes.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Mistakes</h2>
          <ul className="grid gap-4">
            {summary.mistakes.map((mistake) => (
              <li key={mistake.itemId} className="grid gap-1 border-b pb-4 last:border-0 last:pb-0">
                <p>
                  <span lang="ja" className="text-lg">
                    {mistake.verb.dictionaryForm}
                  </span>{' '}
                  <span className="text-muted-foreground">
                    → {FORM_LABELS[mistake.form]} · {mistake.verb.meaning}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground text-sm">You: </span>
                  <span lang="ja" className="text-destructive line-through">
                    {mistake.answer}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground text-sm">Correct: </span>
                  <span lang="ja" className="text-success">
                    {mistake.expected.kanji}
                  </span>
                  {mistake.expected.kana !== mistake.expected.kanji && (
                    <span lang="ja" className="text-muted-foreground ml-2">
                      {mistake.expected.kana}
                    </span>
                  )}
                </p>
                <p lang="ja" className="text-muted-foreground text-sm">
                  {mistake.ruleHint}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ErrorMessage error={startRound.error} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          size="lg"
          onClick={() => void startRound.start(summary.mode)}
          disabled={startRound.pending !== null}
          autoFocus
        >
          {startRound.pending ? 'Starting…' : 'Another round'}
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
