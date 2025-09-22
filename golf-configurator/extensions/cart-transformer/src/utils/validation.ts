/**
 * Validation utilities for cart transformer
 * Fail-fast approach with no fallback values
 */

import { BUNDLE_CONFIG } from '../config/bundle-config';
import type { TypedCartLine, BundleMetadata } from '../types/bundle-types';

/**
 * Validates that a cart line has all required bundle metadata
 * Throws error immediately if any required property is missing
 */
export function validateBundleMetadata(item: TypedCartLine): void {
  const missing: string[] = [];

  for (const property of BUNDLE_CONFIG.REQUIRED_PROPERTIES) {
    const value = (item as any)[property]?.value;
    if (!value) {
      missing.push(property);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required bundle metadata: ${missing.join(', ')}. ` +
      `Item ID: ${item.id}. ` +
      `All bundle items must have complete metadata from cart properties.`
    );
  }
}

/**
 * Extracts bundle metadata from a cart line
 * Assumes validation has already passed
 */
export function extractBundleMetadata(item: TypedCartLine): BundleMetadata {
  // Get club list from either snake_case or camelCase property
  const clubList = item.club_list?.value || item.clubList?.value || '';

  return {
    hand: item.hand!.value,
    setSize: item.setSize!.value,
    parentVariantId: item.parentVariantId!.value,
    bundleId: item.bundleId!.value,
    clubList,
    componentType: item.componentType?.value || BUNDLE_CONFIG.COMPONENT_TYPES.MAIN,
  };
}

/**
 * Validates that club list is valid JSON
 */
export function validateClubList(clubListJson: string): number {
  if (!clubListJson) {
    throw new Error('Club list is empty - cart properties must include valid club selection');
  }

  try {
    const clubs = JSON.parse(clubListJson);
    if (!Array.isArray(clubs)) {
      throw new Error('Club list must be a JSON array');
    }
    return clubs.length;
  } catch (error) {
    throw new Error(`Invalid club list JSON: ${clubListJson}. Error: ${error}`);
  }
}