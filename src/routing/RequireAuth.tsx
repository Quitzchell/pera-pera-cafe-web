import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';

export function RequireAuth() {
  const { state, retry } = useAuth();
  const location = useLocation();

  if (state.status === 'loading') return <Loading />;

  if (state.status === 'error') {
    return (
      <main className="mx-auto grid max-w-md justify-items-center gap-4 px-4 py-16 text-center">
        <p role="alert">{state.message}</p>
        <Button variant="outline" onClick={retry}>
          Try again
        </Button>
      </main>
    );
  }

  if (state.status === 'signedOut') {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
