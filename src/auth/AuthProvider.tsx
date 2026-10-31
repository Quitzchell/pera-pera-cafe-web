import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ApiError, authApi, settingsApi } from '@/api';
import { refreshCsrfToken, setCsrfToken, setUnauthorizedHandler } from '@/api/client';
import type { Settings } from '@/api/types';
import { AuthContext, type AuthState } from '@/auth/AuthContext';

function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

async function loadSettings(): Promise<Settings> {
  const settings = await settingsApi.get();
  const timeZone = browserTimeZone();
  if (timeZone && timeZone !== settings.timeZone) {
    try {
      return await settingsApi.update({ timeZone });
    } catch {
      return settings;
    }
  }
  return settings;
}

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setCsrfToken(null);
      setState({ status: 'signedOut' });
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function restore() {
      try {
        const user = await authApi.me();
        await refreshCsrfToken();
        const settings = await loadSettings();
        if (!ignore) setState({ status: 'signedIn', user, settings });
      } catch (error) {
        if (ignore) return;
        if (error instanceof ApiError && error.status === 401) setState({ status: 'signedOut' });
        else setState({ status: 'error', message: errorMessage(error) });
      }
    }

    void restore();
    return () => {
      ignore = true;
    };
  }, [attempt]);

  const signIn = useCallback(async (username: string, password: string) => {
    const { user, csrfToken } = await authApi.login(username, password);
    setCsrfToken(csrfToken);
    const settings = await loadSettings();
    setState({ status: 'signedIn', user, settings });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setCsrfToken(null);
      setState({ status: 'signedOut' });
    }
  }, []);

  const updateSettings = useCallback(async (changes: Partial<Settings>) => {
    const settings = await settingsApi.update(changes);
    setState((current) => (current.status === 'signedIn' ? { ...current, settings } : current));
    return settings;
  }, []);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ state, signIn, signOut, updateSettings, retry }),
    [state, signIn, signOut, updateSettings, retry],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
