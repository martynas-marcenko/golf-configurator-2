# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This repository contains a **dual-environment golf club configurator** for Shopify with two main directories:

### 1. `golf-configurator/` - Shopify App (Production)
- **Extension-only Shopify app** with cart transformation functions
- **Framework**: Shopify CLI with extensions
- **Extensions**:
  - `cart-transformer/` - Function extension for cart processing (WebAssembly)
  - `golf-configurator-theme-app-extention/` - Theme app extension
- **Config**: `shopify.app.toml` (client_id, scopes, webhooks)

### 2. `golf-configurator-dev/` - Development Environment  
- **Standalone Preact app** for rapid UI development
- **Framework**: Preact + Signals + shadcn/ui + Vite
- **Mock Data**: Comprehensive Shopify API simulation
- **Build Output**: Generates assets for Shopify extensions

## Common Commands

### Development Environment (Recommended for UI work)
```bash
cd golf-configurator-dev
npm install
npm run dev                # Start dev server with mock data (port 3000)
npm run build:watch        # Auto-rebuild to Shopify assets
npm run build              # Production build
npm run lint               # ESLint checking
```

### Shopify App (Next-Gen Dev Platform)
```bash
cd golf-configurator
npm install
npm run dev                # Creates isolated app preview on development store
npm run dev -- --reset    # Reset store/configuration selection
npm run build              # Build Shopify app
npm run deploy             # Deploy to Shopify store
shopify app dev clean      # Restore released version, remove preview
```

### Integrated Development Workflow
```bash
# Terminal 1: Auto-rebuild dev environment
cd golf-configurator-dev && npm run build:watch

# Terminal 2: Shopify dev server with live data
cd golf-configurator && npm run dev
```

## Next-Gen Dev Platform Features

**App Preview Isolation**: Changes during `app dev` are isolated to your chosen development store only.

**Configuration Hot-Reload**: All `shopify.app.toml` changes preview instantly without requiring `app deploy`.

**Extension Management**: Add/remove extensions without restarting `app dev`.

**Auto-Installation**: App automatically installs on your development store.

**Scope Auto-Accept**: Access scope changes in `shopify.app.toml` are automatically accepted.

**Persistent Previews**: App preview remains active until you run `shopify app dev clean`.

## Architecture Overview

### State Management
- **System**: Preact Signals for reactive state management
- **Location**: `golf-configurator-dev/src/store/golfStore.js`
- **Pattern**: Global signals with computed values and actions
- **Key Signals**:
  - `selectedHand`, `selectedClubs`, `selectedShaftBrand`, `selectedShaftFlex`, `selectedShaftLength`
  - `selectedGrip`, `selectedLie`, `isLoading`, `error`, `canAddToCart`, `ironSetType`

### Service Layer Pattern
The app uses a **dual-service architecture** that automatically switches between mock and real data:

```javascript
// Automatic environment detection via app config
import APP_CONFIG from '../config/app.js';
const USE_REAL_DATA = APP_CONFIG.DATA.useRealData;

// Function-based services (not classes)
export const fetchClubHeadProducts = async () => {
  return USE_REAL_DATA ? await fetchRealClubProducts() : await fetchMockClubProducts();
};
```

**Services Location**: `golf-configurator-dev/src/services/`
- `ProductService.js` - Iron set variants and pricing (functional approach)
- `ShaftService.js` - Shaft options loading from theme data attributes
- `CartService.js` - Cart integration with bundle logic
- **Mock Data**: `golf-configurator-dev/src/mocks/shopify-data.json`
- **Configuration**: `golf-configurator-dev/src/config/app.js`

### Component Architecture
- **UI Framework**: shadcn/ui components (`golf-configurator-dev/src/components/ui/`)
- **Main Components**: `GolfConfigurator.jsx`, `ShaftPicker.jsx`, `ClubSelector.jsx`, `StepIndicator.jsx`
- **Pattern**: Functional components with direct signal access from store
- **Styling**: Tailwind CSS with CSS variables for theming
- **4-Step Flow**: Club Selection → Shaft Selection → Grip Selection → Review & Add to Cart

