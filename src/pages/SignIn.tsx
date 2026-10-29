import { useActionState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';
import { ErrorMessage } from '@/components/ErrorState';
import { PublicLayout } from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { returnPath } from '@/routing/returnTo';

export function SignIn() {
  const { state, signIn } = useAuth();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;

  const [error, submit, pending] = useActionState(async (_: unknown, form: FormData) => {
    try {
      await signIn(String(form.get('email')), String(form.get('password')));
      return null;
    } catch (caught) {
      return caught;
    }
  }, null);

  if (state.status === 'signedIn') return <Navigate to={returnPath(location.state)} replace />;

  return (
    <PublicLayout title="Sign in">
      <form action={submit} className="grid gap-4">
        {notice && (
          <p role="status" className="bg-accent text-accent-foreground rounded-lg p-3 text-sm">
            {notice}
          </p>
        )}
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" required autoFocus />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <ErrorMessage error={error} />
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </PublicLayout>
  );
}
