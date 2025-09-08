/**
 * Shaft Service - Modern functional approach
 * Handles shaft data fetching with centralized mock data
 */

import { USE_REAL_DATA } from '../hooks/useGolfState';
import mockData from '../mocks/shopify-data.json';

/**
 * Get available shaft brands
 */
export async function getAvailableBrands() {
  console.log('🔍 DEBUG: getAvailableBrands called with USE_REAL_DATA:', USE_REAL_DATA);
  if (USE_REAL_DATA) {
    console.log('🔍 DEBUG: Using real data path - calling performBrandDiscovery()');
    return await performBrandDiscovery();
  } else {
    console.log('🔍 DEBUG: Using mock data path');
    return Object.keys(mockData.products.shafts);
  }
}

/**
 * Get shaft products from theme data attribute
 */
function getShaftProductsFromTheme() {
  const configuratorElement = document.getElementById('golf-configurator');

  if (!configuratorElement) {
    throw new Error('Golf configurator element not found - cannot read shaft products data');
  }

  const shaftProductsData = configuratorElement.getAttribute('data-shaft-products');

  if (!shaftProductsData) {
    throw new Error('No shaft products data found in theme settings - please configure shaft products in theme editor');
  }

  let shaftProducts;
  try {
    shaftProducts = JSON.parse(shaftProductsData);
  } catch (error) {
    throw new Error('Invalid shaft products data format in theme settings');
  }

  if (!Array.isArray(shaftProducts) || shaftProducts.length === 0) {
    throw new Error('No shaft products selected in theme settings');
  }

  return shaftProducts;
}

/**
 * Perform the actual brand discovery by reading data attributes from theme
 */
async function performBrandDiscovery() {
  console.log('📡 READING: Shaft products from theme data attributes');

  const shaftProducts = getShaftProductsFromTheme();
  console.log(`📦 PARSED SHAFT PRODUCTS:`, shaftProducts);

  // Extract brand names from the shaft products
  const brands = new Set();
  let shaftProductsFound = 0;

  shaftProducts.forEach((product) => {
    if (product && product.title) {
      shaftProductsFound++;
      console.log(`🔧 SHAFT PRODUCT: ${product.title} (ID: ${product.id})`);

      // Use the full product title as the brand
      brands.add(product.title);
    }
  });

  console.log(`🎯 DISCOVERY COMPLETE: Found ${shaftProductsFound} shaft products`);
  console.log(`🏷️ BRANDS DISCOVERED: ${brands.size} unique brands`);

  console.group('📋 Discovered Brands:');
  Array.from(brands).forEach((brand, i) => {
    console.log(`${i + 1}. ${brand}`);
  });
  console.groupEnd();

  if (brands.size === 0) {
    throw new Error('No valid shaft products found in theme data');
  }

  return Array.from(brands);
}

/**
 * Load shaft options for a specific brand
 * Uses real Shopify API or mock data based on USE_REAL_DATA flag
 */
export async function loadShaftOptions(brandName) {
  if (USE_REAL_DATA) {
    console.log(`🏌️ REAL DATA: Loading shaft options for brand "${brandName}"`);

    const shaftProducts = getShaftProductsFromTheme();

    // Find the product that matches the brand name
    const matchingProduct = shaftProducts.find((product) => product.title === brandName);

    if (!matchingProduct) {
      throw new Error(`No product found for brand "${brandName}" in theme settings`);
    }

    console.log(`🎯 BRAND MATCH: ${matchingProduct.title} (ID: ${matchingProduct.id})`);

    // Theme data includes complete variant information
    if (!matchingProduct.variants || matchingProduct.variants.length === 0) {
      throw new Error(`No variants found for product "${brandName}"`);
    }

    console.log(`📦 FOUND: ${matchingProduct.variants.length} variants for "${brandName}"`);

    // Process variants directly into shaft options
    const shaftOptions = matchingProduct.variants.map((variant) => {
      console.log(`  📦 Variant: ${variant.title} (ID: ${variant.id}) - £${(variant.price / 100).toFixed(2)}`);

      return {
        id: variant.id.toString(),
        title: variant.title,
        price: variant.price,
        available: variant.available !== false,
        option1: variant.option1 || variant.title,
        productTitle: matchingProduct.title,
        pricePerClub: variant.price,
        displayName: `${matchingProduct.title} ${variant.title}`,
        quantityAvailable: variant.inventory_quantity || 0,
      };
    });

    console.log(`✅ FINAL RESULT: Loaded ${shaftOptions.length} shaft options for "${brandName}"`);
    return shaftOptions;
  } else {
    return loadMockShaftOptions(brandName);
  }
}

/**
 * Load mock shaft data from centralized JSON file
 */
async function loadMockShaftOptions(brandName) {
  console.log(`🧪 MOCK: Loading shaft data for brand "${brandName}"`);

  const mockShafts = mockData.products.shafts[brandName];
  if (!mockShafts) {
    console.warn(`🧪 MOCK: Brand "${brandName}" not found in mock data`);
    return [];
  }

  console.log(`🧪 MOCK: Found ${mockShafts.length} shaft options for "${brandName}"`);

  // Process mock data to match expected structure
  const shaftOptions = mockShafts.map((shaft) => ({
    id: shaft.id.toString(),
    title: shaft.title,
    price: shaft.price,
    available: shaft.available,
    option1: shaft.option1,
    productTitle: shaft.product.title,
    pricePerClub: shaft.pricePerClub,
    displayName: shaft.displayName,
    quantityAvailable: shaft.quantityAvailable,
  }));

  console.group('🧪 MOCK OPTIONS Summary:');
  shaftOptions.forEach((option, i) => {
    console.log(
      `${i + 1}. ${option.displayName} - £${(option.price / 100).toFixed(2)} (${
        option.available ? 'Available' : 'Unavailable'
      })`
    );
  });
  console.groupEnd();

  return shaftOptions;
}
