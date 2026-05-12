import { describe, it, expect } from 'vitest';
import { FortuneRequestSchema, FortuneResponseSchema, ErrorCode } from './schema';

describe('FortuneRequestSchema', () => {
  const validInput = {
    name: '홍길동',
    gender: '남',
    birthDate: '1990-03-15',
    hourBranch: '인',
    category: '연애',
    cards: [
      { id: 0,  reversed: false },
      { id: 10, reversed: true },
      { id: 21, reversed: false },
    ],
  };

  it('accepts valid input', () => {
    expect(() => FortuneRequestSchema.parse(validInput)).not.toThrow();
  });

  it('rejects empty name', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, name: '' })).toThrow();
  });

  it('rejects name longer than 20', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, name: 'a'.repeat(21) })).toThrow();
  });

  it('rejects unknown gender', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, gender: 'other' })).toThrow();
  });

  it('rejects malformed birthDate', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, birthDate: '1990/03/15' })).toThrow();
    expect(() => FortuneRequestSchema.parse({ ...validInput, birthDate: '1899-12-31' })).toThrow();
    expect(() => FortuneRequestSchema.parse({ ...validInput, birthDate: '2001-02-29' })).toThrow();
    expect(() => FortuneRequestSchema.parse({ ...validInput, birthDate: '2000-13-01' })).toThrow();
  });

  it('rejects unknown hourBranch', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, hourBranch: 'xx' })).toThrow();
  });

  it('rejects unknown category', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, category: '건강' })).toThrow();
  });

  it('rejects cards length != 3', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, cards: [{ id: 0, reversed: false }] })).toThrow();
  });

  it('rejects duplicate card ids', () => {
    expect(() => FortuneRequestSchema.parse({
      ...validInput,
      cards: [{ id: 0, reversed: false }, { id: 0, reversed: true }, { id: 1, reversed: false }],
    })).toThrow();
  });

  it('rejects card id out of [0..21]', () => {
    expect(() => FortuneRequestSchema.parse({
      ...validInput,
      cards: [{ id: 22, reversed: false }, { id: 1, reversed: false }, { id: 2, reversed: false }],
    })).toThrow();
  });
});

describe('FortuneResponseSchema', () => {
  const validResponse = {
    summary: '이번 흐름은 새로 시작되는 관계의 결을 따라가는 시기입니다. 차분히 듣되 표현을 미루지는 않는 편이 좋습니다.',
    cards: [
      { phase: '과거', card: '바보',  reading: '시작의 호기심이 관계의 씨앗이었습니다. 작은 신호도 의미가 있었습니다.' },
      { phase: '현재', card: '연인',  reading: '선택의 문 앞에 있습니다. 망설임보다 결정의 무게가 더 크게 느껴집니다.' },
      { phase: '미래', card: '태양',  reading: '명료한 결말이 다가옵니다. 회피하지 않으면 따뜻한 답을 받게 됩니다.' },
    ],
    advice: '오늘 안에 한 문장만이라도 전해 보세요. 시간이 답을 미루지 못하게 하는 게 핵심입니다.',
  };

  it('accepts valid response', () => {
    expect(() => FortuneResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('rejects summary shorter than 20', () => {
    expect(() => FortuneResponseSchema.parse({ ...validResponse, summary: '짧음' })).toThrow();
  });

  it('rejects cards length != 3', () => {
    expect(() => FortuneResponseSchema.parse({
      ...validResponse,
      cards: validResponse.cards.slice(0, 2),
    })).toThrow();
  });

  it('rejects wrong phase order', () => {
    expect(() => FortuneResponseSchema.parse({
      ...validResponse,
      cards: [validResponse.cards[1], validResponse.cards[0], validResponse.cards[2]],
    })).toThrow();
  });
});

describe('ErrorCode', () => {
  it('ErrorCode enum has expected members', () => {
    expect(ErrorCode.options).toContain('invalid_input');
    expect(ErrorCode.options).toContain('config_missing');
    expect(ErrorCode.options).toContain('upstream_error');
    expect(ErrorCode.options).toContain('rate_limited');
    expect(ErrorCode.options).toContain('timeout');
    expect(ErrorCode.options).toContain('parse_failed');
    expect(ErrorCode.options).toContain('saju_calc_failed');
  });
});
