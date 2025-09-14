# QWEN.md

This file provides guidance to Qwen Code when working with code in this repository.

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

## GolfConfigurator Dev Architecture

The GolfConfigurator Dev repository follows a **modern Preact application architecture** with several key principles:

### DRY Architecture & Single Source of Truth

This project follows **strict DRY (Don't Repeat Yourself) principles** with a clean, maintainable architecture:

#### Core Architecture Principles

✅ **Single Source of Truth**: All configuration and constants in one place (`src/constants/defaults.js`)
✅ **No Duplication**: Zero repeated code or data definitions
✅ **Clean Imports**: Consistent import chains throughout the codebase
✅ **Single State System**: One unified state management approach using Preact Signals
✅ **No Unused Exports**: Every export has a purpose and is used
✅ **Performance Optimized**: Smaller bundle size through eliminated duplication

#### File Structure & Responsibilities

```
src/
├── constants/defaults.js          # 🎯 SINGLE SOURCE OF TRUTH
│   ├── HAND_OPTIONS              # Left/Right hand options
│   ├── AVAILABLE_CLUBS           # All selectable clubs (4,5,6,7,8,9,PW)
│   ├── DEFAULT_CLUBS             # Initially selected clubs (derived from AVAILABLE_CLUBS)
│   ├── SHAFT_LENGTHS             # All length options (-2" to +2")
│   └── DEFAULT_STATE_VALUES      # Complete initial state definition
│
├── hooks/useGolfState.js          # 🔧 SINGLE STATE SYSTEM
│   ├── Imports ALL constants from defaults.js
│   ├── Reactive signals with Preact Signals
│   ├── Computed values (ironSetType, canAddToCart)
│   ├── Actions with error handling
│   └── State persistence integration
│
├── utils/persistence.js           # 💾 CLEAN PERSISTENCE
│   └── Uses DEFAULT_STATE_VALUES (no duplication)
│
└── components/                    # 🎨 CLEAN COMPONENTS
    ├── GolfConfigurator.jsx      # Pure UI logic
    └── ShaftPicker.jsx           # Imports SHAFT_LENGTHS from constants
```

### State Management with Preact Signals

The application uses **Preact Signals** for reactive state management, which provides:

1. **Global State**: All state is managed through signals exported from `useGolfState.js`
2. **Computed Values**: Derived state like `ironSetType` and `canAddToCart` are computed automatically
3. **Actions Pattern**: Centralized actions object for state mutations with error handling
4. **Persistence**: Automatic state persistence with debouncing

#### Example State Structure:
```javascript
// Core state signals
export const selectedHand = signal(null);
export const selectedClubs = signal([...DEFAULT_CLUBS]);
export const selectedShaftBrand = signal('');
export const selectedShaftFlex = signal('');
export const selectedShaftLength = signal('Standard');

// Computed values
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
```

### Component Architecture

The components follow modern React/Preact best practices:

1. **Functional Components Only**: No class components
2. **Clean Separation**: Components focus purely on UI logic
3. **Direct Signal Usage**: Components directly access signals from `useGolfState.js`
4. **Step-Based UI**: Multi-step configuration flow with progress indicators

#### Example Component Structure:
```javascript
import { Button } from './ui/button';
import {
  selectedHand,
  selectedClubs,
  actions,
} from '../hooks/useGolfState';

export function GolfConfigurator() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div>
      {/* Progress steps */}
      <div className="mb-6 flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.name} className="flex items-center">
            {/* Step UI */}
          </div>
        ))}
      </div>

      {/* Step content */}
      {currentStep === 0 && (
        <div>
          {/* Hand selection */}
          <div className="mb-6">
            <h2>Select Hand</h2>
            <div className="grid grid-cols-2 gap-4">
              {handOptions.value.map((hand) => (
                <Button
                  key={hand.id}
                  variant={selectedHand.value === hand.id ? 'default' : 'outline'}
                  onClick={() => actions.setHand(hand.id)}
                >
                  {hand.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Club selection */}
          {/* ... */}
        </div>
      )}
    </div>
  );
}
```

### Services Pattern

The application uses a **function-based service pattern** with automatic switching between mock and real data:

```javascript
// services/ProductService.js
export async function fetchClubHeadProducts() {
  if (!USE_REAL_DATA) {
    return mockClubHeadProducts;
  }

  const response = await fetch('/products/iron-sets.js');
  return response.json();
}

export async function findVariantBySetSize(setType, hand) {
  if (!USE_REAL_DATA) {
    return mockVariants.find(v => v.setType === setType && v.hand === hand);
  }

  // Real API call
  const response = await fetch(`/products/iron-sets/${setType}-${hand}.js`);
  return response.json();
}
```

### Benefits Achieved

🎯 **Easy Maintenance**: Change club data in one place (`constants/defaults.js`)
🎯 **Data Consistency**: Impossible for definitions to get out of sync
🎯 **Clean Components**: Pure UI logic, no configuration mixed in
🎯 **Performance**: Bundle size optimized through eliminated duplication
🎯 **Developer Experience**: Clear import chains, predictable structure
🎯 **Type Safety**: Single definitions reduce typos and errors

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

## Additional Context Documentation

For detailed business logic, technical specifications, and domain knowledge, refer to the **`context/` directory**:

- **`context/BUSINESS-LOGIC.md`** - Complete UI behavior, validation rules, and user interaction flows
- **`context/CART-TRANSFORM.md`** - Technical specification for cart transformation function implementation
- **`context/DATA-REQUIREMENTS.md`** - Data structures, API requirements, and state management patterns
- **`context/MCP.md`** - Model Context Protocol configuration and Shopify documentation resources
- **`context/TRANSCRIPT.md`** - Historical development notes and implementation decisions

These files contain essential domain knowledge for understanding the golf configurator's business requirements and technical constraints.

## Git Workflow Rules

**IMPORTANT**: Qwen Code must NEVER commit changes automatically. Only commit when explicitly requested via the `/commit` command.

- **DO NOT** run `git commit` commands automatically after making changes
- **WAIT** for the user to run `/commit` when they want to create a commit
- The `/commit` command uses conventional commit format with emojis
- Make code changes and fixes as needed, but always wait for explicit commit instruction