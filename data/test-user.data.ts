import { randomBytes } from 'node:crypto';

const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const userPrefix = process.env.TEST_USER_PREFIX ?? 'test_customer';

export const TEST_USER = {
  password: randomBytes(24).toString('base64url'),
  email: `${userPrefix}_${uniqueSuffix}@example.com`,
  firstName: process.env.TEST_USER_FIRST_NAME ?? 'Test',
  lastName: process.env.TEST_USER_LAST_NAME ?? 'Customer',
};

export const WOOCOMMERCE_API = {
  // These keys are public in the test app repository, so we are not hiding them here as well for now.
  consumerKey: 'ck_a13ac568ad5104c9c8906e20447f3f0672656d60',
  consumerSecret: 'cs_d2e37250406cf283259737c247095bdd867549bc',
};
