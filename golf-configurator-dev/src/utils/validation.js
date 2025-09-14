/**
 * Golf Configurator Validation Utilities
 * Business logic validation functions following DRY architecture
 */

import APP_CONFIG from '../config/app.js';
import { Logger } from './persistence.js';

// ================================
// CLUB SELECTION VALIDATION
// ================================

/**
 * Validates club selection against business rules
 * @param {Array} clubs - Selected clubs array
 * @returns {Object} Validation result { valid: boolean, reason?: string }
 */
export function validateClubSelection(clubs) {
  const clubIds = clubs.map(c => c.id);

  // Check minimum clubs
  if (clubs.length < APP_CONFIG.BUSINESS.minClubCount) {
    return {
      valid: false,
      reason: `Minimum ${APP_CONFIG.BUSINESS.minClubCount} clubs required`
    };
  }

  // Check maximum clubs
  if (clubs.length > APP_CONFIG.BUSINESS.maxClubCount) {
    return {
      valid: false,
      reason: `Maximum ${APP_CONFIG.BUSINESS.maxClubCount} clubs allowed`
    };
  }

  // Check required clubs
  for (const requiredId of APP_CONFIG.BUSINESS.requiredClubs) {
    if (!clubIds.includes(requiredId)) {
      return {
        valid: false,
        reason: `Required club ${requiredId} missing`
      };
    }
  }

  // Business rule: 4-iron requires 5-iron
  if (clubIds.includes('4') && !clubIds.includes('5')) {
    return {
      valid: false,
      reason: 'Selecting 4-iron requires 5-iron'
    };
  }

  return { valid: true };
}

// ================================
// SHAFT VALIDATION
// ================================

/**
 * Validates shaft configuration is complete
 * @param {string} brand - Selected shaft brand
 * @param {string} flex - Selected shaft flex
 * @param {string} length - Selected shaft length
 * @returns {Object} Validation result
 */
export function validateShaftConfiguration(brand, flex, length) {
  if (!brand) {
    return { valid: false, reason: 'Shaft brand required' };
  }

  if (!flex) {
    return { valid: false, reason: 'Shaft flex required' };
  }

  if (!length) {
    return { valid: false, reason: 'Shaft length required' };
  }

  return { valid: true };
}

// ================================
// GRIP VALIDATION
// ================================

/**
 * Validates grip configuration is complete
 * @param {Object} grip - Grip configuration { brand, model, size }
 * @returns {Object} Validation result
 */
export function validateGripConfiguration(grip) {
  if (!grip?.brand) {
    return { valid: false, reason: 'Grip brand required' };
  }

  if (!grip?.model) {
    return { valid: false, reason: 'Grip model required' };
  }

  if (!grip?.size) {
    return { valid: false, reason: 'Grip size required' };
  }

  return { valid: true };
}

// ================================
// COMPLETE CONFIGURATION VALIDATION
// ================================

/**
 * Validates entire golf configuration is ready for cart
 * @param {Object} config - Complete configuration object
 * @returns {Object} Validation result
 */
export function validateCompleteConfiguration(config) {
  const {
    selectedHand,
    selectedClubs,
    selectedShaftBrand,
    selectedShaftFlex,
    selectedShaftLength,
    selectedGrip
  } = config;

  // Hand selection
  if (!selectedHand) {
    return { valid: false, reason: 'Hand selection required' };
  }

  // Club validation
  const clubValidation = validateClubSelection(selectedClubs);
  if (!clubValidation.valid) {
    return clubValidation;
  }

  // Shaft validation
  const shaftValidation = validateShaftConfiguration(
    selectedShaftBrand,
    selectedShaftFlex,
    selectedShaftLength
  );
  if (!shaftValidation.valid) {
    return shaftValidation;
  }

  // Grip validation
  const gripValidation = validateGripConfiguration(selectedGrip);
  if (!gripValidation.valid) {
    return gripValidation;
  }

  return { valid: true };
}

// ================================
// SAFE ACTION WRAPPER
// ================================

/**
 * Wraps actions with error handling and logging
 * @param {string} actionName - Name of the action for logging
 * @param {Function} actionFn - Action function to wrap
 * @returns {Function} Wrapped action function
 */
export function safeAction(actionName, actionFn) {
  return async (...args) => {
    try {
      Logger.debug(`ACTION: ${actionName}`);
      const result = await actionFn(...args);
      return result;
    } catch (err) {
      Logger.error(`ACTION: ${actionName} failed`, err);
      throw new Error(err.message || `${actionName} failed`);
    }
  };
}

// ================================
// CLUB LOGIC UTILITIES
// ================================

/**
 * Auto-adds required clubs based on business rules
 * @param {Array} currentSelection - Currently selected clubs
 * @param {Object} newClub - Club being added
 * @param {Array} availableClubs - All available clubs
 * @returns {Array} Updated club selection
 */
export function applyClubSelectionRules(currentSelection, newClub, availableClubs) {
  let newSelection = [...currentSelection, newClub];

  // 4-iron rule: auto-add 5-iron if not present
  if (newClub.id === '4') {
    const has5Iron = newSelection.some(c => c.id === '5');
    if (!has5Iron) {
      const ironClub5 = availableClubs.find(c => c.id === '5');
      if (ironClub5) {
        newSelection.push(ironClub5);
        Logger.info('Auto-added 5-iron (required with 4-iron)');
      }
    }
  }

  return newSelection;
}