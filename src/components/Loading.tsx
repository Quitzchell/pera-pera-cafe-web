export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="text-muted-foreground flex min-h-40 items-center justify-center">
      <span className="mr-3 size-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
      {label}
    </div>
  );
}
