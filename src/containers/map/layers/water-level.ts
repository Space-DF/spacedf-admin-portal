import {
  type ExpressionSpecification,
  type FilterSpecification,
  Map as MapLibreMap,
} from 'maplibre-gl';

import {
  EMPTY_DATA,
  setSourceData,
  setVisible,
} from '@/containers/map/layers/shared';
import {
  type WaterColumn,
  type WaterLevelOverlay,
  type WaterZoneShape,
} from '@/containers/map/types';
import {
  cellsToOutline,
  cellToFeature,
  H3_RESOLUTION,
  resolutionRadius,
} from '@/containers/map/utils';

const COVERAGE_SOURCE = 'water-coverage';
const COVERAGE_FILL_LAYER = 'water-coverage-fill';
const COVERAGE_LINE_LAYER = 'water-coverage-line';

const OUTLINE_SOURCE = 'water-zone-outline';
const OUTLINE_LAYER = 'water-zone-outline';

const COLUMN_SOURCE = 'water-column';
const COLUMN_BASE_LAYER = 'water-column-base';
const COLUMN_GLASS_LAYER = 'water-column-glass';
const COLUMN_GLASS_DIM_LAYER = 'water-column-glass-dim';
const WATER_LAYER = 'water-column-water';
const WATER_DIM_LAYER = 'water-column-water-dim';

const REFERENCE_HEIGHT_M = 280;
const COLUMN_ASPECT = REFERENCE_HEIGHT_M / resolutionRadius(H3_RESOLUTION);

export const columnHeight = (resolution: number): number =>
  resolutionRadius(resolution) * COLUMN_ASPECT;

const WATER_INSET = 0.82;

/** No zone has an empty id, so this filter draws nothing. */
const NOTHING: FilterSpecification = ['==', ['get', 'zoneId'], ''];

const forZone = (zoneId: string): FilterSpecification => [
  '==',
  ['get', 'zoneId'],
  zoneId,
];

const COVERAGE_FILL_OPACITY = 0.5;
const COVERAGE_LINE_OPACITY = 0.8;

const COLUMN_BASE_OPACITY = 0.95;
const WATER_OPACITY = 0.85;
const COLUMN_GLASS_OPACITY = 0.16;

export const UNSELECTED = 0.4;

const focusOpacity = (
  zoneId: string | null,
  full: number,
): ExpressionSpecification | number =>
  zoneId
    ? ['case', ['==', ['get', 'zoneId'], zoneId], full, full * UNSELECTED]
    : full;

const selection = new WeakMap<MapLibreMap, string | null>();

const picking = new WeakMap<MapLibreMap, ((zoneId: string) => void) | null>();

export const setZonePick = (
  map: MapLibreMap,
  pick: ((zoneId: string) => void) | null,
) => {
  picking.set(map, pick);
};

const drawn = new WeakMap<
  MapLibreMap,
  { zones: WaterZoneShape[]; columns: WaterColumn[]; resolution: number }
>();

type ZoneShapes = {
  id: string;
  color: string;
  coverage: GeoJSON.Feature[];
  outline: GeoJSON.Feature;
};

const shaped = new WeakMap<string[], ZoneShapes>();

const zoneShapes = ({ id, cells, color }: WaterZoneShape): ZoneShapes => {
  const held = shaped.get(cells);
  if (held && held.id === id && held.color === color) return held;

  const built: ZoneShapes = {
    id,
    color,
    coverage: cells.map((h3) => cellToFeature(h3, { zoneId: id, color })),
    outline: {
      type: 'Feature',
      properties: { zoneId: id, color },
      geometry: cellsToOutline(cells),
    },
  };
  shaped.set(cells, built);
  return built;
};

const coverageData = (zones: WaterZoneShape[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: zones.flatMap((zone) => zoneShapes(zone).coverage),
});

const outlineData = (zones: WaterZoneShape[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: zones.map((zone) => zoneShapes(zone).outline),
});

