import { useParams } from 'next/navigation';
import useSWR from 'swr';

import apiClient from '@/lib/api-client';

import { Device } from '@/types';

const getDeviceDetail = async (url: string) => apiClient.get<Device>(url);

export const useDevice = (deviceServerData?: Device) => {
  const { deviceId } = useParams<{
    deviceId: string;
  }>();
  return useSWR<Device>(
    deviceId ? `/api/devices/${deviceId}` : null,
    getDeviceDetail,
    {
      fallbackData: deviceServerData,
    },
  );
};
