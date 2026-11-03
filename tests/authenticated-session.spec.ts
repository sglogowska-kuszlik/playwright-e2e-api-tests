import { expect, test } from '@playwright/test';

test('should stay authenticated on the My Account page using the saved session', async ({ page }) => {
  await page.goto('/my-account/');

  await expect(page.getByLabel('Username or email address')).toBeHidden();
  await expect(page.getByLabel('Password')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
});
