import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { RuleGroupProgress } from '@/api/types';
import { BoxDistribution } from '@/components/BoxDistribution';

const row = (box: number): RuleGroupProgress => ({
  form: 'TE',
  ruleGroup: 'GODAN_KU',
  attemptCount: 1,
  correctCount: 1,
  accuracy: 1,
  box,
  dueAt: '2026-10-29T00:00:00.000Z',
  lastPracticedAt: '2026-10-29T00:00:00.000Z',
});

describe('BoxDistribution', () => {
  it('counts rule groups per box', () => {
    render(<BoxDistribution ruleGroups={[row(0), row(2), row(2), row(5)]} />);

    expect(screen.getByLabelText('Box 0: 1 rule group')).toBeInTheDocument();
    expect(screen.getByLabelText('Box 1: 0 rule groups')).toBeInTheDocument();
    expect(screen.getByLabelText('Box 2: 2 rule groups')).toBeInTheDocument();
    expect(screen.getByLabelText('Box 5: 1 rule group')).toBeInTheDocument();
  });
});
