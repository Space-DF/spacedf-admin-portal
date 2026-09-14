import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import queryString from 'query-string';

import apiClient from '@/lib/api-client';

import { DEVICE_QUERY_KEY } from '@/constants/query-keys';

import { Device } from '@/types';

export const useDevice = (deviceId: string, initialData?: Device) => {
  const { slugName } = useParams<{ slugName: string }>();
  return useQuery<Device>({
    queryKey: [...DEVICE_QUERY_KEY, deviceId, slugName],
    queryFn: () =>
      apiClient.get<Device>(
        queryString.stringifyUrl({
          url: `/api/devices/${deviceId}`,
          query: { slugName },
        }),
      ),
    enabled: !!deviceId,
    initialData,
  });
};
