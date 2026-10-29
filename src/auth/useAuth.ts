import { use } from 'react';

import { AuthContext } from '@/auth/AuthContext';

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

export function useSignedIn() {
  const { state, updateSettings } = useAuth();
  if (state.status !== 'signedIn') throw new Error('useSignedIn needs a signed-in user');
  return { user: state.user, settings: state.settings, updateSettings };
}
