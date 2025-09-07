# Cart Transformation Technical Specification

This document details the technical implementation of the cart transformation function that converts Irons-Builder configurator selections into proper Shopify cart bundles.

## Overview

The cart transformer processes real product variants added to the cart by the configurator and merges them into bundled representations of complete golf club sets. This approach uses actual product pricing rather than wrapper products, ensuring accurate inventory management and pricing.

---

## Real Product Pattern

### Input Format

The configurator adds real product variants to the cart with these characteristics:

- **Products:** Actual Shopify product variants (iron variants, shaft variants, etc.)
- **Pricing:** Real product pricing from Shopify
- **Quantity:** 1 per component
- **Bundling:** Grouped by shared `bundleId` attribute

### Required Properties (Actual Implementation)

Each real product line item must contain these cart line properties:

| Property           | Type   | Description                                         | Example                        |
| ------------------ | ------ | --------------------------------------------------- | ------------------------------ |
| `bundleId`         | String | Unique bundle identifier (shared across components) | `"golf-1755882372496"`         |
| `hand`             | String | Hand preference                                     | `"right"` or `"left"`          |
| `setSize`          | String | Set configuration                                   | `"4PW"`, `"5PW"`, `"6PW"`      |
| `clubList`         | String | JSON array of club selection                        | `'["5","6","7","8","9","PW"]'` |
| `shaft_variant_id` | String | Selected shaft variant ID                           | `"55509863334212"`             |
| `shaft_name`       | String | Shaft display name                                  | `"KBS Tour Lite Regular"`      |
| `grip`             | String | Selected grip specification                         | `"Golf Pride MCC"`             |
| `length`           | String | Shaft length specification                          | `"Standard +0.5"`              |
| `lie`              | String | Lie angle adjustment                                | `"+1°"`                        |

---

## Transformation Algorithm

### 1. Real Product Grouping (Actual Implementation)

```typescript
// Cart Transformer v4.0 - Real Product Merge
const groupedItems: Record<string, CartLineInput[]> = {};

input.cart.lines.forEach((line, index) => {
  console.log(`Processing line ${index + 1}:`, line.id);

  const bundleId = line.bundleId;
  if (bundleId?.value) {
    const groupId = bundleId.value;

    if (!groupedItems[groupId]) {
      groupedItems[groupId] = [];
    }
    groupedItems[groupId].push(line);
  }
});
```

### 2. Price Calculation (Actual Implementation)

```typescript
// Calculate total bundle price from all real products
const totalPrice = group.reduce((sum, item) => {
  const itemPrice = parseFloat(item.cost.amountPerQuantity.amount);
  const merchandiseId = item.merchandise.__typename === 'ProductVariant' ? item.merchandise.id : 'N/A';
  console.log(`Item ${merchandiseId} price:`, itemPrice);
  return sum + itemPrice * item.quantity;
}, 0);
```

### 3. Bundle Merging

The transformer creates merge operations with:

- **Multiple real products** merged into a single bundle line
- **Automatic pricing** from sum of component products
- **Descriptive titles** based on configuration and component count
- **Preserved attributes** for customer specifications and order fulfillment

---

## Pricing Calculation

### Formula

**Total Bundle Price = Sum of All Component Product Prices**

### Components

**Real Product Pricing:**

- Each component (iron set, shaft, grip) is added as a real Shopify product variant
- Pricing comes directly from Shopify product variant prices
- No manual price calculations needed - Shopify handles pricing automatically

**Automatic Summation:**

- Cart Transform function sums all component prices in the bundle
- No need for `priceAdjustment` - natural cart behavior applies
- Total reflects actual product inventory costs

**Bundle Title Generation (Actual Implementation):**

```typescript
// Get bundle properties from first item
const firstItem = group[0];
const hand = firstItem.hand?.value || 'Right';
const setSize = firstItem.setSize?.value || '5PW';
const clubList = firstItem.clubList?.value || '';

// Create descriptive title based on components
const clubCount = clubList ? JSON.parse(clubList).length : 0;
const componentCount = group.length;

let title = `${hand} Handed ${setSize} Iron Set`;
if (clubCount > 0) {
  title += ` (${clubCount} clubs)`;
}
if (componentCount > 1) {
  title += ` - ${componentCount} components`;
}
// Result: "Right Handed 5PW Iron Set (6 clubs) - 2 components"
```

### Price Validation

The transformation ensures:

- Final cart total is sum of real product prices
- No discrepancies between products and bundle total
- Proper inventory management through real variant usage

---

## Bundle Attributes

### Customer-Facing Attributes

These attributes appear on the bundle line item for customer reference:

| Attribute             | Source                       | Display Example           |
| --------------------- | ---------------------------- | ------------------------- |
| **Hand**              | Product variant (Right/Left) | "Right Handed"            |
| **Set Configuration** | Derived from `club_list`     | "4-PW (7 clubs)"          |
| **Shaft**             | `shaft_variant_id` + specs   | "KBS Tour Steel Regular"  |
| **Grip**              | `grip` property              | "Golf Pride MCC Standard" |
| **Length**            | `length` property            | "Standard +0.5""          |
| **Lie**               | `lie` property               | "Standard +1°"            |

