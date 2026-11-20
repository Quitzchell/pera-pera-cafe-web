import { cn } from '@/lib/utils';

const MAX_SKIPS = 2;

export function StreakSkips({ left }: { left: number }) {
  const label = left === 0 ? 'No skips left' : `${left} ${left === 1 ? 'skip' : 'skips'} left`;

  return (
    <span
      className="inline-flex items-center gap-[3px]"
      role="img"
      aria-label={label}
      title={label}
    >
      {Array.from({ length: MAX_SKIPS }, (_, index) => (
        <span
          key={index}
          className={cn('size-2', index < left ? 'bg-primary' : 'bg-muted-foreground/30')}
        />
      ))}
    </span>
  );
}
