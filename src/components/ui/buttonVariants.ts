import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 text-base font-semibold whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'border border-primary px-5 text-primary hover:bg-primary/10',
        destructive:
          'border border-destructive px-5 text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/20',
        outline: 'text-primary underline underline-offset-4 hover:bg-accent',
        secondary: 'text-primary underline underline-offset-4 hover:bg-accent',
        ghost: 'text-primary underline underline-offset-4 hover:bg-accent',
        link: 'text-primary underline underline-offset-4',
      },
      size: {
        default: 'h-11',
        xs: "h-6 gap-1 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-11 gap-1.5',
        lg: 'h-14 text-lg',
        icon: 'size-11',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
