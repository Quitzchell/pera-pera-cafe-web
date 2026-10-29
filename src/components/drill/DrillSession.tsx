import { useEffect, useState } from 'react';

import { ApiError, drillApi } from '@/api';
import type { AnswerResult, Round } from '@/api/types';
import { AnswerInput } from '@/components/drill/AnswerInput';
import { ExamChoices } from '@/components/drill/ExamChoices';
import { Feedback } from '@/components/drill/Feedback';
import { ErrorMessage } from '@/components/ErrorState';
import { Furigana } from '@/components/Furigana';
import { Button } from '@/components/ui/button';
import { FORM_LABELS } from '@/lib/labels';

type Answered = AnswerResult & { answer: string };

interface DrillSessionProps {
  round: Round;
  showFurigana: boolean;
  romajiInput: boolean;
  completing?: boolean;
  onComplete: () => void;
}

export function DrillSession({
  round,
  showFurigana,
  romajiInput,
  completing = false,
  onComplete,
}: DrillSessionProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answered>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const total = round.items.length;
  const item = round.items[index];
  const result = answers[item.id];
  const answeredCount = Object.keys(answers).length;
  const isLast = index === total - 1;
  const isExam = round.mode === 'EXAM' && item.choices !== undefined;
  const pairedItem =
    round.mode === 'CONTRAST' && item.position % 2 === 1 ? round.items[index - 1] : undefined;
  const conflict = error instanceof ApiError && error.status === 409;

  async function submit(answer: string) {
    if (pending || result) return;
    setPending(true);
    setError(null);
    try {
      const answerResult = await drillApi.answer(round.id, item.id, answer);
      setAnswers((current) => ({ ...current, [item.id]: { ...answerResult, answer } }));
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(false);
    }
  }

  function next() {
    if (!result && !conflict) return;
    setError(null);
    if (isLast) onComplete();
    else setIndex(index + 1);
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
      if (isExam && item.choices) {
        const choice = item.choices[Number(event.key) - 1];
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
    <div className="grid gap-6">
      <div className="grid gap-2">
        <div className="text-muted-foreground flex justify-between text-sm">
          <span>
            Question {index + 1} of {total}
          </span>
          <span>
            {answeredCount} / {total}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Round progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answeredCount}
          aria-valuetext={`${answeredCount} of ${total} answered`}
          className="bg-muted h-2 overflow-hidden rounded-full"
        >
          <div
            className="bg-primary h-full rounded-full transition-[width] motion-reduce:transition-none"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>
      </div>

      <section aria-label="Prompt" className="grid justify-items-center gap-3 text-center">
        {pairedItem && (
          <p className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-sm">
            Compare with {FORM_LABELS[pairedItem.form]}
          </p>
        )}
        <p className="text-5xl leading-tight font-medium sm:text-6xl">
          <Furigana
            word={item.verb.dictionaryForm}
            reading={item.verb.reading}
            show={showFurigana}
          />
        </p>
        <p className="text-muted-foreground">{item.verb.meaning}</p>
        <p className="text-muted-foreground text-sm">Conjugate to</p>
        <h1 className="text-2xl font-semibold">{FORM_LABELS[item.form]}</h1>
      </section>

      {isExam && item.choices ? (
        <ExamChoices
          key={item.id}
          choices={item.choices}
          disabled={pending || Boolean(result)}
          picked={result?.answer}
          expectedKana={result?.expected.kana}
          onPick={(choice) => void submit(choice)}
        />
      ) : (
        <AnswerInput
          key={item.id}
          disabled={pending || Boolean(result)}
          romaji={romajiInput}
          onSubmit={(answer) => void submit(answer)}
        />
      )}

      <div aria-live="polite" aria-atomic="true">
        {result && <Feedback result={result} />}
      </div>

      <ErrorMessage error={error} />

      {(result || conflict) && (
        <Button size="lg" onClick={next} disabled={completing} autoFocus>
          {isLast ? (completing ? 'Finishing…' : 'See results') : 'Next'}
        </Button>
      )}
    </div>
  );
}
