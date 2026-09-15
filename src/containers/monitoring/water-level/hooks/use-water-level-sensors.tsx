'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useInfiniteDevices } from '@/containers/devices/hooks/useDevices';
import {
  type SensorMove,
  useSaveSensorLocation,
} from '@/containers/monitoring/water-level/hooks/use-save-sensor-location';
import { type SensorAreas } from '@/containers/monitoring/water-level/zones';

import { type Device } from '@/types';
import { type MonitoringArea } from '@/types/device';

const WATER_LEVEL_KEY_FEATURE = 'water_depth';

const SENSOR_PAGE_SIZE = 20;

const SENSOR_PARAM = 'sensor';

export const STATUS_OPTIONS = ['all', 'no_location', 'has_location'] as const;
export type SensorStatus = (typeof STATUS_OPTIONS)[number];

const LOCATION_FILTER_MAP: Record<SensorStatus, boolean | undefined> = {
  all: undefined,
  has_location: true,
  no_location: false,
};

export type SensorLocations = Record<string, [number, number]>;
type HeldSwitch = { kind: 'select' | 'edit'; id: string | null };

interface WaterLevelSensors {
  sensors: Device[];
  isLoading: boolean;
  hasMoreSensors: boolean;
  loadMoreSensors: () => void;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  status: SensorStatus;
  setStatus: Dispatch<SetStateAction<SensorStatus>>;
  selectedId: string | null;
  selectSensor: (id: string | null) => void;
  editingId: string | null;
  editSensor: (id: string | null) => void;
  saveEdit: () => void;
  isSaving: boolean;
  discardEdit: () => void;
  hasHeldSwitch: boolean;
  keepEditing: () => void;
  discardAndSwitch: () => void;
  saveAndSwitch: () => void;
  movedLocations: SensorLocations;
  movedAreas: SensorAreas;
  moveSensor: (
    id: string,
    location: [number, number],
    area?: MonitoringArea | null,
  ) => void;
  dropSensor: (id: string, location: [number, number]) => void;
  editArea: (
    id: string,
    area: MonitoringArea | null,
    location?: [number, number],
  ) => void;
}

const SensorsContext = createContext<WaterLevelSensors | null>(null);

interface Props {
  children: ReactNode;
}

