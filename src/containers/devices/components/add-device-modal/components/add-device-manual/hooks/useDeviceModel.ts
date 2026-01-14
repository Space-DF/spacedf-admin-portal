import useSWR from 'swr';

import apiClient from '@/lib/api-client';

import { DeviceModel } from '@/types/device';
import { Response } from '@/types/global';

const getDeviceModels = async (url: string): Promise<Response<DeviceModel>> =>
  apiClient.get(url);

export const useDeviceModel = (search = '') => {
  return useSWR(`/api/device-models?search=${search}`, getDeviceModels);
};
