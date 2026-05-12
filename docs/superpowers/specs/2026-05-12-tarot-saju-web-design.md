# Tarosaju — 타로·사주 모바일 웹 v1 설계서

> 생성일: **2026-05-12**
> 위치: `C:\Users\user\OneDrive\문서\tarosaju`
> 작성: `superpowers:brainstorming` 을 통한 사용자 협업
> 다음 단계: `superpowers:writing-plans` 로 구현 계획 작성

---

## 개요

**Tarosaju** 는 사주 명식과 타로 카드 3장을 한 흐름에서 융합 해석하는 한국어 모바일 웹 서비스다.
사용자가 이름·성별·양력 생년월일·태어난 시지(時支)를 입력하고 4 개 카테고리 중 하나(연애/금전/학업/취업)를 고르면, 메이저 아르카나 22 장에서 3 장을 뽑아 사주 명식 + 카드의 융합 풀이를 한 화면에 보여 준다.

- **목적**: 개인 포트폴리오 — **디자인·애니메이션 완성도가 최우선**.
- **스코프**: 미니멀 코어 v1 — 5 화면, 공유/저장/히스토리/다국어/다크모드 토글 없음.
- **디자인 도구**: `claude.ai/design` — 카드 일러스트 22 장과 화면별 시안은 거기서 생성. 본 spec 은 디자인 결과물을 받아 코드로 옮길 그릇.

---

## 의사결정 요약

| 항목 | 결정 |
|---|---|
| 목적 | 개인 포트폴리오 (디자인 완성도 우선) |
| 결합 메커니즘 | 융합 한 흐름 (사주 + 타로 → 단일 결과) |
| 사용자 흐름 | 홈 → 입력 → 카테고리 → 드로우 → 결과 (5 화면) |
| 스코프 | 미니멀 코어 — 공유/저장/히스토리/다크모드 토글 없음 |
| 디자인 시그니처 | **드로우 인터랙션 + 결과 reveal** 두 화면 모두 |
| 사주 깊이 | 명식 계산(`lunar-javascript`) + Gemini 자연어 풀이 |
| 결과 화면 시각 디테일 | 한자 명식 8 글자 + 카드 3 장 + 풀이 텍스트 |
| 카드 데이터셋 | 메이저 아르카나 22 장만 |
| 디자인 도구 | `claude.ai/design` (시각 companion 미사용) |
| 카드 이미지 출처 | `claude.ai/design` 으로 22 장 직접 |
| API 응답 방식 | 한 번에 구조화된 JSON (responseSchema) |
| 코드 위치 | `C:\Users\user\OneDrive\문서\tarosaju` (`event-auto` 와 완전 별도) |

---

## 1. 아키텍처

### 1-1. 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js 15 App Router** | Route Handler 로 Gemini API 키 서버 보관 |
| 언어 | **TypeScript** strict | 디자인 토큰·스키마·라우트 타입 안전 |
| 스타일 | **Tailwind CSS** + CSS Variables | `claude.ai/design` 의 토큰을 `tokens.css` 로 받고 tailwind config 에 연결 |
| 애니메이션 | **Framer Motion** | `layout` / `AnimatePresence` / `drag` / spring 한 패키지 |
| LLM | **`@google/generative-ai`** (`gemini-2.0-flash`) | 무료 티어 충분, 응답 빠름, `responseSchema` 지원 |
| 사주 명식 | **`lunar-javascript`** | 양력 → 음력 → 천간지지 8 글자, 한국 사주 표준 |
| 클라이언트 상태 | **zustand** (+ `persist` middleware, sessionStorage) | 5 화면 흐름 + 새로고침 보존 |
| 검증 | **Zod** | 입력·Gemini 응답 양쪽 |
| 폰트 | Fraunces · Pretendard · Noto Serif KR | `next/font` 로 self-hosted, OFL |
| 배포 | **Vercel** 무료 | Next.js 네이티브 |
| 테스트 | Vitest · Playwright · MSW · axe-core | 섹션 6 참고 |

### 1-2. 폴더 구조 (단독 레포)

