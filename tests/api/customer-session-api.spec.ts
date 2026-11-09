import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { TestUserCredentials } from '../../models/user.types.js';

test.use({ storageState: '.auth/user.json' });

test('should return the logged-in customer email in the Store API cart', async ({
  request,
}) => {
  const { email } = JSON.parse(
    await readFile('.auth/test-user.json', 'utf8')
  ) as TestUserCredentials;

  const response = await request.get('/wp-json/wc/store/v1/cart');

  expect(response.status()).toBe(200);
  const responseBody: unknown = await response.json();
  expect(responseBody).toMatchObject({
    billing_address: { email },
  });
});
