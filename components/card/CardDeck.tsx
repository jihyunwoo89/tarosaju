'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { CardBack } from './CardBack';
import { majorArcana, type ArcanaCard } from '@/data/majorArcana';
import { PHASES, type DrawnCard } from '@/lib/tarot';

type Phase = 'idle' | 'shuffling' | 'spread' | 'ready';

type Props = {
  onComplete: (drawn: DrawnCard[]) => void;
};

const CARD_W = 80;
const CARD_H = Math.round(CARD_W * 1.6);
const TOTAL = 22;

export function CardDeck({ onComplete }: Props) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [revealOrder, setRevealOrder] = useState<ArcanaCard[]>([]); // 부채꼴 순서
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);

  // shuffle 시작
  function startShuffle() {
    if (phase !== 'idle') return;
    setPhase('shuffling');
    // 부채꼴 = 22장 랜덤 셔플 (Fisher-Yates)
    const deck = [...majorArcana];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setRevealOrder(deck);
    timerRef.current = setTimeout(() => setPhase('spread'), reduce ? 50 : 1500);
  }

  function onPickByIdx(i: number) {
    if (phase !== 'spread') return;
    if (pickedIndices.includes(i)) return;
    const next = [...pickedIndices, i];
    setPickedIndices(next);
    if (next.length === 3) {
      const picks: DrawnCard[] = next.map((idx, phaseI) => ({
        card: revealOrder[idx],
        reversed: Math.random() < 0.5,
        phase: PHASES[phaseI],
      }));
      setDrawn(picks);
      timerRef.current = setTimeout(() => setPhase('ready'), 600);
    }
  }

  useEffect(() => {
    if (phase === 'ready' && !completedRef.current) {
      completedRef.current = true;
      onComplete(drawn);
    }
  }, [phase, drawn, onComplete]);

  // unmount 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 부채꼴 좌표 계산
  function spreadStyle(i: number) {
    const offset = i - (TOTAL - 1) / 2;
    return {
      x: offset * 16,
      y: Math.abs(offset) * 2,
      rotate: offset * 4,
    };
  }

  function autoPickCore() {
    const available = Array.from({ length: 22 }, (_, i) => i).filter(i => !pickedIndices.includes(i));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const chosen = pickedIndices.slice();
    for (let i = 0; chosen.length < 3 && i < shuffled.length; i++) chosen.push(shuffled[i]);
    setPickedIndices(chosen);
    const picks: DrawnCard[] = chosen.map((idx, phaseI) => ({
      card: revealOrder[idx],
      reversed: Math.random() < 0.5,
      phase: PHASES[phaseI],
    }));
    setDrawn(picks);
    timerRef.current = setTimeout(() => setPhase('ready'), reduce ? 50 : 600);
  }

  function autoPick() {
    if (phase === 'idle') {
      startShuffle();
      timerRef.current = setTimeout(() => {
        autoPickCore();
      }, reduce ? 100 : 1700);
      return;
    }
    if (phase === 'spread') {
      autoPickCore();
    }
  }

  return (
    <div className="relative w-full h-[60vh] flex items-center justify-center overflow-visible">
      {phase === 'idle' && (
        <button onClick={startShuffle} aria-label="카드 셔플 시작" className="relative">
          <motion.div
            animate={{ y: reduce ? 0 : [-4, 4, -4] }}
            transition={{ repeat: reduce ? 0 : Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <CardBack width={CARD_W * 1.4} />
          </motion.div>
          <span className="block mt-3 text-xs text-muted">터치해서 셔플</span>
        </button>
      )}

      {(phase === 'shuffling' || phase === 'spread') && (
        <div className="absolute inset-0 flex items-center justify-center">
          {revealOrder.map((card, i) => {
            const picked = pickedIndices.includes(i);
            const target = phase === 'spread' ? spreadStyle(i) : { x: 0, y: 0, rotate: 0 };
            return (
              <motion.button
                key={card.id}
                onClick={() => onPickByIdx(i)}
                aria-label={`자리 ${i + 1} 카드 뽑기`}
                className="absolute"
                style={{ width: CARD_W, height: CARD_H }}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={picked
                  ? { x: 0, y: -240, rotate: 0, opacity: 0 }
                  : target}
                transition={{ type: 'spring', stiffness: 100, damping: 18, delay: phase === 'spread' ? i * 0.03 : 0 }}
              >
                <CardBack width={CARD_W} />
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {pickedIndices.length > 0 && (
          <div className="absolute top-2 left-0 right-0 flex justify-center gap-3">
            {[0, 1, 2].map(slotI => {
              const filled = pickedIndices[slotI] !== undefined;
              return (
                <motion.div
                  key={slotI}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-1"
                >
                  {filled ? <CardBack width={CARD_W} /> : <div style={{ width: CARD_W, height: CARD_H }} className="border border-dashed border-border rounded" />}
                  <span className="text-[10px] text-muted">{['과거','현재','미래'][slotI]}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {phase !== 'ready' && (
        <button
          type="button"
          onClick={autoPick}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted underline decoration-dotted underline-offset-4"
          aria-label="자동으로 3 장 뽑기"
        >
          자동으로 3 장 뽑기
        </button>
      )}
    </div>
  );
}
