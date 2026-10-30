import type { AnswerResult } from '@/api/types';
import { cn } from '@/lib/utils';

export function Feedback({ result }: { result: AnswerResult }) {
  const { isCorrect, expected, ruleHint, note } = result;

  return (
    <div
      className={cn(
        'grid gap-1 rounded-xl border px-4 py-3',
        isCorrect ? 'border-success/50' : 'border-destructive/50',
      )}
    >
      <p className="flex flex-wrap items-baseline gap-x-3">
        <span className={cn('font-semibold', isCorrect ? 'text-success' : 'text-destructive')}>
          <span aria-hidden>{isCorrect ? '✓ ' : '✗ '}</span>
          {isCorrect ? 'Correct' : 'Not quite'}
        </span>
        <span>
          <span className="sr-only">Expected: </span>
          <span lang="ja" className="text-xl">
            {expected.kanji}
          </span>
          {expected.kana !== expected.kanji && (
            <span lang="ja" className="text-muted-foreground ml-2 text-sm">
              {expected.kana}
            </span>
          )}
        </span>
      </p>
      <p lang="ja" className="text-muted-foreground text-sm">
        <span className="sr-only" lang="en">
          Rule:{' '}
        </span>
        {ruleHint}
      </p>
      {note && (
        <p className="bg-warning text-warning-foreground mt-1 rounded-lg p-2 text-sm">{note}</p>
      )}
    </div>
  );
}
