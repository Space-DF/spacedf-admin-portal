import { Map as MapLibreMap } from 'maplibre-gl';

import { EMPTY_DATA, setSourceData } from '@/containers/map/layers/shared';
import {
  cellsToFeatureCollection,
  DEFAULT_ZONE_COLOR,
} from '@/containers/map/utils';

const LINK_SOURCE = 'h3-zone-link';
const LINK_FILL_LAYER = 'h3-zone-link-fill';
const LINK_LINE_LAYER = 'h3-zone-link-line';

export const addZoneLinkLayer = (
  map: MapLibreMap,
  color: string = DEFAULT_ZONE_COLOR,
) => {
  if (map.getSource(LINK_SOURCE)) return;

  map.addSource(LINK_SOURCE, { type: 'geojson', data: EMPTY_DATA });
  map.addLayer({
    id: LINK_FILL_LAYER,
    type: 'fill',
    source: LINK_SOURCE,
    paint: { 'fill-color': color, 'fill-opacity': 0.18 },
  });
  map.addLayer({
    id: LINK_LINE_LAYER,
    type: 'line',
    source: LINK_SOURCE,
    paint: {
      'line-color': color,
      'line-width': 1.5,
      'line-opacity': 0.45,
      'line-dasharray': [2, 2],
    },
  });
};

export const removeZoneLinkLayer = (map: MapLibreMap) => {
  if (!map.getSource(LINK_SOURCE)) return;
  map.removeLayer(LINK_FILL_LAYER);
  map.removeLayer(LINK_LINE_LAYER);
  map.removeSource(LINK_SOURCE);
};

export const setZoneLinkColor = (map: MapLibreMap, color: string) => {
  if (!map.getLayer(LINK_FILL_LAYER)) return;
  map.setPaintProperty(LINK_FILL_LAYER, 'fill-color', color);
  map.setPaintProperty(LINK_LINE_LAYER, 'line-color', color);
};

export const setZoneLink = (map: MapLibreMap, cells: string[]) =>
  setSourceData(
    map,
    LINK_SOURCE,
    cells.length ? cellsToFeatureCollection(cells) : EMPTY_DATA,
  );
