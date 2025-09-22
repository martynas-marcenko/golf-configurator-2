/**
 * Bundle operations utilities
 * Pure functions for cart transformation business logic
 */

import { BUNDLE_CONFIG } from '../config/bundle-config';
import type { TypedCartLine, BundleGroups, BundleMetadata, BundleAttribute } from '../types/bundle-types';

/**
 * Groups cart lines by bundle ID
 */
export function groupItemsByBundle(lines: TypedCartLine[]): BundleGroups {
  const groupedItems: BundleGroups = {};

  lines.forEach((line) => {
    const bundleId = line.bundleId?.value;

    if (bundleId) {
      if (!groupedItems[bundleId]) {
        groupedItems[bundleId] = [];
      }
      groupedItems[bundleId].push(line);
    }
  });

  return groupedItems;
}

/**
 * Calculates total price for a bundle group
 */
export function calculateBundlePrice(group: TypedCartLine[]): number {
  return group.reduce((sum, item) => {
    const itemPrice = parseFloat(item.cost.amountPerQuantity.amount);
    return sum + itemPrice * item.quantity;
  }, 0);
}

/**
 * Generates bundle title based on components and configuration
 */
export function generateBundleTitle(metadata: BundleMetadata, group: TypedCartLine[]): string {
  // Find shaft component for title enhancement
  const shaftComponent = group.find((item) => item.componentType?.value === BUNDLE_CONFIG.COMPONENT_TYPES.SHAFT);

  const shaftInfo = shaftComponent?.shaftBrand?.value;
  const shaftFlex = shaftComponent?.shaftFlex?.value;

  // Generate base title
  let title = BUNDLE_CONFIG.TITLE_TEMPLATES.BASE.replace('{setSize}', metadata._setSize);

  // Add shaft information if available
  if (shaftInfo) {
    let shaftDisplay = shaftInfo;
    if (shaftFlex && !shaftInfo.includes(shaftFlex)) {
      shaftDisplay += ` ${shaftFlex}`;
    }
    title = BUNDLE_CONFIG.TITLE_TEMPLATES.WITH_SHAFT.replace('{setSize}', metadata._setSize).replace(
      '{shaft}',
      shaftDisplay
    );
  }

  return title;
}

/**
 * Creates customer-friendly bundle attributes for checkout display
 */
export function createBundleAttributes(metadata: BundleMetadata, group: TypedCartLine[]): BundleAttribute[] {
  const shaftComponent = group.find((item) => item.componentType?.value === BUNDLE_CONFIG.COMPONENT_TYPES.SHAFT);
  const mainComponent = group.find((item) => item.componentType?.value === BUNDLE_CONFIG.COMPONENT_TYPES.MAIN);

  const attributes: BundleAttribute[] = [
    // Clean component breakdown for customer understanding
    {
      key: 'Components',
      value: createComponentsDisplay(group, metadata),
    },

    // Configuration details (only relevant ones)
    {
      key: 'Hand',
      value: metadata._hand,
    },
  ];

  // Add shaft length if available
  const shaftLength = shaftComponent?.shaftLength?.value;
  if (shaftLength && shaftLength !== 'Standard') {
    attributes.push({
      key: 'Length',
      value: shaftLength,
    });
  }

  // Add grip if available
  const grip = mainComponent?.grip?.value;
  if (grip) {
    attributes.push({
      key: 'Grip',
      value: grip,
    });
  }

  // Add lie if available
  const lie = mainComponent?.lie?.value;
  if (lie) {
    attributes.push({
      key: 'Lie',
      value: lie,
    });
  }

  return attributes;
}

/**
 * Creates a clean display of bundle components for customer checkout
 */
function createComponentsDisplay(group: TypedCartLine[], metadata: BundleMetadata): string {
  const components: string[] = [];

  group.forEach((item) => {
    const componentType = item.componentType?.value || BUNDLE_CONFIG.COMPONENT_TYPES.MAIN;

    if (componentType === BUNDLE_CONFIG.COMPONENT_TYPES.SHAFT) {
      // Shaft component: "5 × Fujikura Axiom Stiff Shafts"
      const brand = item.shaftBrand?.value;
      const flex = item.shaftFlex?.value;
      const count = item.quantity;

      let shaftDisplay = `${count} × ${brand}`;
      if (flex) {
        shaftDisplay += ` ${flex}`;
      }
      shaftDisplay += ` Shaft${count > 1 ? 's' : ''}`;

      components.push(shaftDisplay);
    } else {
      // Main component: "1 × Iron Set (6-PW)"
      const setSize = metadata._setSize;
      components.push(`1 × Iron Set (${setSize})`);
    }
  });

  return components.join(' + ');
}