export const WaterLevelSensorsProvider = ({ children }: Props) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SensorStatus>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingRef = useRef<string | null>(editingId);
  editingRef.current = editingId;
  const [movedLocations, setMovedLocations] = useState<SensorLocations>({});
  const [movedAreas, setMovedAreas] = useState<SensorAreas>({});
  const movedAreasRef = useRef<SensorAreas>(movedAreas);

  const { mutateAsync: saveLocation, isPending: isSaving } =
    useSaveSensorLocation();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get(SENSOR_PARAM);

  const moveSensor = useCallback(
    (id: string, location: [number, number], area?: MonitoringArea | null) => {
      setMovedLocations((moved) => ({ ...moved, [id]: location }));
      if (area === undefined) return;
      movedAreasRef.current = { ...movedAreasRef.current, [id]: area };
      setMovedAreas(movedAreasRef.current);
    },
    [],
  );

  /** Puts a sensor back where the devices say it is, once a save has failed. */
  const forgetMove = useCallback((id: string) => {
    const forget = <T,>(kept: Record<string, T>) => {
      if (!(id in kept)) return kept;
      const rest = { ...kept };
      delete rest[id];
      return rest;
    };

    setMovedLocations(forget);
    movedAreasRef.current = forget(movedAreasRef.current);
    setMovedAreas(movedAreasRef.current);
  }, []);

  const pendingRef = useRef<SensorMove | null>(null);

  const stashMove = useCallback((next: SensorMove) => {
    const carried = pendingRef.current;
    pendingRef.current =
      carried?.id === next.id ? { ...carried, ...next } : next;
  }, []);

  const flushMove = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    await saveLocation(pending, {
      onError: () => {
        forgetMove(pending.id);
      },
    });
  }, [saveLocation, forgetMove]);

  const discardEdit = useCallback(() => {
    const id = editingRef.current;
    if (!id) return;

    if (pendingRef.current?.id === id) pendingRef.current = null;
    forgetMove(id);
    editingRef.current = null;
    setEditingId(null);
  }, [forgetMove]);

  const applySelect = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (id) params.set(SENSOR_PARAM, id);
      else params.delete(SENSOR_PARAM);

      const query = params.toString();
      window.history.replaceState(
        null,
        '',
        query ? `${pathname}?${query}` : pathname,
      );

      if (editingRef.current === id) return;
      discardEdit();
    },
    [pathname, searchParams, discardEdit],
  );

  const dropSensor = useCallback(
    (id: string, location: [number, number]) => {
      moveSensor(id, location);
      const carried = movedAreasRef.current;
      stashMove({ id, location, ...(id in carried && { area: carried[id] }) });
    },
    [moveSensor, stashMove],
  );

  const editArea = useCallback(
    (id: string, area: MonitoringArea | null, location?: [number, number]) => {
      movedAreasRef.current = { ...movedAreasRef.current, [id]: area };
      setMovedAreas(movedAreasRef.current);
      stashMove({ id, area, ...(location && { location }) });
    },
    [stashMove],
  );

  const applyEdit = useCallback(
    (id: string | null) => {
      discardEdit();
      if (id) applySelect(id);
      editingRef.current = id;
      setEditingId(id);
    },
    [applySelect, discardEdit],
  );

  const saveEdit = useCallback(async () => {
    if (!editingRef.current) return;
    await flushMove();
    editingRef.current = null;
    setEditingId(null);
  }, [flushMove]);

  const [heldSwitch, setHeldSwitch] = useState<HeldSwitch | null>(null);

  const hasUnsavedEdit = useCallback(
    () => !!editingRef.current && pendingRef.current?.id === editingRef.current,
    [],
  );

  const selectSensor = useCallback(
    (id: string | null) => {
      if (id !== editingRef.current && hasUnsavedEdit()) {
        setHeldSwitch({ kind: 'select', id });
        return;
      }
      applySelect(id);
    },
    [applySelect, hasUnsavedEdit],
  );

  const editSensor = useCallback(
    (id: string | null) => {
      if (id !== editingRef.current && hasUnsavedEdit()) {
        setHeldSwitch({ kind: 'edit', id });
        return;
      }
      applyEdit(id);
    },
    [applyEdit, hasUnsavedEdit],
  );

  const applySwitch = useCallback(
    ({ kind, id }: HeldSwitch) =>
      kind === 'edit' ? applyEdit(id) : applySelect(id),
    [applyEdit, applySelect],
  );

  const keepEditing = useCallback(() => setHeldSwitch(null), []);

  const discardAndSwitch = useCallback(() => {
    if (!heldSwitch) return;
    setHeldSwitch(null);
    discardEdit();
    applySwitch(heldSwitch);
  }, [heldSwitch, discardEdit, applySwitch]);

  const saveAndSwitch = useCallback(async () => {
    if (!heldSwitch) return;
    await saveEdit();
    setHeldSwitch(null);
    applySwitch(heldSwitch);
  }, [heldSwitch, saveEdit, applySwitch]);

  const {
    devices: sensors,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteDevices(
    search,
    SENSOR_PAGE_SIZE,
    LOCATION_FILTER_MAP[status],
    WATER_LEVEL_KEY_FEATURE,
  );

  const loadMoreSensors = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const value = useMemo(
    () => ({
      sensors,
      isLoading,
      hasMoreSensors: !!hasNextPage,
      loadMoreSensors,
      search,
      setSearch,
      status,
      setStatus,
      selectedId,
      selectSensor,
      editingId,
      editSensor,
      saveEdit,
      isSaving,
      discardEdit,
      hasHeldSwitch: !!heldSwitch,
      keepEditing,
      discardAndSwitch,
      saveAndSwitch,
      movedLocations,
      movedAreas,
      moveSensor,
      dropSensor,
      editArea,
    }),
    [
      sensors,
      isLoading,
      hasNextPage,
      loadMoreSensors,
      search,
      status,
      selectedId,
      selectSensor,
      editingId,
      editSensor,
      saveEdit,
      isSaving,
      discardEdit,
      heldSwitch,
      keepEditing,
      discardAndSwitch,
      saveAndSwitch,
      movedLocations,
      movedAreas,
      moveSensor,
      dropSensor,
      editArea,
    ],
  );

  return (
    <SensorsContext.Provider value={value}>{children}</SensorsContext.Provider>
  );
};

export const useWaterLevelSensors = () => {
  const sensors = useContext(SensorsContext);

  if (!sensors) {
    throw new Error(
      'useWaterLevelSensors has to be used within <WaterLevelSensorsProvider>',
    );
  }

  return sensors;
};
