import type { RouteObject } from 'react-router-dom';

import { AppLayout } from '@/components/AppLayout';
import { Loading } from '@/components/Loading';
import { NotFound } from '@/pages/NotFound';
import { RequireAdmin } from '@/routing/RequireAdmin';
import { RequireAuth } from '@/routing/RequireAuth';

export const routes: RouteObject[] = [
  {
    HydrateFallback: Loading,
    children: [
      {
        path: 'sign-in',
        lazy: () => import('@/pages/SignIn').then((m) => ({ Component: m.SignIn })),
      },
      {
        path: 'invite/:token',
        lazy: () => import('@/pages/SetPassword').then((m) => ({ Component: m.AcceptInvite })),
      },
      {
        path: 'reset/:token',
        lazy: () => import('@/pages/SetPassword').then((m) => ({ Component: m.ResetPassword })),
      },
      {
        Component: RequireAuth,
        children: [
          {
            Component: AppLayout,
            children: [
              {
                index: true,
                lazy: () => import('@/pages/Home').then((m) => ({ Component: m.Home })),
              },
              {
                path: 'drill/:roundId',
                lazy: () => import('@/pages/drill/Drill').then((m) => ({ Component: m.Drill })),
              },
              {
                path: 'rounds/:roundId/summary',
                lazy: () =>
                  import('@/pages/drill/RoundSummary').then((m) => ({ Component: m.RoundSummary })),
              },
              {
                path: 'progress',
                lazy: () => import('@/pages/Progress').then((m) => ({ Component: m.Progress })),
              },
              {
                path: 'settings',
                lazy: () => import('@/pages/Settings').then((m) => ({ Component: m.Settings })),
              },
              {
                path: 'admin',
                Component: RequireAdmin,
                children: [
                  {
                    path: 'users',
                    lazy: () => import('@/pages/admin/Users').then((m) => ({ Component: m.Users })),
                  },
                  {
                    path: 'users/:userId/progress',
                    lazy: () =>
                      import('@/pages/admin/UserProgress').then((m) => ({
                        Component: m.UserProgress,
                      })),
                  },
                  {
                    path: 'verbs',
                    lazy: () => import('@/pages/admin/Verbs').then((m) => ({ Component: m.Verbs })),
                  },
                ],
              },
              { path: '*', Component: NotFound },
            ],
          },
        ],
      },
    ],
  },
];
