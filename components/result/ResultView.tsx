'use client';

/**
 * ResultView — claude.ai/design source: result-screen.jsx
 *
 * Renders 4 stacked sections:
 *   1) header   — name + birth meta + category tag, gold hairline
 *   2) 命式     — 4-pillar mini grid (uses lib/saju Pillars; splits each
 *                 2-char hanja into stem + branch)
 *   3) 占       — 3 picked cards (PNG face) with 過去/現在/未來 labels
 *   4) 解       — gold-corner box (Gemini summary), then 3 reading paragraphs
 *                 keyed to 過去/現在/未來, then an advice paragraph, then
 *                 keyword chip rows per card
 *
 * Note: claude.ai/design's source generates a deterministic local narrative
 * from card keywords + day-master; we substitute the Gemini response so the
 * routing through /api/fortune is unchanged.
 */

import {
  GoldHairline,
  SmallCaps,
  SerifNum,
  PrimaryButton,
  SecondaryLink,
  FONTS,
} from '@/components/shared/atoms';
import { TarotCard } from '@/components/card/TarotCard';
import { majorArcana } from '@/data/majorArcana';
import type { Profile, Category, CardSelection } from '@/store/session';
import type { Pillars } from '@/lib/saju';
import type { FortuneResponse } from '@/lib/schema';

const CATS: Record<Category, { ko: string; han: string; en: string }> = {
  연애: { ko: '연애운', han: '緣', en: 'Love'    },
  금전: { ko: '금전운', han: '富', en: 'Wealth'  },
  학업: { ko: '학업운', han: '學', en: 'Studies' },
  취업: { ko: '취업운', han: '業', en: 'Career'  },
};

const SLOTS_HAN  = ['過去', '現在', '未來'];
const SHORT_HAN  = ['過', '現', '來'];
const PILLAR_HAN = ['年', '月', '日', '時'] as const;
const PILLAR_KO  = ['년주', '월주', '일주', '시주'];

