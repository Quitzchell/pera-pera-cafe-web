import { Navigate, Outlet, useParams } from 'react-router-dom';

import { SessionProvider } from '@/context/SessionProvider';

export function SessionRoute() {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  return (
    <SessionProvider sessionId={sessionId}>
      <Outlet />
    </SessionProvider>
  );
}
