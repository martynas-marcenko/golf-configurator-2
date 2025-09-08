/**
 * Product Service - Modern functional approach
 * Handles product data fetching with centralized mock data
 */

import { USE_REAL_DATA } from '../hooks/useGolfState';
import mockData from '../mocks/shopify-data.json';

// Cache for loaded products
let clubHeadProductsCache = null;

const EXPECTED_VARIANT_IDS = {
  '4PW': '55435517559108',
  '5PW': '55435517591876', 
  '6PW': '55435517624644',
};

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
    console.log('🏌️ Expected variant IDs:', EXPECTED_VARIANT_IDS);
    console.log('🏌️ Product handle:', PRODUCT_HANDLE);

    const foundProducts = {};
    const response = await fetch(`/products/${PRODUCT_HANDLE}.js`);

    if (response.ok) {
      const product = await response.json();
      console.log('🏌️ Product data:', product);
      console.log(`✅ FETCHED DATA: Product "${product.title}"`);
      console.log('📊 AVAILABLE OPTIONS: Product has', product.variants.length, 'total variants');

      // Log all available variants
      console.group('📋 All Available Variants:');
      product.variants.forEach((variant, index) => {
        console.log(`${index + 1}. ${variant.title} - £${(variant.price / 100).toFixed(2)} (ID: ${variant.id})`);
      });
      console.groupEnd();

      console.group('🔍 Matching Target Variants:');
      for (const [setSize, expectedVariantId] of Object.entries(EXPECTED_VARIANT_IDS)) {
        const targetVariant = product.variants.find((v) => v.id.toString() === expectedVariantId);

        if (targetVariant) {
          foundProducts[setSize] = {
            product: product,
            variant: targetVariant,
            setSize: setSize,
          };
          console.log(
            `✅ MATCHED ${setSize}: ${targetVariant.title} - £${(targetVariant.price / 100).toFixed(2)} (ID: ${
              targetVariant.id
            })`
          );
        } else {
          console.warn(`❌ MISSING ${setSize}: Could not find variant ${expectedVariantId}`);
        }
      }
      console.groupEnd();
    } else {
      console.warn(`❌ API ERROR: Product handle '${PRODUCT_HANDLE}' returned ${response.status}`);
    }

    if (Object.keys(foundProducts).length === 0) {
      console.log('🔄 FALLBACK: Handle fetching failed, trying bulk product search...');
      return fetchByBulkSearch();
    }

    clubHeadProductsCache = foundProducts;
    console.log('✅ FINAL RESULT: Club head products loaded successfully');
    console.log(
      '📊 LOADED OPTIONS:',
      Object.keys(foundProducts).map((key) => `${key} (${foundProducts[key].variant.title})`)
    );

    return foundProducts;
  } catch (error) {
    console.error('Failed to fetch club head products:', error);
    return fetchByBulkSearch();
  }
}

/**
 * Fetch mock product data from centralized JSON file
 */
async function fetchMockClubProducts() {
  console.log('🧪 MOCK: Loading club head products from mock data');
  console.log('🧪 MOCK: Expected variant IDs:', EXPECTED_VARIANT_IDS);
  
  const foundProducts = {};
  
  // Process mock data to match real API structure
  for (const [setSize, expectedVariantId] of Object.entries(EXPECTED_VARIANT_IDS)) {
    const mockProduct = mockData.products.ironSets[setSize];
    
    if (mockProduct) {
      foundProducts[setSize] = {
        product: {
          id: mockProduct.id,
          title: mockProduct.title,
          handle: mockProduct.handle,
          variants: mockProduct.variants
        },
        variant: mockProduct.variants[0], // Mock data has one variant per set
        setSize: setSize,
      };
      
      console.log(
        `🧪 MOCK MATCHED ${setSize}: ${mockProduct.variants[0].title} - £${(mockProduct.variants[0].price / 100).toFixed(2)} (ID: ${mockProduct.variants[0].id})`
      );
    }
  }
  
  clubHeadProductsCache = foundProducts;
  console.log('🧪 MOCK: Loaded', Object.keys(foundProducts).length, 'product sets');
  
  return foundProducts;
}

/**
 * Fallback bulk search for real API
 */
async function fetchByBulkSearch() {
  try {
    console.log('Fallback: Searching all products by variant ID...');

    const response = await fetch('/products.json?limit=250');
    const data = await response.json();

    const foundProducts = {};

    data.products.forEach((product) => {
      product.variants.forEach((variant) => {
        const variantId = variant.id.toString();

        Object.entries(EXPECTED_VARIANT_IDS).forEach(([setSize, expectedVariantId]) => {
          if (variantId === expectedVariantId && !foundProducts[setSize]) {
            foundProducts[setSize] = {
              product: product,
              variant: variant,
              setSize: setSize,
            };
            console.log(
              `✅ Found ${setSize} via bulk search:`,
              product.title,
              `(£${parseFloat(variant.price).toFixed(2)})`
            );
          }
        });
      });
    });

    clubHeadProductsCache = foundProducts;
    return foundProducts;
  } catch (error) {
    console.error('Bulk product search failed:', error);
    clubHeadProductsCache = {};
    return {};
  }
}

/**
 * Find variant by set size and hand preference
 */
export function findVariantBySetSize(setSize, hand = 'right') {
  if (clubHeadProductsCache) {
    const productInfo = clubHeadProductsCache[setSize];
    if (productInfo) {
      // Check if the product has hand-specific variants
      const handVariants = productInfo.product.variants.filter((variant) => {
        const option = (variant.option1 || '').toLowerCase();
        return option.includes(hand);
      });

      if (handVariants.length > 0) {
        return handVariants[0];
      } else {
        // Return the main variant if no hand-specific variants
        return productInfo.variant;
      }
    }
  }

  // Fallback - return null if no products loaded
  console.warn(`No variant found for setSize: ${setSize}, hand: ${hand}`);
  return null;
}

/**
 * Get cached products (for debugging)
 */
export function getCachedProducts() {
  return clubHeadProductsCache;
}
