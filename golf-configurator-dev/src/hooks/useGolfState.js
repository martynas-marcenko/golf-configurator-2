/**
 * Golf Configurator State Management
 * Modern architecture with persistence and clean separation of concerns
 */

import { signal, computed, effect } from '@preact/signals';
import * as productService from '../services/ProductService.js';
import * as shaftService from '../services/ShaftService.js';
import { getParentVariantIdFromThemeSettings } from '../utils/dataAttributes.js';
import { PersistenceManager, Logger } from '../utils/persistence.js';
import { DEFAULT_STATE_VALUES, DEFAULT_CLUBS, HAND_OPTIONS, AVAILABLE_CLUBS } from '../constants/defaults.js';
import APP_CONFIG from '../config/app.js';

// ================================
// STATE INITIALIZATION WITH PERSISTENCE
// ================================

function getInitialState() {
  if (!APP_CONFIG.PERSISTENCE.enabled) {
    return {
      ...DEFAULT_STATE_VALUES,
      selectedLie: APP_CONFIG.BUSINESS.defaultLie,
    };
  }

  return PersistenceManager.loadState();
}

const initialState = getInitialState();

// ================================
// CORE STATE SIGNALS
// ================================

export const selectedHand = signal(initialState.selectedHand);
export const selectedClubs = signal([...initialState.selectedClubs]);
export const selectedShafts = signal({ ...initialState.selectedShafts }); // Legacy - will be replaced
export const selectedGrip = signal(initialState.selectedGrip);
export const selectedLie = signal(initialState.selectedLie);

// New shaft signals - clean direct approach
export const selectedShaftBrand = signal(initialState.selectedShaftBrand || '');
export const selectedShaftFlex = signal(initialState.selectedShaftFlex || '');
export const selectedShaftLength = signal(initialState.selectedShaftLength || 'Standard');

export const isLoading = signal(false);
export const error = signal(null);

// Static data
export const handOptions = signal([...HAND_OPTIONS]);
export const availableClubs = signal([...AVAILABLE_CLUBS]);

// ================================
// COMPUTED VALUES
// ================================

export const ironSetType = computed(() => {
  const clubIds = selectedClubs.value.map((club) => club.id);
  const clubCount = clubIds.length;

  if (clubCount === 1) return 'Iron';
  if (clubIds.includes('4')) return '4-PW';
  if (clubIds.includes('5')) return '5-PW';
  return '6-PW';
});


export const canAddToCart = computed(() => {
  return (
    selectedHand.value &&
    selectedClubs.value.length >= APP_CONFIG.BUSINESS.minClubCount &&
    selectedGrip.value?.brand &&
    selectedGrip.value?.model &&
    selectedGrip.value?.size
  );
});


// ================================
// PERSISTENCE EFFECT
// ================================

let persistenceTimeout;

function persistState() {
  if (!APP_CONFIG.PERSISTENCE.enabled) return;

  clearTimeout(persistenceTimeout);
  persistenceTimeout = setTimeout(() => {
    const currentState = {
      selectedHand: selectedHand.value,
      selectedClubs: selectedClubs.value,
      selectedShafts: selectedShafts.value,
      selectedGrip: selectedGrip.value,
      selectedLie: selectedLie.value,
      // New shaft fields
      selectedShaftBrand: selectedShaftBrand.value,
      selectedShaftFlex: selectedShaftFlex.value,
      selectedShaftLength: selectedShaftLength.value,
    };

    PersistenceManager.saveState(currentState);
  }, APP_CONFIG.PERSISTENCE.debounceMs);
}

if (APP_CONFIG.PERSISTENCE.enabled) {
  effect(() => {
    selectedHand.value;
    selectedClubs.value;
    selectedShafts.value;
    selectedGrip.value;
    selectedLie.value;
    // New shaft signals
    selectedShaftBrand.value;
    selectedShaftFlex.value;
    selectedShaftLength.value;
    persistState();
  });
}

// ================================
// VALIDATION HELPERS
// ================================

