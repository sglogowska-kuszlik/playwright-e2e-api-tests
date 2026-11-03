# AI Agent Guidelines & Architecture Standards

This document defines architectural conventions, code quality rules, and best practices for developing test automation suites in this repository. All AI assistants (Antigravity, GitHub Copilot, etc.) and contributors must strictly adhere to these guidelines.

---

## 1. Project Directory Architecture

```text
playwright-e2e-api-tests/
├── pages/                  # Page Object Model (POM) classes representing pages & components
│   ├── base.page.ts        # Shared base page with reusable interactions & common layout locators
│   ├── components/         # Reusable UI fragments (e.g., header, navigation, modals, dialogs)
│   └── *.page.ts           # Domain-specific pages (e.g., home.page.ts, cart.page.ts)
├── api/                    # API clients, service controllers, and HTTP request wrappers
│   ├── api-client.ts       # Shared request context, auth handling (OAuth / Basic / Tokens)
│   └── services/           # Resource-specific controllers (e.g., products.service.ts)
├── fixtures/               # Custom Playwright fixtures extending the base `test` runner
│   └── base-test.ts        # Injects instantiated Page Objects and API clients directly into tests
├── models/                 # TypeScript interfaces, types, and DTOs for UI and API data
│   └── *.types.ts          # E.g., product.types.ts, customer.types.ts
├── data/                   # Static test data, mock payloads, and constants
├── tests/                  # Test suites containing ONLY executable *.spec.ts files
│   ├── e2e/                # End-to-end UI scenarios
│   │   └── *.spec.ts
│   └── api/                # REST API functional and contract tests
│       └── *.spec.ts
├── scripts/                # Utility scripts (e.g., install-browsers.js)
├── AGENTS.md               # Universal guidelines for AI assistants and contributors
├── playwright.config.ts    # Central Playwright runner configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 2. Core Development Principles & Playwright Best Practices

Follow official Playwright recommendations ([playwright.dev/docs/best-practices](https://playwright.dev/docs/best-practices)):

### 2.1 Web-First Assertions & Waiting
- Prioritize asynchronous Web-First assertions: `await expect(locator).toHaveText()`, `await expect(locator).toBeVisible()`, etc.
- Default to letting Playwright handle automatic waiting, retry loops, and actionable state checks.
- When real-life application quirks occur (e.g., elements present in DOM but still rendering, background animation/transition lag, dynamic spinners blocking inputs, dropdown options fetching asynchronously):
  - Prefer targeting the actual state change first (e.g., waiting for spinner detachment `await expect(spinner).toBeHidden()`, input readiness, or waiting for a specific API response via `page.waitForResponse()`).
  - Waiting for network idle (`waitForLoadState('networkidle')`) is a last resort.
  - If a custom wait or explicit pause is genuinely necessary to stabilize flaky UI behavior, document the exact reason with an inline comment.

### 2.2 Locators Strategy & Resilient Selectors
- Prioritize user-facing locators matching user perception and accessibility trees:
  1. `page.getByRole('button', { name: 'Submit' })`
  2. `page.getByLabel('Username')`
  3. `page.getByPlaceholder('Search products...')`
  4. `page.getByText('Welcome back')`
  5. `page.getByTestId('cart-summary')` (use if available in the application under test)
- **Avoid fragile locators**, for example:
  - CSS/XPath selectors coupled to utility/component libraries (e.g., `.btn.btn-primary.mt-2`).
  - CSS/XPath expressions relying on index or brittle structural hierarchy (e.g., `//div[2]/span/a`).

### 2.3 Page Object Model (POM) & Component Design
- Classes in `pages/` represent not only full pages but also reusable UI components, modals, dialogs, headers, and repeatable widgets (`pages/components/`).
- Declare locators as `readonly Locator` initialized inside the constructor:
  ```ts
  export class HomePage extends BasePage {
    readonly searchInput: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
      super(page);
      this.searchInput = page.getByPlaceholder('Search...');
      this.submitButton = page.getByRole('button', { name: 'Search' });
    }

    async search(term: string): Promise<void> {
      await this.searchInput.fill(term);
      await this.submitButton.click();
    }
  }
  ```
- Methods on Page Objects should represent user actions or domain queries, not raw Playwright commands.
- Do not assert deep business expectations inside Page Objects; assertions belong inside the `*.spec.ts` files (except for internal page-state verifications like `waitForLoad()`).

### 2.4 API-First Test Data Setup
- **Do not create prerequisites via UI when an API exists**.
- Set up test state (e.g., creating products, users, orders, cart items) directly via API endpoints before UI steps execute.
- Clean up test artifacts via API in `afterEach` / `afterAll` hooks or fixture teardown.
- Benefit: dramatically reduces test runtime and prevents UI flakiness in precondition steps.

### 2.5 Authentication & Storage State Strategy
- **Shared Session via Setup Project**:
  - Tests are authenticated once before running suites using Playwright's setup project (`tests/auth.setup.ts`), and the persisted session state is saved to `.auth/user.json`.
  - `storageState: '.auth/user.json'` is configured in `playwright.config.ts` so suites default to an authenticated state without repetitive UI logins.
  - The `.auth/` directory is ignored in `.gitignore` to prevent committing session tokens or credentials.
