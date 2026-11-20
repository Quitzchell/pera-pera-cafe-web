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
  const answered = expectedKana !== undefined;

  return (
    <div role="group" aria-label="Choices" className="grid border-t">
      {choices.map((choice, index) => {
        const isExpected = answered && choice === expectedKana;
        const isWrongPick = answered && choice === picked && !isExpected;
        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            onClick={() => onPick(choice)}
            aria-keyshortcuts={String(index + 1)}
            className={cn(
              'hover:bg-accent focus-visible:ring-ring/50 flex min-h-14 items-center gap-3.5 border-b py-2 text-left text-[22px] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-inset disabled:cursor-default disabled:hover:bg-transparent',
              isExpected && 'text-success',
              isWrongPick && 'text-destructive',
              answered && !isExpected && !isWrongPick && 'opacity-45',
            )}
          >
            <kbd className="text-muted-foreground w-3.5 shrink-0 font-sans text-[13px]">
              {index + 1}
            </kbd>
            <span lang="ja" className={cn('flex-1', isWrongPick && 'line-through')}>
              {choice}
            </span>
            {isExpected && <Check aria-label="correct answer" className="size-5" />}
            {isWrongPick && <X aria-label="your answer" className="size-5" />}
          </button>
        );
      })}
    </div>
  );
}
