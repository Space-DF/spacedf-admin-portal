import { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

export const EMPTY_DATA: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

export const setSourceData = (
  map: MapLibreMap,
  source: string,
  data: GeoJSON.FeatureCollection,
) => (map.getSource(source) as GeoJSONSource | undefined)?.setData(data);

export const setVisible = (
  map: MapLibreMap,
  layers: string[],
  visible: boolean,
) =>
  layers.forEach((id) =>
    map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none'),
  );
