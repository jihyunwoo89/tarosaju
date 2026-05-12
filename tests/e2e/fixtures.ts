import { expect, type Page } from '@playwright/test';

// The API response shape — mirrors FortuneResponse + pillars from the route
export const validFortuneResponse = {
  pillars: {
    year: '庚午',
    month: '丁卯',
    day: '癸丑',
    hour: '甲寅',
  },
  fortune: {
    summary: '관계의 결이 새로운 방향으로 펼쳐지고 있습니다. 지금까지의 인연을 돌아보고 솔직한 마음을 나누세요.',
    cards: [
      {
        phase: '과거' as const,
        card: '바보',
        reading: '자유로운 시작과 순수한 설렘이 관계의 출발점을 이루었습니다. 두려움 없이 첫 발을 내디딘 용기가 현재를 만들었습니다.',
      },
      {
        phase: '현재' as const,
        card: '연인',
        reading: '선택의 기로에 서 있습니다. 마음이 진정으로 원하는 것을 따르세요. 결단은 미룰수록 더 어려워집니다.',
      },
      {
        phase: '미래' as const,
        card: '별',
        reading: '희망과 치유의 에너지가 앞길을 밝힙니다. 신뢰를 회복하고 서로를 있는 그대로 받아들이는 새로운 시작이 기다립니다.',
      },
    ],
    advice: '오늘 상대에게 솔직한 감정을 담은 메시지 하나를 보내 보세요. 작은 행동이 관계의 흐름을 바꿉니다.',
  },
};

/**
 * Intercepts /api/fortune and returns a mock response.
 * Must be called before navigating to /result.
 */
export async function mockFortune(page: Page, response = validFortuneResponse) {
  await page.route('**/api/fortune', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Fill the profile form with test data:
 *   name=홍길동, gender=남, birthDate=1990-03-15, hourBranch=인
 */
export async function fillProfile(page: Page) {
  // Wait for the profile form to be visible
  await page.waitForSelector('form', { timeout: 15_000 });

  // Name — Input component sets id="input-이름" and label for="input-이름"
  await page.locator('#input-이름').fill('홍길동');

  // Gender chip — ChipSelector renders <button aria-pressed=...>남</button>
  // (no sub text for gender chips, so accessible name is just '남')
  await page.getByRole('button', { name: '남', exact: true }).click();

  // Birth date — native date input
  await page.locator('input[type="date"]').fill('1990-03-15');

  // Hour branch chip: 인 (03–05). ChipSelector renders:
  //   <span class="font-medium">인</span><span>03–05</span>
  // Playwright computes accessible name from all text content → "인 03–05"
  // Filter to the BirthTimePicker fieldset (legend="태어난 시") to avoid ambiguity.
  const birthTimePicker = page.locator('fieldset').filter({ hasText: '태어난 시' });
  await birthTimePicker.getByRole('button', { name: /^인/ }).click();
}

/**
 * On the category page, select the given radio option and proceed.
 * CategoryGrid renders <button role="radio" aria-checked=...>.
 */
export async function pickCategory(page: Page, label: string) {
  await page.getByRole('radio', { name: new RegExp(label) }).click();
  await page.getByRole('button', { name: '이 운세 보기' }).click();
}

/**
 * On the draw page, complete the card-draw flow and navigate to /result.
 *
 * Two-step approach to avoid a stale-closure issue in CardDeck.autoPick() when
 * called from phase='idle' (the setTimeout callback captures stale revealOrder):
 * 1. Click "터치해서 셔플" — phase: idle → shuffling → spread after 1500ms.
 * 2. Wait for the leftmost spread card (index 0) to reach tx < -150px, which
 *    means the spread animation has progressed and phase='spread' is stable.
 * 3. Click "자동으로 3 장 뽑기" in spread phase — autoPickCore() runs with
 *    current (non-stale) revealOrder.
 * 4. Wait for "운세 보기" to become enabled, click it.
 *
 * With reducedMotion: spread fires after 50ms, cards reach final positions near-instantly.
 */
export async function autoDraw(page: Page) {
  // Step 1: start shuffle
  const shuffleBtn = page.getByLabel('카드 셔플 시작');
  await shuffleBtn.click();

  // Step 2: wait for spread phase to fully establish.
  // CardDeck: shuffling → spread after setTimeout(1500ms) in normal mode, 50ms reduced.
  // We detect spread by waiting for the leftmost card (index 0) to be near its final
  // spread position: x = (0 - 10.5) * 16 = -168px.
  // Wait for any card to have tx < -150 (most of the spread animation done).
  await page.waitForFunction(
    () => {
      const cards = document.querySelectorAll('[aria-label^="자리"]');
      if (cards.length < 22) return false;
      for (const card of Array.from(cards)) {
        const style = window.getComputedStyle(card as Element);
        const t = new DOMMatrix(style.transform);
        if (t.e < -150) return true; // leftmost card near final position
      }
      return false;
    },
    { timeout: 5_000 },
  );

  // Step 3: click auto-pick — now in spread phase, autoPickCore() uses current revealOrder
  await page.getByLabel('자동으로 3 장 뽑기').click();

  // Step 4: wait for "운세 보기" to become enabled (CardDeck.onComplete → setDone)
  const goBtn = page.getByRole('button', { name: '운세 보기' });
  await expect(goBtn).toBeEnabled({ timeout: 10_000 });
  await goBtn.click();

  // Wait for navigation to /result
  await page.waitForURL('**/result', { timeout: 10_000 });
}
