import { defaultDarkColors, defaultLightColors } from '../../schema';

export interface PresetColors {
  primary: string;
  primary_text: string;
  secondary: string;
  secondary_text: string;
  accent: string;
  accent_text: string;
  background: string;
  border: string;
  text: string;
  support_text: string;
  card: string;
  switch_background: string;
  input: string;
  input_border: string;
}

export interface PresetRadius {
  button: number;
  input: number;
  card: number;
}

export interface BrandPreset {
  id: string;
  nameKey: string;
  // 4 representative colors rendered as the preset swatch icon.
  swatch: string[];
  lightColors: PresetColors;
  darkColors: PresetColors;
  radius: PresetRadius;
}

// Most presets share the default border radius; only specific presets override.
const DEFAULT_PRESET_RADIUS: PresetRadius = { button: 8, input: 8, card: 6 };
const MAX_PRESET_RADIUS: PresetRadius = { button: 24, input: 24, card: 24 };

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: 'default',
    nameKey: 'preset_default',
    swatch: ['#282828', '#FFFFFF', '#666666', '#6009FF'],
    lightColors: defaultLightColors,
    darkColors: defaultDarkColors,
    radius: DEFAULT_PRESET_RADIUS,
  },
  {
    id: 'cyberpink',
    nameKey: 'preset_cyberpink',
    swatch: ['#FF1E7B', '#FEFBFC', '#1D1619', '#FFDAE9'],
    lightColors: {
      primary: '#FF1E7B',
      primary_text: '#FCFCFC',
      secondary: '#FFDAE9',
      secondary_text: '#282828',
      accent: '#F9EBEE',
      accent_text: '#835964',
      background: '#FCF5F7',
      border: '#E1CAD3',
      text: '#282828',
      support_text: '#9E858B',
      card: '#FFFFFF',
      switch_background: '#EAE2E4',
      input: '#FFFFFF',
      input_border: '#E0E2E7',
    },
    darkColors: {
      primary: '#FF1E7B',
      primary_text: '#FCFCFC',
      secondary: '#430F25',
      secondary_text: '#FCFCFC',
      accent: '#341D22',
      accent_text: '#BC8594',
      background: '#1D1619',
      border: '#3C213C',
      text: '#FCFCFC',
      support_text: '#78686E',
      card: '#2B1C22',
      switch_background: '#0F070A',
      input: '#220411',
      input_border: '#4A333D',
    },
    radius: DEFAULT_PRESET_RADIUS,
  },
  {
    id: 'aurora',
    nameKey: 'preset_aurora',
    swatch: ['#1DB8CE', '#FFFFFF', '#ECF4F4', '#0F4B55'],
    lightColors: {
      primary: '#1DB8CE',
      primary_text: '#FCFCFC',
      secondary: '#D7E9EB',
      secondary_text: '#0F4B55',
      accent: '#D7E9EB',
      accent_text: '#0F4B55',
      background: '#ECF4F4',
      border: '#D5E3E4',
      text: '#282828',
      support_text: '#637389',
      card: '#F9F9F9',
      switch_background: '#D9E2E2',
      input: '#FFFFFF',
      input_border: '#D5E3E4',
    },
    darkColors: {
      primary: '#1DB8CE',
      primary_text: '#FCFCFC',
      secondary: '#173C46',
      secondary_text: '#A7C7D5',
      accent: '#102A31',
      accent_text: '#A7C7D5',
      background: '#0E1A1F',
      border: '#1B333C',
      text: '#A7C7D5',
      support_text: '#72849D',
      card: '#0A2026',
      switch_background: '#0B1418',
      input: '#0B1418',
      input_border: '#D5E3E4',
    },
    radius: MAX_PRESET_RADIUS,
  },
  {
    id: 'sandstone',
    nameKey: 'preset_sandstone',
    swatch: ['#CB6441', '#FBF8F1', '#141414', '#F4E7E2'],
    lightColors: {
      primary: '#CB6441',
      primary_text: '#FCFCFC',
      secondary: '#EAE7DE',
      secondary_text: '#3E3E38',
      accent: '#F3E8E4',
      accent_text: '#884A35',
      background: '#FBF8F1',
      border: '#E1E1DA',
      text: '#141414',
      support_text: '#85837D',
      card: '#FFFFFF',
      switch_background: '#EAE7DE',
      input: '#FFFFFF',
      input_border: '#E1E1DA',
    },
    darkColors: {
      primary: '#CB6441',
      primary_text: '#FCFCFC',
      secondary: '#715C55',
      secondary_text: '#FCFCFC',
      accent: '#362A26',
      accent_text: '#A36854',
      background: '#272220',
      border: '#342B28',
      text: '#FCFCFC',
      support_text: '#C3C1BA',
      card: '#1D1716',
      switch_background: '#181413',
      input: '#2D2928',
      input_border: '#574F4D',
    },
    radius: DEFAULT_PRESET_RADIUS,
  },
];
