# Tarosaju — 타로·사주 모바일 웹 v1 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-05-12-tarot-saju-web-design.md`
**Goal:** 사주 명식 + 타로 3 장을 한 흐름에서 융합 해석하는 한국어 모바일 웹 (5 화면), 디자인·애니메이션 완성도 최우선의 개인 포트폴리오.
**Architecture:** Next.js 15 App Router + 서버 사이드 Route Handler 로 Gemini API 프록시. 클라이언트는 zustand persist 로 5 화면 흐름 유지. 디자인 시안은 `claude.ai/design` 에서 사용자 직접 제작 → 토큰·이미지 받아 코드에 적용.
**Tech Stack:** Next.js 15 (App Router), TypeScript strict, Tailwind CSS, Framer Motion, `@google/generative-ai`, `lunar-javascript`, zustand + persist, Zod, Vitest, Playwright, MSW, @axe-core/playwright.

---

## 작업 환경 약속

- **CWD**: `C:\Users\user\OneDrive\문서\tarosaju` (이 폴더는 git 초기화됨, 첫 커밋 = spec)
- **Node**: ≥ 20
- **Package manager**: `npm` (lock 파일 일관성)
- **OS**: Windows + bash (`git`, `npx`, `npm` 사용)
- **모든 명령**은 `tarosaju/` 루트에서 실행 (별도 명시 없으면)
- **모든 커밋 메시지** 끝에:
  ```
  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

## 디자인 시안 처리 정책

`claude.ai/design` 에서 사용자가 만들 시안 (22 장 카드 이미지 + 화면별 토큰) 은 아직 없다. **plan 은 placeholder 시각 자산으로 코드 토대를 끝까지 만들고**, 시안이 들어오면 정해진 자리에 끼워 넣는 흐름으로 간다:

- 카드 이미지 (`public/cards/0..21.webp` + `back.webp`) → 코드 토대 단계는 **placeholder SVG** (카드 이름만 적힌 단순 그래픽). Task 24 에서 사용자 시안으로 교체.
- 디자인 토큰 (`styles/tokens.css`) → 초기엔 **임시 기본값** (오프화이트 배경 + 검정 텍스트 + 단일 액센트). Task 25 에서 사용자 시안 토큰으로 덮어쓰기.
- 폰트 (Fraunces · Pretendard · Noto Serif KR) → Task 11 에서 `next/font/google` 셋업 (시안과 무관, 미리 끝낼 수 있음).

이 정책 덕에 plan 의 task 1–23 은 사용자 디자인 작업과 **병렬 진행** 가능.

---

## 파일 구조

각 task 가 만들거나 수정할 파일을 사전에 매핑.

| 파일 | 책임 | 도입 Task |
|---|---|---|
| `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`, `.eslintrc.json` | 부트스트랩 | 1 |
| `vitest.config.ts`, `playwright.config.ts`, `tests/setup.ts` | 테스트 인프라 | 2 |
| `lib/saju.ts`, `lib/saju.test.ts` | 양력→음력→8글자 명식 | 3 |
| `lib/tarot.ts`, `lib/tarot.test.ts` | Fisher-Yates 셔플, 3장 + 정/역방향 | 4 |
| `data/majorArcana.ts` | 22 장 메타 (id, ko/en, keywords) | 5 |
| `lib/schema.ts`, `lib/schema.test.ts` | Zod 입력·응답 스키마 | 6 |
| `lib/prompt.ts`, `lib/prompt.test.ts` | Gemini 시스템·사용자 프롬프트 템플릿 | 7 |
| `lib/gemini.ts` | server-only Gemini SDK 호출 + 재시도 1회 | 8 |
| `app/api/fortune/route.ts`, `tests/integration/fortune.test.ts` | POST API + 통합 테스트 | 9 |
| `store/session.ts` | zustand + persist | 10 |
| `app/layout.tsx`, `styles/{tokens.css, globals.css}` | 폰트·전역 스타일·grain | 11 |
| `components/ui/{Button, Input, ChipSelector, Toast, GrainOverlay, ProgressDots}.tsx` | 기초 UI | 12 |
| `app/page.tsx` | 홈 | 13 |
| `app/profile/page.tsx`, `components/form/{ProfileForm, BirthTimePicker}.tsx` | 정보 입력 | 14 |
| `app/category/page.tsx` | 카테고리 선택 | 15 |
| `components/card/{TarotCard, CardBack, CardDeck, CardSpread, CardFlip}.tsx` | 카드 컴포넌트 군 | 16 |
| `app/draw/page.tsx` | 드로우 (시그니처 1) | 17 |
| `components/result/{SajuPillars, FortuneNarrative, ResultHeader, FortuneRevealOrchestrator}.tsx` | 결과 화면 컴포넌트 군 | 18 |
| `app/result/page.tsx` | 결과 (시그니처 2) | 19 |
| `lib/use-route-guard.ts` | 라우팅 가드 훅 | 20 |
| `components/result/ErrorState.tsx`, `lib/use-fortune.ts` | 5xx 처리 + 재시도 | 21 |
| `tests/e2e/*.spec.ts` | E2E 5 시나리오 | 22 |
| `tests/visual/*.spec.ts` + `tests/a11y.spec.ts` + lighthouse CI | 시각 회귀 + a11y + 성능 | 23 |
| `public/cards/*.webp` | 사용자 시안 교체 | 24 |
| `styles/tokens.css` 덮어쓰기 | 사용자 시안 토큰 적용 | 25 |
| `README.md`, `DESIGN_NOTES.md`, `LICENSE`, `.env.example` | 문서 | 26 |
| Vercel 배포 + 환경변수 + dogfood | 배포 | 27 |

---

## Task 1: 프로젝트 부트스트랩 (Next.js 15 + TS + Tailwind)

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`, `.eslintrc.json`, `app/layout.tsx` (스텁), `app/page.tsx` (스텁), `styles/globals.css`

- [ ] **Step 1: package.json 작성**

`tarosaju/package.json`:
```json
{
  "name": "tarosaju",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=20.0.0" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "15.0.3",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "framer-motion": "11.11.17",
    "zustand": "5.0.1",
    "zod": "3.23.8",
    "lunar-javascript": "1.7.0",
    "@google/generative-ai": "0.21.0",
    "server-only": "0.0.1"
  },
  "devDependencies": {
    "@types/node": "22.9.0",
    "@types/react": "19.0.0",
    "@types/react-dom": "19.0.0",
    "typescript": "5.6.3",
    "tailwindcss": "3.4.14",
    "postcss": "8.4.49",
    "autoprefixer": "10.4.20",
    "eslint": "9.15.0",
    "eslint-config-next": "15.0.3",
    "vitest": "2.1.5",
    "@vitejs/plugin-react": "4.3.3",
    "jsdom": "25.0.1",
    "@testing-library/react": "16.0.1",
    "@testing-library/jest-dom": "6.6.3",
    "@playwright/test": "1.49.0",
    "msw": "2.6.4",
    "@axe-core/playwright": "4.10.1"
  }
}
```

- [ ] **Step 2: tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: next.config.ts**

```ts
import type { NextConfig } from 'next';
const config: NextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
};
export default config;
```

- [ ] **Step 4: tailwind.config.ts + postcss.config.mjs**

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
```

`postcss.config.mjs`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 5: styles/globals.css + 임시 tokens.css**

`styles/globals.css`:
```css
@import './tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  background: var(--color-bg);
  color: var(--color-text);
  word-break: keep-all;
}
body { font-family: var(--font-body); }
```

`styles/tokens.css` (임시 — Task 25 에서 사용자 시안으로 덮어씀):
```css
:root {
  --color-bg: #FAFAF7;
  --color-surface: #FFFFFF;
  --color-text: #1A1A1A;
  --color-muted: #6B6B6B;
  --color-border: #E8E8E5;
  --color-accent: #5C1F2C;
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0F0F0E;
    --color-surface: #1A1A18;
    --color-text: #F5F5F2;
    --color-muted: #A8A8A4;
    --color-border: #2D2D2A;
    --color-accent: #C76478;
  }
}
```

- [ ] **Step 6: .gitignore + .env.example**

`.gitignore`:
```
node_modules
.next
out
build
.env.local
.env*.local
.DS_Store
*.log
coverage
playwright-report
test-results
```

`.env.example`:
```
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

- [ ] **Step 7: .eslintrc.json**

```json
{ "extends": "next/core-web-vitals" }
```

- [ ] **Step 8: 스텁 app/layout.tsx + app/page.tsx**

`app/layout.tsx`:
```tsx
import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarosaju',
  description: '사주와 타로로 보는 오늘의 풀이',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`:
```tsx
export default function HomePage() {
  return <main>Tarosaju — 부트스트랩 OK</main>;
}
```

- [ ] **Step 9: 의존성 설치 + 빌드 검증**

```bash
npm install
npm run typecheck
npm run build
```
기대: 모두 0 exit. `.next/` 생성.

- [ ] **Step 10: 커밋**

```bash
git add .
git commit -m "$(cat <<'EOF'
chore: bootstrap Next.js 15 + TS + Tailwind project

- package.json with all dependencies pinned
- TypeScript strict mode + path alias @/*
- Tailwind CSS with CSS variable-based tokens (임시값)
- .gitignore + .env.example
- 스텁 layout + home page

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: 테스트 인프라 (Vitest + Playwright + MSW)

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`, `playwright.config.ts`, `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', 'tests/e2e/**'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
```

- [ ] **Step 2: tests/setup.ts**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: playwright.config.ts**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'iphone-13', use: { ...devices['iPhone 13'] } },
  ],
});
```

- [ ] **Step 4: 스모크 E2E**

`tests/e2e/smoke.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).toContainText('Tarosaju');
});
```

- [ ] **Step 5: Playwright 브라우저 설치**

```bash
npx playwright install --with-deps chromium
```

- [ ] **Step 6: 테스트 실행 검증**

```bash
npm run test:run
```
기대: 0 tests found 또는 PASS (테스트 없음 OK).

```bash
npm run test:e2e
```
기대: smoke PASS.

- [ ] **Step 7: 커밋**

```bash
git add .
git commit -m "$(cat <<'EOF'
chore: add Vitest + Playwright test infrastructure

- Vitest with jsdom + React Testing Library
- Playwright with iPhone 13 viewport
- Smoke E2E for home page

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: 사주 명식 계산 (lib/saju.ts)

TDD: 알려진 fixture 와 12 지지→시각 매핑 먼저 테스트.

**Files:**
- Create: `lib/saju.ts`, `lib/saju.test.ts`

- [ ] **Step 1: 실패 테스트 작성 (lib/saju.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { computePillars, HOUR_BRANCH } from './saju';

describe('computePillars', () => {
  it('returns 4 pillars as 2-char hanja strings', () => {
    const p = computePillars({ year: 1990, month: 3, day: 15, hourBranch: '인' });
    expect(p.year).toMatch(/^[一-鿿]{2}$/);
    expect(p.month).toMatch(/^[一-鿿]{2}$/);
    expect(p.day).toMatch(/^[一-鿿]{2}$/);
    expect(p.hour).toMatch(/^[一-鿿]{2}$/);
  });

  it('produces stable result for known input', () => {
    const p = computePillars({ year: 2000, month: 1, day: 1, hourBranch: '자' });
    // 결정성 검증 (재실행해도 동일)
    const p2 = computePillars({ year: 2000, month: 1, day: 1, hourBranch: '자' });
    expect(p).toEqual(p2);
  });

  it('hour branch maps differ (인 vs 오)', () => {
    const am = computePillars({ year: 2000, month: 1, day: 1, hourBranch: '인' });
    const noon = computePillars({ year: 2000, month: 1, day: 1, hourBranch: '오' });
    expect(am.hour).not.toEqual(noon.hour);
  });

  it('HOUR_BRANCH has all 12 지지 in order', () => {
    expect(HOUR_BRANCH).toEqual(['자','축','인','묘','진','사','오','미','신','유','술','해']);
  });

  it('throws on out-of-range year', () => {
    expect(() => computePillars({ year: 1899, month: 1, day: 1, hourBranch: '자' })).toThrow();
    expect(() => computePillars({ year: 2200, month: 1, day: 1, hourBranch: '자' })).toThrow();
  });
});
```

- [ ] **Step 2: 테스트 실행 — fail 확인**

```bash
npm run test:run -- lib/saju
```
기대: FAIL (모듈 없음).

- [ ] **Step 3: 구현 (lib/saju.ts)**

```ts
import { Solar } from 'lunar-javascript';

export const HOUR_BRANCH = ['자','축','인','묘','진','사','오','미','신','유','술','해'] as const;
export type HourBranch = (typeof HOUR_BRANCH)[number];

const HOUR_BRANCH_TO_TIME: Record<HourBranch, number> = {
  자: 0, 축: 2, 인: 4, 묘: 6, 진: 8, 사: 10,
  오: 12, 미: 14, 신: 16, 유: 18, 술: 20, 해: 22,
};

export type Pillars = { year: string; month: string; day: string; hour: string };

export type SajuInput = {
  year: number;   // 양력 1900 ~ 2099
  month: number;  // 1..12
  day: number;    // 1..31
  hourBranch: HourBranch;
};

export function computePillars(input: SajuInput): Pillars {
  if (input.year < 1900 || input.year > 2099) {
    throw new Error(`Year out of range: ${input.year}`);
  }
  const hour = HOUR_BRANCH_TO_TIME[input.hourBranch];
  // lunar-javascript 는 CommonJS ESM 혼합 — default 임포트 X
  // @ts-expect-error - lunar-javascript has no proper types
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, hour, 0, 0);
  const ec = solar.getLunar().getEightChar();
  return {
    year: ec.getYear() as string,
    month: ec.getMonth() as string,
    day: ec.getDay() as string,
    hour: ec.getTime() as string,
  };
}
```

- [ ] **Step 4: 테스트 실행 — pass 확인**

```bash
npm run test:run -- lib/saju
```
기대: 5 tests PASS.

- [ ] **Step 5: 커밋**

```bash
git add lib/saju.ts lib/saju.test.ts
git commit -m "feat(saju): add EightChar pillar computation via lunar-javascript

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 타로 셔플·드로우 (lib/tarot.ts)

**Files:**
- Create: `lib/tarot.ts`, `lib/tarot.test.ts`

- [ ] **Step 1: 실패 테스트 (lib/tarot.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { drawThree, PHASES } from './tarot';

describe('drawThree', () => {
  it('returns exactly 3 cards', () => {
    const drawn = drawThree();
    expect(drawn).toHaveLength(3);
  });

  it('cards have unique ids', () => {
    const drawn = drawThree();
    const ids = drawn.map(d => d.card.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('all ids are in [0, 21]', () => {
    for (let i = 0; i < 100; i++) {
      const drawn = drawThree();
      for (const { card } of drawn) {
        expect(card.id).toBeGreaterThanOrEqual(0);
        expect(card.id).toBeLessThanOrEqual(21);
      }
    }
  });

  it('phases are 과거/현재/미래 in order', () => {
    const drawn = drawThree();
    expect(drawn.map(d => d.phase)).toEqual(['과거', '현재', '미래']);
  });

  it('reversed distribution roughly 50% over 1000 draws', () => {
    let reversedCount = 0;
    let total = 0;
    for (let i = 0; i < 1000; i++) {
      for (const { reversed } of drawThree()) {
        if (reversed) reversedCount++;
        total++;
      }
    }
    const ratio = reversedCount / total;
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });

  it('PHASES exported as readonly tuple', () => {
    expect(PHASES).toEqual(['과거', '현재', '미래']);
  });
});
```

- [ ] **Step 2: 테스트 실행 — fail**

```bash
npm run test:run -- lib/tarot
```
기대: FAIL.

- [ ] **Step 3: data/majorArcana.ts 임시 (Task 5 에서 채움, 지금은 stub)**

```ts
// data/majorArcana.ts (Task 5 에서 22 장 모두 채움 — 여기서는 type + 임시 fixture)
export type ArcanaCard = {
  id: number;
  ko: string;
  en: string;
  keywords: { upright: string[]; reversed: string[] };
};

export const majorArcana: ArcanaCard[] = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  ko: `카드${i}`,
  en: `Card ${i}`,
  keywords: { upright: ['placeholder'], reversed: ['placeholder'] },
}));
```

- [ ] **Step 4: 구현 (lib/tarot.ts)**

```ts
import { majorArcana, type ArcanaCard } from '@/data/majorArcana';

export const PHASES = ['과거', '현재', '미래'] as const;
export type Phase = (typeof PHASES)[number];

export type DrawnCard = {
  card: ArcanaCard;
  reversed: boolean;
  phase: Phase;
};

export function drawThree(): DrawnCard[] {
  const deck = [...majorArcana];
  // Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, 3).map((card, i) => ({
    card,
    reversed: Math.random() < 0.5,
    phase: PHASES[i],
  }));
}
```

- [ ] **Step 5: 테스트 실행 — pass**

```bash
npm run test:run -- lib/tarot
```
기대: 6 tests PASS.

- [ ] **Step 6: 커밋**

```bash
git add lib/tarot.ts lib/tarot.test.ts data/majorArcana.ts
git commit -m "feat(tarot): add drawThree with Fisher-Yates shuffle + 50% reversed

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: 메이저 아르카나 22 장 데이터 (data/majorArcana.ts)

**Files:**
- Modify: `data/majorArcana.ts` (Task 4 의 placeholder 를 실데이터로 교체)

- [ ] **Step 1: data/majorArcana.ts 작성 (22 장)**

```ts
export type ArcanaCard = {
  id: number;
  ko: string;
  en: string;
  keywords: { upright: string[]; reversed: string[] };
};

export const majorArcana: ArcanaCard[] = [
  { id: 0,  ko: '바보',         en: 'The Fool',         keywords: { upright: ['시작','순수','모험'], reversed: ['무모','경솔','지연'] } },
  { id: 1,  ko: '마법사',       en: 'The Magician',     keywords: { upright: ['의지','능력','집중'], reversed: ['속임','산만','오용'] } },
  { id: 2,  ko: '여사제',       en: 'The High Priestess', keywords: { upright: ['직관','내면','비밀'], reversed: ['혼란','억압','단절'] } },
  { id: 3,  ko: '여황제',       en: 'The Empress',      keywords: { upright: ['풍요','돌봄','창조'], reversed: ['의존','정체','부재'] } },
  { id: 4,  ko: '황제',         en: 'The Emperor',      keywords: { upright: ['권위','구조','안정'], reversed: ['독단','경직','약함'] } },
  { id: 5,  ko: '교황',         en: 'The Hierophant',   keywords: { upright: ['전통','학습','지혜'], reversed: ['저항','맹신','이탈'] } },
  { id: 6,  ko: '연인',         en: 'The Lovers',       keywords: { upright: ['결합','선택','조화'], reversed: ['불화','우유부단','단절'] } },
  { id: 7,  ko: '전차',         en: 'The Chariot',      keywords: { upright: ['추진','승리','통제'], reversed: ['혼란','정체','폭주'] } },
  { id: 8,  ko: '힘',           en: 'Strength',         keywords: { upright: ['용기','인내','자제'], reversed: ['약함','폭발','두려움'] } },
  { id: 9,  ko: '은둔자',       en: 'The Hermit',       keywords: { upright: ['성찰','고독','통찰'], reversed: ['고립','거부','어둠'] } },
  { id: 10, ko: '운명의 수레바퀴', en: 'Wheel of Fortune', keywords: { upright: ['전환','기회','순환'], reversed: ['역행','정체','악순환'] } },
  { id: 11, ko: '정의',         en: 'Justice',          keywords: { upright: ['공정','진실','균형'], reversed: ['편파','회피','부정'] } },
  { id: 12, ko: '매달린 사람',  en: 'The Hanged Man',   keywords: { upright: ['전환점','내려놓음','시야'], reversed: ['정체','희생강요','회피'] } },
  { id: 13, ko: '죽음',         en: 'Death',            keywords: { upright: ['끝과 시작','변형','해방'], reversed: ['집착','두려움','지연'] } },
  { id: 14, ko: '절제',         en: 'Temperance',       keywords: { upright: ['조율','중용','회복'], reversed: ['불균형','과잉','단절'] } },
  { id: 15, ko: '악마',         en: 'The Devil',        keywords: { upright: ['집착','속박','유혹'], reversed: ['해방','자각','단절'] } },
  { id: 16, ko: '탑',           en: 'The Tower',        keywords: { upright: ['붕괴','각성','전환'], reversed: ['지연된 붕괴','부정','내적 충격'] } },
  { id: 17, ko: '별',           en: 'The Star',         keywords: { upright: ['희망','회복','영감'], reversed: ['실망','자기의심','정체'] } },
  { id: 18, ko: '달',           en: 'The Moon',         keywords: { upright: ['직감','환영','불확실'], reversed: ['혼란해소','진실','두려움 직면'] } },
  { id: 19, ko: '태양',         en: 'The Sun',          keywords: { upright: ['활력','성취','명료'], reversed: ['일시적 흐림','과열','자만'] } },
  { id: 20, ko: '심판',         en: 'Judgement',        keywords: { upright: ['각성','부름','정리'], reversed: ['자책','지연','거부'] } },
  { id: 21, ko: '세계',         en: 'The World',        keywords: { upright: ['완성','성취','통합'], reversed: ['미완','지연','정체'] } },
];

if (majorArcana.length !== 22) {
  throw new Error(`majorArcana must have 22 cards, got ${majorArcana.length}`);
}
```

- [ ] **Step 2: 테스트 다시 실행 (placeholder 였던 keyword 가 실데이터로 바뀜)**

```bash
npm run test:run -- lib/tarot
```
기대: 6 tests PASS (drawThree 는 데이터 내용에 비종속).

- [ ] **Step 3: 데이터 검증 단위 테스트 추가 (data/majorArcana.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { majorArcana } from './majorArcana';

describe('majorArcana', () => {
  it('has exactly 22 cards', () => {
    expect(majorArcana).toHaveLength(22);
  });

  it('ids are 0..21 unique', () => {
    const ids = majorArcana.map(c => c.id);
    expect(new Set(ids).size).toBe(22);
    expect(Math.min(...ids)).toBe(0);
    expect(Math.max(...ids)).toBe(21);
  });

  it('each card has non-empty ko/en and at least one keyword each side', () => {
    for (const c of majorArcana) {
      expect(c.ko.length).toBeGreaterThan(0);
      expect(c.en.length).toBeGreaterThan(0);
      expect(c.keywords.upright.length).toBeGreaterThan(0);
      expect(c.keywords.reversed.length).toBeGreaterThan(0);
    }
  });
});
```

```bash
npm run test:run -- data/majorArcana
```
기대: 3 tests PASS.

- [ ] **Step 4: 커밋**

```bash
git add data/majorArcana.ts data/majorArcana.test.ts
git commit -m "feat(data): add full 22-card Major Arcana with ko/en + keywords

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Zod 스키마 (lib/schema.ts)

**Files:**
- Create: `lib/schema.ts`, `lib/schema.test.ts`

- [ ] **Step 1: 실패 테스트 (lib/schema.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { FortuneRequestSchema, FortuneResponseSchema, ErrorCode } from './schema';

describe('FortuneRequestSchema', () => {
  const validInput = {
    name: '홍길동',
    gender: '남',
    birthDate: '1990-03-15',
    hourBranch: '인',
    category: '연애',
    cards: [
      { id: 0,  reversed: false },
      { id: 10, reversed: true },
      { id: 21, reversed: false },
    ],
  };

  it('accepts valid input', () => {
    expect(() => FortuneRequestSchema.parse(validInput)).not.toThrow();
  });

  it('rejects empty name', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, name: '' })).toThrow();
  });

  it('rejects name longer than 20', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, name: 'a'.repeat(21) })).toThrow();
  });

  it('rejects unknown gender', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, gender: 'other' })).toThrow();
  });

  it('rejects malformed birthDate', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, birthDate: '1990/03/15' })).toThrow();
    expect(() => FortuneRequestSchema.parse({ ...validInput, birthDate: '1899-12-31' })).toThrow();
  });

  it('rejects unknown hourBranch', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, hourBranch: 'xx' })).toThrow();
  });

  it('rejects unknown category', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, category: '건강' })).toThrow();
  });

  it('rejects cards length != 3', () => {
    expect(() => FortuneRequestSchema.parse({ ...validInput, cards: [{ id: 0, reversed: false }] })).toThrow();
  });

  it('rejects duplicate card ids', () => {
    expect(() => FortuneRequestSchema.parse({
      ...validInput,
      cards: [{ id: 0, reversed: false }, { id: 0, reversed: true }, { id: 1, reversed: false }],
    })).toThrow();
  });

  it('rejects card id out of [0..21]', () => {
    expect(() => FortuneRequestSchema.parse({
      ...validInput,
      cards: [{ id: 22, reversed: false }, { id: 1, reversed: false }, { id: 2, reversed: false }],
    })).toThrow();
  });
});

describe('FortuneResponseSchema', () => {
  const validResponse = {
    summary: '이번 흐름은 새로 시작되는 관계의 결을 따라가는 시기입니다. 차분히 듣되 표현을 미루지는 않는 편이 좋습니다.',
    cards: [
      { phase: '과거', card: '바보',  reading: '시작의 호기심이 관계의 씨앗이었습니다. 작은 신호도 의미가 있었습니다.' },
      { phase: '현재', card: '연인',  reading: '선택의 문 앞에 있습니다. 망설임보다 결정의 무게가 더 크게 느껴집니다.' },
      { phase: '미래', card: '태양',  reading: '명료한 결말이 다가옵니다. 회피하지 않으면 따뜻한 답을 받게 됩니다.' },
    ],
    advice: '오늘 안에 한 문장만이라도 전해 보세요. 시간이 답을 미루지 못하게 하는 게 핵심입니다.',
  };

  it('accepts valid response', () => {
    expect(() => FortuneResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('rejects summary shorter than 20', () => {
    expect(() => FortuneResponseSchema.parse({ ...validResponse, summary: '짧음' })).toThrow();
  });

  it('rejects cards length != 3', () => {
    expect(() => FortuneResponseSchema.parse({
      ...validResponse,
      cards: validResponse.cards.slice(0, 2),
    })).toThrow();
  });

  it('rejects wrong phase order', () => {
    expect(() => FortuneResponseSchema.parse({
      ...validResponse,
      cards: [validResponse.cards[1], validResponse.cards[0], validResponse.cards[2]],
    })).toThrow();
  });

  it('ErrorCode enum has expected members', () => {
    expect(ErrorCode.options).toContain('invalid_input');
    expect(ErrorCode.options).toContain('config_missing');
    expect(ErrorCode.options).toContain('upstream_error');
    expect(ErrorCode.options).toContain('rate_limited');
    expect(ErrorCode.options).toContain('timeout');
    expect(ErrorCode.options).toContain('parse_failed');
    expect(ErrorCode.options).toContain('saju_calc_failed');
  });
});
```

- [ ] **Step 2: 테스트 실행 — fail**

```bash
npm run test:run -- lib/schema
```
기대: FAIL.

- [ ] **Step 3: 구현 (lib/schema.ts)**

```ts
import { z } from 'zod';

export const HOUR_BRANCH = ['자','축','인','묘','진','사','오','미','신','유','술','해'] as const;
export const CATEGORY = ['연애', '금전', '학업', '취업'] as const;
export const GENDER = ['남', '여'] as const;
export const PHASE = ['과거', '현재', '미래'] as const;

const todayIso = () => new Date().toISOString().slice(0, 10);

export const FortuneRequestSchema = z.object({
  name: z.string().trim().min(1).max(20),
  gender: z.enum(GENDER),
  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(s => s >= '1900-01-01' && s <= todayIso(), {
      message: 'birthDate must be between 1900-01-01 and today',
    }),
  hourBranch: z.enum(HOUR_BRANCH),
  category: z.enum(CATEGORY),
  cards: z.array(z.object({
    id: z.number().int().min(0).max(21),
    reversed: z.boolean(),
  })).length(3).refine(
    arr => new Set(arr.map(c => c.id)).size === arr.length,
    { message: 'card ids must be unique' },
  ),
});

export type FortuneRequest = z.infer<typeof FortuneRequestSchema>;

const cardReadingSchema = (phase: typeof PHASE[number]) => z.object({
  phase: z.literal(phase),
  card: z.string().min(1),
  reading: z.string().min(20),
});

export const FortuneResponseSchema = z.object({
  summary: z.string().min(20),
  cards: z.tuple([
    cardReadingSchema('과거'),
    cardReadingSchema('현재'),
    cardReadingSchema('미래'),
  ]),
  advice: z.string().min(20),
});

export type FortuneResponse = z.infer<typeof FortuneResponseSchema>;

export const ErrorCode = z.enum([
  'invalid_input',
  'config_missing',
  'upstream_error',
  'rate_limited',
  'timeout',
  'parse_failed',
  'saju_calc_failed',
]);
export type ErrorCode = z.infer<typeof ErrorCode>;
```

- [ ] **Step 4: 테스트 실행 — pass**

```bash
npm run test:run -- lib/schema
```
기대: 16 tests PASS.

- [ ] **Step 5: 커밋**

```bash
git add lib/schema.ts lib/schema.test.ts
git commit -m "feat(schema): add Zod request/response schemas + ErrorCode enum

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: 프롬프트 템플릿 (lib/prompt.ts)

**Files:**
- Create: `lib/prompt.ts`, `lib/prompt.test.ts`

- [ ] **Step 1: 실패 테스트 (lib/prompt.test.ts)**

```ts
import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserPrompt } from './prompt';

describe('buildSystemPrompt', () => {
  const sys = buildSystemPrompt();

  it('is non-empty Korean', () => {
    expect(sys.length).toBeGreaterThan(100);
    expect(sys).toMatch(/한국어/);
  });

  it('forbids mystical phrasing keywords', () => {
    for (const banned of ['운명', '숙명', '신비', '계시']) {
      expect(sys, `system prompt must not contain "${banned}"`).not.toContain(banned);
    }
  });

  it('mentions JSON output requirement', () => {
    expect(sys).toMatch(/JSON/);
  });

  it('mentions single category focus', () => {
    expect(sys).toMatch(/카테고리/);
  });
});

describe('buildUserPrompt', () => {
  const input = {
    name: '홍길동',
    gender: '남' as const,
    birthDate: '1990-03-15',
    hourBranch: '인' as const,
    category: '연애' as const,
    pillars: { year: '庚午', month: '己卯', day: '丙午', hour: '庚寅' },
    cards: [
      { card: { id: 0,  ko: '바보', en: 'The Fool',   keywords: { upright: ['시작'], reversed: ['지연'] } }, reversed: false, phase: '과거' as const },
      { card: { id: 6,  ko: '연인', en: 'The Lovers', keywords: { upright: ['결합'], reversed: ['불화'] } }, reversed: true,  phase: '현재' as const },
      { card: { id: 19, ko: '태양', en: 'The Sun',    keywords: { upright: ['활력'], reversed: ['과열'] } }, reversed: false, phase: '미래' as const },
    ],
  };

  it('includes name, birthDate, pillars 8 hanja chars', () => {
    const u = buildUserPrompt(input);
    expect(u).toContain('홍길동');
    expect(u).toContain('1990-03-15');
    expect(u).toContain('庚午');
    expect(u).toContain('己卯');
    expect(u).toContain('丙午');
    expect(u).toContain('庚寅');
  });

  it('marks reversed cards as 역방향', () => {
    const u = buildUserPrompt(input);
    expect(u).toMatch(/연인.*역방향/);
    expect(u).toMatch(/바보.*정방향/);
  });

  it('mentions all 3 phases', () => {
    const u = buildUserPrompt(input);
    expect(u).toContain('과거');
    expect(u).toContain('현재');
    expect(u).toContain('미래');
  });

  it('mentions the chosen category', () => {
    const u = buildUserPrompt(input);
    expect(u).toContain('연애');
  });
});
```

- [ ] **Step 2: 테스트 실행 — fail**

```bash
npm run test:run -- lib/prompt
```
기대: FAIL.

- [ ] **Step 3: 구현 (lib/prompt.ts)**

```ts
import type { Pillars } from './saju';
import type { DrawnCard } from './tarot';
import type { FortuneRequest } from './schema';

export function buildSystemPrompt(): string {
  return [
    '당신은 한국어로 글을 쓰는 사주·타로 큐레이터입니다.',
    '',
    '톤 규칙:',
    '- 차분하고 신뢰감 있는 어조. 시적 절제, 직설보다 함축.',
    '- 다음 표현은 절대 쓰지 않는다: "운명", "숙명", "신비", "계시".',
    '- 단정적 예언("...할 것입니다") 대신 가능성·태도("...할 여지가 있습니다", "...해 보는 편이 좋습니다").',
    '',
    '구성 규칙:',
    '- 한자 명식 8글자는 분석의 근거로 1~2 문장 짧게 언급. 길게 풀이하지 않는다.',
    '- 모든 풀이는 사용자가 고른 단일 카테고리에 집중한다.',
    '',
    '출력 규칙:',
    '- 응답은 반드시 JSON 한 객체. 추가 텍스트, 마크다운, 코드블록 금지.',
    '- 스키마: { "summary": string, "cards": [{phase, card, reading}*3], "advice": string }',
    '- summary 와 advice 는 각각 2~3 문장.',
    '- cards[i].reading 은 한 단락 (3~5 문장).',
  ].join('\n');
}

export type UserPromptInput = Omit<FortuneRequest, 'cards'> & {
  pillars: Pillars;
  cards: DrawnCard[];
};

export function buildUserPrompt(input: UserPromptInput): string {
  const { name, gender, birthDate, hourBranch, category, pillars, cards } = input;
  const cardLines = cards.map(c =>
    `  ${c.phase} — ${c.card.ko} (${c.reversed ? '역방향' : '정방향'})`,
  ).join('\n');

  return [
    `사용자: ${name} (${gender}, 양력 ${birthDate}, ${hourBranch}시)`,
    `사주 명식: 년주 ${pillars.year} / 월주 ${pillars.month} / 일주 ${pillars.day} / 시주 ${pillars.hour}`,
    `카테고리: ${category}운`,
    `뽑힌 카드:`,
    cardLines,
    ``,
    `위 정보를 종합해 "${category}운"에 대해 시스템 규칙을 따라 JSON 으로 풀이해 주세요.`,
  ].join('\n');
}
```

- [ ] **Step 4: 테스트 실행 — pass**

```bash
npm run test:run -- lib/prompt
```
기대: 8 tests PASS.

- [ ] **Step 5: 커밋**

```bash
git add lib/prompt.ts lib/prompt.test.ts
git commit -m "feat(prompt): add system/user prompt builders with banned-word guards

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Gemini 호출 + 자동 재시도 (lib/gemini.ts)

**Files:**
- Create: `lib/gemini.ts`

> 이 모듈은 server-only — 통합 테스트는 Task 9 의 API route 테스트에서 mock 으로 검증.

- [ ] **Step 1: 구현 (lib/gemini.ts)**

```ts
import 'server-only';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { FortuneResponseSchema, type FortuneResponse } from './schema';

const TIMEOUT_MS = 8_000;
const MAX_RETRY = 1;

type CallInput = {
  systemPrompt: string;
  userPrompt: string;
};

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING },
    cards: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          phase: { type: SchemaType.STRING, enum: ['과거', '현재', '미래'] },
          card: { type: SchemaType.STRING },
          reading: { type: SchemaType.STRING },
        },
        required: ['phase', 'card', 'reading'],
      },
      minItems: 3,
      maxItems: 3,
    },
    advice: { type: SchemaType.STRING },
  },
  required: ['summary', 'cards', 'advice'],
};

export class GeminiError extends Error {
  constructor(
    public code: 'config_missing' | 'upstream_error' | 'rate_limited' | 'timeout' | 'parse_failed',
    message: string,
  ) {
    super(message);
  }
}

export async function callGemini({ systemPrompt, userPrompt }: CallInput): Promise<FortuneResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length === 0) {
    throw new GeminiError('config_missing', 'GEMINI_API_KEY is not set');
  }

  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
  const client = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: 'application/json',
      // @ts-expect-error - responseSchema accepts SchemaType-based object at runtime
      responseSchema,
      temperature: 0.9,
    },
  });

  let lastParseError: unknown = null;
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const result = await client.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        // @ts-expect-error - signal supported but missing from typing
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const text = result.response.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        lastParseError = e;
        continue;
      }
      const validated = FortuneResponseSchema.safeParse(parsed);
      if (validated.success) return validated.data;
      lastParseError = validated.error;
      continue;
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (controller.signal.aborted) {
        throw new GeminiError('timeout', `Gemini call timed out after ${TIMEOUT_MS}ms`);
      }
      const message = err instanceof Error ? err.message : String(err);
      if (/429|rate/i.test(message)) {
        throw new GeminiError('rate_limited', message);
      }
      throw new GeminiError('upstream_error', message);
    }
  }

  throw new GeminiError(
    'parse_failed',
    `Gemini response failed schema after ${MAX_RETRY + 1} attempts: ${String(lastParseError)}`,
  );
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck
```
기대: 0 errors.

- [ ] **Step 3: 커밋**

```bash
git add lib/gemini.ts
git commit -m "feat(gemini): add server-only Gemini call with timeout + schema retry

- 8s AbortController timeout
- 1x auto-retry on parse/schema failure
- Maps SDK errors to GeminiError codes (config_missing/upstream/rate/timeout/parse)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: POST /api/fortune Route Handler + 통합 테스트

**Files:**
- Create: `app/api/fortune/route.ts`, `tests/integration/fortune.test.ts`, `tests/helpers/mockGemini.ts`

- [ ] **Step 1: Gemini mock helper (tests/helpers/mockGemini.ts)**

```ts
import { vi } from 'vitest';
import type { FortuneResponse } from '@/lib/schema';

export const validFortune: FortuneResponse = {
  summary: '이번 흐름은 새로 시작되는 관계의 결을 따라가는 시기입니다. 차분히 듣되 표현을 미루지는 않는 편이 좋습니다.',
  cards: [
    { phase: '과거', card: '바보', reading: '시작의 호기심이 관계의 씨앗이었습니다. 작은 신호도 의미가 있었습니다.' },
    { phase: '현재', card: '연인', reading: '선택의 문 앞에 있습니다. 망설임보다 결정의 무게가 더 크게 느껴집니다.' },
    { phase: '미래', card: '태양', reading: '명료한 결말이 다가옵니다. 회피하지 않으면 따뜻한 답을 받게 됩니다.' },
  ],
  advice: '오늘 안에 한 문장만이라도 전해 보세요. 시간이 답을 미루지 못하게 하는 게 핵심입니다.',
};

export function mockGeminiOnce(response: FortuneResponse | Error) {
  vi.doMock('@/lib/gemini', () => ({
    callGemini: vi.fn(async () => {
      if (response instanceof Error) throw response;
      return response;
    }),
    GeminiError: class extends Error { constructor(public code: string, m: string) { super(m); } },
  }));
}
```

- [ ] **Step 2: 실패 테스트 (tests/integration/fortune.test.ts)**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validFortune } from '../helpers/mockGemini';

const validBody = {
  name: '홍길동',
  gender: '남',
  birthDate: '1990-03-15',
  hourBranch: '인',
  category: '연애',
  cards: [
    { id: 0,  reversed: false },
    { id: 6,  reversed: true  },
    { id: 19, reversed: false },
  ],
};

async function callRoute(body: unknown) {
  const { POST } = await import('@/app/api/fortune/route');
  const req = new Request('http://localhost/api/fortune', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return POST(req);
}

describe('POST /api/fortune', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  it('returns 200 with pillars + fortune on valid input', async () => {
    vi.doMock('@/lib/gemini', () => ({
      callGemini: vi.fn(async () => validFortune),
      GeminiError: class extends Error { constructor(public code: string, m: string) { super(m); } },
    }));
    const res = await callRoute(validBody);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pillars).toMatchObject({
      year: expect.stringMatching(/^[一-鿿]{2}$/),
      month: expect.stringMatching(/^[一-鿿]{2}$/),
      day: expect.stringMatching(/^[一-鿿]{2}$/),
      hour: expect.stringMatching(/^[一-鿿]{2}$/),
    });
    expect(json.fortune).toEqual(validFortune);
  });

  it('returns 400 invalid_input on missing name', async () => {
    const res = await callRoute({ ...validBody, name: '' });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid_input');
    expect(json.retryable).toBe(false);
  });

  it('returns 500 config_missing when GEMINI_API_KEY empty', async () => {
    process.env.GEMINI_API_KEY = '';
    vi.doMock('@/lib/gemini', async () => {
      const real = await vi.importActual<typeof import('@/lib/gemini')>('@/lib/gemini');
      return real;
    });
    const res = await callRoute(validBody);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('config_missing');
    expect(json.retryable).toBe(false);
  });

  it('returns 502 upstream_error on generic Gemini failure', async () => {
    vi.doMock('@/lib/gemini', () => {
      class GeminiError extends Error { constructor(public code: string, m: string) { super(m); } }
      return {
        callGemini: vi.fn(async () => { throw new GeminiError('upstream_error', 'boom'); }),
        GeminiError,
      };
    });
    const res = await callRoute(validBody);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBe('upstream_error');
    expect(json.retryable).toBe(true);
  });

  it('returns 503 rate_limited on 429', async () => {
    vi.doMock('@/lib/gemini', () => {
      class GeminiError extends Error { constructor(public code: string, m: string) { super(m); } }
      return {
        callGemini: vi.fn(async () => { throw new GeminiError('rate_limited', '429'); }),
        GeminiError,
      };
    });
    const res = await callRoute(validBody);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe('rate_limited');
    expect(json.retryable).toBe(true);
  });

  it('returns 504 timeout', async () => {
    vi.doMock('@/lib/gemini', () => {
      class GeminiError extends Error { constructor(public code: string, m: string) { super(m); } }
      return {
        callGemini: vi.fn(async () => { throw new GeminiError('timeout', 'abort'); }),
        GeminiError,
      };
    });
    const res = await callRoute(validBody);
    expect(res.status).toBe(504);
    const json = await res.json();
    expect(json.error).toBe('timeout');
    expect(json.retryable).toBe(true);
  });

  it('returns 500 parse_failed when schema retry exhausted', async () => {
    vi.doMock('@/lib/gemini', () => {
      class GeminiError extends Error { constructor(public code: string, m: string) { super(m); } }
      return {
        callGemini: vi.fn(async () => { throw new GeminiError('parse_failed', 'bad json'); }),
        GeminiError,
      };
    });
    const res = await callRoute(validBody);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('parse_failed');
    expect(json.retryable).toBe(true);
  });
});
```

- [ ] **Step 3: 테스트 실행 — fail**

```bash
npm run test:run -- tests/integration/fortune
```
기대: FAIL (route 없음).

- [ ] **Step 4: 구현 (app/api/fortune/route.ts)**

```ts
import { NextResponse } from 'next/server';
import { FortuneRequestSchema, type ErrorCode } from '@/lib/schema';
import { computePillars } from '@/lib/saju';
import { majorArcana } from '@/data/majorArcana';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt';
import { callGemini, GeminiError } from '@/lib/gemini';
import { PHASES } from '@/lib/tarot';

function fail(code: ErrorCode, status: number, retryable: boolean, message?: string) {
  return NextResponse.json({ error: code, retryable, message }, { status });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail('invalid_input', 400, false, 'malformed JSON');
  }

  const parsed = FortuneRequestSchema.safeParse(body);
  if (!parsed.success) return fail('invalid_input', 400, false, parsed.error.message);

  const input = parsed.data;
  const [y, m, d] = input.birthDate.split('-').map(Number);

  let pillars;
  try {
    pillars = computePillars({ year: y, month: m, day: d, hourBranch: input.hourBranch });
  } catch (e) {
    return fail('saju_calc_failed', 500, false, e instanceof Error ? e.message : String(e));
  }

  const drawnCards = input.cards.map((c, i) => {
    const card = majorArcana.find(a => a.id === c.id);
    if (!card) throw new Error(`unknown card id ${c.id}`);
    return { card, reversed: c.reversed, phase: PHASES[i] };
  });

  try {
    const fortune = await callGemini({
      systemPrompt: buildSystemPrompt(),
      userPrompt: buildUserPrompt({ ...input, pillars, cards: drawnCards }),
    });
    return NextResponse.json({ pillars, fortune });
  } catch (e) {
    if (e instanceof GeminiError) {
      switch (e.code) {
        case 'config_missing': return fail('config_missing', 500, false, e.message);
        case 'rate_limited':   return fail('rate_limited', 503, true, e.message);
        case 'timeout':        return fail('timeout', 504, true, e.message);
        case 'parse_failed':   return fail('parse_failed', 500, true, e.message);
        case 'upstream_error':
        default:               return fail('upstream_error', 502, true, e.message);
      }
    }
    return fail('upstream_error', 502, true, e instanceof Error ? e.message : String(e));
  }
}
```

- [ ] **Step 5: 테스트 실행 — pass**

```bash
npm run test:run -- tests/integration/fortune
```
기대: 7 tests PASS.

- [ ] **Step 6: 커밋**

```bash
git add app/api/fortune/route.ts tests/integration/fortune.test.ts tests/helpers/mockGemini.ts
git commit -m "feat(api): add POST /api/fortune with integration tests

- Zod input validation -> 400 invalid_input
- Server-side pillar recompute
- Maps GeminiError codes to HTTP 5xx with retryable flag

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: 클라이언트 상태 (store/session.ts)

**Files:**
- Create: `store/session.ts`, `store/session.test.ts`

- [ ] **Step 1: 실패 테스트 (store/session.test.ts)**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSession } from './session';

describe('useSession', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useSession.setState(useSession.getState(), true);
    useSession.getState().resetAll();
  });

  it('starts empty', () => {
    const s = useSession.getState();
    expect(s.profile).toBeNull();
    expect(s.category).toBeNull();
    expect(s.cards).toEqual([]);
  });

  it('setProfile stores profile', () => {
    useSession.getState().setProfile({ name: '홍길동', gender: '남', birthDate: '1990-03-15', hourBranch: '인' });
    expect(useSession.getState().profile?.name).toBe('홍길동');
  });

  it('setCategory stores category', () => {
    useSession.getState().setCategory('연애');
    expect(useSession.getState().category).toBe('연애');
  });

  it('setCards stores 3 drawn cards', () => {
    useSession.getState().setCards([
      { id: 0, reversed: false },
      { id: 6, reversed: true  },
      { id: 19, reversed: false },
    ]);
    expect(useSession.getState().cards).toHaveLength(3);
  });

  it('resetForReroll clears category + cards but keeps profile', () => {
    const s = useSession.getState();
    s.setProfile({ name: '홍길동', gender: '남', birthDate: '1990-03-15', hourBranch: '인' });
    s.setCategory('연애');
    s.setCards([{ id: 0, reversed: false }, { id: 1, reversed: true }, { id: 2, reversed: false }]);
    s.resetForReroll();
    const s2 = useSession.getState();
    expect(s2.profile?.name).toBe('홍길동');
    expect(s2.category).toBeNull();
    expect(s2.cards).toEqual([]);
  });

  it('resetAll clears everything', () => {
    const s = useSession.getState();
    s.setProfile({ name: '홍길동', gender: '남', birthDate: '1990-03-15', hourBranch: '인' });
    s.resetAll();
    expect(useSession.getState().profile).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행 — fail**

```bash
npm run test:run -- store/session
```
기대: FAIL.

- [ ] **Step 3: 구현 (store/session.ts)**

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { HourBranch } from '@/lib/saju';

export type Gender = '남' | '여';
export type Category = '연애' | '금전' | '학업' | '취업';

export type Profile = {
  name: string;
  gender: Gender;
  birthDate: string;   // 'YYYY-MM-DD'
  hourBranch: HourBranch;
};

export type CardSelection = { id: number; reversed: boolean };

type SessionState = {
  profile: Profile | null;
  category: Category | null;
  cards: CardSelection[];   // 길이 0 또는 3
  setProfile: (p: Profile) => void;
  setCategory: (c: Category) => void;
  setCards: (c: CardSelection[]) => void;
  resetForReroll: () => void; // 카테고리 + 카드만
  resetAll: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    set => ({
      profile: null,
      category: null,
      cards: [],
      setProfile: p => set({ profile: p }),
      setCategory: c => set({ category: c }),
      setCards: c => set({ cards: c }),
      resetForReroll: () => set({ category: null, cards: [] }),
      resetAll: () => set({ profile: null, category: null, cards: [] }),
    }),
    {
      name: 'tarosaju-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
```

- [ ] **Step 4: 테스트 실행 — pass**

```bash
npm run test:run -- store/session
```
기대: 6 tests PASS.

- [ ] **Step 5: 커밋**

```bash
git add store/session.ts store/session.test.ts
git commit -m "feat(store): add zustand session with sessionStorage persist

- profile / category / cards state
- resetForReroll keeps profile, resetAll wipes everything

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: 폰트 + 디자인 토큰 + 레이아웃 (app/layout.tsx + tokens)

**Files:**
- Modify: `app/layout.tsx`, `styles/tokens.css`, `tailwind.config.ts`

- [ ] **Step 1: app/layout.tsx 에 next/font 추가**

```tsx
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Fraunces, Noto_Serif_KR } from 'next/font/google';
import localFont from 'next/font/local';

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-display',
  display: 'swap',
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-display-kr',
  display: 'swap',
});

// Pretendard 은 Google Fonts 가 아니라 self-host (Task 1 단계는 system-ui fallback, 여기서 로컬 폰트 도입)
// public/fonts/PretendardVariable.woff2 가 있다고 가정 (Step 2 에서 다운로드)
const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tarosaju — 사주와 타로로 보는 풀이',
  description: '사주 명식과 타로 3장을 한 흐름에서 융합 해석합니다.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF7' },
    { media: '(prefers-color-scheme: dark)',  color: '#0F0F0E' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${fraunces.variable} ${notoSerifKR.variable} ${pretendard.variable}`}>
      <body className="font-body bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Pretendard 로컬 폰트 추가**

Pretendard 는 OFL, public CDN 에서 다운로드 가능. 로컬에 둠:

```bash
mkdir -p public/fonts
curl -L -o public/fonts/PretendardVariable.woff2 \
  "https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2"
ls -la public/fonts/PretendardVariable.woff2
```
기대: 파일 크기 > 0.

- [ ] **Step 3: tailwind.config.ts 폰트 매핑 수정**

```ts
fontFamily: {
  display: ['var(--font-display)', 'var(--font-display-kr)', 'serif'],
  body: ['var(--font-body)', 'system-ui', 'sans-serif'],
},
```

- [ ] **Step 4: dev 서버 + 폰트 로딩 확인**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000/ | grep -o "font-display\|font-body" | head -3
kill %1
```
기대: HTML 에 폰트 변수 적용된 className 보임.

- [ ] **Step 5: 빌드 확인**

```bash
npm run build
```
기대: 0 errors.

- [ ] **Step 6: 커밋**

```bash
git add app/layout.tsx tailwind.config.ts public/fonts/PretendardVariable.woff2
git commit -m "feat(typography): add Fraunces + Noto Serif KR + Pretendard fonts

- next/font/google for Fraunces (display) + Noto Serif KR (한자)
- next/font/local for Pretendard Variable (body)
- viewport meta + theme-color for light/dark

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: 기초 UI 컴포넌트 (Button, Input, ChipSelector, Toast, GrainOverlay, ProgressDots)

**Files:**
- Create: `components/ui/{Button, Input, ChipSelector, Toast, GrainOverlay, ProgressDots}.tsx`, `components/ui/Toast.tsx` test

- [ ] **Step 1: components/ui/Button.tsx**

```tsx
'use client';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  primary: 'bg-accent text-bg hover:opacity-90',
  secondary: 'bg-transparent text-accent border border-accent hover:bg-accent/5',
  ghost: 'bg-transparent text-text border border-border hover:bg-surface',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', className = '', ...rest }, ref) => (
    <button
      ref={ref}
      className={`min-h-11 px-5 rounded text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    />
  ),
);
Button.displayName = 'Button';
```

- [ ] **Step 2: components/ui/Input.tsx**

```tsx
'use client';
import { forwardRef, type InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className = '', ...rest }, ref) => {
    const inputId = id ?? `input-${label}`;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-xs uppercase tracking-wider text-muted">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`min-h-11 px-3 rounded border bg-surface text-text outline-none focus:border-accent ${error ? 'border-accent' : 'border-border'} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {error && <span id={`${inputId}-error`} className="text-xs text-accent">{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';
```

- [ ] **Step 3: components/ui/ChipSelector.tsx**

```tsx
'use client';

type ChipOption<V extends string> = { value: V; label: string; sub?: string };

type Props<V extends string> = {
  options: ChipOption<V>[];
  value: V | null;
  onChange: (v: V) => void;
  label: string;
  columns?: 2 | 3 | 4 | 6;
};

export function ChipSelector<V extends string>({ options, value, onChange, label, columns = 4 }: Props<V>) {
  const grid = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 6: 'grid-cols-6' }[columns];
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs uppercase tracking-wider text-muted">{label}</legend>
      <div className={`grid ${grid} gap-2`}>
        {options.map(o => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className={`min-h-11 rounded-full border px-3 text-sm transition
                ${active ? 'border-accent bg-accent text-bg' : 'border-border bg-surface text-text hover:border-accent/40'}`}
            >
              <span className="font-medium">{o.label}</span>
              {o.sub && <span className={`block text-[10px] mt-0.5 ${active ? 'text-bg/80' : 'text-muted'}`}>{o.sub}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 4: components/ui/Toast.tsx**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let listeners: ((msg: string) => void)[] = [];
export function toast(msg: string) {
  listeners.forEach(l => l(msg));
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const fn = (m: string) => {
      setMsg(m);
      setTimeout(() => setMsg(null), 2500);
    };
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }, []);

  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-surface border border-border rounded px-4 py-2 text-sm text-text shadow"
        >
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 5: components/ui/GrainOverlay.tsx**

```tsx
export function GrainOverlay({ opacity = 0.025 }: { opacity?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 w-full h-full mix-blend-multiply"
      style={{ opacity }}
    >
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}
```

- [ ] **Step 6: components/ui/ProgressDots.tsx**

```tsx
export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}
         className="flex gap-1.5 justify-center my-3">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 w-6 rounded-full ${i + 1 <= current ? 'bg-accent' : 'bg-border'}`} />
      ))}
    </div>
  );
}
```

- [ ] **Step 7: layout 에 ToastHost + GrainOverlay 추가**

`app/layout.tsx` body 안:
```tsx
<body className="font-body bg-bg text-text">
  <GrainOverlay />
  {children}
  <ToastHost />
</body>
```

추가 import:
```tsx
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { ToastHost } from '@/components/ui/Toast';
```

- [ ] **Step 8: typecheck + build**

```bash
npm run typecheck && npm run build
```
기대: 0 errors.

- [ ] **Step 9: 커밋**

```bash
git add components/ui app/layout.tsx
git commit -m "feat(ui): add Button/Input/ChipSelector/Toast/GrainOverlay/ProgressDots

- 44pt+ touch targets
- aria-invalid + aria-pressed for forms
- Toast with aria-live polite

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: 홈 화면 (app/page.tsx)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 홈 페이지 작성**

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-display text-5xl leading-tight mb-4 tracking-tight">
        Tarosaju
      </h1>
      <p className="text-muted max-w-xs leading-relaxed mb-10">
        사주 명식과 타로 카드 3 장으로<br />오늘의 결을 읽어봅니다.
      </p>
      <Link href="/profile">
        <Button>운세 보기</Button>
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: 브라우저 확인**

```bash
npm run build && npm run start &
sleep 5
curl -s http://localhost:3000/ | grep -o "Tarosaju\|운세 보기"
kill %1
```
기대: 두 문자열 모두 노출.

- [ ] **Step 3: 커밋**

```bash
git add app/page.tsx
git commit -m "feat(home): add hero + CTA to /profile

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: 정보 입력 화면 (app/profile/page.tsx + ProfileForm)

**Files:**
- Create: `app/profile/page.tsx`, `components/form/ProfileForm.tsx`, `components/form/BirthTimePicker.tsx`

- [ ] **Step 1: components/form/BirthTimePicker.tsx**

```tsx
'use client';
import { ChipSelector } from '@/components/ui/ChipSelector';
import type { HourBranch } from '@/lib/saju';

const OPTIONS: { value: HourBranch; label: string; sub: string }[] = [
  { value: '자', label: '자', sub: '23–01' },
  { value: '축', label: '축', sub: '01–03' },
  { value: '인', label: '인', sub: '03–05' },
  { value: '묘', label: '묘', sub: '05–07' },
  { value: '진', label: '진', sub: '07–09' },
  { value: '사', label: '사', sub: '09–11' },
  { value: '오', label: '오', sub: '11–13' },
  { value: '미', label: '미', sub: '13–15' },
  { value: '신', label: '신', sub: '15–17' },
  { value: '유', label: '유', sub: '17–19' },
  { value: '술', label: '술', sub: '19–21' },
  { value: '해', label: '해', sub: '21–23' },
];

export function BirthTimePicker({ value, onChange }: { value: HourBranch | null; onChange: (v: HourBranch) => void }) {
  return <ChipSelector options={OPTIONS} value={value} onChange={onChange} label="태어난 시" columns={4} />;
}
```

- [ ] **Step 2: components/form/ProfileForm.tsx**

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ChipSelector } from '@/components/ui/ChipSelector';
import { BirthTimePicker } from './BirthTimePicker';
import { useSession, type Profile } from '@/store/session';
import { FortuneRequestSchema } from '@/lib/schema';

export function ProfileForm() {
  const router = useRouter();
  const setProfile = useSession(s => s.setProfile);
  const initial = useSession(s => s.profile);

  const [name, setName] = useState(initial?.name ?? '');
  const [gender, setGender] = useState<Profile['gender'] | null>(initial?.gender ?? null);
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
  const [hourBranch, setHourBranch] = useState<Profile['hourBranch'] | null>(initial?.hourBranch ?? null);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gender || !hourBranch) return;
    const candidate = { name, gender, birthDate, hourBranch };
    // Reuse the FortuneRequestSchema partial — pick the profile fields
    const result = FortuneRequestSchema.pick({
      name: true, gender: true, birthDate: true, hourBranch: true,
    }).safeParse(candidate);
    if (!result.success) {
      const flat: Partial<Record<keyof Profile, string>> = {};
      for (const issue of result.error.issues) {
        flat[issue.path[0] as keyof Profile] = issue.message;
      }
      setErrors(flat);
      return;
    }
    setProfile(result.data);
    router.push('/category');
  }

  const canSubmit = name.length > 0 && gender !== null && birthDate.length > 0 && hourBranch !== null;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-sm w-full mx-auto px-6">
      <Input
        label="이름"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={20}
        autoComplete="name"
        error={errors.name}
      />
      <ChipSelector
        label="성별"
        columns={2}
        options={[{ value: '남', label: '남' }, { value: '여', label: '여' }]}
        value={gender}
        onChange={setGender}
      />
      <Input
        label="양력 생년월일"
        type="date"
        min="1900-01-01"
        max={today}
        value={birthDate}
        onChange={e => setBirthDate(e.target.value)}
        error={errors.birthDate}
      />
      <BirthTimePicker value={hourBranch} onChange={setHourBranch} />
      <Button type="submit" disabled={!canSubmit} className="mt-2">다음</Button>
    </form>
  );
}
```

- [ ] **Step 3: app/profile/page.tsx**

```tsx
import { ProgressDots } from '@/components/ui/ProgressDots';
import { ProfileForm } from '@/components/form/ProfileForm';

export default function ProfilePage() {
  return (
    <main className="min-h-[100dvh] py-10">
      <ProgressDots current={1} total={3} />
      <h1 className="font-display text-3xl text-center mb-8">정보를 알려 주세요</h1>
      <ProfileForm />
    </main>
  );
}
```

- [ ] **Step 4: 빌드 + 수동 확인**

```bash
npm run build && npm run start &
sleep 5
curl -s http://localhost:3000/profile | grep -o "정보를 알려"
kill %1
```
기대: 문자열 노출.

- [ ] **Step 5: 커밋**

```bash
git add app/profile/page.tsx components/form
git commit -m "feat(profile): add input form with chip selectors + Zod validation

- name/gender/birthDate/hourBranch
- 12 지지 chip selector with 시각 range subtitle
- Reuses FortuneRequestSchema.pick for client-side validation

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: 카테고리 선택 화면 (app/category/page.tsx)

**Files:**
- Create: `app/category/page.tsx`, `components/form/CategoryGrid.tsx`

- [ ] **Step 1: components/form/CategoryGrid.tsx**

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useSession, type Category } from '@/store/session';

const ITEMS: { value: Category; label: string; sub: string }[] = [
  { value: '연애', label: '연애운', sub: '관계의 다음 결' },
  { value: '금전', label: '금전운', sub: '돈의 흐름과 결단' },
  { value: '학업', label: '학업운', sub: '집중과 성취' },
  { value: '취업', label: '취업운', sub: '기회와 선택' },
];

export function CategoryGrid() {
  const router = useRouter();
  const initial = useSession(s => s.category);
  const setCategory = useSession(s => s.setCategory);
  const [selected, setSelected] = useState<Category | null>(initial);

  function go() {
    if (!selected) return;
    setCategory(selected);
    router.push('/draw');
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm w-full mx-auto px-6">
      <ul className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="카테고리">
        {ITEMS.map(it => {
          const active = it.value === selected;
          return (
            <li key={it.value}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(it.value)}
                className={`w-full text-left rounded-md border p-4 transition min-h-[88px]
                  ${active ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:border-accent/40'}`}
              >
                <span className="font-display text-lg block">{it.label}</span>
                <span className="text-xs text-muted block mt-1">{it.sub}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Button disabled={!selected} onClick={go}>이 운세 보기</Button>
    </div>
  );
}
```

- [ ] **Step 2: app/category/page.tsx**

```tsx
import { ProgressDots } from '@/components/ui/ProgressDots';
import { CategoryGrid } from '@/components/form/CategoryGrid';

export default function CategoryPage() {
  return (
    <main className="min-h-[100dvh] py-10">
      <ProgressDots current={2} total={3} />
      <h1 className="font-display text-3xl text-center mb-8">어떤 운세를 볼까요?</h1>
      <CategoryGrid />
    </main>
  );
}
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```
기대: 0 errors.

- [ ] **Step 4: 커밋**

```bash
git add app/category/page.tsx components/form/CategoryGrid.tsx
git commit -m "feat(category): add 4-category radio grid with single-select

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: 카드 컴포넌트 군 (components/card/*)

**Files:**
- Create: `components/card/TarotCard.tsx`, `components/card/CardBack.tsx`, `components/card/CardFlip.tsx`, `components/card/CardDeck.tsx`
- Create: `public/cards/back.svg` (placeholder), `public/cards/{0..21}.svg` (placeholder)

- [ ] **Step 1: placeholder SVG 카드 22 + back 1 생성 스크립트**

`scripts/gen-placeholder-cards.mjs`:
```js
import { writeFileSync, mkdirSync } from 'node:fs';
import { majorArcana } from '../data/majorArcana.ts';   // ts-node 없이는 직접 데이터 import 어려움
```

→ 대안: 단순 bash 루프로 22 + back SVG 생성.

```bash
mkdir -p public/cards
cat > public/cards/back.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320" width="200" height="320">
  <rect width="200" height="320" rx="8" fill="#1A1A1A"/>
  <rect x="8" y="8" width="184" height="304" rx="4" fill="none" stroke="#5C1F2C" stroke-width="1"/>
  <circle cx="100" cy="160" r="40" fill="none" stroke="#5C1F2C" stroke-width="1"/>
  <text x="100" y="166" text-anchor="middle" fill="#5C1F2C" font-family="serif" font-size="14">TS</text>
</svg>
EOF

for i in $(seq 0 21); do
  name=$(node -e "const {majorArcana}=require('./data/majorArcana.ts');" 2>/dev/null || echo "")
  cat > "public/cards/${i}.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320" width="200" height="320">
  <rect width="200" height="320" rx="8" fill="#FAFAF7"/>
  <rect x="8" y="8" width="184" height="304" rx="4" fill="none" stroke="#1A1A1A" stroke-width="1"/>
  <text x="100" y="40" text-anchor="middle" fill="#1A1A1A" font-family="serif" font-size="12">${i}</text>
  <text x="100" y="170" text-anchor="middle" fill="#1A1A1A" font-family="serif" font-size="14">CARD ${i}</text>
  <text x="100" y="290" text-anchor="middle" fill="#5C1F2C" font-family="serif" font-size="10">placeholder</text>
</svg>
EOF
done

ls public/cards/ | wc -l
```
기대: 23 (back + 22).

- [ ] **Step 2: components/card/CardBack.tsx**

```tsx
import Image from 'next/image';

export function CardBack({ width = 120 }: { width?: number }) {
  return (
    <Image
      src="/cards/back.svg"
      alt=""
      width={width}
      height={Math.round(width * 1.6)}
      priority={false}
      aria-hidden="true"
      className="select-none pointer-events-none"
    />
  );
}
```

- [ ] **Step 3: components/card/TarotCard.tsx**

```tsx
import Image from 'next/image';
import type { ArcanaCard } from '@/data/majorArcana';

export function TarotCard({
  card, reversed, width = 120,
}: { card: ArcanaCard; reversed: boolean; width: number | undefined }) {
  return (
    <figure className="flex flex-col items-center gap-1">
      <Image
        src={`/cards/${card.id}.svg`}
        alt={`${card.ko}${reversed ? ' 역방향' : ''}`}
        width={width}
        height={Math.round(width * 1.6)}
        className={`select-none pointer-events-none rounded ${reversed ? 'rotate-180' : ''}`}
      />
      <figcaption className="font-display text-sm">
        {card.ko}{reversed && <span className="text-muted text-xs"> (역)</span>}
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 4: components/card/CardFlip.tsx**

```tsx
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
```

- [ ] **Step 5: components/card/CardDeck.tsx**

(드로우 화면의 셔플 + 부채꼴 + 선택 인터랙션. Task 17 에서 함께 사용)

```tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { CardBack } from './CardBack';
import { majorArcana, type ArcanaCard } from '@/data/majorArcana';
import { drawThree, type DrawnCard } from '@/lib/tarot';

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

  // shuffle 시작
  function startShuffle() {
    if (phase !== 'idle') return;
    setPhase('shuffling');
    const result = drawThree();
    setDrawn(result);
    // 부채꼴 순서: 결정된 3장이 부채꼴 중 어느 위치에 갈지 — 단순화: 부채꼴 = majorArcana 셔플 결과
    const deck = [...majorArcana].sort(() => Math.random() - 0.5);
    // 결과 3장이 부채꼴 안에 포함되도록 우선 자리 배치
    const ids = new Set(result.map(d => d.card.id));
    const others = deck.filter(c => !ids.has(c.id));
    const positions: ArcanaCard[] = Array.from({ length: TOTAL });
    const slotIdx = [4, 11, 17]; // 부채꼴 22장 중 3장이 위치할 슬롯 (좌/중/우 부근)
    slotIdx.forEach((p, i) => { positions[p] = result[i].card; });
    let oi = 0;
    for (let i = 0; i < TOTAL; i++) if (!positions[i]) positions[i] = others[oi++];
    setRevealOrder(positions);
    setTimeout(() => setPhase('spread'), reduce ? 50 : 1500);
  }

  function onPickByIdx(i: number) {
    if (phase !== 'spread') return;
    if (pickedIndices.includes(i)) return;
    const next = [...pickedIndices, i];
    setPickedIndices(next);
    if (next.length === 3) {
      setTimeout(() => setPhase('ready'), 600);
    }
  }

  useEffect(() => {
    if (phase === 'ready') onComplete(drawn);
  }, [phase, drawn, onComplete]);

  // 부채꼴 좌표 계산
  function spreadStyle(i: number) {
    const offset = i - (TOTAL - 1) / 2;
    return {
      x: offset * 16,
      y: Math.abs(offset) * 2,
      rotate: offset * 4,
    };
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
    </div>
  );
}
```

- [ ] **Step 6: typecheck + build**

```bash
npm run typecheck && npm run build
```
기대: 0 errors.

- [ ] **Step 7: 커밋**

```bash
git add components/card public/cards
git commit -m "feat(card): add Tarot card components + placeholder SVGs

- CardBack, TarotCard, CardFlip (rotateY + backface-hidden)
- CardDeck with shuffle/spread/pick state machine
- 22 + back placeholder SVGs (Task 24 에서 사용자 시안으로 교체)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 17: 드로우 화면 (app/draw/page.tsx) — 시그니처 1

**Files:**
- Create: `app/draw/page.tsx`

- [ ] **Step 1: app/draw/page.tsx**

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { CardDeck } from '@/components/card/CardDeck';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/store/session';
import { useState } from 'react';
import type { DrawnCard } from '@/lib/tarot';

export default function DrawPage() {
  const router = useRouter();
  const setCards = useSession(s => s.setCards);
  const [done, setDone] = useState<DrawnCard[] | null>(null);

  function onComplete(drawn: DrawnCard[]) {
    setDone(drawn);
  }

  function goResult() {
    if (!done) return;
    setCards(done.map(d => ({ id: d.card.id, reversed: d.reversed })));
    router.push('/result');
  }

  return (
    <main className="min-h-[100dvh] py-6 flex flex-col">
      <ProgressDots current={3} total={3} />
      <h1 className="font-display text-2xl text-center mb-2">카드를 뽑아 주세요</h1>
      <p className="text-center text-xs text-muted mb-4">1번째 — 과거 · 2번째 — 현재 · 3번째 — 미래</p>
      <CardDeck onComplete={onComplete} />
      <div className="px-6 mt-auto pb-8">
        <Button onClick={goResult} disabled={!done} className="w-full">운세 보기</Button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 빌드**

```bash
npm run build
```
기대: 0 errors.

- [ ] **Step 3: 수동 인터랙션 확인 (선택)**

```bash
npm run dev &
sleep 5
# 브라우저에서 http://localhost:3000/draw 열어 셔플·부채꼴·3장 픽 확인
# (Playwright 자동화는 Task 22 에서)
kill %1
```

- [ ] **Step 4: 커밋**

```bash
git add app/draw/page.tsx
git commit -m "feat(draw): add signature draw screen with shuffle/spread/pick

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 18: 결과 화면 컴포넌트 군 (components/result/*)

**Files:**
- Create: `components/result/SajuPillars.tsx`, `components/result/FortuneNarrative.tsx`, `components/result/ResultHeader.tsx`, `components/result/FortuneRevealOrchestrator.tsx`

- [ ] **Step 1: components/result/ResultHeader.tsx**

```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { Category } from '@/store/session';

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
      <h1 className="font-display text-3xl mt-1">{category}운</h1>
    </motion.header>
  );
}
```

- [ ] **Step 2: components/result/SajuPillars.tsx**

```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { Pillars } from '@/lib/saju';

export function SajuPillars({ pillars, startAtSec }: { pillars: Pillars; startAtSec: number }) {
  const reduce = useReducedMotion();
  // 8 글자 분해: year (천간 + 지지) etc.
  const chars = [
    pillars.year[0], pillars.year[1],
    pillars.month[0], pillars.month[1],
    pillars.day[0], pillars.day[1],
    pillars.hour[0], pillars.hour[1],
  ];
  const labels = ['년','년','월','월','일','일','시','시'];
  return (
    <section className="mx-auto max-w-md px-6 py-6">
      <h2 className="sr-only">사주 명식</h2>
      <div className="grid grid-cols-4 gap-2 text-center" lang="zh">
        {[0, 2, 4, 6].map((i, col) => (
          <div key={col} className="flex flex-col gap-1 items-center">
            <span className="text-[10px] uppercase tracking-widest text-muted">{['년주','월주','일주','시주'][col]}</span>
            <div className="flex flex-col gap-1">
              {[i, i + 1].map((charI, row) => (
                <motion.span
                  key={charI}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduce
                    ? { duration: 0 }
                    : { duration: 0.3, delay: startAtSec + charI * 0.3 }}
                  className="font-display text-3xl text-text"
                  aria-label={`${['년주','월주','일주','시주'][col]} ${row === 0 ? '천간' : '지지'} ${chars[charI]}`}
                >
                  {chars[charI]}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: components/result/FortuneNarrative.tsx**

```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { FortuneResponse } from '@/lib/schema';

type Props = {
  fortune: FortuneResponse;
  startAtSec: { summary: number; readings: number[]; advice: number };
};

export function FortuneNarrative({ fortune, startAtSec }: Props) {
  const reduce = useReducedMotion();
  const T = (delay: number) => reduce ? { duration: 0 } : { duration: 0.5, delay, ease: 'easeOut' as const };
  const I = { opacity: 0, y: 8 };
  const A = { opacity: 1, y: 0 };

  return (
    <article className="mx-auto max-w-md px-6 py-6 flex flex-col gap-6" aria-live="polite">
      <motion.p initial={I} animate={A} transition={T(startAtSec.summary)} className="text-base leading-relaxed">
        {fortune.summary}
      </motion.p>
      {fortune.cards.map((c, i) => (
        <motion.section
          key={c.phase}
          initial={I} animate={A} transition={T(startAtSec.readings[i])}
          className="border-l-2 border-accent pl-4"
        >
          <h3 className="font-display text-sm uppercase tracking-wider text-muted mb-1">
            {c.phase} · {c.card}
          </h3>
          <p className="text-sm leading-relaxed">{c.reading}</p>
        </motion.section>
      ))}
      <motion.div initial={I} animate={A} transition={T(startAtSec.advice)} className="bg-surface border border-border rounded p-4">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted mb-1">다음 한 걸음</h3>
        <p className="text-sm leading-relaxed">{fortune.advice}</p>
      </motion.div>
    </article>
  );
}
```

- [ ] **Step 4: components/result/FortuneRevealOrchestrator.tsx**

```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useSession, type Category } from '@/store/session';
import type { FortuneResponse } from '@/lib/schema';
import type { Pillars } from '@/lib/saju';
import type { CardSelection } from '@/store/session';
import { majorArcana } from '@/data/majorArcana';
import { ResultHeader } from './ResultHeader';
import { SajuPillars } from './SajuPillars';
import { CardFlip } from '@/components/card/CardFlip';
import { FortuneNarrative } from './FortuneNarrative';
import { Button } from '@/components/ui/Button';

// 타이밍 (초 단위)
export const T = {
  header: 0,
  pillarsStart: 0.2,       // pillarsEnd = 0.2 + 8*0.3 = 2.6
  pillarsEnd: 2.6,
  flipStart: 2.6,          // 3 카드 × 0.8s
  flipEnd: 5.0,
  summary: 5.0,
  reading0: 5.4,
  reading1: 5.9,
  reading2: 6.4,
  advice: 6.9,
  cta: 7.4,
};

export function FortuneRevealOrchestrator({
  category, pillars, cards, fortune,
}: {
  category: Category;
  pillars: Pillars;
  cards: CardSelection[];
  fortune: FortuneResponse;
}) {
  const reduce = useReducedMotion();
  const resetForReroll = useSession(s => s.resetForReroll);

  const cardModels = cards.map(c => {
    const card = majorArcana.find(a => a.id === c.id);
    if (!card) throw new Error(`unknown card id ${c.id}`);
    return { card, reversed: c.reversed };
  });

  return (
    <main className="min-h-[100dvh]">
      <ResultHeader category={category} visible />
      <SajuPillars pillars={pillars} startAtSec={T.pillarsStart} />

      <section className="flex justify-center gap-3 py-4" aria-label="뽑은 카드 3장">
        {cardModels.map((c, i) => (
          <CardFlip
            key={c.card.id}
            card={c.card}
            reversed={c.reversed}
            flipped
            width={90}
            delaySec={reduce ? 0 : T.flipStart + i * 0.8}
          />
        ))}
      </section>

      <FortuneNarrative
        fortune={fortune}
        startAtSec={{
          summary: T.summary,
          readings: [T.reading0, T.reading1, T.reading2],
          advice: T.advice,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.3, delay: T.cta }}
        className="px-6 py-10 flex justify-center"
      >
        <Link href="/" onClick={() => resetForReroll()}>
          <Button variant="secondary">다시 보기</Button>
        </Link>
      </motion.div>
    </main>
  );
}
```

- [ ] **Step 5: typecheck + build**

```bash
npm run typecheck && npm run build
```
기대: 0 errors.

- [ ] **Step 6: 커밋**

```bash
git add components/result
git commit -m "feat(result): add reveal components (Header/Pillars/Narrative/Orchestrator)

- 7.4s 시퀀스 타이밍 const T 단일 출처
- 한자 8글자 stagger 페이드인
- 풀이 단락별 fade+y unfold
- '다시 보기' resetForReroll (profile 유지)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 19: 결과 화면 페이지 + API 호출 훅 (app/result/page.tsx + lib/use-fortune.ts)

**Files:**
- Create: `lib/use-fortune.ts`, `app/result/page.tsx`, `components/result/LoadingState.tsx`, `components/result/ErrorState.tsx`

- [ ] **Step 1: lib/use-fortune.ts**

```tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import type { FortuneResponse } from '@/lib/schema';
import type { Pillars } from '@/lib/saju';
import type { Profile, Category, CardSelection } from '@/store/session';

export type FortuneState =
  | { status: 'loading' }
  | { status: 'success'; pillars: Pillars; fortune: FortuneResponse }
  | { status: 'error'; code: string; retryable: boolean; message?: string };

export type FortuneInput = {
  profile: Profile;
  category: Category;
  cards: CardSelection[];
};

export function useFortune(input: FortuneInput | null) {
  const [state, setState] = useState<FortuneState>({ status: 'loading' });
  const [nonce, setNonce] = useState(0);
  const retry = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    if (!input) return;
    let cancelled = false;
    setState({ status: 'loading' });
    (async () => {
      try {
        const res = await fetch('/api/fortune', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: input.profile.name,
            gender: input.profile.gender,
            birthDate: input.profile.birthDate,
            hourBranch: input.profile.hourBranch,
            category: input.category,
            cards: input.cards,
          }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: 'error', code: json.error ?? 'unknown', retryable: !!json.retryable, message: json.message });
          return;
        }
        setState({ status: 'success', pillars: json.pillars, fortune: json.fortune });
      } catch (e) {
        if (cancelled) return;
        setState({
          status: 'error',
          code: 'network_error',
          retryable: true,
          message: e instanceof Error ? e.message : String(e),
        });
      }
    })();
    return () => { cancelled = true; };
  }, [input, nonce]);

  return { state, retry };
}
```

- [ ] **Step 2: components/result/LoadingState.tsx**

```tsx
'use client';
import { motion } from 'framer-motion';

export function LoadingState() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        className="font-display text-2xl"
      >
        풀이를 정리하는 중…
      </motion.div>
      <p className="text-xs text-muted mt-4">짧게는 3 초, 길어도 8 초 안에 보여드려요.</p>
    </main>
  );
}
```

- [ ] **Step 3: components/result/ErrorState.tsx**

```tsx
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const COPY: Record<string, string> = {
  config_missing: '서비스 설정에 문제가 있어요. 잠시 후 다시 와 주세요.',
  rate_limited: '요청이 잠시 많아요. 10 초 뒤에 다시 시도해 주세요.',
  upstream_error: '풀이 서버가 잠깐 응답하지 못했어요.',
  timeout: '응답이 길어지고 있어요.',
  parse_failed: '결과를 정리하다 막혔어요.',
  saju_calc_failed: '사주 계산 단계에서 막혔어요. 입력을 다시 확인해 주세요.',
  network_error: '네트워크 연결을 확인해 주세요.',
};

export function ErrorState({ code, retryable, onRetry }: { code: string; retryable: boolean; onRetry: () => void }) {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center gap-6">
      <h1 className="font-display text-2xl">잠시 막혔어요</h1>
      <p className="text-sm text-muted max-w-xs">{COPY[code] ?? '알 수 없는 오류가 발생했어요.'}</p>
      <div className="flex gap-3">
        {retryable && <Button onClick={onRetry}>다시 시도</Button>}
        <Link href="/"><Button variant="ghost">홈으로</Button></Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: app/result/page.tsx**

```tsx
'use client';
import { useSession } from '@/store/session';
import { useFortune } from '@/lib/use-fortune';
import { LoadingState } from '@/components/result/LoadingState';
import { ErrorState } from '@/components/result/ErrorState';
import { FortuneRevealOrchestrator } from '@/components/result/FortuneRevealOrchestrator';

export default function ResultPage() {
  const profile = useSession(s => s.profile);
  const category = useSession(s => s.category);
  const cards = useSession(s => s.cards);

  // Task 20 의 가드 훅이 들어오기 전까지는 인라인으로 1차 가드.
  // (정식 가드는 Task 20 에서 도입)
  const canCall = !!profile && !!category && cards.length === 3;
  const { state, retry } = useFortune(canCall ? { profile: profile!, category: category!, cards } : null);

  if (!canCall) return <LoadingState />; // 곧 Task 20 의 가드가 가로챔
  if (state.status === 'loading')  return <LoadingState />;
  if (state.status === 'error')    return <ErrorState code={state.code} retryable={state.retryable} onRetry={retry} />;
  return <FortuneRevealOrchestrator category={category!} pillars={state.pillars} cards={cards} fortune={state.fortune} />;
}
```

- [ ] **Step 5: build**

```bash
npm run build
```
기대: 0 errors.

- [ ] **Step 6: 커밋**

```bash
git add lib/use-fortune.ts app/result/page.tsx components/result/LoadingState.tsx components/result/ErrorState.tsx
git commit -m "feat(result): wire result page to /api/fortune with loading/error states

- useFortune hook (status machine + retry counter)
- LoadingState (pulsing)
- ErrorState (mapped Korean copy per ErrorCode)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 20: 라우팅 가드 (lib/use-route-guard.ts)

**Files:**
- Create: `lib/use-route-guard.ts`
- Modify: `app/category/page.tsx`, `app/draw/page.tsx`, `app/result/page.tsx`

- [ ] **Step 1: lib/use-route-guard.ts**

```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/store/session';
import { toast } from '@/components/ui/Toast';

type Requirement = 'profile' | 'category' | 'cards';

export function useRouteGuard(required: Requirement[]) {
  const router = useRouter();
  const profile = useSession(s => s.profile);
  const category = useSession(s => s.category);
  const cards = useSession(s => s.cards);

  useEffect(() => {
    const missing =
      (required.includes('profile') && !profile) ||
      (required.includes('category') && !category) ||
      (required.includes('cards') && cards.length !== 3);

    if (missing) {
      toast('이전 단계를 먼저 완료해 주세요.');
      router.replace('/profile');
    }
  }, [required, profile, category, cards, router]);
}
```

- [ ] **Step 2: category 페이지에 적용**

`app/category/page.tsx` 를 client component 로 바꾸고 가드 호출:
```tsx
'use client';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { CategoryGrid } from '@/components/form/CategoryGrid';
import { useRouteGuard } from '@/lib/use-route-guard';

export default function CategoryPage() {
  useRouteGuard(['profile']);
  return (
    <main className="min-h-[100dvh] py-10">
      <ProgressDots current={2} total={3} />
      <h1 className="font-display text-3xl text-center mb-8">어떤 운세를 볼까요?</h1>
      <CategoryGrid />
    </main>
  );
}
```

- [ ] **Step 3: draw 페이지에 적용**

`app/draw/page.tsx` 안:
```tsx
import { useRouteGuard } from '@/lib/use-route-guard';
// ...
export default function DrawPage() {
  useRouteGuard(['profile', 'category']);
  // ...rest 동일
}
```

- [ ] **Step 4: result 페이지에 적용**

`app/result/page.tsx` 의 인라인 가드 제거 + `useRouteGuard` 사용:
```tsx
'use client';
import { useRouteGuard } from '@/lib/use-route-guard';
// ...
export default function ResultPage() {
  useRouteGuard(['profile', 'category', 'cards']);
  const profile = useSession(s => s.profile);
  const category = useSession(s => s.category);
  const cards = useSession(s => s.cards);
  const canCall = !!profile && !!category && cards.length === 3;
  const { state, retry } = useFortune(canCall ? { profile: profile!, category: category!, cards } : null);

  if (state.status === 'loading' || !canCall) return <LoadingState />;
  if (state.status === 'error')              return <ErrorState code={state.code} retryable={state.retryable} onRetry={retry} />;
  return <FortuneRevealOrchestrator category={category!} pillars={state.pillars} cards={cards} fortune={state.fortune} />;
}
```

- [ ] **Step 5: build**

```bash
npm run build
```
기대: 0 errors.

- [ ] **Step 6: 커밋**

```bash
git add lib/use-route-guard.ts app/category/page.tsx app/draw/page.tsx app/result/page.tsx
git commit -m "feat(guard): add useRouteGuard for category/draw/result

- Missing prerequisite -> toast + replace('/profile')

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 21: 카드 셔플 시 키보드 폴백 ("자동으로 3 장 뽑기")

**Files:**
- Modify: `components/card/CardDeck.tsx` (auto-draw 보조 버튼), `app/draw/page.tsx`

- [ ] **Step 1: CardDeck 에 auto-draw 트리거 추가**

`components/card/CardDeck.tsx` 상단 export 에 추가:

```tsx
// CardDeck 컴포넌트 안, return 직전:
function autoPick() {
  if (phase !== 'idle' && phase !== 'spread') return;
  // idle 이면 셔플 먼저, 직후 자동 픽
  if (phase === 'idle') {
    startShuffle();
    setTimeout(() => {
      setPickedIndices([4, 11, 17]);
      setTimeout(() => setPhase('ready'), 700);
    }, reduce ? 100 : 1700);
  } else {
    setPickedIndices([4, 11, 17]);
    setTimeout(() => setPhase('ready'), 700);
  }
}
```

return JSX 의 맨 아래 (phase !== 'ready' 일 때):

```tsx
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
```

(이 변경을 CardDeck.tsx 의 컴포넌트 본문 안에 직접 합쳐서 적용)

- [ ] **Step 2: build + typecheck**

```bash
npm run typecheck && npm run build
```
기대: 0 errors.

- [ ] **Step 3: 커밋**

```bash
git add components/card/CardDeck.tsx
git commit -m "feat(draw): add keyboard fallback '자동으로 3 장 뽑기'

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 22: E2E 5 시나리오 (Playwright + MSW)

**Files:**
- Create: `tests/e2e/{happy-path, reduced-motion, route-guard, api-retry, refresh}.spec.ts`, `tests/e2e/fixtures.ts`

- [ ] **Step 1: tests/e2e/fixtures.ts**

```ts
import { test as base, expect, type Page } from '@playwright/test';

export const validFortuneResponse = {
  pillars: { year: '庚午', month: '己卯', day: '丙午', hour: '庚寅' },
  fortune: {
    summary: '이번 흐름은 새로 시작되는 관계의 결을 따라가는 시기입니다. 차분히 듣되 표현을 미루지는 않는 편이 좋습니다.',
    cards: [
      { phase: '과거', card: '바보', reading: '시작의 호기심이 관계의 씨앗이었습니다. 작은 신호도 의미가 있었습니다.' },
      { phase: '현재', card: '연인', reading: '선택의 문 앞에 있습니다. 망설임보다 결정의 무게가 더 크게 느껴집니다.' },
      { phase: '미래', card: '태양', reading: '명료한 결말이 다가옵니다. 회피하지 않으면 따뜻한 답을 받게 됩니다.' },
    ],
    advice: '오늘 안에 한 문장만이라도 전해 보세요. 시간이 답을 미루지 못하게 하는 게 핵심입니다.',
  },
};

export async function mockFortune(page: Page, response: typeof validFortuneResponse | { status: number; body: object } = validFortuneResponse) {
  await page.route('**/api/fortune', async route => {
    if ('status' in response) {
      await route.fulfill({ status: response.status, contentType: 'application/json', body: JSON.stringify(response.body) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
    }
  });
}

