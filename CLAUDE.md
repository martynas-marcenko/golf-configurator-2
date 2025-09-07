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
- **Location**: `golf-configurator-dev/src/hooks/useGolfState.js`
- **Pattern**: Global signals with computed values and actions
- **Key Signals**: 
  - `selectedHand`, `selectedClubs`, `selectedShafts`
  - `isLoading`, `error`, `totalPrice`, `canAddToCart`

### Service Layer Pattern
The app uses a **dual-service architecture** that automatically switches between mock and real data:

```javascript
// Automatic environment detection
const isDevelopment = import.meta.env.DEV;
export const productService = isDevelopment ? new MockProductService() : new ProductService();
export const shaftService = isDevelopment ? new MockShaftService() : new ShaftService();
```

**Services Location**: `golf-configurator-dev/src/services/`
- `ProductService.js` / `MockProductService.js` - Iron set variants and pricing
- `ShaftService.js` / `MockShaftService.js` - Shaft options and variants
- **Mock Data**: `golf-configurator-dev/src/mocks/mockShopifyData.js`

### Component Architecture
- **UI Framework**: shadcn/ui components (`golf-configurator-dev/src/components/ui/`)
- **Main Components**: `GolfConfigurator.jsx`, `ClubGrid.jsx`, `ShaftPicker.jsx`, `CartSummary.jsx`
- **Pattern**: Functional components with signal subscriptions
- **Styling**: Tailwind CSS with CSS variables for theming

### Build System
- **Dev Build**: Vite with HMR for fast development
- **Production Build**: Optimized bundles output to Shopify extension assets
- **Output Location**: `golf-configurator/extensions/golf-builder-configurator/assets/`
- **Bundle Names**: `golf-configurator.bundle.js`, `golf-configurator.bundle.css`

### Cart Integration
- **Development**: Mock cart API with simulated responses and delays
- **Production**: Real Shopify `/cart/add.js` endpoint
- **Bundle System**: Generates unique `bundleId` for grouping related items
- **Cart Transformer**: WebAssembly function processes cart items with bundle logic

## Key Configuration Files

- `golf-configurator-dev/vite.config.js` - Build configuration, proxy settings
- `golf-configurator-dev/tailwind.config.js` - Tailwind CSS configuration  
- `golf-configurator/shopify.app.toml` - Shopify app configuration
- `golf-configurator/extensions/cart-transformer/shopify.extension.toml` - Cart function config

## Development Best Practices

### Working with State
- Use signals directly: `selectedHand.value = 'right'`
- Access computed values: `totalPrice.value` 
- Subscribe in components: `selectedHand.value` (auto-rerenders)
- Actions through: `actions.setHand()`, `actions.toggleClub()`, `actions.addToCart()`

### Environment Detection
- Check `import.meta.env.DEV` for development mode
- Mock services automatically active in dev environment
- Console logs prefixed with `🧪 Mock:` in development

### Testing Different Data Scenarios
- Modify `golf-configurator-dev/src/mocks/mockShopifyData.js` for different product configurations
- Mock services simulate API delays and error conditions
- Use browser dev tools to inspect `window.golfConfiguratorState`

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
- Built Assets: Auto-generated from `golf-configurator-dev/` build process