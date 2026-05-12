'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { Category } from '@/store/session';
import { categoryLabel } from '@/lib/schema';

export function ResultHeader({ category, visible }: { category: Category; visible: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.2 }}
      className="text-center pt-8 pb-4"
    >
      <span className="text-xs uppercase tracking-widest text-muted">결과</span>
      <h1 className="font-display text-3xl mt-1">{categoryLabel(category)}</h1>
    </motion.header>
  );
}
