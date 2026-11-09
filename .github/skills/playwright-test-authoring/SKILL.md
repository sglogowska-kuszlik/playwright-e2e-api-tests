---
name: playwright-test-authoring
description: 'Use when adding, refactoring, or reviewing Playwright tests in this repository. Covers describe grouping, Page Objects, fixtures and hooks, meaningful assertions, and authenticated versus guest storage state.'
argument-hint: 'Describe the test flow or test file to add or refactor'
---

# Playwright Test Authoring

Use this workflow when creating or changing tests in this repository. Follow the repository-wide standards in `AGENTS.md`; this skill adds UI-test-specific guidance.

## Before editing

1. Read `AGENTS.md` and only the tests, Page Objects, fixtures, and configuration directly related to the task. Expand the scope only when those files reveal a specific dependency; do not review the whole repository by default.
2. Inspect the application UI or existing test results when selectors or expected behavior are uncertain. Prefer available browser/MCP tools over guessing.
3. Identify the intended user state (authenticated customer, administrator, or guest) and the exact behavior the test should prove.

## Structure related tests

1. Put executable browser end-to-end specs under `tests/e2e/` and use kebab-case filenames ending in `.spec.ts`.
2. Group tests that cover the same page or user flow in one descriptive `test.describe` block.
3. Keep the suite title focused on the shared feature or page; keep each test title focused on its distinct expected behavior.
4. Move genuinely repeated setup into the narrowest suitable Playwright hook:
   - `beforeEach` for per-test page-object construction and navigation.
   - `beforeAll` only for immutable suite data that is safe to share. Do not share a `Page`, browser context, or mutable test state across tests.
5. Prefer existing custom fixtures for shared dependencies. Avoid adding hooks or abstractions that obscure a simple test.

## Page Objects and locators

1. Reuse an existing Page Object when it represents the page under test. Add or update a focused Page Object in `pages/` when tests repeatedly use the same page locators or user actions.
2. Declare locators as `readonly Locator` properties initialized in the constructor.
3. Page Object methods should model user actions or domain queries. Keep business assertions in the spec.
4. Prefer accessible locators (`getByRole`, `getByLabel`, `getByText`). Scope duplicate controls to their form or component. Use CSS selectors only when the UI exposes no suitable user-facing locator.
5. Avoid duplicating selectors and action sequences across tests when a small Page Object method makes the intent clearer.

## State and isolation

1. Tests must be independent and safe to run in parallel.
2. Authentication, registration, invalid-login, and guest flows must not inherit the shared authenticated session. Set guest state at the relevant describe or file scope:

   ```ts
   test.use({ storageState: { cookies: [], origins: [] } });
   ```

3. For administrator tests, use a dedicated admin storage state or log in through the admin flow. Do not assume the shared customer session has administrator permissions.
4. Use API or fixtures for prerequisites when available. Create unique test data and clean it up using the repository's supported cleanup mechanism.

## Assertions

1. Assert observable user-facing outcomes with Playwright's retrying `expect` assertions.
2. When testing an error or validation, assert the specific expected message, not merely that an alert exists.
3. Prefer business outcomes over implementation details such as focus state, arbitrary delays, or locator counts.
4. Verify that assertions distinguish the behavior being tested. For example, a reload alone proves a login session survived a reload; it does not prove that “Remember me” caused persistent authentication. For that behavior, assert the documented difference, such as session-cookie versus persistent-cookie expiry, when that is the supported application behavior.
5. Avoid broad regular expressions when the expected message is known; assert the exact text. If wording is dynamic, assert a stable, meaningful message or use a narrowly scoped pattern.
6. Avoid reading or asserting session, cookie, or storage implementation details unless they directly prove the behavior under test.

## Validation

1. Run the smallest relevant test selection after changes, following the repository rule to ask permission before running shell commands.
2. If a test fails, inspect its error context, trace, or browser state before changing selectors or adding waits.
3. Do not add force clicks, arbitrary timeouts, or fallback branches to hide a failure. Fix the observed cause and keep the test focused.
4. If five distinct, evidence-based attempts have not identified the root cause or a reliable fix, stop. Ask the user for guidance and summarize what you inspected, the approaches you tried, and their outcomes; do not continue cycling through speculative changes.
