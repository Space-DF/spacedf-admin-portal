'use client';

import { type Map as MapLibreMap } from 'maplibre-gl';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { MapControls } from '@/containers/map/components/map-controls';
import { MapEditActions } from '@/containers/map/components/map-edit-actions';
import { MapHeader } from '@/containers/map/components/map-header';
import { type ZoneChangeOrigin } from '@/containers/map/components/map-view';
import { focusGrid } from '@/containers/map/layers/grid';
import { type DataMode, type DrawTool } from '@/containers/map/types';
import {
  areaCellCount,
  areaSquareMetres,
  cellCenter,
  cellsBounds,
  cellsToArea,
  pointToCell,
  shiftArea,
} from '@/containers/map/utils';
import { AreaDrawToolbar } from '@/containers/monitoring/water-level/components/area-draw-toolbar';
import { RelocateSensorDialog } from '@/containers/monitoring/water-level/components/relocate-sensor-dialog';
import { WaterLevelLegend } from '@/containers/monitoring/water-level/components/water-level-legend';
import { useWaterLevelSensors } from '@/containers/monitoring/water-level/hooks/use-water-level-sensors';
import { buildMockWaterLevel } from '@/containers/monitoring/water-level/mock-data';
import { type WaterLevelFormValues } from '@/containers/monitoring/water-level/schema';
import {
  columnFill,
  levelBand,
} from '@/containers/monitoring/water-level/utils';
import {
  toSensorZones,
  type WaterZone,
  withMovedAreas,
} from '@/containers/monitoring/water-level/zones';

import { type MonitoringArea } from '@/types/device';

const MapView = dynamic(() => import('@/containers/map/components/map-view'), {
  ssr: false,
});

/** Where the sensor stood and what it watched over before a step: an area put
 * back without its device is half an undo. */
type EditStep = { area: MonitoringArea; at?: [number, number] };

interface Props {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  dataMode?: DataMode;
}

