'use client';

/**
 * ProfileForm — claude.ai/design source: profile-screen.jsx
 *
 * Composes 5 sub-fields (NameField, GenderChoice, DateField, HourWheel,
 * PillarsPreview) into a single editorial-style input flow. Reads/writes
 * zustand session. Live previews 4-pillar 사주 명식 from lib/saju once all
 * birth fields are populated.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  FONTS,
  GoldHairline,
  SerifNum,
  SmallCaps,
  PrimaryButton,
} from '@/components/shared/atoms';
import { useSession } from '@/store/session';
import { HOUR_BRANCH, computePillars, type HourBranch, type Pillars } from '@/lib/saju';

// Hanja constants — visual layer
const BRANCHES_HAN = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const HOUR_RANGES   = ['23–01','01–03','03–05','05–07','07–09','09–11','11–13','13–15','15–17','17–19','19–21','21–23'];

// ─── FieldLabel ────────────────────────────────────────────────

function FieldLabel({ num, label, sub, done }: { num: string; label: string; sub: string; done: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 10, gap: 10 }}>
      <SerifNum size={13} italic>{num}</SerifNum>
      <div style={{
        fontFamily: FONTS.SERIF_KO, fontSize: 13, color: 'var(--color-text)',
        letterSpacing: '0.14em', fontWeight: 500,
      }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: 'var(--color-faint)', opacity: 0.5, marginBottom: 2 }} />
      <SmallCaps size={9} tracking={0.32}>{sub}</SmallCaps>
      {done && (
        <svg width="11" height="11" viewBox="0 0 12 12" style={{ marginLeft: 4 }} aria-hidden="true">
          <path d="M2 6 L5 9 L10 3" fill="none" stroke="var(--color-accent)"
                strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ─── Name field ────────────────────────────────────────────────

function NameField({
  value, onChange, focus, setFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  focus: string | null;
  setFocus: (f: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const isFocused = focus === 'name';
  return (
    <div onClick={() => ref.current?.focus()} style={{ cursor: 'text' }}>
      <FieldLabel num="01" label="이름" sub="NAME" done={value.length > 0} />
      <div style={{ position: 'relative' }}>
        <input
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocus('name')}
          onBlur={() => setFocus(null)}
          placeholder="홍 길 동"
          maxLength={20}
          aria-label="이름"
          style={{
            width: '100%', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: FONTS.SERIF_KO, fontSize: 22, fontWeight: 500, color: 'var(--color-text)',
            letterSpacing: '0.18em', padding: '4px 0 10px',
          }}
        />
        <div style={{
          height: 1,
          background: isFocused ? 'var(--color-text)' : 'var(--color-faint)',
          transition: 'background 0.2s',
        }} />
      </div>
    </div>
  );
}

// ─── Gender choice ─────────────────────────────────────────────

function GenderChoice({
  value, onChange,
}: {
  value: '남' | '여' | null;
  onChange: (v: '남' | '여') => void;
}) {
  const opts: { v: '남' | '여'; han: string; ko: string }[] = [
    { v: '남', han: '男', ko: '남자' },
    { v: '여', han: '女', ko: '여자' },
  ];
  return (
    <div>
      <FieldLabel num="02" label="성별" sub="Gender" done={value !== null} />
      <div style={{ display: 'flex', gap: 12 }} role="radiogroup" aria-label="성별">
        {opts.map(o => {
          const active = value === o.v;
          return (
            <button
              key={o.v}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.v)}
              style={{
                flex: 1, padding: '14px 0', cursor: 'pointer',
                border: `1px solid ${active ? 'var(--color-text)' : 'var(--color-faint)'}`,
                background: active ? 'var(--color-text)' : 'transparent',
                color: active ? 'var(--color-bg)' : 'var(--color-text)',
                transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <div style={{
                fontFamily: FONTS.SERIF_KO, fontSize: 22, fontWeight: 500,
                color: active ? 'var(--color-accent-soft)' : 'var(--color-text)',
              }}>{o.han}</div>
              <div style={{
                fontFamily: FONTS.SANS, fontSize: 11, letterSpacing: '0.2em',
                color: active ? 'var(--color-bg)' : 'var(--color-muted)',
              }}>{o.ko}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Date field (y / m / d) ────────────────────────────────────

function DateField({
  y, m, d, setY, setM, setD, focus, setFocus,
}: {
  y: number; m: number; d: number;
  setY: (v: number) => void; setM: (v: number) => void; setD: (v: number) => void;
  focus: string | null; setFocus: (f: string | null) => void;
}) {
  const done = y > 0 && m > 0 && d > 0;
  const cell = (
    val: number,
    key: 'y' | 'm' | 'd',
    max: number,
    setter: (n: number) => void,
    wide?: boolean,
  ) => {
    const isFocused = focus === `date-${key}`;
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        flex: wide ? 2 : 1,
      }}>
        <input
          value={val || ''}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, '').slice(0, key === 'y' ? 4 : 2);
            const n = v === '' ? 0 : parseInt(v, 10);
            if (n > max) return;
            setter(n);
          }}
          onFocus={() => setFocus(`date-${key}`)}
          onBlur={() => setFocus(null)}
          placeholder={key === 'y' ? '1995' : '00'}
          inputMode="numeric"
          aria-label={key === 'y' ? '출생 년도' : key === 'm' ? '출생 월' : '출생 일'}
          style={{
            width: '100%', textAlign: 'center', border: 'none', outline: 'none',
            background: 'transparent',
            fontFamily: FONTS.SERIF, fontWeight: 400, fontSize: 26, color: 'var(--color-text)',
            padding: '4px 0 8px', letterSpacing: '0.04em',
          }}
        />
        <div style={{
          height: 1, width: '100%',
          background: isFocused ? 'var(--color-text)' : 'var(--color-faint)',
        }} />
        <div style={{
          marginTop: 6,
          fontFamily: FONTS.SERIF_KO, fontSize: 10,
          letterSpacing: '0.3em', color: 'var(--color-muted)',
        }}>{key === 'y' ? '년' : key === 'm' ? '월' : '일'}</div>
      </div>
    );
  };
  return (
    <div>
      <FieldLabel num="03" label="양력 생년월일" sub="Birth" done={done} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {cell(y, 'y', 2099, setY, true)}
        {cell(m, 'm', 12, setM)}
        {cell(d, 'd', 31, setD)}
      </div>
    </div>
  );
}

// ─── Hour wheel (12지 SVG ring) ────────────────────────────────

function HourWheel({
  value, onChange,
}: {
  value: number | null;       // index 0..11
  onChange: (i: number) => void;
}) {
  const size = 256;
  const cx = size / 2, cy = size / 2;
  const outerR = 118, innerR = 76, labelR = 98;
  const segAngle = 360 / 12;
  const angleFor = (i: number) => -90 + i * segAngle;
  const done = value !== null;

  return (
    <div>
      <FieldLabel num="04" label="태어난 시" sub="Hour · 時辰" done={done} />
      <div style={{ position: 'relative', width: size, height: size, margin: '8px auto 0' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="radiogroup" aria-label="태어난 시">
          <circle cx={cx} cy={cy} r={outerR} fill="none"
                  stroke="var(--color-text)" strokeWidth="0.6" opacity="0.7" />
          <circle cx={cx} cy={cy} r={innerR} fill="none"
                  stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.6" />

          {BRANCHES_HAN.map((_, i) => {
            const a = (angleFor(i) - segAngle / 2) * Math.PI / 180;
            return (
              <line key={`t${i}`}
                    x1={cx + (innerR + 1) * Math.cos(a)} y1={cy + (innerR + 1) * Math.sin(a)}
                    x2={cx + (outerR - 1) * Math.cos(a)} y2={cy + (outerR - 1) * Math.sin(a)}
                    stroke="var(--color-faint)" strokeWidth="0.5" />
            );
          })}

          {done && (() => {
            const a1 = (angleFor(value!) - segAngle / 2) * Math.PI / 180;
            const a2 = (angleFor(value!) + segAngle / 2) * Math.PI / 180;
            const r1 = innerR + 1, r2 = outerR - 1;
            const x1 = cx + r1 * Math.cos(a1), y1 = cy + r1 * Math.sin(a1);
            const x2 = cx + r2 * Math.cos(a1), y2 = cy + r2 * Math.sin(a1);
            const x3 = cx + r2 * Math.cos(a2), y3 = cy + r2 * Math.sin(a2);
            const x4 = cx + r1 * Math.cos(a2), y4 = cy + r1 * Math.sin(a2);
            return (
              <path d={`M ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${r1} ${r1} 0 0 0 ${x1} ${y1} Z`}
                    fill="var(--color-accent-soft)" opacity="0.6" />
            );
          })()}

          {BRANCHES_HAN.map((b, i) => {
            const active = value === i;
            const a = angleFor(i) * Math.PI / 180;
            const x = cx + labelR * Math.cos(a);
            const y = cy + labelR * Math.sin(a);
            return (
              <g key={`l${i}`}
                 role="radio"
                 aria-checked={active}
                 aria-label={`${b} ${HOUR_RANGES[i]}`}
                 onClick={() => onChange(i)}
                 style={{ cursor: 'pointer' }}>
                <circle cx={x} cy={y} r={16} fill="transparent" />
                <text x={x} y={y + 6} textAnchor="middle"
                      fontFamily="var(--font-display-kr), 'Noto Serif KR', serif"
                      fontSize={active ? 19 : 16}
                      fontWeight={active ? 600 : 400}
                      fill={active ? 'var(--color-text)' : 'var(--color-muted)'}>{b}</text>
              </g>
            );
          })}

          <circle cx={cx} cy={cy - outerR} r="2.2" fill="var(--color-accent)" />

          {done ? (
            <g>
              <text x={cx} y={cy - 14} textAnchor="middle"
                    fontFamily="var(--font-display), 'Fraunces', serif" fontStyle="italic"
                    fontSize="10" fill="var(--color-accent)" letterSpacing="0.32em">時 · HOUR</text>
              <text x={cx} y={cy + 16} textAnchor="middle"
                    fontFamily="var(--font-display-kr), 'Noto Serif KR', serif" fontWeight="500"
                    fontSize="36" fill="var(--color-text)">{BRANCHES_HAN[value!]}</text>
              <text x={cx} y={cy + 36} textAnchor="middle"
                    fontFamily="var(--font-display-kr), 'Noto Serif KR', serif"
                    fontSize="11" fill="var(--color-muted)" letterSpacing="0.18em">
                {HOUR_BRANCH[value!]}시 · {HOUR_RANGES[value!]}
              </text>
            </g>
          ) : (
            <g>
              <text x={cx} y={cy - 2} textAnchor="middle"
                    fontFamily="var(--font-display-kr), 'Noto Serif KR', serif"
                    fontSize="11" fill="var(--color-muted)" letterSpacing="0.18em">태어난 시를</text>
              <text x={cx} y={cy + 16} textAnchor="middle"
                    fontFamily="var(--font-display-kr), 'Noto Serif KR', serif"
                    fontSize="11" fill="var(--color-muted)" letterSpacing="0.18em">골라 주세요</text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

// ─── Live pillars preview (renders only when all 4 birth fields done) ──

function PillarsPreview({ pillars }: { pillars: Pillars | null }) {
  const headers = ['年', '月', '日', '時'];
  const sub = ['년주', '월주', '일주', '시주'];
  const labels = ['Y', 'M', 'D', 'H'];
  const keys: (keyof Pillars)[] = ['year', 'month', 'day', 'hour'];
  return (
    <div style={{ padding: '0 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <GoldHairline width={24} />
        <SmallCaps size={10} tracking={0.32}>명식 미리보기 · Preview</SmallCaps>
        <div style={{ flex: 1, height: 1, background: 'var(--color-faint)', opacity: 0.5 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {keys.map((k, i) => {
          const p = pillars?.[k] ?? null;
          const stem = p ? p.charAt(0) : null;
          const branch = p ? p.charAt(1) : null;
          const filled = !!p;
          return (
            <div key={k} style={{
              position: 'relative',
              border: `0.5px solid ${filled ? 'var(--color-text)' : 'var(--color-faint)'}`,
              background: filled ? 'var(--color-surface)' : 'transparent',
              padding: '12px 4px 10px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              transition: 'all 0.3s ease',
              opacity: filled ? 1 : 0.6,
            }}>
              <SerifNum size={10} italic>{labels[i]}</SerifNum>
              <div style={{
                fontFamily: FONTS.SERIF_KO, fontSize: 24, fontWeight: 500,
                color: filled ? 'var(--color-text)' : 'var(--color-faint)',
                lineHeight: 1.05, marginTop: 6, minHeight: 28,
              }}>{stem || '·'}</div>
              <div style={{
                fontFamily: FONTS.SERIF_KO, fontSize: 24, fontWeight: 500,
                color: filled ? 'var(--color-text)' : 'var(--color-faint)',
                lineHeight: 1.05, minHeight: 28,
              }}>{branch || '·'}</div>
              <div style={{
                marginTop: 6, paddingTop: 6, width: '60%',
                borderTop: `0.5px solid ${filled ? 'var(--color-accent)' : 'var(--color-faint)'}`,
                fontFamily: FONTS.SERIF_KO, fontSize: 12, fontWeight: 500,
                color: filled ? 'var(--color-accent)' : 'var(--color-faint)',
                textAlign: 'center', letterSpacing: '0.1em',
              }}>{headers[i]}</div>
              <SmallCaps size={8} tracking={0.28} style={{ marginTop: 2 }}>{sub[i]}</SmallCaps>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────

export function ProfileForm() {
  const router = useRouter();
  const initial = useSession(s => s.profile);
  const setProfile = useSession(s => s.setProfile);

  const [name, setName] = useState(initial?.name ?? '');
  const [gender, setGender] = useState<'남' | '여' | null>(initial?.gender ?? null);
  const [y, setY] = useState<number>(() => initial ? Number(initial.birthDate.slice(0, 4)) : 0);
  const [m, setM] = useState<number>(() => initial ? Number(initial.birthDate.slice(5, 7)) : 0);
  const [d, setD] = useState<number>(() => initial ? Number(initial.birthDate.slice(8, 10)) : 0);
  const [hourIdx, setHourIdx] = useState<number | null>(() => {
    if (!initial) return null;
    const i = HOUR_BRANCH.indexOf(initial.hourBranch);
    return i >= 0 ? i : null;
  });
  const [focus, setFocus] = useState<string | null>(null);

  const pillars = useMemo<Pillars | null>(() => {
    if (y < 1900 || y > 2099 || m < 1 || m > 12 || d < 1 || d > 31 || hourIdx === null) {
      return null;
    }
    try {
      return computePillars({ year: y, month: m, day: d, hourBranch: HOUR_BRANCH[hourIdx]! });
    } catch {
      return null;
    }
  }, [y, m, d, hourIdx]);

  const allDone = name.length > 0 && gender !== null && pillars !== null;

  function handleNext() {
    if (!allDone || !gender || hourIdx === null) return;
    const pad = (n: number) => String(n).padStart(2, '0');
    setProfile({
      name: name.trim(),
      gender,
      birthDate: `${y}-${pad(m)}-${pad(d)}`,
      hourBranch: HOUR_BRANCH[hourIdx]!,
    });
    router.push('/category' as Route);
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: '14px 28px 0' }}>
        <NameField value={name} onChange={setName} focus={focus} setFocus={setFocus} />
        <GenderChoice value={gender} onChange={setGender} />
        <DateField y={y} m={m} d={d} setY={setY} setM={setM} setD={setD} focus={focus} setFocus={setFocus} />
        <HourWheel value={hourIdx} onChange={setHourIdx} />
      </div>

      <div style={{ marginTop: 22 }}>
        <PillarsPreview pillars={pillars} />
      </div>

      <div style={{ padding: '24px 28px 30px' }}>
        <PrimaryButton onClick={handleNext} disabled={!allDone}>다 음</PrimaryButton>
      </div>
    </>
  );
}
