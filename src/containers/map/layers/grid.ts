import { Map as MapLibreMap } from 'maplibre-gl';

import { EMPTY_DATA, setSourceData } from '@/containers/map/layers/shared';
import {
  buildH3Grid,
  H3_RESOLUTION,
  type H3Bounds,
  zoomToFitGrid,
} from '@/containers/map/utils';

export const GRID_SOURCE = 'h3-grid';
export const GRID_FILL_LAYER = 'h3-grid-fill';
const GRID_LINE_LAYER = 'h3-grid-line';
const GRID_COLOR = '#CBCBCB';

export const addGridLayers = (map: MapLibreMap) => {
  map.addSource(GRID_SOURCE, {
    type: 'geojson',
    data: EMPTY_DATA,
    generateId: true,
  });
  map.addLayer({
    id: GRID_FILL_LAYER,
    type: 'fill',
    source: GRID_SOURCE,
    paint: {
      'fill-color': GRID_COLOR,
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.45,
        0.12,
      ],
    },
  });
  map.addLayer({
    id: GRID_LINE_LAYER,
    type: 'line',
    source: GRID_SOURCE,
    paint: { 'line-color': GRID_COLOR, 'line-width': 1, 'line-opacity': 0.6 },
  });
};

const boundsOf = (map: MapLibreMap): H3Bounds => {
  const bounds = map.getBounds();
  return {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  };
};

export const refreshGrid = (
  map: MapLibreMap,
  resolution: number = H3_RESOLUTION,
) => setSourceData(map, GRID_SOURCE, buildH3Grid(boundsOf(map), resolution));

const FOCUS_PADDING_PX = { top: 96, bottom: 64, left: 64, right: 64 };

const FOCUS_MAX_ZOOM = 17;

export const focusGrid = (
  map: MapLibreMap,
  resolution: number,
  target: H3Bounds | null,
  home: [number, number],
  keepGrid = false,
) => {
  const framed = target
    ? map.cameraForBounds(
        [
          [target.west, target.south],
          [target.east, target.north],
        ],
        {
          padding: FOCUS_PADDING_PX,
          bearing: map.getBearing(),
          pitch: map.getPitch(),
          maxZoom: FOCUS_MAX_ZOOM,
        },
      )
    : undefined;

  const center = framed?.center ?? home;
  const zoom = framed?.zoom ?? map.getZoom();

  if (framed && !keepGrid) {
    map.easeTo({ center, zoom, duration: 400 });
    return;
  }

  const floor = zoomToFitGrid(target ?? boundsOf(map), zoom, resolution);

  map.easeTo({ center, zoom: Math.max(zoom, floor), duration: 400 });
};

export const createGridHover = (map: MapLibreMap) => {
  let hovered: string | number | undefined;

  const clear = () => {
    if (hovered === undefined) return;
    map.setFeatureState({ source: GRID_SOURCE, id: hovered }, { hover: false });
    hovered = undefined;
  };

  const set = (id: string | number) => {
    if (hovered === id) return;
    clear();
    hovered = id;
    map.setFeatureState({ source: GRID_SOURCE, id }, { hover: true });
  };

  return { set, clear };
};
