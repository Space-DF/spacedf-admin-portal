import { Map as MapLibreMap } from 'maplibre-gl';

import { EMPTY_DATA, setSourceData } from '@/containers/map/layers/shared';
import {
  cellsToFeatureCollection,
  DEFAULT_ZONE_COLOR,
} from '@/containers/map/utils';

const ZONE_SOURCE = 'h3-zone';
const ZONE_FILL_LAYER = 'h3-zone-fill';
const ZONE_LINE_LAYER = 'h3-zone-line';

/** Added after the grid, so selected cells stand out against it. */
export const addZoneLayers = (
  map: MapLibreMap,
  color: string = DEFAULT_ZONE_COLOR,
) => {
  if (map.getSource(ZONE_SOURCE)) return;

  map.addSource(ZONE_SOURCE, { type: 'geojson', data: EMPTY_DATA });
  map.addLayer({
    id: ZONE_FILL_LAYER,
    type: 'fill',
    source: ZONE_SOURCE,
    paint: { 'fill-color': color, 'fill-opacity': 0.45 },
  });
  map.addLayer({
    id: ZONE_LINE_LAYER,
    type: 'line',
    source: ZONE_SOURCE,
    paint: { 'line-color': color, 'line-width': 2, 'line-opacity': 0.9 },
  });
};

export const removeZoneLayers = (map: MapLibreMap) => {
  if (!map.getSource(ZONE_SOURCE)) return;
  map.removeLayer(ZONE_FILL_LAYER);
  map.removeLayer(ZONE_LINE_LAYER);
  map.removeSource(ZONE_SOURCE);
};

export const setZoneColor = (map: MapLibreMap, color: string) => {
  if (!map.getLayer(ZONE_FILL_LAYER)) return;
  map.setPaintProperty(ZONE_FILL_LAYER, 'fill-color', color);
  map.setPaintProperty(ZONE_LINE_LAYER, 'line-color', color);
};

export const setZoneCells = (map: MapLibreMap, cells: Iterable<string>) =>
  setSourceData(map, ZONE_SOURCE, cellsToFeatureCollection(cells));
