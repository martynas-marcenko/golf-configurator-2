/**
 * Application Configuration
 * Environment-based configuration management
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const APP_CONFIG = {
  // Environment
  ENV: {
    isDevelopment,
    isProduction,
    isStaging: import.meta.env.VITE_APP_ENV === 'staging'
  },

  // Data Sources
  DATA: {
    useRealData: import.meta.env.VITE_USE_REAL_DATA === 'true' || isProduction,
    mockApiDelay: parseInt(import.meta.env.VITE_MOCK_DELAY || '500'),
  },

  // Logging
  LOGGING: {
    enabled: isDevelopment || import.meta.env.VITE_ENABLE_LOGS === 'true',
    level: import.meta.env.VITE_LOG_LEVEL || (isDevelopment ? 'debug' : 'error'),
    persistLogs: import.meta.env.VITE_PERSIST_LOGS === 'true'
  },

  // Persistence
  PERSISTENCE: {
    enabled: import.meta.env.VITE_DISABLE_PERSISTENCE !== 'true',
    debounceMs: parseInt(import.meta.env.VITE_PERSISTENCE_DEBOUNCE || '300'),
    maxAge: parseInt(import.meta.env.VITE_STATE_MAX_AGE || '604800000') // 7 days
  },

  // Feature Flags
  FEATURES: {
    stateDebug: isDevelopment && import.meta.env.VITE_STATE_DEBUG !== 'false',
    performanceMonitoring: import.meta.env.VITE_PERF_MONITOR === 'true',
    errorBoundary: import.meta.env.VITE_ERROR_BOUNDARY !== 'false'
  },

  // Business Rules
  BUSINESS: {
    minClubCount: 5,
    maxClubCount: 7,
    defaultLie: 'Standard',
    requiredClubs: ['6', '7', '8', '9', 'PW']
  },

  // UI Settings
  UI: {
    stepTransitionMs: 300,
    loadingDebounceMs: 100,
    toastDurationMs: 3000
  }
};

// Validate configuration on load
function validateConfig() {
  const errors = [];

  if (!APP_CONFIG.BUSINESS.minClubCount || APP_CONFIG.BUSINESS.minClubCount < 1) {
    errors.push('Invalid minClubCount');
  }

  if (APP_CONFIG.BUSINESS.maxClubCount < APP_CONFIG.BUSINESS.minClubCount) {
    errors.push('maxClubCount must be >= minClubCount');
  }

  if (errors.length > 0) {
    console.error('❌ CONFIG: Configuration validation failed:', errors);
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
}

// Development configuration info
if (APP_CONFIG.ENV.isDevelopment) {
  console.group('🔧 APP CONFIG:');
  console.log('Environment:', APP_CONFIG.ENV.isDevelopment ? 'Development' : 'Production');
  console.log('Data Source:', APP_CONFIG.DATA.useRealData ? 'Real Shopify API' : 'Mock Data');
  console.log('Logging:', APP_CONFIG.LOGGING.enabled ? 'Enabled' : 'Disabled');
  console.log('Persistence:', APP_CONFIG.PERSISTENCE.enabled ? 'Enabled' : 'Disabled');
  console.groupEnd();
}

// Validate configuration
validateConfig();

export default APP_CONFIG;