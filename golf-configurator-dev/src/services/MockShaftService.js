/**
 * Mock Shaft Service for Development
 * Simulates ShaftService behavior with mock data
 */

import { mockShaftProducts } from '../mocks/mockShopifyData.js';

export class MockShaftService {
  constructor() {
    this.brandData = {};
    this.SHAFT_BRAND_MAPPING = {
      'KBS Tour Lite': ['55509863334212', '55509863366980', '55509863399748'],
      'KBS Tour Matte Black': ['55509903835460', '55509903868228', '55509903900996'],
      'Fujikura Axiom': ['55509904818500', '55509904851268', '55509904884036'],
      'UST Mamiya': ['55509905867076', '55509905899844', '55509905932612'],
    };
  }

  getAvailableBrands() {
    return Object.keys(this.SHAFT_BRAND_MAPPING);
  }

  async loadShaftDataForBrand(brandName) {
    console.log(`🧪 Mock: Loading shaft data for brand: ${brandName}`);

    if (this.brandData[brandName]) {
      console.log(`📦 Mock: Using cached data for brand: ${brandName}`);
      return this.brandData[brandName];
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const variantIds = this.SHAFT_BRAND_MAPPING[brandName];
    if (!variantIds) {
      console.warn(`❌ Mock: Unknown shaft brand: ${brandName}`);
      return [];
    }

    const shaftOptions = [];

    try {
      // Find mock shaft product for this brand
      const shaftProduct = mockShaftProducts.find(product => 
        product.title === brandName
      );

      if (shaftProduct) {
        shaftProduct.variants.forEach(variant => {
          const shaftOption = {
            id: variant.id.toString(),
            title: variant.title,
            price: (variant.price / 100).toFixed(2), // Convert pence to pounds for display
            available: variant.available,
            option1: variant.option1 || variant.title,
            productTitle: variant.product.title,
            pricePerClub: (variant.price / 100).toFixed(2),
            displayName: `${variant.product.title} ${variant.title}`,
            quantityAvailable: variant.inventory_quantity || 0,
          };

          console.log(`➕ Mock: Adding shaft option:`, shaftOption);
          shaftOptions.push(shaftOption);
        });
      }

      console.log(`✅ Mock: Loaded ${shaftOptions.length} shaft options for ${brandName}`);
      this.brandData[brandName] = shaftOptions;
      return shaftOptions;

    } catch (error) {
      console.error(`❌ Mock: Failed to load shaft data for ${brandName}:`, error);
      return [];
    }
  }

  getShaftDisplayName(shaftVariantId) {
    for (const variants of Object.values(this.brandData)) {
      const shaft = variants.find((v) => v.id.toString() === shaftVariantId);
      if (shaft) {
        return shaft.displayName;
      }
    }
    return 'Unknown Shaft';
  }

  calculateShaftSurcharge(shaftVariantId, clubCount) {
    for (const variants of Object.values(this.brandData)) {
      const shaft = variants.find((v) => v.id.toString() === shaftVariantId);
      if (shaft) {
        return parseFloat(shaft.pricePerClub) * clubCount;
      }
    }
    return 0;
  }
}