import { test, expect } from '@playwright/test';
import { validFortuneResponse, fillProfile, pickCategory, autoDraw } from './fixtures';

test('api retry: 503 on first call, success on retry', async ({ page }) => {
  let callCount = 0;

  await page.route('**/api/fortune', async route => {
    callCount++;
    if (callCount === 1) {
      // First call: return 503
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'upstream_error', retryable: true }),
      });
    } else {
      // Second call: return success
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(validFortuneResponse),
      });
    }
  });

  // Navigate through the flow
  await page.goto('/profile');
  await fillProfile(page);
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/category');

  await pickCategory(page, '연애운');
  await expect(page).toHaveURL('/draw');

  await autoDraw(page);
  await expect(page).toHaveURL('/result');

  // Should land on error state after first (503) call
  await expect(page.getByRole('button', { name: '다시 시도' })).toBeVisible({ timeout: 10_000 });

  // Click retry — second call should succeed
  await page.getByRole('button', { name: '다시 시도' }).click();

  // Now success — heading should show category
  await expect(page.getByRole('heading', { level: 1 })).toContainText('연애운', { timeout: 10_000 });
  expect(callCount).toBe(2);
});
