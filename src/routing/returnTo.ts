import type { Location } from 'react-router-dom';

export function returnPath(state: unknown) {
  const from = (state as { from?: Partial<Location> } | null)?.from;
  if (!from?.pathname || from.pathname === '/sign-in') return '/';
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
}
