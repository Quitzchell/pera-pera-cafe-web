import { Link } from 'react-router-dom';

import { ApiError, progressApi } from '@/api';
import type { DrillMode } from '@/api/types';
import { useSignedIn } from '@/auth/useAuth';
import { BoxDistribution } from '@/components/BoxDistribution';
import { ErrorMessage, ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { Card } from '@/components/ui/card';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useStartRound } from '@/hooks/useStartRound';
import {
  FORM_LABELS,
  formatPercent,
  MODE_DESCRIPTIONS,
  MODE_LABELS,
  RULE_GROUP_LABELS,
} from '@/lib/labels';
import { cn } from '@/lib/utils';

const MODES: DrillMode[] = ['STANDARD', 'CONTRAST', 'EXAM'];

export function Home() {
  const { user } = useSignedIn();
  const progress = useApiQuery(progressApi.get, 'progress');
  const { start, pending, error } = useStartRound();
  const settingsProblem = error instanceof ApiError && error.status === 400;

  return (
    <div className="grid gap-8">
      <h1 className="text-2xl font-semibold">Hi {user.displayName}</h1>

      <section aria-labelledby="start-heading" className="grid gap-3">
        <h2 id="start-heading" className="sr-only">
          Start a round
        </h2>
        {MODES.map((mode, index) => (
          <button
            key={mode}
            type="button"
            onClick={() => void start(mode)}
            disabled={pending !== null}
            className={cn(
              'focus-visible:ring-ring/50 grid min-h-20 gap-1 rounded-xl border p-4 text-left transition-colors outline-none focus-visible:ring-[3px] disabled:opacity-60',
              index === 0
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-card hover:bg-accent',
            )}
          >
            <span className="text-lg font-semibold">
              {pending === mode ? 'Starting…' : `${MODE_LABELS[mode]} round`}
            </span>
            <span className={index === 0 ? 'opacity-85' : 'text-muted-foreground'}>
              {MODE_DESCRIPTIONS[mode]}
            </span>
          </button>
        ))}
        <ErrorMessage error={error} />
        {settingsProblem && (
          <Link to="/settings" className="text-primary text-sm underline underline-offset-4">
            Change your settings
          </Link>
        )}
      </section>

      {progress.status === 'loading' && <Loading />}
      {progress.status === 'error' && (
        <ErrorState error={progress.error} onRetry={progress.reload} />
      )}
      {progress.status === 'success' && (
        <>
          <dl className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl border p-4">
              <dt className="text-muted-foreground text-sm">Due today</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {progress.data.totals.dueToday}
                <span className="text-muted-foreground ml-1 text-sm font-normal">
                  {progress.data.totals.dueToday === 1 ? 'rule group' : 'rule groups'}
                </span>
              </dd>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <dt className="text-muted-foreground text-sm">Streak</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {progress.data.streak}
                <span className="text-muted-foreground ml-1 text-sm font-normal">
                  {progress.data.streak === 1 ? 'day' : 'days'}
                </span>
              </dd>
            </div>
          </dl>

          <Card aria-labelledby="weakest-heading">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="weakest-heading" className="text-lg font-semibold">
                Weakest areas
              </h2>
              <Link to="/progress" className="text-primary text-sm underline underline-offset-4">
                All progress
              </Link>
            </div>
            {progress.data.ruleGroups.length === 0 ? (
              <p className="text-muted-foreground">Finish a round to see where to focus.</p>
            ) : (
              <ol className="grid gap-2">
                {progress.data.ruleGroups.slice(0, 3).map((row) => (
                  <li
                    key={`${row.form}-${row.ruleGroup}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>
                      {FORM_LABELS[row.form]}
                      <span className="text-muted-foreground block text-sm">
                        {RULE_GROUP_LABELS[row.ruleGroup]}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatPercent(row.accuracy)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {progress.data.ruleGroups.length > 0 && (
            <Card aria-labelledby="boxes-heading">
              <h2 id="boxes-heading" className="mb-3 text-lg font-semibold">
                Rule groups per box
              </h2>
              <BoxDistribution ruleGroups={progress.data.ruleGroups} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
