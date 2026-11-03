# Playwright E2E & API Test Automation Framework

Automated End-to-End (E2E) and REST API test suite built with **[Playwright](https://playwright.dev/)** and **TypeScript** for the **[Test Bookstore](https://github.com/Testelka/test-bookstore)** application (WordPress & WooCommerce).

---

## 🚀 Features & Architecture

- **Unified E2E & API Testing**: Tests both UI customer journeys and REST API endpoints under a single framework.
- **Page Object Model (POM)**: Modular, clean component and page abstractions with accessibility-first locators (`getByRole`, `getByLabel`).
- **API-First Data Setup**: Preconditions and test data generation are handled directly via API calls for maximum speed and zero UI flakiness.
- **Automated App Lifecycle (`webServer`)**: Playwright automatically manages Docker containers for the application under test (`localhost:8080`), waiting for readiness before suites run.
- **Diagnostic Artifacts**: Traces, screenshots, and videos are automatically retained on test failures for fast debugging.
- **Continuous Integration**: GitHub Actions workflow optimized for pull requests (smoke) and scheduled/manual runs (full regression).

---

## 🛠️ Tech Stack

- **Test Runner**: Playwright (`@playwright/test`)
- **Language**: TypeScript
- **Application Under Test**: WordPress + WooCommerce + MySQL (via Docker Compose)
- **CI/CD**: GitHub Actions

---

## 📋 Prerequisites

Before running the tests locally, ensure you have the following installed:

1. **Node.js** (LTS version)
2. **Docker Desktop** (must be running to start the local application under test)
3. **Git** (to clone repositories)

---

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/sglogowska-kuszlik/playwright-e2e-api-tests.git
cd playwright-e2e-api-tests
```

### 2. Install dependencies
```bash
npm install
```

### 3. Install Playwright browsers
Standard installation (Chromium and Firefox):
```bash
npx playwright install chromium firefox
```

> [!TIP]
> **Troubleshooting Browser Installation**:
> In certain combinations of Node.js and Playwright versions, standard `npx playwright install` may hang at 100% while unpacking zip archives due to a known `extract-zip` stream bug ([microsoft/playwright#40724](https://github.com/microsoft/playwright/issues/40724)).
>
> - **Known working configuration**: Node.js `v26.13.0` (or `v22.x`) with `@playwright/test` `>= 1.64.1`.
> - If you ever encounter archive unpacking issues locally, an alternative fallback installer is included that uses native extraction tools:
>   ```bash
>   npm run install:browsers
>   ```

---

## 🧪 Running Tests

> [!NOTE]
> Make sure **Docker Desktop is running**. Playwright's `webServer` will automatically spin up the app containers if they are not already running.

### Run all tests
```bash
npx playwright test
```

### Run tests in headed browser mode
```bash
npx playwright test --headed
```

### Run tests in interactive UI mode
```bash
npx playwright test --ui
```

### Run tests on a specific browser
```bash
npx playwright test --project=chromium
```

### View HTML Test Report
Reports are generated after each run in `playwright-report/`:
```bash
npx playwright show-report
```

---

## 📂 Project Structure

```text
playwright-e2e-api-tests/
├── pages/                  # Page Objects and reusable UI components
│   ├── base.page.ts        # Shared base page
│   └── components/         # Repeatable widgets (header, modals, dialogs)
├── api/                    # API clients and service controllers (WooCommerce)
│   ├── api-client.ts       # Shared request context & auth handler
│   └── services/           # Endpoint controllers (products, orders)
├── fixtures/               # Custom Playwright fixtures (injects POM & API clients)
│   └── base-test.ts
├── models/                 # TypeScript interfaces, types, and DTOs
├── data/                   # Static test data, payloads, and constants
├── tests/                  # Executable test files ONLY
│   ├── e2e/                # UI scenarios (*.spec.ts)
│   └── api/                # API tests (*.spec.ts)
├── scripts/                # Helper scripts (install-browsers.js)
├── AGENTS.md               # Guidelines for AI assistants and contributors
├── playwright.config.ts    # Central runner configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 📖 Guidelines & Best Practices

All contributors and AI assistants must follow the coding and architectural standards defined in **[AGENTS.md](AGENTS.md)**:
- **Web-First Assertions**: Rely on auto-retrying assertions (`await expect(locator).toBeVisible()`).
- **Resilient Locators**: Use accessible user-facing locators. Avoid brittle XPath or CSS utility classes.
- **Clean Code**: Follow KISS, DRY with pragmatism, and SOLID principles.
- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.).
