import { test, expect } from '@playwright/test';

test.describe('route guard: unauthenticated access redirects to /profile', () => {
  test('direct /result entry redirects', async ({ page }) => {
    await page.goto('/result');
    // Route guard fires in useEffect after hydration — wait for URL change
    await page.waitForURL('**/profile', { timeout: 15_000 });
    await expect(page).toHaveURL('/profile');
  });

  test('direct /category entry redirects', async ({ page }) => {
    await page.goto('/category');
    await page.waitForURL('**/profile', { timeout: 15_000 });
    await expect(page).toHaveURL('/profile');
  });

  test('direct /draw entry redirects', async ({ page }) => {
    await page.goto('/draw');
    await page.waitForURL('**/profile', { timeout: 15_000 });
    await expect(page).toHaveURL('/profile');
  });
});
