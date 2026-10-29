import { ArrowDown, RotateCcw } from 'lucide-react';
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

type Answered = AnswerResult & { answer: string };

// After a wrong answer, a hasty Enter shouldn't skip past the correction.
const MISTAKE_DELAY_MS = 600;

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
    <div className="grid gap-5">
      <div className="flex items-center gap-3">
        {quit}
        <div
          role="progressbar"
          aria-label={`${MODE_LABELS[round.mode]} round progress`}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={cleared}
          aria-valuetext={`${cleared} of ${total} done`}
          className="bg-muted h-2 flex-1 overflow-hidden rounded-full"
        >
          <div
            className="bg-primary h-full rounded-full transition-[width] motion-reduce:transition-none"
            style={{ width: `${(cleared / total) * 100}%` }}
          />
        </div>
        <span className="text-muted-foreground text-sm tabular-nums" aria-hidden>
          {cleared}/{total}
        </span>
      </div>

      <section
        aria-label="Question"
        className="bg-card relative grid justify-items-center gap-1 rounded-2xl border px-4 py-6 text-center"
      >
        {isRetry && (
          <p className="text-muted-foreground absolute top-3 left-3 flex items-center gap-1 text-xs font-medium">
            <RotateCcw aria-hidden className="size-3.5" /> Try again
          </p>
        )}
        <span id="prompt-verb" hidden>
          {item.verb.dictionaryForm}
          {item.verb.reading !== item.verb.dictionaryForm && ` (${item.verb.reading})`}
        </span>
        <p className="text-5xl leading-tight font-medium sm:text-6xl">
          <Furigana
            word={item.verb.dictionaryForm}
            reading={item.verb.reading}
            show={showFurigana}
          />
        </p>
        <p className="text-muted-foreground text-sm">{item.verb.meaning}</p>
        <ArrowDown aria-hidden className="text-muted-foreground my-2 size-5" />
        <h1
          id="prompt-form"
          className="bg-primary/10 text-primary rounded-full px-4 py-1.5 text-lg font-semibold"
        >
          {FORM_LABELS[item.form]}
        </h1>
        {pairedItem && (
          <p className="text-muted-foreground mt-1 text-sm">
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
        {result && <Feedback result={result} />}
      </div>

      <ErrorMessage error={error} />

      {((isExam && result) || conflict) && (
        <Button size="lg" onClick={next} disabled={completing} autoFocus>
          {continueLabel}
        </Button>
      )}
    </div>
  );
}
