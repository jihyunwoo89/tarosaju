import type { Route } from 'next';
import Link from 'next/link';
import {
  SmallCaps,
  GoldHairline,
  PrimaryButton,
  SecondaryLink,
  FONTS,
} from '@/components/shared/atoms';

export default function HomePage() {
  return (
    <main style={{
      width: '100%', minHeight: '100dvh', background: 'var(--color-bg)',
      position: 'relative', paddingTop: 54,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* status row — 命·卜 + locale tag */}
      <div style={{ padding: '14px 24px 0', display: 'flex', justifyContent: 'space-between' }}>
        <div
          aria-hidden="true"
          style={{
            fontFamily: FONTS.SERIF_KO, fontSize: 11, color: 'var(--color-muted)',
            letterSpacing: '0.32em', whiteSpace: 'nowrap',
          }}
        >命 · 卜</div>
        <SmallCaps color="var(--color-muted)" size={10} tracking={0.32} style={{ whiteSpace: 'nowrap' }}>
          2026 · KR
        </SmallCaps>
      </div>

      {/* hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '0 32px', textAlign: 'center',
      }}>
        {/* brand mark */}
        <div style={{ marginBottom: 56 }}>
          <SmallCaps color="var(--color-accent)" size={11} tracking={0.6} style={{ marginBottom: 16 }}>
            Tarosaju
          </SmallCaps>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 16, marginBottom: 14,
          }}>
            <GoldHairline width={28} />
            <div
              aria-hidden="true"
              style={{
                fontFamily: FONTS.SERIF_KO, fontSize: 28, color: 'var(--color-text)',
                letterSpacing: '0.32em', fontWeight: 500,
              }}
            >命 · 卜</div>
            <GoldHairline width={28} />
          </div>
          <SmallCaps color="var(--color-muted)" size={9} tracking={0.42}>
            Saju · Tarot
          </SmallCaps>
        </div>

        {/* tagline */}
        <h1 style={{
          margin: 0, fontFamily: FONTS.SERIF_KO,
          fontSize: 28, fontWeight: 500, color: 'var(--color-text)',
          lineHeight: 1.5, letterSpacing: '0.02em', whiteSpace: 'nowrap',
        }}>
          <div>사주의 흐름과</div>
          <div>타로의 한 장면을</div>
          <div style={{ marginTop: 6 }}>
            <span style={{
              fontFamily: FONTS.SERIF, fontStyle: 'italic', fontWeight: 400,
              color: 'var(--color-accent)', letterSpacing: '0.04em',
            }}>한 호흡</span>
            <span style={{ marginLeft: 2 }}>으로 읽다</span>
          </div>
        </h1>

        <div style={{ marginTop: 28 }}>
          <GoldHairline width={48} />
        </div>
        <p style={{
          marginTop: 18, fontFamily: FONTS.SANS, fontSize: 13, color: 'var(--color-muted)',
          lineHeight: 1.7, letterSpacing: '0.02em', maxWidth: 280,
        }}>
          명식의 결과 카드 세 장의 장면을<br />하나의 흐름으로 풀어 드립니다
        </p>
      </div>

      {/* bottom CTA + secondary links */}
      <div style={{ padding: '0 28px 26px' }}>
        <Link href={'/profile' as Route} style={{ display: 'block' }}>
          <PrimaryButton>시 작 하 기</PrimaryButton>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 14 }}>
          <SecondaryLink>지난 명식</SecondaryLink>
          <div style={{ width: 1, height: 10, background: 'var(--color-faint)', alignSelf: 'center' }} />
          <SecondaryLink>소개</SecondaryLink>
        </div>

        {/* footer marks — 5 dots, 3rd is gold */}
        <div style={{
          marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} aria-hidden="true" style={{
              width: 3, height: 3, borderRadius: 2,
              background: i === 2 ? 'var(--color-accent)' : 'var(--color-faint)',
            }} />
          ))}
        </div>
      </div>
    </main>
  );
}