- **Unauthenticated & Login Tests**:
  - Tests that verify authentication flows (login, registration, invalid credentials, guest checkout) must explicitly override the shared session.
  - Reset to an empty guest state at the test file root or within a specific `test.describe` block:
    ```ts
    test.use({ storageState: { cookies: [], origins: [] } });
    ```
    *(can also be applied inside `test.describe` blocks to scope guest mode to specific groups of tests)*.

### 2.6 Custom Fixtures over `beforeEach` Hooks
- Encapsulate page objects and API clients in Playwright fixtures (`fixtures/base-test.ts`).
- Tests should declare dependencies as fixture arguments:
  ```ts
  test('should display created product in catalog', async ({ homePage, createdProduct }) => {
    await homePage.goto();
    await expect(homePage.getProductCard(createdProduct.name)).toBeVisible();
  });
  ```

### 2.7 Strict TypeScript Typing
- Write fully typed TypeScript code. Avoid `any` unless a very specific edge case requires it; if `any` is genuinely necessary, add an inline comment explaining why.
- Define API request and response payloads in `models/*.types.ts`.
- Leverage TypeScript interfaces for test data fixtures.

---

## 3. Naming Conventions

| Item | Convention | Example |
| :--- | :--- | :--- |
| **Test files** | kebab-case ending with `.spec.ts` | `product-search.spec.ts`, `create-order.spec.ts` |
| **Page Objects & Components** | PascalCase class name, kebab-case file ending with `.page.ts` or `.component.ts` | `HomePage` in `home.page.ts`, `HeaderComponent` in `header.component.ts` |
| **API Services** | PascalCase class name, kebab-case file ending with `.service.ts` or `.client.ts` | `ProductsService` in `products.service.ts` |
| **Interfaces** | PascalCase without `I` prefix (e.g., `UserCredentials`, `OrderPayload`) | `OrderPayload` in `order.types.ts` |
| **Types / Type Aliases** | PascalCase (e.g., `OrderStatus`, `PaymentMethod`) | `OrderStatus` in `order.types.ts` |
| **Test Descriptions** | Explicit, user-focused English statements starting with verb ("should ...") | `test('should add product to cart and update badge count')` |
| **Locators** | camelCase descriptive nouns indicating element role | `searchInput`, `checkoutButton`, `productTitle` |

---

## 4. Test Execution & Isolation Guidelines

- **Hermetic & Independent**: Every test must be completely independent and runnable in isolation or in parallel without relying on another test's state.
- **Trace, Screenshots & Video on Failure**: Configure diagnostics to capture artifacts on test failure (`trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`) and generate HTML reports (`reporter: [["line"], ["html", { open: "never" }]]`).

---

## 5. AI Agent Rules & Operational Behavior

All AI assistants operating in this repository must strictly adhere to the following behavioral standards:

1. **Keep It Simple (KISS)**: Do not overcomplicate test code, abstractions, or configurations. Choose the simplest workable design that satisfies the requirement.
2. **Clean Code & SOLID**: Conform to clean code practices. Keep classes and methods focused on a single responsibility.
3. **DRY with Pragmatism**: Apply DRY (Don't Repeat Yourself), but avoid premature abstraction. If an abstraction adds cognitive complexity for only two similar lines, prefer clarity over forced deduplication.
4. **Iteration Limit**: If you are trying to solve or debug an issue and cannot find a clear solution, **stop after the 10th attempt/iteration** and ask the user for guidance or clarification.
5. **Always Ask Before Running Commands**: Always ask the user for permission before executing shell/terminal commands (e.g., running tests, linters, installs, builds, or scripts).
6. **Explicit User Approval for Git Actions**: Never perform Git actions automatically—especially staging, committing (`git commit`), pushing (`git push`), merging, rebasing, or resetting. Always ask for explicit user confirmation before executing any Git mutation.
7. **English Only**: All repository content—including code, comments, test titles, documentation, and commit messages—must be written in English.
8. **No Secrets or Hardcoded Local Paths**: Never commit or hardcode credentials, tokens, passwords, API secrets, or machine-specific local filesystem paths into application or test code. Use environment variables or configuration files.

---

## 6. Commit Message Conventions

Follow the **Conventional Commits** specification:
`<type>(<optional scope>): <description>`

Common types:
- `feat`: A new test suite, page object, API client, or framework capability
- `fix`: Fixing a broken test, selector, pipeline bug, or configuration issue
- `chore`: Maintenance tasks, dependency updates, tooling adjustments
- `refactor`: Code restructuring without changing test behavior
- `test`: Adding missing tests or correcting existing test logic

Rules:
- Use imperative, present tense ("add", "fix", "update", not "added", "fixes", "updated").
- Keep descriptions concise, lowercase after colon.
- Example: `feat(api): add products service controller and tests`
