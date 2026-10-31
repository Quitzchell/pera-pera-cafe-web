import { describe, expect, it } from 'vitest';

import { advance, RETRY_GAP, type Card } from '@/lib/pile';

const card = (itemId: string, choices?: string[]): Card => ({ itemId, attempt: 0, choices });
const ids = (pile: Card[]) => pile.map((c) => `${c.itemId}${c.attempt ? `+${c.attempt}` : ''}`);

describe('advance', () => {
  it('drops a card answered correctly', () => {
    expect(ids(advance([card('a'), card('b')], true))).toEqual(['b']);
  });

  it(`puts a missed card back ${RETRY_GAP} cards later`, () => {
    const pile = ['a', 'b', 'c', 'd', 'e'].map((id) => card(id));
    expect(ids(advance(pile, false))).toEqual(['b', 'c', 'd', 'a+1', 'e']);
  });

  it('puts a missed card last when fewer cards are left', () => {
    expect(ids(advance([card('a'), card('b')], false))).toEqual(['b', 'a+1']);
    expect(ids(advance([card('a')], false))).toEqual(['a+1']);
  });

  it('keeps retrying until the card is right', () => {
    let pile = advance([card('a')], false);
    pile = advance(pile, false);
    expect(ids(pile)).toEqual(['a+2']);
    expect(advance(pile, true)).toEqual([]);
  });

  it('reorders exam choices for the retry', () => {
    const [retry] = advance([card('a', ['1', '2', '3'])], false, (list) => [...list].reverse());
    expect(retry.choices).toEqual(['3', '2', '1']);
  });
});
