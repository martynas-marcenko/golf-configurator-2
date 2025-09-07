# Golf Club Configurator Business Logic

This document outlines the complete business logic for the Golf Club Configurator, defining UI behavior, validation rules, and user interaction flows based on the Preact with signal state management implementation.

## Overview

The Golf Club Configurator is built using **Preact** with **signal-based state management** for reactive UI updates. It allows customers to configure custom iron sets (4-PW, 5-PW, 6-PW) with personalized specifications including hand preference, shaft selection, grip choice, and custom measurements. The system uses real Shopify products and variants throughout the process, ensuring accurate pricing and inventory management.

### Architecture
- **Framework**: Preact for lightweight component-based UI
- **State Management**: Signals for reactive state updates
- **Build System**: Modern bundling with hot module replacement
- **API Integration**: REST-based Shopify Products API

---

## 1. Hand Selector

| Condition            | UI Behavior                   |
| -------------------- | ----------------------------- |
| Both hands available | Two-pill toggle **Right \| Left** |
| One hand only        | Toggle hidden                 |

**Rules:**
- Switching hand switches pages (separate products for each hand)
- Changing hand clears all downstream selections
- Price resets to base when hand is switched

---

## 2. Set-Size Selection

**Label:** "Set Options (price)"

**Choices:** 4-PW · 5-PW · 6-PW

**Behavior:**
- Selecting updates the price in the label instantly
- Helper text: "5-club minimum, 6-PW always selected, 4 and 5 optional"
- Requires hand selection to ensure correct price mapping
- Updates head price for downstream calculations

**Club Counts:**
- 4-PW: 7 clubs (4, 5, 6, 7, 8, 9, PW)
- 5-PW: 6 clubs (5, 6, 7, 8, 9, PW)  
- 6-PW: 5 clubs (6, 7, 8, 9, PW)

---

## 3. Choose-Your-Clubs Grid

**Iron Sets:** Seven buttons: **4 5 6 7 8 9 PW**

**Wedge Sets:** Three buttons: **G S L** (any combination allowed)

| Rule         | Behavior                                      |
| ------------ | --------------------------------------------- |
| 6-PW to PW   | Locked on, cannot be unticked                 |
| 4 & 5        | Optional toggles                              |
| Club counter | Replaces cart count e.g. "7 clubs selected"  |
| Total price  | Recalculates instantly on each tick          |

**Validation:**
- Minimum 5 clubs required for iron sets
- Enabled only after set size is chosen
- Grid state affects total price calculation

---

## 4. Shaft Picker

**Components:**
1. **Shaft Brand** dropdown
2. **Material pills:** Steel | Graphite (appears only if both exist for selected brand)
3. **Model / Flex** dropdown shows in-stock options

**Shaft Variants & Pricing:**
- Each shaft option corresponds to a real Shopify product variant with unique pricing
- Shaft variants are structured as: **Brand → Flex Options**
- Current active shaft brands: KBS Tour Lite, KBS Tour Matte Black, Fujikura Axiom, UST Mamiya

**Actual Shaft Brand Structure:**
```
KBS Tour Lite
├── Regular (£150.00)
├── Stiff (£154.00)  
└── Extra Stiff (£160.00)

KBS Tour Matte Black
├── Regular (£150.00)
├── Stiff (£154.00)
└── Extra Stiff (£160.00)

Fujikura Axiom
├── Regular (£150.00)
├── Stiff (£154.00)
└── Extra Stiff (£160.00)

UST Mamiya
├── Regular (£150.00)
├── Stiff (£154.00)
└── Extra Stiff (£160.00)
```

**Data Organization Approach:**
- **Hardcoded Variant IDs:** Static brand-to-variant ID mapping stored in signals for performance
- **Dynamic Product Data:** All product information (price, title, availability) fetched via Shopify Products API
- **REST API Usage:** Uses `/products.json` instead of GraphQL for reliability
- **Real Product Variants:** Each shaft configuration maps to actual Shopify product variants
- **Signal State Management:** Product data and selections managed via reactive signals

