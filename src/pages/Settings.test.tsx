import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext, type AuthContextValue } from '@/auth/AuthContext';
import { Settings } from '@/pages/Settings';
import { learner, settings } from '@/test/fixtures';

function renderSettings() {
  const updateSettings = vi.fn(async () => settings);
  const value: AuthContextValue = {
    state: { status: 'signedIn', user: learner, settings },
    signIn: vi.fn(),
    signOut: vi.fn(),
    updateSettings,
    retry: vi.fn(),
  };
  render(
    <AuthContext value={value}>
      <Settings />
    </AuthContext>,
  );
  return { updateSettings };
}

describe('Settings forms', () => {
  it('groups forms per JLPT level and toggles a whole level', async () => {
    const user = userEvent.setup();
    const { updateSettings } = renderSettings();

    const n4 = screen.getByRole('group', { name: 'N4' });
    expect(within(n4).getByRole('checkbox', { name: /potential \(可能形\)/ })).not.toBeChecked();
    expect(within(screen.getByRole('group', { name: 'N5' })).getAllByRole('checkbox')).toHaveLength(
      7,
    );

    await user.click(screen.getByRole('button', { name: 'Enable all N4 forms' }));
    expect(
      within(n4)
        .getAllByRole('checkbox')
        .every((box) => (box as HTMLInputElement).checked),
    ).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Disable all N5 forms' }));
    await user.click(screen.getByRole('button', { name: 'Save settings' }));

    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        enabledForms: [
          'POTENTIAL',
          'PASSIVE',
          'CAUSATIVE',
          'VOLITIONAL',
          'CONDITIONAL_BA',
          'IMPERATIVE',
          'PROHIBITIVE',
        ],
      }),
    );
  });
});
