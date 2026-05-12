import { NextResponse } from 'next/server';
import { FortuneRequestSchema, type ErrorCode } from '@/lib/schema';
import { computePillars } from '@/lib/saju';
import { majorArcana } from '@/data/majorArcana';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt';
import { callGemini, GeminiError } from '@/lib/gemini';
import { PHASES } from '@/lib/tarot';

function fail(code: ErrorCode, status: number, retryable: boolean, message?: string) {
  return NextResponse.json({ error: code, retryable, message }, { status });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail('invalid_input', 400, false, 'malformed JSON');
  }

  const parsed = FortuneRequestSchema.safeParse(body);
  if (!parsed.success) return fail('invalid_input', 400, false, parsed.error.message);

  const input = parsed.data;
  const [y, m, d] = input.birthDate.split('-').map(Number);

  let pillars;
  try {
    pillars = computePillars({ year: y, month: m, day: d, hourBranch: input.hourBranch });
  } catch (e) {
    return fail('saju_calc_failed', 500, false, e instanceof Error ? e.message : String(e));
  }

  let drawnCards;
  try {
    // cards[0]=과거, cards[1]=현재, cards[2]=미래 — positional ordering is part of the contract
    drawnCards = input.cards.map((c, i) => {
      const card = majorArcana.find(a => a.id === c.id);
      if (!card) throw new Error(`unknown card id ${c.id}`);
      return { card, reversed: c.reversed, phase: PHASES[i] };
    });
  } catch (e) {
    return fail('invalid_input', 400, false, e instanceof Error ? e.message : String(e));
  }

  try {
    const fortune = await callGemini({
      systemPrompt: buildSystemPrompt(),
      userPrompt: buildUserPrompt({ ...input, pillars, cards: drawnCards }),
    });
    return NextResponse.json({ pillars, fortune });
  } catch (e) {
    if (e instanceof GeminiError) {
      switch (e.code) {
        case 'config_missing': return fail('config_missing', 500, false, e.message);
        case 'rate_limited':   return fail('rate_limited', 503, true, e.message);
        case 'timeout':        return fail('timeout', 504, true, e.message);
        case 'parse_failed':   return fail('parse_failed', 500, true, e.message);
        case 'upstream_error':
        default:               return fail('upstream_error', 502, true, e.message);
      }
    }
    return fail('upstream_error', 502, true, e instanceof Error ? e.message : String(e));
  }
}
