import { cn } from '@/lib/utils';

const MAX_SKIPS = 2;

export function StreakSkips({ left }: { left: number }) {
  const label = left === 0 ? 'No skips left' : `${left} ${left === 1 ? 'skip' : 'skips'} left`;

  return (
    <span
      className="bg-muted inline-flex items-center gap-1 rounded-full px-2 py-1"
      role="img"
      aria-label={label}
      title={label}
    >
      {Array.from({ length: MAX_SKIPS }, (_, index) => (
        <span
          key={index}
          className={cn(
            'size-1.5 rounded-full',
            index < left ? 'bg-primary' : 'bg-muted-foreground/50',
          )}
        />
      ))}
    </span>
  );
}