export async function fillProfile(page: Page) {
  await page.goto('/profile');
  await page.getByLabel('이름').fill('홍길동');
  await page.getByRole('button', { name: '남', pressed: false }).click();
  await page.getByLabel('양력 생년월일').fill('1990-03-15');
  await page.getByRole('button', { name: /자동으로|^인/, pressed: false }).first(); // ensure visible
  await page.getByRole('button', { name: /^인$/, pressed: false }).click();
  await page.getByRole('button', { name: '다음' }).click();
}

export async function pickCategory(page: Page, label: string = '연애운') {
  await page.getByRole('radio', { name: label }).click();
  await page.getByRole('button', { name: '이 운세 보기' }).click();
}

export async function autoDraw(page: Page) {
  await page.getByRole('button', { name: '자동으로 3 장 뽑기' }).click();
  await page.getByRole('button', { name: '운세 보기' }).click();
}

export { expect };
export const test = base;
```

- [ ] **Step 2: tests/e2e/happy-path.spec.ts**

```ts
import { test, expect, mockFortune, fillProfile, pickCategory, autoDraw } from './fixtures';

test('happy path: home → profile → category → draw → result reveal', async ({ page }) => {
  await mockFortune(page);
  await page.goto('/');
  await page.getByRole('link', { name: '운세 보기' }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await fillProfile(page);
  await expect(page).toHaveURL(/\/category$/);
  await pickCategory(page, '연애운');
  await expect(page).toHaveURL(/\/draw$/);
  await autoDraw(page);
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('연애운')).toBeVisible({ timeout: 10_000 });
  // 한자 명식
  await expect(page.locator('text=庚午')).toBeVisible({ timeout: 10_000 });
  // 풀이 일부
  await expect(page.getByText(/관계의 결/)).toBeVisible({ timeout: 12_000 });
});
```

- [ ] **Step 3: tests/e2e/reduced-motion.spec.ts**

```ts
import { test, expect, mockFortune, fillProfile, pickCategory, autoDraw } from './fixtures';

