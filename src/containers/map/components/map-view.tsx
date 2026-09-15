'use client';
import {
  getVersion,
  Map as MapLibreMap,
  MapMouseEvent,
  setWorkerUrl,
} from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(
  `https://cdn.jsdelivr.net/npm/maplibre-gl@${getVersion()}/dist/maplibre-gl-worker.mjs`,
);

import { DeviceTags } from '@/containers/map/components/device-tags';
import { MapContextMenu } from '@/containers/map/components/map-context-menu';
import { enableTrackpadPan } from '@/containers/map/interactions/trackpad-pan';
import { enableZoneDrawing } from '@/containers/map/interactions/zone-drawing';
import {
  addGridLayers,
  focusGrid,
  refreshGrid,
} from '@/containers/map/layers/grid';
import {
  setZonePick,
  syncWaterLevel,
} from '@/containers/map/layers/water-level';
import {
  addZoneLayers,
  removeZoneLayers,
  setZoneCells,
  setZoneColor,
} from '@/containers/map/layers/zone';
import {
  addZoneLinkLayer,
  removeZoneLinkLayer,
  setZoneLink,
  setZoneLinkColor,
} from '@/containers/map/layers/zone-link';
import { type DrawTool, type WaterLevelOverlay } from '@/containers/map/types';
import {
  areaPreserved,
  areaToCells,
  cellCenter,
  type CellCentre,
  cellCentres,
  cellPath,
  cellsBounds,
  cellsToArea,
  DEFAULT_ZONE_COLOR,
  H3_RESOLUTION,
  type H3Bounds,
  nearestCell,
  pointToCell,
} from '@/containers/map/utils';

import { applyVietnamIslandLabels } from '@/utils/vietnam-island-labels';

import { MonitoringArea } from '@/types/device';

export type ZoneChangeOrigin = 'user' | 'seed' | 'resolution';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const MAP_THEME = 'light' as const;

const areaKey = (area: MonitoringArea | null | undefined) =>
  JSON.stringify(area ?? null);

const DEFAULT_CENTER: [number, number] = [105.8542, 21.0285];
const DEFAULT_ZOOM = 5;

const GRID_SETTLE_MS = 120;

interface Props {
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  drawable?: boolean;
  tool?: DrawTool;
  resolution?: number;
  waterLevel?: WaterLevelOverlay;
  zoneColor?: string;
  area?: MonitoringArea | null;
  fit?: H3Bounds | null;
  picking?: boolean;
  onZoneChange?: (cells: string[], origin: ZoneChangeOrigin) => void;
  onZoneTooLarge?: () => void;
  onPick?: (location: [number, number]) => void;
  onRelocate?: (location: [number, number]) => void;
  onDeviceMove?: (location: [number, number]) => void;
  onDeviceMoveEnd?: (location: [number, number]) => void;
  onZoneSelect?: (id: string) => void;
  onMapReady?: (map: MapLibreMap | null) => void;
}

