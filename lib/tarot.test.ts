import { describe, it, expect } from 'vitest';
import { drawThree, PHASES } from './tarot';

describe('drawThree', () => {
  it('returns exactly 3 cards', () => {
    const drawn = drawThree();
    expect(drawn).toHaveLength(3);
  });

  it('cards have unique ids', () => {
    const drawn = drawThree();
    const ids = drawn.map(d => d.card.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('all ids are in [0, 21]', () => {
    for (let i = 0; i < 100; i++) {
      const drawn = drawThree();
      for (const { card } of drawn) {
        expect(card.id).toBeGreaterThanOrEqual(0);
        expect(card.id).toBeLessThanOrEqual(21);
      }
    }
  });

  it('phases are 과거/현재/미래 in order', () => {
    const drawn = drawThree();
    expect(drawn.map(d => d.phase)).toEqual(['과거', '현재', '미래']);
  });

  it('reversed distribution roughly 50% over 1000 draws', () => {
    let reversedCount = 0;
    let total = 0;
    for (let i = 0; i < 1000; i++) {
      for (const { reversed } of drawThree()) {
        if (reversed) reversedCount++;
        total++;
      }
    }
    const ratio = reversedCount / total;
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });

  it('PHASES exported as readonly tuple', () => {
    expect(PHASES).toEqual(['과거', '현재', '미래']);
  });
});
