import useSWR from 'swr';

import apiClient from '@/lib/api-client';

import { Checkpoint } from '@/types';

export async function getDeviceEvents(url: string) {
  return apiClient.get<Checkpoint[]>(url);
}

export const useDeviceEvents = (deviceId?: string) => {
  return useSWR<Checkpoint[]>(
    deviceId ? `/api/trip/${deviceId}` : null,
    getDeviceEvents,
  );
};
