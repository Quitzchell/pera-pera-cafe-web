import type { RuleGroupProgress } from '@/api/types';

const BOXES = [0, 1, 2, 3, 4, 5];

export function BoxDistribution({ ruleGroups }: { ruleGroups: RuleGroupProgress[] }) {
  const counts = BOXES.map((box) => ruleGroups.filter((row) => row.box === box).length);
  const max = Math.max(1, ...counts);

  return (
    <figure className="grid gap-3">
      <figcaption className="text-muted-foreground text-sm">
        Right answers move a rule group up a box, mistakes move it down. Box 5 is mastered.
      </figcaption>
      <ol className="grid grid-cols-6 gap-0.5" aria-label="Rule groups per box">
        {BOXES.map((box) => {
          const count = counts[box];
          const label = `Box ${box}: ${count} ${count === 1 ? 'rule group' : 'rule groups'}`;
          return (
            <li key={box} className="grid gap-1 text-center" title={label} aria-label={label}>
              <span className="text-sm font-semibold tabular-nums" aria-hidden>
                {count}
              </span>
              <div className="border-border flex h-20 items-end border-b" aria-hidden>
                <div
                  className="bg-primary mx-auto w-full max-w-10 rounded-t-[4px]"
                  style={{ height: count ? `${(count / max) * 100}%` : 0 }}
                />
              </div>
              <span className="text-muted-foreground text-xs" aria-hidden>
                {box}
              </span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
