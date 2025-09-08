import { signal, computed } from '@preact/signals';
import * as productService from '../services/ProductService.js';
import * as shaftService from '../services/ShaftService.js';
import { PriceFormatter } from '../utils/formatters.js';

// Data source configuration - set to true to use real Shopify data locally
export const USE_REAL_DATA = true; // Toggle this to switch between mock and real data

// FORCE RELOAD TEST - This should show up in console
console.error('🔥 FORCE RELOAD TEST - FILE UPDATED AT:', new Date().toISOString());

// Detect development environment
const isDevelopment = import.meta.env.DEV;

/**
 * Golf configurator state management using Preact signals
 * Modern functional architecture with centralized mock data
 */

// Core state signals
export const selectedHand = signal(null);
export const selectedClubs = signal([
  { id: '6', name: '6-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '7', name: '7-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '8', name: '8-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '9', name: '9-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: 'PW', name: 'Pitching Wedge', type: 'wedge', isRequired: true, isOptional: false },
]); // Start with only required clubs (6-PW) pre-selected
export const selectedShafts = signal({});
export const selectedGrip = signal(null); // { brand: string, size: string }
export const selectedLength = signal('Standard'); // Default length
export const selectedLie = signal('Standard'); // Default lie
export const isLoading = signal(false);
export const error = signal(null);

// DEBUG: Log service configuration immediately
console.log('🔧 SERVICE CONFIG DEBUG:');
console.log('   USE_REAL_DATA:', USE_REAL_DATA);
console.log('   isDevelopment:', isDevelopment);
console.log('   Data source:', USE_REAL_DATA ? 'Real Shopify API' : 'Mock JSON data');

export const priceFormatter = new PriceFormatter();

// Available options
export const handOptions = signal([
  { id: 'left', name: 'Left Hand' },
  { id: 'right', name: 'Right Hand' },
]);

// Computed iron set type based on selected clubs
export const ironSetType = computed(() => {
  const clubIds = selectedClubs.value.map((club) => club.id);
  if (clubIds.includes('4')) return '4PW'; // Match ProductService keys (no hyphen)
  if (clubIds.includes('5')) return '5PW'; // Match ProductService keys (no hyphen)
  return '6PW'; // Match ProductService keys (no hyphen)
});

// Club definitions matching vanilla JS logic (iron sets only)
export const availableClubs = signal([
  { id: '4', name: '4-Iron', type: 'iron', isRequired: false, isOptional: true },
  { id: '5', name: '5-Iron', type: 'iron', isRequired: false, isOptional: true },
  { id: '6', name: '6-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '7', name: '7-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '8', name: '8-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '9', name: '9-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: 'PW', name: 'Pitching Wedge', type: 'wedge', isRequired: true, isOptional: false },
]);

// Default club selections based on set size (like vanilla)
export const defaultClubSelections = {
  '4PW': ['4', '5', '6', '7', '8', '9', 'PW'], // 7 clubs
  '5PW': ['5', '6', '7', '8', '9', 'PW'], // 6 clubs
  '6PW': ['6', '7', '8', '9', 'PW'], // 5 clubs (minimum)
};

// Computed values
export const currentClubs = computed(() => {
  return availableClubs.value;
});

export const selectedClubsCount = computed(() => selectedClubs.value.length);

// Iron set pricing based on club count
export const ironSetPrices = {
  7: 123900, // 4-PW: £1,239.00 in pence
  6: 106200, // 5-PW: £1,062.00 in pence
  5: 88500, // 6-PW: £885.00 in pence
};

export const basePrice = computed(() => {
  const clubCount = selectedClubs.value.length;
  return ironSetPrices[clubCount] || ironSetPrices[5]; // Default to 5-club price
});

export const totalPrice = computed(() => {
  // For now, just return the base price (no shaft upgrades in this focus)
  return basePrice.value;
});

export const formattedTotalPrice = computed(() => {
  return priceFormatter.formatCurrency(totalPrice.value);
});

