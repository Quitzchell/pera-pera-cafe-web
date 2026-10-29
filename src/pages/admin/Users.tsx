import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { adminApi } from '@/api';
import type { IssuedLink, User } from '@/api/types';
import { useSignedIn } from '@/auth/useAuth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CopyLink } from '@/components/CopyLink';
import { ErrorMessage, ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatDateTime, STATUS_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';

interface LinkNotice extends IssuedLink {
  userId: string;
  label: string;
}

function CreateUserForm({ onCreated }: { onCreated: (user: User, link: IssuedLink) => void }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const { user, link, expiresAt } = await adminApi.createUser(email.trim(), displayName.trim());
      onCreated(user, { link, expiresAt });
      setEmail('');
      setDisplayName('');
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <h2 className="text-lg font-semibold">Invite a learner</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="off"
            required
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
            required
          />
        </Field>
      </div>
      <ErrorMessage error={error} />
      <Button type="submit" className="justify-self-start" disabled={pending}>
        {pending ? 'Creating…' : 'Create user'}
      </Button>
    </form>
  );
}

const STATUS_TONE: Record<User['status'], string> = {
  ACTIVE: 'bg-success/15 text-success',
  INVITED: 'bg-accent text-accent-foreground',
  DISABLED: 'bg-muted text-muted-foreground',
};

export function Users() {
  const { user: me } = useSignedIn();
  const users = useApiQuery(adminApi.users, 'users');
  const [notice, setNotice] = useState<LinkNotice | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);

  if (users.status === 'loading') return <Loading />;
  if (users.status === 'error') return <ErrorState error={users.error} onRetry={users.reload} />;

  const list = users.data;
  const replace = (next: User) => users.setData(list.map((u) => (u.id === next.id ? next : u)));

  async function run(user: User, action: () => Promise<void>) {
    setBusyId(user.id);
    setActionError(null);
    try {
      await action();
    } catch (caught) {
      setActionError(caught);
    } finally {
      setBusyId(null);
    }
  }

  const toggleDisabled = (user: User) =>
    run(user, async () => {
      replace(await adminApi.updateUser(user.id, { disabled: user.status !== 'DISABLED' }));
    });

  const issueResetLink = (user: User) =>
    run(user, async () => {
      const link = await adminApi.resetLink(user.id);
      const label =
        user.status === 'INVITED'
          ? `New invite link for ${user.displayName}`
          : `Reset link for ${user.displayName}`;
      setNotice({ ...link, userId: user.id, label });
    });

  const confirmDelete = (user: User) =>
    run(user, async () => {
      await adminApi.deleteUser(user.id);
      users.setData(list.filter((u) => u.id !== user.id));
      if (notice?.userId === user.id) setNotice(null);
      setToDelete(null);
    });

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      <Card>
        <CreateUserForm
          onCreated={(user, link) => {
            users.setData([...list, user]);
            setNotice({ ...link, userId: user.id, label: `Invite link for ${user.displayName}` });
          }}
        />
      </Card>

      {notice && <CopyLink link={notice.link} expiresAt={notice.expiresAt} label={notice.label} />}
      <ErrorMessage error={actionError} />

      <ul className="grid gap-3">
        {list.map((user) => {
          const isMe = user.id === me.id;
          const busy = busyId === user.id;
          return (
            <li key={user.id} className="bg-card grid gap-3 rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {user.displayName}
                    {user.role === 'ADMIN' && (
                      <span className="text-muted-foreground ml-2 text-sm font-normal">Admin</span>
                    )}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">{user.email}</p>
                </div>
                <span
                  className={cn('rounded-full px-2.5 py-0.5 text-sm', STATUS_TONE[user.status])}
                >
                  {STATUS_LABELS[user.status]}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Last active: {user.lastActiveAt ? formatDateTime(user.lastActiveAt) : 'never'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/users/${user.id}/progress`}>Progress</Link>
                </Button>
                {user.status !== 'DISABLED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void issueResetLink(user)}
                  >
                    {user.status === 'INVITED' ? 'New invite link' : 'Reset link'}
                  </Button>
                )}
                {!isMe && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => void toggleDisabled(user)}
                    >
                      {user.status === 'DISABLED' ? 'Enable' : 'Disable'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={busy}
                      onClick={() => setToDelete(user)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.displayName ?? 'user'}?`}
        confirmLabel="Delete user"
        destructive
        pending={busyId !== null}
        onConfirm={() => toDelete && void confirmDelete(toDelete)}
        onCancel={() => setToDelete(null)}
      >
        This permanently removes {toDelete?.email} and all of their progress.
      </ConfirmDialog>
    </div>
  );
}
