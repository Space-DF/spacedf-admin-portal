import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';

import apiClient from '@/lib/api-client';

import { TableDevice } from '@/types';

export async function updateDevice(
  url: string,
  { arg }: { arg: Partial<TableDevice> },
) {
  return apiClient.patch(url, {
    ...arg,
    network_server: arg.network_server?.id,
  });
}

export const useUpdateDevice = () => {
  const { deviceId } = useParams<{
    deviceId: string;
  }>();
  const t = useTranslations('device-detail');
  return useSWRMutation(`/api/devices/${deviceId}`, updateDevice, {
    onSuccess: () => {
      toast.success(t('update_device_success'));
    },
    onError: () => {
      toast.error(t('update_device_error'));
    },
  });
};
