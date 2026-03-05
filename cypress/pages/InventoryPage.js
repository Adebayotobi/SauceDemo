/**
 * Page Object: Inventory / Products Page (/inventory.html)
 */
class InventoryPage {
  // ── Selectors ──────────────────────────────────────────────────────────────
  get pageTitle()         { return cy.get('.title'); }
  get inventoryList()     { return cy.get('.inventory_list'); }
  get inventoryItems()    { return cy.get('.inventory_item'); }
  get sortDropdown()      { return cy.get('[data-test="product-sort-container"]'); }
  get cartIcon()          { return cy.get('.shopping_cart_link'); }
  get cartBadge()         { return cy.get('.shopping_cart_badge'); }
  get burgerMenu()        { return cy.get('#react-burger-menu-btn'); }
  get logoutLink()        { return cy.get('#logout_sidebar_link'); }

  /** Get the "Add to cart" button for a specific product by its data-test attribute slug. */
  addToCartBtn(productSlug) {
    return cy.get(`[data-test="add-to-cart-${productSlug}"]`);
  }

  /** Get the "Remove" button for a specific product by its data-test attribute slug. */
  removeBtn(productSlug) {
    return cy.get(`[data-test="remove-${productSlug}"]`);
  }

  /** Locate a product card by its visible name. */
  productCardByName(name) {
    return cy.contains('.inventory_item', name);
  }

  /** Read the displayed price of a named product. */
  productPriceByName(name) {
    return this.productCardByName(name).find('.inventory_item_price');
  }

  /** First item name shown in the sorted list. */
  get firstItemName() {
    return cy.get('.inventory_item_name').first();
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  visit() {
    cy.visit('/inventory.html');
  }

  /**
   * Select a sort option by its <option> value.
   * @param {'az'|'za'|'lohi'|'hilo'} value
   */
  sortBy(value) {
    this.sortDropdown.select(value);
  }

  /**
   * Add a product to the cart using its data-test slug.
   * @param {string} productSlug  e.g. 'sauce-labs-backpack'
   */
  addToCart(productSlug) {
    this.addToCartBtn(productSlug).click();
  }

  /**
   * Remove a product from the cart using its data-test slug.
   * @param {string} productSlug
   */
  removeFromCart(productSlug) {
    this.removeBtn(productSlug).click();
  }

  /** Open the shopping cart page. */
  goToCart() {
    this.cartIcon.click();
  }

  /** Log out via the burger menu. */
  logout() {
    this.burgerMenu.click();
    this.logoutLink.should('be.visible').click();
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  assertPageLoaded() {
    this.pageTitle.should('have.text', 'Products');
    this.inventoryList.should('be.visible');
  }

  /**
   * Assert the number of products displayed on the page.
   * @param {number} count
   */
  assertProductCount(count) {
    this.inventoryItems.should('have.length', count);
  }

  /**
   * Assert the cart badge shows the expected number.
   * @param {number} count
   */
  assertCartBadge(count) {
    if (count === 0) {
      this.cartBadge.should('not.exist');
    } else {
      this.cartBadge.should('be.visible').and('have.text', String(count));
    }
  }
}

module.exports = new InventoryPage();
