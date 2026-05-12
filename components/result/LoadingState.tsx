'use client';
import { motion, useReducedMotion } from 'framer-motion';

export function LoadingState() {
  const reduce = useReducedMotion();
  return (
    <main
      role="status"
      aria-live="polite"
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        animate={reduce ? {} : { opacity: [0.4, 1, 0.4] }}
        transition={reduce ? {} : { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        className="font-display text-2xl"
      >
        풀이를 정리하는 중…
      </motion.div>
      <p className="text-xs text-muted mt-4">짧게는 3 초, 길어도 8 초 안에 보여드려요.</p>
    </main>
  );
}