```
tarosaju/
├── app/
│   ├── layout.tsx                # 폰트 · 메타 · 전역 grain SVG
│   ├── page.tsx                  # 홈
│   ├── profile/page.tsx          # 이름 · 성별 · 생년월일 · 시지
│   ├── category/page.tsx         # 연애 / 금전 / 학업 / 취업
│   ├── draw/page.tsx             # 시그니처 1 — 셔플 · 펼침 · 선택 · 뒤집기
│   ├── result/page.tsx           # 시그니처 2 — 명식 + 카드 + 풀이 reveal
│   └── api/fortune/route.ts      # Gemini API 프록시 (server-only)
├── components/
│   ├── card/{TarotCard, CardDeck, CardSpread, CardFlip}.tsx
│   ├── result/{SajuPillars, FortuneNarrative, ResultHeader}.tsx
│   ├── form/{ProfileForm, BirthTimePicker}.tsx
│   └── ui/{Button, Input, ChipSelector, GrainOverlay, Toast}.tsx
├── lib/
│   ├── saju.ts                   # lunar-javascript 래핑, 8 글자 계산
│   ├── tarot.ts                  # 22 장 셔플 · 드로우 (Fisher–Yates + 50% reversed)
│   ├── gemini.ts                 # 서버 전용 (`import 'server-only';`)
│   ├── prompt.ts                 # 시스템 · 사용자 프롬프트 템플릿
│   └── schema.ts                 # Zod 스키마 (입력 · 응답)
├── data/majorArcana.ts           # 22 장 메타 (id, ko/en, upright/reversed 의미)
├── public/cards/                 # claude.ai/design 결과물 0..21.webp + back.webp
├── store/session.ts              # zustand + persist
├── styles/{tokens.css, globals.css}
├── docs/superpowers/specs/2026-05-12-tarot-saju-web-design.md   # 이 문서
├── tests/{unit, integration, e2e}/...
├── .env.local                    # 미커밋
├── .env.example                  # GEMINI_API_KEY=
├── .gitignore
├── README.md
├── LICENSE                       # MIT
├── DESIGN_NOTES.md               # claude.ai/design 시안·토큰·폰트 출처
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 1-3. 환경 변수

| 키 | 위치 | 비고 |
|---|---|---|
| `GEMINI_API_KEY` | `.env.local` (서버 only) | `.gitignore` 포함, `.env.example` 키 이름만 |
| `GEMINI_MODEL` | `.env.local` | 기본 `gemini-2.0-flash`, swap 가능 |

`lib/gemini.ts` 첫 줄에 `import 'server-only';` — 실수로 client 컴포넌트에서 import 하면 빌드 fail.

---

## 2. 데이터 흐름 · 사주 · 프롬프트

### 2-1. 사주 명식 계산

12 지지 라벨 → 그 지지의 중간 시각 → `Solar → Lunar → EightChar`.

```ts
// lib/saju.ts
import { Solar } from 'lunar-javascript';

export const HOUR_BRANCH = ['자','축','인','묘','진','사','오','미','신','유','술','해'] as const;
export type HourBranch = (typeof HOUR_BRANCH)[number];

const HOUR_BRANCH_TO_TIME: Record<HourBranch, number> = {
  자: 0, 축: 2, 인: 4, 묘: 6, 진: 8, 사: 10,
  오: 12, 미: 14, 신: 16, 유: 18, 술: 20, 해: 22,
};

export type Pillars = { year: string; month: string; day: string; hour: string }; // 각 2 글자 한자

export function computePillars(input: {
  year: number; month: number; day: number; hourBranch: HourBranch;
}): Pillars {
  const hour = HOUR_BRANCH_TO_TIME[input.hourBranch];
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, hour, 0, 0);
  const ec = solar.getLunar().getEightChar();
  return { year: ec.getYear(), month: ec.getMonth(), day: ec.getDay(), hour: ec.getTime() };
  // 예: { year:'甲申', month:'乙亥', day:'丁卯', hour:'戊寅' }
}
```

명식 계산은 **서버에서 다시 수행** (클라이언트가 보낸 값 신뢰 X).

### 2-2. 카드 데이터 & 드로우

```ts
// data/majorArcana.ts
export type ArcanaCard = {
  id: number;          // 0..21
  ko: string;          // '바보'
  en: string;          // 'The Fool'
  keywords: { upright: string[]; reversed: string[] };
};

