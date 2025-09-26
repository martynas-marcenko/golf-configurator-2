/**
 * Data Attributes Utilities
 * Functions for reading data attributes from the golf configurator DOM element
 * These attributes are populated by the Shopify theme extension
 */

/**
 * Get parent variant ID from data attributes for cart transformer
 * Reads from data-bundle-parent-product attribute set by theme extension
 * @param {string} setSize - Iron set size (e.g., "6-PW")
 * @param {string} hand - Hand preference (e.g., "Right Handed")
 */
export const getParentVariantIdFromThemeSettings = async (setSize, hand) => {
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

        if (!productData?.variants?.length) {
          throw new Error(`No variants found in fetched product "${cleanedData}"`);
        }

        // Find the variant that matches the current configuration (only by setSize since hand is in metafield)
        const matchingVariant = productData.variants.find(variant =>
          variant.option1 === setSize
        );

        if (!matchingVariant) {
          console.warn(`⚠️ No variant found for ${setSize}, using first variant as fallback`);
          const fallbackVariant = productData.variants[0];
          const parentVariantId = `gid://shopify/ProductVariant/${fallbackVariant.id}`;
          console.log('🎯 Using fallback parent variant ID:', parentVariantId);
          return parentVariantId;
        }

        const parentVariantId = `gid://shopify/ProductVariant/${matchingVariant.id}`;
        console.log('🎯 Found matching parent variant ID:', parentVariantId, `(${setSize}, hand from metafield: ${hand})`);
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

/**
 * Gets product hand and hand links from programmatic data attributes
 * @returns {Object} Object containing currentHand and handLinks
 */
export function getProductHandAndVariations() {
  const configuratorElement = document.getElementById('golf-configurator');

  if (!configuratorElement) {
    console.error('❌ Golf configurator element not found - theme extension is not properly loaded');
    return { error: 'Theme extension not loaded', currentHand: null, handLinks: {} };
  }

  // Read programmatic data attributes from Liquid template
  const currentHand = configuratorElement.getAttribute('data-current-hand');
  const rightHandLink = configuratorElement.getAttribute('data-right-hand-link');
  const leftHandLink = configuratorElement.getAttribute('data-left-hand-link');

  if (!currentHand) {
    console.error('❌ data-current-hand attribute is missing - product metafields not configured');
    return { error: 'Product metafields not configured (current_hand)', currentHand: null, handLinks: {} };
  }

  if (!rightHandLink || !leftHandLink) {
    console.error('❌ Hand link attributes missing - product metafields not configured', {
      rightHandLink: !!rightHandLink,
      leftHandLink: !!leftHandLink
    });
    return { error: 'Product metafields not configured (hand_links)', currentHand, handLinks: {} };
  }

  // Convert programmatic hand back to display format for compatibility
  const displayCurrentHand = currentHand === 'right-handed' ? 'Right Handed' : 'Left Handed';

  const handLinks = {
    'right-handed': rightHandLink,
    'left-handed': leftHandLink
  };

  console.log('🔍 Current hand (programmatic):', currentHand);
  console.log('🔍 Current hand (display):', displayCurrentHand);
  console.log('🔍 Hand links:', handLinks);

  return {
    currentHand: displayCurrentHand, // Return display format for compatibility
    handLinks,
    error: null
  };
}

/**
 * Gets the URL for a specific hand variation using programmatic data attributes
 * @param {string} targetHand - Target hand ('Left Handed' or 'Right Handed')
 * @param {Object} handLinks - Hand links object from getProductHandAndVariations() (optional, will fetch if not provided)
 * @returns {string} Product URL for the target hand
 */
export function getHandVariationUrl(targetHand, handLinks = null) {
  // If handLinks not provided, fetch from data attributes
  if (!handLinks) {
    const { handLinks: fetchedLinks, error } = getProductHandAndVariations();
    if (error || !fetchedLinks) {
      console.warn('No hand links available for navigation:', error);
      return '#';
    }
    handLinks = fetchedLinks;
  }

  // Convert display format to programmatic format
  const programmaticHand = targetHand === 'Left Handed' ? 'left-handed' : 'right-handed';

  const targetUrl = handLinks[programmaticHand];

  console.log('🔍 Looking for target hand:', targetHand, '(', programmaticHand, ')');
  console.log('🔍 Available hand links:', handLinks);
  console.log('🎯 Target URL found:', targetUrl);

  return targetUrl || '#';
};