const MapView = ({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  pitch = 0,
  bearing = 0,
  drawable = false,
  tool = 'paint',
  resolution = H3_RESOLUTION,
  waterLevel,
  zoneColor = DEFAULT_ZONE_COLOR,
  area,
  fit,
  picking = false,
  onZoneChange,
  onZoneTooLarge,
  onPick,
  onRelocate,
  onDeviceMove,
  onDeviceMoveEnd,
  onZoneSelect,
  onMapReady,
}: Props) => {
  const [centerLng, centerLat] = center;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const zoneRef = useRef<Set<string>>(new Set());
  const seededRef = useRef<string | null>(null);
  const resolutionRef = useRef(resolution);
  const zoneChangeRef = useRef(onZoneChange);
  zoneChangeRef.current = onZoneChange;
  /** Where a cell size change returns to, however far the user has panned. */
  const homeRef = useRef<[number, number]>([centerLng, centerLat]);
  homeRef.current = [centerLng, centerLat];
  /** Read once, when the map is built: afterwards the camera is the map's own. */
  const openingRef = useRef({ zoom, pitch, bearing });
  openingRef.current = { zoom, pitch, bearing };
  const waterLevelRef = useRef(waterLevel);
  waterLevelRef.current = waterLevel;
  const fitRef = useRef(fit);
  fitRef.current = fit;
  const fittedRef = useRef<string | null>(null);
  const zoneColorRef = useRef(zoneColor);
  zoneColorRef.current = zoneColor;
  const pickingRef = useRef(picking);
  pickingRef.current = picking;
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const tooLargeRef = useRef(onZoneTooLarge);
  tooLargeRef.current = onZoneTooLarge;

  const [map, setMap] = useState<MapLibreMap | null>(null);

  const live = map && map === mapRef.current ? map : null;

  useEffect(() => {
    onMapReady?.(live);
  }, [live, onMapReady]);

  const editingColumn = useMemo(() => {
    const editingId = waterLevel?.editingId;
    if (!editingId) return null;
    return waterLevel?.columns.find(({ id }) => id === editingId) ?? null;
  }, [waterLevel]);

  const deviceCell = useMemo(
    () =>
      editingColumn
        ? pointToCell(...cellCenter(editingColumn.h3), resolution)
        : null,
    [editingColumn, resolution],
  );

  const deviceCellRef = useRef(deviceCell);
  deviceCellRef.current = deviceCell;

  /** The trail belongs to the device it leads to, so it wears its colour. */
  const linkColor = editingColumn?.color ?? zoneColor;
  const linkColorRef = useRef(linkColor);
  linkColorRef.current = linkColor;

  const zoneCentresRef = useRef<CellCentre[] | undefined>(undefined);

  const linkPath = useCallback((h3: string): string[] => {
    if (zoneRef.current.has(h3)) return [];

    const centres = (zoneCentresRef.current ??= cellCentres(zoneRef.current));

    const target = centres.length
      ? nearestCell(cellCenter(h3), centres)
      : deviceCellRef.current;

    return target ? cellPath(h3, target) : [];
  }, []);

  const applyZone = useCallback((origin: ZoneChangeOrigin) => {
    zoneCentresRef.current = undefined;
    if (mapRef.current) {
      setZoneCells(mapRef.current, zoneRef.current);
      setZoneLink(mapRef.current, []);
    }
    if (origin === 'user')
      seededRef.current = areaKey(cellsToArea(zoneRef.current));
    zoneChangeRef.current?.(Array.from(zoneRef.current), origin);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const instance = new MapLibreMap({
      container,
      style: MAP_STYLE,
      center: homeRef.current,
      ...openingRef.current,
      attributionControl: { compact: true },
    });
    mapRef.current = instance;
    instance.on('style.load', () => {
      applyVietnamIslandLabels(instance, MAP_THEME);
    });

    let regrid = 0;
    const scheduleGrid = () => {
      window.clearTimeout(regrid);
      regrid = window.setTimeout(
        () => refreshGrid(instance, resolutionRef.current),
        GRID_SETTLE_MS,
      );
    };

    instance.on('load', () => {
      addGridLayers(instance);
      refreshGrid(instance, resolutionRef.current);
      instance.on('moveend', scheduleGrid);
      setMap(instance);
    });

    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container);

    return () => {
      window.clearTimeout(regrid);
      observer.disconnect();
      instance.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!live) return;
    return enableTrackpadPan(live);
  }, [live]);

  useEffect(() => {
    if (!live || !drawable) return;

    const isLive = () => mapRef.current === live;

    addZoneLayers(live, zoneColorRef.current);
    addZoneLinkLayer(live, linkColorRef.current);
    applyZone('seed');

    const stopDrawing = enableZoneDrawing({
      map: live,
      cells: zoneRef.current,
      getResolution: () => resolutionRef.current,
      getTool: () => toolRef.current,
      onChange: () => applyZone('user'),
      onHover: (h3) => {
        if (!isLive()) return;
        setZoneLink(live, h3 ? linkPath(h3) : []);
      },
      onTooLarge: () => tooLargeRef.current?.(),
      linkTo: linkPath,
      isActive: () => !pickingRef.current && toolRef.current !== 'pan',
      isLive,
    });

    const pick = ({ lngLat }: MapMouseEvent) => {
      if (!pickingRef.current) return;
      pickRef.current?.([lngLat.lng, lngLat.lat]);
    };
    live.on('click', pick);

    return () => {
      stopDrawing();
      if (!isLive()) return;
      live.off('click', pick);
      removeZoneLinkLayer(live);
      removeZoneLayers(live);
    };
  }, [live, drawable, applyZone, linkPath]);

  useEffect(() => {
    mapRef.current?.jumpTo({ center: [centerLng, centerLat] });
  }, [centerLng, centerLat]);

  const fitKey = fit
    ? `${fit.west},${fit.south},${fit.east},${fit.north}`
    : null;

  useEffect(() => {
    if (!live || !fitKey || fittedRef.current === fitKey) return;
    fittedRef.current = fitKey;
    focusGrid(
      live,
      resolutionRef.current,
      fitRef.current ?? null,
      homeRef.current,
    );
  }, [live, fitKey]);

  useEffect(() => {
    const previous = resolutionRef.current;
    resolutionRef.current = resolution;
    if (!mapRef.current) return;
    if (previous !== resolution) {
      const framing = waterLevelRef.current
        ? waterLevelRef.current.zones.flatMap(({ cells }) => cells)
        : Array.from(zoneRef.current);
      focusGrid(
        mapRef.current,
        resolution,
        fitRef.current ?? cellsBounds(framing),
        homeRef.current,
        true,
      );
    }
    refreshGrid(mapRef.current, resolution);

    if (drawable && previous !== resolution) setZoneLink(mapRef.current, []);

    if (drawable && previous !== resolution && zoneRef.current.size) {
      const source = cellsToArea(zoneRef.current);
      const recut = areaToCells(source, resolution);
      if (recut.length && areaPreserved(source, recut)) {
        zoneRef.current.clear();
        recut.forEach((cell) => zoneRef.current.add(cell));
        applyZone('resolution');
      }
    }
  }, [resolution, drawable, applyZone]);

  useEffect(() => {
    if (!drawable) return;
    const key = areaKey(area);
    if (seededRef.current === key) return;
    seededRef.current = key;
    zoneRef.current.clear();
    areaToCells(area, resolutionRef.current).forEach((cell) =>
      zoneRef.current.add(cell),
    );
    applyZone('seed');
  }, [area, drawable, applyZone]);

  useEffect(() => {
    if (!live || !drawable) return;
    setZoneColor(live, zoneColor);
  }, [live, drawable, zoneColor]);

  useEffect(() => {
    if (!live || !drawable) return;
    setZoneLinkColor(live, linkColor);
  }, [live, drawable, linkColor]);

  useEffect(() => {
    if (!live || !drawable || tool !== 'erase') return;
    setZoneLink(live, []);
  }, [live, drawable, tool]);

  useEffect(() => {
    if (!live || !drawable) return;

    const panning = tool === 'pan';

    let cursor = '';
    if (picking) {
      cursor = 'crosshair';
    } else if (panning) {
      cursor = 'grab';
    }

    live.getCanvas().style.cursor = cursor;
    if (picking || panning) live.dragPan.enable();
    else live.dragPan.disable();
  }, [live, drawable, picking, tool]);

  useEffect(() => {
    if (!live || !waterLevel) return;
    syncWaterLevel(live, waterLevel);
  }, [live, waterLevel]);

  useEffect(() => {
    if (!live) return;
    setZonePick(live, onZoneSelect ?? null);
    return () => {
      if (mapRef.current === live) setZonePick(live, null);
    };
  }, [live, onZoneSelect]);

  return (
    <div className='relative h-full w-full'>
      <div ref={containerRef} className='h-full w-full' />
      {live && onRelocate && (
        <MapContextMenu map={live} onRelocate={onRelocate} />
      )}
      {live && waterLevel && (
        <DeviceTags
          map={live}
          columns={waterLevel.columns}
          onColumn={waterLevel.show.columns}
          resolution={waterLevel.resolution}
          editingId={waterLevel.editingId}
          selectedId={waterLevel.selectedZoneId}
          onMove={onDeviceMove}
          onMoveEnd={onDeviceMoveEnd}
          onSelect={onZoneSelect}
        />
      )}
    </div>
  );
};

export default MapView;
