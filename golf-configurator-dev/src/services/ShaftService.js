/**
 * ShaftService - Exact recreation from golf-configurator-simple.js
 */
export class ShaftService {
  constructor() {
    this.brandData = {};
    this.SHAFT_BRAND_MAPPING = {
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
  }

  getAvailableBrands() {
    return Object.keys(this.SHAFT_BRAND_MAPPING);
  }

  async loadShaftDataForBrand(brandName) {
    console.log(`🏌️ API CALL: Loading shaft data for brand "${brandName}"`);

    if (this.brandData[brandName]) {
      console.log(`📦 CACHED DATA: Using existing data for brand "${brandName}"`);
      console.log(`📊 AVAILABLE OPTIONS: ${this.brandData[brandName].length} shaft variants cached`);
      return this.brandData[brandName];
    }

    const variantIds = this.SHAFT_BRAND_MAPPING[brandName];
    if (!variantIds) {
      console.warn(`❌ UNKNOWN BRAND: "${brandName}" not found in mapping`);
      console.log('📋 AVAILABLE BRANDS:', Object.keys(this.SHAFT_BRAND_MAPPING));
      return [];
    }

    console.log(`🔄 FETCHING: ${variantIds.length} shaft variants for "${brandName}"`);
    console.log('🆔 Target variant IDs:', variantIds);
    console.log(`📋 Variant IDs for ${brandName}:`, variantIds);
    console.log(`📊 Total variants to search for: ${variantIds.length}`);

    const shaftOptions = [];

    try {
      // Use the same reliable API pattern as ProductService
      console.log('🌐 API CALL: Calling loadVariantsByIds...');
      const variants = await this.loadVariantsByIds(variantIds);
      console.log(`✅ FETCHED DATA: Received ${variants.length} variants from API`);

      console.group('📋 Processing Shaft Variants:');
      for (const [index, variant] of variants.entries()) {
        console.log(`🔧 Processing variant ${index + 1}/${variants.length}: ${variant.title}`);
        console.log(`   💰 Price: £${(variant.price / 100).toFixed(2)}`);
        console.log(`   📦 Available: ${variant.available}`);
        console.log(`   🏭 Product: ${variant.product?.title}`);
        console.log(`   🆔 ID: ${variant.id}`);

        if (variant) {
          const shaftOption = {
            id: variant.id.toString(),
            title: variant.title,
            price: variant.price, // Keep raw price in store currency from Shopify Products API
            available: variant.available !== false, // Assume available unless explicitly false
            option1: variant.option1 || variant.title,
            productTitle: variant.product.title,
            pricePerClub: variant.price, // Keep raw price in store currency
            displayName: `${variant.product.title} ${variant.title}`,
            quantityAvailable: variant.inventory_quantity || 0,
          };

          console.log(`   ✅ Created option: ${shaftOption.displayName}`);
          shaftOptions.push(shaftOption);
        }
      }
      console.groupEnd();

      console.log(`✅ FINAL RESULT: Loaded ${shaftOptions.length} shaft options for "${brandName}"`);
      console.group('📊 AVAILABLE OPTIONS Summary:');
      shaftOptions.forEach((option, i) => {
        console.log(
          `${i + 1}. ${option.displayName} - £${(option.price / 100).toFixed(2)} (${
            option.available ? 'Available' : 'Unavailable'
          })`
        );
      });
      console.groupEnd();

      this.brandData[brandName] = shaftOptions;
      return shaftOptions;
    } catch (error) {
      console.error(`❌ Failed to load shaft data for ${brandName}:`, error);
      console.error('❌ Error stack:', error.stack);
      return [];
    }
  }

  async loadVariantsByIds(variantIds) {
    const variants = [];

    try {
      // Try bulk search first (most reliable)
      console.log('🔄 Loading variants via bulk product search...');
      console.log('🎯 Looking for variant IDs:', variantIds);

      const response = await fetch('/products.json?limit=250');
      console.log('📡 Products API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Products API returned:', data.products?.length || 0, 'products');

        let totalVariantsScanned = 0;
        const allVariantIds = [];

        // Find variants by ID and collect all variant IDs
        data.products.forEach((product) => {
          product.variants.forEach((variant) => {
            totalVariantsScanned++;
            const variantIdStr = variant.id.toString();
            allVariantIds.push({
              id: variantIdStr,
              productTitle: product.title,
              variantTitle: variant.title,
              price: variant.price,
              available: variant.available,
            });

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

        // Log missing variants
        const foundIds = variants.map((v) => v.id.toString());
        const missingIds = variantIds.filter((id) => !foundIds.includes(id));
        if (missingIds.length > 0) {
          console.warn('❌ Missing variant IDs:', missingIds);
        }

        // Log all available shaft-related products for debugging
        console.log('🔍 DEBUGGING: All available products and variants:');
        const shaftProducts = allVariantIds.filter(
          (item) =>
            item.productTitle.toLowerCase().includes('shaft') ||
            item.productTitle.toLowerCase().includes('kbs') ||
            item.productTitle.toLowerCase().includes('fujikura') ||
            item.productTitle.toLowerCase().includes('mamiya') ||
            item.variantTitle.toLowerCase().includes('tour') ||
            item.variantTitle.toLowerCase().includes('axiom') ||
            item.variantTitle.toLowerCase().includes('recoil')
        );

        if (shaftProducts.length > 0) {
          console.log('🏌️ Found', shaftProducts.length, 'potential shaft products:');
          shaftProducts.forEach((shaft) => {
            console.log(
              `  • ${shaft.productTitle} - ${shaft.variantTitle} (ID: ${shaft.id}) - £${(shaft.price / 100).toFixed(2)}`
            );
          });
        }

        return variants;
      } else {
        throw new Error(`Products API request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error in loadVariantsByIds:', error);
      return [];
    }
  }
}
