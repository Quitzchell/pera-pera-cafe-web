import type { ReactNode } from 'react';

import type { Progress, RuleGroupProgress } from '@/api/types';
import { BoxDistribution } from '@/components/BoxDistribution';
import { StreakSkips } from '@/components/StreakSkips';
import { FORM_LABELS, formatDate, formatPercent, RULE_GROUP_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';

const MAX_BOX = 5;

function Stat({ label, value }: { label: ReactNode; value: string | number }) {
  return (
    <div className="py-3 pr-3">
      <dt className="text-muted-foreground flex items-center gap-2 text-sm">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function accuracyTone(accuracy: number) {
  if (accuracy < 0.6) return 'text-destructive';
  if (accuracy < 0.85) return 'text-foreground';
  return 'text-success';
}

function BoxMeter({ box }: { box: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`Box ${box} of ${MAX_BOX}`}
    >
      {Array.from({ length: MAX_BOX }, (_, index) => (
        <span
          key={index}
          className={cn('size-2', index < box ? 'bg-primary' : 'bg-muted-foreground/30')}
        />
      ))}
    </span>
  );
}

function Accuracy({ row }: { row: RuleGroupProgress }) {
  return (
    <span className={cn('tabular-nums', accuracyTone(row.accuracy))}>
      {formatPercent(row.accuracy)}
      <span className="text-muted-foreground ml-1 text-xs">
        ({row.correctCount}/{row.attemptCount})
      </span>
    </span>
  );
}

function RuleGroupList({ rows }: { rows: RuleGroupProgress[] }) {
  return (
    <>
      <ul className="grid sm:hidden">
        {rows.map((row) => (
          <li key={`${row.form}-${row.ruleGroup}`} className="grid gap-1 border-b py-3 first:pt-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium">{FORM_LABELS[row.form]}</span>
              <Accuracy row={row} />
            </div>
            <div className="text-muted-foreground flex items-center justify-between gap-3 text-sm">
              <span>{RULE_GROUP_LABELS[row.ruleGroup]}</span>
              <BoxMeter box={row.box} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden sm:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Accuracy per form and rule group, weakest first</caption>
          <thead className="text-muted-foreground border-b">
            <tr>
              <th scope="col" className="px-0 py-3 pr-3 font-medium">
                Form
              </th>
              <th scope="col" className="px-0 py-3 pr-3 font-medium">
                Rule group
              </th>
              <th scope="col" className="py-3 pr-3 text-right font-medium">
                Accuracy
              </th>
              <th scope="col" className="px-0 py-3 pr-3 font-medium">
                Box
              </th>
              <th scope="col" className="px-0 py-3 pr-3 font-medium">
                Last practised
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.form}-${row.ruleGroup}`} className="border-b">
                <td className="px-0 py-3 pr-3">{FORM_LABELS[row.form]}</td>
                <td className="px-0 py-3 pr-3">{RULE_GROUP_LABELS[row.ruleGroup]}</td>
                <td className="px-0 py-3 pr-3 text-right">
                  <Accuracy row={row} />
                </td>
                <td className="px-0 py-3 pr-3">
                  <BoxMeter box={row.box} />
                </td>
                <td className="text-muted-foreground py-3">{formatDate(row.lastPracticedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ProgressView({ progress }: { progress: Progress }) {
  const { totals, streak, streakSkipsLeft, ruleGroups } = progress;

  return (
    <div className="grid gap-5">
      <dl className="grid grid-cols-2 sm:grid-cols-4">
        <Stat label="Accuracy" value={formatPercent(totals.accuracy)} />
        <Stat label="Attempts" value={totals.attempts} />
        <Stat label="Rounds finished" value={totals.roundsFinished} />
        <Stat
          label={
            <>
              Streak
              {streak > 0 && <StreakSkips left={streakSkipsLeft} />}
            </>
          }
          value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
        />
      </dl>

      {ruleGroups.length === 0 ? (
        <p className="text-muted-foreground pt-7">
          No practice yet. Finish a round to see progress.
        </p>
      ) : (
        <>
          <section aria-labelledby="boxes-heading" className="grid gap-2.5 pt-7">
            <h2 id="boxes-heading" className="section-label">
              Rule groups per box
            </h2>
            <BoxDistribution ruleGroups={ruleGroups} />
          </section>

          <section aria-labelledby="rule-groups-heading" className="grid gap-2.5 pt-7">
            <h2 id="rule-groups-heading" className="section-label">
              Weakest first
            </h2>
            <RuleGroupList rows={ruleGroups} />
          </section>
        </>
      )}
    </div>
  );
}
