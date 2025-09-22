/**
 * Bundle operations utilities
 * Pure functions for cart transformation business logic
 */

import { BUNDLE_CONFIG } from '../config/bundle-config';
import type {
  TypedCartLine,
  BundleGroups,
  BundleMetadata,
  BundleAttribute,
  ComponentSummary
} from '../types/bundle-types';
import { validateClubList } from './validation';

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
  const shaftComponent = group.find((item) =>
    item.componentType?.value === BUNDLE_CONFIG.COMPONENT_TYPES.SHAFT
  );

  const shaftInfo = shaftComponent?.shaftBrand?.value ||
                   shaftComponent?.shaftTitle?.value;
  const shaftFlex = shaftComponent?.shaftFlex?.value;

  // Generate base title
  let title = BUNDLE_CONFIG.TITLE_TEMPLATES.BASE.replace('{setSize}', metadata.setSize);

  // Add shaft information if available
  if (shaftInfo) {
    let shaftDisplay = shaftInfo;
    if (shaftFlex && !shaftInfo.includes(shaftFlex)) {
      shaftDisplay += ` ${shaftFlex}`;
    }
    title = BUNDLE_CONFIG.TITLE_TEMPLATES.WITH_SHAFT
      .replace('{setSize}', metadata.setSize)
      .replace('{shaft}', shaftDisplay);
  }

  return title;
}

/**
 * Creates component summaries for bundle description (internal function)
 */
function createComponentSummaries(group: TypedCartLine[]): ComponentSummary[] {
  return group.map((item) => {
    const componentType = item.componentType?.value || BUNDLE_CONFIG.COMPONENT_TYPES.MAIN;
    const bundleSummary = item._bundle_summary?.value;

    return {
      type: componentType,
      summary: bundleSummary || `${componentType} component`,
    };
  });
}

/**
 * Generates bundle description from component summaries (internal function)
 */
function generateBundleDescription(summaries: ComponentSummary[]): string {
  const components = summaries.map(s => s.summary).join(' + ');
  return BUNDLE_CONFIG.BUNDLE_DESCRIPTION_TEMPLATE.replace('{components}', components);
}

/**
 * Creates bundle attributes for cart operation
 */
export function createBundleAttributes(metadata: BundleMetadata, group: TypedCartLine[]): BundleAttribute[] {
  const clubCount = validateClubList(metadata.clubList);
  const summaries = createComponentSummaries(group);
  const bundleDescription = generateBundleDescription(summaries);

  return [
    {
      key: BUNDLE_CONFIG.ATTRIBUTE_KEYS.BUNDLE_TYPE,
      value: BUNDLE_CONFIG.BUNDLE_TYPE,
    },
    {
      key: BUNDLE_CONFIG.ATTRIBUTE_KEYS.BUNDLE_DESCRIPTION,
      value: bundleDescription,
    },
    {
      key: BUNDLE_CONFIG.ATTRIBUTE_KEYS.BUNDLE_HAND,
      value: metadata.hand,
    },
    {
      key: BUNDLE_CONFIG.ATTRIBUTE_KEYS.BUNDLE_CLUBS,
      value: clubCount.toString(),
    },
    {
      key: BUNDLE_CONFIG.ATTRIBUTE_KEYS.BUNDLE_SET_SIZE,
      value: metadata.setSize,
    },
  ];
}