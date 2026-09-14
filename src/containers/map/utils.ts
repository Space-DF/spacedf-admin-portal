import type GeoJSON from 'geojson';
import {
  cellArea,
  cellsToMultiPolygon,
  cellToBoundary,
  cellToLatLng,
  getHexagonAreaAvg,
  getHexagonEdgeLengthAvg,
  gridDistance,
  gridPathCells,
  isValidCell,
  latLngToCell,
  POLYGON_TO_CELLS_FLAGS,
  polygonToCells,
  polygonToCellsExperimental,
} from 'h3-js';

import { MonitoringArea } from '@/types';

export type H3Bounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type H3FeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Polygon,
  { h3: string }
>;

export const H3_RESOLUTION = 10;

/** Zone colour used until a caller has a water level to colour it by. */
export const DEFAULT_ZONE_COLOR = '#6D28D9';

export const CELL_SIZE_RESOLUTIONS = [8, 9, 10, 11, 12, 13] as const;

export const resolutionArea = (
  resolution: number,
  at?: [number, number],
): number =>
  at
    ? cellArea(latLngToCell(at[1], at[0], resolution), 'm2')
    : getHexagonAreaAvg(resolution, 'm2');

export const resolutionRadius = (resolution: number): number =>
  getHexagonEdgeLengthAvg(resolution, 'm');

export const radiusToResolution = (radius: number): number => {
  if (!Number.isFinite(radius)) return H3_RESOLUTION;
  return CELL_SIZE_RESOLUTIONS.reduce((closest, resolution) =>
    Math.abs(resolutionRadius(resolution) - radius) <
    Math.abs(resolutionRadius(closest) - radius)
      ? resolution
      : closest,
  );
};

export type AreaMeasure = { value: string; unit: 'm²' | 'ha' };

export const squareMetresMeasure = (area: number): AreaMeasure =>
  area < 10000
    ? { value: Math.round(area).toLocaleString(), unit: 'm²' }
    : {
        value: (area / 10000).toLocaleString(undefined, {
          maximumFractionDigits: 1,
        }),
        unit: 'ha',
      };

export const formatSquareMetres = (area: number): string => {
  const { value, unit } = squareMetresMeasure(area);
  return `${value} ${unit}`;
};

export const cellAreaMeasure = (
  resolution: number,
  at?: [number, number],
): AreaMeasure => squareMetresMeasure(resolutionArea(resolution, at));

export const formatCellArea = (
  resolution: number,
  at?: [number, number],
): string => formatSquareMetres(resolutionArea(resolution, at));

export const MAX_VISIBLE_CELLS = 8000;

const GRID_ZOOM_HEADROOM = 0.7;

export const cellCenter = (h3: string): [number, number] => {
  const [lat, lng] = cellToLatLng(h3);
  return [lng, lat];
};

export const cellToFeature = <P extends GeoJSON.GeoJsonProperties>(
  h3: string,
  properties: P,
  scale = 1,
): GeoJSON.Feature<GeoJSON.Polygon, P> => {
  const boundary = cellToBoundary(h3, true);
  boundary.push(boundary[0]);
  const [centerLng, centerLat] = cellCenter(h3);
  const ring =
    scale === 1
      ? boundary
      : boundary.map(([lng, lat]) => [
          centerLng + (lng - centerLng) * scale,
          centerLat + (lat - centerLat) * scale,
        ]);
  return {
    type: 'Feature',
    properties,
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
};

export const cellsToOutline = (cells: string[]): GeoJSON.MultiPolygon => ({
  type: 'MultiPolygon',
  coordinates: cellsToMultiPolygon(cells, true),
});

export const cellsToFeatureCollection = (
  h3Ids: Iterable<string>,
): H3FeatureCollection => ({
  type: 'FeatureCollection',
  features: Array.from(h3Ids, (h3) => cellToFeature(h3, { h3 })),
});

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(Math.max(v, lo), hi);

/** Rough viewport area in km² (equirectangular approximation). */
const viewportAreaKm2 = (b: H3Bounds): number => {
  const midLat = (b.north + b.south) / 2;
  const widthKm =
    (b.east - b.west) * 111.32 * Math.cos((midLat * Math.PI) / 180);
  const heightKm = (b.north - b.south) * 110.574;
  return Math.abs(widthKm * heightKm);
};

export const zoomToFitGrid = (
  bounds: H3Bounds,
  currentZoom: number,
  resolution: number,
): number => {
  const centre: [number, number] = [
    (bounds.east + bounds.west) / 2,
    (bounds.north + bounds.south) / 2,
  ];
  const cellKm2 = resolutionArea(resolution, centre) / 1e6;
  const budgetKm2 = MAX_VISIBLE_CELLS * cellKm2 * GRID_ZOOM_HEADROOM;
  const overshoot = viewportAreaKm2(bounds) / budgetKm2;
  if (!Number.isFinite(overshoot) || overshoot <= 1) return currentZoom;
  return currentZoom + Math.log2(overshoot) / 2;
};

const envelope = (rings: number[][][]): H3Bounds | null => {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      if (lng < west) west = lng;
      if (lng > east) east = lng;
      if (lat < south) south = lat;
      if (lat > north) north = lat;
    }
  }

  return Number.isFinite(west) ? { west, south, east, north } : null;
};

