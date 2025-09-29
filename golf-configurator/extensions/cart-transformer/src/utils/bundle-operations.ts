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
export function generateBundleTitle(_metadata: BundleMetadata, _group: TypedCartLine[]): string {
  return 'Custom Set';
}

/**
 * Creates customer-friendly bundle attributes for checkout display
 */
export function createBundleAttributes(metadata: BundleMetadata, group: TypedCartLine[]): BundleAttribute[] {
  const shaftComponent = group.find((item) => item.componentType?.value === BUNDLE_CONFIG.COMPONENT_TYPES.SHAFT);
  const mainComponent = group.find((item) => item.componentType?.value === BUNDLE_CONFIG.COMPONENT_TYPES.MAIN);

  const attributes: BundleAttribute[] = [];

  // 1. Set Option (e.g., "6-PW")
  attributes.push({
    key: 'Set Option',
    value: metadata._setSize,
  });

  // 2. Lie Angle
  const lie = mainComponent?.lie?.value;
  if (lie) {
    attributes.push({
      key: 'Lie Angle',
      value: lie,
    });
  }

  // 3. Shaft (brand and flex combined)
  const shaftBrand = shaftComponent?.shaftBrand?.value;
  const shaftFlex = shaftComponent?.shaftFlex?.value;
  if (shaftBrand) {
    const shaftValue = shaftFlex && !shaftBrand.includes(shaftFlex) ? `${shaftBrand} ${shaftFlex}` : shaftBrand;

    attributes.push({
      key: 'Shaft',
      value: shaftValue,
    });
  }

  // 4. Length - only show if explicitly set (not Standard)
  const shaftLength = shaftComponent?.shaftLength?.value;
  if (shaftLength) {
    attributes.push({
      key: 'Length',
      value: shaftLength,
    });
  }

  // 5. Grip
  const grip = mainComponent?.grip?.value;
  if (grip) {
    attributes.push({
      key: 'Grip',
      value: grip,
    });
  }

  return attributes;
}
