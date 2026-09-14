import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import queryString from 'query-string';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';

import { DEVICES_QUERY_KEY } from '@/constants/query-keys';

import { UpdateDeviceRequest } from '@/types';

type UpdateDeviceError = {
  response: {
    response: {
      lorawan_device?: Record<string, string[]>;
    };
  };
};

type UpdateDeviceVariables = UpdateDeviceRequest & { id: string };

export const useUpdateDevice = () => {
  const { slugName } = useParams<{ slugName: string }>();
  const t = useTranslations('organization');
  const queryClient = useQueryClient();
  return useMutation<unknown, UpdateDeviceError, UpdateDeviceVariables>({
    mutationFn: (arg) =>
      apiClient.patch(
        queryString.stringifyUrl({
          url: `/api/devices/${arg.id}`,
          query: { slugName },
        }),
        arg,
      ),
    onSuccess: () => {
      toast.success(t('update_devices_success'));
      queryClient.invalidateQueries({ queryKey: DEVICES_QUERY_KEY });
    },
    onError: () => {
      toast.error(t('update_devices_error'));
    },
  });
};
