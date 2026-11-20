import { Link, useLocation, useParams } from 'react-router-dom';

import { drillApi } from '@/api';
import type { RoundSummary as Summary } from '@/api/types';
import { ErrorMessage, ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStartRound } from '@/hooks/useStartRound';
import { FORM_LABELS, MODE_LABELS } from '@/lib/labels';

// Focus for keyboard users, without jumping past the score to the bottom of a long summary.
const focusWithoutScroll = (button: HTMLButtonElement | null) =>
  button?.focus({ preventScroll: true });

const LABEL = 'text-muted-foreground inline-block w-[72px] text-[13px]';

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
    <div className="grid gap-5">
      <div className="grid gap-1 text-center">
        <p className="text-muted-foreground">{MODE_LABELS[summary.mode]} round</p>
        <h1 className="text-[56px] leading-none font-semibold tabular-nums">
          {summary.correct}/{summary.total}
        </h1>
        <p className="text-muted-foreground">
          {summary.mistakes.length === 0 && unanswered === 0
            ? 'No mistakes. よくできました！'
            : `${summary.mistakes.length} ${summary.mistakes.length === 1 ? 'mistake' : 'mistakes'}`}
          {unanswered > 0 && `, ${unanswered} unanswered`}
        </p>
      </div>

      {summary.mistakes.length > 0 && (
        <section aria-labelledby="mistakes-heading" className="grid gap-2.5 pt-7">
          <h2 id="mistakes-heading" className="section-label">
            Mistakes
          </h2>
          <ul className="grid">
            {summary.mistakes.map((mistake) => (
              <li key={mistake.itemId} className="grid gap-1 border-b py-3 first:pt-0">
                <p>
                  <span lang="ja" className="text-lg">
                    {mistake.verb.dictionaryForm}
                  </span>{' '}
                  <span className="text-muted-foreground">
                    → {FORM_LABELS[mistake.form]} · {mistake.verb.meaning}
                  </span>
                </p>
                <p>
                  <span className={LABEL}>Correct</span>
                  <span lang="ja" className="text-success">
                    {mistake.expected.kanji}
                  </span>
                  {mistake.expected.kana !== mistake.expected.kanji && (
                    <span lang="ja" className="text-muted-foreground ml-2">
                      {mistake.expected.kana}
                    </span>
                  )}
                </p>
                <p>
                  <span className={LABEL}>You wrote</span>
                  <span lang="ja" className="text-destructive line-through">
                    {mistake.answer}
                  </span>
                </p>
                <p lang="ja">
                  <span lang="en" className={LABEL}>
                    Rule
                  </span>
                  {mistake.ruleHint}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ErrorMessage error={startRound.error} />
      <div className="grid justify-items-center gap-1 pt-7">
        <Button
          size="lg"
          className="text-[19px]"
          onClick={() => void startRound.start(summary.mode)}
          disabled={startRound.pending !== null}
          ref={focusWithoutScroll}
        >
          {startRound.pending ? 'Starting…' : <>Another round</>}
        </Button>
        <Button variant="outline" className="text-muted-foreground" asChild>
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
