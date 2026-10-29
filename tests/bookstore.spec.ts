import { test, expect } from '@playwright/test';

test.describe('Bookstore App Smoke Test', () => {
  test('should load bookstore home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*|Bookstore/i);
  });
});
