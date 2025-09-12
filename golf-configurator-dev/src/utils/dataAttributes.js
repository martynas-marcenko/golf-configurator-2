/**
 * Data Attributes Utilities
 * Functions for reading data attributes from the golf configurator DOM element
 * These attributes are populated by the Shopify theme extension
 */

/**
 * Get parent variant ID from data attributes for cart transformer
 * Reads from data-bundle-parent-product attribute set by theme extension
 */
export const getParentVariantIdFromThemeSettings = async () => {
  try {
    const configuratorElement = document.getElementById('golf-configurator');

    if (!configuratorElement) {
      throw new Error('Golf configurator element not found - cannot read parent variant data');
    }

    const bundleParentProductData = configuratorElement.getAttribute('data-bundle-parent-product');

    console.log('🐛 DEBUG: Raw data attribute value:', bundleParentProductData);
    console.log('🐛 DEBUG: Data attribute type:', typeof bundleParentProductData);
    console.log('🐛 DEBUG: Data attribute length:', bundleParentProductData?.length);

    if (!bundleParentProductData) {
      throw new Error(
        'No bundle parent product data found in theme settings - please configure bundle parent product in theme editor'
      );
    }

    // Parse the product data (same logic as ProductService)
    let cleanedData = bundleParentProductData;

    if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
      cleanedData = cleanedData.slice(1, -1);
    }

    // If it's just a product handle string, fetch the product data
    if (typeof cleanedData === 'string' && !cleanedData.startsWith('{')) {
      console.log('🔍 Received product handle, fetching full product data:', cleanedData);

      try {
        const response = await fetch(`/products/${cleanedData}.js`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product data for handle "${cleanedData}": ${response.status}`);
        }

        const productData = await response.json();
        console.log('📦 Fetched product data:', productData.title);

        if (!productData?.variants?.[0]?.id) {
          throw new Error(`No valid parent variant found in fetched product "${cleanedData}"`);
        }

        const parentVariantId = `gid://shopify/ProductVariant/${productData.variants[0].id}`;
        console.log('🎯 Found parent variant ID from API:', parentVariantId);
        return parentVariantId;
      } catch (fetchError) {
        throw new Error(`Failed to fetch bundle parent product: ${fetchError.message}`);
      }
    }

    const bundleParentProduct = JSON.parse(bundleParentProductData);

    if (!bundleParentProduct?.variants?.[0]?.id) {
      throw new Error('No valid parent variant found in bundle parent product data - please check theme configuration');
    }

    const parentVariantId = `gid://shopify/ProductVariant/${bundleParentProduct.variants[0].id}`;
    console.log('🎯 Found parent variant ID from theme settings:', parentVariantId);
    return parentVariantId;
  } catch (error) {
    console.error('❌ Error getting parent variant ID from theme settings:', error.message);
    throw error; // Re-throw to fail fast rather than using fallback
  }
};

/**
 * Get bundle parent product handle from data attributes
 * Reads from data-bundle-parent-product attribute set by theme extension
 * Used by ProductService for dynamic product fetching
 */
export const getBundleParentProductHandle = () => {
  const configuratorElement = document.getElementById('golf-configurator');

  if (!configuratorElement) {
    throw new Error('Golf configurator element not found - cannot read bundle parent product data');
  }

  const bundleParentProductData = configuratorElement.getAttribute('data-bundle-parent-product');

  console.log('🐛 DEBUG getBundleParentProductHandle: Raw data:', bundleParentProductData);

  if (!bundleParentProductData) {
    throw new Error(
      'No bundle parent product data found in theme settings - please configure bundle parent product in theme editor'
    );
  }

  try {
    // Handle the case where the JSON string contains extra quotes
    let cleanedData = bundleParentProductData;

    console.log('🐛 DEBUG: Original bundleParentProductData:', bundleParentProductData);

    // Check if it's a JSON error object
    if (bundleParentProductData.includes('"error"')) {
      console.log('🐛 DEBUG: Detected JSON error object');
      const errorObj = JSON.parse(bundleParentProductData);
      if (errorObj.error) {
        throw new Error(
          `Shopify Liquid JSON error: ${errorObj.error}. This usually means the product is not accessible through the theme extension. Please check: 1) Product exists, 2) Product is published, 3) Product is visible in theme settings.`
        );
      }
    }

    // If it's a string wrapped in quotes, extract it
    if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
      cleanedData = cleanedData.slice(1, -1);
    }

    console.log('🐛 DEBUG: Cleaned data:', cleanedData);
    console.log('🐛 DEBUG: Is cleanedData a string?', typeof cleanedData);
    console.log('🐛 DEBUG: Does cleanedData start with {?', cleanedData.startsWith('{'));

    // If it's just a string (product handle), use it directly
    if (typeof cleanedData === 'string' && !cleanedData.startsWith('{')) {
      console.log('🐛 DEBUG: Using cleanedData as product handle:', cleanedData);
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
