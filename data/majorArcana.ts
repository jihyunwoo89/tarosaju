// data/majorArcana.ts (Task 5 에서 22 장 모두 채움 — 여기서는 type + 임시 fixture)
export type ArcanaCard = {
  id: number;
  ko: string;
  en: string;
  keywords: { upright: string[]; reversed: string[] };
};

export const majorArcana: ArcanaCard[] = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  ko: `카드${i}`,
  en: `Card ${i}`,
  keywords: { upright: ['placeholder'], reversed: ['placeholder'] },
}));
