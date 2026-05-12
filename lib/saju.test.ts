import { describe, it, expect } from 'vitest';
import { computePillars, HOUR_BRANCH } from './saju';

describe('computePillars', () => {
  it('returns 4 pillars as 2-char hanja strings', () => {
    const p = computePillars({ year: 1990, month: 3, day: 15, hourBranch: '인' });
    expect(p.year).toMatch(/^[一-鿿]{2}$/);
    expect(p.month).toMatch(/^[一-鿿]{2}$/);
    expect(p.day).toMatch(/^[一-鿿]{2}$/);
    expect(p.hour).toMatch(/^[一-鿿]{2}$/);
  });

  it('produces stable result for known input', () => {
    const p = computePillars({ year: 2000, month: 1, day: 1, hourBranch: '자' });
    // 결정성 검증 (재실행해도 동일)
    const p2 = computePillars({ year: 2000, month: 1, day: 1, hourBranch: '자' });
    expect(p).toEqual(p2);
  });

  it('hour branch maps differ (인 vs 오)', () => {
    const am = computePillars({ year: 2000, month: 1, day: 1, hourBranch: '인' });
    const noon = computePillars({ year: 2000, month: 1, day: 1, hourBranch: '오' });
    expect(am.hour).not.toEqual(noon.hour);
  });

  it('HOUR_BRANCH has all 12 지지 in order', () => {
    expect(HOUR_BRANCH).toEqual(['자','축','인','묘','진','사','오','미','신','유','술','해']);
  });

  it('throws on out-of-range year', () => {
    expect(() => computePillars({ year: 1899, month: 1, day: 1, hourBranch: '자' })).toThrow();
    expect(() => computePillars({ year: 2200, month: 1, day: 1, hourBranch: '자' })).toThrow();
  });
});
