import { majorArcana, type ArcanaCard } from '@/data/majorArcana';

export const PHASES = ['과거', '현재', '미래'] as const;
export type Phase = (typeof PHASES)[number];

export type DrawnCard = {
  card: ArcanaCard;
  reversed: boolean;
  phase: Phase;
};

export function drawThree(): DrawnCard[] {
  const deck = [...majorArcana];
  // Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, 3).map((card, i) => ({
    card,
    reversed: Math.random() < 0.5,
    phase: PHASES[i],
  }));
}
