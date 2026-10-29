import { Check, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ExamChoicesProps {
  choices: string[];
  disabled: boolean;
  picked?: string;
  expectedKana?: string;
  onPick: (choice: string) => void;
}

export function ExamChoices({ choices, disabled, picked, expectedKana, onPick }: ExamChoicesProps) {
  return (
    <div role="group" aria-label="Choices" className="grid gap-3 sm:grid-cols-2">
      {choices.map((choice, index) => {
        const isExpected = expectedKana !== undefined && choice === expectedKana;
        const isWrongPick = expectedKana !== undefined && choice === picked && !isExpected;
        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            onClick={() => onPick(choice)}
            aria-keyshortcuts={String(index + 1)}
            className={cn(
              'bg-card hover:bg-accent focus-visible:ring-ring/50 disabled:hover:bg-card flex min-h-16 items-center gap-3 rounded-xl border px-4 text-left text-2xl transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-default',
              isExpected && 'border-success ring-success/40 ring-2',
              isWrongPick && 'border-destructive ring-destructive/40 ring-2',
            )}
          >
            <kbd className="text-muted-foreground grid size-7 shrink-0 place-items-center rounded-md border text-sm">
              {index + 1}
            </kbd>
            <span lang="ja" className="flex-1">
              {choice}
            </span>
            {isExpected && <Check aria-label="correct answer" className="text-success" />}
            {isWrongPick && <X aria-label="your answer" className="text-destructive" />}
          </button>
        );
      })}
    </div>
  );
}
