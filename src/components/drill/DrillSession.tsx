import { RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { ApiError, drillApi } from '@/api';
import type { AnswerResult, Round } from '@/api/types';
import { AnswerInput } from '@/components/drill/AnswerInput';
import { ExamChoices } from '@/components/drill/ExamChoices';
import { Feedback } from '@/components/drill/Feedback';
import { ErrorMessage } from '@/components/ErrorState';
import { Furigana } from '@/components/Furigana';
import { Button } from '@/components/ui/button';
import { FORM_LABELS, MODE_LABELS } from '@/lib/labels';
import { advance, initialPile } from '@/lib/pile';
import { cn } from '@/lib/utils';

type Answered = AnswerResult & { answer: string };

// After a wrong answer, a hasty Enter shouldn't skip past the correction.
const MISTAKE_DELAY_MS = 600;

// Beyond this many items, one segment each gets too thin to read.
const MAX_SEGMENTS = 12;

interface DrillSessionProps {
  round: Round;
  showFurigana: boolean;
  romajiInput: boolean;
  completing?: boolean;
  quit?: ReactNode;
  onComplete: () => void;
}

export function DrillSession({
  round,
  showFurigana,
  romajiInput,
  completing = false,
  quit,
  onComplete,
}: DrillSessionProps) {
  const [pile, setPile] = useState(() => initialPile(round));
  const [result, setResult] = useState<Answered | null>(null);
  const [cleared, setCleared] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const continueAfter = useRef(0);

  const total = round.items.length;
  const card = pile[0];
  const cardKey = `${card.itemId}:${card.attempt}`;
  const item = round.items.find((roundItem) => roundItem.id === card.itemId) ?? round.items[0];
  const isRetry = card.attempt > 0;
  const choices = round.mode === 'EXAM' ? card.choices : undefined;
  const isExam = choices !== undefined;
  const pairedItem =
    round.mode === 'CONTRAST' && !isRetry && item.position % 2 === 1
      ? round.items[item.position - 1]
      : undefined;
  // "te-form (て形)": the Japanese name is shown small so long form names stay on one line.
  const [, formName = FORM_LABELS[item.form], formKanji] =
    /^(.*) \((.*)\)$/.exec(FORM_LABELS[item.form]) ?? [];
  const conflict = error instanceof ApiError && error.status === 409;
  const isLast = pile.length === 1 && (conflict || Boolean(result?.isCorrect));
  const continueLabel = isLast ? (completing ? 'Finishing…' : 'See results') : 'Next';

  async function submit(answer: string) {
    if (pending || result) return;
    setPending(true);
    setError(null);
    try {
      // Only the first try is recorded; retries are graded without counting.
      const answerResult = isRetry
        ? await drillApi.retry(round.id, item.id, answer)
        : await drillApi.answer(round.id, item.id, answer);
      if (answerResult.isCorrect) setCleared((count) => count + 1);
      else continueAfter.current = Date.now() + MISTAKE_DELAY_MS;
      setResult({ ...answerResult, answer });
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(false);
    }
  }

  function next() {
    if (!result && !conflict) return;
    if (Date.now() < continueAfter.current) return;
    const correct = conflict || Boolean(result?.isCorrect);
    const rest = advance(pile, correct);
    setError(null);
    if (conflict) setCleared(cleared + 1);
    if (rest.length === 0) {
      onComplete();
      return;
    }
    setPile(rest);
    setResult(null);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }
      if (result) {
        // A focused button handles Enter itself.
        if (event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)) {
          event.preventDefault();
          next();
        }
        return;
      }
      if (choices) {
        const choice = choices[Number(event.key) - 1];
        if (choice !== undefined && /^[1-9]$/.test(event.key)) {
          event.preventDefault();
          void submit(choice);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
      <div className="flex items-center gap-3.5">
        {quit}
        <div
          role="progressbar"
          aria-label={`${MODE_LABELS[round.mode]} round progress`}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={cleared}
          aria-valuetext={`${cleared} of ${total} done`}
          className="flex h-1 flex-1 gap-1"
        >
          {total > MAX_SEGMENTS ? (
            <div className="bg-muted-foreground/30 h-full w-full">
              <div
                className="bg-primary h-full transition-[width] motion-reduce:transition-none"
                style={{ width: `${(cleared / total) * 100}%` }}
              />
            </div>
          ) : (
            round.items.map((roundItem, index) => (
              <i
                key={roundItem.id}
                className={cn('flex-1', index < cleared ? 'bg-primary' : 'bg-muted-foreground/30')}
              />
            ))
          )}
        </div>
      </div>

      <section aria-label="Question" className="relative grid content-start gap-1.5">
        {isRetry && (
          <p className="text-muted-foreground absolute top-0 right-0 flex items-center gap-1 text-xs font-medium">
            <RotateCcw aria-hidden className="size-3.5" /> Try again
          </p>
        )}
        <span id="prompt-verb" hidden>
          {item.verb.dictionaryForm}
          {item.verb.reading !== item.verb.dictionaryForm && ` (${item.verb.reading})`}
        </span>
        <p className="text-[44px] leading-[1.15] font-semibold">
          <Furigana
            word={item.verb.dictionaryForm}
            reading={item.verb.reading}
            show={showFurigana}
          />
        </p>
        <p className="text-muted-foreground">{item.verb.meaning}</p>
        <h1
          id="prompt-form"
          aria-label={FORM_LABELS[item.form]}
          className="text-primary mt-1.5 text-[26px] font-semibold"
        >
          → {formName}
          {formKanji && (
            <span lang="ja" className="text-muted-foreground ml-2.5 text-[15px] font-medium">
              {formKanji}
            </span>
          )}
        </h1>
        {pairedItem && (
          <p className="text-muted-foreground text-sm">
            Compare with {FORM_LABELS[pairedItem.form]}
          </p>
        )}
      </section>

      {isExam ? (
        <ExamChoices
          key={cardKey}
          choices={choices}
          disabled={pending || Boolean(result)}
          picked={result?.answer}
          expectedKana={result?.expected.kana}
          onPick={(choice) => void submit(choice)}
        />
      ) : (
        <AnswerInput
          itemId={cardKey}
          locked={pending || Boolean(result)}
          status={result ? (result.isCorrect ? 'correct' : 'wrong') : undefined}
          romaji={romajiInput}
          continueLabel={result ? continueLabel : undefined}
          continueDisabled={completing}
          onSubmit={(answer) => void submit(answer)}
          onContinue={next}
        />
      )}

      <div aria-live="polite" aria-atomic="true">
        {result && (
          <Feedback
            result={result}
            // In an exam the right choice turns green, unless the verb changed and none matches.
            showAnswer={!choices?.includes(result.expected.kana)}
          />
        )}
      </div>

      <ErrorMessage error={error} />

      {((isExam && result) || conflict) && (
        <div className="grid justify-center">
          <Button size="lg" onClick={next} disabled={completing} autoFocus>
            {continueLabel}
            <span aria-hidden> →</span>
          </Button>
        </div>
      )}
    </div>
  );
}