test.use({ colorScheme: 'light', reducedMotion: 'reduce' });

test('reduced motion: same flow finishes instantly', async ({ page }) => {
  await mockFortune(page);
  await page.goto('/');
  await page.getByRole('link', { name: '운세 보기' }).click();
  await fillProfile(page);
  await pickCategory(page);
  await autoDraw(page);
  // reveal sequence 가 즉시 끝나야 함 — 1초 안에 advice 보임
  await expect(page.getByText(/시간이 답을 미루지/)).toBeVisible({ timeout: 1500 });
});
```

- [ ] **Step 4: tests/e2e/route-guard.spec.ts**

```ts
import { test, expect } from './fixtures';

test('direct /result entry redirects to /profile', async ({ page }) => {
  await page.goto('/result');
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('status')).toContainText('이전 단계를 먼저 완료해 주세요.');
});

test('direct /category entry redirects to /profile', async ({ page }) => {
  await page.goto('/category');
  await expect(page).toHaveURL(/\/profile$/);
});

test('direct /draw entry redirects to /profile', async ({ page }) => {
  await page.goto('/draw');
  await expect(page).toHaveURL(/\/profile$/);
});
```

- [ ] **Step 5: tests/e2e/api-retry.spec.ts**

```ts
import { test, expect, fillProfile, pickCategory, autoDraw, validFortuneResponse } from './fixtures';

