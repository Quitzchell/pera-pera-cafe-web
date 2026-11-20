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
    inputRef.current?.focus({ preventScroll: true });
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
      className="grid grid-cols-[minmax(0,1fr)] gap-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!composing.current) submit();
      }}
    >
      <div
        onAnimationEnd={() => setShaking(false)}
        className={cn(
          'flex items-center gap-3 border-b-2 pb-1.5',
          hint || status === 'wrong' ? 'border-destructive' : 'border-primary',
          status === 'correct' && 'border-success',
          shaking && 'motion-safe:animate-shake',
        )}
      >
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
            [hint && 'answer-hint', romaji && !status && 'answer-romaji']
              .filter(Boolean)
              .join(' ') || undefined
          }
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            const isComposing = (event.nativeEvent as InputEvent).isComposing;
            setValue(romaji && !isComposing ? toKana(next.toLowerCase(), { IMEMode: true }) : next);
            setHint(null);
          }}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-11 min-w-0 flex-1 bg-transparent text-2xl outline-none read-only:cursor-default',
            status === 'correct' && 'text-success',
            status === 'wrong' && 'text-destructive line-through',
          )}
        />
        {status === 'correct' && (
          <span aria-hidden className="text-success text-2xl leading-none">
            ✓
          </span>
        )}
        {romaji && !status && (
          <span
            id="answer-romaji"
            className="bg-muted text-muted-foreground pointer-events-none px-2 py-0.5 text-xs"
          >
            <span aria-hidden>a→あ</span>
            <span className="sr-only">Romaji is converted to kana</span>
          </span>
        )}
        {continueLabel ? (
          <Button
            type="button"
            variant="ghost"
            className="min-w-14 justify-end no-underline"
            disabled={continueDisabled}
            onClick={onContinue}
            onMouseDown={(event) => event.preventDefault()}
          >
            {continueLabel}
          </Button>
        ) : (
          <Button
            type="submit"
            variant="ghost"
            className="min-w-14 justify-end no-underline"
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
