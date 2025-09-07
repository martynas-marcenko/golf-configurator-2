import { signal, computed } from '@preact/signals';
import { ProductService } from '../services/ProductService.js';
import { ShaftService } from '../services/ShaftService.js';
import { MockProductService } from '../services/MockProductService.js';
import { MockShaftService } from '../services/MockShaftService.js';
import { PriceFormatter } from '../utils/formatters.js';

// Detect development environment
// Data source configuration - set to true to use real Shopify data locally
const USE_REAL_DATA = true; // Toggle this to switch between mock and real data

const isDevelopment = import.meta.env.DEV;

/**
 * Golf configurator state management using Preact signals
 * Mirrors the exact functionality from golf-configurator-simple.js
 */

// Core state signals
export const selectedHand = signal(null);
export const selectedClubs = signal([
  { id: '4', name: '4-Iron', type: 'iron', isRequired: false, isOptional: true },
  { id: '5', name: '5-Iron', type: 'iron', isRequired: false, isOptional: true },
  { id: '6', name: '6-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '7', name: '7-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '8', name: '8-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '9', name: '9-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: 'PW', name: 'Pitching Wedge', type: 'wedge', isRequired: true, isOptional: false },
]); // Start with all clubs pre-selected
export const selectedShafts = signal({});
export const isLoading = signal(false);
export const error = signal(null);

// Service instances - use real data if USE_REAL_DATA is true OR in production
const useRealData = USE_REAL_DATA || !isDevelopment;
export const productService = useRealData ? new ProductService() : new MockProductService();
export const shaftService = useRealData ? new ShaftService() : new MockShaftService();
export const priceFormatter = new PriceFormatter();

// Available options
export const handOptions = signal([
  { id: 'left', name: 'Left Hand' },
  { id: 'right', name: 'Right Hand' },
]);

// Computed iron set type based on selected clubs
export const ironSetType = computed(() => {
  const clubIds = selectedClubs.value.map((club) => club.id);
  if (clubIds.includes('4')) return '4-PW';
  if (clubIds.includes('5')) return '5-PW';
  return '6-PW';
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
  return selectedHand.value && selectedClubs.value.length >= 5; // Minimum 5 clubs required
});

// Actions matching vanilla JS functionality
export const actions = {
  setHand(hand) {
    console.log(`🤝 Setting hand to: ${hand}`);
    selectedHand.value = hand;
  },

  // Removed setSetSize - clubs are managed directly through toggleClub

  toggleClub(club) {
    const currentlySelected = selectedClubs.value;
    const isSelected = currentlySelected.some((c) => c.id === club.id);

    if (isSelected) {
      // Prevent removing if it would go below minimum
      if (currentlySelected.length <= 5 && !club.isOptional) {
        console.log('⚠️ Cannot remove required club - minimum 5 clubs needed');
        return false;
      }

      selectedClubs.value = currentlySelected.filter((c) => c.id !== club.id);
      console.log(`➖ Removed club: ${club.name}`);
    } else {
      selectedClubs.value = [...currentlySelected, club];
      console.log(`➕ Added club: ${club.name}`);
    }

    return true;
  },

  selectShaft(clubId, shaftId) {
    console.log(`🔧 Setting shaft for ${clubId}: ${shaftId}`);
    selectedShafts.value = {
      ...selectedShafts.value,
      [clubId]: shaftId,
    };
  },

  async loadShaftOptions(brandName) {
    console.log(`🚀 Loading shaft options for brand: ${brandName}`);
    isLoading.value = true;
    error.value = null;

    try {
      const options = await shaftService.loadShaftDataForBrand(brandName);
      console.log(`✅ Loaded ${options.length} shaft options`);
      return options;
    } catch (err) {
      console.error('❌ Failed to load shaft options:', err);
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
      const productInfo = productService.clubHeadProducts[setType];
      if (!productInfo) {
        throw new Error('Product information not available!');
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

      // Prepare cart add data - Real Product Approach (like vanilla)
      const cartItems = [
        {
          id: ironVariant.id, // Use actual iron variant ID
          quantity: 1,
          properties: {
            bundleId: bundleId, // Use generated bundle ID
            hand: selectedHand.value,
            setSize: ironSetType.value,
            club_list: JSON.stringify(selectedClubs.value.map((club) => club.id)),
            // Add shaft properties if selected
            ...(selectedShafts.value &&
              Object.keys(selectedShafts.value).length > 0 && {
                shaft_variant_id: Object.values(selectedShafts.value)[0],
                shaft_name: 'Selected Shaft',
              }),
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
            component_type: 'shaft',
            shaft_brand: 'Selected Shaft',
            club_count: clubCount.toString(),
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
    // Reset to all clubs pre-selected
    selectedClubs.value = [
      { id: '4', name: '4-Iron', type: 'iron', isRequired: false, isOptional: true },
      { id: '5', name: '5-Iron', type: 'iron', isRequired: false, isOptional: true },
      { id: '6', name: '6-Iron', type: 'iron', isRequired: true, isOptional: false },
      { id: '7', name: '7-Iron', type: 'iron', isRequired: true, isOptional: false },
      { id: '8', name: '8-Iron', type: 'iron', isRequired: true, isOptional: false },
      { id: '9', name: '9-Iron', type: 'iron', isRequired: true, isOptional: false },
      { id: 'PW', name: 'Pitching Wedge', type: 'wedge', isRequired: true, isOptional: false },
    ];
    selectedShafts.value = {};
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
    isLoading,
    error,
    actions,
  };

  console.log('🏌️ Golf Configurator State initialized with Preact signals');
  console.log('🐛 Debug: window.golfConfiguratorState available');
}
