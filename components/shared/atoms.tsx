'use client';

/**
 * Atomic components sourced from claude.ai/design (shared.jsx).
 * Converted to TSX + CSS-variable-based palette so they consume our token system.
 * Inline styles intentionally preserved — these are presentation-layer pieces
 * with no Tailwind utility classes to inherit.
 */

import type { CSSProperties, ReactNode } from 'react';

const SERIF = "var(--font-display), var(--font-display-kr), 'Fraunces', 'Noto Serif KR', serif";
const SERIF_KO = "var(--font-display-kr), var(--font-display), 'Noto Serif KR', 'Fraunces', serif";
const SANS = "var(--font-body), 'Pretendard Variable', 'Pretendard', system-ui, sans-serif";

// ─── Lines ─────────────────────────────────────────────────────

export function Hairline({ opacity = 1, style }: { opacity?: number; style?: CSSProperties }) {
  return <div style={{ height: 1, background: 'var(--color-border)', opacity, ...style }} />;
}

export function GoldHairline({ width = 40, style }: { width?: number; style?: CSSProperties }) {
  return <div style={{ height: 1, width, background: 'var(--color-accent)', ...style }} />;
}

// ─── Typography atoms ─────────────────────────────────────────

export function SmallCaps({
  children, color, size = 10, tracking = 0.22, style,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  tracking?: number;
  style?: CSSProperties;
}) {
  return (
    <div style={{
      fontFamily: SERIF,
      fontSize: size,
      fontWeight: 500,
      color: color ?? 'var(--color-muted)',
      letterSpacing: `${tracking}em`,
      textTransform: 'uppercase',
      ...style,
    }}>{children}</div>
  );
}

export function SerifNum({
  children, size = 24, color, italic = true, style,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  italic?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span style={{
      fontFamily: SERIF,
      fontSize: size,
      fontStyle: italic ? 'italic' : 'normal',
      fontWeight: 400,
      color: color ?? 'var(--color-accent)',
      letterSpacing: '0.02em',
      ...style,
    }}>{children}</span>
  );
}

// ─── Progress + icons ─────────────────────────────────────────

export function Progress({ current, total = 4 }: { current: number; total?: number }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={Math.min(current + 1, total)}
      aria-label={`단계 ${Math.min(current + 1, total)} / ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{
            width: active ? 18 : 6,
            height: 2,
            background: done || active ? 'var(--color-text)' : 'var(--color-faint)',
            transition: 'all 0.35s ease',
          }} />
        );
      })}
    </div>
  );
}

export function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M11 3 L5 9 L11 15" fill="none" stroke="currentColor"
            strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg width="20" height="6" viewBox="0 0 20 6" aria-hidden="true">
      <circle cx="3" cy="3" r="1.2" fill="currentColor" />
      <circle cx="10" cy="3" r="1.2" fill="currentColor" />
      <circle cx="17" cy="3" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconButton({
  children, onClick, ariaLabel, style,
}: {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  style?: CSSProperties;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} style={{
      width: 36, height: 36, border: 'none', background: 'transparent',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--color-text)', opacity: 0.85, ...style,
    }}>{children}</button>
  );
}

// ─── Composite header pieces ──────────────────────────────────

export function ScreenTopBar({
  current, total, onBack,
}: {
  current: number;
  total: number;
  onBack?: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 22px 0', position: 'relative', zIndex: 2,
    }}>
      <IconButton
        onClick={onBack}
        ariaLabel="뒤로"
        style={{ marginLeft: -8, visibility: current === 0 ? 'hidden' : 'visible' }}
      ><BackIcon /></IconButton>
      <Progress current={current} total={total} />
      <IconButton ariaLabel="더보기" style={{ marginRight: -8 }}><MoreIcon /></IconButton>
    </div>
  );
}

export function ChapterHeading({
  numeral, lines, subtitle,
}: {
  numeral: string;
  lines: string[];
  subtitle?: string;
}) {
  return (
    <div style={{ padding: '14px 28px 8px' }}>
      <SerifNum size={48} italic style={{ display: 'block', lineHeight: 1, marginBottom: 14 }}>
        {numeral}
      </SerifNum>
      <h1 style={{
        margin: 0, fontFamily: SERIF_KO,
        fontSize: 28, fontWeight: 500, color: 'var(--color-text)',
        lineHeight: 1.32, letterSpacing: '0.02em',
      }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </h1>
      <div style={{ marginTop: 14, marginBottom: 8 }}>
        <GoldHairline width={36} />
      </div>
      {subtitle && (
        <div style={{
          fontFamily: SANS,
          fontSize: 12, color: 'var(--color-muted)',
          letterSpacing: '0.04em', lineHeight: 1.6,
        }}>{subtitle}</div>
      )}
    </div>
  );
}

// ─── Buttons ──────────────────────────────────────────────────

export function PrimaryButton({
  children, onClick, disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{
      width: '100%', minHeight: 56, border: 'none',
      background: disabled ? 'transparent' : 'var(--color-text)',
      color: disabled ? 'var(--color-faint)' : 'var(--color-bg)',
      fontFamily: SERIF_KO, fontSize: 14, fontWeight: 500,
      letterSpacing: '0.32em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.25s ease, color 0.25s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      outline: disabled ? '1px solid var(--color-faint)' : 'none',
      position: 'relative',
    }}>
      <span>{children}</span>
    </button>
  );
}

export function SecondaryLink({
  children, onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      fontFamily: SERIF, fontSize: 11, color: 'var(--color-muted)',
      letterSpacing: '0.28em', textTransform: 'uppercase',
      padding: '8px 14px',
    }}>{children}</button>
  );
}

// Font family tokens re-exported for downstream screens (so they can stay
// consistent without redeclaring the cascade).
export const FONTS = { SERIF, SERIF_KO, SANS };
