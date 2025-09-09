/**
 * Product Service - Modern functional approach
 * Handles product data fetching with centralized mock data
 */

import { USE_REAL_DATA } from '../hooks/useGolfState';
import mockData from '../mocks/shopify-data.json';

// Cache for loaded product data
let productCache = null;

/**
 * Get the bundle parent product handle from theme settings
 */
const getBundleParentProductHandle = () => {
  const configuratorElement = document.getElementById('golf-configurator');

  if (!configuratorElement) {
    throw new Error('Golf configurator element not found - cannot read bundle parent product data');
  }

  const bundleParentProductData = configuratorElement.getAttribute('data-bundle-parent-product');

  if (!bundleParentProductData) {
    throw new Error(
      'No bundle parent product data found in theme settings - please configure bundle parent product in theme editor'
    );
  }

  try {
    // Handle the case where the JSON string contains extra quotes
    let cleanedData = bundleParentProductData;

    // If it's a string wrapped in quotes, extract it
    if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
      cleanedData = cleanedData.slice(1, -1);
    }

    // If it's just a string (product handle), use it directly
    if (typeof cleanedData === 'string' && !cleanedData.startsWith('{')) {
      return cleanedData;
    }

    const bundleParentProduct = JSON.parse(bundleParentProductData);

    if (!bundleParentProduct?.handle) {
      throw new Error('No bundle parent product selected in theme settings - please select a product in theme editor');
    }

    return bundleParentProduct.handle;
  } catch (error) {
    if (error.message.includes('theme settings')) {
      throw error; // Re-throw our custom errors
    }
    throw new Error('Invalid bundle parent product data format in theme settings - please check theme configuration');
  }
};

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

    productCache = product;
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

  productCache = mockProduct;
  console.log('🧪 MOCK: Created unified product with', mockVariants.length, 'variants');

  return mockProduct;
};

/**
 * Find variant by set size
 */
export const findVariantBySetSize = (setSize) => {
  if (!productCache) {
    console.warn('No product data loaded');
    return null;
  }

  const normalizedSetSize = setSize.replace('-', ''); // Handle both "4PW" and "4-PW"

  // Find variant by title matching set size using modern find method
  const variant = productCache.variants.find((variant) => {
    const variantTitle = variant.title.replace('-', ''); // Normalize variant title too
    return variantTitle === normalizedSetSize;
  });

  if (!variant) {
    console.warn(`No variant found for setSize: ${setSize}`);
    return null;
  }

  return variant;
};

/**
 * Get cached product data
 */
export const getCachedProducts = () => {
  // Return in the old format for backward compatibility
  if (!productCache) return null;

  // Using reduce for more functional approach
  return productCache.variants.reduce((foundProducts, variant) => {
    const normalizedSetSize = variant.title.replace('-', '');
    foundProducts[normalizedSetSize] = {
      product: productCache,
      variant,
      setSize: normalizedSetSize,
    };
    return foundProducts;
  }, {});
};
