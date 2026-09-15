import { gridDisk, gridDistance } from 'h3-js';

import { cellCenter, H3_RESOLUTION, pointToCell } from '@/containers/map/utils';
import {
  DEFAULT_WATER_LEVEL,
  type WaterLevelFormValues,
} from '@/containers/monitoring/water-level/schema';
import {
  thresholdAt,
  type WaterBand,
} from '@/containers/monitoring/water-level/utils';
import { type WaterZone } from '@/containers/monitoring/water-level/zones';

type Thresholds = WaterLevelFormValues['thresholds'];

const DEVICE_IMAGE = '/images/water-level-sensor.webp';

const WIDE_RINGS = 2;
const SMALL_CELLS = 4;

const SEED_RING = WIDE_RINGS + 2;

const DANGER_OVERSHOOT = 1.5;

const SATELLITES = [
  { id: 'zone-2', band: 'caution', deviceName: 'WL-02' },
  { id: 'zone-3', band: 'warning', deviceName: 'WL-03' },
  { id: 'zone-4', band: 'danger', deviceName: 'WL-04' },
] as const satisfies readonly {
  id: string;
  band: WaterBand;
  deviceName: string;
}[];

/**
 * One level per band, derived from the thresholds in the form so the sample map
 * keeps showing all four colours when the user retunes them.
 */
const mockLevels = (thresholds: Thresholds): Record<WaterBand, number> => {
  const safe = thresholdAt(thresholds, 'safe');
  const caution = thresholdAt(thresholds, 'caution');
  const warning = thresholdAt(thresholds, 'warning');

  return {
    safe: safe / 2,
    caution: (safe + caution) / 2,
    warning: (caution + warning) / 2,
    danger: warning * DANGER_OVERSHOOT,
  };
};

const bearing = (from: [number, number], h3: string) => {
  const [lng, lat] = cellCenter(h3);
  return Math.atan2(lat - from[1], lng - from[0]);
};

/** Cells on one ring, spaced evenly around the middle. */
const spreadSeeds = (middle: string, ring: number, count: number): string[] => {
  const from = cellCenter(middle);
  const cells = gridDisk(middle, ring)
    .filter((h3) => gridDistance(h3, middle) === ring)
    .sort((a, b) => bearing(from, a) - bearing(from, b));

  return Array.from(
    { length: count },
    (_, index) =>
      cells[Math.round((index * cells.length) / count) % cells.length],
  );
};

export const buildMockWaterLevel = (
  center: [number, number],
  resolution: number = H3_RESOLUTION,
  thresholds: Thresholds = DEFAULT_WATER_LEVEL.thresholds,
): WaterZone[] => {
  const middle = pointToCell(...center, resolution);
  const wide = gridDisk(middle, WIDE_RINGS);
  const covered = new Set(wide);
  const levels = mockLevels(thresholds);

  const seeds = spreadSeeds(middle, SEED_RING, SATELLITES.length);

  const satellites = SATELLITES.map(({ id, band, deviceName }, index) => {
    const seed = seeds[index];
    const cells = gridDisk(seed, 1)
      .filter((h3) => !covered.has(h3))
      .slice(0, SMALL_CELLS);

    cells.forEach((h3) => covered.add(h3));

    return {
      id,
      area: null,
      cells,
      at: cellCenter(seed),
      deviceH3: seed,
      level: levels[band],
      deviceName,
      deviceImage: DEVICE_IMAGE,
    };
  });

  return [
    {
      id: 'zone-1',
      area: null,
      cells: wide,
      at: cellCenter(middle),
      deviceH3: middle,
      level: levels.safe,
      deviceName: 'WL-01',
      deviceImage: DEVICE_IMAGE,
    },
    ...satellites,
  ];
};
