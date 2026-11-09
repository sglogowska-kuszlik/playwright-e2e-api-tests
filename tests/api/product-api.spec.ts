import { expect, test } from '@playwright/test';

test('should search for bookstore product from the catalog', async ({
  request,
}) => {
  const response = await request.get('/wp-json/wc/store/v1/products', {
    params: { search: 'Makers of Electricity' },
  });

  expect(response.status()).toBe(200);
  const responseBody: unknown = await response.json();
  expect(responseBody).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'Makers of Electricity by Brother Potamian and James J. Walsh',
      }),
    ])
  );
});
