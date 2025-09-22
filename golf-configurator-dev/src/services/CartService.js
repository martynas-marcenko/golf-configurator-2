/**
 * Cart Service
 * Handles adding golf configurations to cart following DRY architecture
 */

import * as productService from './ProductService.js';
import * as shaftService from './ShaftService.js';
import { getParentVariantIdFromThemeSettings } from '../utils/dataAttributes.js';
import { validateCompleteConfiguration } from '../utils/validation.js';
import { Logger } from '../utils/persistence.js';
import { getCurrentHand } from '../store/golfStore.js';
import APP_CONFIG from '../config/app.js';

// ================================
// CART ITEM BUILDERS
// ================================

/**
 * Builds iron set cart item
 * @param {Object} config - Golf configuration
 * @param {string} bundleId - Unique bundle identifier
 * @param {Object} ironVariant - Iron set variant from product service
 * @param {string} parentVariantId - Parent variant ID from theme settings
 * @returns {Object} Cart item for iron set
 */
function buildIronCartItem(config, bundleId, ironVariant, parentVariantId) {
  const currentHand = getCurrentHand(); // Get hand from metafields instead of config

  return {
    id: ironVariant.id,
    quantity: 1,
    properties: {
      bundleId,
      parentVariantId,
      component_type: 'main', // Set componentType for consistency
      hand: currentHand,
      setSize: config.ironSetType,
      club_list: JSON.stringify(config.selectedClubs.map(club => club.id)), // Use underscore for cart transformer
      // Bundle identification
      _bundle_type: 'golf_configurator',
      _bundle_component: 'iron_set',
      _bundle_summary: `${config.ironSetType} Iron Set (${config.selectedClubs.length} clubs)`,
      ...(config.selectedGrip && {
        grip: `${config.selectedGrip.brand} ${config.selectedGrip.size}`,
      }),
      lie: config.selectedLie,
      // Note: Shaft info for reference only - actual shaft product added separately
      ...(config.selectedShaftBrand && {
        shaft_brand: config.selectedShaftBrand, // Use underscore for cart transformer
        shaftFlex: config.selectedShaftFlex,
        shaftLength: config.selectedShaftLength,
      }),
    },
  };
}

/**
 * Builds shaft cart item for selected shaft product
 * @param {Object} config - Golf configuration
 * @param {string} bundleId - Unique bundle identifier
 * @returns {Promise<Object|null>} Cart item for shaft product or null if no shaft selected
 */
async function buildShaftCartItem(config, bundleId, parentVariantId) {
  // Check if shaft is properly configured
  if (!config.selectedShaftBrand || !config.selectedShaftFlex) {
    return null;
  }

  try {
    // Load shaft options for the selected brand
    const shaftOptions = await shaftService.loadShaftOptions(config.selectedShaftBrand);

    // Find the variant that matches the selected flex
    const matchingShaft = shaftOptions.find(option =>
      option.title === config.selectedShaftFlex ||
      option.option1 === config.selectedShaftFlex
    );

    if (!matchingShaft) {
      Logger.error(`No shaft variant found for brand "${config.selectedShaftBrand}" with flex "${config.selectedShaftFlex}"`);
      return null;
    }

    const clubCount = config.selectedClubs.length;

    return {
      id: matchingShaft.id,
      quantity: clubCount,
      properties: {
        bundleId,
        parentVariantId, // Add bundle metadata for consistency
        component_type: 'shaft', // Use underscore for cart transformer
        hand: getCurrentHand(), // Add bundle metadata for consistency
        setSize: config.ironSetType, // Add bundle metadata for consistency
        club_list: JSON.stringify(config.selectedClubs.map(club => club.id)), // Add bundle metadata for consistency
        // Bundle identification
        _bundle_type: 'golf_configurator',
        _bundle_component: 'shaft',
        _bundle_summary: `${config.selectedShaftBrand} ${config.selectedShaftFlex} Shaft (${clubCount} clubs)`,
        // Shaft details
        shaft_brand: config.selectedShaftBrand, // Use underscore for cart transformer
        shaftFlex: config.selectedShaftFlex,
        shaftLength: config.selectedShaftLength,
        club_count: clubCount.toString(), // Use underscore for cart transformer
        shaftTitle: matchingShaft.displayName || matchingShaft.title,
      },
    };
  } catch (error) {
    Logger.error('Failed to build shaft cart item', error);
    return null;
  }
}

