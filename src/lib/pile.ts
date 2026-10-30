import type { Round } from '@/api/types';

/** One showing of a round item. attempt 0 is the scored try; later attempts are retries. */
export interface Card {
  itemId: string;
  attempt: number;
  choices?: string[];
}

/** A missed card comes back this many cards later (or last, if fewer are left). */
export const RETRY_GAP = 3;

export function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function initialPile(round: Round): Card[] {
  return round.items.map((item) => ({ itemId: item.id, attempt: 0, choices: item.choices }));
}

/** Takes the top card off the pile; a missed card goes back in for another try. */
export function advance(pile: Card[], correct: boolean, reorder = shuffle<string>): Card[] {
  const [card, ...rest] = pile;
  if (correct) return rest;
  const retry: Card = {
    ...card,
    attempt: card.attempt + 1,
    choices: card.choices && reorder(card.choices),
  };
  const at = Math.min(RETRY_GAP, rest.length);
  return [...rest.slice(0, at), retry, ...rest.slice(at)];
}
