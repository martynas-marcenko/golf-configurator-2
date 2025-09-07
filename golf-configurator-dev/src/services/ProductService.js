/**
 * Product Service for Golf Configurator
 * Exact replica of vanilla JS ProductService functionality
 * Handles product data fetching and variant management
 */

export class ProductService {
  constructor() {
    this.clubHeadProducts = null;
    this.productData = null;
  }

  async fetchClubHeadProducts() {
    const expectedVariantIDs = {
      '4PW': '55435517559108',
      '5PW': '55435517591876', 
      '6PW': '55435517624644',
    };

    const productHandle = 'origin-combo-length-chrome';

    try {
      console.log('🏌️ Fetching club head product...');

      const foundProducts = {};
      const response = await fetch(`/products/${productHandle}.js`);

      if (response.ok) {
        const product = await response.json();
        console.log(`✅ Fetched product: ${product.title}`);

        for (const [setSize, expectedVariantId] of Object.entries(expectedVariantIDs)) {
          const targetVariant = product.variants.find((v) => v.id.toString() === expectedVariantId);

          if (targetVariant) {
            foundProducts[setSize] = {
              product: product,
              variant: targetVariant,
              setSize: setSize,
            };
            console.log(
              `✅ Found ${setSize}:`,
              targetVariant.title || setSize,
              `(£${(targetVariant.price / 100).toFixed(2)}) - Variant ID: ${targetVariant.id}`
            );
          } else {
            console.warn(`Could not find variant ${expectedVariantId} for ${setSize}`);
          }
        }
      } else {
        console.warn(`Product handle '${productHandle}' returned ${response.status}`);
      }

      if (Object.keys(foundProducts).length === 0) {
        console.log('Handle fetching failed, trying bulk product search...');
        return this.fetchByBulkSearch(expectedVariantIDs);
      }

      this.clubHeadProducts = foundProducts;
      console.log('✅ Club head products loaded:', Object.keys(foundProducts));

      return foundProducts;
    } catch (error) {
      console.error('Failed to fetch club head products:', error);
      return this.fetchByBulkSearch(expectedVariantIDs);
    }
  }

  async fetchByBulkSearch(expectedVariantIDs) {
    try {
      console.log('Fallback: Searching all products by variant ID...');

      const response = await fetch('/products.json?limit=250');
      const data = await response.json();

      const foundProducts = {};

      data.products.forEach((product) => {
        product.variants.forEach((variant) => {
          const variantId = variant.id.toString();

          Object.entries(expectedVariantIDs).forEach(([setSize, expectedVariantId]) => {
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

      this.clubHeadProducts = foundProducts;
      return foundProducts;
    } catch (error) {
      console.error('Bulk product search failed:', error);
      this.clubHeadProducts = {};
      return {};
    }
  }

  /**
   * Find variant by set size and hand preference
   */
  findVariantBySetSize(setSize, hand = 'right') {
    // First try to use live club head products
    if (this.clubHeadProducts) {
      const productInfo = this.clubHeadProducts[setSize];
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
}