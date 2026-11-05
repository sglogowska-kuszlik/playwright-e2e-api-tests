import { type Locator, type Page } from '@playwright/test';

export class MyAccountPage {
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly loginAlert: Locator;
  readonly logoutLink: Locator;
  readonly lostPasswordLink: Locator;
  readonly resetUsernameInput: Locator;
  readonly resetPasswordButton: Locator;

  constructor(private readonly page: Page) {
    this.loginForm = page.locator('form.woocommerce-form-login');
    this.usernameInput = this.loginForm.getByLabel('Username or email address');
    this.passwordInput = this.loginForm.getByLabel('Password');
    this.rememberMeCheckbox = this.loginForm.getByLabel('Remember me');
    this.loginButton = this.loginForm.getByRole('button', { name: 'Log in' });
    this.loginAlert = page.getByRole('alert');
    this.logoutLink = page.getByRole('link', { name: 'Log out' });
    this.lostPasswordLink = this.loginForm.getByRole('link', { name: 'Lost your password?' });
    this.resetUsernameInput = page.getByLabel('Username or email');
    this.resetPasswordButton = page.getByRole('button', { name: 'Reset password' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/my-account/');
  }

  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);

    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }

    await this.loginButton.click();
  }

  async openPasswordReset(): Promise<void> {
    await this.lostPasswordLink.click();
  }

  async getAuthCookie(): Promise<{ expires: number } | undefined> {
    const cookies = await this.page.context().cookies();
    const authCookie = cookies.find((cookie) =>
      cookie.name.startsWith('wordpress_logged_in_')
    );
    return authCookie ? { expires: authCookie.expires } : undefined;
  }
}
