/**
 * Cart Service
 * Handles adding golf configurations to cart following DRY architecture
 */

import * as productService from './ProductService.js';
import { getParentVariantIdFromThemeSettings } from '../utils/dataAttributes.js';
import { validateCompleteConfiguration } from '../utils/validation.js';
import { Logger } from '../utils/persistence.js';
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
  return {
    id: ironVariant.id,
    quantity: 1,
    properties: {
      bundleId,
      parentVariantId,
      hand: config.selectedHand,
      setSize: config.ironSetType,
      clubList: JSON.stringify(config.selectedClubs.map(club => club.id)),
      ...(config.selectedGrip && {
        grip: `${config.selectedGrip.brand} ${config.selectedGrip.size}`,
      }),
      lie: config.selectedLie,
      // Shaft info (if available from legacy selectedShafts)
      ...(config.selectedShafts && Object.keys(config.selectedShafts).length > 0 && {
        shaft_variant_id: Object.values(config.selectedShafts)[0],
        shaftName: 'Selected Shaft',
      }),
    },
  };
}

/**
 * Builds shaft cart item (if using legacy shaft selection)
 * @param {Object} config - Golf configuration
 * @param {string} bundleId - Unique bundle identifier
 * @returns {Object|null} Cart item for shaft or null if no shaft
 */
function buildShaftCartItem(config, bundleId) {
  if (!config.selectedShafts || Object.keys(config.selectedShafts).length === 0) {
    return null;
  }

  const shaftVariantId = Object.values(config.selectedShafts)[0];
  const clubCount = config.selectedClubs.length;

  return {
    id: shaftVariantId,
    quantity: clubCount,
    properties: {
      bundleId,
      componentType: 'shaft',
      shaftBrand: 'Selected Shaft',
      clubCount: clubCount.toString(),
    },
  };
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
    const ironVariant = await productService.findVariantBySetSize(
      golfConfig.ironSetType,
      golfConfig.selectedHand
    );

    if (!ironVariant) {
      throw new Error('Iron variant not found for selected configuration');
    }

    // Generate unique bundle ID and get parent variant
    const bundleId = `golf-${Date.now()}`;
    const parentVariantId = await getParentVariantIdFromThemeSettings();

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

    // Add shaft item if using legacy shaft system
    const shaftItem = buildShaftCartItem(golfConfig, bundleId);
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