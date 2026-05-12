'use client';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import type { Route } from 'next';
import { useSession, type Category } from '@/store/session';
import type { FortuneResponse } from '@/lib/schema';
import type { Pillars } from '@/lib/saju';
import type { CardSelection } from '@/store/session';
import { majorArcana } from '@/data/majorArcana';
import { ResultHeader } from './ResultHeader';
import { SajuPillars } from './SajuPillars';
import { CardFlip } from '@/components/card/CardFlip';
import { FortuneNarrative } from './FortuneNarrative';
import { Button } from '@/components/ui/Button';

// 타이밍 (초 단위)
export const T = {
  header: 0,
  pillarsStart: 0.2,       // pillarsEnd = 0.2 + 8*0.3 = 2.6
  pillarsEnd: 2.6,
  flipStart: 2.6,          // 3 카드 × 0.8s
  flipEnd: 5.0,
  summary: 5.0,
  reading0: 5.4,
  reading1: 5.9,
  reading2: 6.4,
  advice: 6.9,
  cta: 7.4,
};

export function FortuneRevealOrchestrator({
  category, pillars, cards, fortune,
}: {
  category: Category;
  pillars: Pillars;
  cards: CardSelection[];
  fortune: FortuneResponse;
}) {
  const reduce = useReducedMotion();
  const resetForReroll = useSession(s => s.resetForReroll);

  const cardModels = cards.map(c => {
    const card = majorArcana.find(a => a.id === c.id);
    if (!card) throw new Error(`unknown card id ${c.id}`);
    return { card, reversed: c.reversed };
  });

  return (
    <main className="min-h-[100dvh]">
      <ResultHeader category={category} visible />
      <SajuPillars pillars={pillars} startAtSec={T.pillarsStart} />

      <section className="flex justify-center gap-3 py-4" aria-label="뽑은 카드 3장">
        {cardModels.map((c, i) => (
          <CardFlip
            key={c.card.id}
            card={c.card}
            reversed={c.reversed}
            flipped
            width={90}
            delaySec={reduce ? 0 : T.flipStart + i * 0.8}
          />
        ))}
      </section>

      <FortuneNarrative
        fortune={fortune}
        startAtSec={{
          summary: T.summary,
          readings: [T.reading0, T.reading1, T.reading2],
          advice: T.advice,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.3, delay: T.cta }}
        className="px-6 py-10 flex justify-center"
      >
        <Link href={'/' as Route} onClick={() => resetForReroll()}>
          <Button variant="secondary">다시 보기</Button>
        </Link>
      </motion.div>
    </main>
  );
}
