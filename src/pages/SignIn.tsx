import { useActionState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { ApiError } from '@/api';
import { useAuth } from '@/auth/useAuth';
import { ErrorMessage } from '@/components/ErrorState';
import { PublicLayout } from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { returnPath } from '@/routing/returnTo';

// The API answers a wrong password and a wait after repeated failures the same way.
const WAIT_HINT_AFTER = 3;

interface Attempt {
  error: unknown;
  failures: number;
}

export function SignIn() {
  const { state, signIn } = useAuth();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;

  const [{ error, failures }, submit, pending] = useActionState(
    async ({ failures }: Attempt, form: FormData): Promise<Attempt> => {
      try {
        await signIn(String(form.get('username')).trim(), String(form.get('password')));
        return { error: null, failures: 0 };
      } catch (caught) {
        const rejected = caught instanceof ApiError && caught.status === 401;
        return { error: caught, failures: rejected ? failures + 1 : failures };
      }
    },
    { error: null, failures: 0 },
  );

  if (state.status === 'signedIn') return <Navigate to={returnPath(location.state)} replace />;

  return (
    <PublicLayout title="Sign in">
      <form action={submit} className="grid gap-4">
        {notice && (
          <p role="status" className="bg-accent text-accent-foreground rounded-lg p-3 text-sm">
            {notice}
          </p>
        )}
        <Field label="Username">
          <Input
            name="username"
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            required
            autoFocus
          />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <ErrorMessage error={error} />
        {failures >= WAIT_HINT_AFTER && (
          <p className="text-muted-foreground text-sm">
            If you have tried several times, wait a few minutes before trying again.
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </PublicLayout>
  );
}
