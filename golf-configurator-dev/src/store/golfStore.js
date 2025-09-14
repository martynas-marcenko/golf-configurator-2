/**
 * Golf Configurator Store
 * Pure state management with Preact Signals following DRY architecture
 */

import { signal, computed } from '@preact/signals';
import { DEFAULT_STATE_VALUES, DEFAULT_CLUBS, HAND_OPTIONS, AVAILABLE_CLUBS } from '../constants/defaults.js';
import { PersistenceManager, Logger, setupStatePersistence } from '../utils/persistence.js';
import { safeAction, validateClubSelection, applyClubSelectionRules } from '../utils/validation.js';
import { addGolfConfigurationToCart } from '../services/CartService.js';
import * as shaftService from '../services/ShaftService.js';
import APP_CONFIG from '../config/app.js';

// ================================
// STATE INITIALIZATION
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
// CORE STATE SIGNALS - Single Source of Truth
// ================================

export const selectedHand = signal(initialState.selectedHand);
export const selectedClubs = signal([...initialState.selectedClubs]);
export const selectedGrip = signal(initialState.selectedGrip);
export const selectedLie = signal(initialState.selectedLie);

// Clean shaft state - no legacy duplicates
export const selectedShaftBrand = signal(initialState.selectedShaftBrand || '');
export const selectedShaftFlex = signal(initialState.selectedShaftFlex || '');
export const selectedShaftLength = signal(initialState.selectedShaftLength || 'Standard');

// UI state
export const isLoading = signal(false);
export const error = signal(null);

// Static data - imported from single source
export const handOptions = signal([...HAND_OPTIONS]);
export const availableClubs = signal([...AVAILABLE_CLUBS]);

// ================================
// COMPUTED VALUES - Derived State
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
// CORE ACTIONS - Pure State Updates with Validation
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
      // Apply business rules when adding club
      newSelection = applyClubSelectionRules(currentlySelected, club, availableClubs.value);
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

  setClubs: safeAction('setClubs', (clubs) => {
    if (!Array.isArray(clubs)) throw new Error('Invalid clubs selection');

    const validation = validateClubSelection(clubs);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    selectedClubs.value = [...clubs];
    error.value = null;
    Logger.info(`Clubs: [${clubs.map(c => c.id).join(', ')}] (${clubs.length})`);
    return true;
  }),

  setGrip: safeAction('setGrip', (brand, model, size) => {
    if (!brand) throw new Error('Grip brand required');
    selectedGrip.value = { brand, model: model || '', size: size || '' };
    error.value = null;
    return true;
  }),

  setLie: safeAction('setLie', (lie) => {
    if (!lie) throw new Error('Lie adjustment required');
    selectedLie.value = lie;
    error.value = null;
    return true;
  }),

  setShaftBrand: safeAction('setShaftBrand', (brand) => {
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
      const config = {
        ...getCurrentState(),
        ironSetType: ironSetType.value,
      };

      const success = await addGolfConfigurationToCart(config);
      Logger.info('Added to cart successfully');
      return success;
    } finally {
      isLoading.value = false;
    }
  }),

  setLoading(loading) {
    isLoading.value = !!loading;
  },

  setError(errorMessage) {
    error.value = errorMessage;
  },

  reset: safeAction('reset', () => {
    selectedHand.value = DEFAULT_STATE_VALUES.selectedHand;
    selectedClubs.value = [...DEFAULT_CLUBS];
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
// STATE UTILITIES
// ================================

export function getCurrentState() {
  return {
    selectedHand: selectedHand.value,
    selectedClubs: selectedClubs.value,
    selectedGrip: selectedGrip.value,
    selectedLie: selectedLie.value,
    selectedShaftBrand: selectedShaftBrand.value,
    selectedShaftFlex: selectedShaftFlex.value,
    selectedShaftLength: selectedShaftLength.value,
  };
}

// ================================
// INITIALIZATION
// ================================

if (typeof window !== 'undefined') {
  // Setup state persistence
  setupStatePersistence({
    selectedHand,
    selectedClubs,
    selectedGrip,
    selectedLie,
    selectedShaftBrand,
    selectedShaftFlex,
    selectedShaftLength,
  });

  if (APP_CONFIG.FEATURES.stateDebug) {
    window.golfConfiguratorState = {
      // Core state
      selectedHand,
      selectedClubs,
      selectedGrip,
      selectedLie,
      selectedShaftBrand,
      selectedShaftFlex,
      selectedShaftLength,
      // Computed
      ironSetType,
      canAddToCart,
      // Actions
      actions,
      // Utils
      getCurrentState,
    };
  }

  Logger.info('🏌️ Golf Store initialized');
  Logger.info(`🔧 Mode: ${APP_CONFIG.ENV.isDevelopment ? 'Development' : 'Production'}`);
}

// Export Logger for components
export { Logger };