import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserPrompt } from './prompt';

describe('buildSystemPrompt', () => {
  const sys = buildSystemPrompt();

  it('is non-empty Korean', () => {
    expect(sys.length).toBeGreaterThan(100);
    expect(sys).toMatch(/한국어/);
  });

  it('mentions each banned word only inside a 금지 rule line', () => {
    const lines = sys.split('\n');
    for (const banned of ['운명', '숙명', '신비', '계시']) {
      const matchingLines = lines.filter(l => l.includes(banned));
      expect(matchingLines, `${banned} should appear in exactly one line`).toHaveLength(1);
      expect(matchingLines[0], `${banned} should be on a 금지 rule line`).toMatch(/금지/);
    }
  });

  it('mentions JSON output requirement', () => {
    expect(sys).toMatch(/JSON/);
  });

  it('mentions single category focus', () => {
    expect(sys).toMatch(/카테고리/);
  });
});

describe('buildUserPrompt', () => {
  const input = {
    name: '홍길동',
    gender: '남' as const,
    birthDate: '1990-03-15',
    hourBranch: '인' as const,
    category: '연애' as const,
    pillars: { year: '庚午', month: '己卯', day: '丙午', hour: '庚寅' },
    cards: [
      { card: { id: 0,  ko: '바보', en: 'The Fool',   han: '愚', keywords: { upright: ['시작'], reversed: ['지연'] } }, reversed: false, phase: '과거' as const },
      { card: { id: 6,  ko: '연인', en: 'The Lovers', han: '緣', keywords: { upright: ['결합'], reversed: ['불화'] } }, reversed: true,  phase: '현재' as const },
      { card: { id: 19, ko: '태양', en: 'The Sun',    han: '日', keywords: { upright: ['활력'], reversed: ['과열'] } }, reversed: false, phase: '미래' as const },
    ],
  };

  it('includes name, birthDate, pillars 8 hanja chars', () => {
    const u = buildUserPrompt(input);
    expect(u).toContain('홍길동');
    expect(u).toContain('1990-03-15');
    expect(u).toContain('庚午');
    expect(u).toContain('己卯');
    expect(u).toContain('丙午');
    expect(u).toContain('庚寅');
  });

  it('marks reversed cards as 역방향', () => {
    const u = buildUserPrompt(input);
    expect(u).toMatch(/연인.*역방향/);
    expect(u).toMatch(/바보.*정방향/);
  });

  it('mentions all 3 phases', () => {
    const u = buildUserPrompt(input);
    expect(u).toContain('과거');
    expect(u).toContain('현재');
    expect(u).toContain('미래');
  });

  it('mentions the chosen category', () => {
    const u = buildUserPrompt(input);
    expect(u).toContain('연애');
  });
});
