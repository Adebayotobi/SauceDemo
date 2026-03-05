/**
 * Page Object: Login Page (/)
 * Encapsulates all selectors and actions for the SauceDemo login screen.
 */
class LoginPage {
  // ── Selectors ──────────────────────────────────────────────────────────────
  get usernameInput()   { return cy.get('[data-test="username"]'); }
  get passwordInput()   { return cy.get('[data-test="password"]'); }
  get loginButton()     { return cy.get('[data-test="login-button"]'); }
  get errorMessage()    { return cy.get('[data-test="error"]'); }
  get errorCloseBtn()   { return cy.get('[data-test="error"] .error-button'); }

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Navigate to the login page. */
  visit() {
    cy.visit('/');
  }

  /**
   * Fill in credentials and submit.
   * @param {string} username
   * @param {string} password
   */
  login(username, password) {
    this.usernameInput.clear().type(username, { delay: 0 });
    this.passwordInput.clear().type(password, { delay: 0 });
    this.loginButton.click();
  }

  /**
   * Assert that an inline error with the given text is displayed.
   * @param {string} message
   */
  assertErrorMessage(message) {
    this.errorMessage
      .should('be.visible')
      .and('contain.text', message);
  }

  /** Dismiss the displayed error banner. */
  closeError() {
    this.errorCloseBtn.click();
    this.errorMessage.should('not.exist');
  }

  /** Assert the page title / logo is visible (sanity guard). */
  assertPageLoaded() {
    cy.get('.login_logo').should('be.visible');
  }
}

module.exports = new LoginPage();
