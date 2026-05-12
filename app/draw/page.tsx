'use client';

/**
 * Draw page — claude.ai/design source: draw-screen.jsx
 *
 * Flow:
 *  - idle:        a small face-down deck stack with "섞 기" CTA
 *  - shuffled:    22 face-down cards in a horizontal-scrollable shallow arc
 *  - picked == 3: ready chip + "운명 펼치기" CTA
 *  - revealing:   sequential 3D flip 0 → 1 → 2 then router.push('/result')
 *
 * Card visuals = the user PNG set (back.png / 0..21.png) — reused via
 * CardBack + CardFlip from components/card/.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { motion } from 'framer-motion';

import {
  ScreenTopBar,
  ChapterHeading,
  Hairline,
  SmallCaps,
  SerifNum,
  PrimaryButton,
  FONTS,
} from '@/components/shared/atoms';
import { CardBack } from '@/components/card/CardBack';
import { CardFlip } from '@/components/card/CardFlip';
import { useSession } from '@/store/session';
import { majorArcana } from '@/data/majorArcana';
import { useRouteGuard } from '@/lib/use-route-guard';

type Pick = { deckIdx: number; cardId: number; reversed: boolean };

const SLOTS_HAN = ['過去', '現在', '未來'];
const SLOTS_KO  = ['과거', '현재', '미래'];

export default function DrawPage() {
  useRouteGuard(['profile', 'category']);
  const router = useRouter();
  const setCards = useSession(s => s.setCards);

  // 22-card deck order — random per visit
  const deck = useMemo(() => {
    const ids = Array.from({ length: 22 }, (_, i) => i);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    }
    return ids;
  }, []);

  const [shuffled, setShuffled] = useState(false);
  const [shuffleAnim, setShuffleAnim] = useState(false);
  const [picked, setPicked] = useState<Pick[]>([]);
  const [flipped, setFlipped] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [revealing, setRevealing] = useState(false);

  function startShuffle() {
    setShuffleAnim(true);
    setTimeout(() => { setShuffled(true); setShuffleAnim(false); }, 900);
  }

  function pickCard(deckIdx: number) {
    if (revealing) return;
    if (picked.length >= 3) return;
    if (picked.some(p => p.deckIdx === deckIdx)) return;
    setPicked([...picked, {
      deckIdx,
      cardId: deck[deckIdx]!,
      reversed: Math.random() < 0.5,
    }]);
  }

  function resetPicks() {
    if (revealing) return;
    setPicked([]);
    setFlipped([false, false, false]);
  }

  function startReveal() {
    if (revealing || picked.length < 3) return;
    setRevealing(true);
    setTimeout(() => setFlipped([true, false, false]), 100);
    setTimeout(() => setFlipped([true, true,  false]), 900);
    setTimeout(() => setFlipped([true, true,  true ]), 1700);
    setTimeout(() => {
      setCards(picked.map(p => ({ id: p.cardId, reversed: p.reversed })));
      router.push('/result' as Route);
    }, 3300);
  }

  return (
    <main style={{
      width: '100%', minHeight: '100dvh', background: 'var(--color-bg)',
      position: 'relative', paddingTop: 54,
    }}>
      <ScreenTopBar current={3} total={4} onBack={() => router.back()} />
      <ChapterHeading
        numeral="III."
        lines={['카드를', '골라 주세요']}
        subtitle={revealing
          ? '세 장의 결을 펼치고 있습니다…'
          : '과거 · 현재 · 미래의 세 장면을 한 장씩 직관으로'}
      />

      {/* 3 slots — placeholder until picked, then face-down or flipped */}
      <div style={{ padding: '20px 28px 0', display: 'flex', justifyContent: 'space-between', gap: 14 }}>
        {[0, 1, 2].map(i => {
          const p = picked[i];
          const isFlipped = flipped[i];
          return (
            <div key={i} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <SmallCaps
                color={p ? 'var(--color-accent)' : 'var(--color-muted)'}
                size={9}
                tracking={0.42}
                style={{ fontFamily: FONTS.SERIF_KO }}
              >{SLOTS_HAN[i]}</SmallCaps>
              <div style={{ width: 88, height: 141, position: 'relative' }}>
                {p ? (
                  <CardFlip
                    card={majorArcana.find(c => c.id === p.cardId)!}
                    reversed={p.reversed}
                    flipped={isFlipped}
                    width={88}
                    delaySec={i * 0.07}
                  />
                ) : (
                  <div style={{
                    width: 88, height: 141,
                    border: '0.8px dashed var(--color-faint)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <SerifNum size={32} italic>{i + 1}</SerifNum>
                  </div>
                )}
              </div>
              <SmallCaps size={9} tracking={0.32}>{SLOTS_KO[i]}</SmallCaps>
            </div>
          );
        })}
      </div>

      {/* divider */}
      <div style={{ padding: '28px 28px 0' }}>
        <Hairline opacity={0.6} />
      </div>

      {/* deck / fan area */}
      <div style={{
        height: 280, position: 'relative', marginTop: 18,
        opacity: revealing ? 0.2 : 1, transition: 'opacity 0.4s',
        pointerEvents: revealing ? 'none' : 'auto',
      }}>
        {picked.length >= 3 ? (
          <ReadyChip onReset={resetPicks} />
        ) : !shuffled ? (
          <DeckStack onShuffle={startShuffle} shuffleAnim={shuffleAnim} />
        ) : (
          <ScrollableFan deck={deck} pickedIdxs={picked.map(p => p.deckIdx)} onPick={pickCard} />
        )}
      </div>

      {/* footer status + CTA */}
      <div style={{ padding: '24px 28px 30px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginBottom: 14,
        }}>
          <SmallCaps size={10} tracking={0.32}>{picked.length} / 3</SmallCaps>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} aria-hidden="true" style={{
                width: 5, height: 5, borderRadius: 3,
                background: i < picked.length ? 'var(--color-accent)' : 'var(--color-faint)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>
        <PrimaryButton disabled={picked.length < 3 || revealing} onClick={startReveal}>
          {revealing ? '펼 치 는 중…' : '운 명 펼 치 기'}
        </PrimaryButton>
      </div>
    </main>
  );
}

// ─── DeckStack ────────────────────────────────────────────────

function DeckStack({ onShuffle, shuffleAnim }: { onShuffle: () => void; shuffleAnim: boolean }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{ position: 'relative', width: 90, height: 144 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            position: 'absolute', top: -i * 2, left: i * 1.5,
            transform: shuffleAnim
              ? `translate(${(i % 2 ? -1 : 1) * 36}px, ${i * 4}px) rotate(${(i % 2 ? -10 : 10)}deg)`
              : 'none',
            transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
          }}>
            <CardBack width={90} />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onShuffle}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: FONTS.SERIF_KO, fontSize: 12, color: 'var(--color-text)',
          letterSpacing: '0.4em', padding: '10px 24px',
          borderBottom: '0.8px solid var(--color-text)',
        }}
      >섞 기</button>
    </div>
  );
}

