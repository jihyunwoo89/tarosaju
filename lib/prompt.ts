import type { Pillars } from './saju';
import type { DrawnCard } from './tarot';
import type { FortuneRequest } from './schema';
import { categoryLabel } from './schema';

export function buildSystemPrompt(): string {
  return [
    '당신은 한국어로 글을 쓰는 사주·타로 큐레이터입니다.',
    '',
    '톤 규칙:',
    '- 차분하고 신뢰감 있는 어조. 시적 절제, 직설보다 함축.',
    '- 금지 어휘: "운명", "숙명", "신비", "계시" 같은 단정적·신비주의 표현은 출력하지 않는다.',
    '- 단정적 예언("...할 것입니다") 대신 가능성·태도("...할 여지가 있습니다", "...해 보는 편이 좋습니다").',
    '',
    '구성 규칙:',
    '- 한자 명식 8글자는 분석의 근거로 1~2 문장 짧게 언급. 길게 풀이하지 않는다.',
    '- 모든 풀이는 사용자가 고른 단일 카테고리에 집중한다.',
    '',
    '출력 규칙:',
    '- 응답은 반드시 JSON 한 객체. 추가 텍스트, 마크다운, 코드블록 금지.',
    '- 스키마: { "summary": string, "cards": [{phase, card, reading}*3], "advice": string }',
    '- summary 와 advice 는 각각 2~3 문장.',
    '- cards[i].reading 은 한 단락 (3~5 문장).',
  ].join('\n');
}

export type UserPromptInput = Omit<FortuneRequest, 'cards'> & {
  pillars: Pillars;
  cards: DrawnCard[];
};

export function buildUserPrompt(input: UserPromptInput): string {
  const { name, gender, birthDate, hourBranch, category, pillars, cards } = input;
  const cardLines = cards.map(c =>
    `  ${c.phase} — ${c.card.ko} (${c.reversed ? '역방향' : '정방향'})`,
  ).join('\n');

  return [
    `사용자: ${name} (${gender}, 양력 ${birthDate}, ${hourBranch}시)`,
    `사주 명식: 년주 ${pillars.year} / 월주 ${pillars.month} / 일주 ${pillars.day} / 시주 ${pillars.hour}`,
    `카테고리: ${categoryLabel(category)}`,
    `뽑힌 카드:`,
    cardLines,
    ``,
    `위 정보를 종합해 "${categoryLabel(category)}"에 대해 시스템 규칙을 따라 JSON 으로 풀이해 주세요.`,
  ].join('\n');
}
