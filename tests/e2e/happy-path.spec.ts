import { test, expect } from '@playwright/test';
import { mockFortune, fillProfile, pickCategory, autoDraw } from './fixtures';

test('happy path: full flow from home to result', async ({ page }) => {
  // Set up API mock before any navigation that reaches /result
  await mockFortune(page);

  // 1. Home page — verify it renders
  await page.goto('/');
  await expect(page.locator('main')).toContainText('Tarosaju');

  // Navigate to profile via the link (wraps a button — click the <a> element directly)
  await page.locator('a[href="/profile"]').click();
  await expect(page).toHaveURL('/profile');

  // 2. Profile form
  await fillProfile(page);
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/category');

  // 3. Category selection
  await pickCategory(page, '연애운');
  await expect(page).toHaveURL('/draw');

  // 4. Draw cards (auto)
  await autoDraw(page);
  await expect(page).toHaveURL('/result');

  // 5. Result page assertions
  // Category heading
  await expect(page.getByRole('heading', { level: 1 })).toContainText('연애운');

  // Saju pillars contain 庚午 (year pillar from mock)
  await expect(page.locator('[lang="zh"]')).toContainText('庚');
  await expect(page.locator('[lang="zh"]')).toContainText('午');

  // Fortune narrative text — "관계의 결" from mock summary
  await expect(page.getByRole('article')).toContainText('관계의 결', { timeout: 12_000 });
});
