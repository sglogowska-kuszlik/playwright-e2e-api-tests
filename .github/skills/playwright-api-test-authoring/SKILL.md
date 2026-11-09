---
name: playwright-api-test-authoring
description: 'Use when creating, refactoring, or reviewing Playwright API tests, REST endpoint tests, API clients, or service tests in this repository. Covers APIRequestContext, typed payloads, response contracts, authentication, and isolated test data.'
argument-hint: 'Describe the API behavior or endpoint to test'
---

# Playwright API Test Authoring

Use this workflow for tests that exercise an HTTP API directly. Follow the repository-wide standards in `AGENTS.md`; this skill adds API-test-specific guidance.

## Before editing

1. Read `AGENTS.md` and only the API specs, client or service, fixtures, and models directly related to the task, plus relevant configuration such as `playwright.config.ts`. Expand the scope only when these files reveal a specific dependency; do not review the whole repository by default.
2. Confirm the endpoint, supported methods, authentication requirements, expected status codes, and response contract from existing code or reliable project documentation. Do not invent API behavior.
3. Check for an existing API client, service, fixture, or payload type before adding another abstraction.

## Organize API tests

1. Put API specs under `tests/api/` and use kebab-case filenames ending in `.spec.ts`.
2. Group related endpoint behavior in a focused `test.describe` block. Use explicit test titles describing the observable contract, such as `should return the created product`.
3. Keep HTTP calls and business-contract assertions in the spec. Put shared transport and authentication handling in the existing API client, and resource-specific operations in a service under `api/services/`.
4. Define reusable request and response types in `models/`; these provide compile-time checks only. Treat `response.json()` as untrusted: verify expected fields with Playwright `expect` assertions, or use a runtime schema validator when the full response shape must be checked. Do not use a TypeScript cast such as `as ProductResponse` as runtime validation.
5. Keep helpers small and focused. Do not add a generic client or duplicate an existing wrapper for a single endpoint.

## Make requests and verify contracts

1. Prefer Playwright's `request` fixture (`APIRequestContext`) and the configured `baseURL` for direct API tests. Create a separate request context only when a test needs isolated authentication or configuration, and dispose of that context when finished.
2. Send request data with Playwright's `data` option. For WooCommerce REST API authentication, use `WOOCOMMERCE_API` from `data/test-user.data.ts` and pass its `consumerKey` and `consumerSecret` as `consumer_key` and `consumer_secret` query parameters. This guidance is only about request authentication; do not copy the customer lookup or deletion behavior from `tests/auth.teardown.ts` for `WOOCOMMERCE_API` consumer. Use `TEST_USER` from the same data module when a test needs the customer created by the setup project. Do not assume other test users or roles are provisioned or invent a new authentication flow; ask before adding one.
3. Assert the exact expected HTTP status. For failures, assert the expected error message when the API provides one; otherwise, assert its documented error code or response shape. Do not assume a particular error format before establishing the endpoint contract.
4. Choose response assertions that prove the behavior or business rule named by the test. Check only the response fields or headers needed to establish that outcome; avoid incidental checks or assertions that would also pass for unrelated behavior.
5. Await the API response that represents the operation under test. Do not use arbitrary sleeps.

Example:
```ts
import { expect, test } from '@playwright/test';

test('should return the requested product', async ({ request }) => {
  const response = await request.get('/api/products/123');

  expect(response.status()).toBe(200);
  const body: unknown = await response.json();
  expect(body).toMatchObject({
    id: 123,
    name: 'Example product',
  });
});
```

Replace the example route and expected values with the repository's actual API contract. For endpoints whose response shape is important, use the repository's schema or validation approach where available.

## Authentication and data isolation

1. Make each test independent and safe to run in parallel. Do not depend on execution order or fixed shared records.
2. Create unique data per test when possible. Clean up created resources through the API using the established fixture teardown or a `try`/`finally` pattern, and preserve the original failure if cleanup also fails.
3. Use a dedicated API authentication mechanism and least-privilege test credentials. Do not reuse browser storage state as an API authentication shortcut unless the application explicitly requires it and the existing framework supports it.
4. Cover unauthenticated, unauthorized, and invalid-input behavior with isolated inputs and assert the documented response. Do not hide unexpected server failures with broad catches, retries, or success-shaped fallback values.

## Validation

1. Run the smallest relevant API test selection after changes, following the repository rule to ask permission before running shell commands.
2. If a test fails, inspect the response status, headers, body, and request configuration before changing expectations or adding waits.
3. Do not weaken contract assertions to make a failing test pass. Resolve the root cause or report the API behavior that remains uncertain.