// lib/tarot.ts
export type Phase = '과거' | '현재' | '미래';
export type DrawnCard = { card: ArcanaCard; reversed: boolean; phase: Phase };

export function drawThree(): DrawnCard[] {
  const deck = [...majorArcana];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const phases: Phase[] = ['과거', '현재', '미래'];
  return deck.slice(0, 3).map((card, i) => ({
    card, reversed: Math.random() < 0.5, phase: phases[i],
  }));
}
```

3 장의 의미는 **과거 / 현재 / 미래** 로 고정. 카테고리별로 포지션 의미 바꾸지 않음 (MVP 단순화).

### 2-3. Gemini 프롬프트 (lib/prompt.ts)

**시스템 프롬프트 (불변, 서버에서 조립, 클라이언트 노출 X)**:
- 한국어로 글을 쓰는 사주·타로 큐레이터.
- 톤: 차분·신뢰감. **"운명/숙명/신비/계시" 화법 금지.** 시적 절제, 직설보다 함축.
- 한자 명식은 1~2 문장의 분석 근거로만 짧게 언급, 길게 풀이 X.
- 모든 풀이는 사용자가 고른 단일 카테고리에 집중.
- 응답은 **JSON 만** (한국어 텍스트 필드 안에).

**사용자 프롬프트 템플릿**:
```
사용자: ${name} (${gender}, 양력 ${birthDate}, ${hourBranch}시)
사주 명식: 년주 ${pillars.year} / 월주 ${pillars.month} / 일주 ${pillars.day} / 시주 ${pillars.hour}
카테고리: ${category}
뽑힌 카드:
  과거 — ${cards[0].card.ko} (${cards[0].reversed ? '역방향' : '정방향'})
  현재 — ${cards[1].card.ko} (${cards[1].reversed ? '역방향' : '정방향'})
  미래 — ${cards[2].card.ko} (${cards[2].reversed ? '역방향' : '정방향'})

위 정보를 종합해 "${category}"에 대해 다음 JSON 스키마로 풀이해 주세요.
{ "summary": ..., "cards": [...], "advice": ... }
```

Gemini SDK 호출 시 **`generationConfig.responseMimeType: 'application/json'` + `responseSchema`** 지정 → 한 번에 검증 가능한 JSON.

### 2-4. POST `/api/fortune` 입출력

```ts
// Request body
{
  name: string;
  gender: '남' | '여';
  birthDate: 'YYYY-MM-DD';        // 양력
  hourBranch: HourBranch;
  category: '연애' | '금전' | '학업' | '취업';
  cards: { id: number; reversed: boolean }[];   // 길이 3, id 유니크
}

// Response 200
{
  pillars: Pillars;                              // 서버 재계산
  fortune: FortuneResponse;
}

// Response 4xx / 5xx
{ error: ErrorCode; retryable: boolean; message?: string }
```

`ErrorCode` = `invalid_input | config_missing | upstream_error | rate_limited | timeout | parse_failed | saju_calc_failed`.

### 2-5. 응답 스키마 (Zod)

```ts
// lib/schema.ts
import { z } from 'zod';

