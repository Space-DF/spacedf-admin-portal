import { useMutation, useQueryClient } from '@tanstack/react-query';
import queryString from 'query-string';

import apiClient from '@/lib/api-client';

import { DEVICES_QUERY_KEY } from '@/constants/query-keys';

import {
  AddDeviceErrorResponse,
  AddDeviceResponse,
} from '../components/add-device-modal/types';

import { AddDeviceCredentials, ApiResponse } from '@/types';

export const useAddDevice = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AddDeviceResponse,
    ApiResponse<AddDeviceErrorResponse[]>,
    AddDeviceCredentials[]
  >({
    mutationFn: (arg) =>
      apiClient.post(
        queryString.stringifyUrl({
          url: '/api/devices',
        }),
        arg,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICES_QUERY_KEY });
    },
  });
};
