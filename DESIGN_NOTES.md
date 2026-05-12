# Design Notes

## 디자인 도구

본 프로젝트의 시각 자산(카드 22 장 + 화면별 시안)은 [`claude.ai/design`](https://claude.ai/design) 에서 제작했다.

## 토큰

`styles/tokens.css` 의 CSS 변수가 단일 출처. Tailwind 의 `bg-*`/`text-*` 클래스는 이 변수를 참조.

| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--color-bg` | `#FAFAF7` | `#0F0F0E` |
| `--color-surface` | `#FFFFFF` | `#1A1A18` |
| `--color-text` | `#1A1A1A` | `#F5F5F2` |
| `--color-muted` | `#6B6B6B` | `#A8A8A4` |
| `--color-border` | `#E8E8E5` | `#2D2D2A` |
| `--color-accent` | `#5C1F2C` | `#C76478` |

⚠️ Task 25 에서 `claude.ai/design` 결과물로 덮어쓰일 임시값.

## 폰트

- **Fraunces** (display, 라틴): SIL OFL, `next/font/google`
- **Noto Serif KR** (한자/한글 세리프): SIL OFL, `next/font/google`, weights 400/500/700
- **Pretendard Variable** (body): SIL OFL, `public/fonts/PretendardVariable.woff2` self-host

## 모션 원칙

- 대부분 차분, **두 모먼트만 시그니처**:
  1. 드로우 화면의 셔플 → 부채꼴 → 선택 → 자리잡기
  2. 결과 화면의 7.4 초 reveal (한자 8 자 stagger + 카드 3 장 뒤집기 + 풀이 unfold)
- `prefers-reduced-motion: reduce` 시 모든 애니메이션 즉시.
- 결과 화면의 `T` 상수가 단일 타임라인 진리값 (components/result/FortuneRevealOrchestrator.tsx).

## 카드 비주얼

- 메이저 아르카나 22 장 (`public/cards/0..21.svg`) + 뒷면 1 장 (`public/cards/back.svg`).
- v1 은 placeholder SVG (단색 + 번호 + 카드명 텍스트). Task 24 에서 `claude.ai/design` 결과물로 교체.
- 비율 5:8 (200×320 viewBox).
- 정/역방향은 코드에서 `rotate-180` 으로 처리 (이미지는 정방향만 1 세트).
