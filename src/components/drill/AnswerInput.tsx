import { useRef, useState, type KeyboardEvent } from 'react';
import { toKana } from 'wanakana';

import { Button } from '@/components/ui/button';

interface AnswerInputProps {
  disabled: boolean;
  romaji: boolean;
  onSubmit: (answer: string) => void;
}

export function AnswerInput({ disabled, romaji, onSubmit }: AnswerInputProps) {
  const [value, setValue] = useState('');
  const composing = useRef(false);

  function submit() {
    const answer = (romaji ? toKana(value.toLowerCase()) : value).trim();
    if (answer && !disabled) onSubmit(answer);
  }

  // Enter that confirms an IME conversion must never submit. Safari reports it as keyCode 229.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (event.nativeEvent.isComposing || event.keyCode === 229 || composing.current) return;
    submit();
  }

  return (
    <form
      className="grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!composing.current) submit();
      }}
    >
      <label htmlFor="answer" className="text-muted-foreground text-sm">
        Your answer{romaji ? ' (romaji is converted to kana)' : ''}
      </label>
      <div className="flex gap-2">
        <input
          id="answer"
          lang="ja"
          type="text"
          inputMode="text"
          enterKeyHint="done"
          autoFocus
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={100}
          disabled={disabled}
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            const isComposing = (event.nativeEvent as InputEvent).isComposing;
            setValue(romaji && !isComposing ? toKana(next.toLowerCase(), { IMEMode: true }) : next);
          }}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={handleKeyDown}
          className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-16 w-full min-w-0 rounded-xl border px-4 text-2xl outline-none focus-visible:ring-[3px] disabled:opacity-70"
        />
        <Button type="submit" size="lg" className="h-16" disabled={disabled || !value.trim()}>
          Check
        </Button>
      </div>
    </form>
  );
}
