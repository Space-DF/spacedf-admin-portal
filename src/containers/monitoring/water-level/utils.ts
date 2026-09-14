import { radiusToResolution, resolutionRadius } from '@/containers/map/utils';
import {
  DEFAULT_WATER_LEVEL,
  type WaterLevelFormValues,
} from '@/containers/monitoring/water-level/schema';

import { type MonitoringSetting, type UpdateMonitoringPayload } from '@/types';

type Thresholds = WaterLevelFormValues['thresholds'];

export type WaterBand = keyof WaterLevelFormValues['zoneColors'];

export const thresholdAt = (thresholds: Thresholds, band: keyof Thresholds) =>
  Number.isFinite(thresholds[band])
    ? thresholds[band]
    : DEFAULT_WATER_LEVEL.thresholds[band];

export const levelBand = (level: number, thresholds: Thresholds): WaterBand => {
  if (level < thresholdAt(thresholds, 'safe')) return 'safe';
  if (level < thresholdAt(thresholds, 'caution')) return 'caution';
  if (level <= thresholdAt(thresholds, 'warning')) return 'warning';
  return 'danger';
};

const CM_PER_METRE = 100;

export const waterDepthToMetres = (
  depth: number | null | undefined,
): number | null =>
  typeof depth === 'number' && Number.isFinite(depth)
    ? depth / CM_PER_METRE
    : null;

const COLUMN_SCALE = 2;

export const columnFill = (level: number, thresholds: Thresholds): number =>
  Math.min(
    Math.max(level / (thresholdAt(thresholds, 'warning') * COLUMN_SCALE), 0),
    1,
  );

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const meters = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const color = (value: string | undefined, fallback: string): string =>
  typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback;

const flag = (value: boolean | undefined, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

export const toWaterLevelFormValues = (
  setting: MonitoringSetting,
): WaterLevelFormValues => {
  const {
    thresholds: defaultThresholds,
    zoneColors: defaultColors,
    display: defaultDisplay,
  } = DEFAULT_WATER_LEVEL;
  const { thresholds, colors, display_settings: display } = setting;

  return {
    cellResolution: radiusToResolution(setting.cell_size),
    thresholds: {
      safe: meters(thresholds?.safe, defaultThresholds.safe),
      caution: meters(thresholds?.caution, defaultThresholds.caution),
      warning: meters(thresholds?.warning, defaultThresholds.warning),
    },
    zoneColors: {
      safe: color(colors?.safe, defaultColors.safe),
      caution: color(colors?.caution, defaultColors.caution),
      warning: color(colors?.warning, defaultColors.warning),
      danger: color(colors?.danger, defaultColors.danger),
    },
    display: {
      waterColumn: flag(display?.water_column, defaultDisplay.waterColumn),
      coverage: flag(display?.coverage, defaultDisplay.coverage),
    },
  };
};

export const toMonitoringPayload = (
  values: WaterLevelFormValues,
): UpdateMonitoringPayload => ({
  cell_size: Math.round(resolutionRadius(values.cellResolution)),
  type: 'water_level',
  thresholds: values.thresholds,
  colors: values.zoneColors,
  display_settings: {
    coverage: values.display.coverage,
    water_column: values.display.waterColumn,
  },
});
