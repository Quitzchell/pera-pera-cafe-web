import { ChevronDown, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { adminApi } from '@/api';
import type { IssuedLink, User } from '@/api/types';
import { useSignedIn } from '@/auth/useAuth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CopyLink } from '@/components/CopyLink';
import { Dialog } from '@/components/Dialog';
import { ErrorMessage, ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatDateTime, STATUS_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';

interface LinkNotice extends IssuedLink {
  userId: string;
  label: string;
}

const STATUS_TONE: Record<User['status'], string> = {
  ACTIVE: 'bg-success/15 text-success',
  INVITED: 'bg-accent text-accent-foreground',
  DISABLED: 'bg-muted text-muted-foreground',
};

function InviteDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (user: User) => void;
}) {
  const [username, setUsername] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [created, setCreated] = useState<{ user: User; link: IssuedLink } | null>(null);

  function close() {
    setUsername('');
    setError(null);
    setCreated(null);
    onClose();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const { user, link, expiresAt } = await adminApi.createUser(username.trim());
      setCreated({ user, link: { link, expiresAt } });
      onCreated(user);
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} title="Invite a learner" onClose={close}>
      {created ? (
        <div className="grid gap-4">
          <p className="text-muted-foreground text-sm">
            Send this link to {created.user.username} yourself. The app sends no e-mail.
          </p>
          <CopyLink {...created.link} label={`Invite link for ${created.user.username}`} />
          <Button className="justify-self-end" onClick={close}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Username" hint="3–30 characters: a–z, 0–9, _ or -. Used to sign in.">
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value.toLowerCase())}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              minLength={3}
              maxLength={30}
              pattern="[a-z0-9_\-]{3,30}"
              required
              autoFocus
            />
          </Field>
          <ErrorMessage error={error} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create user'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

export function Users() {
  const { user: me } = useSignedIn();
  const users = useApiQuery(adminApi.users, 'users');
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState<LinkNotice | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
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
          ? `New invite link for ${user.username}`
          : `Reset link for ${user.username}`;
      setNotice({ ...link, userId: user.id, label });
    });

  const confirmDelete = (user: User) =>
    run(user, async () => {
      await adminApi.deleteUser(user.id);
      users.setData(list.filter((u) => u.id !== user.id));
      setToDelete(null);
    });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button onClick={() => setInviting(true)}>
          <UserPlus aria-hidden /> Invite learner
        </Button>
      </div>

      <ErrorMessage error={actionError} />

      <ul className="grid gap-3">
        {list.map((user) => {
          const isMe = user.id === me.id;
          const busy = busyId === user.id;
          const open = expanded === user.id;
          const actionsId = `user-actions-${user.id}`;
          return (
            <li key={user.id} className="bg-card grid gap-3 rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {user.username}
                    {user.role === 'ADMIN' && (
                      <span className="text-muted-foreground ml-2 text-sm font-normal">Admin</span>
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Last active: {user.lastActiveAt ? formatDateTime(user.lastActiveAt) : 'never'}
                  </p>
                </div>
                <span
                  className={cn('rounded-full px-2.5 py-0.5 text-sm', STATUS_TONE[user.status])}
                >
                  {STATUS_LABELS[user.status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/users/${user.id}/progress`}>Progress</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-expanded={open}
                  aria-controls={actionsId}
                  onClick={() => setExpanded(open ? null : user.id)}
                >
                  More
                  <ChevronDown
                    aria-hidden
                    className={cn('transition-transform', open && 'rotate-180')}
                  />
                </Button>
              </div>
              <div id={actionsId} hidden={!open} className="flex flex-wrap gap-2 border-t pt-3">
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
                {isMe ? (
                  <p className="text-muted-foreground self-center text-sm">
                    You can't disable or delete yourself.
                  </p>
                ) : (
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

      <InviteDialog
        open={inviting}
        onClose={() => setInviting(false)}
        onCreated={(user) => users.setData([...list, user])}
      />

      <Dialog open={notice !== null} title={notice?.label ?? ''} onClose={() => setNotice(null)}>
        {notice && (
          <div className="grid gap-4">
            <CopyLink link={notice.link} expiresAt={notice.expiresAt} label={notice.label} />
            <Button className="justify-self-end" onClick={() => setNotice(null)}>
              Done
            </Button>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.username ?? 'user'}?`}
        confirmLabel="Delete user"
        destructive
        pending={busyId !== null}
        onConfirm={() => toDelete && void confirmDelete(toDelete)}
        onCancel={() => setToDelete(null)}
      >
        This permanently removes {toDelete?.username} and all of their progress.
      </ConfirmDialog>
    </div>
  );
}