export const WaterLevelMap = ({
  center,
  zoom,
  pitch,
  bearing,
  dataMode,
}: Props) => {
  const t = useTranslations('monitoring');
  const { control } = useFormContext<WaterLevelFormValues>();
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const {
    sensors,
    selectSensor,
    selectedId,
    editingId,
    movedLocations,
    movedAreas,
    moveSensor,
    dropSensor,
    editArea,
    saveEdit,
    isSaving,
    discardEdit,
  } = useWaterLevelSensors();

  const [resolution, thresholds, zoneColors, display] = useWatch({
    control,
    name: ['cellResolution', 'thresholds', 'zoneColors', 'display'],
  });

  const [tool, setTool] = useState<DrawTool>('pan');

  const isRealData = dataMode === 'real';

  /** Sample sensors are nobody's to move, so editing belongs to real data. */
  const editing = isRealData ? editingId : null;

  const selected = isRealData ? selectedId : null;

  const baseZones = useMemo(
    () =>
      isRealData
        ? toSensorZones(sensors, resolution)
        : buildMockWaterLevel(center, resolution, thresholds),
    [isRealData, sensors, center, resolution, thresholds],
  );

  const zones = useMemo(
    () => withMovedAreas(baseZones, movedAreas, resolution),
    [baseZones, movedAreas, resolution],
  );

  const deviceCellOf = useCallback(
    ({ id, deviceH3 }: WaterZone) => {
      const moved = movedLocations[id];
      return moved ? pointToCell(moved[0], moved[1], resolution) : deviceH3;
    },
    [movedLocations, resolution],
  );

  const editingZone = useMemo(
    () => (editing ? zones.find(({ id }) => id === editing) : null) ?? null,
    [zones, editing],
  );

  const areaMovedTo = useCallback(
    (to: [number, number]) => {
      if (!editingZone?.area) return undefined;
      if (!editingZone.cells.length) return undefined;

      const at = movedLocations[editingZone.id] ?? editingZone.at;
      if (!at) return undefined;

      const [fromLng, fromLat] = cellCenter(
        pointToCell(at[0], at[1], resolution),
      );
      const [toLng, toLat] = cellCenter(pointToCell(to[0], to[1], resolution));

      return shiftArea(editingZone.area, toLng - fromLng, toLat - fromLat);
    },
    [editingZone, movedLocations, resolution],
  );

  const areaFollowing = useCallback(
    (to: [number, number]) =>
      editingZone?.cells.includes(pointToCell(to[0], to[1], resolution))
        ? undefined
        : areaMovedTo(to),
    [editingZone, resolution, areaMovedTo],
  );

  const seededRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editing) {
      seededRef.current = null;
      return;
    }

    if (!map || seededRef.current === editing) return;

    const zone = zones.find(({ id }) => id === editing);
    if (!zone) return;

    seededRef.current = editing;
    if (zone.at || movedLocations[editing]) return;

    const { lng, lat } = map.getCenter();
    moveSensor(editing, [lng, lat]);
  }, [editing, map, zones, movedLocations, moveSensor]);

  const whereEditing = editing
    ? (movedLocations[editing] ?? editingZone?.at ?? undefined)
    : undefined;

  const historyRef = useRef<EditStep[]>([]);
  const [undoDepth, setUndoDepth] = useState(0);

  const stepNow = useCallback(
    (): EditStep => ({ area: editingZone?.area ?? [], at: whereEditing }),
    [editingZone, whereEditing],
  );

  const pushStep = useCallback((step: EditStep) => {
    historyRef.current = [...historyRef.current, step];
    setUndoDepth(historyRef.current.length);
  }, []);

  const dragStepRef = useRef<EditStep | null>(null);

  useEffect(() => {
    historyRef.current = [];
    dragStepRef.current = null;
    setUndoDepth(0);
    setTool('pan');
    setRelocateTo(null);
  }, [editing]);

  const handleDeviceMove = useCallback(
    (location: [number, number]) => {
      if (!editing) return;
      dragStepRef.current ??= stepNow();
      moveSensor(editing, location, areaFollowing(location));
    },
    [editing, moveSensor, areaFollowing, stepNow],
  );

  const handleDeviceMoveEnd = useCallback(
    (location: [number, number]) => {
      if (!editing) return;

      const setOut = dragStepRef.current;
      dragStepRef.current = null;
      if (setOut) pushStep(setOut);

      dropSensor(editing, location);
    },
    [editing, dropSensor, pushStep],
  );

  const [relocateTo, setRelocateTo] = useState<[number, number] | null>(null);

  const applyRelocate = useCallback(
    (to: [number, number], area?: MonitoringArea) => {
      if (!editing) return;
      pushStep(stepNow());
      moveSensor(editing, to, area);
      dropSensor(editing, to);
    },
    [editing, moveSensor, dropSensor, pushStep, stepNow],
  );

  const handleRelocate = useCallback(
    (to: [number, number]) => {
      if (!editing) return;

      const stays =
        !editingZone?.cells.length ||
        editingZone.cells.includes(pointToCell(to[0], to[1], resolution));

      if (stays) applyRelocate(to);
      else setRelocateTo(to);
    },
    [editing, editingZone, resolution, applyRelocate],
  );

  const confirmRelocate = useCallback(() => {
    if (!relocateTo) return;

    applyRelocate(relocateTo, []);
    setRelocateTo(null);
  }, [relocateTo, applyRelocate]);

  const handleZoneChange = useCallback(
    (cells: string[], origin: ZoneChangeOrigin) => {
      if (!editing || origin !== 'user') return;
      pushStep(stepNow());
      editArea(editing, cellsToArea(cells), whereEditing);
    },
    [editing, editArea, whereEditing, pushStep, stepNow],
  );

  /** A zone or its device tag focuses the sensor, just as its card does. */
  const handleZoneSelect = useCallback(
    (id: string) => selectSensor(id === selected ? null : id),
    [selectSensor, selected],
  );

  const handleZoneTooLarge = useCallback(
    () => toast.error(t('area_too_large')),
    [t],
  );

  const handleUndo = useCallback(() => {
    const history = historyRef.current;
    if (!editing || !history.length) return;

    const { area, at } = history[history.length - 1];
    historyRef.current = history.slice(0, -1);
    setUndoDepth(historyRef.current.length);

    if (at) moveSensor(editing, at);
    editArea(editing, area, at);
  }, [editing, moveSensor, editArea]);

  const colorOf = useCallback(
    (level: number | null) =>
      level === null
        ? zoneColors.safe
        : zoneColors[levelBand(level, thresholds)],
    [zoneColors, thresholds],
  );

  const coverage = useMemo(
    () =>
      zones
        .filter(({ id, cells }) => cells.length && id !== editing)
        .map(({ id, cells, level }) => ({ id, cells, color: colorOf(level) })),
    [zones, colorOf, editing],
  );

  const columns = useMemo(
    () =>
      zones.flatMap((zone) => {
        const h3 = deviceCellOf(zone);

        return h3
          ? [
              {
                id: zone.id,
                h3,
                color: colorOf(zone.level),
                fill:
                  zone.level === null ? 0 : columnFill(zone.level, thresholds),
                name: zone.deviceName,
                image: zone.deviceImage,
              },
            ]
          : [];
      }),
    [zones, deviceCellOf, colorOf, thresholds],
  );

  const waterLevel = useMemo(
    () => ({
      resolution,
      zones: coverage,
      columns,
      selectedZoneId: selected,
      editingId: editing,
      show: {
        coverage: display.coverage,
        columns: display.waterColumn,
      },
    }),
    [resolution, coverage, columns, display, selected, editing],
  );

  const framing = useMemo(() => {
    const framed = (zone: WaterZone) => {
      const h3 = deviceCellOf(zone);
      return h3 ? [...zone.cells, h3] : zone.cells;
    };

    const picked = zones.find(({ id }) => id === (editing ?? selected));

    return cellsBounds(picked ? framed(picked) : zones.flatMap(framed));
  }, [zones, selected, editing, deviceCellOf]);

  const framingRef = useRef(framing);
  const framedIdRef = useRef<string | null>(null);

  if (!editing || framedIdRef.current !== editing) framingRef.current = framing;
  framedIdRef.current = editing;

  const fit = framingRef.current;

  const focusedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editing) {
      focusedRef.current = null;
      return;
    }
    if (!map || !fit || focusedRef.current === editing) return;

    focusedRef.current = editing;
    focusGrid(map, resolution, fit, center);
  }, [editing, map, fit, resolution, center]);

  return (
    <div className='relative hidden min-w-0 flex-1 md:block [&_.maplibregl-ctrl-bottom-right]:left-0 [&_.maplibregl-ctrl-bottom-right]:right-auto [&_.maplibregl-ctrl-top-right]:top-[77px]'>
      <MapView
        center={center}
        zoom={zoom}
        pitch={pitch}
        bearing={bearing}
        resolution={resolution}
        waterLevel={waterLevel}
        fit={fit}
        drawable={!!editing}
        tool={tool}
        area={editingZone?.area ?? null}
        zoneColor={colorOf(editingZone?.level ?? null)}
        onZoneChange={handleZoneChange}
        onZoneTooLarge={handleZoneTooLarge}
        onRelocate={editing ? handleRelocate : undefined}
        onDeviceMove={handleDeviceMove}
        onDeviceMoveEnd={handleDeviceMoveEnd}
        onZoneSelect={isRealData && !editing ? handleZoneSelect : undefined}
        onMapReady={setMap}
      />
      <MapHeader
        className='absolute inset-x-0 top-0 z-10'
        isRealData={isRealData}
        map={map}
        actions={
          editing && (
            <MapEditActions
              onDiscard={discardEdit}
              onSave={saveEdit}
              isSaving={isSaving}
            />
          )
        }
      />
      <div className='absolute bottom-3 right-3 z-10 flex flex-col items-end gap-y-3'>
        {!isRealData ? (
          <WaterLevelLegend />
        ) : (
          editingZone && <MapControls mode={tool} />
        )}
      </div>
      {editingZone && (
        <AreaDrawToolbar
          className='absolute bottom-3 left-1/2 z-10 -translate-x-1/2'
          cellCount={areaCellCount(editingZone.area, resolution)}
          coverageArea={areaSquareMetres(editingZone.area)}
          tool={tool}
          onToolChange={setTool}
          onUndo={handleUndo}
          canUndo={undoDepth > 0}
        />
      )}
      <RelocateSensorDialog
        open={!!relocateTo}
        onCancel={() => setRelocateTo(null)}
        onConfirm={confirmRelocate}
      />
    </div>
  );
};
