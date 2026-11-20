import * as React from 'react';

import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-ring/50 aria-invalid:border-destructive h-11 w-full min-w-0 border-b bg-transparent px-0 text-base transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'border-input focus-visible:border-primary focus-visible:ring-ring/50 h-11 w-full border-b bg-transparent px-0 text-base outline-none focus-visible:ring-[3px]',
        className,
      )}
      {...props}
    />
  );
}

/** Square 20px box, primary when checked; native `accent-color` would round the corners. */
export const checkboxClass =
  "border-muted-foreground checked:bg-primary checked:border-primary focus-visible:ring-ring/50 relative size-5 shrink-0 appearance-none border-2 outline-none after:absolute after:top-0 after:left-[5px] after:hidden after:h-2.5 after:w-[5px] after:rotate-45 after:border-r-2 after:border-b-2 after:border-primary-foreground after:content-[''] checked:after:block focus-visible:ring-[3px]";
