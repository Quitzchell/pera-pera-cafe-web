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
      <nav aria-label="Admin" className="flex gap-6 border-b">
        {SECTIONS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'focus-visible:ring-ring/50 -mb-px flex min-h-11 items-center border-b-[3px] font-medium outline-none focus-visible:ring-[3px]',
                isActive
                  ? 'text-foreground border-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent',
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
