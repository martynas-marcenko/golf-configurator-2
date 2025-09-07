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

/**
 * Toast notification utilities
 */
export function showToast(message, type = 'info', duration = 3000) {
  console.log(`📢 Toast: ${type.toUpperCase()} - ${message}`);
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type} show`;
  toast.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <button class="ml-3 text-white hover:opacity-70" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(toast);
  
  // Auto remove
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, duration);
}