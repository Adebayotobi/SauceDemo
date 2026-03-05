/**
 * Page Object: Cart Page (/cart.html)
 */
class CartPage {
  // ── Selectors ──────────────────────────────────────────────────────────────
  get pageTitle()          { return cy.get('.title'); }
  get cartItems()          { return cy.get('.cart_item'); }
  get checkoutButton()     { return cy.get('[data-test="checkout"]'); }
  get continueShoppingBtn(){ return cy.get('[data-test="continue-shopping"]'); }

  /** Get the remove button for a specific product. */
  removeBtn(productSlug) {
    return cy.get(`[data-test="remove-${productSlug}"]`);
  }

  /** Get the cart item name elements. */
  get itemNames() {
    return cy.get('.cart_item .inventory_item_name');
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  visit() {
    cy.visit('/cart.html');
  }

  /** Proceed to the checkout information form. */
  proceedToCheckout() {
    this.checkoutButton.click();
  }

  /** Return to the inventory page. */
  continueShopping() {
    this.continueShoppingBtn.click();
  }

  /**
   * Remove an item from the cart by its data-test slug.
   * @param {string} productSlug
   */
  removeItem(productSlug) {
    this.removeBtn(productSlug).click();
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  assertPageLoaded() {
    this.pageTitle.should('have.text', 'Your Cart');
  }

  /** Assert exactly n items are in the cart. */
  assertItemCount(count) {
    if (count === 0) {
      this.cartItems.should('not.exist');
    } else {
      this.cartItems.should('have.length', count);
    }
  }

  /** Assert that a named product appears in the cart. */
  assertContainsItem(name) {
    this.itemNames.should('contain', name);
  }
}

module.exports = new CartPage();
