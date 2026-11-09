import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StreakSkips } from '@/components/StreakSkips';

describe('StreakSkips', () => {
  it.each([
    [2, '2 skips left', 2],
    [1, '1 skip left', 1],
    [0, 'No skips left', 0],
  ])('with %i left reads "%s" and fills %i dots', (left, label, filled) => {
    render(<StreakSkips left={left} />);

    const dots = screen.getByRole('img', { name: label });
    expect(dots).toHaveAttribute('title', label);
    expect(dots.children).toHaveLength(2);
    expect(dots.querySelectorAll('.bg-primary')).toHaveLength(filled);
  });
});
