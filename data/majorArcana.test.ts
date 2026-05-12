import { describe, it, expect } from 'vitest';
import { majorArcana } from './majorArcana';

describe('majorArcana', () => {
  it('has exactly 22 cards', () => {
    expect(majorArcana).toHaveLength(22);
  });

  it('ids are 0..21 unique', () => {
    const ids = majorArcana.map(c => c.id);
    expect(new Set(ids).size).toBe(22);
    expect(Math.min(...ids)).toBe(0);
    expect(Math.max(...ids)).toBe(21);
  });

  it('each card has non-empty ko/en and at least one keyword each side', () => {
    for (const c of majorArcana) {
      expect(c.ko.length).toBeGreaterThan(0);
      expect(c.en.length).toBeGreaterThan(0);
      expect(c.keywords.upright.length).toBeGreaterThan(0);
      expect(c.keywords.reversed.length).toBeGreaterThan(0);
    }
  });

  it('each card has a single-character hanja sigil', () => {
    for (const c of majorArcana) {
      expect(c.han.length, `${c.ko} (${c.id})`).toBe(1);
      // unicode CJK unified ideographs block: U+4E00–U+9FFF
      expect(c.han.codePointAt(0)!).toBeGreaterThanOrEqual(0x4e00);
      expect(c.han.codePointAt(0)!).toBeLessThanOrEqual(0x9fff);
    }
  });
});
