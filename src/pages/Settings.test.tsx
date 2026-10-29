import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Settings as SettingsData } from '@/api/types';
import { AuthContext, type AuthContextValue } from '@/auth/AuthContext';
import { Settings } from '@/pages/Settings';
import { learner, settings } from '@/test/fixtures';

function renderSettings(initial: SettingsData = settings) {
  let saved = initial;
  const updateSettings = vi.fn(async (changes: Partial<SettingsData>) => {
    saved = { ...saved, ...changes };
    return saved;
  });
  const value: AuthContextValue = {
    state: { status: 'signedIn', user: learner, settings: initial },
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

describe('Settings', () => {
  it('saves each change straight away', async () => {
    const user = userEvent.setup();
    const { updateSettings } = renderSettings();

    await user.click(screen.getByRole('checkbox', { name: /romaji input/i }));
    expect(updateSettings).toHaveBeenLastCalledWith({ romajiInput: true });
    expect(await screen.findByRole('status')).toHaveTextContent('Saved');

    const roundSize = screen.getByLabelText('Questions per round');
    await user.clear(roundSize);
    await user.type(roundSize, '60');
    await user.tab();
    expect(roundSize).toHaveAccessibleDescription(/between 5 and 50/i);
    expect(updateSettings).toHaveBeenCalledTimes(1);

    await user.clear(roundSize);
    await user.type(roundSize, '10{Enter}');
    expect(updateSettings).toHaveBeenLastCalledWith({ roundSize: 10 });
  });

  it('switches the verbs of a level on and off from its tab', async () => {
    const user = userEvent.setup();
    const { updateSettings } = renderSettings();

    expect(screen.getByRole('heading', { name: 'Level' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /N5 verbs/ })).toBeChecked();

    await user.click(screen.getByRole('tab', { name: /N3/ }));
    const n3Verbs = screen.getByRole('checkbox', { name: /N3 verbs/ });
    expect(n3Verbs).not.toBeChecked();
    await user.click(n3Verbs);
    expect(updateSettings).toHaveBeenLastCalledWith({ jlptLevels: ['N5', 'N4', 'N3'] });
    expect(n3Verbs).toBeChecked();
  });

  it('keeps at least one verb level switched on', async () => {
    const user = userEvent.setup();
    const { updateSettings } = renderSettings({ ...settings, jlptLevels: ['N5'] });

    await user.click(screen.getByRole('checkbox', { name: /N5 verbs/ }));

    expect(updateSettings).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Keep at least one verb level switched on.',
    );
  });

  it('shows one JLPT level per tab and toggles a whole level', async () => {
    const user = userEvent.setup();
    const { updateSettings } = renderSettings();

    expect(screen.getByRole('tab', { name: 'N5', selected: true })).toBeInTheDocument();
    // The N5 verbs switch plus 7 forms.
    expect(within(screen.getByRole('tabpanel')).getAllByRole('checkbox')).toHaveLength(8);

    await user.click(screen.getByRole('tab', { name: /N4/ }));
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName(/N4/);
    await user.click(screen.getByRole('button', { name: 'Enable all N4 forms' }));

    expect(updateSettings).toHaveBeenLastCalledWith({
      enabledForms: [
        'TE',
        'PAST',
        'POTENTIAL',
        'PASSIVE',
        'CAUSATIVE',
        'VOLITIONAL',
        'CONDITIONAL_BA',
        'IMPERATIVE',
        'PROHIBITIVE',
      ],
    });
  });

  it('keeps at least one form switched on', async () => {
    const user = userEvent.setup();
    const { updateSettings } = renderSettings({ ...settings, enabledForms: ['TE'] });

    await user.click(screen.getByRole('checkbox', { name: /te-form/ }));

    expect(updateSettings).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Keep at least one form switched on.');
    expect(screen.getByRole('checkbox', { name: /te-form/ })).toBeChecked();
  });

  it('moves between level tabs with the arrow keys', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('tab', { name: /N5/ }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /N4/ })).toHaveFocus();
    expect(screen.getByRole('tab', { name: /N4/ })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('tab', { name: /N3/ })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName(/N3/);
  });
});
