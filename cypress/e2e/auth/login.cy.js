/**
 * Test Suite: Login
 * Covers positive login, data-driven negative cases, and post-login state.
 */
import loginPage from '../../pages/LoginPage';
import inventoryPage from '../../pages/InventoryPage';

describe('Login', () => {
  beforeEach(() => {
    loginPage.visit();
    loginPage.assertPageLoaded();
  });

  // ── Positive ──────────────────────────────────────────────────────────────

  it('should log in successfully with valid credentials', () => {
    loginPage.login('standard_user', 'secret_sauce');
    cy.url().should('include', '/inventory.html');
    inventoryPage.assertPageLoaded();
  });

  it('should persist login session on page reload', () => {
    loginPage.login('standard_user', 'secret_sauce');
    cy.reload();
    cy.url().should('include', '/inventory.html');
    inventoryPage.assertPageLoaded();
  });

  it('should prevent back navigation to inventory after logout', () => {
    loginPage.login('standard_user', 'secret_sauce');
    cy.logout();
    cy.go('back');
    loginPage.assertPageLoaded();
  });

  // ── Negative (data-driven) ─────────────────────────────────────────────────

  context('Invalid credentials', () => {
    it('data-driven: should show correct error for each invalid login scenario', () => {
      // Load fixture within the test for proper async handling
      cy.fixture('users').then(({ invalidCases }) => {
        invalidCases.forEach(({ description, username, password, expectedError }) => {
          cy.log(`Testing: ${description}`);
          // Page is already on login (loaded by beforeEach); just clear and refill fields

          // Type username only if non-empty (empty string typed → clears field)
          if (username) {
            loginPage.usernameInput.clear().type(username, { delay: 0 });
          } else {
            loginPage.usernameInput.clear();
          }

          if (password) {
            loginPage.passwordInput.clear().type(password, { delay: 0 });
          } else {
            loginPage.passwordInput.clear();
          }

          loginPage.loginButton.click();
          loginPage.assertErrorMessage(expectedError);

          // Verify we are still on the login page
          cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
        });
      });
    });
  });

  // ── Error UX ──────────────────────────────────────────────────────────────

  it('should dismiss the error banner when clicking the close button', () => {
    loginPage.login('wrong_user', 'wrong_pass');
    loginPage.assertErrorMessage('Epic sadface');
    loginPage.closeError();
  });

  it('should clear error state and allow retry after a failed login', () => {
    loginPage.login('wrong_user', 'wrong_pass');
    loginPage.assertErrorMessage('Epic sadface');

    // Retry with valid credentials
    loginPage.usernameInput.clear().type('standard_user', { delay: 0 });
    loginPage.passwordInput.clear().type('secret_sauce', { delay: 0 });
    loginPage.loginButton.click();

    cy.url().should('include', '/inventory.html');
  });

  // ── Logout ────────────────────────────────────────────────────────────────

  it('should log out and return to the login page', () => {
    loginPage.login('standard_user', 'secret_sauce');
    cy.logout();
    loginPage.assertPageLoaded();
  });
});
