import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth, useSignedIn } from '@/auth/useAuth';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function NavItem({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'hover:bg-accent focus-visible:ring-ring/50 inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-[3px]',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )
      }
    >
      {children}
    </NavLink>
  );
}

export function AppLayout() {
  const { user } = useSignedIn();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="focus:bg-card sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-10 focus:rounded-lg focus:p-3"
      >
        Skip to content
      </a>
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-1 overflow-x-auto px-4 py-1">
          <NavLink to="/" className="mr-2 shrink-0 text-base font-semibold" aria-label="Home">
            <span lang="ja">ぺらぺら</span>
          </NavLink>
          <nav aria-label="Main" className="flex gap-1">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/progress">Progress</NavItem>
            <NavItem to="/settings">Settings</NavItem>
            {user.role === 'ADMIN' && (
              <>
                <NavItem to="/admin/users">Users</NavItem>
                <NavItem to="/admin/verbs">Verbs</NavItem>
              </>
            )}
          </nav>
          <Button
            variant="ghost"
            className="text-muted-foreground ml-auto"
            onClick={() => void signOut()}
          >
            Sign out
          </Button>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
