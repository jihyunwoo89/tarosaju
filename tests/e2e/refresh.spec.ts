import { test, expect } from '@playwright/test';
import { validFortuneResponse, fillProfile, pickCategory, autoDraw } from './fixtures';

test('refresh: reloading /result triggers a second API call', async ({ page }) => {
  let callCount = 0;

  await page.route('**/api/fortune', async route => {
    callCount++;
    const n = callCount;
    // Each call returns slightly different summary to differentiate
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...validFortuneResponse,
        fortune: {
          ...validFortuneResponse.fortune,
          summary: `call ${n} — 관계의 결이 새로운 방향으로 펼쳐지고 있습니다. 지금까지의 인연을 돌아보고 솔직한 마음을 나누세요.`,
        },
      }),
    });
  });

  // Navigate through to result
  await page.goto('/profile');
  await fillProfile(page);
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/category');

  await pickCategory(page, '연애운');
  await expect(page).toHaveURL('/draw');

  await autoDraw(page);
  await expect(page).toHaveURL('/result');

  // First call — verify summary shows "call 1"
  await expect(page.getByRole('article')).toContainText('call 1', { timeout: 12_000 });
  expect(callCount).toBe(1);

  // Reload the page — the session state is in sessionStorage so the guard passes,
  // but useFortune re-fetches on mount
  await page.reload();

  // After reload, a second API call should fire
  await expect(page.getByRole('article')).toContainText('call 2', { timeout: 12_000 });
  expect(callCount).toBe(2);
});
