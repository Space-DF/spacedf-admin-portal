import { areaBounds, areaToCells, pointToCell } from '@/containers/map/utils';
import { waterDepthToMetres } from '@/containers/monitoring/water-level/utils';

import { type Device } from '@/types';
import { type MonitoringArea } from '@/types/device';

export type SensorAreas = Record<string, MonitoringArea | null>;

export type WaterZone = {
  id: string;
  area: MonitoringArea | null;
  cells: string[];
  at: [number, number] | null;
  deviceH3: string | null;
  level: number | null;
  deviceName?: string;
  deviceImage: string;
};

const FALLBACK_DEVICE_LOGO = '/images/rak-sticker.webp';

const areaCentre = (area: MonitoringArea | null): [number, number] | null => {
  const bounds = areaBounds(area);
  if (!bounds) return null;
  return [(bounds.west + bounds.east) / 2, (bounds.south + bounds.north) / 2];
};

const reportedLocation = (device: Device): [number, number] | null => {
  const { latitude, longitude } = device.location ?? {};
  if (latitude !== undefined && longitude !== undefined)
    return [longitude, latitude];

  const checkpoint = device.device_properties?.latest_checkpoint;
  if (checkpoint) return [checkpoint.longitude, checkpoint.latitude];

  return null;
};

const outsideArea = (
  cells: string[],
  at: [number, number] | null,
  resolution: number,
): boolean =>
  !!at &&
  !!cells.length &&
  !cells.includes(pointToCell(at[0], at[1], resolution));

export const isSensorOutsideArea = (
  device: Device,
  resolution: number,
): boolean =>
  outsideArea(
    areaToCells(device.cells, resolution),
    reportedLocation(device),
    resolution,
  );

export const toSensorZones = (
  devices: Device[],
  resolution: number,
): WaterZone[] =>
  devices.map((device) => {
    const cells = areaToCells(device.cells, resolution);
    const reported = reportedLocation(device);
    const stranded = outsideArea(cells, reported, resolution);

    const area = stranded ? null : device.cells;
    const at = reported ?? areaCentre(area);

    return {
      id: device.id,
      area,
      cells: stranded ? [] : cells,
      at,
      deviceH3: at && pointToCell(at[0], at[1], resolution),
      level: waterDepthToMetres(device.device_properties?.water_depth),
      deviceName:
        device.device_profile?.name ||
        device.device_model?.name ||
        device.lorawan_device?.dev_eui,
      deviceImage: device.device_profile?.logo || FALLBACK_DEVICE_LOGO,
    };
  });

export const withMovedAreas = (
  zones: WaterZone[],
  movedAreas: SensorAreas,
  resolution: number,
): WaterZone[] =>
  zones.map((zone) => {
    if (!(zone.id in movedAreas)) return zone;
    const area = movedAreas[zone.id];
    return { ...zone, area, cells: areaToCells(area, resolution) };
  });
