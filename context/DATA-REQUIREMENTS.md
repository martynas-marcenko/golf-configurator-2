# Data Requirements & Dependencies

This document outlines all data dependencies, API usage patterns, and real-time data needs for the Golf Club Configurator and cart transformation system based on the Preact with signals implementation.

## Overview

The Golf Club Configurator uses real Shopify product data via REST APIs with **Preact signals** for reactive state management. The system loads actual product variants with real pricing and inventory data, ensuring accurate representation throughout the customer experience. All data state is managed through reactive signals for optimal performance and user experience.

---

## 1. Actual API Usage Patterns

### Primary Data Source: Shopify Products API (REST)

**Iron Set Product Loading:**
- Product Handle: `origin-combo-length-chrome`
- API Endpoint: `/products/origin-combo-length-chrome.js`
- Fallback: `/products.json?limit=250` (bulk search)
- Contains variants for 4-PW, 5-PW, 6-PW sets

**Iron Set Variants (Actual Store Data):**
- 4-PW: Variant ID `55435517559108` - £1,239.00
- 5-PW: Variant ID `55435517591876` - £1,062.00  
- 6-PW: Variant ID `55435517624644` - £885.00

**Shaft Product Loading:**
- Method: Bulk variant ID lookup via Products API
- No GraphQL usage - Pure REST API implementation
- Variant IDs hardcoded for performance
- Real-time pricing and availability from API response

### Signal-Based Shaft Brand Mapping
```javascript
import { signal, computed, effect } from '@preact/signals';

// Static mapping stored in signal for reactive access
const shaftBrandMapping = signal({
  'KBS Tour Lite': [
    '55509863334212', // Regular - £150.00
    '55509863366980', // Stiff - £154.00
    '55509863399748'  // Extra Stiff - £160.00
  ],
  'KBS Tour Matte Black': [
    '55509903835460', // Regular - £150.00
    '55509903868228', // Stiff - £154.00
    '55509903900996'  // Extra Stiff - £160.00
  ],
  'Fujikura Axiom': [
    '55509904818500', // Regular - £150.00
    '55509904851268', // Stiff - £154.00
    '55509904884036'  // Extra Stiff - £160.00
  ],
  'UST Mamiya': [
    '55509905867076', // Regular - £150.00
    '55509905899844', // Stiff - £154.00
    '55509905932612'  // Extra Stiff - £160.00
  ]
});

// Computed signals for reactive brand options
const availableBrands = computed(() => Object.keys(shaftBrandMapping.value));
const selectedBrandVariants = computed(() => 
  shaftBrandMapping.value[selectedBrand.value] || []
);
```

---

## 2. Dynamic Data (Signal-Based Real-Time Updates)

### Inventory Status Signals
**Shaft Availability Management:**
```javascript
// Inventory signals for reactive stock management
const shaftInventory = signal({});
const isLoadingInventory = signal(false);

// Computed available shafts based on inventory
const availableShafts = computed(() => 
  selectedBrandVariants.value.filter(variantId => 
    shaftInventory.value[variantId]?.available
  )
);

// Effect to update UI when inventory changes
effect(() => {
  if (availableShafts.value.length === 0) {
    // Trigger UI update for no available options
    showOutOfStockMessage.value = true;
  }
});
```

**Stock Sensitivity Rules:**
- Out-of-stock flexes disabled with "Sold out" label via computed signals
- Price recalculation triggered automatically when selected shaft becomes unavailable
- UI updates reactively handle stock changes during configuration

### Price Updates (Reactive Signals)
**Real-Time Calculation:**
```javascript
// Price calculation signals
const headPrice = computed(() => ironSetPrices.value[selectedSetSize.value] || 0);
const shaftPrice = computed(() => selectedShaft.value?.price || 0);
const clubCount = computed(() => selectedClubs.value.length);
const totalPrice = computed(() => headPrice.value + (shaftPrice.value * clubCount.value));

// Automatic price updates on any selection change
effect(() => {
  // Price display updates automatically when totalPrice changes
  console.log('Price updated:', totalPrice.value);
});
```

- Total price updates reactively on every selection change
- Formula: Head Price + (Shaft Surcharge × Club Count)
- Consistency maintained between configurator and cart transform via signals

---

## 3. Product Data Architecture

### Variant Mapping
**Club Head Variants:**
- Unique Shopify variant ID for each hand + set size combination
- Example: `variant_123456` = Right Handed 4-PW set
- Required for `iron_variant_id` property in cart transform

**Shaft Variants:**
- Unique Shopify variant ID for each shaft + flex combination  
- Example: `variant_789012` = KBS Tour Steel Regular
- Required for `shaft_variant_id` property in cart transform

**Product Relationships:**
```
Iron Product (Right) → Variants:
├── 4-PW Set (variant_001)
├── 5-PW Set (variant_002)  
└── 6-PW Set (variant_003)

Shaft Product (KBS Tour) → Variants:
├── Steel Regular (variant_101)
├── Steel Stiff (variant_102)
└── Graphite Regular (variant_103)
```

