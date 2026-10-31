import { NavLink, Outlet } from 'react-router-dom';

import { useSignedIn } from '@/auth/useAuth';
import { NotAllowedContent } from '@/components/ErrorState';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/verbs', label: 'Verbs' },
];

export function RequireAdmin() {
  const { user } = useSignedIn();
  if (user.role !== 'ADMIN') return <NotAllowedContent />;

  return (
    <div className="grid gap-6">
      <nav aria-label="Admin" className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1">
        {SECTIONS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'focus-visible:ring-ring/50 flex min-h-11 items-center justify-center rounded-md text-sm font-medium outline-none focus-visible:ring-[3px]',
                isActive
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
