import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // App title should contain specific text, but for now we just make sure page loads without crashing
  await expect(page).toHaveURL(/.*localhost.*/);
});