// ================================
// CART OPERATIONS
// ================================

/**
 * Adds golf configuration to cart
 * @param {Object} golfConfig - Complete golf configuration
 * @returns {Promise<boolean>} Success status
 */
export async function addGolfConfigurationToCart(golfConfig) {
  // Validate complete configuration
  const validation = validateCompleteConfiguration(golfConfig);
  if (!validation.valid) {
    throw new Error(`Cannot add to cart: ${validation.reason}`);
  }

  try {
    // Find iron variant for selected configuration
    const currentHand = getCurrentHand(); // Get hand from metafields
    const ironVariant = await productService.findVariantBySetSize(
      golfConfig.ironSetType,
      currentHand
    );

    if (!ironVariant) {
      throw new Error('Iron variant not found for selected configuration');
    }

    // Generate unique bundle ID and get parent variant
    const bundleId = `golf-${Date.now()}`;
    const parentVariantId = await getParentVariantIdFromThemeSettings(
      golfConfig.ironSetType,
      currentHand
    );

    // Build cart items
    const cartItems = [];

    // Add iron set item
    const ironItem = buildIronCartItem(
      golfConfig,
      bundleId,
      ironVariant,
      parentVariantId
    );
    cartItems.push(ironItem);

    // Add shaft item as separate product
    const shaftItem = await buildShaftCartItem(golfConfig, bundleId, parentVariantId);
    if (shaftItem) {
      cartItems.push(shaftItem);
    }

    const cartData = { items: cartItems };

    // Send to cart API
    if (APP_CONFIG.DATA.useRealData) {
      return await addToShopifyCart(cartData);
    } else {
      return await mockAddToCart(cartData);
    }
  } catch (error) {
    Logger.error('Failed to add golf configuration to cart', error);
    throw error;
  }
}

/**
 * Adds items to real Shopify cart
 * @param {Object} cartData - Cart data with items array
 * @returns {Promise<boolean>} Success status
 */
async function addToShopifyCart(cartData) {
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
    Logger.info('Added to Shopify cart successfully', result);
    return true;
  } else {
    const errorData = await response.json();
    const errorMessage = errorData.message || errorData.description || 'Failed to add to cart';
    throw new Error(errorMessage);
  }
}

/**
 * Mock cart addition for development
 * @param {Object} cartData - Cart data with items array
 * @returns {Promise<boolean>} Success status
 */
async function mockAddToCart(cartData) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, APP_CONFIG.DATA.mockApiDelay));

  Logger.info('🧪 Mock: Added to cart successfully', cartData);
  return true;
}

// ================================
// CART UTILITIES
// ================================

/**
 * Generates a unique bundle ID for grouping related cart items
 * @returns {string} Unique bundle ID
 */
export function generateBundleId() {
  return `golf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats cart item properties for display
 * @param {Object} properties - Cart item properties
 * @returns {Array} Formatted property entries
 */
export function formatCartItemProperties(properties) {
  const formatted = [];

  if (properties.hand) {
    formatted.push({ key: 'Hand', value: properties.hand });
  }

  if (properties.setSize) {
    formatted.push({ key: 'Set Type', value: properties.setSize });
  }

  if (properties.clubList) {
    const clubs = JSON.parse(properties.clubList);
    formatted.push({ key: 'Clubs', value: clubs.join(', ') });
  }

  if (properties.grip) {
    formatted.push({ key: 'Grip', value: properties.grip });
  }

  if (properties.lie) {
    formatted.push({ key: 'Lie', value: properties.lie });
  }

  return formatted;
}