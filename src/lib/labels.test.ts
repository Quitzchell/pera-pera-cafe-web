import { describe, expect, it } from 'vitest';

import { CONJUGATION_FORMS } from '@/api/types';
import { FORMS_BY_LEVEL } from '@/lib/labels';

describe('FORMS_BY_LEVEL', () => {
  it('puts every form in exactly one level', () => {
    const grouped = Object.values(FORMS_BY_LEVEL).flat();
    expect(grouped).toHaveLength(CONJUGATION_FORMS.length);
    expect(new Set(grouped)).toEqual(new Set(CONJUGATION_FORMS));
  });
});