---

## 4. Actual API Implementation

### Shopify Products API (REST)

**Product Loading Strategy:**
```javascript
// Primary approach: Specific product by handle
fetch('/products/origin-combo-length-chrome.js')

// Fallback: Bulk search across all products  
fetch('/products.json?limit=250')
```

**Shaft Data Loading:**
```javascript
// Bulk variant lookup by ID
const loadVariantsByIds = async (variantIds) => {
  const response = await fetch('/products.json?limit=250');
  const products = await response.json();
  // Search all variants across all products
  return matchedVariants;
};
```

**No Custom APIs:**
- No separate configurator API endpoints
- No inventory-specific APIs
- No price calculator APIs
- Direct Shopify Products API usage only

### Signal-Based Data Loading Strategy
```javascript
// Loading state signals
const isLoadingIronSets = signal(false);
const isLoadingShafts = signal(false);
const loadingError = signal(null);

// Data loading with signal updates
const loadIronSetData = async () => {
  isLoadingIronSets.value = true;
  try {
    const response = await fetch('/products/origin-combo-length-chrome.js');
    const productData = await response.json();
    ironSetData.value = productData;
  } catch (error) {
    loadingError.value = error.message;
  } finally {
    isLoadingIronSets.value = false;
  }
};

// Effect-based brand data loading
effect(() => {
  if (selectedBrand.value && !shaftCache.value[selectedBrand.value]) {
    loadShaftDataForBrand(selectedBrand.value);
  }
});
```

1. **Page Load:** Initialize configurator and load iron set variants with loading signals
2. **Brand Selection:** Reactive loading of shaft variants triggered by brand selection signal
3. **Signal-Based Caching:** Brand-specific caching managed through signals
4. **Error Handling:** Error states managed via signals with fallback strategies

---

## 5. Configuration Data

### Real Product Data Structure

**Iron Set Product Response:**
```json
{
  "id": 8937502679236,
  "title": "Origin Combo Length Chrome",
  "handle": "origin-combo-length-chrome",
  "variants": [
    {
      "id": 55435517559108,
      "title": "4-PW",
      "price": "1239.00",
      "available": true,
      "inventory_quantity": 10
    },
    {
      "id": 55435517591876,
      "title": "5-PW", 
      "price": "1062.00",
      "available": true,
      "inventory_quantity": 15
    }
  ]
}
```

**Shaft Product Response:**
```json
{
  "id": 8990234567890,
  "title": "KBS Tour Lite",
  "variants": [
    {
      "id": 55509863334212,
      "title": "Regular",
      "price": "150.00",
      "available": true,
      "inventory_quantity": 25
    }
  ]
}
```

### Grip Options
```json
{
  "grips": [
    {
      "brand": "Golf Pride", 
      "model": "MCC",
      "sizes": ["Standard", "Midsize"],
      "price_impact": 0.00
    },
    {
      "brand": "Lamkin",
      "model": "Crossline", 
      "sizes": ["Standard", "Midsize", "Jumbo"],
      "price_impact": 0.00
    }
  ]
}
```

### Specification Options
```json
{
  "length_options": [
    "Standard -1.0\"",
    "Standard -0.5\"", 
    "Standard",
    "Standard +0.5\"",
    "Standard +1.0\""
  ],
  "lie_options": [
    "-2°", "-1°", "Standard", "+1°", "+2°"
  ]
}
```

---

## 6. Data Validation Requirements

### Signal-Based Client-Side Validation
**Reactive Validation Signals:**
```javascript
// Validation state signals
const validationErrors = signal([]);
const isFormValid = computed(() => validationErrors.value.length === 0);

// Computed validation for bundle data
const bundleValidation = computed(() => {
  const errors = [];
  const required = ['bundleId', 'iron_variant_id', 'shaft_variant_id', 'club_list'];
  
  required.forEach(field => {
    const value = getFieldValue(field);
    if (!value) errors.push(`Missing required field: ${field}`);
  });
  
  return { valid: errors.length === 0, errors };
});

// Reactive club list validation
const clubListValidation = computed(() => {
  const clubList = selectedClubs.value.join(',');
  const validClubs = ['4', '5', '6', '7', '8', '9', 'PW', 'G', 'S', 'L'];
  const invalid = selectedClubs.value.filter(club => !validClubs.includes(club));
  
  return {
    valid: invalid.length === 0,
    errors: invalid.map(club => `Invalid club: ${club}`)
  };
});

// Effect to update validation errors
effect(() => {
  const allErrors = [
    ...bundleValidation.value.errors,
    ...clubListValidation.value.errors
  ];
  validationErrors.value = allErrors;
});

// Reactive price validation
const priceValidation = computed(() => {
  const calculated = totalPrice.value;
  const expected = getExpectedTotal();
  const valid = Math.abs(calculated - expected) < 0.01;
  
  return { valid, calculated, expected };
});
```

