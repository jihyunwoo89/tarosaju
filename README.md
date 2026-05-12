# Tarosaju

> 사주 명식과 타로 카드 3 장을 한 흐름에서 융합 해석하는 한국어 모바일 웹.

- **목적**: 개인 포트폴리오 (디자인·애니메이션 완성도 중심)
- **스택**: Next.js 15 App Router · TypeScript · Tailwind · Framer Motion · Gemini API · lunar-javascript · zustand

## 빠른 시작

```bash
npm install
cp .env.example .env.local
# .env.local 의 GEMINI_API_KEY 채우기 (https://aistudio.google.com/apikey)

npm run dev
```
열기: <http://localhost:3000>

## 환경 변수

| 키 | 필수 | 비고 |
|---|---|---|
| `GEMINI_API_KEY` | ✓ | 서버 사이드만 — 클라이언트에 노출 X |
| `GEMINI_MODEL` | — | 기본 `gemini-2.0-flash` |

## 명령어

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build && npm run start` | 프로덕션 빌드+실행 |
| `npm run typecheck` | TS 타입 검증 |
| `npm run test:run` | 단위/통합 테스트 (Vitest) |
| `npm run test:e2e` | E2E (Playwright) |
| `npm run lint` | ESLint |

## Vercel 배포

1. Vercel 에 import (`Next.js` 자동 감지)
2. 환경변수에 `GEMINI_API_KEY` 추가 (Production / Preview)
3. Deploy

## 알려진 한계 (v1)

- **카드 22 장 / 디자인 토큰**: 현재 placeholder. Task 24–25 에서 `claude.ai/design` 결과물로 교체 예정.
- **Lighthouse Performance ≈ 55**: 폰트(Pretendard 2MB + Noto Serif KR 3 weight) 로딩 비용. v1.1 에서 폰트 subset / preload 로 ≥90 목표.
- **`autoPick(idle)` stale closure**: `자동으로 3 장 뽑기` 버튼을 셔플 전에 누르면 빈 카드 배열로 실행됨. 우회: 한번 셔플 후 누르기. v1.1 fix 예정.
- **`/result` 에 URL 공유 없음**: zustand sessionStorage 의존이라 URL 만으로 결과 복원 불가. 캡처 공유는 가능.
- **다크 모드**: OS 시스템 따름, 사용자 토글 없음.
- **`prefers-reduced-motion`**: 시퀀스 즉시 표시로 강등됨.

## 테스트 단위

- 단위/통합 (Vitest): saju / tarot / schema / prompt / API route — 40+ tests
- E2E (Playwright, iPhone 13): happy / reduced-motion / route-guard / api-retry / refresh = 8 tests
- a11y (axe-core, 4 화면): 0 violations (2 rules 임시 비활성 — ProgressDots `aria-label`, CategoryGrid `<li role="none">` v1.1 fix)
- 시각 회귀 (Playwright snapshots): home / profile / result 3 baseline

## 브라우저 설치

```bash
npx playwright install --with-deps chromium webkit
```

(`iPhone 13` device 가 WebKit 기반)

## 문서

- 설계서: [`docs/superpowers/specs/2026-05-12-tarot-saju-web-design.md`](docs/superpowers/specs/2026-05-12-tarot-saju-web-design.md)
- 구현 계획: [`docs/superpowers/plans/2026-05-12-tarot-saju-web.md`](docs/superpowers/plans/2026-05-12-tarot-saju-web.md)
- 디자인 노트: [`DESIGN_NOTES.md`](DESIGN_NOTES.md)

## 라이센스

MIT. 폰트: Fraunces (OFL), Noto Serif KR (OFL), Pretendard (OFL).
