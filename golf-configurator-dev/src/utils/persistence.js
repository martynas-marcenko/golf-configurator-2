/**
 * Modern State Persistence Utility
 * Handles localStorage with proper error handling, validation, and TypeScript support
 */

import { DEFAULT_STATE_VALUES } from '../constants/defaults.js';

const STORAGE_KEY = 'golf-configurator-state';
const STORAGE_VERSION = '1.0.0';

/**
 * State shape definition for validation and serialization
 */
const DEFAULT_STATE = {
  ...DEFAULT_STATE_VALUES,
  version: STORAGE_VERSION,
  timestamp: Date.now()
};

/**
 * Validates state structure to prevent corruption
 */
function validateState(state) {
  if (!state || typeof state !== 'object') return false;

  // Check required fields exist
  const requiredFields = [
    'selectedHand', 'selectedClubs', 'selectedShafts', 'selectedGrip', 'selectedLie',
    'selectedShaftBrand', 'selectedShaftFlex', 'selectedShaftLength'
  ];
  for (const field of requiredFields) {
    if (!(field in state)) return false;
  }

  // Validate selectedClubs is array
  if (!Array.isArray(state.selectedClubs)) return false;

  // Validate selectedShafts is object
  if (typeof state.selectedShafts !== 'object') return false;

  return true;
}

/**
 * Safe localStorage operations with error handling
 */
class PersistenceManager {
  /**
   * Load state from localStorage with validation
   */
  static loadState() {
    try {
      if (typeof window === 'undefined') return DEFAULT_STATE;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_STATE;

      const parsed = JSON.parse(stored);

      // Validate state structure
      if (!validateState(parsed)) {
        console.warn('🔧 PERSISTENCE: Invalid state structure, using defaults');
        return DEFAULT_STATE;
      }

      // Check version compatibility
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('🔧 PERSISTENCE: Version mismatch, migrating to latest');
        return { ...DEFAULT_STATE, ...parsed, version: STORAGE_VERSION };
      }

      console.log('✅ PERSISTENCE: State loaded from localStorage');
      return parsed;

    } catch (error) {
      console.error('❌ PERSISTENCE: Failed to load state', error);
      return DEFAULT_STATE;
    }
  }

  /**
   * Save state to localStorage with error handling
   */
  static saveState(state) {
    try {
      if (typeof window === 'undefined') return false;

      // Add metadata
      const stateWithMeta = {
        ...state,
        version: STORAGE_VERSION,
        timestamp: Date.now()
      };

      // Validate before saving
      if (!validateState(stateWithMeta)) {
        console.error('❌ PERSISTENCE: Invalid state, not saving');
        return false;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithMeta));
      return true;

    } catch (error) {
      console.error('❌ PERSISTENCE: Failed to save state', error);
      return false;
    }
  }

  /**
   * Clear all persisted state
   */
  static clearState() {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(STORAGE_KEY);
      console.log('🧹 PERSISTENCE: State cleared');
    } catch (error) {
      console.error('❌ PERSISTENCE: Failed to clear state', error);
    }
  }

  /**
   * Get state metadata
   */
  static getStateInfo() {
    try {
      if (typeof window === 'undefined') return null;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        version: parsed.version,
        timestamp: parsed.timestamp,
        age: Date.now() - (parsed.timestamp || 0)
      };
    } catch {
      return null;
    }
  }
}

/**
 * Reactive persistence hook for Preact signals
 * Automatically persists state changes with debouncing
 */
export function createPersistedSignal(initialValue) {
  // Note: This would require proper signal integration in the calling code
  // For now, this is a placeholder for future enhancement
  return { value: initialValue };
}

/**
 * Logger with environment-based controls
 */
export class Logger {
  static isEnabled = import.meta.env.DEV;
  static level = import.meta.env.VITE_LOG_LEVEL || 'info';

  static info(message, ...args) {
    if (!this.isEnabled) return;
    console.log(`ℹ️ ${message}`, ...args);
  }

  static warn(message, ...args) {
    if (!this.isEnabled) return;
    console.warn(`⚠️ ${message}`, ...args);
  }

  static error(message, ...args) {
    console.error(`❌ ${message}`, ...args);
  }

  static debug(message, ...args) {
    if (!this.isEnabled || this.level !== 'debug') return;
    console.debug(`🐛 ${message}`, ...args);
  }
}

export { PersistenceManager, DEFAULT_STATE, STORAGE_KEY };