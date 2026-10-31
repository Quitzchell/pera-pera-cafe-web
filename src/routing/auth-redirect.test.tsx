import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { setCsrfToken } from '@/api/client';
import { emptyProgress, learner, settings } from '@/test/fixtures';
import { apiError, json, mockFetch } from '@/test/mockFetch';
import { renderApp } from '@/test/renderApp';

afterEach(() => {
  vi.unstubAllGlobals();
  setCsrfToken(null);
});

const signedInHandlers = {
  'GET /auth/csrf': () => json({ csrfToken: 'csrf-1' }),
  'GET /me/settings': () => json(settings),
};

describe('401 handling', () => {
  it('sends a signed-out visitor to sign in, then back to the page they wanted', async () => {
    let signedIn = false;
    mockFetch({
      ...signedInHandlers,
      'GET /auth/me': () => apiError(401, 'Not signed in'),
      'POST /auth/login': () => {
        signedIn = true;
        return json({ user: learner, csrfToken: 'csrf-1' });
      },
      'GET /progress': () => (signedIn ? json(emptyProgress) : apiError(401, 'Not signed in')),
    });
    const router = renderApp('/progress');
    const user = userEvent.setup();

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/sign-in');

    await user.type(screen.getByLabelText('Username'), learner.username);
    await user.type(screen.getByLabelText('Password'), 'correct horse battery');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/progress');
  });

  it('signs out and redirects when a request answers 401 mid-session', async () => {
    mockFetch({
      ...signedInHandlers,
      'GET /auth/me': () => json(learner),
      'GET /progress': () => apiError(401, 'Session ended'),
    });
    const router = renderApp('/progress');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/sign-in');
    expect(router.state.location.state).toMatchObject({ from: { pathname: '/progress' } });
  });

  it('shows a wrong password as a message without redirecting', async () => {
    mockFetch({
      'GET /auth/me': () => apiError(401, 'Not signed in'),
      'POST /auth/login': () => apiError(401, 'Invalid username or password'),
    });
    renderApp('/sign-in');
    const user = userEvent.setup();

    async function attempt() {
      await user.type(await screen.findByLabelText('Username'), learner.username);
      await user.type(screen.getByLabelText('Password'), 'wrong password!');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));
      await screen.findByRole('button', { name: 'Sign in' });
    }

    await attempt();
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password');
    expect(screen.queryByText(/wait a few minutes/)).not.toBeInTheDocument();

    await attempt();
    await attempt();
    expect(await screen.findByText(/wait a few minutes/)).toBeInTheDocument();
  });

  it('shows "not allowed" to learners on admin routes', async () => {
    mockFetch({ ...signedInHandlers, 'GET /auth/me': () => json(learner) });
    renderApp('/admin/users');

    expect(await screen.findByRole('heading', { name: 'Not allowed' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });
});