**Required Checks:**
- All required properties present before cart addition (via computed signals)
- Valid club list format (comma-separated, valid club names)
- Price calculation matches server-side calculation
- Selected variants exist and are in stock

### Server-Side Validation
**Cart Transform Checks:**
- Verify variant IDs exist in Shopify
- Confirm inventory availability
- Validate price calculations
- Ensure bundle data integrity

---

## 7. Signal-Based Caching Strategy

### Static Data Signals (Long Cache)
```javascript
// Long-term cached data in signals
const productConfigurations = signal({}, { cache: '24h' });
const basePricing = signal({}, { cache: '6h' });
const gripSpecOptions = signal({}, { cache: '24h' });

// Computed cached data with fallbacks
const cachedProductConfig = computed(() => 
  productConfigurations.value || getCachedFallback('products')
);
```

### Dynamic Data Signals (Short Cache)
```javascript
// Short-term cached inventory signals
const inventoryLevels = signal({}, { cache: '5m' });
const priceCalculations = signal({}, { cache: '1m' });
const stockStatus = signal({}, { cache: '2m' });

// Effect-based cache invalidation
effect(() => {
  // Auto-refresh inventory when it expires
  if (shouldRefreshInventory(inventoryLevels.value)) {
    loadInventoryData();
  }
});
```

### Signal-Based Cache Invalidation
```javascript
// Cache invalidation signals
const shouldInvalidateCache = signal(false);
const cacheVersion = signal(1);

// Effect to handle cache invalidation
effect(() => {
  if (shouldInvalidateCache.value) {
    // Clear all cached signals
    productConfigurations.value = {};
    inventoryLevels.value = {};
    priceCalculations.value = {};
    cacheVersion.value += 1;
    shouldInvalidateCache.value = false;
  }
});
```

- **Manual:** Admin product updates trigger cache invalidation signal
- **Automatic:** Inventory threshold changes via reactive effects
- **Emergency:** API error fallback to cached data in signals

---

## 8. Error Handling & Fallbacks

### Data Loading Failures
| Scenario | Fallback Strategy |
|----------|-------------------|
| Product API fails | Use cached data, show warning |
| Inventory API fails | Show all options, warn about availability |
| Price API fails | Use cached calculations, flag for verification |
| Complete API failure | Disable configurator, show error message |

### Data Inconsistency
- **Price Mismatch:** Log discrepancy, use server calculation
- **Invalid Variants:** Skip transformation, log error
- **Missing Data:** Graceful degradation, user notification

### Monitoring Requirements
- API response times and success rates
- Cache hit/miss ratios  
- Data validation failure rates
- Price calculation discrepancies
- Cart transformation success rates

---

## 9. Signal-Based Performance Optimization

### Reactive Data Pre-fetching
```javascript
// Pre-fetch critical data with loading signals
const criticalDataLoaded = computed(() => 
  ironSetData.value && availableBrands.value.length > 0
);

// Progressive enhancement via effects
effect(() => {
  if (criticalDataLoaded.value && !nonCriticalDataLoaded.value) {
    // Load non-critical features in background
    loadGripOptions();
    loadSpecificationOptions();
  }
});

// Background refresh of cached signals
effect(() => {
  const intervalId = setInterval(() => {
    if (shouldRefreshCache.value) {
      backgroundRefreshCachedData();
    }
  }, 30000);
  
  return () => clearInterval(intervalId);
});
```

### Signal-Based API Optimization
```javascript
// Request deduplication via computed signals
const pendingRequests = signal(new Set());
const requestCache = signal(new Map());

const deferredShaftData = computed(() => {
  const brand = selectedBrand.value;
  if (!brand || pendingRequests.value.has(brand)) return null;
  
  // Check cache first
  if (requestCache.value.has(brand)) {
    return requestCache.value.get(brand);
  }
  
  // Trigger API request
  loadShaftDataForBrand(brand);
  return null;
});
```

- Cache shaft brand data locally in signals to avoid repeated calls
- Use bulk Products API search as fallback with error signals
- No GraphQL usage - Pure REST API implementation with signal state
- Implement request deduplication for variant lookups via computed signals

### Signal Memory Management
- Efficient signal-based data structures for large product catalogs
- Automatic garbage collection of unused cached signals
- Lazy loading for non-critical options via computed signals
- Signal disposal on component unmount to prevent memory leaks

---

## 10. Development & Testing Data

### Mock Data Requirements
- Complete product catalog with all variants
- Realistic pricing structures
- Multiple shaft/grip combinations
- Edge cases (out of stock, price changes)

### Test Data Scenarios
- Full inventory (all options available)
- Partial inventory (some shafts unavailable)
- Price updates during session
- Invalid configuration attempts
- Network failure simulations