### Internal Properties

These properties are preserved for order processing:

- `bundleId`: For tracking and order fulfillment
- `iron_variant_id`: For inventory management
- `shaft_variant_id`: For component sourcing
- `club_list`: For manufacturing specifications

---

## Error Handling

### Missing Properties

```typescript
const requiredProps = ['bundleId', 'iron_variant_id', 'shaft_variant_id', 'club_list'];
const missingProps = requiredProps.filter((prop) => !bundleData[prop]);

if (missingProps.length > 0) {
  console.error(`Missing required properties: ${missingProps.join(', ')}`);
  return null; // Skip transformation
}
```

### Invalid Club List Format

```typescript
// Validate club_list format
const clubs = bundleData.club_list.split(',');
const validClubs = ['4', '5', '6', '7', '8', '9', 'PW', 'G', 'S', 'L'];
const invalidClubs = clubs.filter((club) => !validClubs.includes(club.trim()));

if (invalidClubs.length > 0) {
  console.error(`Invalid clubs in list: ${invalidClubs.join(', ')}`);
  return null; // Skip transformation
}
```

### Price Mismatch Detection

```typescript
// Verify calculated price matches expected total
const calculatedTotal = headPrice + shaftSurcharge * clubCount;
const expectedTotal = getExpectedTotal(bundleData);

if (Math.abs(calculatedTotal - expectedTotal) > 0.01) {
  console.error(`Price mismatch: calculated ${calculatedTotal}, expected ${expectedTotal}`);
  // Continue with calculated price but log discrepancy
}
```

---

## Cart Operations

### Merge Operation (Actual Implementation)

```typescript
// Cart Transformer v4.0 merge operation
return {
  merge: {
    cartLines: group.map((line) => ({
      cartLineId: line.id,
      quantity: line.quantity,
    })),
    title: title, // Dynamic title based on configuration
    parentVariantId: 'gid://shopify/ProductVariant/55257569722692',
    // No priceAdjustment needed - uses natural sum of component prices
  },
};
```

### Frontend Implementation (Preact Signals v4.0)

```javascript
// Preact signals-based cart addition
import { signal, computed } from '@preact/signals';

// Cart state signals
const isAddingToCart = signal(false);
const cartError = signal(null);

// Computed bundle data from signals
const bundleData = computed(() => ({
  bundleId: `golf-${Date.now()}`,
  hand: selectedHand.value,
  setSize: selectedSetSize.value,
  club_list: JSON.stringify(selectedClubs.value),
  shaft_variant_id: selectedShaft.value?.id,
  shaft_name: selectedShaft.value?.displayName,
  grip: selectedGrip.value,
  length: selectedLength.value,
  lie: selectedLie.value,
}));

// Reactive cart items generation
const cartItems = computed(() => {
  const bundle = bundleData.value;
  const items = [
    {
      id: ironVariant.value.id, // Real iron set variant
      quantity: 1,
      properties: bundle,
    },
  ];

  // Add shaft as separate line item if selected
  if (selectedShaft.value) {
    const clubCount = selectedClubs.value.length;
    items.push({
      id: selectedShaft.value.id, // Real shaft variant
      quantity: clubCount, // One shaft per club
      properties: {
        bundleId: bundle.bundleId, // Same bundle ID for grouping
        component_type: 'shaft',
        shaft_brand: selectedShaft.value.displayName,
        club_count: clubCount.toString(),
      },
    });
  }

  return items;
});

// Signal-based cart addition function
const addToCart = async () => {
  isAddingToCart.value = true;
  cartError.value = null;
  
  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems.value }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }
    
    // Success - signals will trigger UI updates
    showSuccessToast.value = true;
  } catch (error) {
    cartError.value = error.message;
  } finally {
    isAddingToCart.value = false;
  }
};
```

---

## Testing Considerations

### Unit Test Coverage

- Wrapper product identification
- Property extraction accuracy
- Price calculation correctness
- Club list parsing and validation
- Error handling for missing/invalid data
- Cart operation generation

### Integration Testing

- End-to-end configurator → cart flow
- Price consistency across UI and transform
- Attribute preservation through transformation
- Multiple bundle handling in same cart

### Edge Cases

- Malformed `club_list` strings
- Missing or invalid variant IDs
- Zero-priced shaft options
- Custom length/lie specifications
- Mixed iron and wedge bundles in same cart

---

## Performance Considerations

### Efficiency

- Single-pass processing of cart lines
- Minimal property lookups
- Cached price calculations where possible
- Batch cart operations when multiple bundles exist

### Logging

- Comprehensive debug logging for troubleshooting
- Performance metrics for transformation time
- Error tracking for failed transformations
- Success rate monitoring for production stability

---

## Deployment

### Function Compilation

- TypeScript source → WebAssembly (WASM)
- Optimized for Shopify Functions runtime
- Automatic deployment via `npm run deploy`

### Runtime Environment

- Shopify Functions serverless execution
- Cart Transform API (2025-01)
- GraphQL schema-based type safety
- Real-time cart modification capabilities
