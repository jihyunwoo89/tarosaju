import { test, expect } from '@playwright/test';
import { mockFortune, fillProfile, pickCategory, autoDraw } from './fixtures';

test.use({ reducedMotion: 'reduce' });

test('home baseline', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home.png', { maxDiffPixelRatio: 0.005 });
});

test('profile filled baseline', async ({ page }) => {
  await page.goto('/profile');
  await fillProfile(page);
  await expect(page).toHaveScreenshot('profile-filled.png', { maxDiffPixelRatio: 0.005 });
});

test('result baseline (reduced motion)', async ({ page }) => {
  await mockFortune(page);
  await page.goto('/profile');
  await fillProfile(page);
  await page.getByRole('button', { name: '다음' }).click();
  await page.waitForURL('**/category');
  await pickCategory(page, '연애운');
  await autoDraw(page);
  await page.getByText(/관계의 결/).waitFor({ timeout: 8_000 });
  await expect(page).toHaveScreenshot('result.png', { maxDiffPixelRatio: 0.01 });
});