```javascript
// Preact signals-based implementation
import { signal, computed } from '@preact/signals';

const shaftBrandMapping = signal({
  'KBS Tour Lite': ['55509863334212', '55509863366980', '55509863399748'],
  'KBS Tour Matte Black': ['55509903835460', '55509903868228', '55509903900996'],
  'Fujikura Axiom': ['55509904818500', '55509904851268', '55509904884036'],
  'UST Mamiya': ['55509905867076', '55509905899844', '55509905932612']
});

const selectedBrand = signal(null);
const availableVariants = computed(() => 
  shaftBrandMapping.value[selectedBrand.value] || []
);
```

**Data Flow (Preact Signals):**
1. User selects brand → `selectedBrand.value = brand` triggers reactive updates
2. `availableVariants` computed signal automatically updates available options
3. Display options with live pricing and availability via signal-based rendering
4. User selects specific variant → Add real product to cart
5. Each combination (Brand + Model + Flex) = unique Shopify product variant
6. Shaft surcharge pricing computed reactively from club count signals

**Behavior:**
- Brand dropdown unlocked only after club grid is valid (minimum clubs satisfied)
- Material pills appear only if chosen brand has both Steel and Graphite options
- Model/Flex dropdown content depends on: brand + material + current hand
- Sold-out flexes disabled with "Sold out" label
- Price bumps by _(shaft surcharge × club count)_ immediately
- Shaft surcharge calculated as: shaft variant price × selected club count
- If inventory changes mid-session, flex greys out and total recalculates

**Dependencies:**
- Requires valid club selection before activation
- Stock sensitivity: live inventory affects available options
- Pricing depends on club count from Choose-Your-Clubs selection

---

## 5. Grip & Specifications

| Field                     | Options                 | Effect                           |
| ------------------------- | ----------------------- | -------------------------------- |
| **Grip Brand / Model**    | Dropdown                | Adds attribute, no price change  |
| **Shaft Length (inches)** | Standard · options list | Attribute only                   |
| **Lie Adjustment**        | –1° · 0° · +1° etc.     | Attribute only                   |

**Rules:**
- Always enabled once shaft model + flex is valid
- No price impact; values added as cart attributes only
- Required for Add to Cart button activation

---

## 6. Estimated Shipping

**Display:** Grey bar above Add to Cart button

**Content:** "Estimated Shipping Date: 2-4 weeks from order date."

---

## 7. Add to Cart Button

**Activation Rules:**
- Disabled until: set size chosen, shaft model + flex chosen, grip chosen
- Tooltip on disabled state names missing field
- Enabled only when all required steps are valid

**Click Action:**
- Adds **real product variants** to cart with properties:
  - `bundleId`: Unique timestamp-based identifier (e.g., `golf-1755882372496`)
  - `hand`: Selected hand preference
  - `setSize`: Selected set size (4PW, 5PW, 6PW)
  - `club_list`: JSON array of selected clubs (e.g., `["5","6","7","8","9","PW"]`)
  - `shaft_variant_id`: Selected shaft variant ID
  - `shaft_name`: Shaft display name
  - `grip`: Selected grip specification
  - `length`: Selected shaft length
  - `lie`: Selected lie adjustment

**Feedback:**
- Toast: "Custom X-PW set added – Shaft Model Flex, Grip"
- Cart badge shows club counter (hidden shaft line not counted)

---

## 8. Cart & Checkout Display

**Customer View:**
- Shopper sees **one iron set line** with consolidated attributes
- Attributes displayed: hand, grip, length, lie
- Cart total matches live configurator total exactly

**Backend Processing:**
- Wrapper product triggers cart transformation
- Transform function creates proper bundle representation
- Final cart maintains pricing integrity

---

## 9. Error Handling & Edge Cases

