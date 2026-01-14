import useSWR from 'swr';

import apiClient from '@/lib/api-client';
import { useDebounce } from '@/hooks/useDebounce';

import { Device, Response } from '@/types';

export async function getDevices(url: string) {
  return apiClient.get<Response<Device>>(url);
}

export const useDevices = (
  search: string,
  status: 'active' | 'in_inventory',
  pageIndex = 0,
  limit = 10,
) => {
  const deviceNameDebounced = useDebounce(search);
  return useSWR<Response<Device>>(
    `/api/devices?search=${deviceNameDebounced}&status=${status}&pageIndex=${pageIndex}&limit=${limit}`,
    getDevices,
  );
};
