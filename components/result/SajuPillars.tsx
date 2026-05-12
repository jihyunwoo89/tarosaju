'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { Pillars } from '@/lib/saju';

export function SajuPillars({ pillars, startAtSec }: { pillars: Pillars; startAtSec: number }) {
  const reduce = useReducedMotion();
  // 8 글자 분해: year (천간 + 지지) etc.
  const chars = [
    pillars.year[0], pillars.year[1],
    pillars.month[0], pillars.month[1],
    pillars.day[0], pillars.day[1],
    pillars.hour[0], pillars.hour[1],
  ];
  return (
    <section className="mx-auto max-w-md px-6 py-6">
      <h2 className="sr-only">사주 명식</h2>
      <div className="grid grid-cols-4 gap-2 text-center" lang="zh">
        {[0, 2, 4, 6].map((i, col) => (
          <div key={col} className="flex flex-col gap-1 items-center">
            <span className="text-[10px] uppercase tracking-widest text-muted">{['년주','월주','일주','시주'][col]}</span>
            <div className="flex flex-col gap-1">
              {[i, i + 1].map((charI, row) => (
                <motion.span
                  key={charI}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduce
                    ? { duration: 0 }
                    : { duration: 0.3, delay: startAtSec + charI * 0.3 }}
                  className="font-display text-3xl text-text"
                  aria-label={`${['년주','월주','일주','시주'][col]} ${row === 0 ? '천간' : '지지'} ${chars[charI]}`}
                >
                  {chars[charI]}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