function validateClubSelection(clubs) {
  const clubIds = clubs.map(c => c.id);

  if (clubs.length < APP_CONFIG.BUSINESS.minClubCount) {
    return { valid: false, reason: `Minimum ${APP_CONFIG.BUSINESS.minClubCount} clubs required` };
  }

  if (clubs.length > APP_CONFIG.BUSINESS.maxClubCount) {
    return { valid: false, reason: `Maximum ${APP_CONFIG.BUSINESS.maxClubCount} clubs allowed` };
  }

  for (const requiredId of APP_CONFIG.BUSINESS.requiredClubs) {
    if (!clubIds.includes(requiredId)) {
      return { valid: false, reason: `Required club ${requiredId} missing` };
    }
  }

  if (clubIds.includes('4') && !clubIds.includes('5')) {
    return { valid: false, reason: 'Selecting 4-iron requires 5-iron' };
  }

  return { valid: true };
}

function safeAction(actionName, actionFn) {
  return async (...args) => {
    try {
      Logger.debug(`ACTION: ${actionName}`);
      const result = await actionFn(...args);
      return result;
    } catch (err) {
      Logger.error(`ACTION: ${actionName} failed`, err);
      error.value = err.message || `${actionName} failed`;
      return false;
    }
  };
}

// ================================
// ACTIONS
// ================================