// ─── ScrollableFan ────────────────────────────────────────────

function ScrollableFan({
  deck, pickedIdxs, onPick,
}: {
  deck: number[];
  pickedIdxs: number[];
  onPick: (i: number) => void;
}) {
  const total = deck.length;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const cardW = 62;
  const overlap = 28;
  const stride = overlap;
  const innerW = (total - 1) * stride + cardW + 36;

  const pickedSet = new Set(pickedIdxs);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = (innerW - el.clientWidth) / 2;
    el.scrollLeft = Math.max(0, target);
  }, [innerW]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 3,
      }}>
        <SmallCaps size={9} tracking={0.42}>← 22 장 · SWIPE →</SmallCaps>
      </div>

      <div
        ref={scrollRef}
        className="tx-fan"
        style={{
          width: '100%', height: '100%', overflowX: 'auto', overflowY: 'hidden',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 36px, black calc(100% - 36px), transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0, black 36px, black calc(100% - 36px), transparent 100%)',
          scrollbarWidth: 'none',
          paddingTop: 26,
        }}
      >
        <style>{`.tx-fan::-webkit-scrollbar{display:none}`}</style>
        <div style={{ position: 'relative', width: innerW, height: 230 }}>
          {deck.map((_cardId, i) => {
            const center = (total - 1) / 2;
            const offsetFromCenter = (i - center) / center;
            const angle = offsetFromCenter * 6;
            const yLift = Math.abs(offsetFromCenter) * 18;
            const x = i * stride;
            const isPicked = pickedSet.has(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => onPick(i)}
                aria-label={`카드 ${i + 1} 뽑기`}
                disabled={isPicked}
                style={{
                  position: 'absolute', left: x, top: yLift,
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '50% 100%',
                  cursor: isPicked ? 'default' : 'pointer',
                  opacity: isPicked ? 0 : 1,
                  transition: 'transform 0.25s ease, opacity 0.4s ease, top 0.25s ease',
                  zIndex: i,
                  background: 'transparent', border: 'none', padding: 0,
                }}
              >
                <CardBack width={cardW} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ReadyChip ────────────────────────────────────────────────

function ReadyChip({ onReset }: { onReset: () => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
    }}>
      <SmallCaps color="var(--color-accent)" size={10} tracking={0.5}>三 장 완료</SmallCaps>
      <div style={{
        fontFamily: FONTS.SERIF_KO, fontSize: 14, color: 'var(--color-muted)',
        letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.7,
      }}>
        세 장의 카드가 모두 자리잡았습니다<br />
        <em style={{ fontFamily: FONTS.SERIF, fontStyle: 'italic', color: 'var(--color-accent)' }}>
          운명 펼치기
        </em>
        를 눌러주세요
      </div>
      <button
        type="button"
        onClick={onReset}
        style={{
          marginTop: 6, background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: FONTS.SERIF, fontSize: 11, color: 'var(--color-muted)',
          letterSpacing: '0.32em', textTransform: 'uppercase', padding: '6px 14px',
          borderBottom: '0.5px solid var(--color-faint)',
        }}
      >다시 뽑기</button>
    </div>
  );
}
