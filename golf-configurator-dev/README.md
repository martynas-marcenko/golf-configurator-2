# Golf Configurator - Development Environment

This directory contains the **development environment** for the Golf Club Configurator built with **Preact + Signals + shadcn/ui**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server with mock data
npm run dev
# Opens http://localhost:3000

# Watch mode (rebuilds to Shopify extension)
npm run build:watch

# Production build
npm run build
```

## 📁 Project Structure

```
golf-configurator-dev/
├── src/
│   ├── components/              # Preact UI components
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── GolfConfigurator.jsx # Main configurator
│   │   ├── HandSelector.jsx     # Hand preference selector
│   │   ├── IronSetSelector.jsx  # Iron set options (4-PW, 5-PW, 6-PW)
│   │   ├── ClubGrid.jsx         # Interactive club selection
│   │   ├── ShaftPicker.jsx      # Shaft brand/variant picker
│   │   ├── CartSummary.jsx      # Price summary & add to cart
│   │   └── Toast.jsx            # Notification system
│   ├── hooks/
│   │   └── useGolfState.js      # Signal-based state management
│   ├── services/                # Data services
│   │   ├── ProductService.js    # Real Shopify Products API
│   │   ├── ShaftService.js      # Real Shopify shaft variants
│   │   ├── MockProductService.js # 🧪 Mock product data
│   │   └── MockShaftService.js   # 🧪 Mock shaft data
│   ├── mocks/
│   │   └── mockShopifyData.js   # 🧪 Realistic Shopify data
│   ├── utils/
│   │   └── formatters.js        # Price formatting utilities
│   ├── lib/
│   │   └── utils.js             # General utilities (cn helper)
│   ├── styles.css               # Global styles + Tailwind
│   └── main.jsx                 # App entry point
├── index.html                   # Development HTML page
├── vite.config.js              # Build configuration
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
└── package.json                # Dependencies & scripts
```

## 🛠️ Development Modes

### 1. **UI Development Mode** (Recommended for frontend work)

```bash
npm run dev
```

- **Fast HMR**: Instant updates on file changes
- **Mock Data**: Realistic Shopify data without API dependencies
- **Isolated Testing**: Focus purely on UI/UX
- **Responsive Design**: Test all screen sizes
- **URL**: `http://localhost:3000`

### 2. **Integrated Development Mode** (With real Shopify data)

```bash
# Terminal 1: Auto-rebuild
npm run build:watch

# Terminal 2: Shopify dev server (from root)
cd .. && npm run dev
```

- **Real Data**: Live Shopify Products API
- **Cart Integration**: Real cart functionality
- **Theme Context**: Full Shopify liquid environment
- **Auto-rebuild**: Changes trigger automatic rebuilds

## 🧪 Mock Data System

The development environment includes comprehensive mock services that simulate real Shopify APIs:

### **Mock Product Service**

- **Iron Variants**: 4-PW (£1239), 5-PW (£1062), 6-PW (£885)
- **Real Variant IDs**: Uses actual production variant IDs
- **Inventory Simulation**: Realistic stock levels

### **Mock Shaft Service**

- **Brands**: KBS Tour Lite, KBS Tour Matte Black, Fujikura Axiom, UST Mamiya
- **Variants**: Regular, Stiff, Extra Stiff options
- **Pricing**: £150-£160 per shaft
- **API Simulation**: Matches real ShaftService behavior

### **Mock Cart API**

- **Add to Cart**: Simulates `/cart/add.js` endpoint
- **Bundle Support**: Generates proper bundleId structure
- **Error Simulation**: Realistic success/failure responses

## 🎯 Environment Detection

The app automatically detects the environment and switches data sources:

```javascript
// Automatic service selection
const isDevelopment = import.meta.env.DEV;
export const productService = isDevelopment ? new MockProductService() : new ProductService();
```

**Development Mode Indicators:**

- Console logs prefixed with `🧪 Mock:`
- Blue "🧪 Development Mode - Mock Data" badge
- Fast response times (simulated delays)

## 📦 Build Output

Builds are automatically output to the Shopify theme extension:

```
extensions/golf-builder-configurator/assets/
├── golf-configurator.bundle.js   # ~50KB minified
└── golf-configurator.bundle.css  # ~18KB minified
```

**Build Configuration:**

- **Target**: ES2018 (broad browser support)
- **Minification**: Terser for JS, native for CSS
- **Tree Shaking**: Removes unused code
- **Source Maps**: Disabled for production

## 🎨 UI Components

Built with **shadcn/ui** components for consistent design:

- **Button**: Primary actions (Add to Cart, club selection)
- **Card**: Section containers and information display
- **Select**: Dropdowns (shaft selection, specifications)
- **Custom Components**: Golf-specific UI (club grid, price display)

**Styling:**

- **Tailwind CSS**: Utility-first styling
- **CSS Variables**: Theme-based color system
- **Dark Mode**: Automatic system preference detection
- **Responsive**: Mobile-first design

## 🔄 State Management

Uses **Preact Signals** for reactive state:

```javascript
// Global reactive state
export const selectedHand = signal(null);
export const selectedIronSet = signal(null);
export const selectedClubs = signal([]);

// Computed values
export const totalPrice = computed(() => {
  // Automatically updates when dependencies change
});
```

**Benefits:**

- **Automatic Updates**: UI updates when state changes
- **Performance**: Only affected components re-render
- **Simple API**: No reducers or complex setup
- **Debugging**: Clear state inspection in dev tools

## 🚀 Deployment

### **Development Preview**

```bash
npm run dev
# Test at http://localhost:3000
```

### **Shopify Integration**

```bash
npm run build           # Build production bundles
cd .. && npm run deploy  # Deploy to Shopify store
```

### **Production Testing**

```bash
npm run build:watch     # Auto-rebuild on changes
cd .. && npm run dev     # Test in real Shopify environment
```

## 🐛 Troubleshooting

### **Common Issues**

**Dev server won't start:**

- Check if port 3000 is occupied: `lsof -ti:3000`
- Change port in `vite.config.js`

**Mock data not loading:**

- Check browser console for import errors
- Verify mock files exist in `src/mocks/`

**Builds not updating:**

- Ensure `npm run build:watch` is running
- Check output directory permissions

**HMR not working:**

- Save files properly (Ctrl/Cmd + S)
- Check Vite dev server status in terminal

### **Debug Commands**

```bash
# Check build output
npm run build -- --debug

# Analyze bundle size
npm run build -- --analyze

# Check dependencies
npm list
```

## 📋 Scripts Reference

```bash
npm run dev            # Vite dev server with HMR
npm run build          # Production build to assets/
npm run build:watch    # Watch mode for integration
npm run preview        # Preview production build
npm run lint           # ESLint code checking
```

---

**🎯 Perfect for rapid UI development while maintaining full Shopify integration capabilities!**
