import { useQuery } from '@tanstack/react-query';

import apiClient from '@/lib/api-client';

import { DEVICE_EVENTS_QUERY_KEY } from '@/constants/query-keys';

import { Checkpoint } from '@/types';

export const useDeviceEvents = (deviceId?: string) => {
  return useQuery<Checkpoint[]>({
    queryKey: [...DEVICE_EVENTS_QUERY_KEY, deviceId],
    queryFn: () => apiClient.get<Checkpoint[]>(`/api/trip/${deviceId}`),
    enabled: !!deviceId,
  });
};
