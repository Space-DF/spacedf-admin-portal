import { formatHex, hsl } from 'culori';

import { getContrastColor } from '@/lib/utils';

import { PresetColors } from '@/containers/white-label/brand-customization/components/brand-style/presets';

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const parsed = hsl(hex);
  if (!parsed) return { h: 0, s: 0, l: 0 };
  return {
    h: parsed.h !== undefined ? parsed.h : 0,
    s: parsed.s !== undefined ? parsed.s : 0,
    l: parsed.l !== undefined ? parsed.l : 0,
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const hex = formatHex({ mode: 'hsl', h, s, l });
  return hex ? hex.toUpperCase() : '#000000';
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

// Keep a hue inside the [0, 360) range so harmony offsets wrap cleanly.
const normalizeHue = (h: number): number => ((h % 360) + 360) % 360;

// Build a color from a hue with clamped saturation/lightness for safety.
const shade = (h: number, s: number, l: number): string =>
  hslToHex(normalizeHue(h), clamp(s, 0, 1), clamp(l, 0, 1));

/**
 * Picks the most usable brand color from the extracted palette: the most
 * vibrant one that is neither too dark nor too washed out. Falls back to the
 * SpaceDF brand purple when nothing suitable is found.
 */
const getBaseBrandColor = (colors: string[]): string => {
  if (colors.length === 0) return '#6E4AFF';

  const scored = colors
    .map((hex) => ({ hex, ...hexToHsl(hex) }))
    .filter((c) => c.s > 0.12 && c.l > 0.12 && c.l < 0.92)
    // Prefer saturated colors sitting in a comfortable mid-lightness band so
    // the chosen primary works well as a button/accent surface.
    .sort((a, b) => {
      const score = (c: typeof a) => c.s * (1 - Math.abs(c.l - 0.5));
      return score(b) - score(a);
    });

  return scored.length > 0 ? scored[0].hex : colors[0];
};

// Nudges an extreme brand color into a usable range so it reads well as the
// primary action color while preserving its hue/identity.
const normalizePrimary = (hex: string): string => {
  const { h, s, l } = hexToHsl(hex);
  return shade(h, Math.max(s, 0.35), clamp(l, 0.32, 0.62));
};

/**
 * Generates a complete, contrast-aware theme (all 14 keys of `PresetColors`)
 * from a brand primary and a harmony accent hue. Neutrals are subtly tinted
 * with the brand hue for a cohesive, designed feel.
 */
const buildThemeColors = (
  primaryHex: string,
  accentHue: number,
  // Scales accent saturation: 1 keeps the brand vibrancy, <1 gives a more
  // muted/neutral feel. Accents stay in the brand's hue family either way.
  accentSatScale: number,
  isLight: boolean,
): PresetColors => {
  const { h: nh, s: ps } = hexToHsl(primaryHex);
  const as = ps * accentSatScale;

  if (isLight) {
    return {
      primary: primaryHex,
      primary_text: getContrastColor(primaryHex),
      secondary: shade(accentHue, clamp(as * 0.5, 0.05, 0.4), 0.95),
      secondary_text: shade(accentHue, clamp(as * 0.65, 0.18, 0.7), 0.3),
      accent: shade(accentHue, clamp(as * 0.4, 0.04, 0.32), 0.94),
      accent_text: shade(accentHue, clamp(as * 0.7, 0.22, 0.78), 0.38),
      background: shade(nh, 0.06, 0.99),
      border: shade(nh, 0.1, 0.9),
      text: shade(nh, 0.16, 0.13),
      support_text: shade(nh, 0.1, 0.46),
      card: '#FFFFFF',
      switch_background: shade(nh, 0.08, 0.92),
      input: '#FFFFFF',
      input_border: shade(nh, 0.1, 0.88),
    };
  }

  return {
    primary: primaryHex,
    primary_text: getContrastColor(primaryHex),
    secondary: shade(accentHue, clamp(as * 0.4, 0.08, 0.4), 0.2),
    secondary_text: shade(accentHue, clamp(as * 0.35, 0.1, 0.5), 0.86),
    accent: shade(accentHue, clamp(as * 0.35, 0.06, 0.32), 0.17),
    accent_text: shade(accentHue, clamp(as * 0.55, 0.2, 0.72), 0.7),
    background: shade(nh, 0.14, 0.08),
    border: shade(nh, 0.14, 0.19),
    text: shade(nh, 0.08, 0.96),
    support_text: shade(nh, 0.1, 0.62),
    card: shade(nh, 0.14, 0.12),
    switch_background: shade(nh, 0.14, 0.16),
    input: shade(nh, 0.16, 0.1),
    input_border: shade(nh, 0.14, 0.2),
  };
};

export interface SuggestedPalette {
  id: number;
  colors: PresetColors;
  // 4 representative colors rendered as the palette preview swatch.
  swatch: string[];
}

// Harmony schemes for the suggested palettes. To keep results on-brand we stay
// inside the analogous range (small hue offsets) and create variety through
// warm/cool nudges and saturation rather than clashing complementary hues.
// `'extracted'` reuses a second extracted logo color as the accent.
const PALETTE_SCHEMES: {
  id: number;
  accentOffset: number | 'extracted';
  accentSatScale: number;
}[] = [
  { id: 1, accentOffset: 0, accentSatScale: 1 }, // Brand monochrome
  { id: 2, accentOffset: 25, accentSatScale: 1 }, // Warm analogous
  { id: 3, accentOffset: -25, accentSatScale: 1 }, // Cool analogous
  { id: 4, accentOffset: 0, accentSatScale: 0.3 }, // Refined neutral
  { id: 5, accentOffset: 'extracted', accentSatScale: 1 }, // Logo blend
  { id: 6, accentOffset: 12, accentSatScale: 1.25 }, // Vivid brand
];

export const generateSuggestedPalettes = (
  extractedColors: string[],
  isLightMode: boolean,
): SuggestedPalette[] => {
  const baseColor = getBaseBrandColor(extractedColors);
  const primary = normalizePrimary(baseColor);
  const primaryHue = hexToHsl(primary).h;

  // Hue of a secondary extracted color, used by the "extracted blend" scheme.
  // We only accept it if it stays reasonably close to the brand hue, otherwise
  // a stray logo color could clash; fall back to a gentle analogous shift.
  const extractedAccent = extractedColors.find((c) => {
    const { h, s } = hexToHsl(c);
    if (c === baseColor || s <= 0.1) return false;
    const distance = Math.abs(normalizeHue(h - primaryHue));
    return Math.min(distance, 360 - distance) <= 45;
  });
  const extractedAccentHue = extractedAccent
    ? hexToHsl(extractedAccent).h
    : primaryHue + 35;

  return PALETTE_SCHEMES.map(({ id, accentOffset, accentSatScale }) => {
    const accentHue =
      accentOffset === 'extracted'
        ? extractedAccentHue
        : primaryHue + accentOffset;

    const colors = buildThemeColors(
      primary,
      accentHue,
      accentSatScale,
      isLightMode,
    );

    return {
      id,
      colors,
      swatch: [
        colors.primary,
        colors.accent_text,
        colors.text,
        colors.background,
      ],
    };
  });
};
