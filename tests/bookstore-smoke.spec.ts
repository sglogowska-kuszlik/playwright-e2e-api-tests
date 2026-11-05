import { test, expect } from '@playwright/test';

test.describe('Bookstore core pages', { tag: '@smoke' }, () => {
  test('should load bookstore home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*|Bookstore/i);
  });

  test('should show the My Account page for an authenticated user', async ({
    page,
  }) => {
    await page.goto('/my-account/');

    await expect(page.getByLabel('Username or email address')).toBeHidden();
    await expect(page.getByLabel('Password')).toBeHidden();
    await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
  });
});
