/**
 * Default Values and Constants
 * Single source of truth for default state values
 */

export const HAND_OPTIONS = [
  { id: 'Left Handed', name: 'Left Hand' },
  { id: 'Right Handed', name: 'Right Hand' },
];

export const AVAILABLE_CLUBS = [
  { id: '4', name: '4-Iron', type: 'iron', isRequired: false, isOptional: true },
  { id: '5', name: '5-Iron', type: 'iron', isRequired: false, isOptional: true },
  { id: '6', name: '6-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '7', name: '7-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '8', name: '8-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: '9', name: '9-Iron', type: 'iron', isRequired: true, isOptional: false },
  { id: 'PW', name: 'Pitching Wedge', type: 'wedge', isRequired: true, isOptional: false },
];

const DEFAULT_CLUB_IDS = ['6', '7', '8', '9', 'PW'];
export const DEFAULT_CLUBS = AVAILABLE_CLUBS.filter((club) => DEFAULT_CLUB_IDS.includes(club.id));

export const SHAFT_LENGTHS = [
  '-2"',
  '-1.75"',
  '-1.5"',
  '-1.25"',
  '-1"',
  '-0.75"',
  '-0.5"',
  '-0.25"',
  'Standard',
  '+0.25"',
  '+0.5"',
  '+0.75"',
  '+1"',
  '+1.25"',
  '+1.5"',
  '+1.75"',
  '+2"',
];

export const DEFAULT_STATE_VALUES = {
  selectedHand: null,
  selectedClubs: [...DEFAULT_CLUBS],
  selectedShafts: {},
  selectedGrip: null,
  selectedLie: 'Standard',
  selectedShaftBrand: '',
  selectedShaftFlex: '',
  selectedShaftLength: 'Standard',
};