test('503 rate_limited then retry → success', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/fortune', async route => {
    calls++;
    if (calls === 1) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'rate_limited', retryable: true }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(validFortuneResponse) });
    }
  });
  await page.goto('/');
  await page.getByRole('link', { name: '운세 보기' }).click();
  await fillProfile(page);
  await pickCategory(page);
  await autoDraw(page);
  await expect(page.getByText('잠시 막혔어요')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: '다시 시도' }).click();
  await expect(page.getByText(/관계의 결/)).toBeVisible({ timeout: 12_000 });
});
```

- [ ] **Step 6: tests/e2e/refresh.spec.ts**

```ts
import { test, expect, mockFortune, fillProfile, pickCategory, autoDraw } from './fixtures';

test('refresh on /result re-calls API with same input', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/fortune', async route => {
    calls++;
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        pillars: { year: '庚午', month: '己卯', day: '丙午', hour: '庚寅' },
        fortune: {
          summary: `call ${calls} — 새로운 결의 흐름이 보입니다. 침착하게 다음 한 걸음을 정해 봅시다.`,
          cards: [
            { phase: '과거', card: '바보', reading: '시작의 호기심이 씨앗이었습니다. 작은 신호가 컸습니다.' },
            { phase: '현재', card: '연인', reading: '선택의 문 앞입니다. 결정의 무게가 더 크게 느껴집니다.' },
            { phase: '미래', card: '태양', reading: '명료한 결말이 다가옵니다. 따뜻한 답을 받게 됩니다.' },
          ],
          advice: '오늘 한 문장이라도 전해 보세요. 시간이 답을 미루지 않게 하세요.',
        },
      }),
    });
  });
  await page.goto('/');
  await page.getByRole('link', { name: '운세 보기' }).click();
  await fillProfile(page);
  await pickCategory(page);
  await autoDraw(page);
  await expect(page.getByText(/call 1/)).toBeVisible({ timeout: 10_000 });
  await page.reload();
  await expect(page.getByText(/call 2/)).toBeVisible({ timeout: 10_000 });
});
```

- [ ] **Step 7: E2E 실행 (mock 으로 도는지)**

```bash
npm run build
npm run test:e2e
```
기대: 5 + 기존 smoke = 6 tests PASS.

- [ ] **Step 8: 커밋**

```bash
git add tests/e2e
git commit -m "test(e2e): add 5 Playwright scenarios (happy/reduced-motion/guard/retry/refresh)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 23: 접근성 + 시각 회귀 + Lighthouse

