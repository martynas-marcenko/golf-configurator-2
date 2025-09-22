/**
 * TypeScript interfaces for cart transformer
 * Proper type definitions without 'as any' casts
 */

import type { CartTransformRunInput } from '../../generated/api';

// Bundle metadata interface
export interface BundleMetadata {
  hand: string;
  setSize: string;
  parentVariantId: string;
  bundleId: string;
  clubList: string;
  componentType: string;
}

// Extended cart line with typed properties (uses intersection to preserve base properties)
export type TypedCartLine = CartTransformRunInput['cart']['lines'][0] & {
  hand?: { value: string };
  setSize?: { value: string };
  parentVariantId?: { value: string };
  bundleId?: { value: string };
  componentType?: { value: string };
  clubList?: { value: string };
  club_list?: { value: string };
  shaftBrand?: { value: string };
  shaftTitle?: { value: string };
  shaftFlex?: { value: string };
  shaftLength?: { value: string };
  grip?: { value: string };
  lie?: { value: string };
  _bundle_summary?: { value: string };
}

// Grouped items by bundle ID
export type BundleGroups = Record<string, TypedCartLine[]>;

// Bundle attribute for cart operation
export interface BundleAttribute {
  key: string;
  value: string;
}


// Component summary for bundle description
export interface ComponentSummary {
  type: string;
  summary: string;
}