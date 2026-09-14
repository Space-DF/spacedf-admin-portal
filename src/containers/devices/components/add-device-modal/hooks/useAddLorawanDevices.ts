import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { useAddDeviceModalStore } from '@/containers/devices/components/add-device-modal/store';
import { AddDeviceErrorResponse } from '@/containers/devices/components/add-device-modal/types';
import { EUIDevice } from '@/containers/devices/components/add-device-modal/validator';
import { useAddDevice } from '@/containers/devices/hooks/useAddDevices';

import { ApiResponse, LorawanDeviceCredentials } from '@/types';

export const useAddLorawanDevices = (form: UseFormReturn<EUIDevice>) => {
  const t = useTranslations('organization');
  const networkServer = useAddDeviceModalStore((state) => state.networkServer);
  const {
    mutateAsync: createDevice,
    isPending: isCreating,
    data: addDeviceResponse,
  } = useAddDevice();

  const { setError, trigger, getValues, reset } = form;

  const submit = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid || !networkServer) return false;

    const data = getValues('eui').map(
      ({ device_model, is_published, ...lorawanDevice }) => ({
        device_model,
        network_server: networkServer.id,
        is_published,
        lorawan_device: {
          ...lorawanDevice,
          dev_eui: lorawanDevice.dev_eui.replace(/\s+/g, ''),
          join_eui: lorawanDevice.join_eui.replace(/\s+/g, ''),
        },
      }),
    );

    try {
      await createDevice(data);
      reset({ eui: [] });
      return true;
    } catch (error) {
      const errorResponse = (error as ApiResponse<AddDeviceErrorResponse[]>)
        .response?.response;
      errorResponse?.forEach(({ lorawan_device }, index) => {
        Object.entries(lorawan_device ?? {}).forEach(([key, messages]) => {
          setError(`eui.${index}.${key as keyof LorawanDeviceCredentials}`, {
            message: messages?.[0],
          });
        });
      });
      toast.error(t('add_devices_error'));
      return false;
    }
  }, [trigger, networkServer, getValues, createDevice, reset, setError, t]);

  return { submit, isCreating, addDeviceResponse };
};
