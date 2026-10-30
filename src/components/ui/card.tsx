import * as React from 'react';

import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('bg-card text-card-foreground rounded-xl border p-4 sm:p-6', className)}
      {...props}
    />
  );
}
