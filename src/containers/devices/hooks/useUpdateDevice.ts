import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';

import apiClient from '@/lib/api-client';

import { TableDevice } from '@/types';

export const useUpdateDevice = () => {
  const t = useTranslations('organization');
  return useSWRMutation(
    `/api/devices`,
    (url, { arg }: { arg: Partial<TableDevice> }) => {
      return apiClient.patch(`${url}/${arg.id}`, arg);
    },
    {
      onSuccess: () => {
        toast.success(t('update_devices_success'));
      },
      onError: () => {
        toast.error(t('update_devices_error'));
      },
    },
  );
};
