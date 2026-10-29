import type { AnswerResult } from '@/api/types';
import { cn } from '@/lib/utils';

export function Feedback({ result }: { result: AnswerResult }) {
  const { isCorrect, expected, ruleHint, note } = result;

  return (
    <div
      className={cn(
        'grid gap-2 rounded-xl border p-4',
        isCorrect ? 'border-success/50' : 'border-destructive/50',
      )}
    >
      <p className={cn('text-lg font-semibold', isCorrect ? 'text-success' : 'text-destructive')}>
        <span aria-hidden>{isCorrect ? '✓ ' : '✗ '}</span>
        {isCorrect ? 'Correct' : 'Not quite'}
      </p>
      <p>
        <span className="sr-only">Expected: </span>
        <span lang="ja" className="text-2xl">
          {expected.kanji}
        </span>
        {expected.kana !== expected.kanji && (
          <span lang="ja" className="text-muted-foreground ml-2">
            {expected.kana}
          </span>
        )}
      </p>
      <p lang="ja" className="text-muted-foreground">
        <span className="sr-only" lang="en">
          Rule:{' '}
        </span>
        {ruleHint}
      </p>
      {note && <p className="bg-warning text-warning-foreground rounded-lg p-2 text-sm">{note}</p>}
    </div>
  );
}