export const FortuneSchema = z.object({
  summary: z.string().min(20),
  cards: z.tuple([
    z.object({ phase: z.literal('과거'), card: z.string(), reading: z.string().min(20) }),
    z.object({ phase: z.literal('현재'), card: z.string(), reading: z.string().min(20) }),
    z.object({ phase: z.literal('미래'), card: z.string(), reading: z.string().min(20) }),
  ]),
  advice: z.string().min(20),
});
export type FortuneResponse = z.infer<typeof FortuneSchema>;
```

검증 실패 시 → 서버에서 **1 회 자동 재시도** → 또 실패 시 클라이언트로 5xx `parse_failed`.

---

## 3. 5 화면 구조

진행 도트 `①②③` 은 **profile → category → draw** 단계 상단에만. 홈·결과는 풀스크린.

### 3-1. 홈 (`/`)
- Fraunces hero 헤드라인 한 줄 + 한 줄 설명 + 단일 CTA "운세 보기" → `/profile`
- 배경에 떠 있는 카드 1~2 장 (decorative, 정적)
- 시그니처 모먼트 없음

### 3-2. 정보 입력 (`/profile`)
- 폼 (한 화면 안에 다 보이게):
  - 이름 — text, 1~20 자
  - 성별 — chip `남` / `여`
  - 양력 생년월일 — `<input type="date">` 네이티브 picker
  - 태어난 시 — chip selector 12 지지: `자 23–01` `축 01–03` ... `해 21–23`
- 모두 입력되면 "다음" CTA 활성 → `/category`
- 미입력 시 비활성 + inline 에러

### 3-3. 카테고리 (`/category`)
- 4 개 카테고리 (2×2 또는 세로 스택 — `claude.ai/design` 단계 결정)
  - **UI 표시**: 연애운 / 금전운 / 학업운 / 취업운
  - **API value**: `'연애' | '금전' | '학업' | '취업'` (request body 의 `category` 필드)
- 각각 한 줄 부제 (예: "연애운 — 관계의 다음 결")
- 한 번에 1 개 선택 → "이 운세 보기" CTA → `/draw`

### 3-4. 드로우 (`/draw`) — 시그니처 1
섹션 4-A 참고.

### 3-5. 결과 (`/result`) — 시그니처 2
진입 즉시 `POST /api/fortune` 호출. 응답 대기는 페이지 전환 + 카드 carry-over 1.5 초로 가림. 섹션 4-B 참고.

- **레이아웃**: 결과 화면은 **세로 스크롤 가능**. 7.4 초 reveal 시퀀스가 끝난 뒤 정적 잡지 페이지처럼 머무름 — 사용자는 스크롤로 풀이를 다시 읽을 수 있다.
- **화면 구성 순서 (위 → 아래)**: 카테고리 헤더 → 사주 명식 8 글자 → 카드 3 장 (가로 정렬) → summary → cards[].reading × 3 → advice → "다시 보기" CTA.
- **색 모드**: v1 디자인은 **라이트 모드를 기본**으로 `claude.ai/design` 에서 정의. 다크 토큰은 같이 정의해 두지만 **사용자 토글 X — OS 시스템 설정에 따라 자동 전환**. (다크 토글 UI 는 v1.1+ 비범위)

### 3-6. 라우팅 가드

| 경로 | 진입 조건 | 위반 시 |
|---|---|---|
| `/` | 없음 | — |
| `/profile` | 없음 | — |
| `/category` | `profile` 완료 | `/profile` 리다이렉트 + toast |
| `/draw` | `profile` + `category` 완료 | `/profile` 리다이렉트 + toast |
| `/result` | `profile` + `category` + 카드 3장 | `/profile` 리다이렉트 + toast |

`useEffect` + `router.replace()` 로 강제 이동. zustand `persist` (sessionStorage) 로 새로고침 후에도 흐름 유지.

---

## 4. 시그니처 애니메이션

### 4-A. 드로우 시퀀스

5 단계 상태 머신:
```ts
type Phase = 'idle' | 'shuffling' | 'spread' | 'selecting' | 'ready';
```

| 단계 | 시간 | 디테일 |
|---|---|---|
| idle | — | 22 장 z-stack (각 0.5px offset), 더미 전체 `y: [-4, 4, -4]` yoyo 4초 |
| shuffling | 1.5 초 | 카드별 random `(x, y, rotate)` 200ms → 100ms hold → 중앙으로 stagger 800ms → 결과 결정 400ms |
| spread | 1.2 초 | 22 장 부채꼴 (spring `stiffness: 100, damping: 18`), 카드별 30ms stagger |
| selecting | 탭당 0.6 초 | `layoutId="slot-{0\|1\|2}"` + `layout` prop → FLIP 자동 transition. 빈자리는 부채꼴 알아서 닫음 |
| ready | — | 3 장 모이면 "운세 보기" CTA 페이드 in. 탭 → `router.push('/result')` + carry-over |

정·역방향은 `shuffling` 단계에서 클라이언트가 결정 (`Math.random() < 0.5`). 사용자는 모름.

### 4-B. 결과 reveal 시퀀스 (총 7.4 초)

```ts
const sequence = [
  { id: 'header',  at: 0,    dur: 200 },
  { id: 'pillars', at: 200,  dur: 300, count: 8 },   // 한자 한 글자씩
  { id: 'flip',    at: 2600, dur: 800, count: 3 },   // 카드 좌→우 뒤집기
  { id: 'summary', at: 5000, dur: 400 },
  { id: 'reading', at: 5400, dur: 500, count: 3 },
  { id: 'advice',  at: 6900, dur: 500 },
  { id: 'cta',     at: 7400, dur: 300 },
];
```

- 카드 뒤집기: `transformStyle: 'preserve-3d'` + `backfaceVisibility: 'hidden'` + 정/역방향 따라 앞면에 `rotateZ(180deg)` 추가.
- 풀이 unfold: 단락마다 `fade + y:8→0`, 500ms ease-out, `viewport={{ once: true }}`.

### 4-C. 성능 가드

| 항목 | 디테일 |
|---|---|
| 한 시점 motion 노드 | 셔플 22 + 결과 12 — 모바일 60 fps OK |
| 카드 뒷면 | 셔플 중 PNG X, **단색 + SVG 패턴** (페인트 비용 ↓) |
| 카드 앞면 22 장 | `next/image` lazy, 부채꼴 단계에서 prefetch |
| 변환 | `transform` + `opacity` 만 (GPU compositor) — `width`/`top`/`left` 변경 금지 |
| 폰트 | `next/font` `display: 'swap'`, Noto Serif KR subset |

### 4-D. Reduced motion

`useReducedMotion()` true 시:
- 셔플 → 즉시 부채꼴
- 카드 선택 → 즉시 슬롯
- 결과 reveal → T+0 에 전체 표시 (시퀀스 X)
- 카드 뒤집기 → 즉시 앞면

---

## 5. 에러 · 엣지 · 접근성

### 5-1. 입력 검증 (클라이언트 + 서버)

| 필드 | 규칙 |
|---|---|
| `name` | 1–20 자, 공백만 X, sanitize |
| `gender` | enum 남/여 |
| `birthDate` | 1900-01-01 ~ 오늘 |
| `hourBranch` | enum 12 지지 |
| `category` | enum 4 |
| `cards` | 길이 3, id 유니크, id ∈ [0..21], `reversed: boolean` |

### 5-2. API 에러 분기 (결과 화면)

| 시나리오 | 응답 | UX |
|---|---|---|
| `GEMINI_API_KEY` 누락 | 500 `config_missing`, `retryable: false` | "서비스 설정 오류" + 홈으로 |
| Gemini 429 | 503 `rate_limited`, `retryable: true` | "잠시 후 다시" + 재시도 |
| Gemini 5xx | 502 `upstream_error`, `retryable: true` | 동일 |
| 타임아웃 (8 초 AbortController) | 504 `timeout`, `retryable: true` | "응답이 길어지고 있어요" + 재시도 |
| 응답 파싱 실패 (재시도 후) | 500 `parse_failed`, `retryable: true` | "결과를 정리하다 막혔어요" + 재시도 |
| 입력 검증 실패 | 400 `invalid_input` | `/profile` 리다이렉트 |

**재시도 정책 (두 층 분리)**:
- **서버 자동 재시도** — Gemini 응답이 `FortuneSchema` 검증에 실패하면 같은 프롬프트로 1 회 자동 재시도. 또 실패하면 5xx `parse_failed` 반환. (사용자에게 보이지 않음)
- **클라이언트 사용자 재시도** — 5xx 응답 중 `retryable: true` 일 때만 결과 화면에 "다시 시도" 버튼 노출. 탭하면 **같은 입력 + 같은 카드 3 장** 으로 `POST /api/fortune` 재호출 (카드 재추첨 X). 클라이언트 재시도 횟수 제한은 없음 (사용자가 지치면 멈춤).

### 5-3. 사주 계산 엣지

| 케이스 | 처리 |
|---|---|
| 1900 이전 / 미래 날짜 | UI + 서버 차단 |
| 윤년 2월 29일 | `lunar-javascript` 자동 |
| 자시 경계 | 12 지지 라벨 입력이라 모호함 없음 |
| `lunar-javascript` throw | try/catch → 500 `saju_calc_failed` |

### 5-4. 라우팅 / 새로고침 / 뒤로가기

| 시나리오 | 동작 |
|---|---|
| `/result` 직접 진입 | `/profile` 리다이렉트 + toast |
| `/result` 새로고침 | persist 의 입력+카드 → API 재호출 (응답은 매번 다를 수 있음) |
| `/draw` 새로고침 | 카드 reset, 처음부터 셔플 (사용자 정보·카테고리는 유지) |
| 결과 → 드로우 뒤로가기 | 카드 reset |
| "다시 보기" | `category` + `cards` reset, `profile` 유지 |

### 5-5. 접근성 (a11y)

- 페이지 전환 focus: 메인 헤딩 `tabIndex={-1}` + `focus()`
- 결과 reveal 영역 `aria-live="polite"` — 스크린리더가 reveal 따라 읽음
- 카드 선택 `<button>` + `aria-label="과거 자리 카드 뽑기"`
- 키보드 폴백: 드로우 화면 보조 CTA "자동으로 3 장 뽑기"
- 폼: 모든 input `<label htmlFor>` 또는 `aria-label`
- 색 대비: `claude.ai/design` 시안 받을 때 WCAG AA — 모든 텍스트 4.5:1+
- 모션 민감: `useReducedMotion()` (4-D)

### 5-6. 모바일 UX 엣지

| 시나리오 | 처리 |
|---|---|
| 100vh 버그 (iOS Safari) | `100dvh` (fallback `100vh`) |
| 가로 모드 | 세로 우선, max-width 600px 컨테이너 |
| 한국어 줄바꿈 | `word-break: keep-all` |
| 더블 탭 줌 | `touch-action: manipulation` |
| 키보드 등장 인풋 가림 | `scroll-into-view-if-needed` + `visualViewport` |
| iOS `<input type="date">` | 네이티브 picker 그대로 |

### 5-7. 빌드 / 배포 / 비밀 관리

| 체크 | 처리 |
|---|---|
| 클라이언트 누출 방지 | `lib/gemini.ts` 첫 줄 `import 'server-only';` |
| `.env.local` 커밋 | `.gitignore` + `.env.example` 키 이름만 |
| Vercel 환경변수 | 대시보드에서 preview/prod 별도 |
| 빌드 타임 키 검증 | 서버 모듈에서 `process.env.GEMINI_API_KEY` 사용 (없으면 fail) |

---

## 6. 테스트 · 합격 기준

### 6-1. 테스트 도구

| 레벨 | 도구 |
|---|---|
| 단위 / 통합 | **Vitest** |
| E2E | **Playwright** (모바일 viewport) |
| 시각 회귀 | **Playwright `toHaveScreenshot()`** |
| a11y | **@axe-core/playwright** |
| Gemini mock | **MSW** (실제 API 호출 X) |

### 6-2. 단위 테스트

| 모듈 | 핵심 케이스 |
|---|---|
| `lib/saju.ts` | (1) 알려진 명식 fixture 와 일치, (2) 12 지지 → 시각 매핑 12 개, (3) 윤년·세기 경계 |
| `lib/tarot.ts` | (1) `drawThree()` 항상 길이 3, id 유니크, (2) `reversed` 분포 1000회 → 45~55%, (3) 시드 고정 시 결정성 |
| `lib/prompt.ts` | (1) 시스템 프롬프트에 금지 어휘(`운명`/`숙명`/`신비`/`계시`) 없음, (2) 사용자 데이터 null 시 throw |
| `lib/schema.ts` | (1) 정상 응답 parse, (2) summary 누락 reject, (3) cards 길이 != 3 reject, (4) phase enum 위반 reject |

### 6-3. 통합 테스트 — `POST /api/fortune`

Gemini SDK mock 으로 Route Handler 직접 호출:

| 케이스 | 기대 |
|---|---|
| 유효 입력 | 200 + `FortuneSchema` 통과 |
| `name` 누락 | 400 `invalid_input` |
| Gemini 503 시뮬 | 502 `upstream_error`, `retryable: true` |
| AbortController timeout | 504 `timeout` |
| 파싱 실패 (1차) → 재시도 성공 | 200 (재시도 카운트 1) |
| 재시도 후도 실패 | 500 `parse_failed` |
| `GEMINI_API_KEY` 빈 문자열 | 500 `config_missing`, `retryable: false` |

### 6-4. E2E 5 시나리오 (iPhone 13 viewport)

1. **Happy path** — 홈 → 입력 → 카테고리 → 드로우(셔플·3장 선택) → 결과 reveal → "다시 보기"
2. **Reduced motion** — `prefers-reduced-motion: reduce` 로 동일 흐름, 모든 애니메이션 즉시
3. **라우팅 가드** — `/result` 직접 진입 → `/profile` + toast
4. **API 에러 + 재시도** — Gemini mock 503 → 재시도 → 200 → reveal
5. **새로고침 흐름** — 결과 reveal 후 새로고침 → persist → 재호출 → 새 응답 reveal

### 6-5. 시각 회귀 — 5 화면 baseline

홈 / 입력(채워진 상태) / 카테고리(선택 후) / 드로우(부채꼴 직후) / 결과(reveal 끝).
CI diff > 0.1% → PR 차단.

### 6-6. 접근성 검증

- axe-core 5 화면 violation **0**
- 키보드 only 흐름 (자동 뽑기 폴백)
- iOS VoiceOver 수동 1 회 (배포 전)
- 결과 reveal 중 `aria-live` 영역이 풀이를 읽음

### 6-7. 성능 / Web Vitals

| 지표 | 목표 |
|---|---|
| Mobile Performance (Lighthouse) | ≥ 90 |
| Mobile Accessibility (Lighthouse) | ≥ 95 |
| LCP | < 2.5 s |
| CLS | < 0.1 |
| INP | < 200 ms |
| 셔플 / reveal frame rate | 60 fps (DevTools Performance 수동) |

### 6-8. Definition of Done — v1

- [ ] 5 화면 동작 + 라우팅 가드 통과
- [ ] 모바일 viewport (375×667 / 390×844 / 414×896) 깨짐 없음
- [ ] iOS Safari + Android Chrome 실기기 dogfood 1 회
- [ ] Gemini API 단일 JSON + Zod 스키마 통과
- [ ] 단위/통합 테스트 모두 통과
- [ ] E2E 5 시나리오 모두 통과
- [ ] Lighthouse Mobile Performance ≥ 90 / Accessibility ≥ 95
- [ ] `prefers-reduced-motion` 시 모든 애니메이션 즉시
- [ ] `.env.local` 미커밋, `lib/gemini.ts` 에 `'server-only'`
- [ ] 22 장 카드 이미지 모두 `public/cards/` 존재 + 빌드 통과
- [ ] README quickstart + Vercel 배포 + 환경변수 안내
- [ ] LICENSE (MIT) + `DESIGN_NOTES.md`

### 6-9. 수동 QA 체크리스트 (배포 직전)

- [ ] 한국어 줄바꿈 어색한 곳 없음 (`word-break: keep-all`)
- [ ] 한자 명식 8 글자 폰트 깨짐 없음
- [ ] 22 장 카드 이미지 모두 로딩 (특히 The World)
- [ ] OS 다크 모드 자연스러운 전환 (시스템 따름)
- [ ] iPhone SE 에서 셔플·결과 reveal 60 fps
- [ ] Vercel cold start 도 8 초 timeout 안 넘김
- [ ] 동일 입력 3 회 호출 — 결과 텍스트 다른지 (Gemini temperature)

---

## 7. 비범위 (Out of Scope — v1.1+)

| 기능 | 비고 |
|---|---|
| 결과 공유 (이미지 다운/링크) | URL 인코딩 또는 OG 이미지 생성 필요 |
| 결과 저장 / 히스토리 | DB 필요 — 미니멀 코어 의도와 충돌 |
| 22 장 카드 도감 페이지 | 별도 화면 |
| 일일 운세 (오늘의 한 장) | 별도 흐름 |
| 다국어 (영문) | i18n 셋업 |
| 다크 모드 토글 | v1 은 시스템 따름 |
| 78 장 풀 덱 | 마이너 아르카나 56 장 디자인 부담 |
| 사용자 계정 / OAuth | 부담 |
| 결제 / 프리미엄 풀이 | — |
| PWA / 오프라인 | — |
| 만세력 + 십신 + 대운 | 정통 명리학 깊이 |

---

## 8. 결정 로그

| Date | 결정 | 이유 |
|---|---|---|
| 2026-05-12 | 개인 포트폴리오 (디자인 완성도 우선) | 사용자 선택 — 스코프·인프라·정확도 결정의 베이스 |
| 2026-05-12 | 융합 한 흐름 (사주+타로) | 한 결과 화면에 디자인 화력 집중, 분리 메뉴는 구현량 2배 |
| 2026-05-12 | 미니멀 코어 5 화면 | 디자인 완성도에 시간 100% 투입, 공유/저장/히스토리 비범위 |
| 2026-05-12 | 드로우 + 결과 둘 다 시그니처 | 사용자 의도 — "디자인과 애니메이션이 매우매우 중요" |
| 2026-05-12 | 명식 계산(`lunar-javascript`) + Gemini 풀이 | LLM 단독 계산은 어림짐작 — 명식 8 글자 정확도 확보 + 한자 시각 디테일 |
| 2026-05-12 | 메이저 아르카나 22 장만 | claude.ai/design 으로 일러스트 22 장이 현실적 한계, 3 장 조합 충분 |
| 2026-05-12 | Next.js 15 App Router | Route Handler 로 Gemini API 키 서버 보관 자연스러움 |
| 2026-05-12 | 한 번에 JSON 응답 (responseSchema) | 파싱 안전 + reveal 애니메이션 타이밍 제어 쉬움 |
| 2026-05-12 | 코드 위치 `tarosaju/` (event-auto 와 별개) | 사용자 선택 — 독립 포트폴리오 |
| 2026-05-12 | 시각 companion 미사용 | 디자인은 `claude.ai/design` 으로 직접 |
| 2026-05-12 | zustand + sessionStorage persist | 5 화면 흐름 + 새로고침 보존, Redux 보다 가벼움 |
| 2026-05-12 | 카드 reveal 7.4초 자동 시퀀스 | 캡처 친화 + 잡지 페이지 호흡 |
| 2026-05-12 | self-review 인라인 수정 4 건 | (1) 카테고리 UI 표시 vs API value 매핑 명시, (2) 결과 화면 세로 스크롤·구성 순서 명시, (3) v1 라이트 모드 default + 다크는 시스템 따름 (토글 X) 명시, (4) 재시도 정책을 서버 자동 1회 / 클라이언트 사용자 무제한으로 분리 |

---

## 변경 절차

이 문서는 살아 있는 문서다. 변경 시:
1. 미세 조정 (시간 ms 단위, 토큰 hex, 컴포넌트 props) — 즉시 수정 + 결정 로그 추가
2. 큰 변경 (스택 교체, 시그니처 모먼트 추가, 카테고리 수정) — `superpowers:brainstorming` 재실행 또는 `superpowers:writing-plans` 안에서 명시적 변경 협의

다음 단계: `superpowers:writing-plans` 로 본 spec 을 구현 계획 (단계별 작업·검증 체크포인트) 으로 분해한다.
