import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';

import apiClient from '@/lib/api-client';

export const useDeleteDevice = () => {
  const t = useTranslations('organization');
  return useSWRMutation(
    `/api/devices`,
    (url: string, { arg }: { arg: { id: string } }) =>
      apiClient.delete(`${url}/${arg.id}`),
    {
      onSuccess: () => {
        toast.success(t('delete_device_success'));
      },
      onError: () => {
        toast.error(t('delete_device_error'));
      },
    },
  );
};