export const canAddToCart = computed(() => {
  return selectedHand.value && 
         selectedClubs.value.length >= 5 && 
         selectedGrip.value?.brand && 
         selectedGrip.value?.size; // Require hand, clubs, and grip selections
});

// Actions matching vanilla JS functionality
export const actions = {
  setHand(hand) {
    console.log(`🤝 USER SELECTION: Hand preference changed`);
    console.log(`   👈👉 Previous: ${selectedHand.value || 'None'}`);
    console.log(`   👈👉 Selected: ${hand}`);
    console.log(`   📊 Available options: ['left', 'right']`);
    selectedHand.value = hand;
    console.log(`✅ SELECTION APPLIED: Hand set to "${hand}"`);
  },

  // Removed setSetSize - clubs are managed directly through toggleClub

  toggleClub(club) {
    const currentlySelected = selectedClubs.value;
    const isSelected = currentlySelected.some((c) => c.id === club.id);

    console.log(`🏌️ USER SELECTION: Club toggle attempted`);
    console.log(`   🏏 Club: ${club.name} (${club.id})`);
    console.log(
      `   📊 Current selection: [${currentlySelected.map((c) => c.id).join(', ')}] (${currentlySelected.length} clubs)`
    );
    console.log(`   📋 Available clubs: [${availableClubs.value.map((c) => c.id).join(', ')}]`);
    console.log(`   🎯 Action: ${isSelected ? 'Remove' : 'Add'} club`);

    if (isSelected) {
      // Prevent removing if it would go below minimum
      if (currentlySelected.length <= 5 && !club.isOptional) {
        console.log('❌ SELECTION BLOCKED: Cannot remove required club - minimum 5 clubs needed');
        console.log(`   ⚠️ Current count: ${currentlySelected.length}, minimum: 5`);
        console.log(`   🔒 Club type: ${club.isOptional ? 'Optional' : 'Required'}`);
        return false;
      }

      selectedClubs.value = currentlySelected.filter((c) => c.id !== club.id);
      console.log(`➖ SELECTION APPLIED: Removed club "${club.name}"`);
      console.log(
        `   📊 New selection: [${selectedClubs.value.map((c) => c.id).join(', ')}] (${
          selectedClubs.value.length
        } clubs)`
      );
    } else {
      selectedClubs.value = [...currentlySelected, club];
      console.log(`➕ SELECTION APPLIED: Added club "${club.name}"`);
      console.log(
        `   📊 New selection: [${selectedClubs.value.map((c) => c.id).join(', ')}] (${
          selectedClubs.value.length
        } clubs)`
      );
    }

    // Log the computed iron set type
    console.log(`🎯 COMPUTED SET TYPE: ${ironSetType.value} (${selectedClubs.value.length} clubs)`);
    return true;
  },

  selectShaft(clubId, shaftId) {
    console.log(`🔧 USER SELECTION: Shaft selection changed`);
    console.log(`   🏏 Club ID: ${clubId}`);
    console.log(`   🔧 Previous shaft: ${selectedShafts.value[clubId] || 'None'}`);
    console.log(`   🔧 Selected shaft ID: ${shaftId}`);
    console.log(`   📊 Current shaft selections:`, Object.keys(selectedShafts.value).length, 'clubs have shafts');

    selectedShafts.value = {
      ...selectedShafts.value,
      [clubId]: shaftId,
    };

    console.log(`✅ SELECTION APPLIED: Shaft set for club ${clubId}`);
    console.log(`   📊 Updated shaft selections:`, Object.keys(selectedShafts.value).length, 'clubs now have shafts');
  },

  setGrip(brand, size) {
    console.log(`🤲 USER SELECTION: Grip selection changed`);
    console.log(`   🔧 Previous grip: ${selectedGrip.value ? `${selectedGrip.value.brand} ${selectedGrip.value.size}` : 'None'}`);
    console.log(`   🔧 Selected grip: ${brand} ${size}`);
    selectedGrip.value = { brand, size };
    console.log(`✅ SELECTION APPLIED: Grip set to "${brand} ${size}"`);
  },

  setLength(length) {
    console.log(`📏 USER SELECTION: Length changed from "${selectedLength.value}" to "${length}"`);
    selectedLength.value = length;
    console.log(`✅ SELECTION APPLIED: Length set to "${length}"`);
  },

  setLie(lie) {
    console.log(`📐 USER SELECTION: Lie changed from "${selectedLie.value}" to "${lie}"`);
    selectedLie.value = lie;
    console.log(`✅ SELECTION APPLIED: Lie set to "${lie}"`);
  },

  async loadShaftOptions(brandName) {
    console.log(`🚀 API REQUEST: Loading shaft options for brand "${brandName}"`);
    console.log(`   📊 Available brands: ${shaftService.getAvailableBrands().join(', ')}`);
    isLoading.value = true;
    error.value = null;

    try {
      const options = await shaftService.loadShaftOptions(brandName);
      console.log(`✅ OPTIONS LOADED: ${options.length} shaft options available for "${brandName}"`);
      console.group('📋 Shaft Options Summary:');
      options.forEach((option, i) => {
        console.log(
          `${i + 1}. ${option.title} - £${(option.price / 100).toFixed(2)} (${
            option.available ? 'Available' : 'Out of Stock'
          })`
        );
      });
      console.groupEnd();
      return options;
    } catch (err) {
      console.error(`❌ API ERROR: Failed to load shaft options for "${brandName}":`, err);
      error.value = err.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  },

  async addToCart() {
    if (!canAddToCart.value) {
      console.warn('❌ Cannot add to cart - missing required selections');
      return false;
    }

    if (selectedClubs.value.length < 5) {
      error.value = 'Please select at least 5 clubs first!';
      return false;
    }

    console.log('🛒 Starting add to cart process...');
    isLoading.value = true;
    error.value = null;

    try {
      // Get the iron variant based on computed iron set type
      const setType = ironSetType.value;
      console.log('🏌️ DEBUG: Iron set type:', setType);
      const cachedProducts = productService.getCachedProducts();
      console.log('🏌️ DEBUG: Cached products keys:', Object.keys(cachedProducts));
      console.log('🏌️ DEBUG: Full cached products:', cachedProducts);
      const productInfo = cachedProducts[setType];
      console.log('🏌️ DEBUG: Product info for', setType, ':', productInfo);
      if (!productInfo) {
        throw new Error(`Product information not available for set type "${setType}"! Available: ${Object.keys(cachedProducts).join(', ')}`);
      }

      const ironVariant = productService.findVariantBySetSize(setType, selectedHand.value);
      if (!ironVariant) {
        throw new Error('Iron variant not found for selected configuration!');
      }

      console.log('🏌️ Using iron variant ID:', ironVariant.id);
      console.log('🏌️ Iron variant info:', ironVariant);

      // Generate unique bundle ID (like vanilla)
      const bundleId = `golf-${Date.now()}`;
      console.log('🎯 Generated bundleId:', bundleId);

      // Prepare cart add data - Real Product Approach matching cart transformer
      const cartItems = [
        {
          id: ironVariant.id, // Use actual iron variant ID
          quantity: 1,
          properties: {
            bundleId: bundleId,
            hand: selectedHand.value,
            setSize: ironSetType.value,
            clubList: JSON.stringify(selectedClubs.value.map((club) => club.id)), // Note: changed to clubList to match transformer
            // Add shaft properties if selected
            ...(selectedShafts.value &&
              Object.keys(selectedShafts.value).length > 0 && {
                shaft_variant_id: Object.values(selectedShafts.value)[0],
                shaftName: 'Selected Shaft', // Note: changed to shaftName to match transformer
              }),
            // Add grip properties
            ...(selectedGrip.value && {
              grip: `${selectedGrip.value.brand} ${selectedGrip.value.size}`,
            }),
            // Add length and lie adjustments
            length: selectedLength.value,
            lie: selectedLie.value,
          },
        },
      ];

      // Add shaft as separate line item if selected (like vanilla)
      if (selectedShafts.value && Object.keys(selectedShafts.value).length > 0) {
        const shaftVariantId = Object.values(selectedShafts.value)[0];
        const clubCount = selectedClubs.value.length;
        console.log('🏌️ Adding shaft as separate line item:', shaftVariantId);

        cartItems.push({
          id: shaftVariantId, // Use actual shaft variant ID
          quantity: clubCount, // One shaft per club
          properties: {
            bundleId: bundleId, // Same bundle ID to group with iron set
            componentType: 'shaft', // Note: changed to componentType to match transformer
            shaftBrand: 'Selected Shaft', // Note: changed to shaftBrand to match transformer
            clubCount: clubCount.toString(), // Note: changed to clubCount to match transformer
          },
        });
        console.log('🏌️ Shaft item added with quantity:', clubCount);
      }

      const cartData = { items: cartItems };

      console.log('🏌️ Adding to cart with bundleId:', bundleId);
      console.log('🏌️ Full cart data:', cartData);

      // Mock cart API in development
      if (isDevelopment) {
        console.log('🧪 Mock: Simulating cart add...');
        console.log('🛒 Mock: Cart data would be:', cartData);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log('✅ Mock: Added to cart successfully');
        console.log('🎯 Mock: Cart item added with bundleId:', bundleId);
        console.log('⚡ Mock: Cart transformer would process this item...');
        return true;
      }

      // Real Shopify cart API for production
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(cartData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Added to cart successfully:', result);
        console.log('🎯 Cart item added with bundleId:', bundleId);
        console.log('⚡ Cart transformer should now process this item...');
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.description || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('❌ Cart error:', err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  },

  reset() {
    console.log('🔄 Resetting configurator state');
    selectedHand.value = null;
    // Reset to default clubs pre-selected (only required clubs)
    selectedClubs.value = [
      { id: '6', name: '6-Iron', type: 'iron', isRequired: true, isOptional: false },
      { id: '7', name: '7-Iron', type: 'iron', isRequired: true, isOptional: false },
      { id: '8', name: '8-Iron', type: 'iron', isRequired: true, isOptional: false },
      { id: '9', name: '9-Iron', type: 'iron', isRequired: true, isOptional: false },
      { id: 'PW', name: 'Pitching Wedge', type: 'wedge', isRequired: true, isOptional: false },
    ];
    selectedShafts.value = {};
    selectedGrip.value = null;
    selectedLength.value = 'Standard';
    selectedLie.value = 'Standard';
    error.value = null;
  },
};

// Debug logging (matches vanilla JS)
if (typeof window !== 'undefined') {
  window.golfConfiguratorState = {
    selectedHand,
    selectedClubs,
    ironSetType,
    selectedShafts,
    selectedGrip,
    selectedLength,
    selectedLie,
    canAddToCart,
    isLoading,
    error,
    actions,
  };

  // Comprehensive initialization summary
  console.log('🏌️ Golf Configurator State initialized with Preact signals');
  console.log('🔧 DATA SOURCE:', USE_REAL_DATA ? 'Real Shopify Data' : 'Mock Data');
  console.log('🌍 ENVIRONMENT:', isDevelopment ? 'Development' : 'Production');

  console.group('📊 INITIAL STATE SUMMARY:');
  console.log('👈👉 Hand options:', handOptions.value.map((h) => h.name).join(', '));
  console.log(
    '🏏 Available clubs:',
    availableClubs.value.map((c) => `${c.name} (${c.isRequired ? 'Required' : 'Optional'})`)
  );
  console.log('🎯 Default selection:', selectedClubs.value.map((c) => c.name).join(', '));
  console.log(
    '💰 Iron set prices:',
    Object.entries(ironSetPrices)
      .map(([clubs, price]) => `${clubs} clubs: £${(price / 100).toFixed(2)}`)
      .join(', ')
  );
  console.log('🔧 Available shaft brands:', shaftService.getAvailableBrands().join(', '));
  console.groupEnd();

  console.log('🐛 Debug: window.golfConfiguratorState available');
  console.log('🐛 Debug: Access current state via window.golfConfiguratorState');
}
