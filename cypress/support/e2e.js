// ***********************************************************
// cypress/support/e2e.js
// Global support file — runs before every spec file.
// ***********************************************************

import './commands';

// ── Global Hooks ─────────────────────────────────────────────────────────────

/**
 * cy.session() handles its own cleanup before restoring cached sessions.
 * Manual clearing here would wipe the session before it can be used.
 * Login tests that need a clean state call loginPage.visit() directly.
 */

// ── Uncaught Exception Handling ───────────────────────────────────────────────
// Prevent third-party script errors from failing tests.
Cypress.on('uncaught:exception', (err) => {
  // Ignore ResizeObserver loop errors (common in SPAs, harmless)
  if (err.message.includes('ResizeObserver loop')) {
    return false;
  }
  // Let all other exceptions propagate (they're real failures)
  return true;
});
