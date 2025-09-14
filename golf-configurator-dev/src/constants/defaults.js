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

export const CONFIGURATOR_STEPS = [
  { name: 'Club', active: true },
  { name: 'Shaft', active: false },
  { name: 'Grip', active: false },
  { name: 'Review', active: false },
];

export const IRON_NUMBERS = ['4', '5', '6', '7', '8', '9', 'P'];

// Club business rules
export const REQUIRED_CLUBS = ['6', '7', '8', '9', 'PW'];
export const OPTIONAL_CLUBS = ['4', '5'];
export const CLUB_BUSINESS_RULES = {
  // 4-iron requires 5-iron
  dependencies: {
    '4': ['5']
  },
  // Required clubs cannot be deselected
  locked: REQUIRED_CLUBS.map(id => id === 'PW' ? 'P' : id)
};

export const GRIP_DATA = {
  'Golf Pride': {
    models: ['Tour Velvet', 'MCC', 'MCC Plus4'],
    sizes: ['Standard', 'Midsize', 'Jumbo'],
  },
  Lamkin: {
    models: ['Crossline', 'UTx', 'ST Soft'],
    sizes: ['Standard', 'Midsize', 'Jumbo'],
  },
  Winn: {
    models: ['DriTac', 'Excel', 'Grips Wrap'],
    sizes: ['Standard', 'Midsize'],
  },
};

export const SHAFT_LEAD_TIMES = {
  KBS: '2-4 weeks',
  Axiom: '1-2 weeks',
  'LA Golf': '3-5 weeks',
  'True Temper': '2-3 weeks',
  Fujikura: '4-6 weeks',
};

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
