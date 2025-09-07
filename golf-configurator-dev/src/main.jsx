import { render } from 'preact';
import { GolfConfigurator } from './components/GolfConfigurator';
import './styles.css'; // Import global styles

/**
 * Golf Configurator - Preact Entry Point
 * Exact functionality recreation from golf-configurator-simple.js
 * VERSION: v1.0.0-PREACT - 2025-08-28
 */

const CONFIGURATOR_VERSION = 'v1.0.0-PREACT';
const LOAD_TIMESTAMP = Date.now();
const LOAD_TIME = new Date().toISOString();

console.log('🏌️ Golf Configurator: PREACT VERSION', CONFIGURATOR_VERSION, 'loaded at', LOAD_TIME);
console.log('🕐 PROOF OF LATEST VERSION - Timestamp:', LOAD_TIMESTAMP);
console.log('💰 FEATURE: Dynamic currency formatting enabled');
console.log('⚡ FEATURE: Preact signals for reactive state management');
console.log('🎨 FEATURE: shadcn/ui components for modern UI');
console.log('🛒 FEATURE: Shopify API integration preserved');
console.log('🎯 BUILD DATE: August 28, 2025 - Preact deployment');

// Initialize configurator when DOM is ready
function initConfigurator() {
  console.log('🔍 Looking for golf configurator container...');
  console.log('🔍 Available elements:', document.querySelectorAll('[id*="golf"]'));
  
  const container = document.getElementById('golf-configurator');
  
  if (!container) {
    console.error('❌ Golf configurator container not found! Expected element with ID "golf-configurator"');
    console.error('🔍 Available IDs on page:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
    return;
  }

  console.log('✅ Container found:', container);
  console.log('🚀 Initializing Golf Configurator with Preact...');
  
  // Make container visible and clear existing content
  container.style.display = 'block';
  container.innerHTML = '';
  
  try {
    render(<GolfConfigurator />, container);
    console.log('✅ Golf Configurator initialized successfully');
    
    // Add global debug access
    window.GolfConfigurator = {
      version: CONFIGURATOR_VERSION,
      loadTime: LOAD_TIME,
      timestamp: LOAD_TIMESTAMP
    };
    
  } catch (error) {
    console.error('❌ Failed to initialize Golf Configurator:', error);
    console.error('Error details:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConfigurator);
} else {
  initConfigurator();
}

// For hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept();
}