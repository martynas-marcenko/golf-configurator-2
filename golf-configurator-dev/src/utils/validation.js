/**
 * Golf Configurator Validation Utilities
 * Business logic validation functions following DRY architecture
 */

import APP_CONFIG from '../config/app.js';
import { Logger } from './persistence.js';
import { CLUB_BUSINESS_RULES, AVAILABLE_CLUBS, SHAFT_LEAD_TIMES } from '../constants/defaults.js';

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
// ================================
// CLUB BUSINESS LOGIC UTILITIES
// ================================

/**
 * Finds a club by iron number (handles PW mapping)
 * @param {string} clubNumber - Club number ('4', '5', '6', '7', '8', '9', 'P')
 * @param {Array} availableClubs - Available clubs array
 * @returns {Object|undefined} Found club object
 */
export function findClubByNumber(clubNumber, availableClubs = AVAILABLE_CLUBS) {
  return availableClubs.find(
    (c) => c.name.includes(clubNumber) || (clubNumber === 'P' && c.name.includes('PW'))
  );
}

/**
 * Checks if a club is currently selected
 * @param {string} clubNumber - Club number to check
 * @param {Array} selectedClubs - Currently selected clubs
 * @returns {boolean} Whether club is selected
 */
export function isClubSelected(clubNumber, selectedClubs) {
  return selectedClubs.some(
    (club) => club.name.includes(clubNumber) || (clubNumber === 'P' && club.name.includes('PW'))
  );
}

/**
 * Checks if a club is locked (required clubs cannot be deselected)
 * @param {string} clubNumber - Club number to check
 * @returns {boolean} Whether club is locked
 */
export function isClubLocked(clubNumber) {
  return CLUB_BUSINESS_RULES.locked.includes(clubNumber);
}

/**
 * Applies business rules when adding a club
 * @param {Array} currentSelection - Currently selected clubs
 * @param {Object} newClub - Club being added
 * @param {Array} availableClubs - All available clubs
 * @returns {Array} Updated club selection with dependencies
 */
export function applyClubSelectionRules(currentSelection, newClub, availableClubs) {
  let newSelection = [...currentSelection, newClub];

  // Apply dependency rules
  const dependencies = CLUB_BUSINESS_RULES.dependencies[newClub.id];
  if (dependencies) {
    dependencies.forEach(depId => {
      const hasDepClub = newSelection.some(c => c.id === depId);
      if (!hasDepClub) {
        const depClub = availableClubs.find(c => c.id === depId);
        if (depClub) {
          newSelection.push(depClub);
          Logger.info(`Auto-added ${depId}-iron (required with ${newClub.id}-iron)`);
        }
      }
    });
  }

  return newSelection;
}

/**
 * Handles complex club toggle logic with business rules
 * @param {string} clubNumber - Club number being toggled
 * @param {Array} currentSelection - Currently selected clubs
 * @param {Array} availableClubs - All available clubs
 * @returns {Object} Result with new selection and success status
 */
export function handleClubToggle(clubNumber, currentSelection, availableClubs = AVAILABLE_CLUBS) {
  // Don't allow deselecting locked clubs
  if (isClubLocked(clubNumber)) {
    return {
      success: false,
      newSelection: currentSelection,
      reason: `${clubNumber === 'P' ? 'PW' : clubNumber + '-iron'} is required and cannot be deselected`
    };
  }

  const club = findClubByNumber(clubNumber, availableClubs);
  if (!club) {
    return {
      success: false,
      newSelection: currentSelection,
      reason: `Club ${clubNumber} not found`
    };
  }

  const isCurrentlySelected = isClubSelected(clubNumber, currentSelection);

  if (clubNumber === '4') {
    if (!isCurrentlySelected) {
      // Selecting 4: apply dependency rules (auto-add 5)
      const newSelection = applyClubSelectionRules(currentSelection, club, availableClubs);
      return { success: true, newSelection };
    } else {
      // Deselecting 4: only deselect 4
      return {
        success: true,
        newSelection: currentSelection.filter(c => c.id !== club.id)
      };
    }
  } else if (clubNumber === '5') {
    if (!isCurrentlySelected) {
      // Selecting 5: just select 5
      return {
        success: true,
        newSelection: [...currentSelection, club]
      };
    } else {
      // Deselecting 5: must also deselect 4 if it's selected
      let newSelection = currentSelection.filter(c => c.id !== club.id);
      if (isClubSelected('4', currentSelection)) {
        newSelection = newSelection.filter(c => c.id !== '4');
        Logger.info('Auto-removed 4-iron (requires 5-iron)');
      }
      return { success: true, newSelection };
    }
  }

  // For other clubs, simple toggle
  if (isCurrentlySelected) {
    return {
      success: true,
      newSelection: currentSelection.filter(c => c.id !== club.id)
    };
  } else {
    return {
      success: true,
      newSelection: [...currentSelection, club]
    };
  }
}

/**
 * Gets maximum unlocked step based on current configuration
 * @param {Object} config - Current configuration state
 * @returns {number} Maximum step index that can be accessed
 */
export function getMaxUnlockedStep(config) {
  const { selectedHand, selectedClubs, selectedShaftBrand, selectedShaftFlex, selectedShaftLength, selectedGrip } = config;

  // Step 0 (Club): Always accessible
  let maxStep = 0;

  // Step 1 (Shaft): Unlocked when hand + minimum clubs selected
  if (selectedHand && selectedClubs.length >= APP_CONFIG.BUSINESS.minClubCount) {
    maxStep = 1;
  }

  // Step 2 (Grip): Unlocked when shaft is configured
  if (selectedShaftBrand && selectedShaftFlex && selectedShaftLength) {
    maxStep = 2;
  }

  // Step 3 (Review): Unlocked when grip is configured
  if (selectedGrip?.brand && selectedGrip?.model && selectedGrip?.size) {
    maxStep = 3;
  }

  return maxStep;
}

/**
 * Gets current lead time based on selected shaft brand
 * @param {string} selectedShaftBrand - Currently selected shaft brand
 * @returns {string} Lead time string (e.g. "2-4 weeks")
 */
export function getCurrentLeadTime(selectedShaftBrand) {
  const defaultLeadTime = '2 weeks';

  if (selectedShaftBrand && SHAFT_LEAD_TIMES[selectedShaftBrand]) {
    return SHAFT_LEAD_TIMES[selectedShaftBrand];
  }

  return SHAFT_LEAD_TIMES['KBS'] || defaultLeadTime;
}