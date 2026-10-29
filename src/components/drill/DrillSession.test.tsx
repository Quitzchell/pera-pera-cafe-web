import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { drillApi } from '@/api';
import type { Round } from '@/api/types';
import { DrillSession } from '@/components/drill/DrillSession';
import { contrastRound, correctTe, examRound, standardRound } from '@/test/fixtures';

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>();
  return { ...actual, drillApi: { ...actual.drillApi, answer: vi.fn() } };
});

const answer = vi.mocked(drillApi.answer);

function renderSession(
  round: Round,
  props: { showFurigana?: boolean; romajiInput?: boolean } = {},
) {
  const onComplete = vi.fn();
  render(
    <DrillSession
      round={round}
      showFurigana={props.showFurigana ?? true}
      romajiInput={props.romajiInput ?? false}
      onComplete={onComplete}
    />,
  );
  return { onComplete };
}

beforeEach(() => {
  answer.mockReset();
  answer.mockResolvedValue(correctTe);
});

describe('DrillSession', () => {
  it('submits, shows feedback and moves on without leaving the input', async () => {
    const user = userEvent.setup();
    const { onComplete } = renderSession(standardRound);

    const input = screen.getByLabelText(/your answer/i);
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('lang', 'ja');
    expect(screen.getByRole('heading', { name: 'te-form (て形)' })).toBeInTheDocument();

    await user.type(input, 'およいで{Enter}');

    expect(answer).toHaveBeenCalledWith('r1', 'i1', 'およいで');
    expect(await screen.findByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('泳いで')).toBeInTheDocument();
    expect(screen.getByText('ぐ → いで (泳ぐ → 泳いで)')).toBeInTheDocument();
    expect(input).toHaveAttribute('readonly');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

    // Focus stays in the input, so the mobile keyboard stays open; Enter continues.
    expect(input).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('heading', { name: 'passive (受身形)' })).toBeInTheDocument();
    expect(screen.getByLabelText(/your answer/i)).toBe(input);
    expect(input).toHaveFocus();
    expect(input).not.toHaveAttribute('readonly');
    expect(input).toHaveValue('');

    answer.mockResolvedValueOnce({
      isCorrect: false,
      expected: { kanji: '見られる', kana: 'みられる' },
      ruleGroup: 'ICHIDAN',
      ruleHint: 'る → られる',
      note: 'Passive and potential look the same for ichidan verbs.',
    });
    await user.type(input, 'みれる{Enter}');
    expect(await screen.findByText('Not quite')).toBeInTheDocument();
    expect(screen.getByText(/look the same for ichidan/)).toBeInTheDocument();

    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000);
    await user.click(screen.getByRole('button', { name: 'See results' }));
    expect(onComplete).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });

  it('ignores Enter for a moment after a wrong answer', async () => {
    const user = userEvent.setup();
    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    answer.mockResolvedValueOnce({ ...correctTe, isCorrect: false });
    renderSession(standardRound);

    await user.type(screen.getByLabelText(/your answer/i), 'およんで{Enter}');
    expect(await screen.findByText('Not quite')).toBeInTheDocument();

    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'te-form (て形)' })).toBeInTheDocument();

    now += 700;
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'passive (受身形)' })).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it.each([
    ['oyoide', /type the answer in japanese/i],
    ['オヨイデ', /not katakana/i],
  ])('shakes instead of submitting %s', async (typed, hint) => {
    const user = userEvent.setup();
    renderSession(standardRound);
    const input = screen.getByLabelText(/your answer/i);

    await user.type(input, `${typed}{Enter}`);

    expect(answer).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(hint);
    expect(input).not.toHaveAttribute('readonly');

    await user.clear(input);
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('never submits on Enter while the IME is composing', async () => {
    renderSession(standardRound);
    const input = screen.getByLabelText(/your answer/i);

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '泳いで' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.compositionEnd(input);
    // Safari fires compositionend before the confirming keydown, flagged with keyCode 229.
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });

    expect(answer).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(answer).toHaveBeenCalledWith('r1', 'i1', '泳いで');
    expect(await screen.findByText('Correct')).toBeInTheDocument();
  });

  it('converts romaji to kana when enabled', async () => {
    const user = userEvent.setup();
    renderSession(standardRound, { romajiInput: true });

    await user.type(screen.getByLabelText(/your answer/i), 'oyoide');
    expect(screen.getByLabelText(/your answer/i)).toHaveValue('およいで');

    await user.keyboard('{Enter}');
    expect(answer).toHaveBeenCalledWith('r1', 'i1', 'およいで');
  });

  it('shows furigana only when enabled', () => {
    const { unmount } = render(
      <DrillSession round={standardRound} showFurigana romajiInput={false} onComplete={vi.fn()} />,
    );
    expect(document.querySelector('ruby rt')).toHaveTextContent(/^およ$/);
    unmount();

    renderSession(standardRound, { showFurigana: false });
    expect(document.querySelector('rt')).toBeNull();
    expect(screen.getByText('泳ぐ')).toBeInTheDocument();
  });

  it('picks exam choices with the 1–4 keys', async () => {
    const user = userEvent.setup();
    renderSession(examRound);

    expect(screen.queryByLabelText(/your answer/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /およ/ })).toHaveLength(4);

    await user.keyboard('2');
    expect(answer).toHaveBeenCalledWith('r3', 'e1', 'およいで');
    expect(await screen.findByText('Correct')).toBeInTheDocument();

    await user.keyboard('3');
    expect(answer).toHaveBeenCalledOnce();

    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'past (た形)' })).toBeInTheDocument();

    await user.keyboard('4');
    expect(answer).toHaveBeenCalledOnce();
    await user.keyboard('3');
    expect(answer).toHaveBeenLastCalledWith('r3', 'e2', 'およった');
  });

  it('labels the second item of a contrast pair', async () => {
    const user = userEvent.setup();
    renderSession(contrastRound);

    expect(screen.queryByText(/compare with/i)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/your answer/i), 'みられる{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Next' }));

    expect(screen.getByText('Compare with potential (可能形)')).toBeInTheDocument();
  });
});