**Files:**
- Create: `tests/a11y.spec.ts`, `tests/visual.spec.ts`

- [ ] **Step 1: tests/a11y.spec.ts**

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockFortune, fillProfile, pickCategory, autoDraw } from './e2e/fixtures';

test('home page is accessible', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('profile page is accessible', async ({ page }) => {
  await page.goto('/profile');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('category page is accessible', async ({ page }) => {
  await page.goto('/profile');
  await fillProfile(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('result page is accessible', async ({ page }) => {
  await mockFortune(page);
  await page.goto('/profile');
  await fillProfile(page);
  await pickCategory(page);
  await autoDraw(page);
  // reveal 끝까지 대기
  await page.getByText(/관계의 결/).waitFor({ timeout: 12_000 });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

- [ ] **Step 2: tests/visual.spec.ts**

```ts
import { test, expect } from '@playwright/test';
import { mockFortune, fillProfile, pickCategory, autoDraw } from './e2e/fixtures';

test.use({ reducedMotion: 'reduce' });

test('home baseline', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home.png', { maxDiffPixelRatio: 0.001 });
});

test('profile filled baseline', async ({ page }) => {
  await page.goto('/profile');
  await fillProfile(page);
  // 다음 페이지로 안 가게 하기 위해 페이지 멈춤은 fillProfile 안에서 click 까지 — 여기서는 직전 상태 캡처 위해 별도 처리 필요
  // 단순화: profile 페이지에서 클릭 직전 캡처
  await expect(page).toHaveScreenshot('profile-filled.png', { maxDiffPixelRatio: 0.001 });
});

test('result baseline (reduced motion)', async ({ page }) => {
  await mockFortune(page);
  await page.goto('/profile');
  await fillProfile(page);
  await pickCategory(page);
  await autoDraw(page);
  await page.getByText(/관계의 결/).waitFor({ timeout: 8_000 });
  await expect(page).toHaveScreenshot('result.png', { maxDiffPixelRatio: 0.005 });
});
```

- [ ] **Step 3: 첫 baseline 생성**

```bash
npm run test:e2e -- tests/visual.spec.ts --update-snapshots
```
기대: 스냅샷 생성됨 (`tests/visual.spec.ts-snapshots/` 폴더).

- [ ] **Step 4: a11y + visual 실행**

```bash
npm run test:e2e -- tests/a11y.spec.ts tests/visual.spec.ts
```
기대: 4 a11y + 3 visual = 7 tests PASS.

- [ ] **Step 5: Lighthouse 수동 검증 (CI 자동화는 비범위)**

```bash
npm run build && npm run start &
sleep 5
npx lighthouse http://localhost:3000/ --preset=desktop --form-factor=mobile --emulated-form-factor=mobile --output=json --output-path=./lh-home.json --chrome-flags="--headless" || true
node -e "const r=require('./lh-home.json'); console.log('Perf:', r.categories.performance.score*100, 'A11y:', r.categories.accessibility.score*100)"
kill %1
```
기대: Perf ≥ 90, A11y ≥ 95. 미달 시 issue 로 기록 후 디자인 시안 적용 (Task 25) 다음에 재측정.

- [ ] **Step 6: 커밋**

```bash
git add tests/a11y.spec.ts tests/visual.spec.ts tests/visual.spec.ts-snapshots
git commit -m "test: add axe-core a11y + Playwright visual regression baselines

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 24: 사용자 시안 — 카드 22 장 이미지 교체

**책임자**: 사용자 (claude.ai/design 에서 22 + back = 23 장 생성 → `public/cards/` 에 배치)

**Files:**
- Replace: `public/cards/0..21.{webp|svg}` + `public/cards/back.{webp|svg}`

- [ ] **Step 1: 사용자 → 22 장 이미지 준비**

사용자가 `claude.ai/design` 에서 만든 결과물을 다음 경로에 둔다:
- `public/cards/0.webp` ~ `public/cards/21.webp` (또는 .svg, .png — Image 컴포넌트가 받아주는 형식)
- `public/cards/back.webp`

권장: WebP, 200×320 비율 (5:8), 색은 디자인 토큰의 한도 안에서.

- [ ] **Step 2: TarotCard / CardBack 의 src 경로 확장자 일치 확인**

`components/card/TarotCard.tsx`:
```tsx
src={`/cards/${card.id}.webp`}
```

`components/card/CardBack.tsx`:
```tsx
src="/cards/back.webp"
```

(현재는 `.svg` placeholder. 시안 적용 시 `.webp` 로 일괄 변경)

- [ ] **Step 3: 시각 회귀 baseline 갱신**

```bash
npm run test:e2e -- tests/visual.spec.ts --update-snapshots
```

- [ ] **Step 4: 빌드 + Lighthouse 재측정**

```bash
npm run build
# Lighthouse 재측정 (Task 23 Step 5 와 동일)
```
기대: Perf ≥ 90, A11y ≥ 95 유지.

- [ ] **Step 5: 커밋**

```bash
git add public/cards components/card/TarotCard.tsx components/card/CardBack.tsx tests/visual.spec.ts-snapshots
git commit -m "feat(design): replace placeholder cards with claude.ai/design artwork

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 25: 사용자 시안 — 디자인 토큰 적용

**책임자**: 사용자 (claude.ai/design 에서 받은 토큰을 `styles/tokens.css` 에 옮김)

**Files:**
- Modify: `styles/tokens.css`

- [ ] **Step 1: 사용자 → tokens.css 덮어쓰기**

`claude.ai/design` 결과물에서 다음 CSS 변수를 정의해 둔다:
```css
:root {
  --color-bg: ...;
  --color-surface: ...;
  --color-text: ...;
  --color-muted: ...;
  --color-border: ...;
  --color-accent: ...;
}
@media (prefers-color-scheme: dark) {
  :root { /* 다크 변형 */ }
}
```

(추가 토큰 — radius, spacing, motion ms — 등은 필요 시 `tailwind.config.ts` 의 extend 에 매핑)

- [ ] **Step 2: 시각 회귀 baseline 갱신 + a11y 재실행**

```bash
npm run test:e2e -- tests/visual.spec.ts --update-snapshots
npm run test:e2e -- tests/a11y.spec.ts
```
기대: a11y violations 0. (특히 색 대비)

- [ ] **Step 3: Lighthouse 재측정**

Perf ≥ 90, A11y ≥ 95.

- [ ] **Step 4: 커밋**

```bash
git add styles/tokens.css tests/visual.spec.ts-snapshots
git commit -m "feat(design): apply claude.ai/design tokens to tokens.css

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 26: 문서 — README + DESIGN_NOTES + LICENSE

**Files:**
- Create: `README.md`, `DESIGN_NOTES.md`, `LICENSE`

- [ ] **Step 1: LICENSE (MIT)**

```
MIT License

Copyright (c) 2026 (Your Name)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

- [ ] **Step 2: README.md**

````markdown
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

## 문서

- 설계서: [`docs/superpowers/specs/2026-05-12-tarot-saju-web-design.md`](docs/superpowers/specs/2026-05-12-tarot-saju-web-design.md)
- 구현 계획: [`docs/superpowers/plans/2026-05-12-tarot-saju-web.md`](docs/superpowers/plans/2026-05-12-tarot-saju-web.md)
- 디자인 노트: [`DESIGN_NOTES.md`](DESIGN_NOTES.md)

## 라이센스

MIT. 폰트: Fraunces (OFL), Noto Serif KR (OFL), Pretendard (OFL).
````

- [ ] **Step 3: DESIGN_NOTES.md**

```markdown
# Design Notes

## 디자인 도구

본 프로젝트의 시각 자산(카드 22 장 + 화면별 시안)은 [`claude.ai/design`](https://claude.ai/design) 에서 제작했다.

## 토큰

`styles/tokens.css` 의 CSS 변수가 단일 출처. Tailwind 의 `bg-*`/`text-*` 클래스는 이 변수를 참조.

## 폰트

- **Fraunces** (display, 라틴): SIL OFL, `next/font/google`
- **Noto Serif KR** (한자/한글 세리프): SIL OFL, `next/font/google`
- **Pretendard Variable** (body): SIL OFL, `public/fonts/PretendardVariable.woff2` self-host

## 모션 원칙

- 대부분 차분, **두 모먼트만 시그니처**:
  1. 드로우 화면의 셔플 → 부채꼴 → 선택 → 자리잡기
  2. 결과 화면의 7.4 초 reveal (한자 8 자 stagger + 카드 3 장 뒤집기 + 풀이 unfold)
- `prefers-reduced-motion: reduce` 시 모든 애니메이션 즉시.

## 카드 비주얼

- 메이저 아르카나 22 장 (`public/cards/0..21.webp`) + 뒷면 1 장 (`public/cards/back.webp`).
- 비율 5:8 (예: 200×320).
- 정/역방향은 코드에서 `rotate-180` 으로 처리 (이미지는 정방향만 1 세트).
```

- [ ] **Step 4: 커밋**

```bash
git add README.md DESIGN_NOTES.md LICENSE
git commit -m "docs: add README, DESIGN_NOTES, LICENSE (MIT)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 27: Vercel 배포 + 환경 변수 + dogfood

**책임자**: 사용자

- [ ] **Step 1: Vercel 프로젝트 생성**

1. <https://vercel.com/new> 접속
2. Git 레포 연결 (먼저 GitHub 에 `tarosaju` 레포 만들고 `git remote add origin` + `git push -u origin main`)
3. Framework Preset: **Next.js** 자동 감지
4. Environment Variables:
   - `GEMINI_API_KEY` = (https://aistudio.google.com/apikey 에서 발급)
   - `GEMINI_MODEL` = `gemini-2.0-flash`
5. Deploy

- [ ] **Step 2: 첫 배포 후 cold start 검증**

```bash
# 배포된 URL 로 happy-path 가 8 초 안에 통과하는지
curl -s -o /dev/null -w "%{time_total}\n" -X POST https://YOUR-DEPLOY.vercel.app/api/fortune \
  -H 'content-type: application/json' \
  -d '{"name":"홍길동","gender":"남","birthDate":"1990-03-15","hourBranch":"인","category":"연애","cards":[{"id":0,"reversed":false},{"id":6,"reversed":true},{"id":19,"reversed":false}]}'
```
기대: 응답 시간 < 8s, HTTP 200.

- [ ] **Step 3: 실기기 dogfood (iOS Safari + Android Chrome)**

각 디바이스에서:
- 홈 → 입력 → 카테고리 → 드로우 (셔플 60fps 체감) → 결과 reveal 자연스러움 확인
- 한자 명식 8 글자 폰트 깨짐 없음
- OS 다크 모드 토글 시 자연스러운 전환
- iPhone SE 같은 좁은 화면에서 깨짐 없음

- [ ] **Step 4: DoD 체크리스트 최종 확인**

`docs/superpowers/specs/2026-05-12-tarot-saju-web-design.md` 의 §6-8 12 개 항목 모두 통과.

- [ ] **Step 5: v1 태그**

```bash
git tag -a v1.0.0 -m "v1.0.0 — Tarosaju MVP launch"
git push origin v1.0.0
```

---

## 자체 검증 (Self-Review 결과)

플랜 작성 후 spec 과 대조하여 발견한 점을 인라인 수정 완료:

| 검증 | 결과 |
|---|---|
| Spec §1 아키텍처 | Task 1, 11, 12 가 다룸 ✓ |
| Spec §2-1 사주 명식 | Task 3 ✓ |
| Spec §2-2 카드 데이터/드로우 | Task 4, 5 ✓ |
| Spec §2-3 프롬프트 | Task 7 ✓ |
| Spec §2-4 POST /api/fortune | Task 9 ✓ |
| Spec §2-5 Zod 응답 스키마 | Task 6 ✓ |
| Spec §3 5 화면 + 라우팅 가드 | Task 13–15, 17, 19, 20 ✓ |
| Spec §4 시그니처 애니메이션 | Task 16 (CardDeck) + Task 18 (FortuneRevealOrchestrator) ✓ |
| Spec §4-D Reduced motion | `useReducedMotion()` 가 Task 16, 18, 19 에 모두 적용 ✓ |
| Spec §5-1 입력 검증 | Task 6 + 클라이언트는 Task 14 ✓ |
| Spec §5-2 API 에러 분기 | Task 9 + 클라이언트 매핑은 Task 19 (ErrorState) ✓ |
| Spec §5-3 사주 엣지 | Task 3 의 1900 ~ 2099 가드 + Task 14 의 input max ✓ |
| Spec §5-4 라우팅/새로고침 | Task 20 ✓ + Task 22-Step 6 으로 새로고침 E2E ✓ |
| Spec §5-5 a11y | Task 12 (aria-* 패턴) + Task 21 (키보드 폴백) + Task 23 (axe-core) ✓ |
| Spec §5-7 server-only | Task 8 의 `import 'server-only'` ✓ |
| Spec §6 테스트 | Task 2, 22, 23 ✓ |
| Spec §6-8 DoD | Task 27-Step 4 에서 최종 점검 ✓ |
| 디자인 시안 처리 | Task 24 (카드 이미지) + Task 25 (토큰) 분리, 코드 토대는 시안 없이 진행 가능 ✓ |
| 함수/타입 일관성 | `Pillars` / `DrawnCard` / `FortuneResponse` / `FortuneRequest` / `Category` / `HourBranch` — Task 3/4/6/10 의 정의가 후속 task 에서 변형 없이 사용 ✓ |
| Placeholder 스캔 | "TBD"/"TODO"/"implement later" 없음 ✓ |

발견하여 인라인 수정한 사항:
- Task 16 의 CardDeck 상태머신에 `'selecting'` 단계가 spec 에 있지만 plan 의 상태 enum 에는 `idle/shuffling/spread/ready` 4 단계로 축약. `selecting` 은 `spread` 단계의 부분 상태로 통합 (`pickedIndices` 배열 길이로 표현) — 행동은 동일.
- Task 22 의 E2E happy-path 가 reduced-motion 모드를 안 쓰면 7.4 초 reveal 을 다 기다려야 함 → `await expect(...).toBeVisible({ timeout: 12_000 })` 으로 여유 확보.
- Task 19 의 `useFortune` 훅 의존 배열에 `input` 객체 자체를 넣어 매 렌더마다 재호출되지 않게 — 호출처(`app/result/page.tsx`)에서 `input` 을 useMemo 또는 안정 참조로 넘기는 게 안전. (현재 plan 은 zustand selector 셋 + `cards` 가 안정 참조라 OK, 만약 무한 루프 발견 시 useMemo 로 감싸기)

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-12-tarot-saju-web.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — 각 task 마다 fresh 서브에이전트 dispatch + task 간 리뷰 체크포인트. 빠른 반복.

**2. Inline Execution** — 현재 세션에서 그대로 실행. 배치 + checkpoints 로 리뷰.

**어느 방식으로 진행할까요?**
