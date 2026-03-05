/**
 * Test Suite: Checkout
 * Covers the full happy-path checkout flow and data-driven validation failures.
 */
import inventoryPage from '../../pages/InventoryPage';
import cartPage from '../../pages/CartPage';
import checkoutPage from '../../pages/CheckoutPage';

describe('Checkout', () => {
  // Shared setup: restore cached session, reset state, add one item to cart before each test
  beforeEach(() => {
    cy.loginByLocalStorage('standard_user');
    cy.resetAppState();
    inventoryPage.assertPageLoaded();
    inventoryPage.addToCart('sauce-labs-backpack');
    inventoryPage.goToCart();
    cartPage.assertPageLoaded();
    cartPage.assertItemCount(1);
  });

  // ── Happy Path ─────────────────────────────────────────────────────────────

  context('Happy path', () => {
    it('should complete checkout successfully with valid information', () => {
      cy.fixture('checkout').then(({ valid }) => {
        cartPage.proceedToCheckout();
        checkoutPage.assertStepOneLoaded();

        checkoutPage.fillInfo(valid.firstName, valid.lastName, valid.zipCode);
        checkoutPage.assertStepTwoLoaded();

        // Verify order summary shows the item
        checkoutPage.overviewItems.should('have.length', 1);
        checkoutPage.summarySubtotal.should('contain', '$29.99');
        checkoutPage.summaryTax.should('be.visible');
        checkoutPage.summaryTotal.should('be.visible');

        checkoutPage.finishOrder();
        checkoutPage.assertCompleteLoaded();
      });
    });

    it('should return to inventory after completing an order', () => {
      cy.fixture('checkout').then(({ valid }) => {
        cartPage.proceedToCheckout();
        checkoutPage.fillInfo(valid.firstName, valid.lastName, valid.zipCode);
        checkoutPage.finishOrder();
        checkoutPage.assertCompleteLoaded();

        checkoutPage.backToProducts();
        inventoryPage.assertPageLoaded();
        // Cart should be empty after order completion
        inventoryPage.assertCartBadge(0);
      });
    });

    it('should allow cancelling from step one and return to the cart', () => {
      cartPage.proceedToCheckout();
      checkoutPage.assertStepOneLoaded();
      checkoutPage.cancelCheckout();
      cartPage.assertPageLoaded();
      cartPage.assertItemCount(1);
    });

    it('should allow cancelling from step two and return to inventory', () => {
      cy.fixture('checkout').then(({ valid }) => {
        cartPage.proceedToCheckout();
        checkoutPage.fillInfo(valid.firstName, valid.lastName, valid.zipCode);
        checkoutPage.assertStepTwoLoaded();
        checkoutPage.cancelCheckout();
        inventoryPage.assertPageLoaded();
      });
    });
  });

  // ── Multi-item Order ───────────────────────────────────────────────────────

  context('Multi-item checkout', () => {
    it('should checkout with multiple items and show correct subtotal', () => {
      // Add a second item from the cart page → back to inventory
      cartPage.continueShopping();
      inventoryPage.addToCart('sauce-labs-bike-light');
      inventoryPage.goToCart();
      cartPage.assertItemCount(2);

      cy.fixture('checkout').then(({ valid }) => {
        cartPage.proceedToCheckout();
        checkoutPage.fillInfo(valid.firstName, valid.lastName, valid.zipCode);
        checkoutPage.assertStepTwoLoaded();

        checkoutPage.overviewItems.should('have.length', 2);
        // Backpack $29.99 + Bike Light $9.99 = $39.98
        checkoutPage.summarySubtotal.should('contain', '$39.98');

        checkoutPage.finishOrder();
        checkoutPage.assertCompleteLoaded();
      });
    });
  });

  // ── Negative / Validation (data-driven) ───────────────────────────────────

  context('Checkout form validation', () => {
    beforeEach(() => {
      cartPage.proceedToCheckout();
      checkoutPage.assertStepOneLoaded();
    });

    it('data-driven: should show correct error for each invalid form scenario', () => {
      cy.fixture('checkout').then(({ invalidCases }) => {
        invalidCases.forEach(({ description, firstName, lastName, zipCode, expectedError }) => {
          cy.log(`Testing: ${description}`);

          // Clear all fields first
          checkoutPage.firstNameInput.clear();
          checkoutPage.lastNameInput.clear();
          checkoutPage.zipCodeInput.clear();

          if (firstName) checkoutPage.firstNameInput.type(firstName, { delay: 0 });
          if (lastName)  checkoutPage.lastNameInput.type(lastName, { delay: 0 });
          if (zipCode)   checkoutPage.zipCodeInput.type(zipCode, { delay: 0 });

          checkoutPage.continueButton.click();

          checkoutPage.assertErrorMessage(expectedError);

          // Verify we are still on step one
          cy.url().should('include', '/checkout-step-one.html');
        });
      });
    });

    it('should show "First Name is required" when first name is empty', () => {
      checkoutPage.fillInfo('', 'Doe', '10001');
      checkoutPage.assertErrorMessage('Error: First Name is required');
    });

    it('should show "Last Name is required" when last name is empty', () => {
      checkoutPage.firstNameInput.type('John', { delay: 0 });
      checkoutPage.continueButton.click();
      checkoutPage.assertErrorMessage('Error: Last Name is required');
    });

    it('should show "Postal Code is required" when zip is empty', () => {
      checkoutPage.firstNameInput.type('John', { delay: 0 });
      checkoutPage.lastNameInput.type('Doe', { delay: 0 });
      checkoutPage.continueButton.click();
      checkoutPage.assertErrorMessage('Error: Postal Code is required');
    });
  });
});
