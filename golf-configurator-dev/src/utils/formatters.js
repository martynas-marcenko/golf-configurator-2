/**
 * Price formatting utilities - Exact recreation from golf-configurator-simple.js
 */
export class PriceFormatter {
  constructor() {
    // Load Shopify's price formatter if available
    this.shopifyFormatter = window.Shopify?.formatMoney;
  }

  formatCurrency(price) {
    // Convert from cents to pounds and format
    if (typeof price === 'number') {
      const pounds = price / 100;
      if (this.shopifyFormatter) {
        // Use Shopify's formatter if available
        return this.shopifyFormatter(price);
      }
      // Fallback formatting
      return `£${pounds.toFixed(2)}`;
    }
    return '£0.00';
  }

  formatPrice(price, quantity = 1) {
    const totalPrice = price * quantity;
    return this.formatCurrency(totalPrice);
  }
}

