import useSWRMutation from 'swr/mutation';

import apiClient from '@/lib/api-client';

import { DeviceCredentials } from '@/types';

export const useAddDevice = () => {
  return useSWRMutation<
    DeviceCredentials[],
    Error,
    string,
    DeviceCredentials[]
  >(`/api/devices`, (url, { arg }) => {
    return apiClient.post(url, arg);
  });
};
