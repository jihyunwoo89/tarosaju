'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { FortuneResponse } from '@/lib/schema';

type Props = {
  fortune: FortuneResponse;
  startAtSec: { summary: number; readings: number[]; advice: number };
};

export function FortuneNarrative({ fortune, startAtSec }: Props) {
  const reduce = useReducedMotion();
  const T = (delay: number) => reduce ? { duration: 0 } : { duration: 0.5, delay, ease: 'easeOut' as const };
  const I = { opacity: 0, y: 8 };
  const A = { opacity: 1, y: 0 };

  return (
    <article className="mx-auto max-w-md px-6 py-6 flex flex-col gap-6" aria-live="polite">
      <motion.p initial={I} animate={A} transition={T(startAtSec.summary)} className="text-base leading-relaxed">
        {fortune.summary}
      </motion.p>
      {fortune.cards.map((c, i) => (
        <motion.section
          key={c.phase}
          initial={I} animate={A} transition={T(startAtSec.readings[i])}
          className="border-l-2 border-accent pl-4"
        >
          <h3 className="font-display text-sm uppercase tracking-wider text-muted mb-1">
            {c.phase} · {c.card}
          </h3>
          <p className="text-sm leading-relaxed">{c.reading}</p>
        </motion.section>
      ))}
      <motion.div initial={I} animate={A} transition={T(startAtSec.advice)} className="bg-surface border border-border rounded p-4">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted mb-1">다음 한 걸음</h3>
        <p className="text-sm leading-relaxed">{fortune.advice}</p>
      </motion.div>
    </article>
  );
}
