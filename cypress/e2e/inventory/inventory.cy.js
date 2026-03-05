/**
 * Test Suite: Inventory / Product Listing
 * Covers product display, sorting, cart interactions, and navigation.
 */
import inventoryPage from '../../pages/InventoryPage';
import cartPage from '../../pages/CartPage';

describe('Inventory', () => {
  beforeEach(() => {
    // Restore cached session (cy.session) then reset state client-side
    cy.loginByLocalStorage('standard_user');
    cy.resetAppState();
    inventoryPage.assertPageLoaded();
  });

  // ── Product Display ───────────────────────────────────────────────────────

  context('Product listing', () => {
    it('should display the correct number of products', () => {
      cy.fixture('products').then(({ totalProductCount }) => {
        inventoryPage.assertProductCount(totalProductCount);
      });
    });

    it('should display product names, descriptions, and prices', () => {
      inventoryPage.inventoryItems.each(($item) => {
        cy.wrap($item).find('.inventory_item_name').should('not.be.empty');
        cy.wrap($item).find('.inventory_item_desc').should('not.be.empty');
        cy.wrap($item).find('.inventory_item_price').should('contain', '$');
      });
    });

    it('should navigate to the product detail page on name click', () => {
      inventoryPage.inventoryItems.first().find('.inventory_item_name').click();
      cy.url().should('include', '/inventory-item.html');
      cy.get('.inventory_details_name').should('be.visible');
    });
  });

  // ── Sorting ───────────────────────────────────────────────────────────────

  context('Product sorting', () => {
    it('should sort A-Z by default', () => {
      inventoryPage.firstItemName.should('have.text', 'Sauce Labs Backpack');
    });

    it('should sort Z-A correctly', () => {
      inventoryPage.sortBy('za');
      inventoryPage.firstItemName.should('have.text', 'Test.allTheThings() T-Shirt (Red)');
    });

    it('should sort by price low to high correctly', () => {
      inventoryPage.sortBy('lohi');
      inventoryPage.firstItemName.should('have.text', 'Sauce Labs Onesie');
    });

    it('should sort by price high to low correctly', () => {
      inventoryPage.sortBy('hilo');
      inventoryPage.firstItemName.should('have.text', 'Sauce Labs Fleece Jacket');
    });
  });

  // ── Cart Interactions ─────────────────────────────────────────────────────

  context('Add to cart', () => {
    it('should add a single item to the cart and update the badge', () => {
      inventoryPage.addToCart('sauce-labs-backpack');
      inventoryPage.assertCartBadge(1);
      // Button label flips to "Remove"
      cy.get('[data-test="remove-sauce-labs-backpack"]').should('be.visible');
    });

    it('should add multiple items and reflect the correct badge count', () => {
      inventoryPage.addToCart('sauce-labs-backpack');
      inventoryPage.addToCart('sauce-labs-bike-light');
      inventoryPage.addToCart('sauce-labs-bolt-t-shirt');
      inventoryPage.assertCartBadge(3);
    });

    it('should remove an item and update the badge', () => {
      inventoryPage.addToCart('sauce-labs-backpack');
      inventoryPage.assertCartBadge(1);
      inventoryPage.removeFromCart('sauce-labs-backpack');
      inventoryPage.assertCartBadge(0);
      cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').should('be.visible');
    });

    it('should show zero badge after removing all added items', () => {
      inventoryPage.addToCart('sauce-labs-backpack');
      inventoryPage.addToCart('sauce-labs-bike-light');
      inventoryPage.removeFromCart('sauce-labs-backpack');
      inventoryPage.removeFromCart('sauce-labs-bike-light');
      inventoryPage.assertCartBadge(0);
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  context('Navigation', () => {
    it('should navigate to the cart page from the cart icon', () => {
      inventoryPage.goToCart();
      cartPage.assertPageLoaded();
    });

    it('should navigate to the cart with correct items', () => {
      inventoryPage.addToCart('sauce-labs-backpack');
      inventoryPage.addToCart('sauce-labs-bike-light');
      inventoryPage.goToCart();
      cartPage.assertItemCount(2);
      cartPage.assertContainsItem('Sauce Labs Backpack');
      cartPage.assertContainsItem('Sauce Labs Bike Light');
    });
  });
});
