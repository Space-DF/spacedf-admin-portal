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
      dev_eui: device.lorawan_device.dev_eui,
      join_eui: device.lorawan_device.join_eui,
      claim_code: device.lorawan_device.claim_code,
      app_key: device.lorawan_device.app_key,
      network_server: device.network_server,
    })) || []
  );
};
