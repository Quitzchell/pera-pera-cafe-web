import type { AnswerResult } from '@/api/types';

const CELL = 'border-b py-1.5 leading-tight';
const CAPTION = `${CELL} text-muted-foreground text-[11px] tracking-[0.08em] uppercase`;

export function Feedback({
  result,
  showAnswer = true,
}: {
  result: AnswerResult;
  /** Exam choices already show the right answer in place. */
  showAnswer?: boolean;
}) {
  const { isCorrect, expected, ruleHint, note } = result;

  return (
    <div className="grid gap-2">
      <p className="sr-only">
        {isCorrect ? 'Correct' : 'Not quite'}
        {!showAnswer && <span lang="ja">. {expected.kanji}</span>}
      </p>
      <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-[18px]">
        {showAnswer && (
          <>
            <dt className={CAPTION}>Answer</dt>
            <dd className={CELL}>
              <span lang="ja" className="text-[26px] leading-[1.15] font-semibold">
                {expected.kanji}
              </span>
              {expected.kana !== expected.kanji && (
                <span lang="ja" className="text-muted-foreground ml-3">
                  {expected.kana}
                </span>
              )}
            </dd>
          </>
        )}
        <dt className={CAPTION}>Rule</dt>
        <dd lang="ja" className={CELL}>
          {ruleHint}
        </dd>
      </dl>
      {note && <p className="bg-warning text-warning-foreground p-2 text-sm">{note}</p>}
    </div>
  );
}
