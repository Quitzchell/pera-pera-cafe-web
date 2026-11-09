import { cn } from '@/lib/utils';

const MAX_SKIPS = 2;

export function StreakSkips({ left }: { left: number }) {
  const label = left === 0 ? 'No skips left' : `${left} ${left === 1 ? 'skip' : 'skips'} left`;

  return (
    <span
      className="ml-1 inline-flex items-center gap-1 align-middle"
      role="img"
      aria-label={label}
      title={label}
    >
      {Array.from({ length: MAX_SKIPS }, (_, index) => (
        <span
          key={index}
          className={cn('border-primary size-2 rounded-full border', index < left && 'bg-primary')}
        />
      ))}
    </span>
  );
}
