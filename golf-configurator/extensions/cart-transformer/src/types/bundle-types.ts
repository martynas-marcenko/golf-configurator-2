/**
 * TypeScript interfaces for cart transformer
 * Proper type definitions without 'as any' casts
 */

import type { CartTransformRunInput } from '../../generated/api';

// Bundle metadata interface
export interface BundleMetadata {
  _hand: string;
  _setSize: string;
  _parentVariantId: string;
  _bundleId: string;
  _club_list: string;
  _component_type: string;
}

// Extended cart line with typed attributes (uses intersection to preserve base properties)
export type TypedCartLine = CartTransformRunInput['cart']['lines'][0] & {
  bundleId?: { value: string };
  parentVariantId?: { value: string };
  hand?: { value: string };
  setSize?: { value: string };
  clubList?: { value: string };
  componentType?: { value: string };
  shaftBrand?: { value: string };
  shaftFlex?: { value: string };
  shaftLength?: { value: string };
  grip?: { value: string };
  lie?: { value: string };
  clubCount?: { value: string };
};

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
