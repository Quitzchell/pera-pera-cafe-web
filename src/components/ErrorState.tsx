import { Link } from 'react-router-dom';

import { ApiError } from '@/api';
import { Button } from '@/components/ui/button';
import { errorMessages } from '@/lib/errors';

export function ErrorMessage({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="border-destructive/40 text-destructive rounded-lg border p-3 text-sm"
    >
      {errorMessages(error).map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}

export function NotAllowedContent() {
  return (
    <div className="grid gap-3 py-10 text-center">
      <h1 className="text-2xl font-semibold">Not allowed</h1>
      <p className="text-muted-foreground">You don't have access to this page.</p>
      <p>
        <Link to="/" className="text-primary underline underline-offset-4">
          Go home
        </Link>
      </p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (error instanceof ApiError && error.status === 403) return <NotAllowedContent />;

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="grid gap-3 py-10 text-center">
        <h1 className="text-2xl font-semibold">Not found</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const canRetry = onRetry && (!(error instanceof ApiError) || error.isNetwork);
  return (
    <div className="grid justify-items-center gap-4 py-10 text-center">
      <ErrorMessage error={error} />
      {canRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
