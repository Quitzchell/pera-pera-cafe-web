import { ChartColumn, House, Settings, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth, useSignedIn } from '@/auth/useAuth';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavTarget {
  to: string;
  label: string;
  icon: LucideIcon;
}

function useNavTargets(): NavTarget[] {
  const { user } = useSignedIn();
  return [
    { to: '/', label: 'Home', icon: House },
    { to: '/progress', label: 'Progress', icon: ChartColumn },
    { to: '/settings', label: 'Settings', icon: Settings },
    ...(user.role === 'ADMIN' ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ];
}

function TopNav() {
  const { signOut } = useAuth();

  return (
    <header className="hidden border-b sm:block">
      <div className="mx-auto flex max-w-3xl items-center gap-1 px-4 py-1">
        <NavLink to="/" className="mr-2 shrink-0 font-semibold" aria-label="Pera Pera Cafe">
          <span lang="ja">ぺらぺら</span>
        </NavLink>
        <nav aria-label="Main" className="flex gap-1">
          {useNavTargets().map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'hover:bg-accent focus-visible:ring-ring/50 inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium outline-none focus-visible:ring-[3px]',
                  isActive ? 'text-foreground bg-accent' : 'text-muted-foreground',
                )
              }
            >
              {label}
            </NavLink>
          ))}
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
  );
}

function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="bg-background/95 fixed inset-x-0 bottom-0 z-10 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <div className="mx-auto flex max-w-md">
        {useNavTargets().map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'focus-visible:ring-ring/50 flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-inset',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <Icon aria-hidden className="size-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="focus:bg-card sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20 focus:rounded-lg focus:p-3"
      >
        Skip to content
      </a>
      <TopNav />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-24 sm:py-10">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}

/** Full-screen layout without navigation, for drilling. */
export function FocusLayout() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pt-3 pb-6">
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </main>
  );
}
