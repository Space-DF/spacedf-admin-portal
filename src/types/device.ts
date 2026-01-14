import { NetworkServer } from '@/types/network-server';

export type TableDevice = {
  dev_eui: string;
  join_eui: string;
  status: string;
  id: string;
  claim_code?: string;
  app_key: string;
  description?: string;
  network_server: NetworkServer;
};

export type DeviceModel = {
  id: string;
  alias: string;
  default_config: object;
  device_type: string;
  image_url: string;
  manufacture: string;
  name: string;
};

type LorawanDeviceCredentials = {
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

export type Device = {
  device_model: DeviceModel;
  id: string;
  created_at: string;
  description?: string;
  join_eui: string;
  claim_code?: string;
  network_server: NetworkServer;
  status: string;
} & Omit<DeviceCredentials, 'network_server'>;
