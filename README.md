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

## 출시 (GitHub + Vercel)

### 1) 출시 전 placeholder 정리

- [ ] **LICENSE** 의 `(Your Name)` 을 본인 이름으로 교체
- [ ] **package.json** 의 `author`, `repository.url`, `homepage`, `bugs.url` 의 `damiao` 가 본인 GitHub username 과 일치하는지 확인. 다르면 4 군데 일괄 변경.

### 2) GitHub 레포 만들기

1. <https://github.com/new> → 레포 이름 `tarosaju` (private / public 선호 따라)
2. README 의 `Initialize this repository with` 항목들은 **모두 체크 해제** (이미 본 레포에 README/.gitignore/LICENSE 있음)
3. 원격 추가 + 첫 푸시:
   ```bash
   git remote add origin git@github.com:<your-username>/tarosaju.git
   git branch -M main
   git push -u origin main
   ```
   (HTTPS 사용 시: `https://github.com/<your-username>/tarosaju.git`)

### 3) Vercel 배포

1. <https://vercel.com/new> → 방금 만든 GitHub 레포 **Import**
2. Framework Preset: **Next.js** 자동 감지 (그대로 두기)
3. **Environment Variables** 추가 — Production + Preview + Development 세 환경 모두 체크:
   - `GEMINI_API_KEY` — <https://aistudio.google.com/apikey> 에서 발급한 키
   - `GEMINI_MODEL` (선택) — 기본 `gemini-2.0-flash`, 다른 모델 쓰려면 여기서 swap
4. **Deploy** 클릭 → 1–2 분 대기
5. 첫 배포 URL 확인. 그 URL 에서 happy-path 1 회 통과 (홈 → 입력 → 카테고리 → 카드 → 결과)

### 4) 실기기 dogfood

iOS Safari + Android Chrome 둘 다에서:
- [ ] 카드 셔플·부채꼴·픽 인터랙션 60fps 체감
- [ ] 결과 화면 7.4 초 reveal 자연스러움
- [ ] 한자 명식 8 글자 폰트 깨짐 없음
- [ ] OS 다크 모드 토글 시 자연스러운 색 전환

### 5) v1 태그

문제 없으면:
```bash
git tag -a v1.0.0 -m "v1.0.0 — Tarosaju MVP launch"
git push origin v1.0.0
```

## 알려진 한계 (v1)

- **카드 22 장 / 디자인 토큰**: 현재 placeholder. Task 24–25 에서 `claude.ai/design` 결과물로 교체 예정.
- **Lighthouse Performance ≈ 55**: 폰트(Pretendard 2MB + Noto Serif KR 3 weight) 로딩 비용. v1.1 에서 폰트 subset / preload 로 ≥90 목표.
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
