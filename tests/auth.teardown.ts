import { test as teardown } from '@playwright/test';
import { readFile, rm } from 'node:fs/promises';
import { WOOCOMMERCE_API } from '../data/test-user.data.js';

const customerFile = '.auth/test-user.json';

teardown('delete test customer', async ({ request }) => {
  let customer: { email: string };
  try {
    customer = JSON.parse(await readFile(customerFile, 'utf8')) as { email: string };
  } catch {
    return;
  }

  const credentials = new URLSearchParams({
    consumer_key: WOOCOMMERCE_API.consumerKey,
    consumer_secret: WOOCOMMERCE_API.consumerSecret,
  }).toString();

  const lookupResponse = await request.get(
    `/wp-json/wc/v3/customers?email=${encodeURIComponent(customer.email)}&${credentials}`
  );
  if (!lookupResponse.ok()) {
    console.warn(`Customer cleanup lookup failed with status ${lookupResponse.status()}.`);
    return;
  }

  const responseBody: unknown = await lookupResponse.json();
  if (!Array.isArray(responseBody) || typeof responseBody[0]?.id !== 'number') {
    console.warn(`Could not find test customer ${customer.email} for cleanup.`);
    return;
  }

  const deleteResponse = await request.delete(
    `/wp-json/wc/v3/customers/${responseBody[0].id}?force=true&${credentials}`
  );
  if (!deleteResponse.ok()) {
    console.warn(`Customer cleanup failed with status ${deleteResponse.status()}.`);
    return;
  }

  await rm(customerFile, { force: true });
});