| Situation                            | Response                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| Option goes out of stock mid-session | Flex greys out, total recalculates, tooltip: "Sold out"                        |
| Wrapper fails to transform           | Cart page banner: "Couldn't configure your set — please refresh or contact us" |
| Shopper switches hand mid-build      | Downstream selections reset, price resets to base                               |
| Invalid club selection               | Add to Cart remains disabled, tooltip shows requirement                         |
| Missing required specifications      | Add to Cart disabled, tooltip identifies missing field                          |

---

## UI Activation Chain (Preact Signals)

The configurator follows a strict activation sequence managed through reactive signals:

```javascript
// Computed signals for activation state
const handSelected = computed(() => selectedHand.value !== null);
const setSizeSelected = computed(() => selectedSetSize.value !== null);
const clubsSelected = computed(() => selectedClubs.value.length >= 5);
const shaftSelected = computed(() => selectedShaft.value !== null);
const specsSelected = computed(() => 
  selectedGrip.value && selectedLength.value && selectedLie.value
);
const canAddToCart = computed(() => 
  handSelected.value && setSizeSelected.value && 
  clubsSelected.value && shaftSelected.value && specsSelected.value
);
```

1. **Hand Selector** (if both hands available)
   - Appears only if both hands exist
   - Changing hand clears all later selections via signal effects
   - `selectedHand` signal controls downstream activation

2. **Set-Size Selection**
   - Enabled when `handSelected.value === true`
   - Updates head price in label via computed signal
   - `selectedSetSize` signal triggers price recalculation

3. **Choose-Your-Clubs Grid**
   - Enabled when `setSizeSelected.value === true`
   - Total price and club counter via computed signals
   - `selectedClubs` array signal manages grid state

4. **Shaft Picker**
   - Brand dropdown enabled when `clubsSelected.value === true`
   - Material pills conditional on brand inventory via computed signals
   - Model/Flex options computed from brand + material + hand signals
   - Price bump calculated reactively per club count

5. **Grip and Spec Dropdowns**
   - Enabled when `shaftSelected.value === true`
   - No price impact, attribute-only signals
   - Form validation via computed signals

6. **Add to Cart Button**
   - Enabled via `canAddToCart` computed signal
   - Creates real product variants with complete bundle data

---

## Pricing Logic (Reactive Signals)

**Formula:** Total = Iron Set Price + (Shaft Price × Club Count)

**Computed Pricing Signals:**
```javascript
// Base iron set pricing signal
const ironSetPrices = signal({
  '4PW': 1239.00, // 7 clubs
  '5PW': 1062.00, // 6 clubs  
  '6PW': 885.00   // 5 clubs
});

// Computed base price based on selected set size
const basePrice = computed(() => 
  ironSetPrices.value[selectedSetSize.value] || 0
);

// Computed club count from selected clubs
const clubCount = computed(() => selectedClubs.value.length);

// Computed shaft pricing
const shaftPrice = computed(() => 
  selectedShaft.value ? selectedShaft.value.price : 0
);

// Reactive total price calculation
const totalPrice = computed(() => 
  basePrice.value + (shaftPrice.value * clubCount.value)
);
```

**Actual Iron Set Prices:**
- 4-PW: £1,239.00 (7 clubs)
- 5-PW: £1,062.00 (6 clubs)  
- 6-PW: £885.00 (5 clubs)

**Shaft Pricing:**
- Each shaft has individual pricing (£150.00-£160.00)
- Shaft cost multiplied by number of clubs in set
- Example: 5-PW with £150 shaft = £1,062.00 + (£150.00 × 6) = £1,962.00

**Reactive Price Updates:**
- Set size selection updates `basePrice` signal immediately
- Shaft selection updates `shaftPrice` signal and `totalPrice` recomputes
- Club selection changes trigger `clubCount` and `totalPrice` updates
- Grip, length, and lie selections do not influence price
- All prices fetched live from Shopify Products API and stored in signals

**Dependencies:**
- Iron set product variants must be available in store
- Shaft product variants must be available with current pricing
- Real-time inventory affects available options and pricing
- Uses actual Shopify product pricing, not calculated surcharges