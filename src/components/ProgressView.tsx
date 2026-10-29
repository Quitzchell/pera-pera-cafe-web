import type { Progress } from '@/api/types';
import { Card } from '@/components/ui/card';
import { FORM_LABELS, formatDate, formatPercent, RULE_GROUP_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';

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

      <Card className="p-0 sm:p-0">
        {ruleGroups.length === 0 ? (
          <p className="text-muted-foreground p-4">
            No practice yet. Finish a round to see progress.
          </p>
        ) : (
          <div className="overflow-x-auto">
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
                  <th scope="col" className="p-3 text-right font-medium">
                    Box
                  </th>
                  <th scope="col" className="hidden p-3 font-medium sm:table-cell">
                    Last practiced
                  </th>
                </tr>
              </thead>
              <tbody>
                {ruleGroups.map((row) => (
                  <tr key={`${row.form}-${row.ruleGroup}`} className="border-b last:border-0">
                    <td className="p-3">{FORM_LABELS[row.form]}</td>
                    <td className="p-3">{RULE_GROUP_LABELS[row.ruleGroup]}</td>
                    <td className={cn('p-3 text-right tabular-nums', accuracyTone(row.accuracy))}>
                      {formatPercent(row.accuracy)}
                      <span className="text-muted-foreground block text-xs">
                        {row.correctCount}/{row.attemptCount}
                      </span>
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      <span aria-label={`Box ${row.box} of 5`}>{row.box}/5</span>
                    </td>
                    <td className="text-muted-foreground hidden p-3 sm:table-cell">
                      {formatDate(row.lastPracticedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
