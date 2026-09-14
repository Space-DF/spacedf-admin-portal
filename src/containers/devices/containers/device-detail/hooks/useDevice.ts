import { useQuery } from '@tanstack/react-query';

import apiClient from '@/lib/api-client';

import { DEVICE_QUERY_KEY } from '@/constants/query-keys';

import { Device } from '@/types';

export const useDevice = (deviceId: string, initialData?: Device) => {
  return useQuery<Device>({
    queryKey: [...DEVICE_QUERY_KEY, deviceId],
    queryFn: () => apiClient.get<Device>(`/api/devices/${deviceId}`),
    enabled: !!deviceId,
    initialData,
  });
};
