# CLAUDE.md - Golf Configurator Dev

This file provides guidance to Claude Code when working with this Preact/React development environment.

## Project Architecture

This is a **modern Preact application** with signals-based state management, shadcn/ui components, and Shopify integration:

- **Framework**: Preact 10+ with hooks
- **State Management**: Preact Signals for reactive state
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Build Tool**: Vite with HMR
- **Data Flow**: Services pattern with mock/real data switching

## DRY Architecture & Single Source of Truth

This project follows **strict DRY (Don't Repeat Yourself) principles** with a clean, maintainable architecture:

### Core Architecture Principles

✅ **Single Source of Truth**: All configuration and constants in one place
✅ **No Duplication**: Zero repeated code or data definitions
✅ **Clean Imports**: Consistent import chains throughout the codebase
✅ **Single State System**: One unified state management approach
✅ **No Unused Exports**: Every export has a purpose and is used
✅ **Performance Optimized**: Smaller bundle size through eliminated duplication

### File Structure & Responsibilities

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

### DRY Implementation Examples

#### ✅ Constants - Single Definitions
```javascript
// constants/defaults.js - Define once, use everywhere
export const AVAILABLE_CLUBS = [
  { id: '6', name: '6-Iron', type: 'iron', isRequired: true, isOptional: false },
  // ... all club definitions
];

// Derived data - no duplication
const DEFAULT_CLUB_IDS = ['6', '7', '8', '9', 'PW'];
export const DEFAULT_CLUBS = AVAILABLE_CLUBS.filter(club =>
  DEFAULT_CLUB_IDS.includes(club.id)
);
```

#### ✅ State Management - Single System
```javascript
// hooks/useGolfState.js - Import constants, export signals
import { HAND_OPTIONS, AVAILABLE_CLUBS, SHAFT_LENGTHS } from '../constants/defaults.js';

export const handOptions = signal([...HAND_OPTIONS]);
export const availableClubs = signal([...AVAILABLE_CLUBS]);
// No hardcoded arrays anywhere
```

#### ✅ Components - Clean Imports
```javascript
// components/ShaftPicker.jsx - Import what you need
import { SHAFT_LENGTHS } from '../constants/defaults';
import { actions, selectedShaftBrand } from '../hooks/useGolfState';

// Use constants directly, no hardcoded data
{SHAFT_LENGTHS.map((lengthOption) => ...)}
```

### Benefits Achieved

🎯 **Easy Maintenance**: Change club data in one place (`constants/defaults.js`)
🎯 **Data Consistency**: Impossible for definitions to get out of sync
🎯 **Clean Components**: Pure UI logic, no configuration mixed in
🎯 **Performance**: Bundle size optimized (87.21 KB - no dead code)
🎯 **Developer Experience**: Clear import chains, predictable structure
🎯 **Type Safety**: Single definitions reduce typos and errors

### Anti-Patterns Eliminated

❌ **Multiple State Systems**: Removed duplicate `store/` directory
❌ **Hardcoded Arrays**: No data definitions in components
❌ **Duplicate Constants**: Same club data no longer repeated
❌ **Unused Exports**: Removed dead code like `basePrice`, `totalPrice`
❌ **Mixed Concerns**: Configuration separated from business logic

### State Flow Architecture

```
constants/defaults.js (Single Source)
        ↓
hooks/useGolfState.js (Single State System)
        ↓
components/ (Clean UI Components)
        ↓
utils/persistence.js (Clean Storage)
```

This architecture ensures **absolute DRY compliance** with zero duplication and maximum maintainability.

---

## Modern React/Preact Best Practices

> **⚠️ IMPORTANT**: The examples below are **general React/Preact patterns**. Our project uses the **DRY architecture documented above**. When there's a conflict, **always follow the DRY implementation** (constants from `defaults.js`, direct signals from `useGolfState.js`, no service classes, no custom hooks for state).

### Component Architecture

#### 1. Component Function Style

**Preferred: Function Declarations**

```javascript
// ✅ Best - Function declaration (better debugging, hoisting, DevTools)
export function ShaftPicker({ brand, onSelect }) {
  const [loading, setLoading] = useState(false);
  return <div>Component content</div>;
}
```

**Alternative: Arrow Functions**

```javascript
// ✅ OK - Arrow function (when you prefer this style)
export const ShaftPicker = ({ brand, onSelect }) => {
  const [loading, setLoading] = useState(false);
  return <div>Component content</div>;
};
```

**When to use each:**

- **Function declarations**: Components, major functions (better stack traces)
- **Arrow functions**: Event handlers, callbacks, utility functions

#### 2. Functional Components Only

```javascript
//  Good - Modern functional component
export function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  return <div>{/* JSX */}</div>;
}

// ❌ Avoid - Class components
class ComponentName extends Component { ... }
```

#### 2. Custom Hooks for Logic Separation

```javascript
//  Extract complex logic into custom hooks
function useShaftSelection(brandName) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Logic here
  }, [brandName]);

  return { options, loading };
}

// Use in component
export function ShaftPicker() {
  const { options, loading } = useShaftSelection(selectedBrand);
  // Render logic only
}
```

#### 3. Component Composition over Inheritance

```javascript
//  Good - Composition with children
function Card({ children, className }) {
  return <div className={cn('card', className)}>{children}</div>;
}

//  Good - Composition with render props
function DataFetcher({ children, url }) {
  const { data, loading } = useFetch(url);
  return children({ data, loading });
}
```

### State Management with Signals

> **⚠️ OUR PROJECT**: We use the single `useGolfState.js` file with constants from `defaults.js`. No hardcoded arrays or multiple state systems.

#### 1. Global State with Signals

```javascript
//  Signals for reactive global state
import { signal, computed } from '@preact/signals';

export const selectedHand = signal(null);
export const selectedClubs = signal([]);

//  Computed values for derived state
export const totalPrice = computed(() => {
  return basePrice.value + shaftPrice.value;
});
```

#### 2. Local State with useState

```javascript
//  Local UI state with useState
function Component() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Use signals for global state
  const clubs = selectedClubs.value;
}
```

#### 3. Actions Pattern

```javascript
//  Centralized actions object
export const actions = {
  setHand(hand) {
    selectedHand.value = hand;
  },

  toggleClub(club) {
    const current = selectedClubs.value;
    selectedClubs.value = current.some((c) => c.id === club.id)
      ? current.filter((c) => c.id !== club.id)
      : [...current, club];
  },
};
```

### Service Layer Architecture

> **⚠️ OUR PROJECT**: We use function-based services (`services/ProductService.js`, `services/ShaftService.js`) with direct imports, not classes or service objects. Follow the DRY pattern above.

#### 1. Service Classes/Modules

```javascript
//  Pure function services
export async function fetchProducts() {
  const response = await fetch('/api/products');
  return response.json();
}

//  Service modules with multiple related functions
export const productService = {
  async fetchProducts() {
    /* ... */
  },
  async findVariant(id) {
    /* ... */
  },
  getCachedProducts() {
    /* ... */
  },
};
```

#### 2. Error Handling

```javascript
//  Proper error boundaries and handling
async function fetchData() {
  try {
    const data = await api.fetchProducts();
    return { data, error: null };
  } catch (error) {
    console.error('Failed to fetch:', error);
    return { data: null, error: error.message };
  }
}
```

### Modern ES6+ Patterns

#### 1. Destructuring and Spread

```javascript
//  Destructuring props and state
function Component({ title, items, onSelect }) {
  const [{ loading, error }, setState] = useState({ loading: false, error: null });

  //  Spread for immutable updates
  const addItem = (newItem) => {
    setItems((prev) => [...prev, newItem]);
  };
}
```

#### 2. Optional Chaining and Nullish Coalescing

```javascript
//  Safe property access
const userName = user?.profile?.name ?? 'Anonymous';
const isActive = user?.settings?.notifications?.enabled ?? false;

//  Safe method calls
onClick?.(event);
onSubmit?.(formData);
```

#### 3. Template Literals and Dynamic Imports

```javascript
//  Template literals for complex strings
const className = `btn btn-${variant} ${isDisabled ? 'btn-disabled' : ''}`;

//  Dynamic imports for code splitting
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

### Component Organization

#### 1. File Structure

```
src/
  components/          # Reusable UI components
    ui/               # shadcn/ui base components
      button.jsx
      select.jsx
    GolfConfigurator.jsx
    ShaftPicker.jsx
  hooks/              # Custom hooks
    useGolfState.js
    useLocalStorage.js
  services/           # Business logic
    ProductService.js
    ShaftService.js
  utils/              # Helper functions
    formatters.js
    validators.js
```

#### 2. Component Structure Template

```javascript
// Imports grouped by type
import { useState, useEffect } from 'preact/hooks';
import { Button } from './ui/button';
import { cn } from '../utils/cn';
import { actions } from '../hooks/useGolfState';

// Component with clear prop types via JSDoc
/**
 * @param {Object} props
 * @param {string} props.title
 * @param {Function} props.onSubmit
 */
export function ComponentName({ title, onSubmit }) {
  // 1. Hooks first
  const [localState, setLocalState] = useState(null);

  // 2. Computed values
  const isValid = localState?.value?.length > 0;

  // 3. Event handlers
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(localState);
  };

  // 4. Effects last
  useEffect(() => {
    // Side effects
  }, []);

  // 5. Early returns for loading/error states
  if (!localState) {
    return <div>Loading...</div>;
  }

  // 6. Main render
  return (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>
      <Button type='submit' disabled={!isValid}>
        Submit
      </Button>
    </form>
  );
}
```

### Performance Best Practices

#### 1. Memoization

```javascript
import { memo, useMemo, useCallback } from 'preact/compat';

