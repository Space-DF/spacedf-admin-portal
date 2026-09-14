import { ApiDeviceInfo, LorawanDeviceCredentials } from '@/types';

export enum AddDeviceMode {
  Auto = 'auto',
  Manual = 'manual',
}

export interface Steps {
  label: string;
  description?: string;
  component: React.ReactNode;
}

export enum ConnectivityType {
  Lorawan = 'lorawan',
  Api = 'api',
}

export enum Step {
  SelectMode = 'select_mode',
  SelectConnectivity = 'select_connectivity',
  ScanQR = 'scan_qr',
  AddEUI = 'add_eui',
  AddApiDevice = 'add_api_device',
  AddDeviceAuto = 'add_device_auto',
  Loading = 'loading',
  AddDeviceSuccess = 'add_device_success',
}

export interface AddDeviceResponse {
  total_created: number;
  total_failed: number;
  failed_devices: {
    duplicated: string[];
    validation_errors: string[];
  };
}

export type AddDeviceErrorResponse = {
  claim_code?: string[];
  lorawan_device?: Partial<Record<keyof LorawanDeviceCredentials, string[]>>;
  api_device?: Partial<Record<keyof ApiDeviceInfo, string[]>>;
};