/** Cells covering `ring`, the ones it only clips included: a shape drawn on
 * screen should come back whole, not shy a cell along every edge. */
export const cellsInRing = (
  ring: number[][],
  resolution: number = H3_RESOLUTION,
): string[] => {
  const closed = ring.map(([lng, lat]) => [
    clamp(lng, -180, 180),
    clamp(lat, -85, 85),
  ]);
  if (closed.length < 3) return [];

  const [firstLng, firstLat] = closed[0];
  const [lastLng, lastLat] = closed[closed.length - 1];
  if (firstLng !== lastLng || firstLat !== lastLat)
    closed.push([firstLng, firstLat]);

  const bounds = envelope([closed]);
  if (!bounds) return [];

  const { west, south, east, north } = bounds;
  if (!(north > south) || !(east > west)) return [];

  const cellKm2 = cellArea(
    latLngToCell((north + south) / 2, (east + west) / 2, resolution),
    'km2',
  );
  if (viewportAreaKm2(bounds) / cellKm2 > MAX_VISIBLE_CELLS) return [];

  try {
    return polygonToCellsExperimental(
      [closed],
      resolution,
      POLYGON_TO_CELLS_FLAGS.containmentOverlapping,
      true,
    );
  } catch {
    try {
      return polygonToCells([closed], resolution, true);
    } catch {
      return [];
    }
  }
};

export const cellsInBounds = (
  bounds: H3Bounds,
  resolution: number = H3_RESOLUTION,
): string[] => {
  const south = Math.min(bounds.south, bounds.north);
  const north = Math.max(bounds.south, bounds.north);
  const west = Math.min(bounds.west, bounds.east);
  const east = Math.max(bounds.west, bounds.east);

  return cellsInRing(
    [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
    ],
    resolution,
  );
};

/** GeoJSON grid of fixed-size H3 cells covering `bounds` (empty if too large). */
export const buildH3Grid = (
  bounds: H3Bounds,
  resolution: number = H3_RESOLUTION,
): H3FeatureCollection =>
  cellsToFeatureCollection(cellsInBounds(bounds, resolution));

export const cellsArea = (cells: string[]): number =>
  cells.reduce((total, h3) => total + cellArea(h3, 'm2'), 0);

export const cellsBounds = (cells: Iterable<string>): H3Bounds | null =>
  envelope(Array.from(cells, (h3) => cellToBoundary(h3, true)));

export const areaBounds = (
  area: MonitoringArea | null | undefined,
): H3Bounds | null =>
  area ? envelope(area.flatMap((polygon) => polygon)) : null;

export const pointToCell = (
  lng: number,
  lat: number,
  resolution: number = H3_RESOLUTION,
): string => latLngToCell(lat, lng, resolution);

/** Centre of a ring, good enough to anchor a polygon too thin to hold a cell. */
const ringCentre = (ring: number[][]): [number, number] => {
  const total = ring.reduce(
    ([sumLng, sumLat], [lng, lat]) => [sumLng + lng, sumLat + lat],
    [0, 0],
  );
  return [total[0] / ring.length, total[1] / ring.length];
};

const EARTH_RADIUS_M = 6371007.180918475;

