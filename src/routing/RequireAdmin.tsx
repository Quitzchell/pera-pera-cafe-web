import { Outlet } from 'react-router-dom';

import { useSignedIn } from '@/auth/useAuth';
import { NotAllowedContent } from '@/components/ErrorState';

export function RequireAdmin() {
  const { user } = useSignedIn();
  return user.role === 'ADMIN' ? <Outlet /> : <NotAllowedContent />;
}
