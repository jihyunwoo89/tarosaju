'use client';

/**
 * CategoryGrid — claude.ai/design source: category-screen.jsx
 *
 * 4 vertical rows, each a button. Sigil block on the left (58x58 with
 * corner ticks) holding the hanja for the category. Korean label + small-caps
 * English tag on top, sub-description below. Arrow on the right.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  Hairline,
  PrimaryButton,
  SmallCaps,
  FONTS,
} from '@/components/shared/atoms';
import { useSession, type Category } from '@/store/session';

const CATEGORIES: {
  v: Category;
  ko: string;
  han: string;
  en: string;
  sub: string;
}[] = [
  { v: '연애', ko: '연애운', han: '緣', en: 'Love',    sub: '관계의 다음 결' },
  { v: '금전', ko: '금전운', han: '富', en: 'Wealth',  sub: '돈의 흐름과 결단' },
  { v: '학업', ko: '학업운', han: '學', en: 'Studies', sub: '집중과 성취' },
  { v: '취업', ko: '취업운', han: '業', en: 'Career',  sub: '기회와 선택' },
];

const CORNER_TICKS = [
  'M2,8 L2,2 L8,2',
  'M50,2 L56,2 L56,8',
  'M2,50 L2,56 L8,56',
  'M50,56 L56,56 L56,50',
];

function CategoryRow({
  item, active, onClick,
}: {
  item: typeof CATEGORIES[0];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        background: 'transparent', border: 'none',
        padding: '20px 0', display: 'flex', alignItems: 'center', gap: 18,
        position: 'relative',
      }}
    >
      {/* hanja sigil block */}
      <div style={{
        width: 58, height: 58, flexShrink: 0,
        background: active ? 'var(--color-text)' : 'transparent',
        border: `0.6px solid ${active ? 'var(--color-text)' : 'var(--color-faint)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', transition: 'all 0.25s ease',
      }}>
        <div style={{
          fontFamily: FONTS.SERIF_KO, fontSize: 30, fontWeight: 500,
          color: active ? 'var(--color-accent-soft)' : 'var(--color-text)',
          transition: 'color 0.25s',
        }}>{item.han}</div>
        <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 58 58" aria-hidden="true">
          {CORNER_TICKS.map((d, i) => (
            <path key={i} d={d} fill="none"
                  stroke={active ? 'var(--color-accent)' : 'var(--color-text)'}
                  strokeWidth="0.7" opacity={active ? 1 : 0.55} />
          ))}
        </svg>
      </div>

      {/* labels */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <div style={{
            fontFamily: FONTS.SERIF_KO, fontSize: 22, fontWeight: 500,
            color: 'var(--color-text)', letterSpacing: '0.04em',
          }}>{item.ko}</div>
          <SmallCaps color="var(--color-accent)" size={9} tracking={0.32}>{item.en}</SmallCaps>
        </div>
        <div style={{
          fontFamily: FONTS.SANS, fontSize: 12, color: 'var(--color-muted)',
          letterSpacing: '0.02em',
        }}>{item.sub}</div>
      </div>

      {/* arrow */}
      <div
        aria-hidden="true"
        style={{ flexShrink: 0, color: active ? 'var(--color-text)' : 'var(--color-faint)' }}
      >
        <svg width="22" height="10" viewBox="0 0 22 10">
          <path d="M1 5 L19 5 M14 1 L19 5 L14 9"
                fill="none" stroke="currentColor" strokeWidth="0.8"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

export function CategoryGrid() {
  const router = useRouter();
  const initial = useSession(s => s.category);
  const setCategory = useSession(s => s.setCategory);
  const [selected, setSelected] = useState<Category | null>(initial);

  function go() {
    if (!selected) return;
    setCategory(selected);
    router.push('/draw' as Route);
  }

  return (
    <>
      <div role="radiogroup" aria-label="카테고리" style={{ padding: '14px 28px 0' }}>
        {CATEGORIES.map((c, i) => (
          <div key={c.v}>
            <CategoryRow item={c} active={selected === c.v} onClick={() => setSelected(c.v)} />
            {i < CATEGORIES.length - 1 && <Hairline opacity={0.55} />}
          </div>
        ))}
      </div>

      <div style={{ padding: '32px 28px 30px' }}>
        <PrimaryButton onClick={go} disabled={!selected}>이 운 보 기</PrimaryButton>
      </div>
    </>
  );
}
