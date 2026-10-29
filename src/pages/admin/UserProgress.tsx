import { Link, useParams } from 'react-router-dom';

import { adminApi } from '@/api';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { ProgressView } from '@/components/ProgressView';
import { useApiQuery } from '@/hooks/useApiQuery';

export function UserProgress() {
  const { userId = '' } = useParams();
  const users = useApiQuery(adminApi.users, 'users');
  const progress = useApiQuery(() => adminApi.userProgress(userId), userId);
  const user = users.data?.find((u) => u.id === userId);

  return (
    <div className="grid gap-6">
      <div>
        <Link to="/admin/users" className="text-primary text-sm underline underline-offset-4">
          ← Users
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">
          Progress{user ? ` · ${user.displayName}` : ''}
        </h1>
      </div>
      {progress.status === 'loading' && <Loading />}
      {progress.status === 'error' && (
        <ErrorState error={progress.error} onRetry={progress.reload} />
      )}
      {progress.status === 'success' && <ProgressView progress={progress.data} />}
    </div>
  );
}
