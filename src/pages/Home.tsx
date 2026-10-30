import { Flame, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ApiError, progressApi } from '@/api';
import type { DrillMode, Progress } from '@/api/types';
import { useSignedIn } from '@/auth/useAuth';
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

const OTHER_MODES: DrillMode[] = ['CONTRAST', 'EXAM'];

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function Status({ progress }: { progress: Progress }) {
  return (
    <div className="grid gap-4">
      <dl className="flex flex-wrap gap-x-6 gap-y-2">
        <div>
          <dt className="text-muted-foreground text-sm">Due today</dt>
          <dd className="text-xl font-semibold tabular-nums">
            {plural(progress.totals.dueToday, 'rule group', 'rule groups')}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Streak</dt>
          <dd className="flex items-center gap-1 text-xl font-semibold tabular-nums">
            {progress.streak > 0 && <Flame aria-hidden className="text-primary size-5" />}
            {plural(progress.streak, 'day', 'days')}
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
        {progress.ruleGroups.length === 0 ? (
          <p className="text-muted-foreground">Finish a round to see where to focus.</p>
        ) : (
          <ol className="grid gap-2">
            {progress.ruleGroups.slice(0, 3).map((row) => (
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
                <span className="font-semibold tabular-nums">{formatPercent(row.accuracy)}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

export function Home() {
  const { user, settings } = useSignedIn();
  const progress = useApiQuery(progressApi.get, 'progress');
  const { start, pending, error } = useStartRound();
  const settingsProblem = error instanceof ApiError && error.status === 400;
  const due = progress.data?.totals.dueToday;

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold">Hi {user.username}</h1>

      <div className="grid gap-6 md:grid-cols-5">
        <section aria-labelledby="start-heading" className="grid content-start gap-3 md:col-span-3">
          <h2 id="start-heading" className="sr-only">
            Start a round
          </h2>
          <button
            type="button"
            onClick={() => void start('STANDARD')}
            disabled={pending !== null}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 flex min-h-28 items-center gap-4 rounded-xl p-5 text-left transition-colors outline-none focus-visible:ring-[3px] disabled:opacity-60"
          >
            <span className="bg-primary-foreground/15 grid size-12 shrink-0 place-items-center rounded-full">
              <Play aria-hidden className="size-6" />
            </span>
            <span className="grid gap-0.5">
              <span className="text-xl font-semibold">
                {pending === 'STANDARD' ? 'Starting…' : 'Start practice'}
              </span>
              <span className="opacity-85">
                {settings.roundSize} questions
                {due !== undefined &&
                  due > 0 &&
                  ` · ${plural(due, 'rule group', 'rule groups')} due`}
              </span>
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {OTHER_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => void start(mode)}
                disabled={pending !== null}
                className="bg-card hover:bg-accent focus-visible:ring-ring/50 grid content-start gap-1 rounded-xl border p-4 text-left transition-colors outline-none focus-visible:ring-[3px] disabled:opacity-60"
              >
                <span className="font-semibold">
                  {pending === mode ? 'Starting…' : `${MODE_LABELS[mode]} round`}
                </span>
                <span className="text-muted-foreground text-sm">{MODE_DESCRIPTIONS[mode]}</span>
              </button>
            ))}
          </div>

          <ErrorMessage error={error} />
          {settingsProblem && (
            <Link to="/settings" className="text-primary text-sm underline underline-offset-4">
              Change your settings
            </Link>
          )}
        </section>

        <div className="md:col-span-2">
          {progress.status === 'loading' && <Loading />}
          {progress.status === 'error' && (
            <ErrorState error={progress.error} onRetry={progress.reload} />
          )}
          {progress.status === 'success' && <Status progress={progress.data} />}
        </div>
      </div>
    </div>
  );
}
