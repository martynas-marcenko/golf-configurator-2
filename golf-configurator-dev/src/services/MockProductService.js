/**
 * Mock Product Service for Development
 * Simulates ProductService behavior with mock data
 */

import { mockProductData, mockAllProducts } from '../mocks/mockShopifyData.js';

export class MockProductService {
  constructor() {
    this.clubHeadProducts = null;
    this.productData = null;
  }

  async fetchClubHeadProducts() {
    console.log('🧪 Mock: Fetching club head products...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundProducts = {
      '4PW': {
        product: mockProductData,
        variant: mockProductData.variants[0],
        setSize: '4PW'
      },
      '5PW': {
        product: mockProductData, 
        variant: mockProductData.variants[1],
        setSize: '5PW'
      },
      '6PW': {
        product: mockProductData,
        variant: mockProductData.variants[2], 
        setSize: '6PW'
      }
    };

    this.clubHeadProducts = foundProducts;
    
    console.log('✅ Mock: Club head products loaded:', Object.keys(foundProducts));
    Object.entries(foundProducts).forEach(([setSize, info]) => {
      console.log(`✅ Mock Found ${setSize}: ${info.variant.title} (£${(info.variant.price / 100).toFixed(2)}) - Variant ID: ${info.variant.id}`);
    });

    return foundProducts;
  }

  async fetchByBulkSearch(expectedVariantIDs) {
    console.log('🧪 Mock: Fallback bulk search...');
    // Return same as fetchClubHeadProducts for simplicity
    return this.fetchClubHeadProducts();
  }

  findVariantBySetSize(setSize, hand = 'right') {
    if (this.clubHeadProducts) {
      const productInfo = this.clubHeadProducts[setSize];
      if (productInfo) {
        // For mock, just return the variant (no hand-specific logic needed for UI dev)
        return productInfo.variant;
      }
    }

    console.warn(`🧪 Mock: No variant found for setSize: ${setSize}, hand: ${hand}`);
    return null;
  }
}