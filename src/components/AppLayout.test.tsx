import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { FocusLayout } from '@/components/AppLayout';

afterEach(() => vi.unstubAllGlobals());

it('keeps the drill screen on the visible area while the keyboard is open', () => {
  const listeners = new Map<string, () => void>();
  const viewport = {
    offsetTop: 0,
    height: 600,
    scale: 1,
    addEventListener: (type: string, listener: () => void) => listeners.set(type, listener),
    removeEventListener: (type: string) => listeners.delete(type),
  };
  vi.stubGlobal('visualViewport', viewport);
  const router = createMemoryRouter([{ path: '/', Component: FocusLayout }]);
  const { unmount } = render(<RouterProvider router={router} />);
  const main = screen.getByRole('main');

  expect(main.style.height).toBe('600px');
  expect(document.body.style.overflow).toBe('hidden');

  Object.assign(viewport, { offsetTop: 75, height: 330 });
  listeners.get('scroll')?.();
  expect(main.style.top).toBe('75px');
  expect(main.style.height).toBe('330px');

  Object.assign(viewport, { scale: 2, height: 100 });
  listeners.get('resize')?.();
  expect(main.style.height).toBe('330px');

  unmount();
  expect(listeners.size).toBe(0);
  expect(document.body.style.overflow).toBe('');
});