/** Spherical excess of one ring, signed so holes subtract from their polygon. */
const ringArea = (ring: number[][]): number => {
  if (ring.length < 4) return 0;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  let total = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];
    total +=
      (rad(lng2) - rad(lng1)) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return (total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2;
};

export const areaSquareMetres = (
  area: MonitoringArea | null | undefined,
): number =>
  area
    ? Math.abs(
        area.reduce(
          (total, polygon) =>
            total + polygon.reduce((sum, ring) => sum + ringArea(ring), 0),
          0,
        ),
      )
    : 0;

export const areaFitsResolution = (
  area: MonitoringArea | null | undefined,
  resolution: number = H3_RESOLUTION,
  budget: number = MAX_VISIBLE_CELLS,
): boolean => {
  if (!area) return true;
  const bounds = areaBounds(area);
  if (!bounds) return true;
  const centre: [number, number] = [
    (bounds.east + bounds.west) / 2,
    (bounds.north + bounds.south) / 2,
  ];
  return areaSquareMetres(area) / resolutionArea(resolution, centre) <= budget;
};

export const areaToCells = (
  area: MonitoringArea | null | undefined,
  resolution: number = H3_RESOLUTION,
): string[] => {
  if (!area || !areaFitsResolution(area, resolution)) return [];

  const cells = new Set<string>();
  for (const polygon of area) {
    if (!polygon.length) continue;
    let covered: string[] = [];
    try {
      covered = polygonToCells(polygon, resolution, true);
    } catch {
      covered = [];
    }
    if (!covered.length)
      covered = [pointToCell(...ringCentre(polygon[0]), resolution)];
    covered.forEach((h3) => cells.add(h3));
  }

  return Array.from(cells).filter(isValidCell);
};

export const areaCellCount = (
  area: MonitoringArea | null | undefined,
  resolution: number = H3_RESOLUTION,
): number => {
  if (!area) return 0;
  if (areaFitsResolution(area, resolution))
    return areaToCells(area, resolution).length;

  const bounds = areaBounds(area);
  if (!bounds) return 0;
  const centre: [number, number] = [
    (bounds.east + bounds.west) / 2,
    (bounds.north + bounds.south) / 2,
  ];
  return Math.round(
    areaSquareMetres(area) / resolutionArea(resolution, centre),
  );
};

const AREA_TOLERANCE = 0.3;

export const areaPreserved = (
  area: MonitoringArea | null | undefined,
  cells: string[],
): boolean => {
  const before = areaSquareMetres(area);
  if (!before) return true;
  return Math.abs(cellsArea(cells) / before - 1) <= AREA_TOLERANCE;
};

export const shiftArea = (
  area: MonitoringArea,
  deltaLng: number,
  deltaLat: number,
): MonitoringArea =>
  area.map((polygon) =>
    polygon.map((ring) =>
      ring.map(([lng, lat]) => [lng + deltaLng, lat + deltaLat]),
    ),
  );

export type CellCentre = { h3: string; at: [number, number] };

export const cellCentres = (cells: Iterable<string>): CellCentre[] =>
  Array.from(cells, (h3) => ({ h3, at: cellCenter(h3) }));

export const nearestCell = (
  to: [number, number],
  centres: CellCentre[],
): string | null => {
  const squeeze = Math.cos((to[1] * Math.PI) / 180);

  let nearest: string | null = null;
  let shortest = Infinity;

  for (const { h3, at } of centres) {
    const east = (at[0] - to[0]) * squeeze;
    const north = at[1] - to[1];
    const distance = east * east + north * north;
    if (distance < shortest) {
      shortest = distance;
      nearest = h3;
    }
  }

  return nearest;
};

/** How far a cell may reach back to its zone. Further off, the trail would be
 * more cells than a monitoring area is meant to hold, so there is none. */
export const MAX_LINK_CELLS = 200;

export const cellPath = (
  from: string,
  to: string,
  limit: number = MAX_LINK_CELLS,
): string[] => {
  try {
    // H3 walks the grid in local coordinates, which it cannot always hold:
    // far apart, or across a pentagon, it throws instead of answering.
    return gridDistance(from, to) > limit ? [] : gridPathCells(from, to);
  } catch {
    return [];
  }
};

export const cellsToArea = (cells: Iterable<string>): MonitoringArea =>
  cellsToMultiPolygon(Array.from(cells), true);
