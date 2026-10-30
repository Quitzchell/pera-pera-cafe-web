import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { toKana } from 'wanakana';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LATIN = /[A-Za-zＡ-Ｚａ-ｚ]/;
const KATAKANA = new RegExp('[\\u30a1-\\u30fa]');

/** Input that can never be a correct answer gets a hint instead of being marked wrong. */
function rejectReason(raw: string, answer: string, romaji: boolean) {
  if (!answer) return '';
  if (LATIN.test(answer)) {
    return romaji
      ? "Some letters aren't valid romaji."
      : 'Type the answer in Japanese, or turn on romaji input in Settings.';
  }
  if (KATAKANA.test(raw)) return 'Use hiragana or kanji, not katakana.';
  return null;
}

interface AnswerInputProps {
  itemId: string;
  locked: boolean;
  status?: 'correct' | 'wrong';
  romaji: boolean;
  /** Shown in place of Check once the answer is marked. */
  continueLabel?: string;
  continueDisabled?: boolean;
  onSubmit: (answer: string) => void;
  onContinue: () => void;
}

export function AnswerInput({
  itemId,
  locked,
  status,
  romaji,
  continueLabel,
  continueDisabled,
  onSubmit,
  onContinue,
}: AnswerInputProps) {
  const [value, setValue] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [currentItem, setCurrentItem] = useState(itemId);
  const composing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (currentItem !== itemId) {
    setCurrentItem(itemId);
    setValue('');
    setHint(null);
  }

  // The same input stays mounted and focused between items, so the mobile keyboard stays open.
  useEffect(() => {
    inputRef.current?.focus();
  }, [itemId]);

  function submit() {
    if (locked) return;
    const answer = (romaji ? toKana(value.toLowerCase()) : value).trim();
    const reason = rejectReason(value, answer, romaji);
    if (reason !== null) {
      setHint(reason || null);
      setShaking(true);
      return;
    }
    setHint(null);
    onSubmit(answer);
  }

  // Enter that confirms an IME conversion must never submit. Safari reports it as keyCode 229.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (event.nativeEvent.isComposing || event.keyCode === 229 || composing.current) return;
    if (locked) onContinue();
    else submit();
  }

  return (
    <form
      className="grid gap-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!composing.current) submit();
      }}
    >
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            id="answer"
            lang="ja"
            type="text"
            inputMode="text"
            enterKeyHint={locked ? 'next' : 'done'}
            autoFocus
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={100}
            readOnly={locked}
            aria-invalid={hint ? true : undefined}
            // The visible question labels the input: "泳ぐ … te-form (て形)".
            aria-labelledby="prompt-verb prompt-form"
            aria-describedby={
              [hint && 'answer-hint', romaji && 'answer-romaji'].filter(Boolean).join(' ') ||
              undefined
            }
            value={value}
            onChange={(event) => {
              const next = event.target.value;
              const isComposing = (event.nativeEvent as InputEvent).isComposing;
              setValue(
                romaji && !isComposing ? toKana(next.toLowerCase(), { IMEMode: true }) : next,
              );
              setHint(null);
            }}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={() => {
              composing.current = false;
            }}
            onKeyDown={handleKeyDown}
            onAnimationEnd={() => setShaking(false)}
            className={cn(
              'bg-card border-input focus-visible:border-ring focus-visible:ring-ring/50 h-16 w-full min-w-0 rounded-xl border px-4 text-2xl transition-colors outline-none read-only:cursor-default focus-visible:ring-[3px]',
              romaji && 'pr-20',
              shaking && 'motion-safe:animate-shake',
              hint &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30',
              status === 'correct' &&
                'border-success bg-success/10 focus-visible:border-success focus-visible:ring-success/30',
              status === 'wrong' &&
                'border-destructive bg-destructive/10 focus-visible:border-destructive focus-visible:ring-destructive/30',
            )}
          />
          {romaji && (
            <span
              id="answer-romaji"
              className="bg-muted text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md px-2 py-0.5 text-xs"
            >
              <span aria-hidden>a→あ</span>
              <span className="sr-only">Romaji is converted to kana</span>
            </span>
          )}
        </div>
        {continueLabel ? (
          <Button
            type="button"
            size="lg"
            className="h-16 min-w-28"
            disabled={continueDisabled}
            onClick={onContinue}
            onMouseDown={(event) => event.preventDefault()}
          >
            {continueLabel}
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            className="h-16 min-w-28"
            disabled={locked || !value.trim()}
            // Keep focus in the input so the mobile keyboard stays open.
            onMouseDown={(event) => event.preventDefault()}
          >
            Check
          </Button>
        )}
      </div>
      <p id="answer-hint" aria-live="polite" className="text-destructive text-sm empty:hidden">
        {hint}
      </p>
    </form>
  );
}
