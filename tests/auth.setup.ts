import { test as setup, expect } from '@playwright/test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { TEST_USER } from '../data/test-user.data.js';

const authFile = '.auth/user.json';
const customerFile = '.auth/test-user.json';

setup('authenticate user and store session state', async ({ page }) => {
  await mkdir('.auth', { recursive: true });
  await rm(customerFile, { force: true });

  await writeFile(customerFile, JSON.stringify({ email: TEST_USER.email }));
  await page.goto('/my-account');

  const registrationEmail = page.locator('#reg_email');
  await expect(registrationEmail).toBeVisible();
  await registrationEmail.fill(TEST_USER.email);

  const registrationPassword = page.locator('#reg_password');
  await registrationPassword.fill(TEST_USER.password);
  // Blur the password field before clicking Register; clicking while it had focus did not reliably submit the form.
  await registrationPassword.blur();
  await page.locator('button[value="Register"]').click();
  await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible({ timeout: 5_000 });

  await page.context().storageState({ path: authFile });
});
