import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validFortune, mockGeminiSuccess, mockGeminiError } from '../helpers/mockGemini';

const validBody = {
  name: '홍길동',
  gender: '남',
  birthDate: '1990-03-15',
  hourBranch: '인',
  category: '연애',
  cards: [
    { id: 0,  reversed: false },
    { id: 6,  reversed: true  },
    { id: 19, reversed: false },
  ],
};

async function callRoute(body: unknown) {
  const { POST } = await import('@/app/api/fortune/route');
  const req = new Request('http://localhost/api/fortune', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return POST(req);
}

describe('POST /api/fortune', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  it('returns 200 with pillars + fortune on valid input', async () => {
    mockGeminiSuccess();
    const res = await callRoute(validBody);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pillars).toMatchObject({
      year: expect.stringMatching(/^[一-鿿]{2}$/),
      month: expect.stringMatching(/^[一-鿿]{2}$/),
      day: expect.stringMatching(/^[一-鿿]{2}$/),
      hour: expect.stringMatching(/^[一-鿿]{2}$/),
    });
    expect(json.fortune).toEqual(validFortune);
  });

  it('returns 400 invalid_input on missing name', async () => {
    const res = await callRoute({ ...validBody, name: '' });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid_input');
    expect(json.retryable).toBe(false);
  });

  it('returns 500 config_missing when GEMINI_API_KEY empty', async () => {
    process.env.GEMINI_API_KEY = '';
    vi.doMock('@/lib/gemini', async () => {
      const real = await vi.importActual<typeof import('@/lib/gemini')>('@/lib/gemini');
      return real;
    });
    const res = await callRoute(validBody);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('config_missing');
    expect(json.retryable).toBe(false);
  });

  it('returns 502 upstream_error on generic Gemini failure', async () => {
    mockGeminiError('upstream_error', 'boom');
    const res = await callRoute(validBody);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBe('upstream_error');
    expect(json.retryable).toBe(true);
  });

  it('returns 503 rate_limited on 429', async () => {
    mockGeminiError('rate_limited', '429');
    const res = await callRoute(validBody);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe('rate_limited');
    expect(json.retryable).toBe(true);
  });

  it('returns 504 timeout', async () => {
    mockGeminiError('timeout', 'abort');
    const res = await callRoute(validBody);
    expect(res.status).toBe(504);
    const json = await res.json();
    expect(json.error).toBe('timeout');
    expect(json.retryable).toBe(true);
  });

  it('returns 500 parse_failed when schema retry exhausted', async () => {
    mockGeminiError('parse_failed', 'bad json');
    const res = await callRoute(validBody);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('parse_failed');
    expect(json.retryable).toBe(true);
  });
});
