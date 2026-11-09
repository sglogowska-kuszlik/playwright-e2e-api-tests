import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { TestUserCredentials } from '../../models/user.types.js';
import { MyAccountPage } from '../../pages/my-account.page.js';

test.describe('My Account login', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let testUser: TestUserCredentials;
  let myAccountPage: MyAccountPage;

  test.beforeAll(async () => {
    testUser = JSON.parse(
      await readFile('.auth/test-user.json', 'utf8')
    ) as TestUserCredentials;
  });

  test.beforeEach(async ({ page }) => {
    myAccountPage = new MyAccountPage(page);
    await myAccountPage.goto();
  });

  test('should log in with valid credentials', async () => {
    await myAccountPage.login(testUser.email, testUser.password);

    await expect(myAccountPage.logoutLink).toBeVisible();
    const authCookie = await myAccountPage.getAuthCookie();
    expect(authCookie?.expires).toBe(-1);
  });

  test('should show an incorrect-password message', async () => {
    await myAccountPage.login(testUser.email, `${testUser.password}-wrong`);

    await expect(myAccountPage.loginAlert).toContainText(
      `The password you entered for the email address ${testUser.email} is incorrect.`
    );
    await expect(myAccountPage.loginForm).toBeVisible();
  });

  test('should require a username or email address', async () => {
    await myAccountPage.loginButton.click();

    await expect(myAccountPage.loginAlert).toContainText('Username is required.');
  });

  test('should require a password', async () => {
    await myAccountPage.usernameInput.fill(testUser.email);
    await myAccountPage.loginButton.click();

    await expect(myAccountPage.loginAlert).toContainText('The password field is empty.');
  });

  test('should persist the login cookie when Remember me is selected', async () => {
    await myAccountPage.login(testUser.email, testUser.password, true);

    await expect(myAccountPage.logoutLink).toBeVisible();
    const authCookie = await myAccountPage.getAuthCookie();
    expect(authCookie?.expires).toBeGreaterThan(Date.now() / 1000);
  });

  test('should open the password reset form', async ({ page }) => {
    await myAccountPage.openPasswordReset();

    await expect(page).toHaveURL(/\/my-account\/lost-password\/?$/);
    await expect(myAccountPage.resetUsernameInput).toBeVisible();
    await expect(myAccountPage.resetPasswordButton).toBeVisible();
  });
});
