import type { CartTransformRunInput, CartTransformRunResult } from '../generated/api';
import type { TypedCartLine } from './types/bundle-types';
import { validateBundleMetadata, extractBundleMetadata } from './utils/validation';
import {
  groupItemsByBundle,
  calculateBundlePrice,
  generateBundleTitle,
  createBundleAttributes,
} from './utils/bundle-operations';
import { Logger } from './utils/logger';

export function cartTransformRun(input: CartTransformRunInput): CartTransformRunResult {
  const lines = input.cart.lines as TypedCartLine[];

  // Log transformation start
  Logger.start(lines.length);

  // Process each line and log details
  lines.forEach((line, index) => {
    const bundleId = line.bundleId?.value;
    Logger.lineProcessing(index, line.id, bundleId);
  });

  // Group items by bundle ID
  const groupedItems = groupItemsByBundle(lines);
  Logger.bundleGroups(Object.keys(groupedItems));

  // Create transformation operations
  const operations = Object.entries(groupedItems).map(([bundleId, group]) => {
    Logger.bundleProcessing(bundleId, group.length);
    Logger.componentAnalysis(group);

    // Use first item as representative (all items should have identical metadata)
    const firstItem = group[0];
    Logger.metadataExtraction(firstItem);

    // Validate and extract metadata (fail-fast approach)
    validateBundleMetadata(firstItem);
    const metadata = extractBundleMetadata(firstItem);

    // Calculate bundle price and generate title
    const totalPrice = calculateBundlePrice(group);
    const currency = firstItem.cost.amountPerQuantity.currencyCode;
    const title = generateBundleTitle(metadata, group);
    const clubCount = JSON.parse(metadata._club_list).length;

    // Log results
    Logger.bundleResults(title, totalPrice, currency, clubCount);
    Logger.parentVariant(metadata._parentVariantId);

    // Create bundle attributes
    const attributes = createBundleAttributes(metadata, group);

    return {
      linesMerge: {
        cartLines: group.map((line) => ({
          cartLineId: line.id,
          quantity: line.quantity,
        })),
        title,
        parentVariantId: metadata._parentVariantId,
        attributes,
      },
    };
  });

  Logger.complete(operations.length);

  return {
    operations,
  };
}
