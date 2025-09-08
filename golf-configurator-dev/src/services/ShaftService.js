/**
 * Shaft Service - Modern functional approach
 * Handles shaft data fetching with centralized mock data
 */

import { USE_REAL_DATA } from '../hooks/useGolfState';
import mockData from '../mocks/shopify-data.json';

// Cache for shaft data
let shaftBrandCache = {};

const SHAFT_BRAND_MAPPING = {
  'KBS Tour Lite': [
    '55509863334212', // Regular - £150.00
    '55509863366980', // Stiff - £154.00
    '55509863399748', // Extra Stiff - £160.00
  ],
  'KBS Tour Matte Black': [
    '55509903835460', // Regular - £150.00
    '55509903868228', // Stiff - £154.00
    '55509903900996', // Extra Stiff - £160.00
  ],
  'Fujikura Axiom': [
    '55509904818500', // Regular - £150.00
    '55509904851268', // Stiff - £154.00
    '55509904884036', // Extra Stiff - £160.00
  ],
  'UST Mamiya': [
    '55509905867076', // Regular - £150.00
    '55509905899844', // Stiff - £154.00
    '55509905932612', // Extra Stiff - £160.00
  ],
};

/**
 * Get available shaft brands
 */
export function getAvailableBrands() {
  if (USE_REAL_DATA) {
    return Object.keys(SHAFT_BRAND_MAPPING);
  } else {
    return Object.keys(mockData.products.shafts);
  }
}

/**
 * Load shaft options for a specific brand
 * Uses real Shopify API or mock data based on USE_REAL_DATA flag
 */
export async function loadShaftOptions(brandName) {
  if (USE_REAL_DATA) {
    return loadRealShaftOptions(brandName);
  } else {
    return loadMockShaftOptions(brandName);
  }
}

/**
 * Load real shaft data from Shopify API
 */
async function loadRealShaftOptions(brandName) {
  console.log(`🏌️ API CALL: Loading shaft data for brand "${brandName}"`);

  if (shaftBrandCache[brandName]) {
    console.log(`📦 CACHED DATA: Using existing data for brand "${brandName}"`);
    console.log(`📊 AVAILABLE OPTIONS: ${shaftBrandCache[brandName].length} shaft variants cached`);
    return shaftBrandCache[brandName];
  }

  const variantIds = SHAFT_BRAND_MAPPING[brandName];
  if (!variantIds) {
    console.warn(`❌ UNKNOWN BRAND: "${brandName}" not found in mapping`);
    console.log('📋 AVAILABLE BRANDS:', Object.keys(SHAFT_BRAND_MAPPING));
    return [];
  }

  console.log(`🔄 FETCHING: ${variantIds.length} shaft variants for "${brandName}"`);
  console.log('🆔 Target variant IDs:', variantIds);

  try {
    const variants = await loadVariantsByIds(variantIds);
    console.log(`✅ FETCHED DATA: Received ${variants.length} variants from API`);

    const shaftOptions = processShaftVariants(variants);
    
    shaftBrandCache[brandName] = shaftOptions;
    console.log(`✅ FINAL RESULT: Loaded ${shaftOptions.length} shaft options for "${brandName}"`);
    
    return shaftOptions;
  } catch (error) {
    console.error(`❌ Failed to load shaft data for ${brandName}:`, error);
    return [];
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
  const shaftOptions = mockShafts.map(shaft => ({
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

/**
 * Load variants by IDs from Shopify API
 */
async function loadVariantsByIds(variantIds) {
  const variants = [];

  try {
    console.log('🔄 Loading variants via bulk product search...');
    console.log('🎯 Looking for variant IDs:', variantIds);

    const response = await fetch('/products.json?limit=250');
    console.log('📡 Products API response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('📦 Products API returned:', data.products?.length || 0, 'products');

      let totalVariantsScanned = 0;

      // Find variants by ID
      data.products.forEach((product) => {
        product.variants.forEach((variant) => {
          totalVariantsScanned++;
          const variantIdStr = variant.id.toString();

          if (variantIds.includes(variantIdStr)) {
            console.log(
              '🎯 MATCH FOUND! Variant ID:',
              variantIdStr,
              'Product:',
              product.title,
              'Variant:',
              variant.title
            );
            variants.push({
              ...variant,
              product: {
                title: product.title,
                handle: product.handle,
              },
            });
          }
        });
      });

      console.log('🔍 Total variants scanned:', totalVariantsScanned);
      console.log('✅ Found', variants.length, 'matching variants out of', variantIds.length, 'requested');

      return variants;
    } else {
      throw new Error(`Products API request failed: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error in loadVariantsByIds:', error);
    return [];
  }
}

/**
 * Process shaft variants into standardized format
 */
function processShaftVariants(variants) {
  console.group('📋 Processing Shaft Variants:');
  
  const shaftOptions = variants.map((variant, index) => {
    console.log(`🔧 Processing variant ${index + 1}/${variants.length}: ${variant.title}`);
    console.log(`   💰 Price: £${(variant.price / 100).toFixed(2)}`);
    console.log(`   📦 Available: ${variant.available}`);
    console.log(`   🏭 Product: ${variant.product?.title}`);

    const shaftOption = {
      id: variant.id.toString(),
      title: variant.title,
      price: variant.price,
      available: variant.available !== false,
      option1: variant.option1 || variant.title,
      productTitle: variant.product.title,
      pricePerClub: variant.price,
      displayName: `${variant.product.title} ${variant.title}`,
      quantityAvailable: variant.inventory_quantity || 0,
    };

    console.log(`   ✅ Created option: ${shaftOption.displayName}`);
    return shaftOption;
  });
  
  console.groupEnd();
  
  console.group('📊 AVAILABLE OPTIONS Summary:');
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