const columnData = (
  columns: WaterColumn[],
  resolution: number,
): GeoJSON.FeatureCollection => {
  const height = columnHeight(resolution);
  return {
    type: 'FeatureCollection',
    features: columns.flatMap(({ id, h3, color, fill }) => [
      cellToFeature(h3, { kind: 'tube', zoneId: id, color, height }),
      cellToFeature(
        h3,
        { kind: 'water', zoneId: id, color, height: fill * height },
        WATER_INSET,
      ),
    ]),
  };
};

type ColumnKind = 'tube' | 'water';

const ofKind = (kind: ColumnKind): ExpressionSpecification => [
  '==',
  ['get', 'kind'],
  kind,
];

const addColumnExtrusion = (
  map: MapLibreMap,
  id: string,
  kind: ColumnKind,
  opacity: number,
) => {
  map.addLayer({
    id,
    type: 'fill-extrusion',
    source: COLUMN_SOURCE,
    filter: ofKind(kind),
    paint: {
      'fill-extrusion-color': ['get', 'color'],
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': opacity,
      ...(kind === 'tube' && { 'fill-extrusion-vertical-gradient': false }),
    },
  });
};

const setColumnFocus = (map: MapLibreMap, zoneId: string | null) => {
  const holding = (
    kind: ColumnKind,
    selected: boolean,
  ): FilterSpecification => {
    if (!zoneId) return selected ? ofKind(kind) : NOTHING;
    const inZone: ExpressionSpecification = ['==', ['get', 'zoneId'], zoneId];
    return ['all', ofKind(kind), selected ? inZone : ['!', inZone]];
  };

  map.setFilter(WATER_LAYER, holding('water', true));
  map.setFilter(WATER_DIM_LAYER, holding('water', false));
  map.setFilter(COLUMN_GLASS_LAYER, holding('tube', true));
  map.setFilter(COLUMN_GLASS_DIM_LAYER, holding('tube', false));
};

const addWaterLayers = (map: MapLibreMap) => {
  map.addSource(COVERAGE_SOURCE, { type: 'geojson', data: EMPTY_DATA });
  map.addLayer({
    id: COVERAGE_FILL_LAYER,
    type: 'fill',
    source: COVERAGE_SOURCE,
    paint: {
      'fill-color': ['get', 'color'],
      'fill-opacity': COVERAGE_FILL_OPACITY,
    },
  });
  map.addLayer({
    id: COVERAGE_LINE_LAYER,
    type: 'line',
    source: COVERAGE_SOURCE,
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 1,
      'line-opacity': COVERAGE_LINE_OPACITY,
    },
  });

  map.addSource(OUTLINE_SOURCE, { type: 'geojson', data: EMPTY_DATA });
  map.addLayer({
    id: OUTLINE_LAYER,
    type: 'line',
    source: OUTLINE_SOURCE,
    filter: NOTHING,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': 2.5 },
  });

  map.addSource(COLUMN_SOURCE, { type: 'geojson', data: EMPTY_DATA });

  map.addLayer({
    id: COLUMN_BASE_LAYER,
    type: 'fill',
    source: COLUMN_SOURCE,
    filter: ['==', ['get', 'kind'], 'tube'],
    paint: {
      'fill-color': ['get', 'color'],
      'fill-opacity': COLUMN_BASE_OPACITY,
    },
  });

  addColumnExtrusion(map, WATER_LAYER, 'water', WATER_OPACITY);
  addColumnExtrusion(map, WATER_DIM_LAYER, 'water', WATER_OPACITY * UNSELECTED);
  addColumnExtrusion(map, COLUMN_GLASS_LAYER, 'tube', COLUMN_GLASS_OPACITY);
  addColumnExtrusion(
    map,
    COLUMN_GLASS_DIM_LAYER,
    'tube',
    COLUMN_GLASS_OPACITY * UNSELECTED,
  );
};

