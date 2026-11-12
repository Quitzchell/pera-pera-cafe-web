import { useActionState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { ApiError, authApi } from '@/api';
import { ErrorMessage, ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { PublicLayout } from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useApiQuery } from '@/hooks/useApiQuery';

const MIN_LENGTH = 12;
const MAX_LENGTH = 256;
// Stable across renders: Navigate re-navigates whenever its state changes identity.
const USED_LINK = {
  notice: 'This link has already been used or has expired. Ask for a new one.',
};

interface SetPasswordProps {
  title: string;
  submitLabel: string;
  notice: string;
  check: (token: string) => Promise<void>;
  save: (token: string, password: string) => Promise<void>;
}

function SetPassword({ title, submitLabel, notice, check, save }: SetPasswordProps) {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const link = useApiQuery(() => check(token), token);

  const [error, submit, pending] = useActionState(async (_: unknown, form: FormData) => {
    const password = String(form.get('password'));
    if (password !== String(form.get('confirmation'))) {
      return "The passwords don't match.";
    }
    try {
      await save(token, password);
      navigate('/sign-in', { replace: true, state: { notice } });
      return null;
    } catch (caught) {
      return caught;
    }
  }, null);

  if (link.status === 'loading') return <Loading />;
  if (link.error instanceof ApiError && link.error.status === 400) {
    return <Navigate to="/sign-in" replace state={USED_LINK} />;
  }

  return (
    <PublicLayout title={title}>
      {link.status === 'error' ? (
        <ErrorState error={link.error} onRetry={link.reload} />
      ) : (
        <form action={submit} className="grid gap-4">
          <Field label="New password" hint={`At least ${MIN_LENGTH} characters.`}>
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={MIN_LENGTH}
              maxLength={MAX_LENGTH}
              required
              autoFocus
            />
          </Field>
          <Field label="Confirm password">
            <Input
              name="confirmation"
              type="password"
              autoComplete="new-password"
              minLength={MIN_LENGTH}
              maxLength={MAX_LENGTH}
              required
            />
          </Field>
          <ErrorMessage error={error} />
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? 'Saving…' : submitLabel}
          </Button>
          <Link
            to="/sign-in"
            className="text-primary text-center text-sm underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </form>
      )}
    </PublicLayout>
  );
}

export function AcceptInvite() {
  return (
    <SetPassword
      title="Choose a password"
      submitLabel="Set password"
      notice="Your password is set. Sign in to start practising."
      check={authApi.checkInvite}
      save={authApi.acceptInvite}
    />
  );
}

export function ResetPassword() {
  return (
    <SetPassword
      title="Reset your password"
      submitLabel="Reset password"
      notice="Your password has been reset. Sign in with your new password."
      check={authApi.checkReset}
      save={authApi.resetPassword}
    />
  );
}
