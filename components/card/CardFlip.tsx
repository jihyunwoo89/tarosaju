'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { CardBack } from './CardBack';
import { TarotCard } from './TarotCard';
import type { ArcanaCard } from '@/data/majorArcana';

type Props = {
  card: ArcanaCard;
  reversed: boolean;
  flipped: boolean;     // 부모가 timeline 으로 제어
  width?: number;
  delaySec?: number;
};

export function CardFlip({ card, reversed, flipped, width = 120, delaySec = 0 }: Props) {
  const reduce = useReducedMotion();
  const height = Math.round(width * 1.6);
  return (
    <div style={{ perspective: 1000, width, height }} className="relative">
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.8, ease: 'easeOut', delay: delaySec }}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
          <CardBack width={width} />
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <TarotCard card={card} reversed={reversed} width={width} />
        </div>
      </motion.div>
    </div>
  );
}
