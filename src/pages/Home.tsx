import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ApiError, progressApi } from '@/api';
import type { DrillMode, Progress } from '@/api/types';
import { useSignedIn } from '@/auth/useAuth';
import { ErrorMessage, ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { StreakSkips } from '@/components/StreakSkips';
import { Button } from '@/components/ui/button';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStartRound } from '@/hooks/useStartRound';
import {
  FORM_LABELS,
  formatPercent,
  MODE_DESCRIPTIONS,
  MODE_LABELS,
  RULE_GROUP_LABELS,
} from '@/lib/labels';

const OTHER_MODES: DrillMode[] = ['CONTRAST', 'EXAM'];

function Streak({ progress }: { progress: Progress }) {
  return (
    <p className="text-muted-foreground flex items-center gap-1.5 tabular-nums">
      {progress.streak > 0 && <Flame aria-hidden className="text-primary size-5" />}
      {progress.streak} {progress.streak === 1 ? 'day' : 'days'}
      {progress.streak > 0 && <StreakSkips left={progress.streakSkipsLeft} />}
    </p>
  );
}

function Weakest({ progress }: { progress: Progress }) {
  return (
    <section aria-labelledby="weakest-heading" className="grid gap-2.5 pt-7">
      <div className="flex items-baseline justify-between">
        <h2 id="weakest-heading" className="section-label">
          Weakest
        </h2>
        <Link
          to="/progress"
          className="text-primary inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          All progress
        </Link>
      </div>
      {progress.ruleGroups.length === 0 ? (
        <p className="text-muted-foreground">Finish a round to see where to focus.</p>
      ) : (
        <ol className="grid">
          {progress.ruleGroups.slice(0, 3).map((row) => (
            <li
              key={`${row.form}-${row.ruleGroup}`}
              className="flex items-center justify-between gap-3 border-b py-3 first:pt-0"
            >
              <span>
                {FORM_LABELS[row.form]}
                <span className="text-muted-foreground block text-sm">
                  {RULE_GROUP_LABELS[row.ruleGroup]}
                </span>
              </span>
              <span className="font-semibold tabular-nums">{formatPercent(row.accuracy)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function Home() {
  const { user } = useSignedIn();
  const progress = useApiQuery(progressApi.get, 'progress');
  const { start, pending, error } = useStartRound();
  const settingsProblem = error instanceof ApiError && error.status === 400;

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground">
            <span lang="ja">おかえり</span>
          </p>
          <h1 className="text-[26px] font-semibold">{user.username}</h1>
        </div>
        {progress.status === 'success' && <Streak progress={progress.data} />}
      </div>

      <section
        aria-labelledby="start-heading"
        className="grid justify-items-center gap-3 pt-11 pb-7"
      >
        <h2 id="start-heading" className="sr-only">
          Start a round
        </h2>
        <Button
          size="lg"
          className="h-16 px-7 text-[28px]"
          onClick={() => void start('STANDARD')}
          disabled={pending !== null}
        >
          {pending === 'STANDARD' ? 'Starting…' : 'Start practice'}
        </Button>
        <ErrorMessage error={error} />
        {settingsProblem && (
          <Link to="/settings" className="text-primary text-sm underline underline-offset-4">
            Change your settings
          </Link>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 pt-7">
        {OTHER_MODES.map((mode) => (
          <div key={mode} className="grid content-start gap-1.5">
            <Button
              variant="link"
              className="justify-self-start"
              onClick={() => void start(mode)}
              disabled={pending !== null}
              aria-describedby={`mode-${mode}`}
            >
              {pending === mode ? 'Starting…' : `${MODE_LABELS[mode]} round`}
            </Button>
            <span id={`mode-${mode}`} className="text-muted-foreground text-sm">
              {MODE_DESCRIPTIONS[mode]}
            </span>
          </div>
        ))}
      </div>

      {progress.status === 'loading' && <Loading />}
      {progress.status === 'error' && (
        <ErrorState error={progress.error} onRetry={progress.reload} />
      )}
      {progress.status === 'success' && <Weakest progress={progress.data} />}
    </div>
  );
}
