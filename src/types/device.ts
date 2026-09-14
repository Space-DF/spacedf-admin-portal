import type GeoJSON from 'geojson';

import { NetworkServer } from '@/types/network-server';

export type MonitoringArea = GeoJSON.MultiPolygon['coordinates'];

export type TableDevice = {
  dev_eui?: string;
  join_eui?: string;
  status: string;
  id: string;
  claim_code?: string;
  app_key?: string;
  description?: string;
  network_server?: NetworkServer;
  device_profile: DeviceProfile;
  is_deactivated: boolean;
  serial_number?: string;
};

export type DeviceProfile = {
  id: string;
  name: string;
  manufacturer_name: string;
  manufacturer_id: string;
  logo: string;
  key_feature: string;
  device_type: string;
};

export type DeviceModel = {
  id: string;
  alias: string;
  default_config: object;
  device_type: string;
  image_url: string;
  manufacturer_name: string;
  name: string;
};

export type LorawanDeviceCredentials = {
  dev_eui: string;
  join_eui: string;
  claim_code?: string;
  app_key: string;
};

export type DeviceCredentials = {
  device_model: string;
  network_server: string;
  lorawan_device: LorawanDeviceCredentials;
};

export type ApiDeviceInfo = {
  serial_number?: string;
};

export type ApiDeviceCredentials = {
  device_model: string;
  is_published?: boolean;
  claim_code?: string;
  api_device?: ApiDeviceInfo;
};

export type AddDeviceCredentials = DeviceCredentials | ApiDeviceCredentials;
export type DeviceLocation = {
  latitude?: number;
  longitude?: number;
};

export type UpdateDevicePayload = Partial<
  Pick<
    TableDevice,
    | 'dev_eui'
    | 'join_eui'
    | 'app_key'
    | 'claim_code'
    | 'description'
    | 'status'
    | 'network_server'
    | 'is_deactivated'
    | 'serial_number'
  >
> & {
  device_model?: string;
  is_published?: boolean;
  cells?: MonitoringArea | null;
  location?: DeviceLocation;
};

export type UpdateDeviceRequest = Omit<
  UpdateDevicePayload,
  'network_server'
> & {
  network_server?: string;
};

export type DeviceCheckpoint = {
  timestamp: string;
  latitude: number;
  longitude: number;
  bearing: number;
};

export type DeviceProperty = {
  latest_checkpoint?: DeviceCheckpoint | null;
  battery?: number;
  water_depth?: number;
};

export type Device = {
  device_model: DeviceModel;
  id: string;
  created_at: string;
  updated_at: string;
  description?: string;
  join_eui: string;
  claim_code?: string;
  status: string;
  device_profile: DeviceProfile;
  is_deactivated: boolean;
  cells: MonitoringArea | null;
  location?: DeviceLocation | null;
  device_properties?: DeviceProperty;
  lorawan_device?: {
    dev_eui: string;
    join_eui: string;
    app_key: string;
    network_server: NetworkServer;
  };
  api_device?: {
    serial_number: string;
  };
} & Omit<DeviceCredentials, 'network_server' | 'lorawan_device'>;