### Build System
- **Dev Build**: Vite with HMR for fast development
- **Production Build**: Optimized bundles output to Shopify extension assets
- **Output Location**: `golf-configurator/extensions/golf-configurator-theme-app-extention/assets/`
- **Bundle Names**: `golf-configurator.bundle.js`, `golf-configurator.bundle.css`

### Cart Integration
- **Development**: Mock cart API with simulated responses and delays
- **Production**: Real Shopify `/cart/add.js` endpoint
- **Bundle System**: Generates unique `bundleId` for grouping related items
- **Cart Transformer**: WebAssembly function processes cart items with bundle logic

## Key Configuration Files

- `golf-configurator-dev/vite.config.js` - Build configuration, proxy settings
- `golf-configurator-dev/tailwind.config.js` - Tailwind CSS configuration
- `golf-configurator-dev/src/config/app.js` - Application configuration and feature flags
- `golf-configurator-dev/src/constants/defaults.js` - Single source of truth for all constants
- `golf-configurator/shopify.app.toml` - Shopify app configuration
- `golf-configurator/extensions/cart-transformer/shopify.extension.toml` - Cart function config

## Development Best Practices

### Working with State
- Import from store: `import { selectedHand, actions } from '../store/golfStore'`
- Use signals directly: `selectedHand.value = 'Right Handed'`
- Access computed values: `ironSetType.value`, `canAddToCart.value`
- Subscribe in components: `selectedHand.value` (auto-rerenders)
- Actions through: `actions.setHand()`, `actions.toggleClubByNumber()`, `actions.addToCart()`

### Environment Detection
- Use `APP_CONFIG.ENV.isDevelopment` for environment checks
- Data source controlled by `APP_CONFIG.DATA.useRealData` flag
- **NO MOCK DATA**: Code must fail explicitly if real data is not available
- **NO DEFAULTS**: All data attributes and elements must exist or the app will throw errors

### Data Requirements
- **REAL DATA ONLY**: The app requires proper Shopify theme extension setup with data attributes
- **NO FALLBACKS**: Missing elements or attributes will cause explicit errors
- Use browser dev tools to inspect `window.golfConfiguratorState` (when `APP_CONFIG.FEATURES.stateDebug` is enabled)
- All data must come from Shopify product metafields via theme extension

## Shopify Integration Details

### Product Variants
- **Iron Sets**: 4-PW (£1,239), 5-PW (£1,062), 6-PW (£885)
- **Hands**: Left/Right hand variants with separate Shopify variant IDs
- **Shafts**: Separate products with quantity matching club count

### Cart Bundle Structure
```javascript
{
  items: [
    { 
      id: ironVariantId, 
      quantity: 1,
      properties: { bundleId, hand, setSize, club_list }
    },
    { 
      id: shaftVariantId, 
      quantity: clubCount,
      properties: { bundleId, component_type: 'shaft' }
    }
  ]
}
```

### Extension Locations
- Theme Extension: `golf-configurator/extensions/golf-configurator-theme-app-extention/`
- Cart Transformer: `golf-configurator/extensions/cart-transformer/`
- Built Assets: Auto-generated from `golf-configurator-dev/` build process to theme extension assets directory

## Additional Context Documentation

For detailed business logic, technical specifications, and domain knowledge, refer to the **`context/` directory**:

- **`context/BUSINESS-LOGIC.md`** - Complete UI behavior, validation rules, and user interaction flows
- **`context/CART-TRANSFORM.md`** - Technical specification for cart transformation function implementation  
- **`context/DATA-REQUIREMENTS.md`** - Data structures, API requirements, and state management patterns
- **`context/MCP.md`** - Model Context Protocol configuration and Shopify documentation resources
- **`context/TRANSCRIPT.md`** - Historical development notes and implementation decisions

These files contain essential domain knowledge for understanding the golf configurator's business requirements and technical constraints.

## Git Workflow Rules

**IMPORTANT**: Claude must NEVER commit changes automatically. Only commit when explicitly requested via the `/commit` command.

- **DO NOT** run `git commit` commands automatically after making changes
- **WAIT** for the user to run `/commit` when they want to create a commit
- The `/commit` command uses conventional commit format with emojis (see `.claude/commands/commit.md`)
- Make code changes and fixes as needed, but always wait for explicit commit instruction