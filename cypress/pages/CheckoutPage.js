/**
 * Page Object: Checkout Pages
 *   Step One  – /checkout-step-one.html   (customer information)
 *   Step Two  – /checkout-step-two.html   (order overview)
 *   Complete  – /checkout-complete.html   (confirmation)
 */
class CheckoutPage {
  // ── Step One Selectors ─────────────────────────────────────────────────────
  get firstNameInput()  { return cy.get('[data-test="firstName"]'); }
  get lastNameInput()   { return cy.get('[data-test="lastName"]'); }
  get zipCodeInput()    { return cy.get('[data-test="postalCode"]'); }
  get continueButton()  { return cy.get('[data-test="continue"]'); }
  get cancelButton()    { return cy.get('[data-test="cancel"]'); }
  get errorMessage()    { return cy.get('[data-test="error"]'); }

  // ── Step Two Selectors ─────────────────────────────────────────────────────
  get finishButton()        { return cy.get('[data-test="finish"]'); }
  get overviewItems()       { return cy.get('.cart_item'); }
  get summarySubtotal()     { return cy.get('.summary_subtotal_label'); }
  get summaryTax()          { return cy.get('.summary_tax_label'); }
  get summaryTotal()        { return cy.get('.summary_total_label'); }

  // ── Complete Selectors ─────────────────────────────────────────────────────
  get completeHeader()      { return cy.get('.complete-header'); }
  get completeText()        { return cy.get('.complete-text'); }
  get backHomeButton()      { return cy.get('[data-test="back-to-products"]'); }

  // ── Step One Actions ───────────────────────────────────────────────────────

  visitStepOne() {
    cy.visit('/checkout-step-one.html');
  }

  /**
   * Fill the customer information form and click Continue.
   * Pass empty string for a field to leave it blank (triggers validation).
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} zipCode
   */
  fillInfo(firstName, lastName, zipCode) {
    if (firstName) this.firstNameInput.clear().type(firstName, { delay: 0 });
    if (lastName)  this.lastNameInput.clear().type(lastName, { delay: 0 });
    if (zipCode)   this.zipCodeInput.clear().type(zipCode, { delay: 0 });
    this.continueButton.click();
  }

  cancelCheckout() {
    this.cancelButton.click();
  }

  // ── Step Two Actions ───────────────────────────────────────────────────────

  finishOrder() {
    this.finishButton.click();
  }

  // ── Complete Actions ───────────────────────────────────────────────────────

  backToProducts() {
    this.backHomeButton.click();
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  assertStepOneLoaded() {
    cy.url().should('include', '/checkout-step-one.html');
  }

  assertStepTwoLoaded() {
    cy.url().should('include', '/checkout-step-two.html');
    cy.get('.title').should('have.text', 'Checkout: Overview');
  }

  assertCompleteLoaded() {
    cy.url().should('include', '/checkout-complete.html');
    this.completeHeader.should('have.text', 'Thank you for your order!');
  }

  /**
   * Assert a validation error is shown with the expected text.
   * @param {string} message
   */
  assertErrorMessage(message) {
    this.errorMessage
      .should('be.visible')
      .and('contain.text', message);
  }
}

module.exports = new CheckoutPage();
