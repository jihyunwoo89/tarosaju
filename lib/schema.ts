import { z } from 'zod';
import { HOUR_BRANCH } from './saju';
import { PHASES as PHASE } from './tarot';

export { HOUR_BRANCH, PHASE };
export const CATEGORY = ['연애', '금전', '학업', '취업'] as const;
export type Category = (typeof CATEGORY)[number];
export const CATEGORY_LABEL: Record<Category, string> = {
  연애: '연애운',
  금전: '금전운',
  학업: '학업운',
  취업: '취업운',
};
export const categoryLabel = (c: Category): string => CATEGORY_LABEL[c];
export const GENDER = ['남', '여'] as const;
export type Gender = (typeof GENDER)[number];

const todayIso = () => new Date().toISOString().slice(0, 10);

export const FortuneRequestSchema = z.object({
  name: z.string().trim().min(1).max(20),
  gender: z.enum(GENDER),
  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(s => s >= '1900-01-01' && s <= todayIso(), {
      message: 'birthDate must be between 1900-01-01 and today',
    })
    .refine(s => {
      const [y, m, d] = s.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
    }, { message: 'birthDate must be a real calendar date' }),
  hourBranch: z.enum(HOUR_BRANCH),
  category: z.enum(CATEGORY),
  cards: z.array(z.object({
    id: z.number().int().min(0).max(21),
    reversed: z.boolean(),
  })).length(3).refine(
    arr => new Set(arr.map(c => c.id)).size === arr.length,
    { message: 'card ids must be unique' },
  ),
});

export type FortuneRequest = z.infer<typeof FortuneRequestSchema>;

const cardReadingSchema = (phase: typeof PHASE[number]) => z.object({
  phase: z.literal(phase),
  card: z.string().min(1),
  reading: z.string().min(20),
});

export const FortuneResponseSchema = z.object({
  summary: z.string().min(20),
  cards: z.tuple([
    cardReadingSchema('과거'),
    cardReadingSchema('현재'),
    cardReadingSchema('미래'),
  ]),
  advice: z.string().min(20),
});

export type FortuneResponse = z.infer<typeof FortuneResponseSchema>;

export const ErrorCode = z.enum([
  'invalid_input',
  'config_missing',
  'upstream_error',
  'rate_limited',
  'timeout',
  'parse_failed',
  'saju_calc_failed',
]);
export type ErrorCode = z.infer<typeof ErrorCode>;
