import { createContext } from 'react';

import type { Settings, User } from '@/api/types';

export type AuthState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'signedOut' }
  | { status: 'signedIn'; user: User; settings: Settings };

export interface AuthContextValue {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateSettings: (changes: Partial<Settings>) => Promise<Settings>;
  retry: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
