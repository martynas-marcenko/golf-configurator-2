/**
 * Product Service - Modern functional approach
 * Handles product data fetching with centralized mock data
 */

import { USE_REAL_DATA } from '../hooks/useGolfState';
import mockData from '../mocks/shopify-data.json';

// Cache for loaded product data
let productCache = null;

const PRODUCT_HANDLE = 'origin-combo-length-chrome';

/**
 * Main function to fetch club head products
 * Uses real Shopify API or mock data based on USE_REAL_DATA flag
 */
export async function fetchClubHeadProducts() {
  if (USE_REAL_DATA) {
    return fetchRealClubProducts();
  } else {
    return fetchMockClubProducts();
  }
}

/**
 * Fetch real product data from Shopify API
 */
async function fetchRealClubProducts() {
  try {
    console.log('🏌️ API CALL: Fetching club head product from Shopify...');
    console.log('🏌️ Product handle:', PRODUCT_HANDLE);

    const response = await fetch(`/products/${PRODUCT_HANDLE}.js`);

    if (response.ok) {
      const product = await response.json();
      console.log(`✅ FETCHED DATA: Product "${product.title}"`);
      console.log('📊 AVAILABLE OPTIONS: Product has', product.variants.length, 'total variants');

      // Log all available variants
      console.group('📋 Available Variants:');
      product.variants.forEach((variant, index) => {
        console.log(`${index + 1}. ${variant.title} - £${(variant.price / 100).toFixed(2)} (ID: ${variant.id})`);
      });
      console.groupEnd();

      productCache = product;
      return product;
    } else {
      console.warn(`❌ API ERROR: Product handle '${PRODUCT_HANDLE}' returned ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch club head products:', error);
    return null;
  }
}

/**
 * Fetch mock product data from centralized JSON file
 */
async function fetchMockClubProducts() {
  console.log('🧪 MOCK: Loading club head products from mock data');

  // Create a unified product from mock data
  const mockVariants = [];

  // Combine all mock iron sets into a single product with multiple variants
  for (const [setSize, mockProduct] of Object.entries(mockData.products.ironSets)) {
    mockVariants.push(mockProduct.variants[0]);
    console.log(
      `🧪 MOCK VARIANT: ${mockProduct.variants[0].title} - £${(mockProduct.variants[0].price / 100).toFixed(2)}`
    );
  }

  const mockProduct = {
    id: mockData.products.ironSets['4PW'].id,
    title: mockData.products.ironSets['4PW'].title,
    handle: mockData.products.ironSets['4PW'].handle,
    variants: mockVariants,
  };

  productCache = mockProduct;
  console.log('🧪 MOCK: Created unified product with', mockVariants.length, 'variants');

  return mockProduct;
}

/**
 * Find variant by set size
 */
export function findVariantBySetSize(setSize) {
  if (!productCache) {
    console.warn('No product data loaded');
    return null;
  }

  const normalizedSetSize = setSize.replace('-', ''); // Handle both "4PW" and "4-PW"

  // Find variant by title matching set size
  const variant = productCache.variants.find((v) => {
    const variantTitle = v.title.replace('-', ''); // Normalize variant title too
    return variantTitle === normalizedSetSize;
  });

  if (variant) {
    return variant;
  }

  console.warn(`No variant found for setSize: ${setSize}`);
  return null;
}

/**
 * Get cached product data
 */
export function getCachedProducts() {
  // Return in the old format for backward compatibility
  if (!productCache) return null;

  const foundProducts = {};
  productCache.variants.forEach((variant) => {
    const normalizedSetSize = variant.title.replace('-', '');
    foundProducts[normalizedSetSize] = {
      product: productCache,
      variant: variant,
      setSize: normalizedSetSize,
    };
  });

  return foundProducts;
}
