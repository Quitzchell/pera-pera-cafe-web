import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Furigana } from '@/components/Furigana';

function rubies(word: string, reading: string) {
  const { container } = render(<Furigana word={word} reading={reading} show />);
  return Array.from(container.querySelectorAll('ruby'), (ruby) => ruby.textContent);
}

describe('Furigana', () => {
  it('puts readings on kanji only, not on okurigana', () => {
    expect(rubies('泳ぐ', 'およぐ')).toEqual(['泳(およ)']);
    expect(rubies('運動する', 'うんどうする')).toEqual(['運動(うんどう)']);
    expect(rubies('連れて来る', 'つれてくる')).toEqual(['連(つ)', '来(く)']);
  });

  it('renders kana-only verbs without ruby', () => {
    expect(rubies('もらう', 'もらう')).toEqual([]);
  });

  it('falls back to one ruby when the reading does not line up', () => {
    expect(rubies('今日', 'きょう')).toEqual(['今日(きょう)']);
    expect(rubies('泳ぐ', 'ちがう')).toEqual(['泳ぐ(ちがう)']);
  });
});