export const actions = {
  setHand: safeAction('setHand', (hand) => {
    if (!hand) throw new Error('Invalid hand selection');
    Logger.info(`Hand: ${selectedHand.value || 'None'} → ${hand}`);
    selectedHand.value = hand;
    error.value = null;
    return true;
  }),

  toggleClub: safeAction('toggleClub', (club) => {
    if (!club?.id) throw new Error('Invalid club object');

    const currentlySelected = selectedClubs.value;
    const isSelected = currentlySelected.some((c) => c.id === club.id);

    let newSelection;
    if (isSelected) {
      newSelection = currentlySelected.filter((c) => c.id !== club.id);
    } else {
      newSelection = [...currentlySelected, club];

      // 4-iron rule: auto-add 5-iron if not present
      if (club.id === '4') {
        const has5Iron = newSelection.some(c => c.id === '5');
        if (!has5Iron) {
          const ironClub5 = availableClubs.value.find(c => c.id === '5');
          if (ironClub5) newSelection.push(ironClub5);
        }
      }
    }

    const validation = validateClubSelection(newSelection);
    if (!validation.valid) {
      Logger.warn(`Club selection blocked: ${validation.reason}`);
      error.value = validation.reason;
      return false;
    }

    selectedClubs.value = newSelection;
    error.value = null;
    Logger.info(`Clubs: [${newSelection.map(c => c.id).join(', ')}] (${newSelection.length})`);
    return true;
  }),

  selectShaft: safeAction('selectShaft', (clubId, shaftId) => {
    if (!clubId || !shaftId) throw new Error('Club ID and shaft ID required');

    selectedShafts.value = {
      ...selectedShafts.value,
      [clubId]: shaftId,
    };
    return true;
  }),

  setGrip: safeAction('setGrip', (brand, model, size) => {
    if (!brand) throw new Error('Grip brand required');

    selectedGrip.value = { brand, model: model || '', size: size || '' };
    return true;
  }),

  setLie: safeAction('setLie', (lie) => {
    if (!lie) throw new Error('Lie adjustment required');

    selectedLie.value = lie;
    return true;
  }),

  // New clean shaft actions - direct signal updates
  setShaftBrand: safeAction('setShaftBrand', async (brand) => {
    if (!brand) throw new Error('Shaft brand required');

    Logger.info(`Shaft brand: ${selectedShaftBrand.value || 'None'} → ${brand}`);
    selectedShaftBrand.value = brand;
    selectedShaftFlex.value = ''; // Reset flex when brand changes
    error.value = null;
    return true;
  }),

  setShaftFlex: safeAction('setShaftFlex', (flex) => {
    if (!flex) throw new Error('Shaft flex required');

    Logger.info(`Shaft flex: ${selectedShaftFlex.value || 'None'} → ${flex}`);
    selectedShaftFlex.value = flex;
    error.value = null;
    return true;
  }),

  setShaftLength: safeAction('setShaftLength', (length) => {
    if (!length) throw new Error('Shaft length required');

    Logger.info(`Shaft length: ${selectedShaftLength.value || 'None'} → ${length}`);
    selectedShaftLength.value = length;
    error.value = null;
    return true;
  }),

  loadShaftOptions: safeAction('loadShaftOptions', async (brandName) => {
    if (!brandName) throw new Error('Brand name required');

    isLoading.value = true;
    error.value = null;

    try {
      const options = await shaftService.loadShaftOptions(brandName);
      Logger.info(`Loaded ${options.length} shaft options for ${brandName}`);
      return options;
    } finally {
      isLoading.value = false;
    }
  }),

  addToCart: safeAction('addToCart', async () => {
    if (!canAddToCart.value) {
      throw new Error('Cannot add to cart - missing required selections');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const setType = ironSetType.value;
      const ironVariant = await productService.findVariantBySetSize(setType, selectedHand.value);

      if (!ironVariant) {
        throw new Error('Iron variant not found for selected configuration');
      }

      const bundleId = `golf-${Date.now()}`;
      const parentVariantId = await getParentVariantIdFromThemeSettings();

      const cartItems = [{
        id: ironVariant.id,
        quantity: 1,
        properties: {
          bundleId,
          parentVariantId,
          hand: selectedHand.value,
          setSize: ironSetType.value,
          clubList: JSON.stringify(selectedClubs.value.map((club) => club.id)),
          ...(selectedShafts.value && Object.keys(selectedShafts.value).length > 0 && {
            shaft_variant_id: Object.values(selectedShafts.value)[0],
            shaftName: 'Selected Shaft',
          }),
          ...(selectedGrip.value && {
            grip: `${selectedGrip.value.brand} ${selectedGrip.value.size}`,
          }),
          lie: selectedLie.value,
        },
      }];

      if (selectedShafts.value && Object.keys(selectedShafts.value).length > 0) {
        const shaftVariantId = Object.values(selectedShafts.value)[0];
        const clubCount = selectedClubs.value.length;

        cartItems.push({
          id: shaftVariantId,
          quantity: clubCount,
          properties: {
            bundleId,
            componentType: 'shaft',
            shaftBrand: 'Selected Shaft',
            clubCount: clubCount.toString(),
          },
        });
      }

      const cartData = { items: cartItems };

      if (APP_CONFIG.DATA.useRealData) {
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
          Logger.info('Added to cart successfully', result);
          return true;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.description || 'Failed to add to cart');
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, APP_CONFIG.DATA.mockApiDelay));
        Logger.info('Mock: Added to cart successfully');
        return true;
      }
    } finally {
      isLoading.value = false;
    }
  }),

  reset: safeAction('reset', () => {
    selectedHand.value = DEFAULT_STATE_VALUES.selectedHand;
    selectedClubs.value = [...DEFAULT_CLUBS];
    selectedShafts.value = {...DEFAULT_STATE_VALUES.selectedShafts};
    selectedGrip.value = DEFAULT_STATE_VALUES.selectedGrip;
    selectedLie.value = APP_CONFIG.BUSINESS.defaultLie;
    selectedShaftBrand.value = DEFAULT_STATE_VALUES.selectedShaftBrand;
    selectedShaftFlex.value = DEFAULT_STATE_VALUES.selectedShaftFlex;
    selectedShaftLength.value = DEFAULT_STATE_VALUES.selectedShaftLength;
    error.value = null;
    return true;
  }),
};

// ================================
// UTILITIES
// ================================


export const USE_REAL_DATA = APP_CONFIG.DATA.useRealData;

// Export Logger for components
export { Logger };

// ================================
// INITIALIZATION
// ================================

if (typeof window !== 'undefined') {
  if (APP_CONFIG.FEATURES.stateDebug) {
    window.golfConfiguratorState = {
      // Core state
      selectedHand,
      selectedClubs,
      selectedShafts, // Legacy
      selectedGrip,
      selectedLie,

      // New shaft state
      selectedShaftBrand,
      selectedShaftFlex,
      selectedShaftLength,

      // Computed
      ironSetType,
      canAddToCart,

      // Actions
      actions,
    };
  }

  Logger.info('🏌️ Golf Configurator initialized');
  Logger.info(`🔧 Mode: ${APP_CONFIG.ENV.isDevelopment ? 'Development' : 'Production'}`);

  if (APP_CONFIG.PERSISTENCE.enabled) {
    Logger.info('💾 State persistence enabled');
  }
}