//  Memo for expensive components
export const ExpensiveList = memo(function ExpensiveList({ items }) {
  const sortedItems = useMemo(() => items.sort((a, b) => a.name.localeCompare(b.name)), [items]);

  const handleClick = useCallback((id) => {
    actions.selectItem(id);
  }, []);

  return (
    <ul>
      {sortedItems.map((item) => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});
```

#### 2. Lazy Loading

```javascript
import { lazy, Suspense } from 'preact/compat';

//  Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### shadcn/ui Integration

#### 1. Base Component Usage

```javascript
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem } from './ui/select';
import { cn } from '../utils/cn';

//  Extend base components with variants
function CustomButton({ variant = 'default', size = 'md', children, className, ...props }) {
  return (
    <Button className={cn('my-custom-styles', variant === 'custom' && 'custom-variant-styles', className)} {...props}>
      {children}
    </Button>
  );
}
```

#### 2. Form Components

```javascript
//  Form handling with shadcn/ui
function ConfiguratorForm() {
  const [formData, setFormData] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form>
      <Select value={formData.brand} onValueChange={(value) => updateField('brand', value)}>
        <SelectTrigger>
          <SelectValue placeholder='Choose brand...' />
        </SelectTrigger>
        <SelectContent>
          {brands.map((brand) => (
            <SelectItem key={brand} value={brand}>
              {brand}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
```

### Data Fetching Patterns

#### 1. Custom Data Hooks

```javascript
//  Reusable data fetching hook
function useAsyncData(fetchFn, dependencies = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const data = await fetchFn();

        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, dependencies);

  return state;
}

// Usage
function ProductList() {
  const { data: products, loading, error } = useAsyncData(productService.fetchProducts);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

### Error Handling

#### 1. Error Boundaries

```javascript
import { Component } from 'preact';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

### Testing Considerations

#### 1. Testable Component Structure

```javascript
//  Pure functions are easily testable
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

//  Components with clear inputs/outputs
export function PriceDisplay({ items, formatCurrency }) {
  const total = calculateTotal(items);
  return <div>{formatCurrency(total)}</div>;
}
```

## Code Style Rules

### 1. Naming Conventions

- **Components**: PascalCase (`ShaftPicker`, `GolfConfigurator`)
- **Functions/Variables**: camelCase (`handleSubmit`, `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_CLUBS`, `API_ENDPOINTS`)
- **Files**: Match component name (`ShaftPicker.jsx`)

### 2. Import Organization

```javascript
// 1. External libraries
import { useState, useEffect } from 'preact/hooks';
import { Button } from './ui/button';

// 2. Internal utilities
import { cn } from '../utils/cn';

// 3. Services and hooks
import { actions } from '../hooks/useGolfState';
import * as productService from '../services/ProductService';

// 4. Types (if using TypeScript)
import type { Product } from '../types/Product';
```

### 3. JSX Formatting

```javascript
//  Clean JSX formatting
return (
  <div className='container'>
    <h2 className='title'>{title}</h2>
    <Button variant='primary' size='lg' onClick={handleClick} disabled={isLoading}>
      {buttonText}
    </Button>
  </div>
);
```

## Shopify Integration Patterns

> **⚠️ OUR PROJECT**: We use function-based services with `USE_REAL_DATA` from `useGolfState.js`. No service classes or factories. Follow the DRY architecture documented above.

### 1. Environment Detection

```javascript
//  Clean environment switching
const isDevelopment = import.meta.env.DEV;
export const USE_REAL_DATA = !isDevelopment;

//  Service factory pattern
export const createProductService = () => {
  return isDevelopment ? new MockProductService() : new ProductService();
};
```

### 2. API Integration

```javascript
//  Shopify API service
class ShopifyService {
  async fetchProduct(handle) {
    const response = await fetch(`/products/${handle}.js`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    return response.json();
  }

  async addToCart(items) {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add to cart');
    }

    return response.json();
  }
}
```

## Key Principles

1. **Functional Programming**: Prefer pure functions and immutable updates
2. **Composition over Inheritance**: Build complex components from simple ones
3. **Single Responsibility**: Each component/function should have one clear purpose
4. **DRY Principle**: Extract common logic into reusable hooks/utilities
5. **Performance First**: Use memoization and lazy loading appropriately
6. **Accessible by Default**: Include proper ARIA attributes and semantic HTML
7. **Type Safety**: Use JSDoc comments or TypeScript for better DX
8. **Error Resilience**: Handle errors gracefully with proper boundaries
9. **Testability**: Write components that are easy to test and reason about
10. **Modern ES6+**: Use latest JavaScript features for cleaner code

## Anti-Patterns to Avoid

❌ **Prop Drilling**: Pass props through multiple levels
❌ **Massive Components**: Components with >200 lines of code  
❌ **Direct DOM Manipulation**: Use refs sparingly, prefer declarative rendering
❌ **Mutating State**: Always create new objects/arrays for state updates
❌ **useEffect Overuse**: Consider if the effect is actually necessary
❌ **Inline Styles**: Use Tailwind classes or CSS modules instead
❌ **Anonymous Functions in JSX**: Can cause unnecessary re-renders
❌ **Missing Keys**: Always provide unique keys for list items
❌ **Ignoring Accessibility**: Include proper ARIA labels and semantic HTML
❌ **Hardcoded Values**: Use constants and configuration objects

## Development Workflow

1. **Start with the simplest working version**
2. **Extract common patterns into reusable hooks/components**
3. **Optimize only when performance issues are identified**
4. **Test components in isolation before integration**
5. **Use TypeScript or JSDoc for better documentation**
6. **Follow the existing code style and patterns in the project**
7. **Write self-documenting code with clear variable names**
8. **Prefer composition and small, focused components**

---

Following these practices will result in maintainable, performant, and scalable Preact/React applications that follow modern development standards.
