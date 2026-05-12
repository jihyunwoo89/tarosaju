import { test, expect } from '@playwright/test';
import { mockFortune, fillProfile, pickCategory, autoDraw } from './fixtures';

test.use({ reducedMotion: 'reduce' });

test('reduced motion: full flow completes with instant animations', async ({ page }) => {
  await mockFortune(page);

  await page.goto('/profile');
  await fillProfile(page);
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/category');

  await pickCategory(page, '연애운');
  await expect(page).toHaveURL('/draw');

  await autoDraw(page);
  await expect(page).toHaveURL('/result');

  // With reduced motion all Framer Motion transitions use duration:0
  // The advice text should appear almost instantly — assert within 2 seconds
  await expect(page.getByRole('article')).toContainText('오늘 상대에게', { timeout: 2_000 });
});
