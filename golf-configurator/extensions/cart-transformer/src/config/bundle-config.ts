/**
 * Bundle Configuration
 * Static constants and business rules for cart transformation
 * No fallback values - fail fast approach
 */

export const BUNDLE_CONFIG = {
  // Component type identifiers
  COMPONENT_TYPES: {
    MAIN: 'main',
    SHAFT: 'shaft',
  } as const,

  // Bundle type identifier
  BUNDLE_TYPE: 'golf_configurator',

  // Cart attribute keys
  ATTRIBUTE_KEYS: {
    BUNDLE_TYPE: '_bundle_type',
    BUNDLE_DESCRIPTION: '_bundle_description',
    BUNDLE_HAND: '_bundle_hand',
    BUNDLE_CLUBS: '_bundle_clubs',
    BUNDLE_SET_SIZE: '_bundle_set_size',
  } as const,

  // Title generation templates
  TITLE_TEMPLATES: {
    BASE: 'Custom Golf Iron Set - {setSize}',
    WITH_SHAFT: 'Custom Golf Iron Set - {setSize} with {shaft}',
  } as const,

  // Required metadata properties for validation
  REQUIRED_PROPERTIES: [
    'hand',
    'setSize',
    'parentVariantId',
    'bundleId',
  ] as const,

  // Bundle component summary template
  BUNDLE_DESCRIPTION_TEMPLATE: 'Complete golf set: {components}',
} as const;

// Note: Type definitions removed as they were unused