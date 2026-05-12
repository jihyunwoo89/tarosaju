import 'server-only';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { FortuneResponseSchema, type FortuneResponse } from './schema';

const TIMEOUT_MS = 8_000;
const MAX_RETRY = 1;

type CallInput = {
  systemPrompt: string;
  userPrompt: string;
};

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING },
    cards: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          phase: { type: SchemaType.STRING, enum: ['과거', '현재', '미래'] },
          card: { type: SchemaType.STRING },
          reading: { type: SchemaType.STRING },
        },
        required: ['phase', 'card', 'reading'],
      },
      minItems: 3,
      maxItems: 3,
    },
    advice: { type: SchemaType.STRING },
  },
  required: ['summary', 'cards', 'advice'],
};

export class GeminiError extends Error {
  constructor(
    public code: 'config_missing' | 'upstream_error' | 'rate_limited' | 'timeout' | 'parse_failed',
    message: string,
  ) {
    super(message);
  }
}

export async function callGemini({ systemPrompt, userPrompt }: CallInput): Promise<FortuneResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length === 0) {
    throw new GeminiError('config_missing', 'GEMINI_API_KEY is not set');
  }

  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
  const client = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.9,
    },
  });

  let lastParseError: unknown = null;
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const result = await client.generateContent(
        { contents: [{ role: 'user', parts: [{ text: userPrompt }] }] },
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      const text = result.response.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        lastParseError = e;
        clearTimeout(timeout);
        continue;
      }
      const validated = FortuneResponseSchema.safeParse(parsed);
      if (validated.success) return validated.data;
      lastParseError = validated.error;
      clearTimeout(timeout);
      continue;
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (controller.signal.aborted) {
        throw new GeminiError('timeout', `Gemini call timed out after ${TIMEOUT_MS}ms`);
      }
      const message = err instanceof Error ? err.message : String(err);
      if (/429|rate/i.test(message)) {
        throw new GeminiError('rate_limited', message);
      }
      throw new GeminiError('upstream_error', message);
    }
  }

  throw new GeminiError(
    'parse_failed',
    `Gemini response failed schema after ${MAX_RETRY + 1} attempts: ${String(lastParseError)}`,
  );
}
