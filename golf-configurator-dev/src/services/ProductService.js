/**
 * Product Service - Modern functional approach
 * Handles product data fetching with centralized mock data
 */

import { USE_REAL_DATA } from '../hooks/useGolfState';
import mockData from '../mocks/shopify-data.json';
import { getBundleParentProductHandle } from '../utils/dataAttributes.js';

// No caching - fetch fresh data from Shopify each time


/**
 * Main function to fetch club head products
 * Uses real Shopify API or mock data based on USE_REAL_DATA flag
 */
export const fetchClubHeadProducts = async () => {
  return USE_REAL_DATA ? await fetchRealClubProducts() : await fetchMockClubProducts();
};

/**
 * Fetch real product data from Shopify API
 */
const fetchRealClubProducts = async () => {
  try {
    const productHandle = getBundleParentProductHandle();
    console.log('🏌️ API CALL: Fetching club head product from Shopify...');
    console.log('🏌️ Product handle:', productHandle);

    const response = await fetch(`/products/${productHandle}.js`);

    if (!response.ok) {
      console.warn(`❌ API ERROR: Product handle '${productHandle}' returned ${response.status}`);
      return null;
    }

    const product = await response.json();
    console.log(`✅ FETCHED DATA: Product "${product.title}"`);
    console.log('📊 AVAILABLE OPTIONS: Product has', product.variants.length, 'total variants');

    // Log all available variants
    console.group('📋 Available Variants:');
    product.variants.forEach((variant, index) => {
      const price = (variant.price / 100).toFixed(2);
      console.log(`${index + 1}. ${variant.title} - £${price} (ID: ${variant.id})`);
    });
    console.groupEnd();

    return product;
  } catch (error) {
    console.error('Failed to fetch club head products:', error);
    return null;
  }
};

/**
 * Fetch mock product data from centralized JSON file
 */
const fetchMockClubProducts = async () => {
  console.log('🧪 MOCK: Loading club head products from mock data');

  // Create a unified product from mock data using modern destructuring
  const mockVariants = Object.entries(mockData.products.ironSets).map(([, mockProduct]) => {
    const variant = mockProduct.variants[0];
    const price = (variant.price / 100).toFixed(2);
    console.log(`🧪 MOCK VARIANT: ${variant.title} - £${price}`);
    return variant;
  });

  const { ironSets } = mockData.products;
  const baseProduct = ironSets['4PW'];

  const mockProduct = {
    id: baseProduct.id,
    title: baseProduct.title,
    handle: baseProduct.handle,
    variants: mockVariants,
  };

  console.log('🧪 MOCK: Created unified product with', mockVariants.length, 'variants');

  return mockProduct;
};

/**
 * Find variant by set size - fetches fresh data from Shopify
 */
export const findVariantBySetSize = async (setSize) => {
  const product = await fetchClubHeadProducts();
  
  if (!product) {
    console.warn('No product data available from Shopify');
    return null;
  }

  const normalizedSetSize = setSize.replace('-', ''); // Handle both "4PW" and "4-PW"

  // Find variant by title matching set size using modern find method
  let variant = product.variants.find((variant) => {
    const variantTitle = variant.title.replace('-', ''); // Normalize variant title too
    return variantTitle === normalizedSetSize;
  });

  if (!variant) {
    console.error(`❌ No variant found for setSize: ${setSize}. Available variants:`, product.variants.map(v => v.title));
    return null;
  }

  return variant;
};

