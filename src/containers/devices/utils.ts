import { Device, Response, TableDevice } from '@/types';

export const getDeviceData = (
  devicePagination?: Response<Device>,
  isLoading?: boolean,
): TableDevice[] => {
  if (isLoading) {
    return Array.from({ length: 8 }).map(() => ({
      id: '',
      dev_eui: '',
      status: '',
      join_eui: '',
      claim_code: '',
      app_key: '',
      is_deactivated: false,
      serial_number: '',
      device_profile: {
        id: '',
        name: '',
        manufacturer_name: '',
        manufacturer_id: '',
        logo: '',
        key_feature: '',
        device_type: '',
      },
      network_server: {
        id: '',
        name: '',
        logo: '',
        description: '',
        connection_types: [],
      },
    }));
  }

  return (
    devicePagination?.results?.map((device) => ({
      ...device,
      dev_eui: device.lorawan_device?.dev_eui,
      join_eui: device.lorawan_device?.join_eui,
      claim_code: device.claim_code,
      app_key: device.lorawan_device?.app_key,
      network_server: device.lorawan_device?.network_server,
      device_profile: device.device_profile,
      serial_number: device.api_device?.serial_number,
    })) || []
  );
};
