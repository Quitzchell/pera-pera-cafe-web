import type { Progress, RuleGroupProgress } from '@/api/types';
import { BoxDistribution } from '@/components/BoxDistribution';
import { Card } from '@/components/ui/card';
import { FORM_LABELS, formatDate, formatPercent, RULE_GROUP_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';

const MAX_BOX = 5;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <dt className="text-muted-foreground text-sm">{label}</dt>
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
          className={cn('h-2 w-3 rounded-sm', index < box ? 'bg-primary' : 'bg-muted')}
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
      <ul className="grid gap-2 sm:hidden">
        {rows.map((row) => (
          <li
            key={`${row.form}-${row.ruleGroup}`}
            className="bg-card grid gap-1 rounded-xl border p-3"
          >
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

      <Card className="hidden p-0 sm:block sm:p-0">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Accuracy per form and rule group, weakest first</caption>
          <thead className="text-muted-foreground border-b">
            <tr>
              <th scope="col" className="p-3 font-medium">
                Form
              </th>
              <th scope="col" className="p-3 font-medium">
                Rule group
              </th>
              <th scope="col" className="p-3 text-right font-medium">
                Accuracy
              </th>
              <th scope="col" className="p-3 font-medium">
                Box
              </th>
              <th scope="col" className="p-3 font-medium">
                Last practised
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.form}-${row.ruleGroup}`} className="border-b last:border-0">
                <td className="p-3">{FORM_LABELS[row.form]}</td>
                <td className="p-3">{RULE_GROUP_LABELS[row.ruleGroup]}</td>
                <td className="p-3 text-right">
                  <Accuracy row={row} />
                </td>
                <td className="p-3">
                  <BoxMeter box={row.box} />
                </td>
                <td className="text-muted-foreground p-3">{formatDate(row.lastPracticedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export function ProgressView({ progress }: { progress: Progress }) {
  const { totals, streak, ruleGroups } = progress;

  return (
    <div className="grid gap-6">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Accuracy" value={formatPercent(totals.accuracy)} />
        <Stat label="Attempts" value={totals.attempts} />
        <Stat label="Rounds finished" value={totals.roundsFinished} />
        <Stat label="Streak" value={`${streak} ${streak === 1 ? 'day' : 'days'}`} />
      </dl>

      {ruleGroups.length === 0 ? (
        <Card>
          <p className="text-muted-foreground">No practice yet. Finish a round to see progress.</p>
        </Card>
      ) : (
        <>
          <Card aria-labelledby="boxes-heading">
            <h2 id="boxes-heading" className="mb-3 text-lg font-semibold">
              Rule groups per box
            </h2>
            <BoxDistribution ruleGroups={ruleGroups} />
          </Card>

          <section aria-labelledby="rule-groups-heading" className="grid gap-3">
            <h2 id="rule-groups-heading" className="text-lg font-semibold">
              Weakest first
            </h2>
            <RuleGroupList rows={ruleGroups} />
          </section>
        </>
      )}
    </div>
  );
}
