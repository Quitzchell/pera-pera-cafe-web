import { useActionState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { authApi } from '@/api';
import { ErrorMessage } from '@/components/ErrorState';
import { PublicLayout } from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const MIN_LENGTH = 12;
const MAX_LENGTH = 256;

interface SetPasswordProps {
  title: string;
  submitLabel: string;
  notice: string;
  save: (token: string, password: string) => Promise<void>;
}

function SetPassword({ title, submitLabel, notice, save }: SetPasswordProps) {
  const { token = '' } = useParams();
  const navigate = useNavigate();

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

  return (
    <PublicLayout title={title}>
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
    </PublicLayout>
  );
}

export function AcceptInvite() {
  return (
    <SetPassword
      title="Choose a password"
      submitLabel="Set password"
      notice="Your password is set. Sign in to start practising."
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
      save={authApi.resetPassword}
    />
  );
}
