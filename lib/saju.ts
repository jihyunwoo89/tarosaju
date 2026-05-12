import { Solar } from 'lunar-javascript';

export const HOUR_BRANCH = ['자','축','인','묘','진','사','오','미','신','유','술','해'] as const;
export type HourBranch = (typeof HOUR_BRANCH)[number];

const HOUR_BRANCH_TO_TIME: Record<HourBranch, number> = {
  자: 0, 축: 2, 인: 4, 묘: 6, 진: 8, 사: 10,
  오: 12, 미: 14, 신: 16, 유: 18, 술: 20, 해: 22,
};

export type Pillars = { year: string; month: string; day: string; hour: string };

export type SajuInput = {
  year: number;   // 양력 1900 ~ 2099
  month: number;  // 1..12
  day: number;    // 1..31
  hourBranch: HourBranch;
};

export function computePillars(input: SajuInput): Pillars {
  if (input.year < 1900 || input.year > 2099) {
    throw new Error(`Year out of range: ${input.year}`);
  }
  const hour = HOUR_BRANCH_TO_TIME[input.hourBranch];
  // @ts-expect-error - lunar-javascript has no proper types
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, hour, 0, 0);
  const ec = solar.getLunar().getEightChar();
  return {
    year: ec.getYear() as string,
    month: ec.getMonth() as string,
    day: ec.getDay() as string,
    hour: ec.getTime() as string,
  };
}