const setHoveredZone = (map: MapLibreMap, zoneId: string | null) => {
  if (!map.getLayer(OUTLINE_LAYER)) return;
  const outlined = zoneId ?? selection.get(map) ?? null;
  map.setFilter(OUTLINE_LAYER, outlined ? forZone(outlined) : NOTHING);
};

/**
 * Bound once, with the layers. Hit-testing runs against the coverage fill, so
 * a hidden Coverage layer simply stops producing hovers — and it still works
 * on a `readOnly` map, where `interactive: false` only drops the pan and zoom
 * handlers, not event delivery.
 */
const bindZoneHover = (map: MapLibreMap) => {
  map.on('mousemove', COVERAGE_FILL_LAYER, (e) => {
    const zoneId = e.features?.[0]?.properties?.zoneId as string | undefined;
    if (zoneId) setHoveredZone(map, zoneId);
  });
  map.on('mouseleave', COVERAGE_FILL_LAYER, () => setHoveredZone(map, null));
};

const bindZonePick = (map: MapLibreMap) => {
  const cursor = (shape: string) => () => {
    if (picking.get(map)) map.getCanvas().style.cursor = shape;
  };

  map.on('click', COVERAGE_FILL_LAYER, (e) => {
    const zoneId = e.features?.[0]?.properties?.zoneId as string | undefined;
    if (zoneId) picking.get(map)?.(zoneId);
  });
  map.on('mouseenter', COVERAGE_FILL_LAYER, cursor('pointer'));
  map.on('mouseleave', COVERAGE_FILL_LAYER, cursor(''));
};

export const syncWaterLevel = (
  map: MapLibreMap,
  { resolution, zones, columns, selectedZoneId, show }: WaterLevelOverlay,
) => {
  if (!map.getSource(COVERAGE_SOURCE)) {
    addWaterLayers(map);
    bindZoneHover(map);
    bindZonePick(map);
    // Fresh sources hold nothing, whatever the map was drawing before.
    drawn.delete(map);
  }

  const last = drawn.get(map);

  if (!last || last.zones !== zones) {
    setSourceData(map, COVERAGE_SOURCE, coverageData(zones));
    setSourceData(map, OUTLINE_SOURCE, outlineData(zones));
  }

  // Columns are cheap, but their height is cut to fit the cells they stand in.
  if (!last || last.columns !== columns || last.resolution !== resolution) {
    setSourceData(map, COLUMN_SOURCE, columnData(columns, resolution));
  }

  drawn.set(map, { zones, columns, resolution });

  const selected = selectedZoneId ?? null;
  selection.set(map, selected);
  setHoveredZone(map, null);
  map.setPaintProperty(
    COVERAGE_FILL_LAYER,
    'fill-opacity',
    focusOpacity(selected, COVERAGE_FILL_OPACITY),
  );
  map.setPaintProperty(
    COVERAGE_LINE_LAYER,
    'line-opacity',
    focusOpacity(selected, COVERAGE_LINE_OPACITY),
  );

  map.setPaintProperty(
    COLUMN_BASE_LAYER,
    'fill-opacity',
    focusOpacity(selected, COLUMN_BASE_OPACITY),
  );
  setColumnFocus(map, selected);

  // The outline rides with the coverage, so switching it off can't strand a
  // highlight that nothing is hit-testing any more.
  setVisible(
    map,
    [COVERAGE_FILL_LAYER, COVERAGE_LINE_LAYER, OUTLINE_LAYER],
    show.coverage,
  );
  setVisible(
    map,
    [
      COLUMN_BASE_LAYER,
      WATER_LAYER,
      WATER_DIM_LAYER,
      COLUMN_GLASS_LAYER,
      COLUMN_GLASS_DIM_LAYER,
    ],
    show.columns,
  );
  // `show.devices` is not handled here: the device tags are HTML, positioned
  // over the canvas by `DeviceTags` rather than drawn as map layers.
};
