import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import queryString from 'query-string';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';

import { DEVICE_QUERY_KEY } from '@/constants/query-keys';

import { UpdateDevicePayload } from '@/types';

export const useUpdateDevice = (
  deviceId: string,
  { successMessage }: { successMessage?: string } = {},
) => {
  const t = useTranslations('device-detail');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ network_server, ...arg }: UpdateDevicePayload) =>
      apiClient.patch(
        queryString.stringifyUrl({
          url: `/api/devices/${deviceId}`,
        }),
        {
          ...arg,
          network_server: network_server?.id,
        },
      ),
    onSuccess: () => {
      toast.success(successMessage ?? t('update_device_success'));
      queryClient.invalidateQueries({
        queryKey: [...DEVICE_QUERY_KEY, deviceId],
      });
    },
    onError: () => {
      toast.error(t('update_device_error'));
    },
  });
};
