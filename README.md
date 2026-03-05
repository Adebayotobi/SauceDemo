# SauceDemo Cypress Test Suite

End-to-end test automation for [saucedemo.com](https://www.saucedemo.com) built with **Cypress 15**, **Page Object Model (POM)**, **data-driven fixtures**, and **Mochawesome** HTML reporting.

---

## Project Structure

```
demo-assessment/
├── cypress/
│   ├── e2e/
│   │   ├── auth/
│   │   │   └── login.cy.js          # Login positive + data-driven negative tests
│   │   ├── inventory/
│   │   │   └── inventory.cy.js      # Product display, sorting, cart interactions
│   │   └── checkout/
│   │       └── checkout.cy.js       # Full checkout flow + data-driven validation
│   ├── fixtures/
│   │   ├── users.json               # Valid/invalid credential sets
│   │   ├── checkout.json            # Valid/invalid checkout form data
│   │   └── products.json            # Expected product names, sort results
│   ├── pages/                       # Page Object Model classes
│   │   ├── LoginPage.js
│   │   ├── InventoryPage.js
│   │   ├── CartPage.js
│   │   └── CheckoutPage.js
│   ├── support/
│   │   ├── commands.js              # Custom Cypress commands
│   │   └── e2e.js                   # Global hooks & uncaught exception handling
│   ├── screenshots/                 # Auto-captured on failure (git-ignored)
│   ├── videos/                      # Test run recordings (git-ignored)
│   └── reports/                     # Mochawesome JSON + HTML reports (git-ignored)
├── cypress.config.js
├── package.json
├── .gitignore
└── README.md
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 18 |
| npm | >= 9 |

---

## Setup

```bash
# 1. Clone or copy the project
git clone <repo-url>
cd demo-assessment

# 2. Install dependencies
npm install
```

Cypress and all reporter packages are installed as dev dependencies — no global installs needed.

---

## Running Tests

### Interactive mode (headed, watch)
```bash
npm run cy:open
```

### Headless (CI mode) — all specs
```bash
npm run cy:run
```

### Run a single suite
```bash
# Login tests only
npm run cy:run:login

# Inventory tests only
npm run cy:run:inventory

# Checkout tests only
npm run cy:run:checkout
```

### Run with full Mochawesome HTML report
```bash
npm run cy:report
```
The merged report is written to `cypress/reports/html/report.html`.

---

## Reporting

Mochawesome is configured as the reporter in `cypress.config.js`.

| Artefact | Location |
|----------|----------|
| Per-spec JSON reports | `cypress/reports/mocha/` |
| Merged JSON | `cypress/reports/mocha/merged.json` |
| HTML report | `cypress/reports/html/report.html` |
| Screenshots (failures) | `cypress/screenshots/` |
| Videos | disabled (`video: false` in config) |

To manually merge and generate the HTML report after a `cy:run`:

```bash
npm run report:merge    # merges all JSON files → merged.json
npm run report:generate # generates HTML from merged.json
```

---

## Design Decisions & Best Practices

### Page Object Model
Each page has its own class in `cypress/pages/`. Selectors are defined as **getters** so they are always freshly queried (no stale element references). Actions and assertions are co-located with their page.

### Data-driven tests
`cy.fixture()` drives both login and checkout negative scenarios from `cypress/fixtures/`. Adding a new test case is a JSON edit — no code change required.

### Custom commands (`cypress/support/commands.js`)

| Command | Purpose |
|---------|---------|
| `cy.login(user, pass)` | Full UI login flow — used by the login suite |
| `cy.loginByLocalStorage(user)` | Session-cached login via `cy.session()` — used by inventory and checkout suites; runs the full login only once per spec and restores the cached session for every subsequent test |
| `cy.resetAppState()` | Resets cart and sort state via the sidebar without any HTTP requests — safe to call in every `beforeEach` |
| `cy.addToCart(slug)` | Add product by data-test slug |
| `cy.removeFromCart(slug)` | Remove product by data-test slug |
| `cy.assertCartCount(n)` | Assert badge count (or absence for 0) |
| `cy.logout()` | Burger menu logout |

### Stable waits
- No `cy.wait(<number>)` hard waits anywhere.
- All waits use Cypress's built-in retry-ability (DOM assertions, URL checks, element visibility).
- `defaultCommandTimeout` is set to **8 s** in config.

### Test independence
Each spec uses `cy.loginByLocalStorage()` in `beforeEach`, which wraps Cypress's built-in `cy.session()`. Cypress 15 clears browser state between every test automatically (test isolation). `cy.session()` caches the authenticated session after the first login and restores it instantly for every subsequent test — so each test starts from a clean, authenticated state without repeating the full login flow.

### Selectors
All selectors use `data-test` attributes (e.g. `[data-test="login-button"]`) which are stable across style refactors. Only structural selectors (`.inventory_list`, `.cart_item`) are used where `data-test` attributes are absent.

---

## Test Coverage Summary

| Suite | Tests |
|-------|-------|
| Login | Valid login, session persistence, redirect guard, 6× data-driven invalid logins, error dismiss, retry, logout |
| Inventory | Product count, item details, 4× sorting, add/remove to cart (single + multi), badge validation, navigation |
| Checkout | Happy path, multi-item order, cancel at step 1 & 2, 4× data-driven form validation + 3× explicit validation tests |

---

## Environment Variables (optional)

If you want to override credentials without touching fixture files, set:

```bash
CYPRESS_USERNAME=standard_user
CYPRESS_PASSWORD=secret_sauce
```

Then reference them in tests as `Cypress.env('USERNAME')` / `Cypress.env('PASSWORD')`.

---

## CI Integration (GitHub Actions example)

```yaml
name: Cypress Tests
on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run cy:report
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cypress-reports
          path: |
            cypress/reports/
            cypress/screenshots/
```
