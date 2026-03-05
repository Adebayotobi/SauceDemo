// ***********************************************
// Custom Cypress commands
// ***********************************************

/**
 * cy.login(username, password)
 * Logs in via the UI and waits for the inventory page to be ready.
 * Use for tests that need a full login flow.
 */
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/');
  cy.get('[data-test="username"]').clear().type(username, { delay: 0 });
  cy.get('[data-test="password"]').clear().type(password, { delay: 0 });
  cy.get('[data-test="login-button"]').click();
  cy.url().should('include', '/inventory.html');
});

/**
 * cy.loginByLocalStorage(username)
 * Uses cy.session() to log in once and cache the browser state.
 * Subsequent calls restore the session instantly without hitting the network,
 * preventing rate-limiting from saucedemo.com across 29 tests.
 *
 * After restoration the page is about:blank, so we visit '/' and use the
 * History API to navigate client-side to /inventory.html (avoids the 404
 * that a direct cy.visit('/inventory.html') would return from the SPA server).
 */
Cypress.Commands.add('loginByLocalStorage', (username = 'standard_user') => {
  cy.session(username, () => {
    cy.visit('/');
    cy.get('[data-test="username"]').type(username, { delay: 0 });
    cy.get('[data-test="password"]').type('secret_sauce', { delay: 0 });
    cy.get('[data-test="login-button"]').click();
    cy.url().should('include', '/inventory.html');
  });

  cy.visit('/');
  cy.window().then((win) => {
    win.history.pushState({}, '', '/inventory.html');
    win.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  });
  cy.get('.inventory_list').should('be.visible');
});

/**
 * cy.addToCart(productSlug)
 * Clicks the "Add to cart" button for a product identified by its data-test slug.
 * e.g. cy.addToCart('sauce-labs-backpack')
 */
Cypress.Commands.add('addToCart', (productSlug) => {
  cy.get(`[data-test="add-to-cart-${productSlug}"]`).click();
});

/**
 * cy.removeFromCart(productSlug)
 * Clicks the "Remove" button for a product identified by its data-test slug.
 */
Cypress.Commands.add('removeFromCart', (productSlug) => {
  cy.get(`[data-test="remove-${productSlug}"]`).click();
});

/**
 * cy.assertCartCount(count)
 * Asserts the cart badge shows the expected number, or is absent for 0.
 */
Cypress.Commands.add('assertCartCount', (count) => {
  if (count === 0) {
    cy.get('.shopping_cart_badge').should('not.exist');
  } else {
    cy.get('.shopping_cart_badge')
      .should('be.visible')
      .and('have.text', String(count));
  }
});

/**
 * cy.logout()
 * Logs out via the burger menu.
 */
Cypress.Commands.add('logout', () => {
  cy.get('#react-burger-menu-btn').click();
  cy.get('#logout_sidebar_link').should('be.visible').click();
  cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
});

/**
 * cy.resetAppState()
 * Resets cart and sort state via the sidebar Reset App State button,
 * then navigates client-side to /inventory.html via pushState.
 * Makes zero HTTP requests — safe to call in every beforeEach.
 */
Cypress.Commands.add('resetAppState', () => {
  cy.get('#react-burger-menu-btn').click();
  cy.get('#reset_sidebar_link').should('be.visible').click();
  cy.get('#react-burger-cross-btn').click();
  cy.window().then((win) => {
    win.history.pushState({}, '', '/inventory.html');
    win.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  });
});
