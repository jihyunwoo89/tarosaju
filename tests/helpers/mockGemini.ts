import { vi } from 'vitest';
import type { FortuneResponse } from '@/lib/schema';

export const validFortune: FortuneResponse = {
  summary: '이번 흐름은 새로 시작되는 관계의 결을 따라가는 시기입니다. 차분히 듣되 표현을 미루지는 않는 편이 좋습니다.',
  cards: [
    { phase: '과거', card: '바보', reading: '시작의 호기심이 관계의 씨앗이었습니다. 작은 신호도 의미가 있었습니다.' },
    { phase: '현재', card: '연인', reading: '선택의 문 앞에 있습니다. 망설임보다 결정의 무게가 더 크게 느껴집니다.' },
    { phase: '미래', card: '태양', reading: '명료한 결말이 다가옵니다. 회피하지 않으면 따뜻한 답을 받게 됩니다.' },
  ],
  advice: '오늘 안에 한 문장만이라도 전해 보세요. 시간이 답을 미루지 못하게 하는 게 핵심입니다.',
};

export function mockGeminiSuccess(response: FortuneResponse = validFortune) {
  vi.doMock('@/lib/gemini', () => ({
    callGemini: vi.fn(async () => response),
    GeminiError: class extends Error {
      constructor(public code: string, m: string) { super(m); }
    },
  }));
}

export function mockGeminiError(code: string, message: string) {
  vi.doMock('@/lib/gemini', () => {
    class GeminiError extends Error {
      constructor(public code: string, m: string) { super(m); }
    }
    return {
      callGemini: vi.fn(async () => { throw new GeminiError(code, message); }),
      GeminiError,
    };
  });
}