export function ResultView({
  profile, category, pillars, fortune, picked, onRestart,
}: {
  profile: Profile;
  category: Category;
  pillars: Pillars;
  fortune: FortuneResponse;
  picked: CardSelection[];
  onRestart: () => void;
}) {
  const cat = CATS[category];
  const [yy, mm, dd] = profile.birthDate.split('-');
  const cards = picked.map(p => {
    const c = majorArcana.find(a => a.id === p.id);
    if (!c) throw new Error(`unknown card ${p.id}`);
    return { ...c, reversed: p.reversed };
  });

  const pillarStrings = [pillars.year, pillars.month, pillars.day, pillars.hour];

  return (
    <div style={{
      width: '100%', minHeight: '100dvh', background: 'var(--color-bg)',
      position: 'relative', paddingTop: 0,
    }}>
      {/* ─── header ─── */}
      <header style={{ padding: '14px 28px 4px' }}>
        <SmallCaps color="var(--color-accent)" size={10} tracking={0.48}
                   style={{ marginBottom: 14, whiteSpace: 'nowrap' }}>
          結 · 풀이
        </SmallCaps>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6, flexWrap: 'wrap' }}>
          <h1 style={{
            margin: 0, fontFamily: FONTS.SERIF_KO, fontSize: 30, fontWeight: 500,
            color: 'var(--color-text)', letterSpacing: '0.04em', whiteSpace: 'nowrap',
          }}>{profile.name}</h1>
          <SmallCaps size={10} tracking={0.3} style={{ whiteSpace: 'nowrap' }}>
            {profile.gender}{' · '}{yy}.{mm}.{dd}
          </SmallCaps>
        </div>
        <div style={{
          fontFamily: FONTS.SERIF_KO, fontSize: 13, color: 'var(--color-muted)',
          letterSpacing: '0.08em',
        }}>
          <span style={{ fontFamily: FONTS.SERIF, fontStyle: 'italic', color: 'var(--color-accent)' }}>RE.</span>
          {'  '}{cat.ko}{' · '}
          <em style={{ fontFamily: FONTS.SERIF, fontStyle: 'italic' }}>{cat.en}</em>
        </div>
        <div style={{ marginTop: 16 }}>
          <GoldHairline width={44} />
        </div>
      </header>

      {/* ─── 命式 ─── */}
      <section style={{ padding: '24px 28px 0' }}>
        <SectionTitle han="命式" en="Birth Chart" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {PILLAR_HAN.map((h, i) => {
            const p = pillarStrings[i] ?? '';
            const stem = p.charAt(0) || '·';
            const branch = p.charAt(1) || '·';
            return (
              <div key={h} style={{
                border: '0.6px solid var(--color-text)',
                background: 'var(--color-surface)',
                padding: '12px 4px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                position: 'relative',
              }}>
                <SerifNum size={10} italic>{PILLAR_KO[i]}</SerifNum>
                <div style={{
                  marginTop: 8,
                  fontFamily: FONTS.SERIF_KO, fontSize: 26, fontWeight: 500,
                  color: 'var(--color-text)', lineHeight: 1.05,
                }}>{stem}</div>
                <div style={{
                  fontFamily: FONTS.SERIF_KO, fontSize: 26, fontWeight: 500,
                  color: 'var(--color-text)', lineHeight: 1.05,
                }}>{branch}</div>
                <div style={{
                  marginTop: 8, paddingTop: 6, width: '60%',
                  borderTop: '0.5px solid var(--color-accent)',
                  fontFamily: FONTS.SERIF_KO, fontSize: 11, fontWeight: 600,
                  color: 'var(--color-accent)', textAlign: 'center', letterSpacing: '0.16em',
                }}>{h}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 占 ─── */}
      <section style={{ padding: '36px 28px 0' }}>
        <SectionTitle han="占" en="Three Cards" />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          {cards.map((c, i) => (
            <div key={c.id} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <SmallCaps size={10} tracking={0.4} style={{ fontFamily: FONTS.SERIF_KO }}>
                {SLOTS_HAN[i]}
              </SmallCaps>
              <TarotCard card={c} reversed={c.reversed} width={92} />
              <div style={{ textAlign: 'center', marginTop: 2 }}>
                <SmallCaps size={8} tracking={0.32}>{c.en}</SmallCaps>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 解 ─── */}
      <section style={{ padding: '36px 28px 0' }}>
        <SectionTitle han="解" en="Reading" />
        <Narrative cards={cards} fortune={fortune} />
      </section>

      {/* ─── actions ─── */}
      <div style={{ padding: '32px 28px 30px' }}>
        <PrimaryButton onClick={onRestart}>처 음 으 로</PrimaryButton>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 14 }}>
          <SecondaryLink>저장</SecondaryLink>
          <div style={{ width: 1, height: 10, background: 'var(--color-faint)', alignSelf: 'center' }} />
          <SecondaryLink>공유</SecondaryLink>
        </div>
      </div>
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────

function SectionTitle({ han, en }: { han: string; en: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <SmallCaps color="var(--color-accent)" size={10} tracking={0.42} style={{ whiteSpace: 'nowrap' }}>
        {han} · {en}
      </SmallCaps>
      <div style={{ flex: 1, height: 0.5, background: 'var(--color-faint)' }} />
    </div>
  );
}

// ─── Narrative ────────────────────────────────────────────────

function Narrative({
  cards, fortune,
}: {
  cards: { ko: string; keywords: { upright: string[]; reversed: string[] }; reversed: boolean }[];
  fortune: FortuneResponse;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* gold-corner summary box */}
      <div style={{
        padding: '20px 22px', background: 'var(--color-surface)',
        border: '0.5px solid var(--color-faint)',
        position: 'relative',
      }}>
        <CornerAccent corner="tl" />
        <CornerAccent corner="tr" />
        <CornerAccent corner="bl" />
        <CornerAccent corner="br" />
        <p style={{
          margin: 0, fontFamily: FONTS.SERIF_KO, fontSize: 14, lineHeight: 1.85,
          color: 'var(--color-text)', letterSpacing: '0.02em', textIndent: '1em',
        }}>{fortune.summary}</p>
      </div>

      {/* 3 reading paragraphs */}
      {fortune.cards.map(c => (
        <p key={c.phase} style={{
          margin: 0, fontFamily: FONTS.SERIF_KO, fontSize: 14, lineHeight: 1.95,
          color: 'var(--color-text)', letterSpacing: '0.01em', textIndent: '1em',
          padding: '0 4px',
        }}>{c.reading}</p>
      ))}

      {/* advice — labeled small-caps then paragraph */}
      <div style={{
        marginTop: 4, paddingTop: 14,
        borderTop: '0.5px dashed var(--color-faint)',
      }}>
        <SmallCaps color="var(--color-accent)" size={10} tracking={0.42} style={{ marginBottom: 8 }}>
          一步 · 다음 한 걸음
        </SmallCaps>
        <p style={{
          margin: 0, fontFamily: FONTS.SERIF_KO, fontSize: 14, lineHeight: 1.95,
          color: 'var(--color-text)', letterSpacing: '0.01em', textIndent: '1em',
          padding: '0 4px',
        }}>{fortune.advice}</p>
      </div>

      {/* keyword chips per card */}
      <div style={{
        marginTop: 8, paddingTop: 14,
        borderTop: '0.5px dashed var(--color-faint)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {cards.map((c, i) => {
          const keys = c.reversed ? c.keywords.reversed : c.keywords.upright;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SmallCaps color="var(--color-accent)" size={9} tracking={0.4}
                         style={{ width: 28, fontFamily: FONTS.SERIF_KO }}>
                {SHORT_HAN[i]}
              </SmallCaps>
              <div style={{
                fontFamily: FONTS.SERIF_KO, fontSize: 13, color: 'var(--color-text)',
                fontWeight: 500, minWidth: 86,
              }}>{c.ko}{c.reversed && <span style={{ color: 'var(--color-muted)', fontSize: 11 }}> (역)</span>}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {keys.map((k, j) => (
                  <span key={j} style={{
                    fontFamily: FONTS.SANS, fontSize: 10, color: 'var(--color-muted)',
                    padding: '3px 8px', border: '0.5px solid var(--color-faint)',
                    letterSpacing: '0.06em',
                  }}>{k}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CornerAccent({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const pos =
    corner === 'tl' ? { top: 8,    left: 8   } :
    corner === 'tr' ? { top: 8,    right: 8  } :
    corner === 'bl' ? { bottom: 8, left: 8   } :
                       { bottom: 8, right: 8 };
  const transform =
    corner === 'tr' ? 'translate(14px,0) scaleX(-1)' :
    corner === 'bl' ? 'translate(0,14px) scaleY(-1)' :
    corner === 'br' ? 'translate(14px,14px) scale(-1,-1)' : undefined;
  return (
    <svg
      width="14" height="14" aria-hidden="true"
      style={{ position: 'absolute', ...pos }}
    >
      <path
        d="M3,3 L3,12 M3,3 L12,3"
        fill="none" stroke="var(--color-accent)" strokeWidth="0.7"
        transform={transform}
      />
    </svg>
  );
}
